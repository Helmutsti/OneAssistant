// Il canale parallelo (docs/05-interfaccia §1). La voce non aggiunge niente al testo: legge
// esattamente quello che è già scritto sullo schermo.
//
// Qui non si sintetizza niente e non si decide quando parlare. Si fa una cosa sola:
// scegliere **quale bocca** parla, fra quelle di `bocca.ts`, e passare alla migliore
// appena è pronta senza che il sistema taccia nel frattempo.
//
// Quando parlare lo decide il turno (`turno.ts`): una cosa alla volta, mai sovrapposta,
// mai interrotta, e quello che arriva mentre parla si dice alla fine.

import { BoccaDiSistema, BoccaInLocale, type Bocca } from './bocca.ts';
import { Turno } from './turno.ts';
import type { Assistente } from '../conoscenza/profilo.ts';
import { legge } from '../conoscenza/canali.ts';

export class Lettura {
  /**
   * Se legge, adesso. **Non è un campo**: è una domanda a `canali.ts`, che è l'unico
   * posto dove quell'interruttore vive (17 settembre 2026). Prima era una copia, e una
   * copia vuol dire che premere l'indicatore in SYSTEMBAR e dire «non leggere» potevano
   * finire su due verità diverse.
   */
  get accesa(): boolean {
    return legge();
  }

  private readonly sistema = new BoccaDiSistema();
  private readonly locale = new BoccaInLocale();
  /** Quella che parla adesso. Comincia da quella che c'è già. */
  private bocca: Bocca = this.sistema;

  private readonly turno = new Turno(
    () => this.bocca,
    () => this.viaLibera(),
  );

  /** Chi altro fa rumore, e va aspettato prima di parlare. Lo mette il cablaggio. */
  private viaLibera: () => Promise<void> = () => Promise.resolve();

  /** Prima di aprire bocca aspetta questo: è il campanello che finisce di suonare. */
  aspetta(chi: () => Promise<void>): void {
    this.viaLibera = chi;
  }

  /** Come si chiama la bocca in uso. Per la pedana, non per lo schermo. */
  qualeVoce(): string {
    return this.bocca.come;
  }

  /** Se sta parlando adesso. */
  staParlando(): boolean {
    return this.turno.staParlando();
  }

  /** Chi si iscrive qui sa che ha smesso di parlare. */
  quandoTace(fn: () => void): void {
    this.turno.quandoTace(fn);
  }

  /**
   * Il profilo dice com'è fatta la voce, e accende il modello locale. Il caricamento è
   * in sottofondo: finché non finisce parla la sintesi di sistema.
   *
   * Il cambio di bocca non interrompe niente: quella che sta parlando finisce la sua
   * frase, e la nuova comincia dal turno dopo — il turno chiede la bocca ogni volta.
   */
  secondoIlProfilo(a: Assistente, lingua: string, avvisa?: (come: string) => void): void {
    // Non si scrive niente: il profilo è già il valore di partenza che `canali.ts`
    // legge da sé. Qui resta solo la scelta della bocca.
    void a.lettura;
    this.sistema.perLingua(lingua);
    this.sistema.perGenere(a.voce);
    this.locale.perGenere(a.voce);
    void this.locale.prepara().then((riuscito) => {
      if (!riuscito) return;
      this.bocca = this.locale;
      avvisa?.(this.bocca.come);
    });
  }

  leggi(testo: string): void {
    if (!this.accesa) return;
    this.turno.dici(testo);
  }

  /** «aspetta» ferma anche la voce, a metà parola (docs/08-voce §3): è l'unica cosa che
   *  la interrompe, e si porta via anche l'arretrato. */
  zittisci(): void {
    this.turno.svuota();
    this.sistema.zittisci();
    this.locale.zittisci();
  }
}
