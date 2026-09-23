// L'orologio del sistema. Nell'app cammina col tempo vero; nei test sta fermo e si muove
// solo quando lo si fa saltare, così le scadenze — la Funzione Delay, i rimandati — si
// provano senza aspettare novanta secondi veri.

export interface Orologio {
  /** Millisecondi, sulla stessa scala di `Date.now()`. */
  adesso(): number;
}

export const orologioVero: Orologio = { adesso: () => Date.now() };

/** Un orologio fermo, per i test. */
export class OrologioFermo implements Orologio {
  constructor(private ms: number) {}

  adesso(): number {
    return this.ms;
  }

  salta(ms: number): void {
    this.ms += ms;
  }
}
