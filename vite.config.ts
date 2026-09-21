// Il cablaggio del server di sviluppo, e **il confine verso l'AI engine**.
//
// L'AI engine vero sta dietro una porta sola, `/ai-engine`, servita da qui — cioè da Node,
// non dal browser. Tre ragioni, e nessuna è comodità:
//
//   - **la chiave non entra mai nel browser.** Se la chiamata partisse dalla pagina, la
//     chiave sarebbe nel sorgente servito, e «resta sulla macchina» diventerebbe una
//     frase scritta in un documento e smentita dal codice;
//   - **quello che esce passa da un punto solo.** `docs/04-motore §4` dice che niente
//     esce senza che si veda: se il punto è uno, si può guardare. Se sono dieci, no;
//   - **il contratto si valida di qua.** Quello che torna al motore è già stato
//     controllato: o sono mosse che esistono, o è niente.
//
// **Cosa è cambiato il 17 settembre 2026.** Prima questa porta faceva una domanda e
// riceveva una risposta: una riga da dire, e al massimo una nota da segnarsi. L'AI engine
// non poteva *toccare* niente — c'era un cervello piccolo davanti a lui che muoveva
// l'interfaccia, e lui pensava e basta.
//
// Adesso il cervello piccolo non c'è più, e questa porta porta **le API**: gli
// strumenti di `src/ai-engine/strumenti.ts`, dichiarati al modello con le loro istruzioni.
// Un passo per chiamata — lui chiede delle mosse, il browser le esegue sul motore e
// gli riporta cosa ha visto, e si ricomincia — perché lo stato è nel browser e non ha
// senso farlo viaggiare due volte per ogni mossa.

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import Anthropic from '@anthropic-ai/sdk';
import {
  MOSSE_PRINCIPALI,
  MOSSE_SECONDARIE,
  arnesiPer,
  istruzioni,
  type Argomento,
  type Strumento,
} from './src/ai-engine/strumenti.ts';
import { leggiProfilo } from './src/conoscenza/profilo.ts';

const UTENTE_PRINCIPALE = 'user_123';

/** Da argomento nostro a schema suo. Un genere per volta, e sono tre. */
function comeSchema(a: Argomento): Record<string, unknown> {
  if (a.genere === 'numero') return { type: 'number', description: a.cosa };
  if (a.genere === 'elenco') return { type: 'array', items: { type: 'string' }, description: a.cosa };
  return a.fra
    ? { type: 'string', enum: [...a.fra], description: a.cosa }
    : { type: 'string', description: a.cosa };
}

/**
 * Gli strumenti, dichiarati. Si generano dal vocabolario e non si scrivono a mano: una
 * mossa che si aggiunge arriva al modello da sé, e non esiste il momento in cui il
 * codice sa fare una cosa che il modello non sa di poter chiedere.
 */
function arnesi(strumenti: readonly Strumento[]) {
  return strumenti.map((s) => ({
    name: s.nome,
    description: s.quando,
    input_schema: {
      type: 'object' as const,
      properties: Object.fromEntries((s.argomenti ?? []).map((a) => [a.nome, comeSchema(a)])),
      required: (s.argomenti ?? []).filter((a) => a.obbligatorio).map((a) => a.nome),
      additionalProperties: false,
    },
  }));
}

/**
 * Due liste, dichiarate una volta all'avvio. Il principale non riceve `riporta`, e un
 * secondario riceve **tre** mosse invece di trentotto — perché il permesso non è una
 * cosa che si controlla dopo, è una cosa che si dichiara prima (docs/04-motore §2).
 */
const ARNESI = {
  principale: arnesi(arnesiPer(MOSSE_PRINCIPALI)),
  secondario: arnesi(arnesiPer(MOSSE_SECONDARIE)),
} as const;

/**
 * Chi entra se il browser non dice chi è. Sta in `Archivio/impostazioni.txt`, l'unico
 * file dell'archivio che non appartiene a nessuno.
 *
 * Serve anche di qua e non solo di là: un secondario che parte prima che il profilo sia
 * arrivato manderebbe un `profilo` vuoto, e senza questo l'AI engine resterebbe senza
 * carattere proprio nel primo turno — quello che si nota.
 */
function ilPredefinito(): string {
  return UTENTE_PRINCIPALE;
}

/**
 * Il personaggio, letto **di qua**. Il browser manda solo il *nome* del profilo, e il
 * file lo legge il server: se il copione arrivasse dalla pagina, il `system` del modello
 * verrebbe dal client — che è esattamente la forma che non vogliamo (`docs/04-motore §3`).
 *
 * Il nome passa da un setaccio prima di diventare un percorso: solo lettere, numeri e
 * trattini. Un profilo scegle un file, non una cartella qualsiasi.
 *
 * Si rilegge a ogni richiesta, e va bene: il file cambia solo quando lo tocchi tu, quindi
 * il prompt resta identico byte per byte e la cache tiene. Il vantaggio è che per provare
 * un carattere basta salvare e ricaricare, senza riavviare niente.
 */
function ilPrompt(nome?: string): string {
  void nome;
  const cartellaUtente = join(RADICE, ilPredefinito());
  const preferenze = join(cartellaUtente, 'preferences.txt');
  const sistema = join(cartellaUtente, 'system.txt');
  const memoria = tuttiIFile(join(cartellaUtente, 'memory'));
  const servizi = tuttiIFile(join(RADICE, UTENTE_PRINCIPALE, 'services'));
  const contesto = [
    existsSync(sistema) ? `Stato del sistema:\n${readFileSync(sistema, 'utf8').trim()}` : '',
    ...Object.entries(memoria).map(([file, testo]) => `Memoria ${file}:\n${testo.trim()}`),
    ...Object.entries(servizi).map(([file, testo]) => `Servizio ${file}:\n${testo.trim()}`),
  ].filter(Boolean).join('\n\n');
  try {
    const testoPreferenze = readFileSync(preferenze, 'utf8');
    const testoSistema = existsSync(sistema) ? readFileSync(sistema, 'utf8') : '';
    const p = leggiProfilo(`${testoPreferenze}\n${testoSistema}`);
    return `${istruzioni(p.assistente)}${contesto ? `\n\nDocumenti di contesto dell'utente:\n${contesto}` : ''}`;
  } catch {
    // Senza profilo il sistema non è muto: è senza carattere, e lo si vede.
    console.warn(`[ai-engine] non ho letto ${preferenze}: vado senza personaggio`);
    return `${istruzioni()}${contesto ? `\n\nDocumenti di contesto dell'utente:\n${contesto}` : ''}`;
  }
}

/**
 * ─── Chi risponde dietro la porta ──────────────────────────────
 *
 * Due strade, e si sceglie da sé guardando quale chiave c’è. Non c’è un
 * interruttore da ricordarsi: si mette una chiave in `.env` e quella decide.
 *
 *   OPENROUTER_API_KEY   passa da OpenRouter, che espone la stessa Messages API
 *                        di Anthropic su `https://openrouter.ai/api`. Cambia la
 *                        base, cambia il modo di autenticarsi — `Bearer` invece
 *                        di `x-api-key` -- e il modello prende un prefisso.
 *   ANTHROPIC_API_KEY    va diretto, com’è sempre stato.
 *
 * Se ci sono tutte e due vince OpenRouter, perché è quella che si mette apposta.
 * E qualunque sia, **si scrive in console alla prima richiesta**: una porta che
 * cambia interlocutore in silenzio è una porta che mente.
 *
 * **Cosa non attraversa OpenRouter.** La cache sì — `cache_control` con il suo
 * `ttl` viene passato al provider, ed è la cosa che conta, perché il prefisso di
 * questa porta è undicimila token. Non passano invece i due parametri più nuovi:
 * il ripiego lato server (`fallbacks`) e `output_config.effort`. Su OpenRouter si
 * spengono, e la conseguenza va detta: **senza `fallbacks`, un rifiuto di policy
 * torna come zero mosse e il sistema tace.** Su un sistema a voce il silenzio è
 * indistinguibile da un’app rotta, ed è la ragione per cui quel parametro era
 * stato messo. Il ripiego sul finto nel browser resta, e copre il caso peggiore.
 */
interface Fornitore {
  readonly nome: 'openrouter';
  /** C’è solo per il dialetto `messages`: l’altro va di `fetch`, e va bene così. */
  readonly client?: Anthropic;
  readonly chiave: string;
  readonly modello: string;
  /**
   * **Che lingua si parla.** Non è un dettaglio di trasporto: sono due forme diverse
   * della stessa conversazione, e la differenza è dove stanno gli strumenti e come
   * torna indietro una chiamata.
   *
   *   messages   la Messages API di Anthropic. Strumenti con `input_schema`, blocchi
   *              `tool_use` e `tool_result`, e la **cache del prefisso**.
   *   chat       `chat/completions`, la forma di OpenAI. Strumenti dentro `function`,
   *              `tool_calls` con gli argomenti **come stringa** da riaprire, e niente
   *              cache: undicimila token di prefisso ripartono a ogni passo.
   *
   * Su OpenRouter lo decide il modello: la porta in forma Anthropic è garantita solo
   * per i modelli `anthropic/`. Tutti gli altri passano di là.
   */
  readonly dialetto: 'messages' | 'chat';
  /** Se accetta i parametri che esistono solo da Anthropic. */
  readonly nativo: boolean;
}

/**
 * Quale modello, su OpenRouter. Si cambia in `.env` con `OPENROUTER_MODEL` e non si
 * tocca il codice: provare un modello è una riga, e deve restare una riga.
 */
const MODELLO_PREDEFINITO = 'anthropic/claude-opus-5';

/**
 * La chiave sta in **`.env`**, e in nessun file dentro il progetto che non sia
 * quello.
 *
 * Il perché è un guasto vero, provato tre volte il 17 settembre 2026 — e le
 * prime due volte l'ho sbagliato io:
 *
 *   - `ambiente/chiave.txt` è **scaricabile**: quella cartella è il `publicDir`,
 *     quindi un file lì lo serve il dev server (`GET /chiave.txt` → 200) e
 *     finisce in `dist/`;
 *   - `chiave.txt` nella **radice** è scaricabile allo stesso modo: in sviluppo
 *     Vite serve i file sotto la cartella di progetto;
 *   - un file **fuori** dal progetto si raggiunge con `/@fs/…` → 200;
 *   - `.env` invece è **403**: Vite lo nega da sé, e per questo è il solo posto
 *     giusto.
 *
 * `fs.deny` più sotto blocca anche gli altri nomi, per chi arriva con l’abitudine.
 *
 * Si legge a mano e non con `loadEnv`: quello espone al client solo ciò che
 * comincia con VITE_, e una chiave che arriva al client non è più una chiave.
 */
function leggiChiave(nome: string): string | undefined {
  const riga = existsSync('.env')
    ? (readFileSync('.env', 'utf8').match(new RegExp('^\\s*' + nome + '\\s*=\\s*(.+)$', 'm'))?.[1] ?? '')
        .trim()
        .replace(/^["']|["']$/g, '')
    : '';
  return riga || process.env[nome] || undefined;
}

/** Detto una volta sola, o ogni frase stamperebbe la stessa riga. */
let annunciato = false;

function fornitore(): Fornitore | undefined {
  for (const sbagliato of ['pubblico/chiave.txt', 'chiave.txt']) {
    if (existsSync(sbagliato)) {
      console.error(
        `[ai-engine] ATTENZIONE: ${sbagliato} è raggiungibile dal browser. ` +
          'La chiave va in .env. ' +
          'Se lì dentro c’è una chiave vera, considerala compromessa: revocala.',
      );
    }
  }

  const viaOpenRouter = leggiChiave('OPENROUTER_API_KEY');
  const modello = leggiChiave('OPENROUTER_MODEL') ?? MODELLO_PREDEFINITO;

  const scelto: Fornitore | undefined = viaOpenRouter
    ? {
        nome: 'openrouter',
        // Il client Anthropic si costruisce **solo** se serve: per un modello che non
        // è di Anthropic non parlerebbe la lingua giusta, e averlo lì spento sarebbe
        // un invito a usarlo per sbaglio.
        //
        // `apiKey: null` è necessario, non difensivo: `apiKey` ha la precedenza su
        // `authToken`, e senza il null l'SDK pescherebbe ANTHROPIC_API_KEY
        // dall'ambiente e manderebbe a OpenRouter la chiave sbagliata, sull'header
        // sbagliato.
        ...(modello.startsWith('anthropic/')
          ? {
              client: new Anthropic({
                apiKey: null,
                authToken: viaOpenRouter,
                baseURL: 'https://openrouter.ai/api',
              }),
              dialetto: 'messages' as const,
            }
          : { dialetto: 'chat' as const }),
        chiave: viaOpenRouter,
        modello,
        nativo: false,
      }
    : undefined;

  if (scelto && !annunciato) {
    annunciato = true;
    console.info(
      `[ai-engine] risponde ${scelto.nome} · ${scelto.modello}` +
        (scelto.dialetto === 'chat' ? ' · dialetto chat/completions, senza cache del prefisso' : '') +
        (scelto.nativo ? '' : ' · senza ripiego sui rifiuti e senza effort'),
    );
  }
  return scelto;
}

/**
 * Quanto vive il prefisso in cache. Cinque minuti è il valore di casa, e su una sessione
 * di lavoro non basta: fra una frase e l'altra passa spesso più di così, e ogni volta si
 * ripagherebbe l'intero prompt. Un'ora copre una sessione vera.
 */
const TTL = '1h' as const;

/** Quello che è già stato fatto in questo turno, come lo manda il browser. */
/** Un giro di botta e risposta già avvenuto, come lo manda il browser. */
interface Giro {
  readonly tua: string;
  readonly risposta?: string;
}

interface Passato {
  readonly nome: string;
  readonly argomenti: Record<string, unknown>;
  readonly visto: string;
  readonly sbagliata: boolean;
}

/**
 * Il turno, rimesso in piedi come una conversazione. Il modello non tiene niente fra
 * una chiamata e l'altra: quello che sa del turno è questo, e lo rimandiamo intero
 * ogni volta. Un passo non è una sessione, ed è per questo che il server resta muto.
 */
function messaggi(frase: string, passato: readonly Passato[], prima: readonly Giro[]) {
  const righe: Array<{ role: 'user' | 'assistant'; content: unknown }> = [];
  // Quello che si erano già detti, prima di questa frase. Va **davanti** e nell'ordine
  // in cui è successo: è la parte che cresce durante la giornata, e sta dopo il prefisso
  // cacheato — quindi crescere non costa il prompt intero (docs/04-motore §4).
  for (const g of prima) {
    if (g.tua) righe.push({ role: 'user', content: g.tua });
    if (g.risposta) righe.push({ role: 'assistant', content: g.risposta });
  }
  righe.push({ role: 'user', content: `Ha detto: ${frase}` });
  for (const [i, p] of passato.entries()) {
    const id = `m${i}`;
    righe.push({
      role: 'assistant',
      content: [{ type: 'tool_use', id, name: p.nome, input: p.argomenti }],
    });
    righe.push({
      role: 'user',
      content: [
        { type: 'tool_result', tool_use_id: id, content: p.visto, is_error: p.sbagliata },
      ],
    });
  }
  return righe;
}

/**
 * Lo stesso turno, nella forma di `chat/completions`. Non è una traduzione di
 * `messaggi()`: è scritto a parte apposta, perché una conversione fra due forme che
 * si somigliano è il posto dove si nascondono gli errori difficili.
 *
 * Tre differenze che contano, e sono tutte trappole:
 *
 *   - **il sistema è un messaggio**, il primo, non un campo a parte;
 *   - **gli argomenti di una chiamata sono una stringa**, non un oggetto. Si serializzano
 *     qui e si riaprono dall’altra parte;
 *   - **non esiste `is_error`.** Una mossa sbagliata torna come testo, e se non si dice
 *     che era sbagliata il modello la legge come se fosse andata bene, e va avanti su
 *     una cosa che non è successa.
 */
function messaggiChat(
  sistema: string,
  frase: string,
  passato: readonly Passato[],
  prima: readonly Giro[],
): unknown[] {
  const righe: unknown[] = [{ role: 'system', content: sistema }];
  for (const g of prima) {
    if (g.tua) righe.push({ role: 'user', content: g.tua });
    if (g.risposta) righe.push({ role: 'assistant', content: g.risposta });
  }
  righe.push({ role: 'user', content: `Ha detto: ${frase}` });
  for (const [i, p] of passato.entries()) {
    const id = `m${i}`;
    righe.push({
      role: 'assistant',
      content: null,
      tool_calls: [
        { id, type: 'function', function: { name: p.nome, arguments: JSON.stringify(p.argomenti) } },
      ],
    });
    righe.push({
      role: 'tool',
      tool_call_id: id,
      content: p.sbagliata ? `NON È ANDATA: ${p.visto}` : p.visto,
    });
  }
  return righe;
}

/** Gli stessi arnesi, dentro `function`. La forma cambia, i nomi e gli schemi no. */
function arnesiChat(lista: ReturnType<typeof arnesi>): unknown[] {
  return lista.map((a) => ({
    type: 'function',
    function: { name: a.name, description: a.description, parameters: a.input_schema },
  }));
}

/**
 * Gli argomenti di una chiamata arrivano come stringa, e un modello può scriverla
 * rotta. Se succede la mossa si butta invece di far cadere il turno intero: una mossa
 * persa è un passo sprecato, un turno caduto è il sistema che tace.
 */
function apri(testo: string): Record<string, unknown> | undefined {
  try {
    const v: unknown = JSON.parse(testo || '{}');
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  } catch {
    return undefined;
  }
}

/** Quello che torna al browser, uguale da tutti e due i dialetti. */
interface Esito {
  readonly chiamate: Array<{ nome: string; argomenti: Record<string, unknown> }>;
  readonly detto: string;
  readonly perche?: string;
  readonly modello: string;
  readonly conto: { nuovi: number; cache: number; scritti: number; fuori: number };
}

/**
 * Il giro via `chat/completions`. Va di `fetch` e non dell’SDK, perché l’SDK di
 * Anthropic parla un’altra lingua e piegarlo a questa sarebbe peggio che non usarlo.
 */
async function viaChat(
  f: Fornitore,
  sistema: string,
  arnesi: unknown[],
  frase: string,
  passato: readonly Passato[],
  prima: readonly Giro[],
): Promise<Esito> {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${f.chiave}`,
      'content-type': 'application/json',
      // Serve solo a ritrovarsi nel cruscotto di OpenRouter: quale cosa ha speso cosa.
      'x-title': 'OneAssist',
    },
    body: JSON.stringify({
      model: f.modello,
      max_tokens: 4000,
      messages: messaggiChat(sistema, frase, passato, prima),
      tools: arnesi,
      // Una risposta parlata è corta e arriva presto: qui la profondità non serve, la
      // prontezza sì. È l’equivalente di `effort` dall’altra parte.
      reasoning: { effort: 'low' },
    }),
  });

  const dati = (await r.json()) as {
    error?: { message?: string };
    model?: string;
    choices?: Array<{
      finish_reason?: string;
      message?: {
        content?: string | null;
        tool_calls?: Array<{ function: { name: string; arguments: string } }>;
      };
    }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } };
  };

  // OpenRouter sa rispondere **200 con dentro un errore**: se non si guarda, il turno
  // prosegue con zero mosse e sembra che il modello non abbia avuto niente da dire.
  if (!r.ok || dati.error) throw new Error(dati.error?.message ?? `${r.status}`);

  const scelta = dati.choices?.[0];
  const chiamate: Esito['chiamate'] = [];
  for (const c of scelta?.message?.tool_calls ?? []) {
    const argomenti = apri(c.function.arguments);
    if (!argomenti) {
      console.warn(`[ai-engine] argomenti illeggibili per ${c.function.name}: la mossa si butta`);
      continue;
    }
    chiamate.push({ nome: c.function.name, argomenti });
  }

  return {
    chiamate,
    detto: (scelta?.message?.content ?? '').trim(),
    perche:
      scelta?.finish_reason === 'length'
        ? 'troppo lungo'
        : scelta?.finish_reason === 'content_filter'
          ? 'rifiuto'
          : undefined,
    modello: dati.model ?? f.modello,
    conto: {
      nuovi: dati.usage?.prompt_tokens ?? 0,
      cache: dati.usage?.prompt_tokens_details?.cached_tokens ?? 0,
      scritti: 0,
      fuori: dati.usage?.completion_tokens ?? 0,
    },
  };
}

function aiEngine(): Plugin {
  return {
    name: 'oneassist-ai-engine',
    configureServer(server) {
      server.middlewares.use('/ai-engine', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end();
        }
        const f = fornitore();
        if (!f) {
          // Niente chiave: si dice, non si finge. Il prototipo ricade sul finto.
          res.statusCode = 503;
          res.setHeader('content-type', 'application/json');
          return res.end(JSON.stringify({ perche: 'manca la chiave' }));
        }

        let corpo = '';
        req.on('data', (c) => (corpo += c));
        req.on('end', () => {
          void (async () => {
            try {
              const { frase, passato, prima, profilo, chi } = JSON.parse(corpo) as {
                frase?: string;
                passato?: readonly Passato[];
                prima?: readonly Giro[];
                profilo?: string;
                chi?: 'principale' | 'secondario';
              };
              // Una frase che non c’è non è un guasto dell’AI engine: è una domanda
              // malfatta, e si dice con un 400. Un 502 manderebbe chi guarda a cercare
              // il guasto dalla parte sbagliata — è successo, il 17 settembre 2026.
              if (!frase?.trim()) {
                res.statusCode = 400;
                res.setHeader('content-type', 'application/json');
                return res.end(JSON.stringify({ perche: 'manca la frase' }));
              }
              const sistema = ilPrompt(profilo);
              // Le due liste sono gia pronte dall'avvio: un arnese che si rigenera a ogni
              // richiesta e un prefisso che cambia, e un prefisso che cambia non si cachea.
              const arnesiOra = ARNESI[chi === 'secondario' ? 'secondario' : 'principale'];

              const esito: Esito =
                f.dialetto === 'chat'
                  ? await viaChat(f, sistema, arnesiChat(arnesiOra), frase, passato ?? [], prima ?? [])
                  : await (async () => {
                      const risposta = await f.client!.beta.messages.create({
                        model: f.modello,
                        max_tokens: 4000,
                        // Il prefisso cacheato: **gli strumenti e il sistema**, in
                        // quest’ordine, perché è l’ordine in cui il modello li rende. Il
                        // segno va sull’ultimo blocco del sistema, e copre tutto quello
                        // che sta prima. Passa anche da OpenRouter, sui modelli Anthropic:
                        // è il pezzo che non si poteva perdere.
                        //
                        // Se `cache_read_input_tokens` resta zero a richieste ripetute,
                        // qualcosa qui dentro sta cambiando da sé: si guarda il prompt,
                        // non la cache.
                        system: [{ type: 'text', text: sistema, cache_control: { type: 'ephemeral', ttl: TTL } }],
                        tools: arnesiOra as never,
                        messages: messaggi(frase, passato ?? [], prima ?? []) as never,
                        // ─── solo da Anthropic ───────────────────────────
                        ...(f.nativo
                          ? {
                              // **Il ripiego lato server.** Su un rifiuto di policy la
                              // richiesta si rigioca da sé su un altro modello, dentro la
                              // stessa chiamata: senza, un rifiuto torna come zero mosse e
                              // il sistema **tace**. Su un sistema a voce il silenzio è
                              // indistinguibile da un’app rotta.
                              betas: ['server-side-fallback-2026-07-01'],
                              fallbacks: 'default',
                              // Una risposta parlata è corta e arriva presto: qui la
                              // profondità non serve, la prontezza sì. Il pensiero resta
                              // acceso — spegnerlo su questo modello si paga altrove.
                              output_config: { effort: 'low' },
                            }
                          : {}),
                      } as never);
                      const u = risposta.usage as typeof risposta.usage & {
                        cache_read_input_tokens?: number;
                        cache_creation_input_tokens?: number;
                      };
                      return {
                        chiamate: risposta.content
                          .filter((x): x is Extract<typeof x, { type: 'tool_use' }> => x.type === 'tool_use')
                          .map((x) => ({ nome: x.name, argomenti: x.input as Record<string, unknown> })),
                        /**
                         * **Il testo, che prima si buttava.** Il modello può rispondere a
                         * parole invece di chiamare `parla` — succede, ed è ragionevole che
                         * succeda. Qui si tiene, e il browser lo trasforma in una riga detta
                         * (src/ai-engine/ai-engine.ts). Buttarlo voleva dire: l’AI engine ha
                         * risposto, e tu non hai sentito niente.
                         */
                        detto: risposta.content
                          .filter((x): x is Extract<typeof x, { type: 'text' }> => x.type === 'text')
                          .map((x) => x.text.trim())
                          .filter(Boolean)
                          .join(' '),
                        /**
                         * **Perché si è fermato.** `stop_reason` non si guardava mai, e due
                         * valori su cinque producevano silenzio: `refusal`, quando i
                         * classificatori declinano, e `max_tokens`, quando la risposta è
                         * tagliata a metà. Adesso tornano al browser come una ragione, e una
                         * ragione si può dire.
                         */
                        perche:
                          risposta.stop_reason === 'refusal'
                            ? 'rifiuto'
                            : risposta.stop_reason === 'max_tokens'
                              ? 'troppo lungo'
                              : undefined,
                        modello: risposta.model,
                        conto: {
                          nuovi: u.input_tokens,
                          cache: u.cache_read_input_tokens ?? 0,
                          scritti: u.cache_creation_input_tokens ?? 0,
                          fuori: u.output_tokens,
                        },
                      } satisfies Esito;
                    })();

              const { chiamate, detto, perche } = esito;
              // La cache si guarda da qui, e si guarda sempre: `letti` a zero dopo la
              // prima richiesta vuol dire che il prefisso non è stabile, e sono soldi.
              // Sul dialetto `chat` resta zero per costruzione, e non è un guasto.
              console.info(
                `[${chi === 'secondario' ? 'secondario' : 'ai-engine'}] «${frase}» passo ${(passato?.length ?? 0) + 1} · ` +
                  `${esito.conto.nuovi} nuovi, ${esito.conto.cache} letti dalla cache, ` +
                  `${esito.conto.scritti} scritti · ${esito.conto.fuori} fuori · ` +
                  (chiamate.length ? chiamate.map((c) => c.nome).join(', ') : detto ? 'solo parole' : 'niente') +
                  (perche ? ` · fermato: ${perche}` : '') +
                  (esito.modello !== f.modello ? ` · ha risposto ${esito.modello}` : ''),
              );
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ chiamate, detto, perche }));
            } catch (e) {
              console.warn('[ai-engine]', e instanceof Error ? e.message : e);
              res.statusCode = 502;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ perche: 'AI engine non ha risposto' }));
            }
          })();
        });
      });
    },
  };
}

/**
 * ─── La porta dell’archivio ───────────────────────────────────────
 *
 * **Il repo è il codice; `Archivio/` sono i dati.** Oggi stanno nella stessa cartella
 * e domani no — e questa porta è esattamente la cucitura fra i due. Il giorno che
 * l’archivio se ne va su un’altra macchina, in un bucket o dentro Electron, cambia
 * `RADICE` e cambia niente altro: di sopra nessuno sa dove stiano i file, e non lo deve
 * sapere.
 *
 * Tutto quello che è di una persona sta sotto la **sua** cartella, e il nome della
 * cartella è il suo id:
 *
 *     Archivio/
 *       system-settings.txt
 *       users/<id>/
 *         preferences.txt             profilo e preferenze dell'utente
 *         system.txt                  stato simulato della macchina
 *         memory/                     documenti di contesto della memoria
 *         services/                   documenti di contesto dei servizi
 *         filesystem/                 file visibili al servizio filesystem
 *
 * **Perché non è il `publicDir`**, che sarebbe stato più comodo: perché lì dentro c’è
 * `memory/`, e una cartella servita dalla radice del sito la scarica chiunque apra la
 * pagina. È lo stesso errore della chiave, provato tre volte il 17 settembre 2026. Il
 * `publicDir` adesso è `pubblico/`, dove sta solo quello che l’app spedisce: i binari
 * della voce, i campanelli, il volto di riserva. Nessun dato di nessuno.
 *
 * La porta è volutamente stupida — legge file, scrive un file, e non sa niente di
 * profili né di archivi. Una cucitura sottile è una cucitura che regge allo strappo.
 */
const ARCHIVIO = resolve('Archivio');
const RADICE = join(ARCHIVIO, 'users');

/** I tipi che questa porta sa servire. Quello che non è qui non esce. */
const TIPI: Record<string, string> = {
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
};

/**
 * Da percorso chiesto dal browser a percorso su disco, o `undefined`.
 *
 * Il setaccio è lo stesso del profilo, e per la stessa ragione: un nome che arriva
 * dalla pagina sceglie un file, **non una cartella qualsiasi**. Qui però si scrive
 * anche, quindi i controlli sono due e non uno: ogni pezzo dev’essere fatto di
 * lettere, numeri, punto e trattino — il che esclude già `..` — e il risultato deve
 * comunque cadere dentro `Archivio/`. Il secondo è ridondante rispetto al primo, e
 * resta: una svista nella regex non deve bastare a leggere il resto del disco.
 */
function dentroLArchivio(percorso: string): string | undefined {
  const pezzi = percorso.split('/').filter(Boolean);
  if (
    !pezzi.length ||
    pezzi[0] !== UTENTE_PRINCIPALE ||
    !pezzi.every((x) => /^[A-Za-z0-9._-]+$/.test(x))
  ) return undefined;
  const dove = resolve(RADICE, ...pezzi);
  return dove === RADICE || dove.startsWith(RADICE + sep) ? dove : undefined;
}

/** Tutti i file sotto una cartella, col percorso relativo che il browser conosce. */
function tuttiIFile(dove: string, prefisso = ''): Record<string, string> {
  const fuori: Record<string, string> = {};
  if (!existsSync(dove)) return fuori;
  for (const voce of readdirSync(dove, { withFileTypes: true })) {
    const relativo = prefisso ? `${prefisso}/${voce.name}` : voce.name;
    if (voce.isDirectory()) Object.assign(fuori, tuttiIFile(join(dove, voce.name), relativo));
    else if (voce.name.endsWith('.md') || voce.name.endsWith('.txt')) {
      fuori[relativo] = readFileSync(join(dove, voce.name), 'utf8');
    }
  }
  return fuori;
}

function chatRaw(): Plugin {
  return {
    name: 'oneassist-chat-raw',
    configureServer(server) {
      server.middlewares.use('/chat-raw', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end();
        }

        let corpo = '';
        req.on('data', (pezzo) => (corpo += pezzo));
        req.on('end', () => {
          try {
            const messaggio = JSON.parse(corpo) as {
              timestamp?: string;
              role?: string;
              text?: string;
            };
            const istante = new Date(messaggio.timestamp ?? '');
            if (
              Number.isNaN(istante.getTime()) ||
              !['user', 'assistant'].includes(messaggio.role ?? '') ||
              typeof messaggio.text !== 'string'
            ) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ perche: 'messaggio non valido' }));
            }

            const giorno = istante.toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
            const cartella = join(RADICE, UTENTE_PRINCIPALE, 'chat-raw');
            mkdirSync(cartella, { recursive: true });
            appendFileSync(
              join(cartella, `${giorno}.jsonl`),
              `${JSON.stringify({
                timestamp: istante.toISOString(),
                role: messaggio.role,
                text: messaggio.text,
              })}\n`,
              'utf8',
            );
            res.statusCode = 204;
            res.end();
          } catch (errore) {
            console.error('[chat-raw]', errore instanceof Error ? errore.message : errore);
            res.statusCode = 500;
            res.end(JSON.stringify({ perche: 'chat raw non salvata' }));
          }
        });
      });
    },
  };
}

function archivio(): Plugin {
  return {
    name: 'oneassist-archivio',
    configureServer(server) {
      server.middlewares.use('/archivio', (req, res) => {
        const chiesto = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
        const dove = dentroLArchivio(chiesto);

        if (!dove) {
          // Un percorso rifiutato si urla: o è un errore nostro, o è qualcuno che sta
          // provando a uscire dalla cartella. Nei due casi si vuole saperlo.
          console.warn(`[archivio] rifiutato: ${chiesto}`);
          res.statusCode = 400;
          res.setHeader('content-type', 'application/json');
          return res.end(JSON.stringify({ perche: 'percorso non valido' }));
        }

        // ─── scrivere: solo dentro la memoria di qualcuno ─────────────────
        //
        // Non c’è un verbo per cancellare, e non ci deve essere: l’archivio non cancella
        // niente — una riga smentita resta (`docs/05-archivio §5`) — e una porta che non
        // sa cancellare non può cancellare la cosa sbagliata.
        if (req.method === 'POST') {
          const pezzi = chiesto.split('/').filter(Boolean);
          if (pezzi[1] !== 'memory' || pezzi.length !== 2) {
            res.statusCode = 403;
            res.setHeader('content-type', 'application/json');
            return res.end(JSON.stringify({ perche: 'di qua si scrive solo nella memoria' }));
          }
          let corpo = '';
          req.on('data', (c) => (corpo += c));
          req.on('end', () => {
            try {
              const { percorso, testo } = JSON.parse(corpo) as { percorso?: string; testo?: string };
              const file = percorso ? dentroLArchivio(`${chiesto}/${percorso}`) : undefined;
              if (!file || !file.endsWith('.md') || typeof testo !== 'string') {
                console.warn(`[archivio] scrittura rifiutata: ${percorso}`);
                res.statusCode = 400;
                res.setHeader('content-type', 'application/json');
                return res.end(JSON.stringify({ perche: 'percorso non valido' }));
              }
              mkdirSync(dirname(file), { recursive: true });
              writeFileSync(file, testo, 'utf8');
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ scritto: percorso }));
            } catch (e) {
              console.error('[archivio]', e instanceof Error ? e.message : e);
              res.statusCode = 500;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ perche: 'non ho scritto' }));
            }
          });
          return;
        }

        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('content-type', 'application/json');
          return res.end(JSON.stringify({ perche: 'di qua si legge e si scrive, e basta' }));
        }

        // ─── la memoria si legge tutta in una volta ─────────────────────
        //
        // L’archivio di una persona è qualche decina di file di poche righe, e di sopra
        // `Archivio` si rilegge dentro il proprio costruttore: una richiesta sola
        // all’avvio costa meno di cento, e arriva prima che serva.
        if (chiesto.split('/').filter(Boolean)[1] === 'memory' && !extname(dove)) {
          const file = tuttiIFile(dove);
          console.info(`[archivio] ${Object.keys(file).length} file di memoria da ${chiesto}`);
          res.setHeader('content-type', 'application/json');
          return res.end(JSON.stringify({ file }));
        }

        // ─── tutto il resto è un file ───────────────────────────────
        const tipo = TIPI[extname(dove).toLowerCase()];
        if (!tipo || !existsSync(dove) || !statSync(dove).isFile()) {
          res.statusCode = 404;
          res.setHeader('content-type', 'application/json');
          return res.end(JSON.stringify({ perche: 'non c\u2019è' }));
        }
        res.setHeader('content-type', tipo);
        // La roba di una persona non si mette in cache dai proxy: è sua.
        res.setHeader('cache-control', 'no-cache, private');
        res.end(readFileSync(dove));
      });
    },
  };
}

/**
 * onnxruntime carica i suoi binari con un import dinamico, e Vite ci mette le mani:
 * aggiunge `?import` anche ai file serviti così e poi si strozza a trasformarli.
 * Qui gli si dice di servirli com'è: sono già moduli, non c'è niente da tradurre.
 */
function lasciaStareOrt(): Plugin {
  return {
    name: 'lascia-stare-ort',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith('/ort/') && req.url.includes('?')) {
          req.url = req.url.split('?')[0];
        }
        next();
      });
    },
  };
}

export default defineConfig({
  // Tutto quello che serve a far partire il sistema sta in una cartella sola, e quella
  // cartella è la radice del sito: le impostazioni, il volto, lo sfondo, i suoni, e i
  // binari della voce che ci arrivano da soli. Si clona il repo e parte — nessun
  // percorso di questa macchina, da nessuna parte (`ambiente/LEGGIMI.md`).
  publicDir: 'pubblico',
  // Quello che il dev server non deve servire mai, per nome. `.env*` Vite lo nega già
  // da sé; gli altri li aggiungiamo perché è il posto dove qualcuno metterà la chiave
  // per abitudine, e un 403 è meglio di una chiave scaricabile.
  // `Archivio/` non è sotto `publicDir`, quindi il dev server non la serve da sé: ci si
  // arriva **solo** dalla porta, che sa cosa può uscire. Il diniego esplicito è per
  // `/@fs/…`, che ci arriverebbe lo stesso e senza passare da nessun setaccio.
  server: {
    // `Archivio/**` da solo **non basta**, e l'ho verificato: i pattern senza `**/`
    // davanti Vite li confronta col nome del file, non col percorso, quindi
    // `/@fs/.../Archivio/users/user_123/preferences.txt` rispondeva 200. Con il glob sul
    // percorso intero risponde 403, che è l'unica risposta giusta: a quella cartella
    // ci si arriva dalla porta o non ci si arriva.
    //
    // Ma `**/Archivio/**` era troppo largo, e l'ho scoperto col sito bianco: Vite
    // confronta **senza distinguere maiuscole**, quindi quel glob negava anche
    // `src/archivio/archivio.ts` — il codice che apre l'archivio, non l'archivio.
    // Il percorso assoluto dalla radice nega quella cartella lì e nessun'altra.
    // Su Windows `resolve()` dà barre rovesce, che nel glob sarebbero fughe: si normalizza.
    fs: { deny: ['.env', '.env.*', 'chiave.txt', '*.pem', `${ARCHIVIO.split(sep).join('/')}/**`] },
  },
  // **Il target della build.** Di suo Vite compila per una linea di base del 2020, che
  // non conosce il `await` di primo livello — e `src/main.ts` ne ha due, perché prima di
  // costruire qualsiasi cosa bisogna sapere chi c'è e aprire la sua memoria. Senza
  // questa riga `npm run dev` funziona (il browser serve ESM nativo) e `npm run build`
  // no: il tipo di guasto che si scopre tardi e sempre dalla parte sbagliata.
  build: { target: 'esnext' },
  optimizeDeps: { exclude: ['onnxruntime-web'] },
  plugins: [lasciaStareOrt(), aiEngine(), archivio(), chatRaw()],
});
