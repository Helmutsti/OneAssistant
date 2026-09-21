// La bocca: chi legge ad alta voce. Due modi di farlo, una porta sola.
//
// docs/08-voce §3 dice che l'assistente è un personaggio, e che una voce neutra da
// sintesi non regge un personaggio. Ma dice anche che quello che la bocca legge è il
// contenuto delle tue cose, quindi mandarlo a un servizio è una promessa rotta.
//
// La via d'uscita è una sola: **un modello che gira qui dentro**. Costa un scaricamento
// la prima volta e poi parla da sé, senza rete e senza che esca niente.
//
//   di sistema   la sintesi del browser: c'è subito, ed è quello che è
//   in locale    un modello che gira dentro la pagina — la voce vera
//
// Il sistema parla **subito** con quella che c'è, e passa all'altra quando è pronta.
// Un assistente che sta zitto per due minuti mentre scarica un modello non è un
// assistente: è un programma che si installa.

import { Piper, VOCI, inWav } from './piper.ts';

export interface Bocca {
  /** Come si chiama, per la pedana. Non si mostra mai a schermo. */
  readonly come: string;
  /** Se può parlare adesso. */
  pronta(): boolean;
  /**
   * Dire una cosa, tutta. La promessa si scioglie **quando ha finito di suonare**, non
   * quando ha finito di partire: è su quella che `Lettura` tiene il turno di parola, e
   * una bocca che torna subito farebbe cominciare la cosa dopo sopra questa.
   *
   * E non interrompe mai quello che sta dicendo: chi chiama aspetta il suo turno.
   */
  dillo(testo: string): Promise<void>;
  /** «aspetta» taglia a metà parola (docs/08-voce §3). */
  zittisci(): void;
}

// ─── la sintesi del browser ────────────────────────────────────────────────

/**
 * Le voci di una lingua non sono tutte uguali: le neurali — quelle che si chiamano
 * *Natural*, *Online*, *Neural* — sono di un'altra generazione, e si riconoscono dal
 * nome. Prendere la prima dell'elenco significa prenderla a caso.
 */
function punteggio(v: SpeechSynthesisVoice, femminile: boolean, lingua = 'it-IT'): number {
  const n = v.name.toLowerCase();
  let p = 0;
  if (/natural|neural|online/.test(n)) p += 100;
  if (/google/.test(n)) p += 40;
  if (/elsa|isabella|federica|palmira|giuseppina/.test(n)) p += 20;
  if (v.lang.toLowerCase() === lingua.toLowerCase()) p += 10;
  if (v.localService) p += 5;
  const f = /elsa|isabella|federica|palmira|giuseppina|alice|sara|lucia/.test(n);
  if (femminile === f) p += 60;
  return p;
}

export class BoccaDiSistema implements Bocca {
  come = 'la sintesi del browser';

  private voce: SpeechSynthesisVoice | null = null;
  private femminile = true;
  /** Il codice della lingua del profilo. La voce si sceglie fra quelle che la parlano. */
  private lingua = 'it-IT';

  constructor() {
    if (!('speechSynthesis' in window)) return;
    this.scegli();
    // Le voci arrivano in ritardo, e su Chrome arrivano due volte.
    window.speechSynthesis.addEventListener('voiceschanged', () => this.scegli());
  }

  perGenere(voce?: string): void {
    this.femminile = voce !== 'maschile';
    this.scegli();
  }

  /** `language:` del profilo, già ridotto a codice (`it-IT`, `en-GB`). */
  perLingua(codice: string): void {
    this.lingua = codice;
    this.scegli();
  }

  private scegli(): void {
    if (!('speechSynthesis' in window)) return;
    const radice = this.lingua.split('-')[0]!;
    const possibili = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith(radice));
    if (possibili.length === 0) return;
    this.voce = possibili
      .slice()
      .sort((a, b) => punteggio(b, this.femminile, this.lingua) - punteggio(a, this.femminile, this.lingua))[0]!;
    this.come = this.voce.name;
  }

  pronta(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Legge a frasi, messe in coda tutte insieme: si attaccano una all'altra senza buchi,
   * e la promessa si scioglie quando l'ultima ha finito.
   *
   * **Non c'è più il `cancel()` in apertura.** Prima ogni risposta nuova tagliava a metà
   * parola quella in corso, che è esattamente la cosa da non fare: adesso a interrompere
   * è solo `zittisci`, cioè solo tu.
   */
  dillo(testo: string): Promise<void> {
    const frasi = this.pronta() ? inFrasi(testo) : [];
    if (frasi.length === 0) return Promise.resolve();

    return new Promise((finito) => {
      let rimaste = frasi.length;
      let chiuso = false;
      const chiudi = () => {
        if (chiuso) return;
        if (--rimaste > 0) return;
        chiuso = true;
        clearTimeout(rete);
        finito();
      };
      // Una rete: su alcuni browser `onend` non arriva se la scheda va in sottofondo, e
      // un turno che non finisce mai è una voce che non parla più. Meglio sbloccarsi
      // tardi che restare muti — il tempo è largo, non taglia niente.
      const parole = testo.split(/\s+/).length;
      const rete = setTimeout(() => {
        chiuso = true;
        finito();
      }, 5000 + parole * 900);

      for (const frase of frasi) {
        const u = new SpeechSynthesisUtterance(frase);
        u.lang = this.lingua;
        if (this.voce) u.voice = this.voce;
        // Un filo sopra il naturale: un assistente che strascica sembra lento a capire.
        u.rate = 1.04;
        u.onend = chiudi;
        u.onerror = chiudi;
        window.speechSynthesis.speak(u);
      }
    });
  }

  zittisci(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}

// ─── il modello in locale ──────────────────────────────────────────────────

export class BoccaInLocale implements Bocca {
  come = 'Piper · in locale';

  private readonly piper = new Piper();
  private suono?: HTMLAudioElement;
  private voce: string = VOCI.femminile;
  /** Cresce a ogni frase: serve a buttare via l'audio di una frase superata. */
  private giro = 0;

  perGenere(voce?: string): void {
    this.voce = voce === 'maschile' ? VOCI.maschile : VOCI.femminile;
    this.come = `Piper · ${this.voce.split('/').pop()}`;
  }

  /**
   * Il modello si scarica la prima volta e poi resta nella cache del browser. Fino ad
   * allora parla l'altra bocca: il sistema non tace mai aspettando.
   */
  async prepara(): Promise<boolean> {
    try {
      await this.piper.prepara(this.voce);
      return true;
    } catch (e) {
      // Niente rete, niente spazio, niente WASM: si resta sulla sintesi di sistema.
      console.warn('la voce in locale non si è caricata, resta la sintesi:', e);
      return false;
    }
  }

  pronta(): boolean {
    return this.piper.pronto();
  }

  /**
   * Una frase per volta, in fila, senza mai due suoni insieme. La prossima si **genera
   * mentre questa suona**: è quello che toglie il buco fra una frase e l'altra, e un
   * buco in mezzo a una risposta si sente come una frase spezzata.
   *
   * L'unica cosa che ferma il giro è `zittisci`, cioè «aspetta».
   */
  async dillo(testo: string): Promise<void> {
    const frasi = this.pronta() ? inFrasi(testo) : [];
    if (frasi.length === 0) return;
    const mio = ++this.giro;

    let prossima: Promise<{ campioni: Float32Array; frequenza: number }> | undefined =
      this.piper.genera(frasi[0]!);
    for (let i = 0; i < frasi.length; i++) {
      const inArrivo = prossima;
      if (!inArrivo) return;
      const { campioni, frequenza } = await inArrivo;
      // Mentre generava potresti aver detto «aspetta»: si lascia perdere tutto il resto.
      if (mio !== this.giro) return;
      const dopo = frasi[i + 1];
      prossima = dopo ? this.piper.genera(dopo) : undefined;
      // Una generazione che nessuno aspetterà non deve diventare un errore sospeso.
      prossima?.catch(() => undefined);
      await this.suona(inWav(campioni, frequenza), mio);
      if (mio !== this.giro) return;
    }
  }

  private suona(blob: Blob, mio: number): Promise<void> {
    // Il turno è già passato: non si comincia nemmeno, o sarebbero due voci insieme.
    if (mio !== this.giro) return Promise.resolve();
    return new Promise((finito) => {
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      this.suono = a;
      let chiuso = false;
      const chiudi = () => {
        if (chiuso) return;
        chiuso = true;
        URL.revokeObjectURL(url);
        finito();
      };
      a.onended = chiudi;
      a.onerror = chiudi;
      // `pause` è il caso di «aspetta»: zittisci mette in pausa e basta, e senza questa
      // riga la promessa non si scioglierebbe mai — cioè il turno di parola resterebbe
      // occupato per sempre e la voce non parlerebbe più (docs/08-voce §3.1).
      a.onpause = chiudi;
      void a.play().catch(chiudi);
      if (mio !== this.giro) {
        a.pause();
        chiudi();
      }
    });
  }

  zittisci(): void {
    this.giro++;
    this.suono?.pause();
    this.suono = undefined;
  }
}

/**
 * Spezza in frasi. Non per poter smettere in mezzo — quello non si fa più — ma perché
 * una frase è l'unità che la bocca sa dire bene: si genera prima, e si attacca alla
 * prossima senza buchi. Il testo esce intero comunque: è l'ordine, non un taglio.
 */
function inFrasi(testo: string): string[] {
  return testo
    .split(/(?<=[.!?…])\s+/)
    .map((f) => f.trim())
    .filter(Boolean);
}
