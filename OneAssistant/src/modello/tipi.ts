// Le definizioni di docs/01-modello.md. Se questo file e quel documento divergono,
// il documento ha ragione.

/** docs/01-modello §1 — dice chi ha iniziato, non è uno stato. */
export type Origine = 'tua' | 'esterna' | 'derivata';

/** Le sette icone del sistema (L1 - Sistema, legge 06). Insieme chiuso. */
export type Tipo =
  | 'posta'
  | 'cartella'
  | 'documento'
  | 'persone'
  | 'conversazione'
  | 'immagine'
  | 'sveglia';

/** Asse 1 — dove il task è visibile. Esclusivo: un task sta in un posto solo. */
export type Luogo = 'MAIN' | 'APERTO' | 'CHIP' | 'CARTA' | 'ORARIO' | 'MEMORIA';

/** Asse 2 — cosa sta succedendo. È il colore a comunicarlo. */
export type Avanzamento =
  | 'in corso'
  | 'aspetta te'
  | 'programmato'
  | 'bloccato'
  | 'concluso'
  | 'consegnato';

/** docs/01-modello §2 — le caselle vuote sono impossibili, non improbabili. */
const LEGALI: Record<Luogo, readonly Avanzamento[]> = {
  MAIN: ['in corso', 'aspetta te', 'programmato', 'bloccato', 'concluso', 'consegnato'],
  APERTO: ['in corso', 'aspetta te', 'programmato', 'bloccato', 'concluso', 'consegnato'],
  CHIP: ['in corso', 'aspetta te', 'programmato', 'bloccato', 'concluso', 'consegnato'],
  CARTA: ['aspetta te'],
  ORARIO: ['aspetta te', 'programmato'],
  MEMORIA: ['concluso', 'consegnato'],
};

export function combinazioneLegale(luogo: Luogo, avanzamento: Avanzamento): boolean {
  return LEGALI[luogo].includes(avanzamento);
}

/** Il colore è lo stato (legge 04). Tre soli, e `programmato` non ne ha. */
export function colore(avanzamento: Avanzamento): 'salvia' | 'ambra' | 'rosso' | 'nessuno' {
  switch (avanzamento) {
    case 'in corso':
    case 'concluso':
    case 'consegnato':
      return 'salvia';
    case 'aspetta te':
      return 'ambra';
    case 'bloccato':
      return 'rosso';
    case 'programmato':
      return 'nessuno';
  }
}

/**
 * Chi parla per il gruppo: il membro che ha più bisogno di te (docs/01-modello §6).
 * L'ordine non è estetico — dice di chi è la palla, e un blocco non si nasconde mai
 * dietro un numero.
 */
const URGENZA: Record<Avanzamento, number> = {
  bloccato: 1,
  'aspetta te': 2,
  'in corso': 3,
  concluso: 4,
  consegnato: 4,
  programmato: 5,
};

/**
 * Un insieme di task a cui **tu** hai dato un nome. Non è un task: non ha id e non si
 * salva da nessuna parte se non come il nome che i suoi membri portano addosso. Finché
 * qualcuno lo porta esiste; quando l'ultimo lo lascia, non c'è più (docs/01-modello §6).
 */
export interface Gruppo {
  readonly nome: string;
  readonly membri: readonly Task[];
  /** Il membro più urgente: al gruppo presta il colore e l'icona. */
  readonly parla: Task;
}

export function chiParla(membri: readonly Task[]): Task {
  return membri.reduce((a, b) => (URGENZA[a.avanzamento] <= URGENZA[b.avanzamento] ? a : b));
}

/**
 * Cosa si vede aprendo un task (docs/01-modello §1): **una cosa sola, e vince l'esito**.
 * L'ingresso è *perché* il task esiste, l'esito è ciò su cui devi decidere — e impilarli
 * farebbe della bolla un documento. Sta qui e non nel disegno: è una regola del modello.
 */
export function dentroSiVede(t: Task): string | undefined {
  return t.esito ?? t.ingresso;
}

/** Una frase fra «». Le virgolette sono l'affordance: non esistono bottoni. */
export interface Frase {
  readonly testo: string;
  readonly comando: Comando;
}

/** docs/06-confini §2 — dove un task esce dal sistema. */
export type Destinazione = 'posta' | 'sms' | 'calendario' | 'contatti' | 'promemoria' | 'note' | 'disco';

/**
 * **Dove** un task esce, e **a chi**. Il *cosa* non è suo: è l'`esito` del task, e
 * l'uscita si limita a portarlo fuori (docs/01-modello §1). Finché non è consegnato,
 * non è uscito niente.
 */
export interface Uscita {
  readonly destinazione: Destinazione;
  readonly a: string;
  /** Se qualcuno lo riceve. Basta uno perché la consegna non sia mai autorizzabile. */
  readonly destinatari?: readonly string[];
}

/**
 * docs/06-confini §6 — si autorizza una volta per tutte solo ciò che nessun altro vede.
 * Il test non è il servizio: una riga di qui con dei destinatari torna a chiedere.
 */
const AUTORIZZABILI: readonly Destinazione[] = ['calendario', 'contatti', 'promemoria', 'note', 'disco'];

export function autorizzabile(u: Uscita): boolean {
  return AUTORIZZABILI.includes(u.destinazione) && !u.destinatari?.length;
}

export interface Task {
  readonly id: string;
  readonly origine: Origine;
  readonly tipo: Tipo;
  /** Come lo diresti, due parole al massimo: è la parola con cui lo richiami. */
  readonly nome: string;
  luogo: Luogo;
  avanzamento: Avanzamento;
  /** La riga che si legge nella carta o nella bolla. Dev'essere dicibile. */
  testo: string;
  /**
   * **Quello con cui nasce, e non cambia mai** (docs/01-modello §1). Per un task esterno
   * è quello che è arrivato — il corpo della mail, per intero; per un task tuo è quello
   * che hai dettato. Se cambiasse, non sarebbe più lo stesso task.
   */
  ingresso?: string;
  /**
   * **Quello che produce**, se produce qualcosa: la bozza, il riassunto scritto, i file
   * riordinati. Vuoto finché non c'è. Averlo e diventare `aspetta te` sono lo stesso
   * fatto guardato da due parti — e quando attraversa il confine, è lui che passa.
   */
  esito?: string;
  /** Una cosa sola, in monospaziato: una frazione, un'ora, una parola. */
  dato?: string;
  /** Al massimo quattro, la prima è la più probabile. */
  frasi: Frase[];
  /** Solo se programmato o rimandato. */
  ora?: Date;
  /** Da dove viene — solo per origine esterna o derivata. */
  fonte?: string;
  /** Cosa esce, se qualcosa esce. */
  uscita?: Uscita;
  /** Quando è nato, in tempo simulato. */
  readonly nascita: Date;
  /** L'istante dell'ultimo cambio di avanzamento, per le scadenze. */
  tocco: Date;
  /** L'avanzamento da cui è venuto: serve a «no, aspetta». */
  precedente?: Avanzamento;
  /** Quando è `bloccato` nella forma «non ho capito quale»: fra cosa si sceglie. */
  alternative?: readonly string[];
  /**
   * Che mestiere fa questo task, quando non è semplicemente una cosa arrivata. Cambia
   * le frasi che offre, e nient'altro: il modello dei due assi resta quello di sempre.
   */
  forma?: 'riassunto' | 'composizione';
  /** Quante volte l'hai fatta riscrivere. */
  giro?: number;
  /**
   * Il nome del gruppo in cui l'hai messa, se ce l'hai messa (docs/01-modello §6).
   * Lo decidi tu e nessun altro: il sistema non raggruppa mai da sé. Resta appeso al
   * task anche fuori dalla TASKBAR — il gruppo si *vede* dove si raggruppa, *vale* ovunque.
   */
  gruppo?: string;
  /**
   * Cosa è partito insieme a cosa. Ce l'hanno solo le consegne fatte con «manda tutte»,
   * e serve a una cosa sola: ciò che parte insieme si annulla insieme.
   */
  lotto?: string;
}

/**
 * Una cosa arrivata che **non è un task** — la seconda versione della NOTIFICATIONBAR,
 * in prova (docs/06-confini §3).
 *
 * Non ha luogo né avanzamento, e non è una dimenticanza: i due assi sono il modello dei
 * task, e una notifica non ci sta dentro. Sta nel cassetto, e basta.
 *
 * La tesi è una sola, e si può sbagliare: **oggi il filtro promuove da solo, qui
 * promuovi tu.** Quello che il filtro giudicava degno di una `CARTA` qui si posa nel
 * cassetto e aspetta che tu dica «me ne occupo»; e quello che il filtro scartava non è
 * più perso per sempre — non suona, non conta, ma c'è.
 */
export interface Notifica {
  readonly id: string;
  readonly tipo: Tipo;
  /** Come la diresti. Due parole: è la parola con cui la scegli. */
  readonly nome: string;
  readonly testo: string;
  readonly fonte?: string;
  readonly ingresso?: string;
  readonly esito?: string;
  readonly uscita?: Uscita;
  /** Quando è arrivata, in tempo simulato. */
  readonly quando: Date;
  /**
   * Se il filtro ha detto che ti riguarda **e** che c'è qualcosa da fare. Solo queste
   * suonano e contano nel badge: una notifica muta si posa e non chiede niente.
   */
  readonly chiede: boolean;
  /** Finché non hai aperto il cassetto. È questo che il badge conta. */
  nuova: boolean;
}

/**
 * Tutti i token della lingua, a runtime — perché un tipo non si può contare.
 *
 * Serve a una cosa sola e importante: l'alfabeto della pedana deve nominarli **tutti**
 * (src/prova/alfabeto.ts). Un comando che esiste nel modello e non ha una frase con cui
 * dirlo è una parola che il sistema capisce e che nessuno sa pronunciare.
 *
 * Dal 17 settembre 2026 quel giorno è arrivato: a comporre è l'AI engine, e questo elenco
 * è **esattamente** quello che le API gli mettono in mano (src/ai-engine/strumenti.ts). Per
 * questo `sequenza` e `aperta` non ci sono più — erano le due parole che parlavano fra i
 * due cervelli, e di cervelli ce n'è uno: più mosse in un turno sono più chiamate, e una
 * frase che non si capisce è una frase da capire, non un comando.
 */
export const COMANDI = [
  'consegna', 'rimanda', 'al-centro', 'richiama', 'annulla', 'mostra', 'chiudi',
  'scegli', 'aspetta', 'lascia', 'racconta', 'dimentica', 'conferma', 'revoca',
  'salva-nota', 'sciogli', 'riassumi', 'leggi', 'indietro', 'componi', 'aggiungi',
  'riscrivi', 'no', 'metti', 'apri', 'separa', 'consegna-gruppo', 'rimanda-gruppo',
  'dentro', 'estrai', 'non-ascoltare', 'voce',
] as const;

export type Comando =
  | { readonly tipo: 'consegna'; readonly task: string }
  | { readonly tipo: 'rimanda'; readonly task: string }
  | { readonly tipo: 'al-centro'; readonly task: string }
  | { readonly tipo: 'richiama'; readonly nome: string }
  | { readonly tipo: 'annulla'; readonly task: string }
  /** Le aree che si possono aprire. WHEN non c'è più: le cose che hanno un'ora si
   *  vedono nel cassetto delle notifiche, in fila con quello che è arrivato. */
  | { readonly tipo: 'mostra'; readonly area: 'NOTIFICATIONBAR' | 'TASKBAR' }
  | { readonly tipo: 'chiudi' }
  | { readonly tipo: 'scegli'; readonly indice: number }
  | { readonly tipo: 'aspetta' }
  /** «non ascoltare», «scrivo»: il microfono si spegne e si entra in tastiera. È
   *  l'unica mossa del microfono che esiste: **riaccenderlo non è una frase e non è
   *  una mossa**, è un gesto e soltanto un gesto (src/conoscenza/canali.ts). */
  | { readonly tipo: 'non-ascoltare' }
  /** «non leggere», «torna a leggere»: la voce in uscita si spegne e si riaccende.
   *  **Va in tutti e due i versi**, al contrario del microfono: spegnere la voce non
   *  spegne l'orecchio, quindi una frase per riaccenderla arriva sempre. E non toglie
   *  niente — il testo a schermo è la verità, la voce ne è la lettura (docs/03-architettura
   *  §1). Perché l'orecchio invece sia asimmetrico sta in src/conoscenza/canali.ts. */
  | { readonly tipo: 'voce'; readonly come: 'accesa' | 'spenta' }
  | { readonly tipo: 'lascia'; readonly task: string }
  /** Cosa sai di…: `su` è 'ultima', 'preferenze', o il nome di un'entità. */
  | { readonly tipo: 'racconta'; readonly su: string }
  /** «dimenticalo»: smentisce l'ultima cosa segnata. Non cancella (docs/07-memoria §10). */
  | { readonly tipo: 'dimentica' }
  /** «sì, fai pure»: promuove l'abitudine proposta da osservato.md a preferenze.md. */
  | { readonly tipo: 'conferma' }
  /** «chiedimi sempre»: revoca l'autorizzazione. */
  | { readonly tipo: 'revoca' }
  /** Una cosa da far uscire verso le note. Serve a provare le autorizzazioni. */
  | { readonly tipo: 'salva-nota'; readonly testo: string }
  /** La risposta a «non ho capito quale»: scioglie il blocco e mette a fuoco. */
  | { readonly tipo: 'sciogli'; readonly task: string }
  /** «riassumimela»: nasce un task derivato che legge l'ingresso e ne scrive una riga.
   *  Il task che si riassume non si muove: il lavoro è un'altra cosa (docs/09-catene §2). */
  | { readonly tipo: 'riassumi'; readonly task: string }
  /** «leggila»: la porta a fuoco **e** la dice. Il richiamo da solo non parla. */
  | { readonly tipo: 'leggi'; readonly task: string }
  /** «torna a quella di prima»: il fuoco torna dov'era, e nient'altro si muove. */
  | { readonly tipo: 'indietro' }
  /** «scrivi a mia madre e chiedile…»: nasce un task di composizione, non una consegna.
   *  Finché non dici di mandarlo non esce niente (docs/09-catene §3).
   *
   *  `richiesta` è quello che hai chiesto, e non cambia mai: è l'ingresso del task, e
   *  da lì si riscrive. `testo` è il messaggio **già scritto**, e lo porta solo il
   *  AI engine vero: scrivere in discorso diretto è un suo mestiere, non del motore. Se
   *  manca, il testo lo mette `src/ai-engine/testi.ts` — che è finto, e si vede. */
  | {
      readonly tipo: 'componi';
      readonly a: string;
      readonly richiesta: string;
      readonly testo?: string;
    }
  /** «aggiungi una emoji del cuore»: cambia il testo di una composizione, non lo manda. */
  | { readonly tipo: 'aggiungi'; readonly task: string; readonly cosa: string }
  /** «riscrivilo»: la stessa richiesta, detta in un altro modo. */
  | { readonly tipo: 'riscrivi'; readonly task: string }
  /** «no»: hai risposto no a una domanda. Non si muove niente — ed è un esito. */
  | { readonly tipo: 'no' }
  /** «aprila»: la bolla si allarga e mostra quello che tiene, intorno si spegne.
   *  È una vista, non uno stato: non cambia luogo né avanzamento (docs/01-modello §7).
   *  Mostra e basta — dirlo ad alta voce è un'altra frase, «leggila». */
  | { readonly tipo: 'dentro'; readonly task: string }
  /** «mettila con Acme»: la mette nel gruppo, che nasce se non c'è (docs/01-modello §6).
   *  Un task sta al massimo in un gruppo: metterlo in un altro lo toglie dal primo. */
  | { readonly tipo: 'metti'; readonly task: string; readonly gruppo: string }
  /** «apri Acme»: espande il gruppo. È un momento, non una schermata. */
  | { readonly tipo: 'apri'; readonly gruppo: string }
  /** «separale»: il gruppo smette di esistere, i chip restano dov'erano.
   *  Si chiama così e non «sciogli» perché «sciogli» è già un blocco che si scioglie. */
  | { readonly tipo: 'separa'; readonly gruppo: string }
  /** «manda tutte»: l'unica frase che fa attraversare il confine a più cose insieme.
   *  Solo su un gruppo interamente `aspetta te`, e «no, aspetta» ritira tutto il lotto. */
  | { readonly tipo: 'consegna-gruppo'; readonly gruppo: string }
  /** «dopo», a gruppo aperto: rimanda tutti i membri. */
  | { readonly tipo: 'rimanda-gruppo'; readonly gruppo: string }
  /** «me ne occupo»: una notifica esce dal cassetto e **diventa un task**. È l'unico
   *  momento in cui una cosa arrivata entra nel modello, e lo decidi tu. */
  | { readonly tipo: 'estrai'; readonly notifica: string };

/**
 * Se aggiungi un comando e non lo metti in `COMANDI`, questa riga non compila. È il
 * solo modo perché «la grammatica resta chiusa» sia un fatto e non un'intenzione.
 */
type Scoperti = Exclude<Comando['tipo'], (typeof COMANDI)[number]>;
const _copertura: Scoperti extends never ? true : ['manca in COMANDI:', Scoperti] = true;
void _copertura;
