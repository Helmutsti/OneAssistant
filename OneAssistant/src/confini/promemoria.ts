// Servizio finto: i promemoria. È il sesto dei sette (docs/06-confini §2), e ha una
// forma tutta sua: quello che annuncia non è arrivato da fuori — **è una cosa che gli
// hai chiesto tu** di ricordarti, che torna quando è ora.
//
// Il suo `tipo` è sempre **sveglia**, e non ne ha altri (§2).
//
// Vale la pena notare perché passa il filtro tanto facilmente: una scadenza che matura
// ti riguarda per costruzione — l'hai messa tu — e ha sempre qualcosa da farti fare.
// La prima domanda del filtro, su di lui, non nega mai. La terza sì.

import type { Uscita } from '../modello/tipi.ts';
import { ConsegnaFallita, type Proposta, type Sorgente } from './servizio.ts';

interface Cosa {
  readonly testo: string;
  readonly quando: Date;
  chiusa?: boolean;
}

/** Fra quanto matura quella che deve diventare una CARTA: dentro l'ora del filtro. */
const FRA_POCO = 20 * 60_000;
/** E questa oltre, perché il filtro la lasci dormire in ORARIO. */
const DOMANI = 18 * 60 * 60_000;

export class Promemoria implements Sorgente {
  readonly nome = 'promemoria';

  guasto = false;

  /** Le cose da fare. Una variabile, come per il calendario: il vero verrà con Electron. */
  private readonly cose: Cosa[] = [];
  private annuncia?: (p: Proposta) => void;

  /** L'ora da cui contano le scadenze: al banco il tempo si preme (vedi calendario.ts). */
  constructor(private readonly adesso: () => Date = () => new Date()) {}

  osserva(annuncia: (p: Proposta) => void): void {
    this.annuncia = annuncia;
  }

  cosaPuoArrivare(): readonly string[] {
    return this.scenario().map((p) => p.nome);
  }

  fai(nome: string): void {
    const p = this.scenario().find((x) => x.nome === nome);
    if (p && this.annuncia) this.annuncia(p);
  }

  /**
   * Crea, o chiude. Sono i due verbi del documento, e qui sono lo stesso metodo: se
   * quello che esce nomina una cosa che c'è già, quella si chiude; altrimenti ne nasce
   * una nuova. Un servizio ha tre verbi e non uno di più — il quarto lo si fa entrare
   * da quello che esce, non aggiungendo una porta.
   */
  /**
   * Far arrivare una cosa che lo scenario non prevede: la compone la pedana, e da qui
   * in poi è una proposta come tutte le altre (`Sorgente`).
   */
  inventa(p: Proposta): void {
    this.annuncia?.(p);
  }

  async consegna(_u: Uscita, cosa: string): Promise<void> {
    if (this.guasto) throw new ConsegnaFallita('i promemoria non rispondono');
    await attesa(200);
    const gia = this.cose.find((c) => !c.chiusa && somiglia(c.testo, cosa));
    if (gia) {
      gia.chiusa = true;
      return;
    }
    this.cose.push({ testo: cosa, quando: this.adesso() });
  }

  leggi(): readonly string[] {
    return this.cose.filter((c) => !c.chiusa).map((c) => c.testo);
  }

  private scenario(): readonly Proposta[] {
    const ora = this.adesso().getTime();
    return [
      {
        tipo: 'sveglia',
        nome: 'Richiamare Giulia',
        testo: 'Ti eri segnata di richiamare Giulia, e l’ora è adesso.',
        fonte: 'te stessa, stamattina',
        perTe: true,
        azionabile: true,
        ora: new Date(ora + FRA_POCO),
        esito: 'Fatto, l’ho richiamata.',
        uscita: { destinazione: 'promemoria', a: 'te' },
      },
      {
        tipo: 'sveglia',
        nome: 'Rinnovo polizza',
        testo: 'La polizza dello studio scade domani.',
        fonte: 'te stessa, la settimana scorsa',
        perTe: true,
        azionabile: true,
        // Domani: ha un'ora, ed è lontana. Dorme in ORARIO e non interrompe niente.
        ora: new Date(ora + DOMANI),
        esito: 'Rinnovata.',
        uscita: { destinazione: 'promemoria', a: 'te' },
      },
    ];
  }
}

/** Due testi sono la stessa cosa da fare se uno contiene l'altro. Basta, per un finto. */
function somiglia(a: string, b: string): boolean {
  const x = a.toLowerCase().trim();
  const y = b.toLowerCase().trim();
  return x.includes(y) || y.includes(x);
}

function attesa(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
