// L'unico posto in cui un task cambia. L'AI engine non lo tocca: chiama una mossa delle
// API, e la mossa passa da qui (docs/03-architettura §2).
//
// Dal 17 settembre 2026 il cervello è uno solo, e questo file ha perso una porta: non
// esiste più `applica(Intesa)` — il metalinguaggio fra due intelligenze, quando ce n'è
// una, non ha più due parti da mettere d'accordo. Resta `esegui(Comando)`, che è sempre
// stata la porta vera.

import { MINUTO, SECONDO, type Orologio } from './tempo.ts';
import {
  autorizzabile,
  chiParla,
  combinazioneLegale,
  dentroSiVede,
  type Avanzamento,
  type Comando,
  type Frase,
  type Gruppo,
  type Luogo,
  type Notifica,
  type Task,
  type Uscita,
} from './tipi.ts';
import type { Archivio, Genere } from '../archivio/archivio.ts';
import { riassumi, componi, aggiungiAl } from '../ai-engine/testi.ts';
import type { Chiamata } from '../ai-engine/strumenti.ts';
import type { Proposta, Registro, Sorgente } from '../confini/servizio.ts';
import { ConsegnaFallita } from '../confini/servizio.ts';
import { filtra, type Esito } from '../confini/filtro.ts';
import { Contatti } from '../confini/contatti.ts';
import { contesto, dentroLOrario, nomeDiChiParla } from '../conoscenza/contesto.ts';
import { legge, leggiAVoce, nonAscoltare, sente } from '../conoscenza/canali.ts';

/** I numeri di docs/01-modello §3. Stanno qui e non nel design. */
export const REGOLE = {
  /** Una side che resta senza risposta esce dalla pila. */
  cartaSenzaRisposta: 60 * MINUTO,
  /** Prima dell'ora, un programmato passa ad aspetta te. */
  preavviso: 15 * MINUTO,
  /** La finestra per dire «no, aspetta». */
  annullamento: 90 * SECONDO,
  /** Quanto dura un rinvio generico, quando dici solo «dopo». */
  rinvio: 120 * MINUTO,
} as const;

export type Espansa =
  | 'NOTIFICATIONBAR'
  | 'TASKBAR'
  | { readonly gruppo: string }
  | { readonly dentro: string }
  | null;

/** Un giro di botta e risposta. Vive in INPUT, non è un task (docs/05-interfaccia §1). */
export interface Scambio {
  /** Quello che hai detto o scritto. Vuoto se il sistema ha parlato per primo. */
  readonly tua: string;
  risposta?: string;
  /**
   * Quando, di tempo vero. L'orologio del mondo sta fermo e si muove a mano; una
   * conversazione invece invecchia davvero, perché è una cosa dell'interfaccia.
   */
  readonly quando: number;
  /**
   * L'ora **del sistema**, quella che si mostra accanto al messaggio. Non è `quando`:
   * quello è tempo vero e serve a misurare i 30 secondi della conversazione aperta,
   * questa è l'ora dell'orologio di `src/modello/tempo.ts` — che sta fermo e si muove
   * solo quando lo salti. Metterne una sola vorrebbe dire scegliere fra una misura
   * sbagliata e due orologi che si contraddicono a schermo (17 settembre 2026).
   */
  readonly ora: Date;
}

/** Dentro questa finestra la conversazione è aperta, e INPUT ha qualcosa da mostrare. */
/** Una mossa chiesta dall'AI engine, e cosa gli ha risposto. Vive nel registro. */
export interface Mossa {
  readonly chiamata: Chiamata;
  /** Quello che l'AI engine ha letto in risposta: la vista, l'estratto, o com'è andata. */
  readonly visto: string;
  readonly sbagliata: boolean;
  /** In quale comando del modello si è tradotta, se si è tradotta in uno. */
  readonly comando?: Comando['tipo'];
  /** In tempo vero: il registro è una cosa nostra, non del mondo simulato. */
  readonly quando: number;
}

export const CONVERSAZIONE_APERTA = 30 * SECONDO;

/** Quanto scambio resta **a schermo**. Provvisorio: la domanda è aperta (docs/11-aperte). */
const SCAMBI_TENUTI = 6;

/** La chiave con cui un'abitudine di consegna vive in osservato.md / preferenze.md. */
export const abitudineDi = (u: Uscita) => `consegna-${u.destinazione}`;

export class Motore {
  readonly task: Task[] = [];
  /**
   * Il cassetto della NOTIFICATIONBAR. Non sono task e non lo diventano da sole: una
   * cosa arrivata entra nel modello solo quando dici «me ne occupo» (docs/06-confini §3).
   */
  readonly notifiche: Notifica[] = [];
  /**
   * **In prova** (docs/11-aperte): la seconda versione della NOTIFICATIONBAR. Acceso,
   * quello che il filtro manderebbe in `CARTA` si posa nel cassetto invece di diventare
   * un task. Sta qui e non in un sottotipo perché le due versioni si escludono e si
   * guardano una accanto all'altra dalla pedana — quando una delle due avrà vinto,
   * questa riga sparisce.
   */
  conCassetto = false;
  /** Quale notifica risponde a «me ne occupo». Di suo la più recente. */
  scelta?: string;
  espansa: Espansa = null;
  /** L'ultima risposta: sempre scritta, e parallelamente detta. */
  ultimaRisposta = '';
  /**
   * Tutto quello che vi siete detti **nella giornata di lavoro**, dal più vecchio al più
   * recente (17 settembre 2026). Non è quello che INPUT mostra: a schermo ne va la coda
   * (`scambioVisibile`), e questo è quello che l'AI engine si ricorda (`memoria`).
   *
   * Due tempi diversi per due mestieri diversi, e vale la pena tenerli distinti:
   * la conversazione a schermo dura **30 secondi** (docs/01-modello §3) perché è quello
   * che serve a capire di cosa si sta parlando; la memoria dell'AI engine dura **la
   * giornata** perché serve a capire di cosa si stava parlando.
   */
  readonly scambio: Scambio[] = [];
  /**
   * Le ultime mosse che l'AI engine ha chiesto, e cosa gli hanno risposto. Non si
   * mostrano mai a schermo: vivono nel registro della pedana, e si studiano.
   *
   * È quello che è rimasto del metalinguaggio: prima era l'intesa fra due cervelli,
   * adesso è il verbale di uno solo che lavora.
   */
  readonly mosse: Mossa[] = [];

  private osservatori: Array<() => void> = [];
  private voci: Array<(testo: string) => void> = [];
  private arrivi: Array<() => void> = [];
  private contatore = 0;
  private lotti = 0;

  /** L'abitudine che il sistema ha appena proposto e aspetta un sì. */
  private inSospeso?: string;

  /** Dov'era il fuoco prima di adesso. È tutto ciò che serve a «torna a quella di prima». */
  private fuocoPrima?: string;

  /**
   * Chi fa lavorare un secondario. Lo mette il cablaggio, come un servizio — perché i
   * secondari **sono un modo di lavorare, non un posto** (docs/02-parallelo §3), e il
   * motore non deve sapere se dietro c'è un modello o un pugno di regole.
   *
   * Senza, `delega` non si fa e lo dice: un sistema che finge di delegare è peggio di
   * uno che non delega.
   */
  private delegato?: (lavoro: string, dentro: Task, quale: number) => Promise<string>;

  constructor(
    private readonly orologio: Orologio,
    private readonly registro: Registro,
    /** La sua testa. Ci scrive solo l'AI engine, e non si mostra mai (docs/07-memoria). */
    readonly archivio: Archivio,
  ) {}

  /** Il cablaggio collega chi lavora per l'AI engine (src/ai-engine/secondari.ts). */
  conSecondari(fn: (lavoro: string, dentro: Task, quale: number) => Promise<string>): void {
    this.delegato = fn;
  }

  /**
   * **I secondari.** L'AI engine si moltiplica: `lavori.length` agenti partono insieme
   * dentro un task che esiste già, e il task pulsa con la frazione che sale — quella è
   * la loro faccia, e non ne hanno un'altra (docs/01-modello §4).
   *
   * Torna quanti sono partiti, o 0 se non c'è nessuno a cui delegare.
   *
   * Quattro cose che questo metodo fa rispettare, e sono le quattro del documento:
   *
   *   - **non sono un task.** Non nascono bolle: nasce una frazione su una bolla che
   *     c'era già. Se ne avessero una loro, avresti due cose a schermo per un'intenzione
   *     sola, e salta la legge 03;
   *   - **non consegnano.** Quando hanno finito il task torna `aspetta te`, non
   *     `consegnato`: il cancello è suo, sempre;
   *   - **muoiono col task.** Se il task se ne va mentre lavorano, quello che riportano
   *     si butta — si controlla al ritorno di ognuno, non alla partenza;
   *   - **un livello solo.** Qui non si chiama `delega`: chi lavora ha in mano tre mosse
   *     e `delega` non è fra quelle (`MOSSE_SECONDARIE`).
   */
  delega(id: string, lavori: readonly string[]): number {
    const t = this.trova(id);
    if (!t || !this.delegato) return 0;
    const quanti = lavori.length;
    let fatti = 0;
    const riporti: string[] = [];

    this.sposta(t, t.luogo, 'in corso');
    t.dato = `0/${quanti}`;
    this.cambiato();

    lavori.forEach((lavoro, quale) => {
      void this.delegato!(lavoro, t, quale)
        .then((riporto) => riporti.push(riporto))
        // Un secondario che non ce la fa non ferma gli altri, e non passa per buono:
        // quello che manca si vede nel conto, perché la frazione arriva in fondo e il
        // riporto no.
        .catch(() => {})
        .finally(() => {
          fatti++;
          // Morti col task: se non c'è più, non c'è niente da aggiornare e niente da dire.
          if (!this.task.includes(t)) return;
          t.dato = `${fatti}/${quanti}`;
          this.cambiato();
          if (fatti < quanti) return;
          this.hannoFinito(t, riporti);
        });
    });
    return quanti;
  }

  /**
   * Hanno finito. Quello che hanno prodotto diventa l'**esito** del task, che è il posto
   * dove sta quello che un task produce (docs/01-modello §1) — e il task torna al
   * cancello, perché a farlo uscire sei tu.
   */
  private hannoFinito(t: Task, riporti: readonly string[]): void {
    t.dato = undefined;
    if (riporti.length) {
      t.esito = riporti.join('\n');
      // La riga che si legge è una, e dev'essere dicibile: il lavoro per intero sta
      // nell'esito e si guarda aprendo la bolla (docs/05-interfaccia §1).
      t.testo = riporti.length === 1 ? riporti[0]! : `Ho messo insieme ${riporti.length} pezzi.`;
    }
    this.sposta(t, t.luogo, 'aspetta te');
    this.rispondi(
      riporti.length
        ? `Ho finito quello che ti avevo detto. ${t.testo}`
        : 'Non sono riuscito a fare quel lavoro.',
    );
    this.cambiato();
  }

  ascolta(fn: () => void): void {
    this.osservatori.push(fn);
  }

  /**
   * Quello che INPUT mostra: la coda. Lo scambio intero è la memoria dell'AI engine, e
   * riversarlo a schermo vorrebbe dire una bolla che cresce per tutta la giornata.
   */
  scambioVisibile(): readonly Scambio[] {
    return this.scambio.slice(-SCAMBI_TENUTI);
  }

  /**
   * Quello che l'AI engine si ricorda: i giri **già avvenuti**, senza la frase di adesso —
   * quella viaggia da sé (src/ai-engine/ai-engine.ts).
   *
   * La regola che lo tiene onesto, e che va letta insieme a `guarda`:
   * **ricordare la conversazione non è ricordare lo schermo.** Questi sono i discorsi;
   * quello che c'è a schermo lo rilegge ogni volta, perché nel frattempo il mondo va
   * avanti. Così può capire «no, l'altra» tre minuti dopo, e non può parlarti di una
   * carta che intanto è caduta in memoria.
   */
  memoria(): readonly Scambio[] {
    return this.scambio.slice(0, -1);
  }

  /**
   * La memoria si pota sulla **giornata di lavoro** (`03-conoscenza §2`): quello che è
   * stato detto fuori dalle ore di lavoro, o in un altro giorno, non c'è più.
   *
   * Un'eccezione, e serve: **non si taglia una conversazione aperta a metà.** Se l'ora
   * passa le 19 mentre stai parlando, quello che vi state dicendo resta — altrimenti
   * alle 19:01 dimenticherebbe in mezzo a una frase, che è il difetto peggiore di legare
   * la memoria a un orario.
   */
  private potaLaMemoria(): void {
    const adesso = this.orologio.adesso();
    const dentro = dentroLOrario(contesto, adesso);
    const stessoGiorno = (d: Date) => d.toDateString() === adesso.toDateString();
    /**
     * Quello che si sta dicendo **adesso**, e che non si taglia a metà. La finestra è la
     * stessa dei trenta secondi (`01-modello §3`), ma si misura sull'ora **del sistema**
     * e non su quella vera, per due ragioni che vanno insieme:
     *
     *   - nel mondo vero le due coincidono, quindi non cambia niente;
     *   - sul banco l'orologio si salta a mano, ed è l'unico modo di provare una regola
     *     legata a un orario. Misurandola sul tempo vero, saltare l'ora non la toccava —
     *     e una regola che il banco non può esercitare è dichiarata, non provata.
     */
    const staParlando = (g: Scambio) =>
      adesso.getTime() - g.ora.getTime() < CONVERSAZIONE_APERTA;
    // Fuori dall'orario la memoria non cresce e non si tiene: resta solo la conversazione
    // che hai in corso, se ce n'è una.
    const tieni = (g: Scambio): boolean =>
      staParlando(g) || (dentro && stessoGiorno(g.ora) && dentroLOrario(contesto, g.ora));
    const restano = this.scambio.filter(tieni);
    if (restano.length !== this.scambio.length) {
      this.scambio.length = 0;
      this.scambio.push(...restano);
    }
  }

  /**
   * docs/05-interfaccia §1 — quando l'ultimo scambio è vecchio, la conversazione è chiusa e
   * INPUT non ha più niente da mostrare: sparisce.
   */
  conversazioneAperta(): boolean {
    const ultimo = this.scambio[this.scambio.length - 1];
    if (!ultimo) return false;
    return Date.now() - ultimo.quando < CONVERSAZIONE_APERTA;
  }

  /** Fra quanto si chiude, per svegliare il disegno una volta sola invece che sempre. */
  fraQuantoSiChiude(): number {
    const ultimo = this.scambio[this.scambio.length - 1];
    if (!ultimo) return 0;
    return Math.max(0, ultimo.quando + CONVERSAZIONE_APERTA - Date.now());
  }

  /** Il canale parallelo: chi si iscrive qui legge ad alta voce lo stesso testo. */
  inAscoltoDelleRisposte(fn: (testo: string) => void): void {
    this.voci.push(fn);
  }

  /**
   * Chi si iscrive qui sa che è **arrivato** qualcosa: una proposta ha passato il
   * filtro ed è diventata un task. Non si chiama per le cose che il filtro scarta —
   * quelle non sono successe (docs/06-confini §3).
   */
  inAscoltoDegliArrivi(fn: () => void): void {
    this.arrivi.push(fn);
  }

  // ─── ingresso ────────────────────────────────────────────────────────────

  /** Una proposta arriva da un servizio. Il filtro decide se diventa qualcosa. */
  accogli(p: Proposta): void {
    const adesso = this.orologio.adesso();
    const carte = this.in('CARTA').length;
    const giudizio = filtra(p, contesto, adesso, carte);
    // Il cassetto prende tutto quello che non ha già un'ora: una cosa con un'ora è
    // roba tua che torna, non una notizia — quella resta un task programmato.
    if (this.conCassetto && giudizio.esito !== 'ORARIO') return this.nelCassetto(p, giudizio.esito);
    if (giudizio.esito === 'niente') return;

    const t: Task = {
      id: `t${++this.contatore}`,
      origine: 'esterna',
      tipo: p.tipo,
      nome: p.nome,
      luogo: giudizio.esito,
      avanzamento: giudizio.esito === 'CARTA' ? 'aspetta te' : 'programmato',
      testo: p.testo,
      ingresso: p.ingresso,
      esito: p.esito,
      fonte: p.fonte,
      ora: p.ora,
      uscita: p.uscita,
      nascita: adesso,
      tocco: adesso,
      frasi: [],
    };
    this.task.push(t);
    this.aggiornaFrasi();
    for (const a of this.arrivi) a();

    if (t.luogo === 'CARTA') {
      // Chi non guardi si rimanda.
      this.orologio.fra(REGOLE.cartaSenzaRisposta, () => {
        if (t.luogo === 'CARTA') this.sposta(t, 'ORARIO', 'programmato');
      });
    }
    this.cambiato();
  }

  /**
   * Una cosa arrivata si posa nel cassetto. **Non diventa niente**: non ha luogo, non ha
   * avanzamento, e nessuno la conta come lavoro finché non la prendi tu.
   *
   * Suona solo quella che il filtro avrebbe promosso — ti riguarda e c'è una frase da
   * offrirti. Le altre entrano in silenzio, ed è la differenza fra un sistema che ti
   * interrompe e uno che tiene le cose da parte (docs/06-confini §3).
   */
  private nelCassetto(p: Proposta, esito: Esito): void {
    const adesso = this.orologio.adesso();
    const n: Notifica = {
      id: `n${++this.contatore}`,
      tipo: p.tipo,
      nome: p.nome,
      testo: p.testo,
      fonte: p.fonte,
      ingresso: p.ingresso,
      esito: p.esito,
      uscita: p.uscita,
      quando: adesso,
      chiede: esito === 'CARTA',
      nuova: true,
    };
    this.notifiche.push(n);
    this.aggiornaFrasi();
    if (n.chiede) for (const a of this.arrivi) a();
    this.cambiato();
  }

  /** Le notifiche che non hai ancora visto: è il numero sul badge della campanella. */
  daVedere(): number {
    return this.notifiche.filter((n) => n.nuova && n.chiede).length;
  }

  /** La notifica a cui parla «me ne occupo»: quella scelta, o la più recente. */
  notificaAFuoco(): Notifica | undefined {
    const scelta = this.notifiche.find((n) => n.id === this.scelta);
    return scelta ?? this.notifiche[this.notifiche.length - 1];
  }

  /**
   * La rubrica, quando c'è. La legge il locale per agganciare chi nomini mentre parli:
   * il destinatario di «scrivi a mia madre» esiste prima ancora del verbo.
   */
  rubrica(): Contatti | undefined {
    const r = this.registro.contatti;
    return r instanceof Contatti ? r : undefined;
  }

  cassettoAperto(): boolean {
    return this.conCassetto && this.espansa === 'NOTIFICATIONBAR';
  }

  /** Quello che hai detto o scritto entra qui prima di diventare un comando. */
  haiDetto(frase: string): void {
    this.scambio.push({ tua: frase, quando: Date.now(), ora: this.orologio.adesso() });
    this.potaLaMemoria();
    this.cambiato();
  }

  /**
   * Quello che l'AI engine ha chiesto, e com'è andata. Lo chiama il giro del turno
   * (src/ai-engine/ai-engine.ts), una volta per mossa: il registro è l'unico posto da cui si
   * capisce cosa ha deciso, e va tenuto anche — soprattutto — quando sbaglia.
   */
  segna(
    chiamata: Chiamata,
    visto: string,
    sbagliata: boolean,
    comando?: Comando['tipo'],
  ): void {
    this.mosse.push({ chiamata, visto, sbagliata, comando, quando: Date.now() });
    if (this.mosse.length > 24) this.mosse.shift();
  }

  /**
   * La bocca dell'AI engine. Sempre scritta, e parallelamente detta: è lo stesso testo su
   * due canali, e non si genera mai due volte (docs/05-interfaccia §1).
   *
   * Le mosse che cambiano uno stato rispondono da sé — «Mandata a Andrea», «Annullata»
   * — perché quella riga racconta un fatto del modello, non un pensiero. Questa è per
   * quello che solo lui può dire.
   */
  parla(testo: string): void {
    if (!testo.trim()) return;
    this.rispondi(testo);
    this.cambiato();
  }

  /**
   * Segnarsi una cosa. **La memoria ha una penna sola** (docs/07-memoria §9): passa da
   * qui, e chi l'ha detto se lo porta con la riga — il sistema non finge mai che sia tuo.
   */
  segnati(
    nome: string,
    genere: Genere,
    testo: string,
    collegamenti: readonly string[],
    chi: string,
  ): void {
    this.archivio.annota(nome, genere, testo, this.orologio.adesso(), chi, collegamenti);
    this.cambiato();
  }

  /**
   * Una cosa che deve **tornare**, e che quindi si vedrà.
   *
   * Non nasce un task qui, e non è un cavillo: la legge dice che un task nasce solo da
   * quello che arriva e supera il filtro (docs/01-modello). Quindi questo scrive nei
   * **suoi** promemoria, e il promemoria rientra dalla porta di sempre — la stessa da cui
   * entrano la posta e il calendario. All'ora giusta il filtro lo giudica come tutti gli
   * altri, e finisce dove gli tocca: fra poco nella pila, più in là in ORARIO.
   *
   * Prima di questa mossa non c'era strada fra «devo comprare il pane» e una cosa che
   * torna: l'AI engine sceglieva `segna`, che è memoria e **non si vede** — faceva la
   * cosa giusta con l'unico attrezzo che aveva, e non si vedeva niente (17 settembre 2026).
   */
  ricordami(cosa: string, fraMinuti: number): boolean {
    const servizio = this.registro.promemoria;
    // Il registro tiene `Servizio`; solo alcuni sanno anche **far arrivare** qualcosa.
    if (!servizio || !('inventa' in servizio)) return false;

    // Un minuto è il minimo: «ricordamelo adesso» è una cosa che si dice, e zero minuti
    // sarebbe una scadenza già passata nel momento in cui nasce.
    const minuti = Number.isFinite(fraMinuti) ? Math.max(1, Math.round(fraMinuti)) : 60;
    const quando = new Date(this.orologio.adesso().getTime() + minuti * 60_000);
    const pulita = cosa.trim();

    (servizio as Sorgente).inventa({
      tipo: 'sveglia',
      nome: pulita.length <= 24 ? pulita : `${pulita.slice(0, 22).trimEnd()}…`,
      // La riga si legge ad alta voce, e deve suonare come te lo direbbe lui.
      testo: `Te l'eri segnato: ${pulita}.`,
      fonte: 'te stesso',
      perTe: true,
      azionabile: true,
      ora: quando,
      uscita: { destinazione: 'promemoria', a: 'te' },
    });
    return true;
  }

  /**
   * Chi non ha la sessione non comanda, e l'AI engine non lo sente nemmeno: la frase si
   * ferma prima (src/ai-engine/ai-engine.ts). Se il sistema lo conosce, quello che dice
   * diventa **un messaggio per te** — una carta che aspetta te, con la fonte scritta.
   * Se non lo conosce, il sistema non risponde: lo dice e basta.
   */
  lasciaDetto(frase: string): void {
    if (contesto.ascoltatore.chi === 'sconosciuto') {
      this.rispondi('Non riconosco questa voce.');
      return this.cambiato();
    }
    const chi = nomeDiChiParla(contesto);
    this.accogli({
      tipo: 'conversazione',
      nome: chi,
      testo: `${chi} ha lasciato detto: ${frase}`,
      fonte: `${chi}, a voce`,
      perTe: true,
      azionabile: true,
    });
    this.rispondi(`Lascio detto a ${contesto.utilizzatore.split(' ')[0]}.`);
    this.cambiato();
  }

  /**
   * «Non ho capito quale». Il fuoco **non si sposta**: la domanda compare sulla bolla
   * che stai già guardando, e le alternative diventano le sue frasi. Un blocco ha
   * sempre almeno un'uscita, perché un blocco senza uscita è un vicolo cieco.
   */
  chiedi(fra: readonly string[]): void {
    const nomi = fra.map((id) => this.trova(id)?.nome).filter(Boolean) as string[];
    const t = this.aFuoco();
    // Una CARTA è sempre e solo `aspetta te` (docs/01-modello §2): lì il blocco non ci
    // sta, e la domanda resta parlata. Il fuoco non si sposta comunque.
    const bloccabile = t && combinazioneLegale(t.luogo, 'bloccato');
    if (t && bloccabile && nomi.length > 1) {
      t.alternative = fra;
      t.testo = `Non ho capito quale: ${nomi.join(' o ')}?`;
      this.sposta(t, t.luogo, 'bloccato');
    }
    this.rispondi(nomi.length > 1 ? `Quale dei due: ${nomi.join(' o ')}?` : 'Non ho capito.');
    this.cambiato();
  }

  /** La risposta alla domanda: si scioglie il blocco e si va dove hai detto. */
  private sciogli(id: string): void {
    for (const t of this.task) {
      if (!t.alternative) continue;
      t.alternative = undefined;
      this.sposta(t, t.luogo, t.precedente ?? 'aspetta te');
    }
    this.alCentro(id);
  }

  // ─── comandi ─────────────────────────────────────────────────────────────

  esegui(c: Comando): void {
    switch (c.tipo) {
      case 'consegna':
        return this.consegna(c.task);
      case 'rimanda':
        return this.rimanda(c.task);
      case 'al-centro':
        // **Muto.** Una bocca sola vuol dire che le mosse di orientamento non parlano:
        // la riga la dice l'AI engine con `parla`, e non si sente due volte (17 settembre
        // 2026). Prima questa rispondeva da sé, perché il locale non aveva voce.
        return this.alCentro(c.task, false);
      case 'richiama':
        return this.richiama(c.nome);
      case 'annulla':
        return this.annulla(c.task);
      case 'lascia':
        return this.lascia(c.task);
      case 'mostra':
        // Aprire il cassetto è averle viste: il badge si azzera qui, e non altrove.
        if (c.area === 'NOTIFICATIONBAR') {
          for (const n of this.notifiche) n.nuova = false;
          this.scelta = undefined;
        }
        this.espansa = c.area;
        this.rispondi(this.descriviVista(c.area));
        return this.cambiato();
      case 'chiudi':
        this.espansa = null;
        this.rispondi('Chiuso.');
        return this.cambiato();
      case 'scegli':
        return this.scegli(c.indice);
      case 'aspetta':
        this.rispondi('Aspetto.');
        return this.cambiato();
      case 'non-ascoltare':
        return this.nonAscolto();
      case 'voce':
        return this.laVoce(c.come === 'accesa');
      case 'racconta':
        return this.racconta(c.su);
      case 'dimentica':
        return this.dimentica();
      case 'conferma':
        return this.conferma();
      case 'revoca':
        return this.revocaAbitudine();
      case 'salva-nota':
        return this.salvaNota(c.testo);
      case 'estrai':
        return this.estrai(c.notifica);
      case 'sciogli':
        return this.sciogli(c.task);
      case 'riassumi':
        return this.riassunto(c.task);
      case 'leggi':
        return this.leggi(c.task);
      case 'indietro':
        return this.indietro();
      case 'componi':
        return this.componiMessaggio(c.a, c.richiesta, c.testo);
      case 'aggiungi':
        return this.aggiungi(c.task, c.cosa);
      case 'riscrivi':
        return this.riscrivi(c.task);
      case 'no':
        this.rispondi('Va bene.');
        return this.cambiato();
      case 'dentro':
        return this.entra(c.task);
      case 'metti':
        return this.metti(c.task, c.gruppo);
      case 'apri':
        return this.apri(c.gruppo);
      case 'separa':
        return this.separa(c.gruppo);
      case 'consegna-gruppo':
        return this.consegnaGruppo(c.gruppo);
      case 'rimanda-gruppo':
        return this.rimandaGruppo(c.gruppo);
    }
  }

  // ─── l'archivio ──────────────────────────────────────────────────────────

  /**
   * Il microfono si spegne, e si entra in tastiera. Sta qui e non nel disegno perché
   * cambia **come si entra nel sistema**, e perché è un comando come «aspetta»: non
   * tocca un task, e passa dal motore comunque (docs/08-voce §4).
   *
   * Lo dice, e la riga è importante: quello che dice è **come si torna**. Riaccenderlo
   * non è una frase — è un gesto sul microfono in SYSTEMBAR — e se il sistema non lo
   * dicesse, spegnerlo sarebbe una porta che si chiude senza maniglia.
   */
  private nonAscolto(): void {
    if (!sente()) {
      this.rispondi('Il microfono è già spento: scrivi e ci sono.');
      return this.cambiato();
    }
    nonAscoltare();
    this.rispondi('Non ascolto più. Scrivi, e per riaccendermi premi il microfono.');
    this.cambiato();
  }

  /**
   * La voce in uscita, accesa o spenta. Passa dal motore come «aspetta» e come il
   * microfono: non tocca un task, ma cambia come il sistema ti risponde.
   *
   * La riga che dice spegnendosi è scritta, quella che dice accendendosi no: quando
   * riaccendi, **la risposta stessa è la prova** che la voce è tornata. Dirlo anche a
   * parole sarebbe dirlo due volte.
   */
  private laVoce(accesa: boolean): void {
    if (legge() === accesa) {
      this.rispondi(accesa ? 'Sto già leggendo ad alta voce.' : 'Sono già muta.');
      return this.cambiato();
    }
    leggiAVoce(accesa);
    this.rispondi(accesa ? 'Torno a leggere.' : 'Non leggo più: resta scritto.');
    this.cambiato();
  }

  /** Racconta contenuti, mai posizioni: i percorsi non escono da qui (docs/07-memoria §9). */
  private racconta(su: string): void {
    if (su === 'ultima') this.rispondi(this.archivio.raccontaUltima());
    else if (su === 'preferenze') this.rispondi(this.archivio.raccontaPreferenze());
    else this.rispondi(this.archivio.racconta(su));
    this.cambiato();
  }

  private dimentica(): void {
    const dove = this.archivio.dimentica(this.orologio.adesso());
    this.rispondi(dove ? `Dimenticato.` : 'Non ho niente di recente da dimenticare.');
    this.cambiato();
  }

  private conferma(): void {
    if (!this.inSospeso) {
      this.rispondi('Non ti ho chiesto niente.');
      return this.cambiato();
    }
    this.archivio.promuovi(this.inSospeso);
    this.inSospeso = undefined;
    this.rispondi('Va bene: d’ora in poi faccio da solo.');
    this.cambiato();
  }

  private revocaAbitudine(): void {
    const tolte = ['note', 'contatti', 'calendario', 'promemoria', 'disco']
      .map((d) => this.archivio.revoca(`consegna-${d}`))
      .filter(Boolean).length;
    this.inSospeso = undefined;
    this.rispondi(tolte ? 'Va bene, te lo chiedo sempre.' : 'Te lo chiedo già sempre.');
    this.cambiato();
  }

  /** Una cosa da far uscire verso le note: è la consegna più innocua che c'è. */
  private salvaNota(testo: string): void {
    const adesso = this.orologio.adesso();
    // L'uscita dice dove; quello che esce è l'esito del task (docs/01-modello §1).
    const uscita: Uscita = { destinazione: 'note', a: 'le tue note' };
    const t: Task = {
      id: `t${++this.contatore}`,
      origine: 'tua',
      tipo: 'documento',
      nome: testo.split(/\s+/).slice(0, 2).join(' '),
      luogo: 'APERTO',
      avanzamento: 'aspetta te',
      testo,
      uscita,
      nascita: adesso,
      tocco: adesso,
      frasi: [],
    };
    this.task.push(t);

    // Se l'hai autorizzata una volta per tutte, non si chiede: parte (docs/06-confini §6).
    if (this.archivio.dichiarato(abitudineDi(uscita))) {
      this.consegna(t.id);
      return;
    }
    this.alCentro(t.id, false);
    this.rispondi('La salvo nelle note?');
    this.cambiato();
  }

  /**
   * docs/01-modello §3 — una risposta a una delega non nasce mai due volte: rientra nel
   * task che l'ha generata, e se era caduto in MEMORIA risorge col nome di prima.
   */
  rientro(id: string, testo: string): void {
    const t = this.trova(id);
    if (!t) return;
    t.testo = testo;
    this.sposta(t, t.luogo === 'MEMORIA' ? 'CHIP' : t.luogo, 'aspetta te');
    this.rispondi(testo);
    this.cambiato();
  }

  /**
   * `lotto` c'è solo quando la consegna parte da «manda tutte»: allora l'annuncio e la
   * finestra di annullamento sono del lotto intero, non del singolo (docs/01-modello §6).
   */
  private consegna(id: string, lotto?: string): void {
    const t = this.trova(id);
    if (!t || !t.uscita) return;
    t.lotto = lotto;
    const servizio = this.registro[t.uscita.destinazione];
    if (!servizio) {
      this.blocca(t, `non ho un modo per scrivere su ${t.uscita.destinazione}`);
      return;
    }

    // Esce dalla pila e va avanti da sola: non ha più frasi da offrirti.
    this.sposta(t, 'CHIP', 'in corso');
    t.dato = 'invio';
    // In un lotto ha già parlato «manda tutte»: una voce sola per una decisione sola.
    if (!lotto) this.rispondi(`Mando ${t.nome.toLowerCase()}.`);
    this.cambiato();

    const uscita = t.uscita;
    // L'uscita dice dove e a chi; quello che esce è l'esito. Un task che consegna senza
    // aver prodotto niente manda la sua riga, ed è il caso della rubrica.
    const cosa = t.esito ?? t.testo;
    servizio
      .consegna(uscita, cosa)
      .then(() => {
        this.sposta(t, 'CHIP', 'consegnato');
        t.dato = 'FATTO';
        if (lotto) {
          this.chiudiLotto(lotto);
        } else {
          // La frase per annullare sta sotto il chip, non dentro la risposta: in INPUT
          // non entrano mai riferimenti a un task (docs/05-interfaccia §1).
          this.rispondi(`Mandata a ${uscita.a}.${this.forseProponi(uscita)}`);
          this.orologio.fra(REGOLE.annullamento, () => {
            if (t.avanzamento === 'consegnato') this.sposta(t, 'MEMORIA', 'consegnato');
            this.cambiato();
          });
        }
        this.cambiato();
      })
      .catch((e: unknown) => {
        const perche = e instanceof ConsegnaFallita ? e.perche : 'qualcosa è andato storto';
        this.blocca(t, perche);
        if (lotto) this.chiudiLotto(lotto);
        this.cambiato();
      });
  }

  /**
   * Un lotto si chiude quando nessuno dei suoi è più per aria. Solo allora il sistema
   * dice com'è andata — una volta sola — e apre **una** finestra di annullamento per
   * tutte: ciò che è partito insieme si annulla insieme (docs/01-modello §6).
   */
  private chiudiLotto(lotto: string): void {
    const membri = this.task.filter((x) => x.lotto === lotto);
    const ferme = membri.filter(
      (x) => x.avanzamento === 'consegnato' || x.avanzamento === 'bloccato',
    );
    if (ferme.length < membri.length) return;

    const partite = membri.filter((x) => x.avanzamento === 'consegnato');
    if (partite.length === membri.length) this.rispondi(`Mandate tutte e ${partite.length}.`);
    else if (partite.length === 0) this.rispondi('Non ne è partita nessuna.');
    else this.rispondi(`Ne sono partite ${partite.length} su ${membri.length}.`);
    if (partite.length === 0) return;

    this.orologio.fra(REGOLE.annullamento, () => {
      for (const x of this.task) {
        if (x.lotto === lotto && x.avanzamento === 'consegnato') {
          this.sposta(x, 'MEMORIA', 'consegnato');
        }
      }
      this.cambiato();
    });
  }

  /**
   * Alla terza volta che confermi la stessa consegna, osservato.md ha le prove e il
   * sistema propone. Solo per ciò che nessun altro vede (docs/06-confini §6).
   */
  private forseProponi(u: Uscita): string {
    if (!autorizzabile(u)) return '';
    const k = abitudineDi(u);
    if (this.archivio.dichiarato(k)) return '';
    this.archivio.osservaAbitudine(k, `le ${u.destinazione} le salvo io`, this.orologio.adesso());
    if (!this.archivio.daProporre(k)) return '';
    this.inSospeso = k;
    return ` Le ${u.destinazione} le salvo da solo, d’ora in poi?`;
  }

  private blocca(t: Task, perche: string): void {
    this.sposta(t, 'CHIP', 'bloccato');
    t.dato = 'FERMA';
    t.testo = `Non ho potuto mandarla: ${perche}.`;
    this.rispondi(`Non ho potuto mandare ${t.nome.toLowerCase()}: ${perche}.`);
  }

  private rimanda(id: string): void {
    const t = this.trova(id);
    if (!t) return;
    this.rimandaUno(t);
    // Metterla da parte non è perderla di vista: il sistema dice **fra quanto** te la
    // rimette davanti, e ti chiama per nome (deciso il 16 settembre 2026, docs/11-aperte).
    this.rispondi(`Perfetto ${primoNome(contesto.utilizzatore)}, te lo ricordo ${fraQuanto(REGOLE.rinvio)}.`);
    this.cambiato();
  }

  /** Il rinvio senza la voce: un gruppo che rimanda parla una volta sola, non N. */
  private rimandaUno(t: Task): void {
    const ora = new Date(this.orologio.adesso().getTime() + REGOLE.rinvio);
    t.ora = ora;
    this.sposta(t, 'ORARIO', 'programmato');
    t.dato = orario(ora);
    this.orologio.fra(REGOLE.rinvio - REGOLE.preavviso, () => {
      if (t.luogo === 'ORARIO') {
        this.sposta(t, 'ORARIO', 'aspetta te');
        this.cambiato();
      }
    });
  }

  /** Sposta il fuoco e basta: un richiamo non cambia mai l'avanzamento di niente. */
  private alCentro(id: string, parla = true): void {
    const t = this.trova(id);
    if (!t) return;
    for (const altro of this.in('MAIN')) {
      if (altro.id !== id) this.fuocoPrima = altro.id;
      this.sposta(altro, 'APERTO', altro.avanzamento);
    }
    this.sposta(t, 'MAIN', t.avanzamento);
    if (parla) this.rispondi(t.testo);
    this.cambiato();
  }

  private richiama(nome: string): void {
    const cercato = nome.toLowerCase();
    const t = this.task.find((x) => x.nome.toLowerCase().includes(cercato));
    if (!t) {
      this.rispondi(`Non ho niente che si chiami così.`);
      return this.cambiato();
    }
    this.alCentro(t.id);
  }

  private annulla(id: string): void {
    const t = this.trova(id);
    if (!t || t.avanzamento !== 'consegnato') return;
    // Ciò che è partito insieme si annulla insieme: «no, aspetta» su una del lotto le
    // ritira tutte, perché le hai mandate con una parola sola (docs/01-modello §6).
    const insieme = t.lotto
      ? this.task.filter((x) => x.lotto === t.lotto && x.avanzamento === 'consegnato')
      : [t];
    for (const x of insieme) {
      // Si torna al cancello, non a «in corso»: dopo una consegna il `precedente` è
      // sempre `in corso`, e rimetterlo lì farebbe dire al chip che il sistema sta
      // lavorando a una cosa che ha appena ritirato. Una consegna annullata è di nuovo
      // roba tua, pronta a ripartire (docs/01-modello §2, `aspetta te` è il cancello).
      this.sposta(x, 'CHIP', 'aspetta te');
      x.dato = undefined;
    }
    this.rispondi(
      insieme.length === 1
        ? `Annullata. ${t.nome} non è uscita.`
        : `Annullate tutte e ${insieme.length}. Non è uscito niente.`,
    );
    this.cambiato();
  }

  private lascia(id: string): void {
    const t = this.trova(id);
    if (!t) return;
    this.sposta(t, 'MEMORIA', 'concluso');
    this.rispondi('Lasciata stare.');
    this.cambiato();
  }

  private scegli(indice: number): void {
    // Dentro il cassetto, «la seconda» è la seconda notifica: l'ordinale vale sempre
    // dentro l'elenco che stai guardando, e non altrove.
    if (this.cassettoAperto()) {
      const elenco = [...this.notifiche].reverse();
      const n = elenco[indice - 1];
      if (!n) {
        this.rispondi('Non ce ne sono così tante.');
        return this.cambiato();
      }
      this.scelta = n.id;
      this.rispondi(n.testo);
      return this.cambiato();
    }
    const carte = this.in('CARTA');
    const t = carte[indice - 1];
    if (!t) {
      this.rispondi('Non ce ne sono così tante.');
      return this.cambiato();
    }
    // Portarla in cima: solo la prima ha voce.
    this.task.splice(this.task.indexOf(t), 1);
    this.task.push(t);
    this.espansa = null;
    this.aggiornaFrasi();
    this.rispondi(t.testo);
    this.cambiato();
  }

  // ─── il lavoro: riassumere, leggere, comporre ───────────────────────
  // Tre cose che non muovono un task da un posto all'altro: ne **fanno uno nuovo**.
  // Quello che le ha fatte nascere non si tocca (docs/09-catene §2).

  /**
   * Il riassunto. Nasce un task derivato che va avanti da solo e si vede andare avanti:
   * è l'unico modo che ha il sistema di dire «ci sto lavorando» senza una barra di
   * caricamento. Quando ha finito non parte niente: aspetta te.
   */
  private riassunto(id: string): void {
    const fonte = this.trova(id);
    if (!fonte) return;
    const adesso = this.orologio.adesso();
    const t: Task = {
      id: `t${++this.contatore}`,
      origine: 'derivata',
      tipo: 'documento',
      nome: `Riassunto ${fonte.nome.split(' ').pop()?.toLowerCase() ?? ''}`.trim(),
      luogo: 'APERTO',
      avanzamento: 'in corso',
      testo: `Sto leggendo ${fonte.nome.toLowerCase()}.`,
      dato: 'leggo',
      forma: 'riassunto',
      // Il riassunto nasce con dentro quello che deve leggere: è il suo ingresso.
      ingresso: fonte.ingresso ?? fonte.testo,
      nascita: adesso,
      tocco: adesso,
      frasi: [],
    };
    this.task.push(t);
    this.alCentro(t.id, false);
    this.rispondi('Certo, ci penso io.');
    this.cambiato();

    // L'avanzamento scorre nel tempo vero, come una consegna: il tempo del mondo si
    // muove a mano, ma quanto ci mette una cosa a essere fatta no.
    const passi = ['leggo', 'capisco', 'scrivo'];
    passi.forEach((parola, i) => {
      setTimeout(() => {
        if (t.avanzamento !== 'in corso') return;
        t.dato = parola;
        this.cambiato();
      }, 350 * (i + 1));
    });
    setTimeout(() => {
      if (t.avanzamento !== 'in corso') return;
      // Quello che ha prodotto è il suo esito; la riga è come lo diresti in un fiato,
      // e per un riassunto sono la stessa cosa (docs/01-modello §1).
      t.esito = riassumi(t.ingresso ?? '');
      t.testo = t.esito;
      t.dato = undefined;
      this.sposta(t, t.luogo, 'aspetta te');
      this.rispondi('Ho finito il riassunto che mi hai chiesto. Vuoi che te lo legga?');
      this.cambiato();
    }, 350 * (passi.length + 1));
  }

  /**
   * «me ne occupo»: una notifica esce dal cassetto e diventa un task. È l'unico punto in
   * cui una cosa arrivata entra nel modello — e non lo decide il filtro, lo decidi tu.
   *
   * Nasce `aspetta te` e va a fuoco: estrarre è prendere in mano. Il cassetto si chiude
   * da sé, perché quello che hai preso non è più lì dentro — un task in un posto solo.
   */
  private estrai(id: string): void {
    const i = this.notifiche.findIndex((n) => n.id === id);
    const n = this.notifiche[i];
    if (!n) {
      this.rispondi('Non ho capito quale.');
      return this.cambiato();
    }
    this.notifiche.splice(i, 1);
    const adesso = this.orologio.adesso();
    const t: Task = {
      id: `t${++this.contatore}`,
      origine: 'esterna',
      tipo: n.tipo,
      nome: n.nome,
      luogo: 'APERTO',
      avanzamento: 'aspetta te',
      testo: n.testo,
      ingresso: n.ingresso,
      esito: n.esito,
      fonte: n.fonte,
      uscita: n.uscita,
      nascita: adesso,
      tocco: adesso,
      frasi: [],
    };
    this.task.push(t);
    this.scelta = undefined;
    this.espansa = null;
    this.alCentro(t.id);
    this.cambiato();
  }

  /** Leggere è portare a fuoco **e** dire. Il richiamo da solo sposta e tace. */
  private leggi(id: string): void {
    const t = this.trova(id);
    if (!t) return;
    if (t.luogo === 'MAIN') {
      this.rispondi(t.testo);
      return this.cambiato();
    }
    this.alCentro(t.id);
  }

  /** Il fuoco fa un passo indietro. Niente cambia avanzamento: è solo dove guardi. */
  private indietro(): void {
    const prima = this.fuocoDiPrima();
    if (!prima) {
      this.rispondi('Non c’era niente prima di questa.');
      return this.cambiato();
    }
    this.alCentro(prima.id);
  }

  /**
   * Comporre. Il contatto si pesca mentre parli — è la prima cosa che si vede — e il
   * testo nasce in **discorso diretto**: non «chiedile a che ora», ma «a che ora ci
   * vediamo?». Non esce niente: la composizione è `aspetta te`, come ogni cosa che
   * aspetta una tua parola.
   */
  private componiMessaggio(a: string, richiesta: string, scritto?: string): void {
    const rubrica = this.registro.contatti;
    const chi = rubrica instanceof Contatti ? rubrica.cerca(a) : undefined;
    if (!chi) {
      this.rispondi(`Non so chi è ${a}.`);
      return this.cambiato();
    }
    if (!chi.recapito) {
      // Noto e senza recapito: si sa chi è, non gli si può scrivere (docs/07-memoria §4).
      this.rispondi(`Conosco ${chi.nome}, ma non ho un recapito suo.`);
      return this.cambiato();
    }
    const adesso = this.orologio.adesso();
    // Se l'AI engine l'ha scritto, è quello: non si riscrive il lavoro di chi pensa.
    const testo = scritto?.trim() || componi(richiesta, chi.nome);
    const t: Task = {
      id: `t${++this.contatore}`,
      origine: 'tua',
      tipo: 'conversazione',
      nome: `A ${chi.nome.toLowerCase()}`,
      luogo: 'APERTO',
      avanzamento: 'aspetta te',
      testo,
      forma: 'composizione',
      // Quello con cui nasce è la richiesta; quello che produce è il messaggio scritto.
      ingresso: richiesta,
      esito: testo,
      giro: 0,
      uscita: {
        destinazione: 'posta',
        a: chi.completo,
        destinatari: [chi.recapito],
      },
      nascita: adesso,
      tocco: adesso,
      frasi: [],
    };
    this.task.push(t);
    this.alCentro(t.id, false);
    this.rispondi('Vuoi che lo invii?');
    this.cambiato();
  }

  /** Aggiungere qualcosa a un messaggio composto. Cambia il testo, non lo manda. */
  private aggiungi(id: string, cosa: string): void {
    const t = this.trova(id);
    if (!t || !t.uscita || t.forma !== 'composizione') {
      this.rispondi('Non c’è niente da aggiungere.');
      return this.cambiato();
    }
    t.testo = aggiungiAl(t.testo, cosa);
    t.esito = t.testo;
    this.rispondi('Aggiunto.');
    this.cambiato();
  }

  /** La stessa richiesta, detta in un altro modo. Il giro serve a non ripetersi. */
  private riscrivi(id: string): void {
    const t = this.trova(id);
    if (!t || !t.uscita || t.forma !== 'composizione' || !t.ingresso) {
      this.rispondi('Non c’è niente da riscrivere.');
      return this.cambiato();
    }
    t.giro = (t.giro ?? 0) + 1;
    // Si riscrive dall'ingresso, non dall'esito: la richiesta è quella di sempre.
    t.testo = componi(t.ingresso, t.nome.replace(/^A /, ''), t.giro);
    t.esito = t.testo;
    this.rispondi('Riscritto. Va meglio?');
    this.cambiato();
  }

  /**
   * Un banco pulito. **Serve solo alla pedana** (docs/09-catene §6): un copione si legge
   * solo su uno schermo vuoto, o quello che avanza dal flusso di prima si prende i
   * comandi di questo. Nel sistema vero non esiste: una giornata non si azzera.
   */
  azzera(): void {
    this.task.length = 0;
    this.notifiche.length = 0;
    this.scelta = undefined;
    this.scambio.length = 0;
    this.mosse.length = 0;
    this.espansa = null;
    this.ultimaRisposta = '';
    this.fuocoPrima = undefined;
    this.inSospeso = undefined;
    this.cambiato();
  }

  // ─── stato ───────────────────────────────────────────────────────────────

  /** L'unico punto in cui luogo e avanzamento cambiano davvero. */
  private sposta(t: Task, luogo: Luogo, avanzamento: Avanzamento): void {
    // Il dentro segue il task: se se ne va dal centro, non ha più niente da mostrare e
    // si chiude da solo. Restare aperti su una cosa che non c'è più è mentire.
    const e = this.espansa;
    if (e && typeof e !== 'string' && 'dentro' in e && e.dentro === t.id && luogo !== 'MAIN') {
      this.espansa = null;
    }
    if (!combinazioneLegale(luogo, avanzamento)) {
      throw new Error(`combinazione impossibile: ${luogo} × ${avanzamento} (${t.nome})`);
    }
    if (t.avanzamento !== avanzamento) t.precedente = t.avanzamento;
    t.luogo = luogo;
    t.avanzamento = avanzamento;
    t.tocco = this.orologio.adesso();
    this.aggiornaFrasi();
  }

  in(luogo: Luogo): Task[] {
    return this.task.filter((t) => t.luogo === luogo);
  }

  // ─── i gruppi · docs/01-modello §6 ───────────────────────────────────────
  // L'unico posto del modello in cui l'ordine è tuo e non suo. Non si deducono dai
  // collegamenti e non si formano da soli: esistono perché l'hai detto.

  /** I gruppi visibili: si vedono dove si raggruppa, cioè in TASKBAR. */
  gruppi(): Gruppo[] {
    const per = new Map<string, Task[]>();
    for (const t of this.in('CHIP')) {
      if (!t.gruppo) continue;
      const membri = per.get(t.gruppo) ?? [];
      membri.push(t);
      per.set(t.gruppo, membri);
    }
    return [...per].map(([nome, membri]) => ({ nome, membri, parla: chiParla(membri) }));
  }

  gruppoAperto(): Gruppo | undefined {
    const e = this.espansa;
    if (!e || typeof e === 'string' || !('gruppo' in e)) return undefined;
    return this.gruppi().find((g) => g.nome === e.gruppo);
  }

  /** Il task aperto dentro, se ce n'è uno (docs/01-modello §7). */
  aperto(): Task | undefined {
    const e = this.espansa;
    if (!e || typeof e === 'string' || !('dentro' in e)) return undefined;
    return this.trova(e.dentro);
  }

  /**
   * «aprila». Mostra, non dice: leggerlo ad alta voce è un'altra frase. Non tocca né il
   * luogo né l'avanzamento — guardare non è un atto (docs/01-modello §7).
   */
  private entra(id: string): void {
    const t = this.trova(id);
    if (!t) return;
    // Dentro si vede una cosa sola, e vince l'esito (docs/01-modello §1).
    if (!dentroSiVede(t)) {
      this.rispondi('Non ha altro dentro: quello che c’è lo stai già vedendo.');
      return this.cambiato();
    }
    // La bolla a cui INPUT parla è una sola: aprirne una che non è al centro ce la porta.
    if (t.luogo !== 'MAIN') this.alCentro(t.id, false);
    this.espansa = { dentro: t.id };
    this.rispondi('Eccola per intero.');
    this.cambiato();
  }

  /** Ciò che la TASKBAR mostra davvero: i gruppi formati, e i chip rimasti soli. */
  elementi(): Array<{ readonly gruppo: Gruppo } | { readonly task: Task }> {
    const gruppi = new Map(this.gruppi().map((g) => [g.nome, g]));
    const visti = new Set<string>();
    const fuori: Array<{ readonly gruppo: Gruppo } | { readonly task: Task }> = [];
    for (const t of this.in('CHIP')) {
      const g = t.gruppo ? gruppi.get(t.gruppo) : undefined;
      if (!g) {
        fuori.push({ task: t });
        continue;
      }
      // Il gruppo prende il posto del suo primo membro: la fila non si riordina da sé.
      if (visti.has(g.nome)) continue;
      visti.add(g.nome);
      fuori.push({ gruppo: g });
    }
    return fuori;
  }

  /** Il gruppo nasce quando lo nomini. Un task sta al massimo in uno: nell'altro, migra. */
  private metti(id: string, nome: string): void {
    const t = this.trova(id);
    const g = nome.trim();
    if (!t || !g || t.luogo === 'MEMORIA') return;

    const prima = t.gruppo;
    if (prima === g) {
      this.rispondi(`È già con ${g}.`);
      return this.cambiato();
    }
    t.gruppo = g;
    // Si raggruppa ciò che hai in mano: metterci una carta la toglie dalla pila, e
    // l'avanzamento non si tocca — mettere via non è rimandare (docs/01-modello §6).
    if (t.luogo !== 'CHIP') this.sposta(t, 'CHIP', t.avanzamento);
    else this.aggiornaFrasi();

    const quanti = this.gruppi().find((x) => x.nome === g)?.membri.length ?? 1;
    const coda = quanti === 1 ? 'Per adesso è da sola.' : `Adesso ce ne sono ${quanti}.`;
    this.rispondi(prima ? `Spostata da ${prima} a ${g}. ${coda}` : `Messa con ${g}. ${coda}`);
    this.cambiato();
  }

  private apri(nome: string): void {
    const g = this.gruppi().find((x) => x.nome.toLowerCase() === nome.trim().toLowerCase());
    if (!g) {
      this.rispondi('Non ho nessun gruppo che si chiami così.');
      return this.cambiato();
    }
    this.espansa = { gruppo: g.nome };
    this.rispondi(`${g.nome}: ${cose(g.membri.length)}.`);
    this.cambiato();
  }

  /** Il gruppo smette di esistere. I chip non si muovono: erano già dove sono. */
  private separa(nome: string): void {
    const membri = this.task.filter((x) => x.gruppo === nome);
    if (membri.length === 0) return;
    for (const x of membri) x.gruppo = undefined;
    this.espansa = null;
    this.aggiornaFrasi();
    // Al singolare il numero secco non è dicibile — «le 1 cose» — e cambia anche il
    // resto della frase: non è un plurale da correggere, è un'altra frase.
    this.rispondi(
      membri.length === 1
        ? `${nome} non esiste più. L’unica cosa che c’era resta dov’era.`
        : `${nome} non esiste più. Le ${cose(membri.length)} restano dove sono.`,
    );
    this.cambiato();
  }

  /**
   * L'unica frase che fa attraversare il confine a più cose con una parola sola. Regge
   * su due vincoli, e li tiene tutti e due: **mai su un gruppo misto**, e il lotto si
   * annulla intero (docs/01-modello §6).
   */
  private consegnaGruppo(nome: string): void {
    const g = this.gruppi().find((x) => x.nome === nome);
    if (!g) return;
    const pronte = g.membri.every((x) => x.avanzamento === 'aspetta te' && x.uscita);
    if (!pronte) {
      this.rispondi(`Non sono tutte pronte a partire: queste te le devo far vedere una per una.`);
      return this.cambiato();
    }
    const lotto = `l${++this.lotti}`;
    const membri = [...g.membri];
    this.espansa = null;
    this.rispondi(`Mando tutte e ${membri.length}.`);
    this.cambiato();
    for (const x of membri) this.consegna(x.id, lotto);
  }

  private rimandaGruppo(nome: string): void {
    const g = this.gruppi().find((x) => x.nome === nome);
    if (!g) return;
    const quanti = g.membri.length;
    this.espansa = null;
    for (const x of [...g.membri]) this.rimandaUno(x);
    this.rispondi(
      `Perfetto ${primoNome(contesto.utilizzatore)}, ${quanti === 1 ? 'te lo' : `te le tutte e ${quanti}`} ricordo ${fraQuanto(REGOLE.rinvio)}.`,
    );
    this.cambiato();
  }

  /** La main è una sola: è quella a cui INPUT sta parlando. */
  main(): Task | undefined {
    return this.in('MAIN')[0];
  }

  /** La carta in cima alla pila. Solo lei ha voce. */
  inCima(): Task | undefined {
    const carte = this.in('CARTA');
    return carte[carte.length - 1];
  }

  /**
   * Il task a cui INPUT sta parlando: la main se c'è, altrimenti la carta in cima.
   * È lui che mostra le frasi, ed è lui il bersaglio di «manda», «dopo», «la seconda».
   */
  aFuoco(): Task | undefined {
    return this.main() ?? this.inCima();
  }

  /**
   * Dov'era il fuoco prima di adesso. Lo legge `indietro`, e lo legge la pedana: «torna
   * a quella di prima» vuol dire qualcosa solo se il fuoco si è già mosso una volta.
   */
  fuocoDiPrima(): Task | undefined {
    return this.fuocoPrima ? this.trova(this.fuocoPrima) : undefined;
  }

  /**
   * Se il sistema ti ha chiesto una cosa e aspetta un sì — oggi solo un'abitudine da
   * promuovere (docs/06-confini §6). Serve a sapere **quando** «sì, fai pure» è una
   * conferma e non un mandare: la stessa parola, due comandi.
   */
  domandaInSospeso(): boolean {
    return this.inSospeso !== undefined;
  }

  /** Le frasi che si possono dire adesso. Si mostrano sotto il task a fuoco. */
  frasiCorrenti(): Frase[] {
    const g = this.gruppoAperto();
    if (g) return frasiGruppo(g);
    // Il cassetto: la prima frase è quella che fa entrare una cosa nel modello, ed è
    // anche la più probabile — se apri il cassetto è perché qualcosa lì dentro ti serve.
    if (this.cassettoAperto()) {
      const n = this.notificaAFuoco();
      const f: Frase[] = [];
      if (n) f.push({ testo: 'me ne occupo', comando: { tipo: 'estrai', notifica: n.id } });
      if (this.notifiche.length > 1) f.push({ testo: 'la seconda', comando: { tipo: 'scegli', indice: 2 } });
      f.push({ testo: 'chiudi', comando: { tipo: 'chiudi' } });
      return f;
    }
    // Chiuso, con qualcosa di nuovo dentro: l'unica cosa da dire è aprirlo.
    if (this.conCassetto && this.daVedere() > 0 && !this.aFuoco()) {
      return [{ testo: 'apri', comando: { tipo: 'mostra', area: 'NOTIFICATIONBAR' } }];
    }
    // Dentro, le frasi restano le sue: sei ancora davanti a quel task, solo più vicino.
    // Tre più «chiudi», perché quattro è il tetto e «chiudi» è l'uscita (legge 01).
    const dentro = this.aperto();
    if (dentro) {
      return [...dentro.frasi.slice(0, 3), { testo: 'chiudi', comando: { tipo: 'chiudi' } }];
    }
    if (this.espansa === 'NOTIFICATIONBAR') {
      return [
        { testo: 'la seconda', comando: { tipo: 'scegli', indice: 2 } },
        { testo: 'chiudi', comando: { tipo: 'chiudi' } },
      ];
    }
    if (this.espansa) {
      return [{ testo: 'chiudi', comando: { tipo: 'chiudi' } }];
    }
    const t = this.aFuoco();
    return t ? t.frasi : [];
  }

  private trova(id: string): Task | undefined {
    return this.task.find((t) => t.id === id);
  }

  private aggiornaFrasi(): void {
    const carte = this.in('CARTA').length;
    const nomi = new Map(this.task.map((t) => [t.id, t.nome.toLowerCase()]));
    for (const t of this.task) t.frasi = frasiPer(t, carte, nomi);
  }

  /**
   * Cosa dice aprendo un'area. Il cassetto ne racconta **due cose in una frase** — quello
   * che è arrivato e quello che ti aspetta — perché adesso è un posto solo: WHEN non è
   * più un'area, è la metà futura di questo elenco (17 settembre 2026).
   */
  private descriviVista(area: 'NOTIFICATIONBAR' | 'TASKBAR'): string {
    if (area === 'TASKBAR') {
      const n = this.in('CHIP').length;
      return n === 0 ? 'Non hai niente in mano.' : `Hai in mano ${cose(n)}.`;
    }
    const piuTardi = this.in('ORARIO').length;
    const arrivate = this.conCassetto ? this.notifiche.length : this.in('CARTA').length;
    if (arrivate === 0 && piuTardi === 0) return 'Non è arrivato niente, e non ti aspetta niente.';
    if (arrivate === 0) return `Non è arrivato niente. Più tardi ${cose(piuTardi)}.`;
    const ultima = this.conCassetto
      ? this.notifiche[this.notifiche.length - 1]?.testo
      : this.inCima()?.testo;
    const apertura =
      arrivate === 1 ? `Una sola: ${ultima ?? ''}` : `${cose(arrivate)}. L’ultima: ${ultima ?? ''}`;
    return piuTardi === 0 ? apertura : `${apertura} E più tardi ${cose(piuTardi)}.`;
  }

  private rispondi(testo: string): void {
    this.ultimaRisposta = testo;
    const ultimo = this.scambio[this.scambio.length - 1];
    if (ultimo && ultimo.risposta === undefined) ultimo.risposta = testo;
    else {
      this.scambio.push({ tua: '', risposta: testo, quando: Date.now(), ora: this.orologio.adesso() });
      this.potaLaMemoria();
    }
    for (const v of this.voci) v(testo);
  }

  private cambiato(): void {
    for (const o of this.osservatori) o();
  }
}

/** Le frasi sono i comandi (legge 01). Massimo quattro, la prima è la più probabile. */
/**
 * Le frasi di un gruppo aperto. Massimo quattro, la prima è la più probabile, mai due
 * che fanno la stessa cosa (legge 01). «manda tutte» compare **solo** se sono tutte
 * pronte: su un gruppo misto non sapresti cosa parte (docs/01-modello §6).
 */
function frasiGruppo(g: Gruppo): Frase[] {
  const f: Frase[] = [];
  if (g.membri.every((t) => t.avanzamento === 'aspetta te' && t.uscita)) {
    f.push({ testo: 'manda tutte', comando: { tipo: 'consegna-gruppo', gruppo: g.nome } });
  }
  f.push({ testo: 'dopo', comando: { tipo: 'rimanda-gruppo', gruppo: g.nome } });
  f.push({ testo: 'separale', comando: { tipo: 'separa', gruppo: g.nome } });
  f.push({ testo: 'chiudi', comando: { tipo: 'chiudi' } });
  return f;
}

function frasiPer(t: Task, carte: number, nomi: Map<string, string> = new Map()): Frase[] {
  const f: Frase[] = [];
  if (t.luogo === 'CARTA') {
    if (t.uscita) f.push({ testo: 'manda', comando: { tipo: 'consegna', task: t.id } });
    f.push({ testo: 'dopo', comando: { tipo: 'rimanda', task: t.id } });
    f.push({ testo: 'portala al centro', comando: { tipo: 'al-centro', task: t.id } });
    if (carte > 1) f.push({ testo: 'fammi vedere le altre', comando: { tipo: 'mostra', area: 'NOTIFICATIONBAR' } });
    return f;
  }
  if (t.avanzamento === 'bloccato') {
    // Due forme: «non ho capito quale» offre le alternative, «non posso» le tre uscite.
    if (t.alternative?.length) {
      for (const id of t.alternative) {
        f.push({ testo: nomi.get(id) ?? id, comando: { tipo: 'sciogli', task: id } });
      }
      return f;
    }
    f.push({ testo: 'riprova', comando: { tipo: 'consegna', task: t.id } });
    f.push({ testo: 'lascia stare', comando: { tipo: 'lascia', task: t.id } });
    return f;
  }
  if (t.avanzamento === 'consegnato') {
    return [{ testo: 'no, aspetta', comando: { tipo: 'annulla', task: t.id } }];
  }
  // Una composizione offre i modi di cambiarla, non di mandarla: mandarla è la risposta
  // alla domanda che il sistema ha appena fatto, e si dice «sì».
  if (t.forma === 'composizione' && t.avanzamento === 'aspetta te') {
    f.push({ testo: 'aggiungi una emoji del cuore', comando: { tipo: 'aggiungi', task: t.id, cosa: 'una emoji del cuore' } });
    f.push({ testo: 'aggiungi un abbraccio', comando: { tipo: 'aggiungi', task: t.id, cosa: 'un abbraccio' } });
    f.push({ testo: 'riscrivilo', comando: { tipo: 'riscrivi', task: t.id } });
    f.push({ testo: 'lascia stare', comando: { tipo: 'lascia', task: t.id } });
    return f;
  }
  if (t.forma === 'riassunto' && t.avanzamento === 'aspetta te') {
    f.push({ testo: 'leggimelo', comando: { tipo: 'leggi', task: t.id } });
    f.push({ testo: 'metti da parte', comando: { tipo: 'rimanda', task: t.id } });
    f.push({ testo: 'lascia stare', comando: { tipo: 'lascia', task: t.id } });
    return f;
  }
  if (t.luogo === 'MAIN' && t.uscita) {
    f.push({ testo: 'manda', comando: { tipo: 'consegna', task: t.id } });
    f.push({ testo: 'dopo', comando: { tipo: 'rimanda', task: t.id } });
  }
  return f;
}

/** «fra due ore», «fra dieci minuti»: come si dice, non come si calcola. */
export function fraQuanto(ms: number): string {
  const minuti = Math.round(ms / MINUTO);
  if (minuti < 60) return `fra ${minuti} minuti`;
  const ore = Math.round(minuti / 60);
  return ore === 1 ? 'fra un’ora' : `fra ${numero(ore)} ore`;
}

const NUMERI = ['zero', 'una', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto'];
const numero = (n: number) => NUMERI[n] ?? String(n);

/**
 * «una cosa», «tre cose». Sta qui perché la stessa frase la scrivevano in quattro posti
 * e uno l'aveva scritta male: una risposta si legge ad alta voce, e «le 1 cose» non si
 * legge (docs/05-interfaccia §1).
 */
function cose(n: number): string {
  return n === 1 ? 'una cosa' : `${numero(n)} cose`;
}

/** Come ti chiama quando ti parla: il nome, non il nome e cognome. */
export function primoNome(intero: string): string {
  return intero.split(' ')[0] ?? intero;
}

export function orario(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
