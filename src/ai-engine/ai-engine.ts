// Il confine verso il pensiero, e il giro di un turno.
//
// Dietro questo file c'è un modello — vero, dietro `/ai-engine`, o finto, qui accanto — e
// davanti c'è sempre la stessa cosa: una frase entra, delle chiamate escono, e le
// chiamate passano dal motore. L'AI engine **non ha** il motore: ha gli strumenti, e li
// chiede. È tutta la differenza fra un sistema che si può guardare e uno che non si sa
// più cosa stia facendo.
//
// Il giro sta qui e non nel server per una ragione sola, e non è comodità: lo stato è
// nel browser. Se il giro fosse di là, ogni mossa dovrebbe portarsi dietro lo schermo
// intero e riportarlo indietro. Così invece il server fa **un passo alla volta** — la
// chiave resta di là, la scrivania resta di qua — e chi guida è questo file.

import type { Motore, Scambio } from '../modello/motore.ts';
import type { Orologio } from '../modello/tempo.ts';
import { contesto, soloTu } from '../conoscenza/contesto.ts';
import { utenteInCorso } from '../conoscenza/profilo.ts';
import { chiama, type Esito } from './api.ts';
import { MOSSE_PRINCIPALI, type Chiamata } from './strumenti.ts';

/** Una mossa già fatta in questo turno, e cosa ha risposto. È la memoria del turno. */
export interface Passato {
  readonly chiamata: Chiamata;
  readonly esito: Esito;
}

export interface Dialogo {
  /** Quello che ha detto o scritto. Come l'ha detto: non si ripulisce. */
  readonly frase: string;
  readonly passato: readonly Passato[];
  /**
   * Quello che vi eravate già detti, nella giornata di lavoro (`Motore.memoria`). È la
   * parte che cresce, e sta **dopo** il prefisso cacheato: crescere non costa il prompt
   * intero (docs/03-architettura §2).
   *
   * Non contiene lo schermo, e non deve: quello si rilegge con `guarda` ogni volta.
   * Ricordare la conversazione non è ricordare lo schermo.
   */
  readonly prima: readonly Scambio[];
}

/**
 * Il pensiero, da qualunque parte arrivi. Un passo: dato quello che è già stato fatto,
 * cosa si fa adesso. Niente chiamate vuol dire che il turno è finito.
 */
export interface AiEngine {
  readonly nome: string;
  passo(d: Dialogo): readonly Chiamata[] | Promise<readonly Chiamata[]>;
}

/**
 * Quanti passi al massimo. Non è una protezione dal modello: è una protezione dallo
 * schermo. Oltre una decina di mosse in un turno lo schermo ha smesso di essere una
 * conseguenza di quello che hai detto, e diventa un film che guardi.
 */
const PASSI = 10;

/** Il turno, in una riga: la frase entra da qui e da nessun'altra parte. */
/**
 * **Quanti turni sono in volo.** Un contatore e non un sì/no: due frasi possono
 * accavallarsi — ne dici una mentre la prima non ha ancora finito — e con un booleano
 * la prima che finisce spegnerebbe il segno mentre la seconda sta ancora pensando.
 */
let inVolo = 0;
let avvisa: (() => void) | undefined;

/**
 * Se l'AI engine sta pensando, adesso. Lo chiede INPUT per mostrare il segno d'attesa.
 *
 * Perché sta qui e non in `main.ts`: `turno()` è **la porta unica** da cui passa una
 * frase, quindi è l'unico posto che non può dimenticarsi di alzare e abbassare il
 * segno. Un flag tenuto da chi chiama è un flag che un giorno resta acceso.
 */
export function staPensando(): boolean {
  return inVolo > 0;
}

/** Chi ridisegnare quando il segno cambia. Uno solo: lo schermo. */
export function quandoPensa(fn: () => void): void {
  avvisa = fn;
}

export async function turno(g: AiEngine, frase: string, m: Motore, o: Orologio): Promise<void> {
  if (!apri(frase, m)) return;
  inVolo++;
  avvisa?.();
  try {
    const passato: Passato[] = [];
    for (let i = 0; i < PASSI; i++) {
      const chiamate = await g.passo({ frase, passato, prima: m.memoria() });
      if (!chiamate.length) return;
      if (esegui(chiamate, m, o, passato)) return;
    }
  } finally {
    // `finally` e non la fine del blocco: se un passo tira un'eccezione, il segno
    // **deve** spegnersi comunque — altrimenti un errore lascia lo schermo a girare
    // per sempre, che è il modo peggiore di dire che qualcosa è andato male.
    inVolo--;
    avvisa?.();
  }
}

/**
 * Lo stesso turno, senza aspettare. Serve all'AI engine finto — che gira qui, in questa
 * macchina, dentro questo processo — e alle casistiche, che vogliono leggere lo stato
 * alla riga dopo invece che in una promessa (src/prova/scenario.ts).
 */
export function turnoSubito(g: AiEngineSincrono, frase: string, m: Motore, o: Orologio): void {
  if (!apri(frase, m)) return;
  const passato: Passato[] = [];
  for (let i = 0; i < PASSI; i++) {
    const chiamate = g.passo({ frase, passato, prima: m.memoria() });
    if (!chiamate.length) return;
    if (esegui(chiamate, m, o, passato)) return;
  }
}

/** Un AI engine che risponde senza rete. Il finto lo è; quello vero non può esserlo. */
export interface AiEngineSincrono extends AiEngine {
  passo(d: Dialogo): readonly Chiamata[];
}

/**
 * La porta d'ingresso della frase. Torna `false` quando il turno non si apre affatto:
 * **l'input è riservato a chi ha la sessione** (docs/07-memoria §2). Nessuna voce
 * che non sia la sua muove un task — al massimo lascia detto, e l'AI engine non ci entra.
 */
function apri(frase: string, m: Motore): boolean {
  m.haiDetto(frase);
  if (soloTu(contesto)) return true;
  m.lasciaDetto(frase);
  return false;
}

/** Esegue le mosse in fila. Torna `true` quando il turno è finito. */
function esegui(
  chiamate: readonly Chiamata[],
  m: Motore,
  o: Orologio,
  passato: Passato[],
): boolean {
  for (const c of chiamate) {
    // Il permesso del principale, esplicito: prima era «nessun elenco, quindi tutte»,
    // e fra le tutte c'era `riporta`, che è dei secondari (src/ai-engine/strumenti.ts).
    const esito = chiama(c, m, o, MOSSE_PRINCIPALI);
    passato.push({ chiamata: c, esito });
    // Il registro della pedana: si studia, non si mostra (docs/03-architettura §5).
    m.segna(c, esito.visto, esito.sbagliata === true, esito.comando);
    // `parla` chiude il turno. Una bocca sola vuol dire anche una volta sola: quello
    // che viene dopo una risposta è un secondo turno, e lo apre lui.
    if (c.nome === 'parla' && !esito.sbagliata) return true;
  }
  return false;
}

/**
 * L'AI engine vero, dietro `/ai-engine`. Un passo per chiamata: gli si manda la frase e
 * quello che è già stato fatto, e torna cosa fare adesso.
 *
 * Quando la porta dice che non c'è la chiave — 503, e lo dice chiaro — si ripiega sul
 * finto **e si vede**: una riga in console, e il nome cambia. Non si finge mai di
 * pensare (docs/03-architettura §2).
 */
export class Porta implements AiEngine {
  nome = 'AI engine';
  /**
   * Quale elenco la porta deve dichiarare al modello. Un secondario che si sentisse
   * dichiarare `consegna` la chiamerebbe, e `api.ts` gliela negherebbe — un passo
   * buttato e un errore che non doveva esistere. Il permesso si dichiara **prima**.
   */
  private readonly chi: 'principale' | 'secondario';
  /**
   * Caduto **per sempre**: solo quando la porta dice che la chiave non c'è. Prima
   * qualunque errore lo metteva a `true`, quindi un blip di rete buttava tutta la
   * sessione sul finto senza modo di tornare — e senza che si capisse perché.
   */
  private senzaChiave = false;
  /** Quante volte di fila non ha risposto. Tre, e si smette di insistere. */
  private storti = 0;

  constructor(
    private readonly ripiego: AiEngineSincrono,
    chi: 'principale' | 'secondario' = 'principale',
  ) {
    this.chi = chi;
  }

  async passo(d: Dialogo): Promise<readonly Chiamata[]> {
    if (this.senzaChiave || this.storti >= 3) return this.ripiego.passo(d);
    try {
      const r = await fetch('/ai-engine', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          frase: d.frase,
          // Il *nome* del profilo, non il copione: il file lo legge il server, o il
          // `system` del modello arriverebbe dal browser (vite.config.ts · ilPrompt).
          profilo: utenteInCorso(),
          chi: this.chi,
          prima: d.prima.map((g) => ({ tua: g.tua, risposta: g.risposta })),
          passato: d.passato.map((p) => ({
            nome: p.chiamata.nome,
            argomenti: p.chiamata.argomenti,
            visto: p.esito.visto,
            sbagliata: p.esito.sbagliata === true,
          })),
        }),
      });
      // 503 è l'unica risposta che vale per sempre: la chiave non c'è, e non comparirà
      // da sola. Tutto il resto è un inciampo, e a un inciampo si riprova.
      if (r.status === 503) {
        this.senzaChiave = true;
        this.nome = 'AI engine finto';
        console.warn('[ai-engine] manca la chiave: pensa il finto (.env).');
        return this.ripiego.passo(d);
      }
      if (!r.ok) throw new Error(`la porta ha risposto ${r.status}`);

      const corpo = (await r.json()) as {
        chiamate?: readonly Chiamata[];
        detto?: string;
        perche?: string;
      };
      this.storti = 0;

      // Quello che non è una mossa che conosco non entra: il contratto si chiude qui.
      const mosse = (corpo.chiamate ?? []).filter((c) => MOSSE_PRINCIPALI.includes(c.nome));
      if (mosse.length) return mosse;

      /**
       * Nessuna mossa. Prima qui il turno finiva in **silenzio**, ed era il difetto
       * peggiore del ponte: su un sistema a voce niente da sentire non si distingue da
       * un'app rotta. Adesso tre strade, in ordine:
       *
       *   - ha risposto a parole invece di chiamare `parla`: quelle parole **sono** la
       *     risposta, e diventano una riga detta;
       *   - si è fermato per una ragione: la ragione si dice, perché una cosa che non
       *     si può fare va detta e non taciuta;
       *   - non ha né mosse né parole: allora non è successo niente, e va bene.
       */
      if (corpo.detto?.trim()) {
        return [{ nome: 'parla', argomenti: { testo: corpo.detto.trim() } }];
      }
      if (corpo.perche === 'rifiuto') {
        return [{ nome: 'parla', argomenti: { testo: 'Questa non posso farla.' } }];
      }
      if (corpo.perche === 'troppo lungo') {
        return [{ nome: 'parla', argomenti: { testo: 'Mi sono perso a metà: ridimmelo più corto.' } }];
      }
      return [];
    } catch (e) {
      this.storti++;
      const quanto = this.storti >= 3 ? 'da qui in poi pensa il finto' : 'per questo passo pensa il finto';
      console.warn(`[ai-engine] non ha risposto (${e instanceof Error ? e.message : e}): ${quanto}.`);
      if (this.storti >= 3) this.nome = 'AI engine finto';
      return this.ripiego.passo(d);
    }
  }
}
