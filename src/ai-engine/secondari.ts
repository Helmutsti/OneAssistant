// I secondari: l'AI engine che si moltiplica (docs/02-parallelo §3).
//
// Non sono un servizio e non stanno sul confine: sono **un modo di lavorare, non un
// posto**. Per questo qui non c'è una classe `Secondario` con un suo stato — c'è un
// giro, corto, che dà a un AI engine qualunque tre mosse invece di trentasette e gli chiede
// una cosa sola.
//
// ─── cosa li tiene a bada ────────────────────────────────────────────────────
//
// I tre no del documento non sono controlli sparsi nel codice: sono **tre nomi che
// mancano** dall'elenco che hanno in mano (`MOSSE_SECONDARIE`).
//
//   - non tocca lo stato  → nessuna mossa che sposti un task o muova il fuoco
//   - non consegna        → `consegna` non c'è, e il cancello resta suo
//   - non scrive in memoria → `segna` non c'è: la penna è una sola
//
// E non parla: `parla` non c'è. Un secondario riporta al principale, che è l'unico con
// una bocca — o si sentirebbero due voci per una richiesta sola.
//
// ─── un livello solo ─────────────────────────────────────────────────────────
//
// `delega` non è fra le tre, quindi un secondario non delega. Non serve un contatore di
// profondità e non serve ricordarselo: la ricorsione è impossibile perché la parola per
// farla non esiste. Così «aspetta» ferma una fila e non un albero.

import type { Motore } from '../modello/motore.ts';
import type { Orologio } from '../modello/tempo.ts';
import type { Task } from '../modello/tipi.ts';
import { chiama } from './api.ts';
import { MOSSE_SECONDARIE, type Chiamata } from './strumenti.ts';
import type { AiEngine, Passato } from './ai-engine.ts';

/**
 * Quanti passi può fare un secondario. Meno del principale, e di proposito: uno che
 * guarda, ricorda e riporta non ha bisogno di dieci giri — se li sta usando, sta
 * cercando qualcosa che non c'è.
 */
const PASSI = 5;

/**
 * Far lavorare un secondario, e aspettare il suo riporto.
 *
 * Il lavoro arriva come una frase, perché è così che gli è stato assegnato: il
 * principale scrive «leggi la proposta e dimmi cosa chiede» e quella frase è tutto il
 * suo mandato. Non riceve la conversazione della giornata — non è lui che parla con chi
 * usa il sistema, e non gli serve sapere cosa vi siete detti.
 */
export async function lavora(
  g: AiEngine,
  lavoro: string,
  m: Motore,
  o: Orologio,
  dentro: Task,
): Promise<string> {
  const passato: Passato[] = [];
  for (let i = 0; i < PASSI; i++) {
    // Morto col task: se quello dentro cui lavora non c'è più, si ferma a metà e non
    // riporta niente. Si controlla a ogni passo, non solo alla fine.
    if (!m.task.includes(dentro)) throw new Error('il task non c’è più');

    const chiamate = await g.passo({ frase: lavoro, passato, prima: [] });
    if (!chiamate.length) break;

    for (const c of chiamate) {
      // `riporta` chiude, come `parla` chiude il turno del principale. Il testo lo legge
      // il giro, non il motore: un riporto non è uno stato, è una cosa che torna.
      if (c.nome === 'riporta') {
        const testo = String((c.argomenti as { testo?: unknown }).testo ?? '').trim();
        if (testo) return testo;
      }
      const esito = chiama(c, m, o, MOSSE_SECONDARIE);
      passato.push({ chiamata: c, esito });
      // Il registro li vede come vede il principale: un secondario non si mostra a
      // schermo, ma sulla pedana si legge — o non si saprebbe cosa ha fatto.
      m.segna(c, esito.visto, esito.sbagliata === true, esito.comando);
    }
  }
  throw new Error('non ha riportato niente');
}

/**
 * Quanto ci mette un secondario finto, e perché ci mette qualcosa.
 *
 * Senza attesa la frazione salta da `0/2` a `2/2` nello stesso fotogramma, e **la loro
 * unica faccia non si vede mai** (docs/01-modello §4). È la stessa finzione dei tre passi
 * da 350 ms del riassunto: il tempo del mondo si muove a mano, ma quanto ci mette una
 * cosa a essere fatta no.
 *
 * Lo scarto fra uno e l'altro è quello che rende la frazione una cosa che *sale* invece
 * di un numero che cambia: due secondari veri non finiscono nello stesso istante.
 */
const QUANTO = 180;
const SCARTO = 140;

/**
 * Il secondario finto. Sa fare **un mestiere solo**: leggere quello che il task ha
 * dentro e dirlo corto. Non è quello che farà un modello — è la forma di ciò che farà, e
 * basta a vedere la frazione salire e l'esito comparire.
 *
 * Dove è finto, ed è giusto vederlo: non legge il `lavoro` che gli è stato assegnato.
 * Un modello vero farebbe cose diverse a seconda di cosa gli chiedi; questo fa sempre la
 * stessa, e il lavoro gli serve solo a distinguere un riporto dall'altro.
 */
export class SecondarioFinto implements AiEngine {
  readonly nome = 'un secondario finto';

  constructor(
    private readonly m: Motore,
    private readonly dentro: () => Task | undefined,
    /** Il quantesimo è: serve solo a non finire insieme agli altri. */
    private readonly quale = 0,
  ) {}

  async passo(d: {
    readonly frase: string;
    readonly passato: readonly Passato[];
  }): Promise<readonly Chiamata[]> {
    if (d.passato.length) return [];
    await new Promise((r) => setTimeout(r, QUANTO + SCARTO * this.quale));
    const t = this.dentro();
    const dentro = t?.ingresso ?? t?.testo ?? '';
    // La riga porta il lavoro davanti: due secondari sullo stesso task riportano due
    // cose diverse, e sulla pedana si vede quale ha fatto cosa.
    const corto = riassuntoSecco(dentro);
    void this.m;
    return [
      { nome: 'riporta', argomenti: { testo: `${d.frase}: ${corto}` } },
    ];
  }
}

/** Corto per davvero: la prima frase, e non più di centoquaranta caratteri. */
function riassuntoSecco(testo: string): string {
  const prima = testo.split(/(?<=[.?!])\s+/)[0]?.trim() ?? '';
  const uno = prima || testo.trim() || 'non c’era niente da leggere';
  return uno.length <= 140 ? uno : `${uno.slice(0, 137).trimEnd()}…`;
}
