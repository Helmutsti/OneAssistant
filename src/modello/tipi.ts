// Il modello dei task, come lo definisce `docs/L01`. Se questo file e il documento
// divergono, ha ragione il documento (AGENTS.md §6).

/** I quattro stati di un task (`docs/L01` §Gli stati dei task). */
export type Stato = 'T_DRAFT' | 'T_LAVORAZIONE' | 'T_ATTESA' | 'T_CONCLUSIONE';

/**
 * Dove una bolla si vede. La dropzone appartiene a INPUT e ospita **una bozza sola**;
 * `T_DRAFT` è uno stato, non un posto, quindi una bozza può stare anche in SIDEBAR
 * (`docs/L01`, `docs/L02` §SIDEBAR). La NOTIFICATIONBAR non è un luogo per i task.
 */
export type Luogo = 'DROPZONE' | 'DESK' | 'SIDEBAR';

/**
 * Le icone di tipo (`docs/design/L0` legge 06): dicono che tipo di task si sta svolgendo
 * e coincidono col dato che il task tratta. L'elenco può crescere.
 */
export const TIPI = [
  'email', 'cartella', 'documento', 'contatto', 'persone', 'conversazione',
  'immagine', 'sveglia', 'indirizzo', 'appuntamento',
] as const;
export type Tipo = (typeof TIPI)[number];

/** Il colore di uno stato (`docs/L01` §Il colore di uno stato). Il verde non c'è: non è uno stato. */
export type Colore = 'grigio' | 'azzurro' | 'ambra' | 'nessuno';

/** Il nome di un task: una riga sola, al massimo 32 caratteri (`docs/L01` §Come si scrive il nome). */
export const NOME_MASSIMO = 32;

/** Frasi fra «» in INPUT: al massimo quattro, mai due uguali (`docs/design/L0` legge 01). */
export const FRASI_MASSIME = 4;

/** La finestra della Funzione Delay (`docs/L01` §Funzione Delay). */
export const DELAY_MS = 90_000;

/** Un task programmato entra nell'orizzonte quindici minuti prima (`docs/L01`). */
export const PREAVVISO_MS = 15 * 60_000;

/** Una cosa agganciata a un task: le tessere della dropzone (`docs/L02` §INPUT). */
export interface Elemento {
  readonly tipo: Tipo | 'task';
  readonly nome: string;
  /** Un dato solo, in coda, dove serve. */
  readonly dato?: string;
  /**
   * Se esiste solo nella memoria. Decide il materiale della tessera (`L2 - INPUT` §Le
   * tessere): carta per le cose raccolte, vetro per i task già a schermo, filo tratteggiato
   * per ciò che esiste solo nella memoria.
   */
  readonly memoria?: boolean;
}

/**
 * Dove un task esce, e a chi. Ogni destinazione dichiara **una cosa sola**: se attraversa
 * il confine del computer. Non si deduce dal nome del servizio (`docs/L01` §Importante).
 */
export interface Uscita {
  readonly servizio: string;
  readonly a: string;
  readonly attraversaConfine: boolean;
}

/** Un invio trattenuto dalla Funzione Delay, o partito col bypass. */
export interface Invio {
  readonly id: string;
  /** Quando parte davvero la chiamata al servizio, in ms dell'orologio. */
  readonly scadenza: number;
  readonly bypass: boolean;
}

/**
 * Perché un task in `T_ATTESA` aspetta. Non è un quinto stato: è il motivo dell'attesa, e
 * decide soltanto il colore — l'ora non scaduta non ne ha, tutto il resto è ambra.
 *
 *   - `risposta`: il sistema ha fatto una domanda;
 *   - `parola`: il lavoro è pronto e aspetta il sì dell'utente;
 *   - `fermo`: non può proseguire da solo; resta ambra, perché a sbloccarlo è l'utente;
 *   - `ora`: rimandato o programmato; non chiede niente finché l'ora non scade.
 */
export type Attesa = 'risposta' | 'parola' | 'fermo' | 'ora';

export interface Task {
  readonly genere: 'task';
  readonly id: string;
  tipo: Tipo;
  nome: string;
  stato: Stato;
  luogo: Luogo;
  /** La richiesta reale, estratta dal prompt. */
  richiesta: string;
  /** Le cose agganciate: il contesto che il task si porta dietro. */
  contesto: Elemento[];
  /** Quello che la bolla mostra nel corpo: l'avanzamento, o quello che ha prodotto. */
  corpo?: string;
  /** Un dato solo, per il chip: una frazione, un'ora, una parola. */
  dato?: string;
  /** Le frasi della bolla, che INPUT offre quando è la active. */
  frasi: string[];
  /** Quello che l'utente ha risposto lungo la strada: il lavoro ne tiene conto. */
  note: string[];
  attesa?: Attesa;
  /** Per `attesa: 'ora'`: quando torna a chiedere. */
  ora?: number;
  /** Rimandato dall'utente o programmato per un'ora: si vedono diversi in SIDEBAR. */
  perOra?: 'rimandato' | 'programmato';
  uscita?: Uscita;
  invio?: Invio;
  /** Chi ha cominciato: si sa, non si vede (`docs/design/L0` legge 02). */
  readonly origine: 'utente' | 'notifica' | 'sottotask';
  /** Per un sotto-task: il task che l'ha fatto nascere. */
  readonly genitore?: string;
  /** Quando è arrivato nel suo luogo attuale: dà l'ordine della SIDEBAR. */
  arrivo: number;
}

/**
 * La bolla che non è un task (`docs/L02` §La bolla documento): mostra un contenuto e
 * basta. Non ha stati e non ha colore, ma ha le sue frasi e può essere la active.
 */
export interface Documento {
  readonly genere: 'documento';
  readonly id: string;
  readonly tipo: Tipo;
  readonly nome: string;
  readonly contenuto: { readonly forma: 'testo' | 'immagine' | 'filmato'; readonly valore: string };
  /** Da dove viene: la targa neutra dice tipo e provenienza. */
  readonly provenienza?: string;
  luogo: 'DESK' | 'SIDEBAR';
  frasi: string[];
  arrivo: number;
}

export type Bolla = Task | Documento;

/**
 * Una cosa arrivata dal mondo. **Non è un task**: non ha luogo né stato, e lo diventa
 * solo con «me ne occupo» (`docs/L02` §NOTIFICATIONBAR). Mittente e oggetto veri, mai
 * riscritti (`docs/design/L0` §NOTIFICATIONBAR).
 */
export interface Notifica {
  readonly id: string;
  readonly tipo: Tipo;
  readonly servizio: string;
  readonly mittente: string;
  readonly oggetto: string;
  readonly testo: string;
  readonly quando: number;
  /**
   * Se il filtro la promuove. Quella che non promuove **entra muta**: non suona, non
   * conta nel badge, ma c'è.
   */
  readonly promossa: boolean;
  /** Finché il cassetto non è stato aperto. È questo che il badge conta. */
  nuova: boolean;
}

/** Una domanda del sistema, in INPUT, legata al task che l'ha generata. Una sola aperta. */
export interface Domanda {
  readonly task: string;
  readonly testo: string;
  readonly risposte: readonly string[];
}

/** L'ultimo scambio, che INPUT mostra e poi lascia andare (`docs/L02` §INPUT). */
export interface Scambio {
  readonly tua: string;
  risposta?: string;
  /** Le frasi che la risposta offre, quando ne offre: «manda subito», «no, aspetta». */
  frasi?: string[];
}

export function colore(b: Bolla, adesso: number): Colore {
  if (b.genere === 'documento') return 'nessuno';
  switch (b.stato) {
    case 'T_DRAFT':
      return 'grigio';
    case 'T_LAVORAZIONE':
      return 'azzurro';
    case 'T_ATTESA':
      return b.attesa === 'ora' && (b.ora ?? 0) > adesso ? 'nessuno' : 'ambra';
    case 'T_CONCLUSIONE':
      // Un task concluso non si vede: svanisce sul posto e lascia l'interfaccia.
      return 'nessuno';
  }
}

/** Il nome, come lo vuole `docs/L01`: una riga, al massimo 32 caratteri, niente puntini. */
export function nomeValido(nome: string): string | undefined {
  const n = nome.trim();
  if (!n) return 'il nome è vuoto';
  if (n.includes('\n')) return 'il nome sta su una riga sola';
  if ([...n].length > NOME_MASSIMO) return `il nome supera i ${NOME_MASSIMO} caratteri`;
  if (/(\.\.\.|…)/.test(n)) return 'nel nome non vanno i puntini di sospensione';
  return undefined;
}

/** Al massimo quattro frasi, senza doppioni e senza virgolette: quelle le mette l'interfaccia. */
export function pulisciFrasi(frasi: readonly string[]): string[] {
  const viste = new Set<string>();
  const fuori: string[] = [];
  for (const f of frasi) {
    const t = f.trim().replace(/^[«"]+|[»"]+$/g, '').trim();
    if (!t || viste.has(t.toLowerCase())) continue;
    viste.add(t.toLowerCase());
    fuori.push(t);
    if (fuori.length === FRASI_MASSIME) break;
  }
  return fuori;
}
