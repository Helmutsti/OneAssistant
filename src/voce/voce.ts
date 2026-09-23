// La lettura ad alta voce delle risposte (`docs/L04`: Piper e Serena HIGH; `docs/L03`:
// `reading: on | off`). La voce legge esattamente quello che è scritto in INPUT: il testo
// a schermo è la verità, la voce ne è la lettura. Una cosa alla volta, in ordine, e la
// prossima frase si prepara mentre questa suona.

import { Piper, VOCI, inWav } from './piper.ts';

/** In frasi, perché la prima si sente prima che l'ultima sia pronta. */
function inFrasi(testo: string): string[] {
  return (testo.match(/[^.!?…]+[.!?…]*/g) ?? []).map((f) => f.trim()).filter(Boolean);
}

export class Voce {
  private readonly piper = new Piper();
  private pronta?: Promise<boolean>;
  private fila: Promise<void> = Promise.resolve();
  private suono?: HTMLAudioElement;
  private giro = 0;

  constructor(
    private readonly voce: 'femminile' | 'maschile',
    private readonly volume: () => number,
    private readonly accesa: () => boolean,
    private readonly guasto: (testo: string | undefined) => void,
  ) {}

  /** Il modello si scarica la prima volta. Se non si carica, lo si dice, e la voce tace. */
  private prepara(): Promise<boolean> {
    this.pronta ??= this.piper.prepara(VOCI[this.voce]).then(
      () => true,
      (e: unknown) => {
        console.warn('[voce] Piper non si è caricata:', e);
        this.guasto('La voce non si è caricata: le risposte restano scritte.');
        return false;
      },
    );
    return this.pronta;
  }

  /** Legge una risposta, dopo quelle già in fila. */
  di(testo: string): void {
    if (!this.accesa()) return;
    const giro = this.giro;
    this.fila = this.fila.then(async () => {
      if (giro !== this.giro || !(await this.prepara())) return;
      const frasi = inFrasi(testo);
      let prossima = frasi.length ? this.piper.genera(frasi[0]!) : undefined;
      for (let i = 0; i < frasi.length && prossima; i++) {
        const audio = await prossima;
        prossima = i + 1 < frasi.length ? this.piper.genera(frasi[i + 1]!) : undefined;
        if (giro !== this.giro || !this.accesa()) return;
        await this.suona(inWav(audio.campioni, audio.frequenza));
      }
    }).catch((e: unknown) => console.warn('[voce]', e));
  }

  /** Si spegne adesso: quello che stava dicendo si interrompe, quello in fila non parte. */
  zitta(): void {
    this.giro++;
    this.suono?.pause();
  }

  private suona(wav: Blob): Promise<void> {
    return new Promise((fine) => {
      const url = URL.createObjectURL(wav);
      const a = new Audio(url);
      a.volume = Math.max(0, Math.min(1, this.volume()));
      this.suono = a;
      const chiudi = () => {
        URL.revokeObjectURL(url);
        fine();
      };
      a.onended = chiudi;
      a.onerror = chiudi;
      a.onpause = chiudi;
      void a.play().catch(chiudi);
    });
  }
}
