// La pedana di prova. **Non fa parte del design** e non deve assomigliarci: è un banco.
//
// Prima era un elenco di cose che si potevano premere, in tre corsie. Il difetto era
// che un elenco non dice **cosa viene dopo**: si premeva qualcosa, succedeva qualcosa,
// e non c'era modo di sapere se era quello che doveva succedere.
//
// Adesso è un copione. Si sceglie un flusso, e i passi si premono in fila: ognuno dice
// chi parla, cosa dice, e cosa devi aspettarti di vedere. Un passo di `lei` non si preme
// — succede da sé — e serve solo a confrontare quello che ha detto con quello che
// doveva dire.
//
// Resta fuori dal copione una corsia sola: una frase libera, che il locale legge prima
// di applicarla. È lì che si prova la grammatica che il copione non tocca.

import type { Flusso } from './flussi.ts';
import type { Esito, Famiglia } from './alfabeto.ts';
import type { Scia } from './scia.ts';
import type { Proposta } from '../confini/servizio.ts';
import type { Tipo, Destinazione } from '../modello/tipi.ts';

/** I tre servizi che sanno far arrivare qualcosa. Gli altri quattro escono e basta. */
export type Fonte = 'posta' | 'calendario' | 'promemoria';

/**
 * Quello che stai componendo. È una proposta a metà: campi di testo, perché si scrivono
 * al volo. Diventa una `Proposta` vera solo al momento di premere, in `proposta()`.
 *
 * I campi non sono tutti uguali. **Tre decidono dove va a finire** — `perTe`,
 * `azionabile`, `fra` — e sono quelli che il filtro guarda (`docs/06-confini §3`): una
 * cosa che non ti nomina si ferma, una che ti nomina ma non ha niente da fare è una
 * cosa da sapere, una che ha un'ora lontana dorme in ORARIO. Gli altri campi sono
 * quello che si legge e si sente.
 */
export interface Composto {
  fonte: Fonte;
  tipo: Tipo;
  nome: string;
  testo: string;
  daChi: string;
  perTe: boolean;
  azionabile: boolean;
  /** Fra quanti minuti scade. Vuoto: non ha un'ora, e allora non è programmata. */
  fra: string;
  ingresso: string;
  esito: string;
  /** A chi andrebbe la risposta, se decidessi di farla uscire. */
  a: string;
}

/** Il posto di una parola dell'alfabeto: la chiave dei suoi esiti, e quello che si preme. */
export function dove(famiglia: number, azione: number): string {
  return `${famiglia}:${azione}`;
}

export class Pedana {
  aperta = false;
  /**
   * Quale banco si guarda. Il copione risponde a «questa catena funziona?»; l'alfabeto
   * a una domanda che viene prima — «quali parole esistono?» (src/prova/alfabeto.ts).
   */
  vista: 'copione' | 'alfabeto' | 'componi' = 'copione';
  /**
   * Cosa si è visto premendo una parola dell'alfabeto, per posto: `famiglia:azione`.
   * Il token uscito davvero — se non è quello dichiarato, la lingua non regge — e la
   * frase com'è stata detta, che per quelle che nominano qualcosa cambia ogni volta.
   */
  readonly esiti: Record<string, Esito> = {};
  /**
   * **In prova, e non è deciso**: dove stanno le frasi (docs/11-aperte, 16 settembre).
   * Oggi stanno sotto il task a cui INPUT parla; l'idea da guardare è metterle dentro
   * INPUT, dove parli. Tre posizioni perché le alternative vere sono tre, e la terza è
   * quella che scioglie il nodo dei 30 secondi:
   *
   *   sotto         sotto il task a fuoco, com'è deciso adesso;
   *   input         dentro INPUT, che però sparisce dopo 30 secondi — e con lui le frasi;
   *   input-fisso   dentro INPUT, e **INPUT non può essere assente finché una frase c'è**.
   */
  frasi: 'sotto' | 'input' | 'input-fisso' = 'sotto';

  /**
   * Solo le parole che si possono dire adesso. Spento di suo: un vocabolario si legge
   * tutto, e quello che *non* si può dire in una situazione è metà di quello che c'è da
   * capire. Il filtro serve dopo, quando si sta provando una situazione sola.
   */
  soloAdesso = false;
  /**
   * La parola che si sta provando, mentre il mondo si porta nello stato che le serve.
   * Ci vogliono dei millisecondi veri — una consegna finta è pur sempre una promessa —
   * e per quel tempo il banco deve dire che sta facendo qualcosa.
   */
  provando?: string;
  /** Quale flusso si sta guardando. */
  scelto = 0;
  /** Il prossimo passo da premere. Quelli prima sono fatti, quelli dopo non ancora. */
  passo = 0;
  /** La frase in corso di scrittura nella corsia libera. */
  frase = '';
  /**
   * Quello che stai componendo al banco. Nasce già pieno di una cosa plausibile: un
   * modulo vuoto si compila, uno pieno si **modifica**, e quello che serve qui è
   * cambiare due campi e premere — non scrivere una mail da capo ogni volta.
   */
  readonly composto: Composto = {
    fonte: 'posta',
    tipo: 'posta',
    nome: 'Preventivo Bianchi',
    testo: 'Giulia Bianchi ti chiede un preventivo per il restauro.',
    daChi: 'Giulia Bianchi',
    perTe: true,
    azionabile: true,
    fra: '',
    ingresso: '',
    esito: '',
    a: 'Giulia Bianchi',
  };
  /** L'ultima cosa fatta arrivare da qui, per sapere che è partita. */
  inventata?: string;
  /**
   * La vista, guardata senza dire niente: la stessa fotografia che torna all'AI engine da
   * `guarda`, e da cui decide tutto (src/ai-engine/vista.ts). Prima qui c'era la lettura
   * del locale in una riga — e non c'è più niente che legga una frase senza pensarci.
   */
  anteprima?: string;
  /**
   * Lo schermo è bloccato. Il sistema continua a girare sotto — il tempo scorre, la
   * posta arriva, i task cambiano stato: un blocco copre, non spegne. Sta qui e non nel
   * modello perché oggi a bloccare è solo la pedana; il giorno che a bloccare sarà
   * l'inattività, questo diventa uno stato del sistema e migra di là.
   */
  bloccato = false;

  /**
   * `pulisci` svuota il mondo. Si chiama a ogni cambio di flusso e a ogni «da capo»:
   * un copione dichiara cosa devi vedere a ogni passo, e quello che avanza dal flusso
   * di prima farebbe mentire l'attesa — o peggio, si prenderebbe i comandi.
   */
  constructor(
    readonly flussi: readonly Flusso[],
    readonly alfabeto: readonly Famiglia[],
    /** Dove sono passati i task. Il banco se la ricorda, il modello no (src/prova/scia.ts). */
    readonly scia: Scia,
    private readonly pulisci: () => void,
  ) {}

  get flusso(): Flusso | undefined {
    return this.flussi[this.scelto];
  }

  scegli(indice: number): void {
    if (!this.flussi[indice]) return;
    this.vista = 'copione';
    this.scelto = indice;
    this.daccapo();
  }

  /**
   * L'alfabeto non si sceglie come un flusso: **non pulisce il mondo**. Un vocabolario
   * si prova sulle cose che ci sono già — e le parole che ci vogliono una situazione
   * apposta se la costruiscono da sole quando le premi (src/prova/stato.ts).
   */
  vocabolario(): void {
    this.vista = 'alfabeto';
  }

  /**
   * Il banco di chi inventa. Non pulisce il mondo, come l'alfabeto: quasi sempre si
   * inventa una cosa **per vederla cadere in mezzo a quelle che ci sono già**, ed è lì
   * che si scoprono le regole che si scontrano.
   */
  compositore(): void {
    this.vista = 'componi';
  }

  /**
   * Il modulo, diventato la cosa che un servizio annuncia. Quello che entra da qui è
   * indistinguibile da una dello scenario: stesso tipo, stessa porta, stesso filtro.
   *
   * Due campi si comportano diversamente dagli altri, e vale la pena saperlo prima di
   * stupirsi:
   *
   *   - **l'ora** esiste solo se hai scritto un numero di minuti. Senza, la proposta non
   *     ha scadenza e il filtro non la manda mai in ORARIO, per quanto la si guardi;
   *   - **l'uscita** esiste solo se hai scritto a chi. Senza, la cosa si può guardare ma
   *     non ha un modo di uscire, e il motore lo dirà quando proverai a mandarla.
   */
  proposta(adesso: Date): Proposta {
    const c = this.composto;
    const minuti = Number(c.fra);
    const conOra = c.fra.trim() !== '' && Number.isFinite(minuti);
    const a = c.a.trim();

    return {
      tipo: c.tipo,
      nome: c.nome.trim() || 'Senza nome',
      testo: c.testo.trim() || c.nome.trim(),
      fonte: c.daChi.trim() || c.fonte,
      perTe: c.perTe,
      azionabile: c.azionabile,
      ...(conOra ? { ora: new Date(adesso.getTime() + minuti * 60_000) } : {}),
      ...(c.ingresso.trim() ? { ingresso: c.ingresso.trim() } : {}),
      ...(c.esito.trim() ? { esito: c.esito.trim() } : {}),
      ...(a ? { uscita: { destinazione: c.fonte as Destinazione, a } } : {}),
    };
  }

  /** Il giro delle tre posizioni: si guarda una situazione e si gira, sulla stessa. */
  giraLeFrasi(): void {
    this.frasi = this.frasi === 'sotto' ? 'input' : this.frasi === 'input' ? 'input-fisso' : 'sotto';
  }

  /**
   * Svuotare il mondo restando nell'alfabeto. Gli esiti se ne vanno con lui: un token
   * uscito da uno stato che non c'è più è una prova di niente.
   */
  svuota(): void {
    this.pulisci();
    for (const k of Object.keys(this.esiti)) delete this.esiti[k];
  }

  daccapo(): void {
    this.pulisci();
    this.passo = this.prossimo(0);
  }

  /**
   * Fare un passo. Di norma il prossimo; premendone uno indietro si riparte da lì,
   * perché una casistica si studia anche rifacendone un pezzo solo.
   */
  vai(indice = this.passo): void {
    const p = this.flusso?.passi[indice];
    if (!p?.fai) return;
    p.fai();
    this.passo = this.prossimo(indice + 1);
  }

  /** Il primo passo premibile da qui in avanti: le risposte di lei si saltano. */
  private prossimo(da: number): number {
    const passi = this.flusso?.passi ?? [];
    let i = da;
    while (i < passi.length && !passi[i]?.fai) i++;
    return i;
  }
}
