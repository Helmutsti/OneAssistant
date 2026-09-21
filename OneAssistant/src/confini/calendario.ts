// Servizio finto: il calendario. È il quarto dei sette (docs/06-confini §2), ed è uno
// dei tre simmetrici — entri ed esci dalla stessa porta: ti annuncia un invito, e
// accetta che tu ci metta dentro qualcosa.
//
// Il suo `tipo` non è uno solo, ed è l'unico servizio così: **persone** quando la cosa
// è un incontro con qualcuno, **sveglia** quando è un'ora che sta arrivando
// (docs/06-confini §2, «Il tipo di un task viene dal servizio»).
//
// Finto oltre il confine come tutti: vive nel tempo, sa fallire, ricorda le consegne
// (§4). Dentro non c'è un file e non c'è una rete: c'è una variabile, e basta così
// finché il calendario vero non avrà una porta sua.

import type { Uscita } from '../modello/tipi.ts';
import { ConsegnaFallita, type Proposta, type Sorgente } from './servizio.ts';

/** Quello che c'è in agenda. Non è un task: è quello che il servizio possiede. */
interface Evento {
  readonly cosa: string;
  readonly quando: Date;
  readonly con?: string;
}

/** Fra quanto cade l'evento imminente. Sotto l'ora del filtro: deve diventare CARTA. */
const FRA_POCO = 40 * 60_000;
/** E questo sopra, perché il filtro lo mandi in ORARIO invece che nella pila. */
const PIU_TARDI = 5 * 60 * 60_000;

export class Calendario implements Sorgente {
  readonly nome = 'calendario';

  /** Un servizio finto sa fallire su richiesta, o `bloccato` non scatta mai (§4). */
  guasto = false;

  /** L'agenda. Variabile e niente più: quello che ci scrivi resta finché la scheda vive. */
  private readonly agenda: Evento[] = [];
  private annuncia?: (p: Proposta) => void;

  /**
   * L'ora da cui contano le scadenze. Gliela dà chi cabla, perché al banco il tempo si
   * preme: un servizio che leggesse `Date.now()` con l'orologio fermo annuncerebbe cose
   * già passate, e il filtro le giudicherebbe con due orari diversi.
   */
  constructor(private readonly adesso: () => Date = () => new Date()) {}

  osserva(annuncia: (p: Proposta) => void): void {
    this.annuncia = annuncia;
  }

  /** Cosa può arrivare. La pedana le fa arrivare a mano, una alla volta. */
  cosaPuoArrivare(): readonly string[] {
    return this.scenario().map((p) => p.nome);
  }

  /** Far arrivare una cosa adesso. Niente parte da solo: si preme e succede. */
  fai(nome: string): void {
    const p = this.scenario().find((x) => x.nome === nome);
    if (p && this.annuncia) this.annuncia(p);
  }

  /**
   * Far arrivare una cosa che lo scenario non prevede: la compone la pedana, e da qui
   * in poi è una proposta come tutte le altre (`Sorgente`).
   */
  inventa(p: Proposta): void {
    this.annuncia?.(p);
  }

  async consegna(u: Uscita, cosa: string): Promise<void> {
    if (this.guasto) throw new ConsegnaFallita('il calendario non risponde');
    await attesa(300);
    // L'uscita dice dove e **con chi**; il *cosa* è l'esito del task, e l'ora è quella
    // in cui lo stai mettendo giù: un calendario finto non sa leggere «venerdì alle 15»
    // da una frase, e fingere che lo sappia sarebbe mentire male.
    this.agenda.push({ cosa, quando: this.adesso(), con: u.a });
  }

  /** Una cosa messa in agenda dev'essere lì la volta dopo, o il confine è uno specchio. */
  leggi(): readonly string[] {
    return [...this.fisso, ...this.agenda]
      .slice()
      .sort((a, b) => a.quando.getTime() - b.quando.getTime())
      .map((e) => `${ora(e.quando)} · ${e.cosa}${e.con ? ` (con ${e.con})` : ''}`);
  }

  /** Quello che c'era già in agenda stamattina. Finto oltre il confine. */
  private readonly fisso: readonly Evento[] = [
    { cosa: 'Chiamata con lo studio', quando: new Date('2026-09-17T11:00:00'), con: 'Renzo Baldi' },
    { cosa: 'Cena', quando: new Date('2026-09-17T20:30:00'), con: 'Carla Moretti' },
  ];

  /**
   * Le tre che può far arrivare, e sono tre perché servono tre esiti diversi del filtro:
   * una diventa CARTA, una ORARIO, e la terza non diventa niente.
   */
  private scenario(): readonly Proposta[] {
    const ora = this.adesso().getTime();
    return [
      {
        tipo: 'persone',
        nome: 'Invito Pettinelli',
        testo: 'Il capo ti ha messo in un incontro col signor Pettinelli, fra poco meno di un’ora.',
        ingresso:
          'Oggetto: Primo incontro Pettinelli. Renzo Baldi ti ha invitata a un incontro ' +
          'in studio per conoscere il nuovo cliente e sentire la sua storia con la banca. ' +
          'Durata prevista: un’ora. Sala grande.',
        fonte: 'Renzo Baldi',
        perTe: true,
        azionabile: true,
        ora: new Date(ora + FRA_POCO),
        esito: 'Ci sono, ci vediamo in sala grande.',
        uscita: { destinazione: 'calendario', a: 'Renzo Baldi' },
      },
      {
        tipo: 'sveglia',
        nome: 'Udienza giovedì',
        testo: 'Giovedì mattina hai l’udienza, e il fascicolo non l’hai ancora guardato.',
        fonte: 'la tua agenda',
        perTe: true,
        azionabile: true,
        // Ha un'ora, ed è lontana: il filtro la manda in ORARIO. È l'unico servizio che
        // oggi sa produrre questo esito, e senza non lo si vedeva mai succedere.
        ora: new Date(ora + PIU_TARDI),
        esito: 'Guardo il fascicolo domani pomeriggio.',
        uscita: { destinazione: 'promemoria', a: 'te' },
      },
      {
        tipo: 'persone',
        nome: 'Riunione generale',
        testo: 'Lunedì c’è la riunione di tutto lo studio.',
        fonte: 'la tua agenda',
        // Ti riguarda, ma non c'è niente da decidere: è una cosa da sapere.
        perTe: true,
        azionabile: false,
      },
    ];
  }
}

function ora(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function attesa(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
