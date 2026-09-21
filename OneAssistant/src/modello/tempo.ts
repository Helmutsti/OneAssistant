// L'orologio del sistema. **Cammina o sta fermo, e lo decide chi lo costruisce.**
//
// Il tempo fa scattare delle transizioni (docs/01-modello §3) e per provarle bisogna
// poterci arrivare — ma non mentre guardi da un'altra parte. Per questo esiste un
// orologio che sta fermo: gli si dà un'ora di partenza e si muove solo quando lo
// sposti tu, dalla pedana. È quello che usano `npm run scenario` e i flussi.
//
// **Ma l'app vera non è un banco** (17 settembre 2026). Con l'ora di partenza inchiodata
// lo schermo diceva sempre «09:41», e un layer che sta fra te e il sistema operativo con
// un'ora falsa non è un prototipo: è una bugia sullo schermo più grande che c'è. Senza
// ora di partenza l'orologio parte da adesso e cammina col tempo vero.
//
// I due modi non sono due classi perché la differenza è una sola riga di aritmetica, e
// tutto il resto — le scadenze, i salti, il conto dei millisecondi — vale identico per
// entrambi. **Anche un orologio che cammina si può far saltare**: il salto si somma al
// tempo vero, così la pedana funziona anche nell'app.
//
// Le scadenze registrate con `fra` scattano quando il tempo le supera: quando salti, o
// quando qualcuno chiama `batti()` — perché un orologio che cammina non si accorge da
// sé di essere passato, e non deve tenersi un timer suo (quello è mestiere di main).

export const MINUTO = 60_000;
export const SECONDO = 1_000;

interface Scadenza {
  readonly id: number;
  readonly quando: number;
  readonly fn: () => void;
}

export class Orologio {
  private readonly partenza: Date;
  /** Se il tempo vero conta. Senza ora di partenza sì, con un'ora di partenza no. */
  private readonly cammina: boolean;
  /** Solo il tempo che hai fatto passare a mano. Si somma a quello vero, se c'è. */
  private trascorsi = 0;
  private scadenze: Scadenza[] = [];
  private prossimoId = 1;

  /**
   * Senza argomenti: parte da adesso e cammina — è l'app. Con un'ora: parte da lì e
   * sta fermo — è il banco, dove il tempo è una cosa che si preme.
   */
  constructor(partenza?: Date) {
    this.cammina = partenza === undefined;
    this.partenza = partenza ?? new Date();
  }

  adesso(): Date {
    return new Date(this.partenza.getTime() + this.ms);
  }

  /**
   * Millisecondi dall'ora di partenza: quelli veri più quelli saltati. **Tutto quello
   * che conta il tempo passa da qui**, così i due modi non possono divergere.
   */
  get ms(): number {
    return this.trascorsi + (this.cammina ? Date.now() - this.partenza.getTime() : 0);
  }

  /** Far passare del tempo a mano. Su un orologio fermo è l'unico modo che ha. */
  salta(ms: number): void {
    this.trascorsi += ms;
    this.scuoti();
  }

  /**
   * Guardare se il tempo vero ha superato qualche scadenza. Su un orologio fermo non fa
   * niente. Lo chiama chi ha un battito — `main.ts` — perché un orologio non deve
   * sapere che esiste un browser.
   */
  batti(): void {
    if (this.cammina) this.scuoti();
  }

  /** Esegue fn quando saranno passati `ms`. Torna l'id per annullarla. */
  fra(ms: number, fn: () => void): number {
    const id = this.prossimoId++;
    this.scadenze.push({ id, quando: this.ms + ms, fn });
    return id;
  }

  annulla(id: number): void {
    this.scadenze = this.scadenze.filter((s) => s.id !== id);
  }

  /** Quanto manca alla prossima scadenza, per dirlo sulla pedana. */
  prossima(): number | undefined {
    if (this.scadenze.length === 0) return undefined;
    return Math.min(...this.scadenze.map((s) => s.quando)) - this.ms;
  }

  private scuoti(): void {
    const ora = this.ms;
    const mature = this.scadenze.filter((s) => s.quando <= ora);
    if (mature.length === 0) return;
    this.scadenze = this.scadenze.filter((s) => s.quando > ora);
    for (const s of mature) s.fn();
  }
}
