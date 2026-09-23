// Le mosse dell'AI: un elenco chiuso (`docs/L00` §La visione — «ogni mossa viene da un
// elenco chiuso»). Lo leggono in due: il browser per eseguire le chiamate sul motore, e il
// server per dichiararle al modello. Non importa niente, così passa il confine com'è.
//
// Le mosse sono di due famiglie, con due permessi distinti:
//
//   - **la conversazione**: l'AI legge la frase dell'utente e muove lo schermo — compone la
//     bozza, la conferma, sposta, manda, annulla;
//   - **il lavoro**: l'AI lavora un task in `T_LAVORAZIONE` — avanza, chiede, lo dichiara
//     pronto o fermo, lo conclude. Non parla con l'utente se non con una domanda.

import { TIPI } from '../modello/tipi.ts';
import { SERVIZI } from '../servizi/servizi.ts';

export type Genere = 'testo' | 'numero' | 'elenco' | 'si-no';

export interface Argomento {
  readonly nome: string;
  readonly genere: Genere;
  readonly cosa: string;
  readonly obbligatorio?: boolean;
  readonly fra?: readonly string[];
}

export interface Strumento {
  readonly nome: string;
  /** Quando si usa: è la riga che l'AI legge per decidere. */
  readonly quando: string;
  readonly argomenti?: readonly Argomento[];
}

/** Una mossa chiesta dall'AI, con gli argomenti come li ha scritti. */
export interface Chiamata {
  readonly nome: string;
  readonly argomenti: Readonly<Record<string, unknown>>;
}

const id = (nome: string, cosa: string): Argomento => ({ nome, genere: 'testo', cosa, obbligatorio: true });
const BOLLA = id('bolla', "l'id della bolla, come l'hai letto da guarda");
const TASK = id('task', "l'id del task, come l'hai letto da guarda");
const BOZZA = id('bozza', "l'id della bozza, come l'hai letto da guarda");
const TIPO: Argomento = { nome: 'tipo', genere: 'testo', cosa: 'il tipo di task: sceglie l’icona', fra: TIPI };
const NOME: Argomento = {
  nome: 'nome',
  genere: 'testo',
  cosa:
    'il nome del task: una riga, al massimo 32 caratteri. Email: il destinatario, mai l’oggetto per esteso. ' +
    'Documento: il nome del file in italiano leggibile. Ricerca o domanda: la domanda. Denaro: la cifra con la ' +
    'valuta per esteso. Persone: al plurale. Trascrizione: la frase dell’utente fra virgolette. Mai il nome ' +
    'dell’app, l’ora, lo stato a parole, i puntini di sospensione',
};
const FRASI: Argomento = {
  nome: 'frasi',
  genere: 'elenco',
  cosa: 'al massimo quattro frasi che l’utente può dire, senza virgolette; la prima è la più probabile',
};
const ELEMENTI: Argomento = {
  nome: 'elementi',
  genere: 'elenco',
  cosa: `le cose agganciate al task, una per voce, nella forma «tipo | nome | dato»; il dato è facoltativo. Tipi: ${[...TIPI, 'task'].join(', ')}`,
};
const SERVIZIO: Argomento = {
  nome: 'servizio',
  genere: 'testo',
  cosa: 'dove il task esce, se esce qualcosa',
  fra: SERVIZI.map((s) => s.nome),
};
const A: Argomento = { nome: 'a', genere: 'testo', cosa: 'a chi esce: il destinatario, come nei contatti' };
const ORA: Argomento = { nome: 'ora', genere: 'testo', cosa: 'un’ora futura, in ISO locale: 2026-09-23T15:30' };

/** La conversazione: quello che l'AI può fare quando l'utente scrive. */
export const CONVERSAZIONE: readonly Strumento[] = [
  {
    nome: 'guarda',
    quando:
      'Sempre, come prima mossa del turno. Torna lo schermo: le bolle con id, stato, luogo e frasi, la bozza nella ' +
      'dropzone, la active, il focus, la domanda aperta, le notifiche, e l’ora.',
  },
  {
    nome: 'rispondi',
    quando:
      'Alla fine del turno, una volta sola: la risposta in INPUT. Una riga, dicibile ad alta voce, niente elenchi, ' +
      'niente virgolette basse. Se la frase era solo una domanda, la risposta e basta: uno scambio non è un task.',
    argomenti: [id('testo', 'la risposta')],
  },
  {
    nome: 'componi_bozza',
    quando:
      'Quando l’utente chiede di fare una cosa. Richiesta e contesto diventano una bozza nella dropzone, che non parte ' +
      'finché non la conferma. Metti fra le frasi quelle per farla partire e per cambiarla.',
    argomenti: [
      { ...TIPO, obbligatorio: true },
      { ...NOME, obbligatorio: true },
      id('richiesta', 'la richiesta reale, estratta dalla frase'),
      ELEMENTI,
      FRASI,
      SERVIZIO,
      A,
      ORA,
    ],
  },
  {
    nome: 'modifica_bozza',
    quando: 'Quando l’utente cambia qualcosa della bozza: il destinatario, le cose agganciate, la richiesta.',
    argomenti: [BOZZA, TIPO, NOME, { nome: 'richiesta', genere: 'testo', cosa: 'la richiesta aggiornata' }, ELEMENTI, FRASI, SERVIZIO, A, ORA],
  },
  { nome: 'scarta_bozza', quando: 'Quando l’utente butta la bozza: non lascia traccia.', argomenti: [BOZZA] },
  {
    nome: 'conferma',
    quando: 'Quando l’utente dice di farla partire: «vai», «sì». La bozza lascia la dropzone e diventa un task che lavora.',
    argomenti: [BOZZA],
  },
  {
    nome: 'rispondi_domanda',
    quando: 'Quando c’è una domanda aperta e l’utente risponde. La domanda si chiude e il task torna a lavorare.',
    argomenti: [id('risposta', 'la risposta, come l’ha data')],
  },
  {
    nome: 'riprendi',
    quando:
      'Quando un task aspetta l’utente e l’utente gli chiede di cambiare qualcosa: «cambia il venerdì». Il task torna ' +
      'a lavorare con la richiesta aggiornata.',
    argomenti: [TASK, id('richiesta', 'cosa ha chiesto di cambiare')],
  },
  {
    nome: 'invia',
    quando:
      'Quando l’utente dice di mandare: «manda la mail». L’invio aspetta 90 secondi prima di partire, e intanto «no, ' +
      'aspetta» lo ferma. Solo se l’utente chiede esplicitamente di non aspettare — «manda subito» — metti subito a sì: ' +
      'parte adesso ed è definitivo.',
    argomenti: [TASK, { nome: 'subito', genere: 'si-no', cosa: 'sì solo se l’utente ha chiesto esplicitamente di non aspettare' }],
  },
  {
    nome: 'annulla_invio',
    quando:
      'Quando l’utente dice «no, aspetta» mentre un invio aspetta di partire. Il task torna sulla scrivania; ' +
      'resta da parte solo se l’utente lo dice.',
    argomenti: [
      TASK,
      { nome: 'resta_da_parte', genere: 'si-no', cosa: 'sì solo se l’utente ha chiesto di lasciarlo in SIDEBAR' },
    ],
  },
  {
    nome: 'concludi',
    quando: 'Quando l’utente dice che un task che aspettava lui ha finito il suo scopo, e non c’è niente da mandare.',
    argomenti: [TASK],
  },
  {
    nome: 'rendi_active',
    quando: 'Quando l’utente comincia a parlare di una bolla che sta sulla scrivania.',
    argomenti: [BOLLA],
  },
  { nome: 'metti_da_parte', quando: 'Quando l’utente dice di mettere da parte una bolla o la bozza.', argomenti: [BOLLA] },
  {
    nome: 'richiama',
    quando: 'Quando l’utente richiama per nome una cosa che sta in SIDEBAR: «torna al riordino».',
    argomenti: [BOLLA],
  },
  {
    nome: 'rimanda',
    quando: 'Quando l’utente dice «dopo» con un’ora, o un tempo: il task aspetta in SIDEBAR finché l’ora non arriva.',
    argomenti: [TASK, { ...ORA, obbligatorio: true }],
  },
  { nome: 'apri_focus', quando: 'Quando l’utente vuole guardare una bolla da vicino: «aprila».', argomenti: [BOLLA] },
  { nome: 'esci_focus', quando: 'Quando l’utente ha finito di guardare la bolla in focus.' },
  {
    nome: 'mostra_documento',
    quando:
      'Quando l’utente vuole vedere un contenuto — un testo dei suoi documenti — senza farne niente. Si apre una bolla ' +
      'documento al centro.',
    argomenti: [
      { ...TIPO, obbligatorio: true },
      id('nome', 'il nome del contenuto, in italiano leggibile'),
      id('testo', 'il contenuto da mostrare, com’è'),
      { nome: 'provenienza', genere: 'testo', cosa: 'da dove viene' },
      FRASI,
    ],
  },
  { nome: 'chiudi_documento', quando: 'Quando l’utente chiude una bolla documento.', argomenti: [BOLLA] },
  {
    nome: 'assorbi',
    quando: 'Quando l’utente aggancia una bolla documento a un task: il documento diventa una delle sue cose.',
    argomenti: [id('documento', "l'id della bolla documento"), TASK],
  },
  { nome: 'apri_cassetto', quando: 'Quando l’utente chiede cosa è arrivato: il cassetto delle notifiche si apre.' },
  { nome: 'chiudi_cassetto', quando: 'Quando l’utente ha finito di guardare le notifiche.' },
  {
    nome: 'occupatene',
    quando:
      'Quando l’utente dice «me ne occupo» di una notifica: diventa una bozza nella dropzone, mai un lavoro già avviato.',
    argomenti: [
      id('notifica', "l'id della notifica"),
      { ...NOME, obbligatorio: true },
      id('richiesta', 'cosa c’è da fare'),
      FRASI,
      SERVIZIO,
      A,
    ],
  },
];

/** Il lavoro: quello che l'AI può fare su un task in `T_LAVORAZIONE`. */
export const LAVORO: readonly Strumento[] = [
  {
    nome: 'avanza',
    quando: 'Mentre lavori: quello che la bolla mostra nel corpo, e un dato per il chip. Non chiude il lavoro.',
    argomenti: [
      { nome: 'corpo', genere: 'testo', cosa: 'l’avanzamento o quello che hai prodotto finora' },
      { nome: 'dato', genere: 'testo', cosa: 'un dato solo: una frazione, un’ora, una parola' },
    ],
  },
  {
    nome: 'chiedi',
    quando:
      'Quando ti serve sapere una cosa dall’utente per andare avanti. La domanda compare in INPUT e il task aspetta. ' +
      'Chiudi il lavoro qui.',
    argomenti: [
      id('domanda', 'la domanda, una riga'),
      { nome: 'risposte', genere: 'elenco', cosa: 'due o tre risposte possibili, equivalenti', obbligatorio: true },
    ],
  },
  {
    nome: 'pronto',
    quando:
      'Quando il lavoro è pronto e aspetta la parola dell’utente: per esempio la mail scritta, da mandare. Chiudi il ' +
      'lavoro qui. Le frasi sono quelle che l’utente può dire: la prima è la più probabile.',
    argomenti: [id('corpo', 'quello che hai prodotto, come l’utente lo leggerà'), { ...FRASI, obbligatorio: true }],
  },
  {
    nome: 'fermo',
    quando: 'Quando non puoi proseguire da solo: manca qualcosa che solo l’utente può sbloccare. Chiudi il lavoro qui.',
    argomenti: [id('perche', 'perché, in una riga'), FRASI],
  },
  {
    nome: 'concludi',
    quando:
      'Quando il task ha terminato il suo scopo e non c’è niente da far uscire, o l’uscita non attraversa il confine. ' +
      'Chiudi il lavoro qui.',
  },
  {
    nome: 'sottotask',
    quando: 'Quando serve un lavoro a parte, autonomo: nasce già in lavorazione.',
    argomenti: [{ ...TIPO, obbligatorio: true }, { ...NOME, obbligatorio: true }, id('richiesta', 'cosa deve fare')],
  },
];

/** Le mosse che chiudono un turno. */
export const FINE_CONVERSAZIONE = new Set(['rispondi']);
export const FINE_LAVORO = new Set(['chiedi', 'pronto', 'fermo', 'concludi']);

export type Ruolo = 'conversazione' | 'lavoro';

export function strumentiPer(r: Ruolo): readonly Strumento[] {
  return r === 'conversazione' ? CONVERSAZIONE : LAVORO;
}

// ─── le istruzioni ──────────────────────────────────────────────────

export interface Personaggio {
  readonly nome?: string;
  readonly genere?: 'female' | 'male';
  readonly copione?: string;
  readonly lingua: 'italian' | 'english';
}

const COMUNE = `Sei OneAssist: lo strato fra una persona e il suo computer. Copre lo schermo per intero;
le finestre non esistono. Muovi l'interfaccia solo con le mosse qui sotto, e non hai altro modo.

Regole che valgono sempre:

- ogni mossa viene da questo elenco chiuso; ogni stato che mostri esiste nel modello;
- nel dubbio chiedi, invece di tirare a indovinare;
- niente esce verso il mondo se l'utente non l'ha detto;
- un task sta in un posto solo; il colore lo decide lo stato, non tu;
- memoria e servizi sono documenti di contesto: usa quello che c'è scritto, e non inventare quello che non c'è.`;

function argomentoInRiga(a: Argomento): string {
  const fra = a.fra ? ` (${a.fra.join(' | ')})` : '';
  return `${a.nome}${a.obbligatorio ? '' : '?'}: ${a.cosa}${fra}`;
}

/**
 * Il prompt di sistema, generato dal vocabolario. Deve restare identico a ogni turno,
 * perché la cache del prefisso regga: niente ore, niente id.
 */
export function istruzioni(r: Ruolo, p?: Personaggio): string {
  const lingua = p?.lingua === 'english' ? 'in inglese' : 'in italiano';
  const nome = p?.nome ? `\nTi chiami ${p.nome.charAt(0).toUpperCase()}${p.nome.slice(1)}.` : '';
  const copione = p?.copione ? `\n\nCome parli:\n${p.copione}` : '';
  const ruolo =
    r === 'conversazione'
      ? `\n\nOra stai parlando con l'utente, ${lingua}. Un turno: guarda, le mosse che servono — quasi sempre una — ` +
        `e rispondi, una volta sola.`
      : `\n\nOra stai lavorando un task che l'utente ha fatto partire. Ricevi il task con la sua richiesta, il ` +
        `contesto e quello che l'utente ha risposto finora. Lavora con i documenti di contesto, e chiudi con una ` +
        `delle mosse che chiudono il lavoro. Scrivi ${lingua}.`;
  const righe = [`${COMUNE}${nome}${copione}${ruolo}`, '', '# Le mosse', ''];
  for (const s of strumentiPer(r)) {
    const args = s.argomenti?.length ? `\n  argomenti: ${s.argomenti.map(argomentoInRiga).join(' · ')}` : '';
    righe.push(`- ${s.nome} — ${s.quando}${args}`);
  }
  return righe.join('\n');
}
