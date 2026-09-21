// La scia di un task. **Non fa parte del design** e non è modello: è memoria del banco.
//
// Il modello tiene solo *dove sta adesso* — luogo e avanzamento — più `precedente`, che
// è un passo solo e serve a «no, aspetta». Giusto così: un task è una posizione, non un
// diario, e tenersi la storia dentro il modello sarebbe un archivio parallelo a quello
// vero (docs/07-memoria).
//
// Ma provare la lingua vuol dire guardare una cosa muoversi: dici «manda» e quella passa
// da `CARTA · aspetta te` a `CHIP · in corso`, e novanta secondi dopo cade in memoria
// da sola. Senza scia si vede solo l'ultimo fotogramma, e chi guarda deve ricostruire
// il resto a mente.
//
// Come lo sa: sta a guardare, e basta. Si attacca al motore come un osservatore
// qualunque, e a ogni cambiamento confronta ogni task con l'ultima cella in cui l'aveva
// visto. Non chiede niente al modello e il modello non sa che esiste.
//
// Perché si è mosso: se dall'ultimo giro è entrata un'intesa nuova, è stata quella
// frase; se no, si è mosso **il mondo** — una consegna che è tornata, una scadenza che
// è scattata, una mail arrivata. È una distinzione che vale la pena leggere a colpo
// d'occhio, perché è la stessa di `flussi.ts`: quello che dici tu e quello che succede.

import type { Motore } from '../modello/motore.ts';
import type { Orologio } from '../modello/tempo.ts';
import type { Avanzamento, Luogo } from '../modello/tipi.ts';

/** Una cella in cui il task è stato, e come ci è arrivato. */
export interface Passaggio {
  readonly luogo: Luogo;
  readonly avanzamento: Avanzamento;
  /** Il comando che ce l'ha portato, oppure «il mondo». */
  readonly perche: string;
  /** In tempo simulato: è l'ora che si vede in WHEN. */
  readonly quando: Date;
}

export class Scia {
  private readonly passi = new Map<string, Passaggio[]>();
  private readonly nomi = new Map<string, string>();
  /** L'ultimo che si è mosso: quando niente è a fuoco, è lui quello da guardare. */
  private mosso?: string;
  /** Quante mosse aveva visto l'ultima volta: di più vuol dire che l'hai detto tu. */
  private viste = 0;

  constructor(
    private readonly m: Motore,
    private readonly o: Orologio,
  ) {
    m.ascolta(() => this.guarda());
  }

  private guarda(): void {
    const quante = this.m.mosse.length;
    // Una frase sola muove anche più task — «manda tutte» ne muove tre — e la causa è
    // quella per tutti: si legge una volta e si attribuisce a tutto il giro.
    //
    // La causa è l'ultima mossa che si è **tradotta in un comando**: `guarda`, `ricorda`
    // e `parla` passano dal registro come tutte le altre, ma non hanno mosso niente, e
    // dire che un task si è spostato perché l'AI engine ha parlato sarebbe una bugia.
    const nuova = quante > this.viste;
    const ultima = [...this.m.mosse].reverse().find((x) => x.comando !== undefined);
    const perche = nuova ? (ultima?.comando ?? 'il mondo') : 'il mondo';
    this.viste = quante;

    for (const t of this.m.task) {
      const suoi = this.passi.get(t.id) ?? [];
      const ultimo = suoi[suoi.length - 1];
      if (ultimo && ultimo.luogo === t.luogo && ultimo.avanzamento === t.avanzamento) continue;
      suoi.push({
        luogo: t.luogo,
        avanzamento: t.avanzamento,
        // La prima cella non è un movimento: è dove è nato. Non l'ha mossa nessuno.
        perche: ultimo ? perche : 'nasce',
        quando: this.o.adesso(),
      });
      this.passi.set(t.id, suoi);
      this.nomi.set(t.id, t.nome);
      this.mosso = t.id;
    }
  }

  /** Il task da guardare: quello a fuoco, o — se non c'è niente a fuoco — l'ultimo che si è mosso. */
  daGuardare(): string | undefined {
    return this.m.aFuoco()?.id ?? this.mosso;
  }

  nome(id: string): string {
    return this.nomi.get(id) ?? id;
  }

  di(id: string): readonly Passaggio[] {
    return this.passi.get(id) ?? [];
  }

  /** Si svuota col mondo: la scia di un task che non c'è più non è la storia di niente. */
  azzera(): void {
    this.passi.clear();
    this.nomi.clear();
    this.mosso = undefined;
    this.viste = this.m.mosse.length;
  }
}
