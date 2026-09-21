// Il contratto di docs/06-confini §1. Ogni servizio, vero o finto, fa tre cose e non una
// di più. Un servizio finto è finto *oltre* il confine: da dentro è indistinguibile.

import type { Tipo, Uscita, Destinazione } from '../modello/tipi.ts';

/** Ciò che un servizio annuncia. NON è un task: lo diventa solo se supera il filtro. */
export interface Proposta {
  readonly tipo: Tipo;
  /** Come lo diresti. Due parole. */
  readonly nome: string;
  /** La riga che si leggerà. Dev'essere dicibile ad alta voce. */
  readonly testo: string;
  readonly fonte: string;
  /** Ti nomina, risponde a te, o riguarda un tuo progetto. */
  readonly perTe: boolean;
  /** Esiste una frase sensata da offrirti? Se no, è una cosa da sapere, non un task. */
  readonly azionabile: boolean;
  /** Se ha una scadenza, quale. */
  readonly ora?: Date;
  /**
   * Il testo per intero, quando ce n'è uno più lungo della riga che si legge. Non si
   * mostra e non si dice: è quello che l'AI engine apre quando gli chiedi un riassunto.
   */
  readonly ingresso?: string;
  /** Quello che il task avrà già prodotto, quando la sorgente lo porta con sé. */
  readonly esito?: string;
  /** Cosa uscirebbe, se decidessi di farla uscire. */
  readonly uscita?: Uscita;
}

export interface Servizio {
  readonly nome: string;
  /** Il servizio annuncia che è successo qualcosa. Non crea task. */
  osserva(annuncia: (p: Proposta) => void): void;
  /**
   * Accetta qualcosa e la fa uscire. L'unico verbo irreversibile.
   *
   * `u` dice **dove** e **a chi**; `cosa` è quello che esce, e viene dall'`esito` del
   * task — l'uscita non lo possiede (docs/01-modello §1).
   */
  consegna(u: Uscita, cosa: string): Promise<void>;
  /** Cosa possiede, per le domande del motore. */
  leggi(): readonly string[];
}

/**
 * Un servizio che sa **far arrivare** qualcosa, non solo consegnare. Sono tre — posta,
 * calendario, promemoria — e ognuno ha uno scenario scritto, che è il giro di prova di
 * `docs/09-catene §1`.
 *
 * `inventa` è la porta per quello che lo scenario non prevede: la pedana compone una
 * proposta al momento e il servizio la annuncia **dalla stessa uscita** delle altre. Il
 * filtro non può accorgersi della differenza, ed è tutto il punto — se una proposta
 * inventata entrasse da un'altra parte, quello che si prova non sarebbe il sistema
 * (CLAUDE.md: *una sorgente finta deve produrre gli stessi eventi di quella vera*).
 */
export interface Sorgente extends Servizio {
  /** I nomi dello scenario scritto. La pedana li mostra e li fa arrivare a mano. */
  cosaPuoArrivare(): readonly string[];
  /** Far arrivare una cosa dello scenario, per nome. */
  fai(nome: string): void;
  /** Far arrivare una cosa che nessuno aveva scritto prima. */
  inventa(p: Proposta): void;
}

/** Un servizio finto sa fallire su richiesta, altrimenti `bloccato` non scatta mai. */
export class ConsegnaFallita extends Error {
  constructor(public readonly perche: string) {
    super(perche);
    this.name = 'ConsegnaFallita';
  }
}

export type Registro = Partial<Record<Destinazione, Servizio>>;
