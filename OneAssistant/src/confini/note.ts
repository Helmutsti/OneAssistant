// Le note di docs/06-confini §2: **non osservano** — nessuno ti scrive per dirti che una
// nota è cambiata — e sono quasi solo una destinazione. Servono anche a provare le
// autorizzazioni (§6): sono la consegna più innocua che c'è, quindi la prima che ha senso
// lasciar fare da sola.
//
// Finto oltre il confine, come tutti: ricorda le consegne, e sa fallire.

import { ConsegnaFallita, type Proposta, type Servizio } from './servizio.ts';
import type { Uscita } from '../modello/tipi.ts';

export class Note implements Servizio {
  readonly nome = 'note';
  private readonly scritte: string[] = [];
  guasto = false;

  /** Non osserva: il metodo c'è perché il contratto è di tre verbi, e non annuncia mai. */
  osserva(_annuncia: (p: Proposta) => void): void {}

  async consegna(_u: Uscita, cosa: string): Promise<void> {
    if (this.guasto) throw new ConsegnaFallita('il blocco note non risponde');
    this.scritte.push(cosa);
  }

  /** Una nota scritta dev'essere lì la volta dopo, o il confine è uno specchio. */
  leggi(): readonly string[] {
    return this.scritte;
  }
}
