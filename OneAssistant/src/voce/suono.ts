// Il campanello: l'unico suono che il sistema fa da sé.
//
// La voce legge quello che c'è scritto (docs/05-interfaccia §1); il campanello non dice
// niente — avvisa che **è arrivato qualcosa**. Serve perché il layer copre lo schermo
// intero e una cosa che compare in silenzio in un angolo non la vedi finché non guardi.
//
// Suona in un punto solo: quando una proposta ha passato il filtro ed è diventata
// qualcosa (docs/06-confini §3). Se il filtro dice «niente», non si sente niente — è
// tutto il senso del filtro: le cose che non ti riguardano non ti interrompono.
//
// Il volume è quello della macchina (`ambiente/impostazioni.txt`, VOLUME: 40%), non
// un numero nostro: WHO lo dichiara a schermo, e sarebbe strano che il sistema lo ignorasse. E
// anche **quale** suono è una riga del profilo: si cambia il file, si ricarica, e si
// sente com'è — un campanello si sceglie ascoltandolo, non leggendone il nome.

const PREDEFINITO = '/media/suoni/notifica.mp3';

/** Sotto questo tempo due arrivi sono un campanello solo: due din-don sovrapposti non
 *  dicono «due cose», dicono «qualcosa non va». */
const RAVVICINATI = 900;

export class Campanello {
  acceso = true;

  private volume = 0.4;
  private modello = new Audio(PREDEFINITO);
  /** Se la voce sta parlando adesso. Il campanello non le suona mai sopra. */
  private laVoceParla: () => boolean = () => false;
  /** Un arrivo che ha trovato la voce occupata, e aspetta il silenzio. */
  private appeso = false;
  private ultimo = -Infinity;
  /** Finché questa non si scioglie, sta suonando. */
  private inCorso: Promise<void> = Promise.resolve();

  constructor() {
    this.modello.preload = 'auto';
  }

  /** Il volume della macchina, da 0 a 100. */
  perVolume(percento: number): void {
    this.volume = Math.max(0, Math.min(100, percento)) / 100;
  }

  /**
   * Il campanello come lo vuole il profilo: quale suono, e se suonare.
   * `silent` vuol dire spento davvero — non c'è un mezzo campanello.
   */
  secondoIlProfilo(n: { modo: 'sound' | 'silent'; suono?: string }): void {
    this.acceso = n.modo === 'sound';
    const file = n.suono ?? PREDEFINITO;
    if (file === this.modello.getAttribute('src')) return;
    this.modello = new Audio(file);
    this.modello.preload = 'auto';
  }

  /** Il campanello deve sapere quando la voce parla, per tacere (docs/08-voce §6). */
  seguiLaVoce(parla: () => boolean): void {
    this.laVoceParla = parla;
  }

  /**
   * Quando avrà finito di suonare. Vale anche il verso opposto della regola: **non si
   * comincia a parlare sopra un din-don**. Il campanello dura meno di un secondo, quindi
   * quello che costa è un'attesa che non si sente.
   */
  finitoDiSuonare(): Promise<void> {
    return this.inCorso;
  }

  /**
   * È arrivato qualcosa. Se lei sta parlando **non suona**: resta appeso, e si sente
   * appena c'è silenzio. Lo schermo ha già fatto il suo lavoro — la cosa è lì da
   * quando è arrivata — e un campanello in mezzo a una frase la spezza in due.
   */
  suona(): void {
    if (!this.acceso || this.volume === 0) return;
    if (this.laVoceParla()) {
      this.appeso = true;
      return;
    }
    this.tocca();
  }

  /** C'è silenzio. Se qualcosa era arrivato mentre parlava, adesso si sente: **uno**,
   *  non uno per arrivo. */
  appenaTace(): void {
    if (!this.appeso) return;
    this.appeso = false;
    this.tocca();
  }

  private tocca(): void {
    const adesso = performance.now();
    if (adesso - this.ultimo < RAVVICINATI) return;
    this.ultimo = adesso;
    const s = this.modello.cloneNode() as HTMLAudioElement;
    s.volume = this.volume;
    this.inCorso = new Promise<void>((finito) => {
      // Una rete: se l'audio non parte o non finisce, nessuno resta in attesa di lui.
      const rete = setTimeout(finito, 2500);
      const chiudi = () => {
        clearTimeout(rete);
        finito();
      };
      s.addEventListener('ended', chiudi, { once: true });
      s.addEventListener('error', chiudi, { once: true });
      // Prima che tu abbia toccato qualcosa il browser non lascia suonare niente, e
      // rifiuta la promessa. Non è un errore: è la pagina appena aperta.
      void s.play().catch(chiudi);
    });
  }
}
