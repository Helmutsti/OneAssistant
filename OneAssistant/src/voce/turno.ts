// Il turno di parola (docs/08-voce §3.1).
//
// Una bocca sola, una cosa alla volta, e nessuna frase spezzata. Tre regole, e la terza
// è quella che cambia il carattere della cosa:
//
//   **non si sovrappone.** Finché sta dicendo una cosa non ne comincia un'altra. Mai due
//   voci insieme, nemmeno per mezza sillaba;
//
//   **non si interrompe.** Quello che ha cominciato a dire lo finisce. L'unica cosa che
//   la zittisce a metà parola sei tu, con «aspetta»: una voce che si taglia da sola a
//   ogni notizia nuova non è un assistente, è una radio rotta;
//
//   **quello che arriva mentre parla si mette da parte**, e si dice alla fine, in una
//   volta sola. Tre risposte in fila diventano una cosa detta, non tre.
//
// Il costo, dichiarato: una risposta può arrivare all'orecchio qualche secondo dopo che
// è arrivata allo schermo. È il verso giusto — **lo schermo è immediato, la voce è
// ordinata** — ed è il motivo per cui sono due canali paralleli e non uno solo.

import type { Bocca } from './bocca.ts';

export class Turno {
  private parlando = false;
  /** Quello che è arrivato mentre parlava, e che dirà quando ha finito. */
  private readonly daParte: string[] = [];

  /** Chi vuole sapere quando ha finito di parlare, e non resta arretrato. */
  private readonly zitto: Array<() => void> = [];

  /**
   * `bocca` si chiede ogni volta: può cambiare fra un turno e l'altro.
   * `viaLibera` è l'altro verso della regola — si aspetta che abbia finito di suonare
   * **chi suona per conto suo**, cioè il campanello, prima di aprire bocca.
   */
  constructor(
    private readonly bocca: () => Bocca,
    private readonly viaLibera: () => Promise<void> = () => Promise.resolve(),
  ) {}

  /**
   * Chi si iscrive qui sa che adesso c'è silenzio. Serve a chi fa rumore per conto suo
   * — il campanello — per non suonarle sopra (docs/08-voce §6).
   */
  quandoTace(fn: () => void): void {
    this.zitto.push(fn);
  }

  staParlando(): boolean {
    return this.parlando;
  }

  /** Quante cose aspettano il loro turno. Per la pedana, non per lo schermo. */
  quanteDaParte(): number {
    return this.daParte.length;
  }

  /**
   * Una cosa da dire. Se sta già parlando non parte: aspetta. Non torna mai una
   * promessa — chi risponde non aspetta la voce (docs/05-interfaccia §1).
   */
  dici(testo: string): void {
    if (!testo.trim()) return;
    if (this.parlando) {
      this.daParte.push(testo);
      return;
    }
    void this.giro(testo);
  }

  /**
   * Dice la sua cosa fino in fondo, poi guarda cosa si è accumulato e lo dice in una
   * volta sola. E ricomincia, finché non resta niente da parte.
   */
  private async giro(primo: string): Promise<void> {
    this.parlando = true;
    try {
      let adesso = primo;
      while (adesso) {
        await this.viaLibera();
        await this.bocca().dillo(adesso);
        adesso = riepiloga(this.daParte.splice(0, this.daParte.length));
      }
    } catch (e) {
      // Una bocca che si rompe non deve zittire quella dopo.
      console.warn('la voce si è fermata:', e);
      this.daParte.length = 0;
    } finally {
      this.parlando = false;
      for (const f of this.zitto) f();
    }
  }

  /**
   * «Aspetta». Con l'arretrato: se hai detto di fermarti non vuoi sentire nemmeno quello
   * che aspettava il turno. Zittire le bocche tocca a chi le tiene.
   */
  svuota(): void {
    this.daParte.length = 0;
  }
}

/**
 * Quello che si è accumulato mentre parlava, detto in una volta sola.
 *
 * La regola non inventa una parola: **si tiene l'ultima**, perché in una catena è
 * l'ultima quella vera — «Aggiunto», «Mando a mamma», «Mandata a Carla Moretti» sono tre
 * righe di uno stesso fatto, e quello che conta sentire è la terza.
 *
 * L'unica che non si butta è **una domanda rimasta senza risposta**: è l'unica cosa che
 * chiede qualcosa a te. Va in fondo, perché una domanda si aspetta alla fine.
 */
export function riepiloga(pezzi: readonly string[]): string {
  const puliti = pezzi.map((p) => p.trim()).filter(Boolean);
  if (puliti.length <= 1) return puliti[0] ?? '';

  const ultima = puliti[puliti.length - 1]!;
  if (ultima.endsWith('?')) return ultima;

  const domanda = puliti.slice(0, -1).reverse().find((p) => p.endsWith('?'));
  return domanda ? `${ultima} ${domanda}` : ultima;
}
