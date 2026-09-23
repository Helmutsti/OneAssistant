// Il motore: l'unico posto dove una bolla cambia. L'AI e l'interfaccia chiedono, il motore
// controlla che la mossa sia ammessa da `docs/L01` e `docs/L02`, e la esegue o la rifiuta
// dicendo perché. Nessun altro modulo tocca lo stato.
//
// Tre regole attraversano tutto il file:
//
//   - **un task in un posto solo** (`docs/design/L0` legge 03): una bolla ha un luogo, e
//     cambiarlo è spostarla, mai copiarla;
//   - **il sistema non sposta mai una bolla di sua iniziativa** (`docs/L02` §DESK): ogni
//     spostamento qui dentro risponde a un'azione dell'utente, tranne i due che i
//     documenti prescrivono — il focus che manda le altre in SIDEBAR e le riporta, e
//     l'invio che resta in SIDEBAR durante la Funzione Delay;
//   - **nessun invio parte prima dei novanta secondi**, salvo il bypass esplicito, e
//     «no, aspetta» dentro la finestra impedisce davvero la chiamata (`docs/L01`).

import {
  DELAY_MS,
  colore,
  nomeValido,
  pulisciFrasi,
  type Bolla,
  type Documento,
  type Domanda,
  type Elemento,
  type Luogo,
  type Notifica,
  type Scambio,
  type Task,
  type Tipo,
  type Uscita,
} from './tipi.ts';
import type { Orologio } from './orologio.ts';

/** Una mossa che il modello non ammette. Il messaggio si può riportare all'AI così com'è. */
export class Rifiuto extends Error {
  constructor(messaggio: string) {
    super(messaggio);
    this.name = 'Rifiuto';
  }
}

/** Il confine verso i servizi: consegna una cosa e basta. Quello che torna è l'esito. */
export interface Consegna {
  (uscita: Uscita, cosa: string): Promise<void>;
}

/** Quello che l'interfaccia legge. Una fotografia: cambia intera a ogni mossa. */
export interface Fotografia {
  readonly versione: number;
  readonly bolle: readonly Bolla[];
  readonly notifiche: readonly Notifica[];
  readonly active?: string;
  readonly focus?: string;
  readonly domanda?: Domanda;
  readonly scambio?: Scambio;
  readonly cassettoAperto: boolean;
  /** L'AI sta pensando: INPUT mostra l'anello. */
  readonly pensa: boolean;
  /** Un guasto da dire a schermo, non in console (storico §7, §16). */
  readonly guasto?: string;
}

/** Le frasi che INPUT offre adesso, e perché. */
export interface FrasiInput {
  readonly da: 'domanda' | 'scambio' | 'bozza' | 'active' | 'niente';
  readonly frasi: readonly string[];
  /** La domanda, quando INPUT la sta facendo. Le sue risposte non hanno pallino. */
  readonly domanda?: string;
  /** Se la prima frase porta il pallino verde, la più probabile. */
  readonly pallino: boolean;
}

export interface NuovaBozza {
  tipo: Tipo;
  nome: string;
  richiesta: string;
  contesto?: Elemento[];
  frasi?: string[];
  uscita?: Uscita;
  /** Per un task da fare a un'ora: alla conferma aspetta in SIDEBAR finché l'ora non arriva. */
  ora?: number;
}

export interface NuovaNotifica {
  tipo: Tipo;
  servizio: string;
  mittente: string;
  oggetto: string;
  testo: string;
  promossa: boolean;
}

export class Motore {
  private bolle: Bolla[] = [];
  private notifiche: Notifica[] = [];
  private active?: string;
  private focus?: { id: string; spostate: string[] };
  private domande: Domanda[] = [];
  private scambio?: Scambio;
  private cassettoAperto = false;
  private pensa = false;
  /** I guasti da dire a schermo, per chi li ha visti: l'AI, la chat raw. */
  private readonly guasti = new Map<string, string>();
  private progressivo = 0;
  /** L'ordine d'arrivo nei luoghi, per la SIDEBAR. Non tocca gli id. */
  private arrivi = 0;
  private versione = 0;
  private foto!: Fotografia;
  private readonly ascoltatori = new Set<() => void>();
  /** Gli invii la cui chiamata al servizio è partita e non è ancora tornata. */
  private readonly inVolo = new Set<string>();
  /** I task entrati in `T_LAVORAZIONE` che aspettano che qualcuno li lavori. */
  private lavoro: string[] = [];

  constructor(
    private readonly orologio: Orologio,
    private readonly consegna: Consegna,
  ) {
    this.fotografa();
  }

  // ─── lettura ────────────────────────────────────────────────────

  fotografia(): Fotografia {
    return this.foto;
  }

  ascolta(fn: () => void): () => void {
    this.ascoltatori.add(fn);
    return () => this.ascoltatori.delete(fn);
  }

  adesso(): number {
    return this.orologio.adesso();
  }

  bolla(id: string): Bolla {
    const b = this.bolle.find((x) => x.id === id);
    if (!b) throw new Rifiuto(`non c'è nessuna bolla con id ${id}`);
    return b;
  }

  task(id: string): Task {
    const b = this.bolla(id);
    if (b.genere !== 'task') throw new Rifiuto(`${id} è un documento, non un task`);
    return b;
  }

  /** La bozza che la dropzone mostra, se c'è. Al massimo una (`docs/L01`). */
  bozzaInDropzone(): Task | undefined {
    return this.bolle.find((b): b is Task => b.genere === 'task' && b.luogo === 'DROPZONE');
  }

  /**
   * Le frasi di INPUT. Stanno qui, e solo qui (`docs/design/L0` §INPUT), e vengono da una
   * fonte sola alla volta: la domanda aperta, poi le frasi dell'ultima risposta, poi la
   * bozza in formazione, poi la bolla active.
   */
  frasiInput(): FrasiInput {
    const d = this.domande[0];
    if (d) return { da: 'domanda', frasi: d.risposte, domanda: d.testo, pallino: false };
    if (this.scambio?.frasi?.length) return { da: 'scambio', frasi: this.scambio.frasi, pallino: true };
    const bozza = this.bozzaInDropzone();
    if (bozza) return { da: 'bozza', frasi: bozza.frasi, pallino: bozza.frasi.length > 0 };
    const a = this.active ? this.bolle.find((b) => b.id === this.active) : undefined;
    if (a) {
      const frasi = [...a.frasi];
      // Quando la active è ambra, fra le frasi c'è «mettila da parte»: un suggerimento, e
      // basta — la bolla si sposta solo se l'utente lo dice (`docs/L02` §SIDEBAR).
      if (colore(a, this.adesso()) === 'ambra' && frasi.length < 4 && !frasi.some((f) => /da parte/i.test(f))) {
        frasi.push('mettila da parte');
      }
      return { da: 'active', frasi, pallino: frasi.length > 0 };
    }
    return { da: 'niente', frasi: [], pallino: false };
  }

  /**
   * Il prossimo task da lavorare, se c'è. Lo prende chi fa il lavoro — l'AI, dal lato del
   * task — e lo toglie dalla coda: un task si lavora una volta per ogni volta che entra
   * in `T_LAVORAZIONE`.
   */
  prendiLavoro(): Task | undefined {
    while (this.lavoro.length) {
      const id = this.lavoro.shift()!;
      const t = this.bolle.find((b): b is Task => b.genere === 'task' && b.id === id);
      if (t && t.stato === 'T_LAVORAZIONE' && !t.invio) return t;
    }
    return undefined;
  }

  /** Il badge: solo quello che ti riguarda e non hai ancora visto. */
  badge(): number {
    return this.notifiche.filter((n) => n.promossa && n.nuova).length;
  }

  // ─── lo scambio ──────────────────────────────────────────────────

  /** L'utente ha scritto e premuto invio. Si apre uno scambio nuovo. */
  dici(testo: string): void {
    this.scambio = { tua: testo };
    this.cambia();
  }

  /** La risposta del sistema, in INPUT. */
  rispondi(testo: string): string {
    const t = testo.trim();
    if (!t) throw new Rifiuto('la risposta è vuota');
    this.scambio = { ...(this.scambio ?? { tua: '' }), risposta: t };
    this.cambia();
    return 'risposta mostrata in INPUT';
  }

  pensando(si: boolean): void {
    this.pensa = si;
    this.cambia();
  }

  /** Un guasto, per chi l'ha visto. `undefined` lo toglie. */
  segnalaGuasto(chi: string, testo: string | undefined): void {
    if (testo) this.guasti.set(chi, testo);
    else this.guasti.delete(chi);
    this.cambia();
  }

  // ─── la bozza ────────────────────────────────────────────────────

  /**
   * Richiesta e contesto formano un task, che nasce in `T_DRAFT` nella dropzone e non
   * parte finché l'utente non lo conferma (`docs/L01`).
   *
   * Se la dropzone è già occupata, la bozza che c'era va in SIDEBAR, ancora bozza: la
   * stessa regola della notifica accettata (`docs/L01`, storico §133).
   */
  componi(b: NuovaBozza, origine: Task['origine'] = 'utente'): Task {
    const errore = nomeValido(b.nome);
    if (errore) throw new Rifiuto(errore);
    if (!b.richiesta.trim()) throw new Rifiuto('una bozza ha bisogno della richiesta');
    const occupante = this.bozzaInDropzone();
    if (occupante) this.sposta(occupante, 'SIDEBAR');
    const t: Task = {
      genere: 'task',
      id: this.nuovoId('t'),
      tipo: b.tipo,
      nome: b.nome.trim(),
      stato: 'T_DRAFT',
      luogo: 'DROPZONE',
      richiesta: b.richiesta.trim(),
      contesto: [...(b.contesto ?? [])],
      frasi: pulisciFrasi(b.frasi ?? []),
      note: [],
      uscita: b.uscita,
      ora: b.ora,
      origine,
      arrivo: this.adesso(),
    };
    this.bolle.push(t);
    this.cambia();
    return t;
  }

  /** La bozza cambia: il nome, la richiesta, le cose agganciate, le frasi. Solo in `T_DRAFT`. */
  modificaBozza(
    id: string,
    p: Partial<Pick<NuovaBozza, 'tipo' | 'nome' | 'richiesta' | 'contesto' | 'frasi' | 'uscita' | 'ora'>>,
  ): Task {
    const t = this.task(id);
    if (t.stato !== 'T_DRAFT') throw new Rifiuto(`${t.nome} non è una bozza: è già partito`);
    if (p.nome !== undefined) {
      const errore = nomeValido(p.nome);
      if (errore) throw new Rifiuto(errore);
      t.nome = p.nome.trim();
    }
    if (p.tipo) t.tipo = p.tipo;
    if (p.richiesta !== undefined) t.richiesta = p.richiesta.trim();
    if (p.contesto) t.contesto = [...p.contesto];
    if (p.frasi) t.frasi = pulisciFrasi(p.frasi);
    if (p.uscita) t.uscita = p.uscita;
    if (p.ora !== undefined) t.ora = p.ora;
    this.cambia();
    return t;
  }

  /** Una bozza non confermata non diventa mai un task e non lascia traccia (`docs/L01`). */
  scarta(id: string): void {
    const t = this.task(id);
    if (t.stato !== 'T_DRAFT') throw new Rifiuto(`${t.nome} non è una bozza: non si scarta`);
    this.togli(t.id);
    this.cambia();
  }

  /**
   * L'utente conferma: la bozza lascia la dropzone ed entra in DESK, in `T_LAVORAZIONE`.
   * Una bozza in SIDEBAR va prima richiamata nella dropzone: si conferma quello che si
   * vede. Un task con un'ora futura aspetta in SIDEBAR come chip con un'ora.
   */
  conferma(id: string): Task {
    const t = this.task(id);
    if (t.stato !== 'T_DRAFT') throw new Rifiuto(`${t.nome} è già partito`);
    if (t.luogo !== 'DROPZONE') throw new Rifiuto(`${t.nome} non è nella dropzone: va richiamata prima`);
    if (t.ora !== undefined && t.ora > this.adesso()) {
      t.stato = 'T_ATTESA';
      t.attesa = 'ora';
      t.perOra = 'programmato';
      this.sposta(t, 'SIDEBAR');
    } else {
      t.ora = undefined;
      t.stato = 'T_LAVORAZIONE';
      t.frasi = [];
      this.sposta(t, 'DESK');
      this.lavoro.push(t.id);
    }
    this.cambia();
    return t;
  }

  // ─── il lavoro ───────────────────────────────────────────────────

  /**
   * Un sotto-task autonomo nasce già in `T_LAVORAZIONE`: non è la bozza di nessuno e non
   * passa dalla dropzone (`docs/L01`).
   *
   * Compare in DESK (storico §138).
   */
  sottotask(genitore: string, b: Omit<NuovaBozza, 'ora'>): Task {
    const g = this.task(genitore);
    if (g.stato !== 'T_LAVORAZIONE') throw new Rifiuto(`${g.nome} non sta lavorando: non fa nascere sotto-task`);
    const errore = nomeValido(b.nome);
    if (errore) throw new Rifiuto(errore);
    const t: Task = {
      genere: 'task',
      id: this.nuovoId('t'),
      tipo: b.tipo,
      nome: b.nome.trim(),
      stato: 'T_LAVORAZIONE',
      luogo: 'DESK',
      richiesta: b.richiesta.trim(),
      contesto: [...(b.contesto ?? [])],
      frasi: pulisciFrasi(b.frasi ?? []),
      note: [],
      uscita: b.uscita,
      origine: 'sottotask',
      genitore: g.id,
      arrivo: this.adesso(),
    };
    this.bolle.push(t);
    this.lavoro.push(t.id);
    this.cambia();
    return t;
  }

  /** Mentre lavora: l'avanzamento nel corpo, e un dato per il chip. */
  avanza(id: string, corpo?: string, dato?: string): Task {
    const t = this.task(id);
    if (t.stato !== 'T_LAVORAZIONE') throw new Rifiuto(`${t.nome} non sta lavorando`);
    if (corpo !== undefined) t.corpo = corpo;
    if (dato !== undefined) t.dato = dato;
    this.cambia();
    return t;
  }

  /**
   * Il sistema ha bisogno di sapere: la domanda compare in INPUT, e il task passa ad
   * ambra finché non rispondi. Una domanda aperta alla volta; le altre aspettano il turno
   * (`docs/design/L3 - Flusso task`).
   */
  chiedi(id: string, testo: string, risposte: readonly string[]): Task {
    const t = this.task(id);
    if (t.stato !== 'T_LAVORAZIONE') throw new Rifiuto(`${t.nome} non sta lavorando: non può chiedere`);
    if (!testo.trim()) throw new Rifiuto('la domanda è vuota');
    t.stato = 'T_ATTESA';
    t.attesa = 'risposta';
    this.domande.push({ task: t.id, testo: testo.trim(), risposte: pulisciFrasi(risposte) });
    this.cambia();
    return t;
  }

  /** La risposta alla domanda aperta: la domanda si chiude, e il task torna a lavorare. */
  rispondiDomanda(risposta: string): { task: Task; domanda: Domanda } {
    const d = this.domande[0];
    if (!d) throw new Rifiuto('non c’è nessuna domanda aperta');
    if (!risposta.trim()) throw new Rifiuto('la risposta è vuota');
    const t = this.task(d.task);
    this.domande.shift();
    t.stato = 'T_LAVORAZIONE';
    t.attesa = undefined;
    t.note.push(`Domanda: ${d.testo} Risposta: ${risposta.trim()}`);
    this.lavoro.push(t.id);
    this.cambia();
    return { task: t, domanda: d };
  }

  /**
   * Il lavoro è pronto e aspetta la parola dell'utente: la palla è sua. La bolla diventa
   * la active, e non cambia misura né posto (`docs/design/L3 - Flusso task`, battuta 7).
   */
  pronto(id: string, corpo: string, frasi: readonly string[]): Task {
    const t = this.task(id);
    if (t.stato !== 'T_LAVORAZIONE') throw new Rifiuto(`${t.nome} non sta lavorando`);
    t.stato = 'T_ATTESA';
    t.attesa = 'parola';
    t.corpo = corpo;
    t.esito = corpo;
    t.frasi = pulisciFrasi(frasi);
    if (t.luogo === 'DESK') this.active = t.id;
    this.cambia();
    return t;
  }

  /** Non può proseguire da solo. Resta ambra: a sbloccarlo è l'utente (`docs/L01`). */
  fermo(id: string, perche: string, frasi: readonly string[] = []): Task {
    const t = this.task(id);
    if (t.stato !== 'T_LAVORAZIONE') throw new Rifiuto(`${t.nome} non sta lavorando`);
    t.stato = 'T_ATTESA';
    t.attesa = 'fermo';
    t.corpo = perche;
    t.frasi = pulisciFrasi(frasi);
    this.cambia();
    return t;
  }

  /**
   * L'input che il task aspettava è arrivato: richiesta o contesto si aggiornano e il
   * task torna in `T_LAVORAZIONE` (`docs/L01`).
   */
  riprendi(id: string, richiesta?: string, contesto?: Elemento[]): Task {
    const t = this.task(id);
    if (t.stato !== 'T_ATTESA') throw new Rifiuto(`${t.nome} non sta aspettando`);
    if (t.attesa === 'risposta') throw new Rifiuto(`${t.nome} aspetta la risposta a una domanda`);
    if (richiesta) {
      t.note.push(`L'utente ha chiesto: ${richiesta.trim()}`);
      t.richiesta = richiesta.trim();
    }
    if (contesto) t.contesto = [...contesto];
    t.stato = 'T_LAVORAZIONE';
    t.attesa = undefined;
    t.ora = undefined;
    t.perOra = undefined;
    t.frasi = [];
    this.lavoro.push(t.id);
    this.cambia();
    return t;
  }

  /**
   * Ha terminato il suo scopo. Se non esce niente, svanisce sul posto e lascia
   * l'interfaccia (`docs/L01`). Se ha un'uscita, si passa dall'invio: la Delay solo se attraversa il confine.
   */
  concludi(id: string): Task {
    const t = this.task(id);
    if (t.stato === 'T_DRAFT') throw new Rifiuto(`${t.nome} è una bozza: prima va confermata`);
    if (t.invio) throw new Rifiuto(`${t.nome} ha già un invio in corso`);
    if (t.uscita) return this.invia(id);
    this.finisci(t);
    return t;
  }

  // ─── la Funzione Delay ───────────────────────────────────────────

  /**
   * L'invio. Senza bypass la chiamata al servizio aspetta novanta secondi: il task resta
   * in SIDEBAR, azzurro, perché l'invio non è partito e in quella finestra è ancora
   * `T_LAVORAZIONE` (`docs/L01` §Il colore di uno stato). Col bypass parte subito, ed è
   * definitivo. Un task ha un invio solo alla volta: un secondo «manda» non ne fa due.
   */
  invia(id: string, bypass = false): Task {
    const t = this.task(id);
    if (t.stato === 'T_DRAFT') throw new Rifiuto(`${t.nome} è una bozza: prima va confermata`);
    if (!t.uscita) throw new Rifiuto(`${t.nome} non ha niente da mandare`);
    if (t.uscita.attraversaConfine && !t.esito?.trim()) {
      throw new Rifiuto(`${t.nome} non è ancora stato scritto: non c'è niente da mandare`);
    }
    if (t.invio) {
      if (!bypass || t.invio.bypass || this.inVolo.has(t.invio.id)) {
        throw new Rifiuto(`${t.nome} ha già un invio in corso`);
      }
      // «manda subito» dentro la finestra: lo stesso invio, senza aspettare. Il bypass
      // vale solo per questo invio (`docs/L01`).
      t.invio = { ...t.invio, scadenza: this.adesso(), bypass: true };
      this.lascia(t);
      return t;
    }
    if (!t.uscita.attraversaConfine) {
      // Salvare in locale non attraversa il confine, e parte subito (`docs/L01` §Importante).
      t.invio = { id: this.nuovoId('i'), scadenza: this.adesso(), bypass: false };
      this.lascia(t);
      return t;
    }
    t.stato = 'T_LAVORAZIONE';
    t.attesa = undefined;
    // Le frasi restano: se «no, aspetta» lo ferma, il task torna a chiedere con le sue.
    t.invio = { id: this.nuovoId('i'), scadenza: bypass ? this.adesso() : this.adesso() + DELAY_MS, bypass };
    if (bypass) {
      this.lascia(t);
      return t;
    }
    if (this.active === t.id) this.active = undefined;
    this.sposta(t, 'SIDEBAR');
    if (this.scambio) this.scambio = { ...this.scambio, frasi: ['manda subito', 'no, aspetta'] };
    this.cambia();
    return t;
  }

  /**
   * «No, aspetta»: dentro la finestra l'invio si annulla prima che raggiunga il servizio,
   * e il task si può modificare. Fuori finestra non si dichiara il falso: si dice che è
   * partito (`docs/L01`, audit F-001 … F-003).
   *
   * Dirlo è richiamare il task: torna da solo in DESK e diventa la active. Resta in
   * SIDEBAR solo se l'utente lo specifica (storico §134).
   */
  annullaInvio(id: string, restaInSidebar = false): Task {
    const t = this.task(id);
    if (!t.invio) throw new Rifiuto(`${t.nome} non ha nessun invio in corso`);
    if (t.invio.bypass) throw new Rifiuto(`${t.nome} è partito col bypass: l'invio è definitivo`);
    if (this.inVolo.has(t.invio.id) || this.adesso() >= t.invio.scadenza) {
      throw new Rifiuto(`${t.nome} è già partito: non si può più fermare`);
    }
    t.invio = undefined;
    t.stato = 'T_ATTESA';
    t.attesa = 'parola';
    if (this.scambio?.frasi) this.scambio = { ...this.scambio, frasi: undefined };
    if (!restaInSidebar && t.luogo === 'SIDEBAR') {
      this.sposta(t, 'DESK');
      this.active = t.id;
    }
    this.cambia();
    return t;
  }

  /**
   * Il battito. Lo chiama l'app una volta al secondo, e i test quando fanno saltare
   * l'orologio: fa partire gli invii maturi e riaccende i rimandati scaduti.
   */
  batti(): void {
    const ora = this.adesso();
    let cambiato = false;
    for (const b of [...this.bolle]) {
      if (b.genere !== 'task') continue;
      if (b.invio && !this.inVolo.has(b.invio.id) && ora >= b.invio.scadenza) {
        this.lascia(b);
      } else if (b.stato === 'T_ATTESA' && b.attesa === 'ora' && b.ora !== undefined && b.ora <= ora) {
        // Quando l'ora scade il rimandato diventa ambra **dove si trova**: non torna in
        // DESK e non diventa una notifica (`docs/L02` §SIDEBAR).
        b.attesa = 'parola';
        b.ora = undefined;
        cambiato = true;
      }
    }
    if (cambiato) this.cambia();
  }

  /** La chiamata vera al servizio. Da qui in poi l'invio non si ferma più. */
  private lascia(t: Task): void {
    const invio = t.invio;
    if (!invio || !t.uscita) return;
    this.inVolo.add(invio.id);
    if (this.scambio?.frasi) this.scambio = { ...this.scambio, frasi: undefined };
    this.cambia();
    // Esce quello che il lavoro ha prodotto. Salvare in locale può uscire anche senza.
    const cosa = t.esito ?? t.richiesta;
    this.consegna(t.uscita, cosa).then(
      () => {
        this.inVolo.delete(invio.id);
        // Un task tolto nel frattempo non risorge (audit F-004).
        if (!this.bolle.includes(t) || t.invio?.id !== invio.id) return;
        t.invio = undefined;
        this.finisci(t);
      },
      (e: unknown) => {
        this.inVolo.delete(invio.id);
        if (!this.bolle.includes(t) || t.invio?.id !== invio.id) return;
        t.invio = undefined;
        t.stato = 'T_ATTESA';
        t.attesa = 'fermo';
        t.corpo = `Non è partita: ${e instanceof Error ? e.message : String(e)}`;
        this.cambia();
      },
    );
  }

  // ─── dove stanno le cose ────────────────────────────────────────

  /** La bolla a cui INPUT sta parlando. Una sola, in DESK. */
  rendiActive(id: string): Bolla {
    const b = this.bolla(id);
    if (b.luogo !== 'DESK') throw new Rifiuto(`${b.nome} non è sulla scrivania: va richiamata prima`);
    this.active = b.id;
    this.cambia();
    return b;
  }

  /** «Mettila da parte»: dalla DESK o dalla dropzone alla SIDEBAR. Una bozza resta bozza. */
  mettiDaParte(id: string): Bolla {
    const b = this.bolla(id);
    if (b.luogo === 'SIDEBAR') throw new Rifiuto(`${b.nome} è già in SIDEBAR`);
    this.sposta(b, 'SIDEBAR');
    this.cambia();
    return b;
  }

  /**
   * Un chip richiamato per nome torna in DESK. Una bozza torna nella dropzone, e quella
   * che c'era va in SIDEBAR: la dropzone ne mostra una alla volta.
   */
  richiama(id: string): Bolla {
    const b = this.bolla(id);
    if (b.luogo !== 'SIDEBAR') throw new Rifiuto(`${b.nome} non è in SIDEBAR`);
    if (b.genere === 'task' && b.stato === 'T_DRAFT') {
      const occupante = this.bozzaInDropzone();
      if (occupante) this.sposta(occupante, 'SIDEBAR');
      this.sposta(b, 'DROPZONE');
    } else {
      if (b.genere === 'task' && b.invio) throw new Rifiuto(`${b.nome} sta partendo: resta in SIDEBAR finché non parte`);
      this.sposta(b, 'DESK');
      this.active = b.id;
    }
    this.cambia();
    return b;
  }

  /**
   * «Dopo»: il task aspetta un'ora, non chiede niente fino ad allora, e sta in SIDEBAR
   * come chip con un'ora (`docs/design/L0` legge 03).
   */
  rimanda(id: string, ora: number): Task {
    const t = this.task(id);
    if (t.stato === 'T_DRAFT') throw new Rifiuto(`${t.nome} è una bozza: si mette da parte, non si rimanda`);
    if (t.invio) throw new Rifiuto(`${t.nome} sta partendo: «no, aspetta» prima di rimandarlo`);
    if (ora <= this.adesso()) throw new Rifiuto("l'ora di un rimando dev'essere futura");
    this.domande = this.domande.filter((d) => d.task !== t.id);
    t.stato = 'T_ATTESA';
    t.attesa = 'ora';
    t.ora = ora;
    t.perOra = 'rimandato';
    if (t.luogo !== 'SIDEBAR') this.sposta(t, 'SIDEBAR');
    this.cambia();
    return t;
  }

  /**
   * Il focus: la bolla si allarga e diventa la cosa principale, e tutte le altre bolle
   * di DESK passano in SIDEBAR. All'uscita tornano da sole dov'erano (`docs/L02` §DESK).
   */
  apriFocus(id: string): Bolla {
    if (this.focus) this.esciFocus();
    const b = this.bolla(id);
    if (b.luogo === 'DROPZONE') throw new Rifiuto(`${b.nome} è una bozza nella dropzone`);
    if (b.luogo === 'SIDEBAR') this.richiama(id);
    const spostate: string[] = [];
    for (const x of this.bolle) {
      if (x.id !== b.id && x.luogo === 'DESK') {
        this.sposta(x, 'SIDEBAR');
        spostate.push(x.id);
      }
    }
    this.focus = { id: b.id, spostate };
    this.active = b.id;
    this.cambia();
    return b;
  }

  esciFocus(): void {
    if (!this.focus) throw new Rifiuto('non c’è nessuna bolla in focus');
    for (const id of this.focus.spostate) {
      const x = this.bolle.find((b) => b.id === id);
      // Torna solo quello che è ancora dove il focus l'aveva messo.
      if (x && x.luogo === 'SIDEBAR' && !(x.genere === 'task' && x.invio)) this.sposta(x, 'DESK');
    }
    this.focus = undefined;
    this.cambia();
  }

  // ─── la bolla documento ─────────────────────────────────────────

  /** Si apre al centro dello schermo, non dalla dropzone (`docs/L02` §La bolla documento). */
  mostraDocumento(d: Omit<Documento, 'genere' | 'id' | 'luogo' | 'arrivo' | 'frasi'> & { frasi?: string[] }): Documento {
    const doc: Documento = {
      genere: 'documento',
      id: this.nuovoId('d'),
      tipo: d.tipo,
      nome: d.nome,
      contenuto: d.contenuto,
      provenienza: d.provenienza,
      luogo: 'DESK',
      frasi: pulisciFrasi(d.frasi ?? []),
      arrivo: this.adesso(),
    };
    this.bolle.push(doc);
    this.active = doc.id;
    this.cambia();
    return doc;
  }

  /** La chiude l'utente. È una delle due uscite della bolla documento. */
  chiudiDocumento(id: string): void {
    const b = this.bolla(id);
    if (b.genere !== 'documento') throw new Rifiuto(`${b.nome} è un task: un task non si chiude, si conclude`);
    this.togli(id);
    this.cambia();
  }

  /** L'altra uscita: il documento diventa uno degli elementi agganciati al task. */
  assorbi(documento: string, task: string): Task {
    const d = this.bolla(documento);
    if (d.genere !== 'documento') throw new Rifiuto(`${d.nome} non è un documento`);
    const t = this.task(task);
    if (t.stato === 'T_CONCLUSIONE') throw new Rifiuto(`${t.nome} ha già finito`);
    t.contesto = [...t.contesto, { tipo: d.tipo, nome: d.nome }];
    this.togli(d.id);
    this.cambia();
    return t;
  }

  // ─── le notifiche ────────────────────────────────────────────────

  /** Una cosa arrivata dal mondo. `quando` è l'ora in cui è arrivata, se il servizio la dice. */
  arriva(n: NuovaNotifica & { quando?: number }): Notifica {
    const x: Notifica = { ...n, id: this.nuovoId('n'), quando: n.quando ?? this.adesso(), nuova: true };
    this.notifiche.push(x);
    this.cambia();
    return x;
  }

  /** Aprire il cassetto azzera il badge: averle viste è averle viste. */
  apriCassetto(): void {
    for (const n of this.notifiche) n.nuova = false;
    this.cassettoAperto = true;
    this.cambia();
  }

  chiudiCassetto(): void {
    this.cassettoAperto = false;
    this.cambia();
  }

  /**
   * «Me ne occupo»: la notifica diventa una bozza nella dropzone, mai un lavoro già
   * avviato. Se la dropzone è occupata, la bozza in corso va in SIDEBAR. Il cassetto si
   * richiude da sé: l'apertura è un momento, non una schermata (`docs/L01`, `docs/L02`).
   */
  occupatene(notifica: string, b: Pick<NuovaBozza, 'nome' | 'richiesta' | 'frasi' | 'uscita'>): Task {
    const n = this.notifiche.find((x) => x.id === notifica);
    if (!n) throw new Rifiuto(`non c'è nessuna notifica con id ${notifica}`);
    const t = this.componi(
      {
        tipo: n.tipo,
        nome: b.nome,
        richiesta: b.richiesta,
        contesto: [{ tipo: n.tipo, nome: n.mittente, dato: n.oggetto }],
        frasi: b.frasi,
        uscita: b.uscita,
      },
      'notifica',
    );
    this.notifiche = this.notifiche.filter((x) => x.id !== n.id);
    this.cassettoAperto = false;
    this.cambia();
    return t;
  }

  // ─── interni ─────────────────────────────────────────────────────

  private finisci(t: Task): void {
    t.stato = 'T_CONCLUSIONE';
    // Un task in `T_CONCLUSIONE` non si vede: svanisce sul posto e lascia l'interfaccia.
    // Non diventa memoria (`docs/design/L0` legge 03, storico §5).
    this.togli(t.id);
    this.cambia();
  }

  private sposta(b: Bolla, dove: Luogo): void {
    if (b.genere === 'documento' && dove === 'DROPZONE') throw new Rifiuto('un documento non va nella dropzone');
    if (dove === 'DROPZONE' && (b.genere !== 'task' || b.stato !== 'T_DRAFT')) {
      throw new Rifiuto('nella dropzone sta solo una bozza');
    }
    b.luogo = dove as never;
    b.arrivo = this.adesso() + ++this.arrivi / 1000;
    if (dove !== 'DESK' && this.active === b.id) this.active = undefined;
  }

  private togli(id: string): void {
    this.bolle = this.bolle.filter((b) => b.id !== id);
    this.domande = this.domande.filter((d) => d.task !== id);
    if (this.active === id) this.active = undefined;
    if (this.focus?.id === id) this.esciFocusSenzaCambio();
  }

  private esciFocusSenzaCambio(): void {
    const f = this.focus;
    this.focus = undefined;
    for (const id of f?.spostate ?? []) {
      const x = this.bolle.find((b) => b.id === id);
      if (x && x.luogo === 'SIDEBAR' && !(x.genere === 'task' && x.invio)) this.sposta(x, 'DESK');
    }
  }

  private nuovoId(prefisso: string): string {
    return `${prefisso}${++this.progressivo}`;
  }

  private fotografa(): void {
    this.foto = {
      versione: this.versione,
      bolle: this.bolle.map((b) =>
        b.genere === 'task'
          ? { ...b, frasi: [...b.frasi], note: [...b.note], contesto: [...b.contesto] }
          : { ...b, frasi: [...b.frasi] },
      ),
      notifiche: this.notifiche.map((n) => ({ ...n })),
      active: this.active,
      focus: this.focus?.id,
      domanda: this.domande[0],
      scambio: this.scambio ? { ...this.scambio } : undefined,
      cassettoAperto: this.cassettoAperto,
      pensa: this.pensa,
      guasto: [...this.guasti.values()][0],
    };
  }

  private cambia(): void {
    this.versione++;
    this.fotografa();
    for (const fn of this.ascoltatori) fn();
  }
}
