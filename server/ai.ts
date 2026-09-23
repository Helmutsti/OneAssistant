// La porta verso l'AI: `POST /ai-engine`. Sta nel processo Node perché la chiave di
// Anthropic non entra mai nel browser (`docs/L04`), e perché quello che torna al browser
// passa da un punto solo.
//
// Un passo per chiamata: il browser manda il ruolo, la frase o la scheda del task, e le
// mosse già fatte nel turno; qui si chiede al modello cosa fare adesso, e si restituiscono
// le mosse. Anthropic è l'unico provider del prototipo (`docs/L04`). Se la chiave non c'è
// si risponde 503, e il browser lo dice a schermo: non esiste un ripiego finto (storico §7).

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import type { Connect } from 'vite';
import { istruzioni, strumentiPer, type Argomento, type Ruolo } from '../src/ai/vocabolario.ts';
import { leggiPreferenze } from '../src/conoscenza/profilo.ts';
import { CASA, documenti, elencoFile } from './archivio.ts';

const MODELLO_PREDEFINITO = 'claude-sonnet-5';
const TTL = '1h' as const;
/** Ogni passo è una mossa sola sullo schermo: poco da pensare, e conta la prontezza. */
const IMPEGNO = 'low' as const;

function comeSchema(a: Argomento): Record<string, unknown> {
  if (a.genere === 'numero') return { type: 'number', description: a.cosa };
  if (a.genere === 'si-no') return { type: 'boolean', description: a.cosa };
  if (a.genere === 'elenco') return { type: 'array', items: { type: 'string' }, description: a.cosa };
  return a.fra ? { type: 'string', enum: [...a.fra], description: a.cosa } : { type: 'string', description: a.cosa };
}

/** Gli strumenti, dichiarati dal vocabolario: il modello sa fare esattamente quello che il codice esegue. */
function arnesi(r: Ruolo) {
  return strumentiPer(r).map((s) => ({
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

const ARNESI = { conversazione: arnesi('conversazione'), lavoro: arnesi('lavoro') } as const;

/**
 * Il prompt: le istruzioni del ruolo, col personaggio di `preferences.txt`, e i documenti di
 * contesto dell'utente attivo — memoria simulata, servizi simulati, stato della macchina
 * (`docs/L02` §INPUT). La password non entra: è un dato locale e non raggiunge il provider
 * (`docs/L03`).
 */
function prompt(r: Ruolo): string {
  const leggi = (f: string) => (existsSync(join(CASA, f)) ? readFileSync(join(CASA, f), 'utf8').trim() : '');
  const p = leggiPreferenze(leggi('preferences.txt'));
  if (p.errori.length) console.warn(`[ai-engine] preferences.txt: ${p.errori.join('; ')}`);
  const profilo = [
    p.utente.name && `nome: ${p.utente.name}`,
    p.utente.datebirth && `nata/o il: ${p.utente.datebirth}`,
    p.utente.sex && `sesso: ${p.utente.sex}`,
    `lingua: ${p.utente.language}`,
    ...p.focuses.map((l) => `luogo conosciuto: ${l.nome} — ${l.indirizzo}`),
  ].filter(Boolean).join('\n');
  const contesto = [
    `Profilo dell'utente:\n${profilo}`,
    leggi('system.txt') && `Stato della macchina (system.txt):\n${leggi('system.txt')}`,
    ...Object.entries(documenti(join(CASA, 'memory'))).map(([f, t]) => `Memoria (memory/${f}):\n${t.trim()}`),
    ...Object.entries(documenti(join(CASA, 'services'))).map(([f, t]) => `Servizio (services/${f}):\n${t.trim()}`),
    leggi('filesystem.txt') && `Servizio filesystem (filesystem.txt):\n${leggi('filesystem.txt')}`,
    `File del servizio filesystem:\n${elencoFile(join(CASA, 'filesystem')).join('\n') || '(nessuno)'}`,
  ].filter(Boolean).join('\n\n');
  const personaggio = {
    nome: p.assistente.name,
    genere: p.assistente.gender,
    copione: p.assistente.copione,
    lingua: p.utente.language,
  };
  return `${istruzioni(r, personaggio)}\n\n# Documenti di contesto dell'utente\n\n${contesto}`;
}

function leggiChiave(nome: string): string | undefined {
  const riga = existsSync('.env')
    ? (readFileSync('.env', 'utf8').match(new RegExp('^\\s*' + nome + '\\s*=\\s*(.+)$', 'm'))?.[1] ?? '')
        .trim()
        .replace(/^["']|["']$/g, '')
    : '';
  return riga || process.env[nome] || undefined;
}

interface Fornitore {
  readonly modello: string;
  readonly client: Anthropic;
}

let attuale: Fornitore | undefined;

function fornitore(): Fornitore | undefined {
  const chiave = leggiChiave('ANTHROPIC_API_KEY');
  if (!chiave) return undefined;
  const modello = leggiChiave('ANTHROPIC_MODEL') ?? MODELLO_PREDEFINITO;
  // Lo stesso client finché chiave e modello non cambiano: `.env` si rilegge a ogni passo.
  if (attuale?.modello !== modello || attuale.client.apiKey !== chiave) {
    attuale = { modello, client: new Anthropic({ apiKey: chiave }) };
    console.info(`[ai-engine] risponde Anthropic · ${modello}`);
  }
  return attuale;
}

interface Passato {
  readonly nome: string;
  readonly argomenti: Record<string, unknown>;
  readonly visto: string;
  readonly sbagliata: boolean;
}

interface Giro {
  readonly tua: string;
  readonly risposta?: string;
}

interface Esito {
  readonly chiamate: Array<{ nome: string; argomenti: Record<string, unknown> }>;
  readonly detto: string;
  readonly perche?: string;
}

function apertura(r: Ruolo, frase: string): string {
  return r === 'conversazione' ? `Ha scritto: ${frase}` : `Il task da lavorare:\n${frase}`;
}

async function viaMessages(f: Fornitore, r: Ruolo, frase: string, passato: readonly Passato[], prima: readonly Giro[]): Promise<Esito> {
  const messaggi: Array<{ role: 'user' | 'assistant'; content: unknown }> = [];
  for (const g of prima) {
    messaggi.push({ role: 'user', content: g.tua });
    if (g.risposta) messaggi.push({ role: 'assistant', content: g.risposta });
  }
  messaggi.push({ role: 'user', content: apertura(r, frase) });
  for (const [i, p] of passato.entries()) {
    messaggi.push({ role: 'assistant', content: [{ type: 'tool_use', id: `m${i}`, name: p.nome, input: p.argomenti }] });
    messaggi.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: `m${i}`, content: p.visto, is_error: p.sbagliata }] });
  }
  const risposta = await f.client.messages.create({
    model: f.modello,
    max_tokens: 16_000,
    // Senza ragionamento: i passi passati tornano ricostruiti dalle mosse, e un blocco di
    // pensiero non sapremmo rimandarlo.
    thinking: { type: 'disabled' },
    output_config: { effort: IMPEGNO },
    system: [{ type: 'text', text: prompt(r), cache_control: { type: 'ephemeral', ttl: TTL } }],
    tools: ARNESI[r] as never,
    messages: messaggi as never,
  } as never);
  const u = risposta.usage;
  console.info(`[ai-engine] token: ${u.input_tokens} nuovi, ${u.cache_read_input_tokens ?? 0} dalla cache, ${u.cache_creation_input_tokens ?? 0} messi in cache, ${u.output_tokens} scritti`);
  return {
    chiamate: risposta.content
      .filter((x): x is Extract<typeof x, { type: 'tool_use' }> => x.type === 'tool_use')
      .map((x) => ({ nome: x.name, argomenti: x.input as Record<string, unknown> })),
    detto: risposta.content
      .filter((x): x is Extract<typeof x, { type: 'text' }> => x.type === 'text')
      .map((x) => x.text.trim())
      .join(' ')
      .trim(),
    perche: risposta.stop_reason === 'refusal' ? 'rifiuto' : risposta.stop_reason === 'max_tokens' ? 'troppo lungo' : undefined,
  };
}

export const portaAi: Connect.NextHandleFunction = (req, res) => {
  res.setHeader('content-type', 'application/json');
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return;
  }
  const f = fornitore();
  if (!f) {
    res.statusCode = 503;
    res.end(JSON.stringify({ perche: 'manca la chiave' }));
    return;
  }
  let corpo = '';
  req.on('data', (c) => (corpo += c));
  req.on('end', () => {
    void (async () => {
      try {
        const { ruolo, frase, passato, prima } = JSON.parse(corpo) as {
          ruolo?: Ruolo;
          frase?: string;
          passato?: Passato[];
          prima?: Giro[];
        };
        if (!frase?.trim() || (ruolo !== 'conversazione' && ruolo !== 'lavoro')) {
          res.statusCode = 400;
          res.end(JSON.stringify({ perche: 'manca la frase o il ruolo' }));
          return;
        }
        const esito = await viaMessages(f,ruolo, frase, passato ?? [], prima ?? []);
        console.info(
          `[ai-engine] ${ruolo} · passo ${(passato?.length ?? 0) + 1} · ` +
            (esito.chiamate.length ? esito.chiamate.map((c) => c.nome).join(', ') : esito.detto ? 'solo parole' : 'niente') +
            (esito.perche ? ` · fermato: ${esito.perche}` : ''),
        );
        res.end(JSON.stringify(esito));
      } catch (e) {
        console.warn('[ai-engine]', e instanceof Error ? e.message : e);
        res.statusCode = 502;
        res.end(JSON.stringify({ perche: e instanceof Error ? e.message : 'nessuna risposta' }));
      }
    })();
  });
};
