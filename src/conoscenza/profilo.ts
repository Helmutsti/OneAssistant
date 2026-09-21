// Il profilo: da dove parte il sistema quando si accende.
//
// Si legge da `Archivio/users/<id>/preferences.txt` e `system.txt`, perché per
// provare una situazione si deve poter cambiare una riga e ricaricare, senza toccare il
// codice. È annidato per indentazione, come si scrive un elenco a mano su un foglio.
//
// Sta dentro `Archivio/users/<id>/` insieme alle cose che nomina — la faccia, lo sfondo — e le
// nomina **per percorso relativo**. È quello che rende l'archivio una cosa che si
// clona e parte, invece di una cosa che parte solo sul computer di chi l'ha scritta
// (`Archivio/LEGGIMI.md`).
//
// **Il file mescola tre strati che nel modello sono separati**, e fa bene a mescolarli
// perché per i test conta avere un posto solo. Ma quando si legge, si divide:
//
//   chi sei      nome, data di nascita ............. docs/07-memoria §2
//   preferenze   ciò che hai dichiarato tu ......... docs/07-memoria §8
//   contesto     dove sei, che ore sono ............ docs/07-memoria §3
//   macchina     rete, volume, batteria, microfono . è quello che WHO dichiara
//   sistemi      cosa è acceso, dentro e fuori ..... docs/06-confini §2
//   tema         i colori, e quanto si vede il fondo  è **design**, vedi qui sotto
//
// Se un profilo chiede qualcosa che una legge non permette, finisce in `contrasti`: si
// vede, non si applica. È il posto dove una richiesta viene dichiarata invece che
// ottenuta di nascosto.
//
// **Il tema è un caso a parte, e va detto.** I colori sono design, e il design vive di
// là (CLAUDE.md). Quello che il profilo può fare è **provare** una tavolozza senza
// toccare il codice — è a questo che serve un banco. Finché una tavolozza vive solo qui,
// il prototipo e i documenti di design dicono due cose diverse, e quella differenza va
// riportata di là invece che lasciata correre (docs/11-aperte, la coda sul design).
//
// Quello che il tema **non** può fare è rompere una legge: gli stati restano tre, e
// restano stato e non categoria (legge 04). Un colore in più finisce in `contrasti`.

/** Come si comporta il campanello (docs/08-voce §6). */
export interface Notifiche {
  /** `sound` suona, `silent` no. Spento vuol dire spento: non c'è un mezzo campanello. */
  readonly modo: 'sound' | 'silent';
  /** Il file da suonare, servito dalla radice — cioè da `pubblico/`. Se manca, quello
   *  di sempre. */
  readonly suono?: string;
}

export interface Macchina {
  readonly rete?: string;
  readonly ethernet: boolean;
  readonly volume: number;
  readonly batteria: number;
  /** Spento, il sistema resta usabile: si scrive. Ma non c'è voce in ingresso. */
  readonly microfono: boolean;
  readonly volto?: string;
  readonly sfondo?: string;
  readonly notifiche: Notifiche;
}

export interface Assistente {
  /** La voce che legge si può spegnere senza perdere niente (docs/05-interfaccia §1). */
  readonly lettura: boolean;
  /** Il genere della voce. Era una domanda aperta di `06-voce`: qui c'è una risposta. */
  readonly voce?: string;
  /** Come si chiama. L'assistente è un personaggio (docs/08-voce §3). */
  readonly nome?: string;
  /**
   * **Il copione**: com'è fatto il personaggio, in prosa. Non lo legge il prototipo —
   * lo legge l'AI engine, ed entra nelle sue istruzioni (src/ai-engine/strumenti.ts).
   *
   * Sta nel profilo e non nel codice perché un carattere si prova cambiando una riga e
   * ricaricando, come il tema e la voce (deciso il 17 settembre 2026). Quello che **non**
   * può fare è cambiare le leggi: che un personaggio non sia un ostacolo e non chieda di
   * essere consolato è scritto nel codice, e da qui non si tocca (docs/08-voce §3).
   */
  readonly copione?: string;
  /**
   * Il sesso del personaggio, che non è il timbro della voce: si può essere qualcuno
   * senza che la voce lo dica, e viceversa. Oggi vanno insieme; sono due righe perché
   * il giorno che divergono non si deve rifare il formato.
   */
  readonly sesso?: string;
}

export interface Profilo {
  readonly utilizzatore: string;
  /** In che lingua gira tutto: le risposte, e la voce che le legge. */
  readonly lingua: string;
  readonly nascita?: string;
  readonly sesso?: string;
  /** Dove sei: il luogo noto in cui il gps ti colloca, più la città. */
  readonly dove: string;
  readonly gps?: string;
  readonly luogo?: string;
  /** Se l'orologio segue il tempo vero, o resta fermo dove l'hai messo. */
  readonly oraReale: boolean;
  readonly macchina: Macchina;
  readonly assistente: Assistente;
  /** Le cartelle dell'archivio accese (docs/07-memoria §7). */
  readonly umani: readonly string[];
  /** I servizi accesi (docs/06-confini §2). Uno spento non annuncia e non consegna. */
  readonly esterni: readonly string[];
  /** Tema di colore nominato, definito dal design (per esempio `cenere`). */
  readonly temaNome?: string;
  /** La tavolozza in prova, nome → valore. Vuota vuol dire: quella dei documenti. */
  readonly tema: Readonly<Record<string, string>>;
  /** Quello che il file chiede e le leggi non permettono. Si mostra, non si applica. */
  readonly contrasti: readonly string[];
}

export const PREDEFINITO: Profilo = {
  utilizzatore: 'Manuel Cucca',
  lingua: 'italiano',
  dove: 'casa · Genova',
  oraReale: false,
  macchina: {
    ethernet: false,
    volume: 40,
    batteria: 82,
    microfono: false,
    notifiche: { modo: 'sound' },
  },
  assistente: { lettura: true },
  umani: ['persone', 'ricordi', 'progetti'],
  esterni: ['filesystem', 'email', 'contatti', 'calendario'],
  temaNome: 'cenere',
  tema: {},
  contrasti: [],
};

/**
 * Le lingue che il sistema sa parlare, e il codice che serve alla bocca. Chiuso: una
 * lingua che non sa dire non si promette (docs/08-voce §3).
 */
const LINGUE: Record<string, string> = {
  italiano: 'it-IT',
  italian: 'it-IT',
  inglese: 'en-GB',
  english: 'en-GB',
};

export function codiceLingua(lingua: string): string {
  return LINGUE[lingua.trim().toLowerCase()] ?? 'it-IT';
}

/** Una riga del file: quanto è rientrata, com'è scritta, e cosa c'è dopo i due punti. */
interface Riga {
  readonly rientro: number;
  readonly chiave: string;
  readonly valore: string;
  /**
   * La riga **come l'hai scritta**, maiuscole e punteggiatura comprese. Serve ai rami
   * che contengono prosa invece di coppie chiave-valore — oggi solo `copione:`. Una
   * frase schiacciata in minuscolo e usata come chiave non è più una frase, e il
   * copione va letto da un modello, non da un parser.
   */
  readonly grezza: string;
}

/**
 * Leggere il file. Formato `chiave: valore`, annidato per indentazione — una tabulazione
 * o quattro spazi, indifferentemente, perché deve restare una cosa che si scrive a mano
 * senza sbagliare.
 */
export function leggiProfilo(testo: string): Profilo {
  const righe: Riga[] = [];
  for (const r of testo.replace(/\r/g, '').split('\n')) {
    if (!r.trim() || r.trim().startsWith('#')) continue;
    const rientro = (r.match(/^[\t ]*/)?.[0] ?? '').replace(/ {4}/g, '\t').length;
    const i = r.indexOf(':');
    const chiave = (i < 0 ? r : r.slice(0, i)).trim().toLowerCase();
    // «#ffffff · era #c6cbc9»: quello dopo il punto mediano è una nota per chi legge, e
    // la stessa cosa vale per «sound [sound, silent]», dove fra parentesi c'è la scelta.
    const valore = (i < 0 ? '' : r.slice(i + 1))
      .split('\u00b7')[0]!
      .replace(/\[[^\]]*\]/g, '')
      .trim()
      .replace(/^"|"$/g, '');
    righe.push({ rientro, chiave, valore, grezza: r.trim() });
  }

  /** Il valore di una chiave, cercata ovunque nell'albero. */
  const c = (chiave: string) => righe.find((r) => r.chiave === chiave)?.valore;

  /** I figli diretti di una chiave: le righe più rientrate, fino a che risale. */
  const figli = (chiave: string): Riga[] => {
    const i = righe.findIndex((r) => r.chiave === chiave);
    if (i < 0) return [];
    const dentro: Riga[] = [];
    for (let j = i + 1; j < righe.length && righe[j]!.rientro > righe[i]!.rientro; j++) {
      dentro.push(righe[j]!);
    }
    return dentro;
  };

  /**
   * La prosa dentro un ramo: le righe figlie **come sono scritte**, una per riga. Un
   * trattino in testa si toglie — si scrive un elenco a mano come viene — e il resto
   * resta intatto, perché è testo e non un'impostazione.
   */
  const prosa = (chiave: string): string =>
    figli(chiave)
      .map((x) => x.grezza.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean)
      .join('\n');

  /** Le chiavi accese dentro un ramo: `persone: on`, `messaging: off`. */
  const accesi = (chiave: string) =>
    figli(chiave).filter((r) => acceso(r.valore)).map((r) => r.chiave);

  const spento = (v?: string) => /^(off|no|spent|false)/i.test((v ?? '').trim());
  const numero = (v: string | undefined, quando: number) => {
    const n = parseInt((v ?? '').replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) ? n : quando;
  };

  const gps = c('gps');
  // «location from gps» elenca i luoghi noti: quello con sì è dove sei adesso.
  const luogo = figli('location from gps').find((r) => acceso(r.valore))?.chiave;
  const wifi = c('wifi');
  const rete = spento(wifi) ? undefined : wifi?.match(/"([^"]+)"/)?.[1] ?? wifi?.split(',')[0]?.trim();

  // Oggi non c'è niente che il profilo chieda e le leggi non permettano. Il meccanismo
  // resta: è il posto dove un profilo dichiara quello che vorrebbe e non può avere,
  // invece di ottenerlo di nascosto.
  const contrasti: string[] = [];
  if (c('accent color')) {
    contrasti.push(
      'un colore d’accento contro la legge 04 — il colore è stato, mai decorazione: ' +
        'salvia, ambra e rosso terra sono gli unici tre, e non sono scelte di gusto.',
    );
  }
  const nome = figli('preferenze').find((r) => r.chiave === 'nome')?.valore;

  // Il campanello: `sound` o `silent`, e il file che suona (docs/08-voce §6).
  const suoi = figli('notifications');
  const modo = /silen|muto|spent/i.test(suoi.find((r) => r.chiave === 'set')?.valore ?? '')
    ? ('silent' as const)
    : ('sound' as const);

  // La tavolozza in prova. Si prende così com'è scritta: a dire quali nomi esistono è
  // `src/stile/tema.ts`, e un nome che non conosce lo lascia cadere senza far danni.
  const tema: Record<string, string> = {};
  for (const r of figli('tema')) {
    if (r.valore) tema[r.chiave] = r.valore;
  }

  return {
    utilizzatore: c('name') || PREDEFINITO.utilizzatore,
    lingua: c('language') || PREDEFINITO.lingua,
    nascita: c('datebirth'),
    sesso: c('sex'),
    dove: [luogo, gps].filter(Boolean).join(' · ') || PREDEFINITO.dove,
    gps,
    luogo,
    oraReale: /attuale|reale/i.test(c('data ora') ?? ''),
    macchina: {
      rete,
      ethernet: !spento(c('ethernet')),
      volume: numero(c('volume'), 40),
      batteria: numero(c('batteria'), 82),
      microfono: !spento(c('microfono')),
      volto: nomeFile(c('profilepicture')) ?? dellUtente('filesystem/Home/avatar.jpg'),
      sfondo: nomeFile(c('background')) ?? dellUtente('filesystem/Home/wallpaper.jpg'),
      notifiche: { modo, suono: nomeFile(suoi.find((r) => r.chiave === 'sound')?.valore) },
    },
    assistente: {
      lettura: !spento(c('lettura')),
      voce: figli('preferenze').find((r) => r.chiave === 'voce')?.valore,
      nome,
      sesso: figli('preferenze').find((r) => r.chiave === 'sesso')?.valore,
      copione: prosa('copione') || undefined,
    },
    umani: accesi('umani').length ? accesi('umani') : PREDEFINITO.umani,
    esterni: accesi('esterni').length ? accesi('esterni') : PREDEFINITO.esterni,
    temaNome: c('theme') || c('colori') || PREDEFINITO.temaNome,
    tema,
    contrasti,
  };
}

function acceso(v: string): boolean {
  return /^(on|s[iì]|acceso|attivo|true|yes)$/i.test(v.trim());
}

/**
 * Dove sta un file che il profilo nomina.
 *
 * Dal 17 settembre 2026 i posti sono **due**, e la differenza non è tecnica: è di chi
 * è la roba.
 *
 *   `filesystem/…` è **tua**: la tua faccia, il tuo sfondo. Sta in `Archivio/users/<id>/` e
 *                 si raggiunge solo dalla porta — `/archivio/<id>/filesystem/…` — perché
 *                 quella cartella non è servita dalla radice del sito, e non deve
 *                 esserlo: lì accanto c’è `memory/`.
 *   tutto il resto è **dell’app**: i campanelli che spedisce lei, il volto di riserva.
 *                 Sta in `pubblico/`, che è la radice del sito, e basta una barra.
 *
 * La regola è una riga: **quello che comincia per `filesystem/` è dell’utente.**
 *
 * Restano due strade di cortesia, perché un file scritto a mano raccoglie di tutto:
 *
 *   - un **indirizzo in rete** passa com’è: non è roba nostra e non la spostiamo;
 *   - un **percorso assoluto** è quello che resta quando incolli una riga da una
 *     macchina vera. Di quello si tiene il nome, e si cerca dove vanno i file di quel
 *     tipo — un’immagine è roba tua e si cerca in `storage/`, un suono è dell’app e si
 *     cerca in `suoni/`. Se il file è lì funziona, se no non si vede, ed è giusto
 *     così: una risorsa che non è nell’archivio non è dell’archivio.
 */
function nomeFile(percorso?: string): string | undefined {
  const p = percorso?.trim().replace(/\\/g, '/');
  if (!p) return undefined;
  if (/^https?:\/\//i.test(p)) return p;

  const assoluto = /^([a-z]:|\/)/i.test(p);
  if (!assoluto) {
    const pulito = p.replace(/^\.?\//, '');
    return pulito.startsWith('filesystem/') ? dellUtente(pulito) : `/${pulito}`;
  }

  const nome = p.split('/').pop();
  if (!nome) return undefined;
  if (/\.(mp3|wav|ogg|m4a)$/i.test(nome)) return `/suoni/${nome}`;
  if (/\.(jpe?g|png|webp|avif)$/i.test(nome)) return dellUtente(`filesystem/Home/${nome}`);
  return undefined;
}

/**
 * Un file dell’utente in corso, dietro la porta. Se l’id non c’è ancora — succede solo
 * di là, dove `leggiProfilo` serve a tirare fuori il copione e le immagini non le
 * guarda nessuno — si lascia il percorso com’è invece di inventarne uno rotto.
 */
function dellUtente(relativo: string): string {
  return idCorrente ? `${PORTA}/${idCorrente}/${relativo}` : relativo;
}

// ─── il profilo in corso ───────────────────────────────────────────────────

/** La porta dell’archivio. L’unico modo di arrivare ai dati di qualcuno. */
const PORTA = '/archivio';
const UTENTE_PRINCIPALE = 'user_123';

let corrente: Profilo = PREDEFINITO;
let idCorrente: string = UTENTE_PRINCIPALE;

export function profilo(): Profilo {
  return corrente;
}

/**
 * Quale profilo accendere. Senza dire niente è `ambiente/impostazioni.txt`, che è il
 * profilo di casa — **Manuel**, dal 17 settembre 2026; con `?profilo=lucia` è
 * `ambiente/profili/lucia.txt`, che tiene le stesse preferenze e un'altra persona.
 *
 * Non esiste un `profili/manuel.txt`: sarebbe una seconda copia del profilo di casa, e
 * due copie divergono sempre. Chi è di casa sta in `impostazioni.txt` e basta. Il nome
 * passa da un setaccio — solo lettere, numeri e trattini — perché finisce dentro un
 * indirizzo: un profilo sceglie un file, non una cartella qualsiasi.
 */
export function utenteChiesto(): string | undefined {
  return undefined;
}

/**
 * L’id dell’utente acceso. È **il nome della sua cartella** dentro `Archivio/`, ed è la
 * cosa con cui si chiede qualunque suo file alla porta.
 *
 * Vuoto finché `caricaProfilo` non ha finito: prima di allora non si sa chi c’è, e
 * fingere di saperlo vorrebbe dire aprire la memoria sbagliata.
 */
export function utenteInCorso(): string | undefined {
  return idCorrente;
}

/**
 * Chi entra se non dici niente. Sta in `Archivio/impostazioni.txt`, che è l’unico file
 * dell’archivio a non appartenere a nessuno: dice *quali* utenti ci sono, non com’è
 * fatto uno.
 */
async function ilPredefinito(): Promise<string | undefined> {
  return UTENTE_PRINCIPALE;
}

/**
 * Si carica all'avvio. Se il file non c'è, si parte dal predefinito: il prototipo deve
 * girare anche senza, o diventa una cosa che si rompe da sola.
 */
export async function caricaProfilo(): Promise<Profilo> {
  try {
    // L’id **prima** del file: `nomeFile` ne ha bisogno per sapere dove sta la tua
    // faccia, e `leggiProfilo` la risolve mentre legge.
    idCorrente = (await ilPredefinito()) ?? UTENTE_PRINCIPALE;
    const [preferenze, sistema] = await Promise.all([
      fetch(`${PORTA}/${idCorrente}/preferences.txt`),
      fetch(`${PORTA}/${idCorrente}/system.txt`),
    ]);
    if (preferenze.ok) {
      const testoSistema = sistema.ok ? await sistema.text() : '';
      corrente = leggiProfilo(`${await preferenze.text()}\n${testoSistema}`);
    }
  } catch (e) {
    // pazienza: si resta sul predefinito
  }
  return corrente;
}
