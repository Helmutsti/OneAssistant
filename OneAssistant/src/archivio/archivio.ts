// La memoria di docs/07-memoria. Sta **dentro**: è la testa dell'agente, non un
// raccoglitore dell'utente.
//
// ─── Dal 18 settembre 2026 è sospesa (docs/07-memoria §6) ────────────────────
//
// L'archivio strutturato — tre generi chiusi, una cartella per genere, due file con
// autorità diversa, le prove contate su settimane — era **forma decisa su un uso che non
// c'era ancora stato**. Il rischio di un impianto così non è di essere sbagliato: è di
// essere invisibile mentre è sbagliato. Quindi si toglie l'impalcatura e si guarda una
// cosa sola: che forma si dà lui, quando gli si lascia decidere cosa vale la pena tenere.
//
// Tre cose sono cambiate, e sono tutte reversibili:
//   - **non tocca il disco.** Nasce a ogni sessione e muore con lei;
//   - **parte da un seme.** `seme.txt` è prosa, non struttura: il contesto minimo, scritto
//     come lo racconteresti a qualcuno il primo giorno;
//   - **il genere non è più un insieme chiuso.** La parola la sceglie lui.
//
// Il formato su disco non è stato dimenticato: sta scritto in docs/07-memoria §7, e il
// codice che lo leggeva e lo scriveva sta in git, nel commit prima di questo.
//
// Due cose che questo file non fa, e non deve fare mai — e non sono sospese, perché non
// sono regole dell'archivio ma del sistema:
//   - non restituisce percorsi a chi parla. Racconta contenuti (§9).
//   - non mescola i profili. Fra profili non passa niente (§7).

import type { Disco } from '../confini/disco.ts';

/**
 * Dove va a finire una cosa che si segna.
 *
 * A regime sono tre, ed è un insieme chiuso come i sette `tipo` (docs/07-memoria §7).
 * **Durante la sospensione no**: è la parola che il modello sceglie, e serve proprio a
 * scoprire se quelle tre bastavano. Resta una stringa, quindi tornare indietro è
 * restringere un tipo e correggere quello che non compila più.
 */
export type Genere = string;

/** docs/07-memoria §4. Un'entità nota è reale: solo, non ha un recapito. */
export type Ancoraggio = 'nota' | 'ancorata';

export interface Riga {
  readonly testo: string;
  readonly quando: Date;
  /** Chi l'ha detto: l'utilizzatore, o un altro che stava davanti alla macchina (§4). */
  readonly chi: string;
  readonly collegamenti: readonly string[];
  /** Se l'hai smentita: la riga resta, ma esce da ogni estratto (§5). */
  smentita?: Date;
}

export interface Entita {
  readonly nome: string;
  readonly genere: Genere;
  ancoraggio: Ancoraggio;
  readonly righe: Riga[];
}

/** Una preferenza dedotta, con le sue prove. Sale a `preferenze.md` solo se la confermi. */
export interface Ipotesi {
  readonly chiave: string;
  readonly testo: string;
  prove: Date[];
}

/** Quante prove servono prima che il sistema proponga di promuoverla (docs/06-confini §6). */
export const PROVE_PER_PROPORRE = 3;

/** Il tetto dell'estratto. Numero di partenza, da smentire appena gira (§7.1). */
export const TETTO_ESTRATTO = 8;

export class Archivio {
  private readonly entita = new Map<string, Entita>();
  private readonly ipotesi = new Map<string, Ipotesi>();
  private readonly dichiarate = new Map<string, string>();
  /** Chi è stato nominato ma non ha ancora una scheda: nome e le frasi in cui compare. */
  private readonly menzioni = new Map<string, { nome: string; righe: string[] }>();
  private ultimaScritta?: { entita: string; indice: number };
  /** Il seme: il contesto minimo da cui la sessione parte, una riga per riga. */
  private readonly seme: string[] = [];

  constructor(
    private readonly disco: Disco,
    /** Il profilo: memoria e modo di una persona sola. Fra profili non passa niente. */
    readonly profilo: string,
  ) {
    this.semina();
  }

  // ─── scrivere ────────────────────────────────────────────────────────────

  /**
   * Segnarsi una cosa. La penna è una sola: ci scrive l'AI engine, mai un secondario
   * (docs/02-parallelo §3).
   */
  annota(
    nome: string,
    genere: Genere,
    testo: string,
    quando: Date,
    chi: string,
    collegamenti: readonly string[] = [],
  ): Entita {
    const k = chiave(nome);
    let e = this.entita.get(k);
    if (!e) {
      e = { nome, genere, ancoraggio: 'nota', righe: [] };
      this.entita.set(k, e);
    }
    e.righe.push({ testo, quando, chi, collegamenti: collegamenti.map(chiave) });
    this.ultimaScritta = { entita: k, indice: e.righe.length - 1 };
    this.salva(e);

    // **Un nome non è una persona** (docs/07-memoria §4). Nominare qualcuno non le
    // apre una scheda: si tiene il conto, e quando c'è abbastanza da dire il sistema
    // chiede se ricordarsela. Una scheda con dentro solo un nome non è memoria, è
    // rumore che rende più difficile trovare il resto.
    for (const c of collegamenti) {
      const kc = chiave(c);
      if (this.entita.has(kc)) continue;
      const m = this.menzioni.get(kc) ?? { nome: c, righe: [] };
      m.righe.push(testo);
      this.menzioni.set(kc, m);
    }
    return e;
  }

  /**
   * Chi il sistema ha sentito nominare abbastanza da valere una scheda. Non si contano
   * le volte: si guarda **quanto sapresti dirne** — tre frasi che dicono la stessa cosa
   * non fanno una scheda. Qui, in prima approssimazione, sono tre frasi diverse.
   */
  daRicordare(): { nome: string; quante: number } | undefined {
    for (const [, m] of this.menzioni) {
      const diverse = new Set(m.righe).size;
      if (diverse >= 3) return { nome: m.nome, quante: diverse };
    }
    return undefined;
  }

  /** «Sì, ricordatelo»: da menzionata a nota. La scheda nasce adesso, non prima. */
  ricorda(nome: string, quando: Date, chi: string): boolean {
    const k = chiave(nome);
    const m = this.menzioni.get(k);
    if (!m || this.entita.has(k)) return false;
    const e: Entita = { nome: m.nome, genere: 'Persone', ancoraggio: 'nota', righe: [] };
    for (const r of new Set(m.righe)) e.righe.push({ testo: r, quando, chi, collegamenti: [] });
    this.entita.set(k, e);
    this.menzioni.delete(k);
    this.salva(e);
    return true;
  }

  /** Acquista un recapito: è la promozione di docs/07-memoria §5. */
  ancora(nome: string): boolean {
    const e = this.entita.get(chiave(nome));
    if (!e || e.ancoraggio === 'ancorata') return false;
    e.ancoraggio = 'ancorata';
    this.salva(e);
    return true;
  }

  // ─── raccontare, mai mostrare ────────────────────────────────────────────

  /**
   * Cosa so di una cosa. Restituisce una frase dicibile, **mai un percorso**
   * (docs/07-memoria §9). Se non sa niente, lo dice.
   */
  racconta(nome: string): string {
    const e = this.entita.get(chiave(nome));
    const vive = e?.righe.filter((r) => !r.smentita) ?? [];
    if (!e || vive.length === 0) return `Di ${nome.toLowerCase()} non mi sono segnato niente.`;
    // Due frasi, non una incastrata nell'altra: se ci si infila dentro una riga che
    // comincia con un nome proprio, si finisce per scrivere «paolo» minuscolo.
    return `Di ${e.nome} mi sono segnato questo. ${vive.slice(-3).map(chiusa).join(' ')}`;
  }

  /** L'ultima cosa che si è segnato, a parole. */
  raccontaUltima(): string {
    const u = this.ultimaScritta;
    const e = u && this.entita.get(u.entita);
    const r = e?.righe[u!.indice];
    if (!e || !r || r.smentita) return 'Non mi sono segnato niente.';
    return `Su ${e.nome}, questo. ${chiusa(r)}`;
  }

  /** «Dimenticalo»: non cancella, smentisce (docs/07-memoria §10). */
  dimentica(quando: Date): string | undefined {
    const u = this.ultimaScritta;
    const e = u && this.entita.get(u.entita);
    const r = e?.righe[u!.indice];
    if (!e || !r || r.smentita) return undefined;
    r.smentita = quando;
    this.salva(e);
    return e.nome;
  }

  // ─── l'estratto ──────────────────────────────────────────────────────────

  /**
   * Quello che l'AI engine vede della memoria quando lo chiede: le righe delle entità
   * nominate, più un salto lungo i collegamenti, più quello che il seme dice di loro.
   * Un salto solo, e mai oltre il tetto.
   *
   * **Contenuti, mai posizioni** (docs/07-memoria §9). Fino al 18 settembre 2026 questa
   * tornava un elenco di percorsi — `Progetti/acme.md` — e quei percorsi finivano dritti
   * nella risposta al modello: era la regola più netta del documento, rotta nell'unico
   * punto in cui si poteva rompere senza che si vedesse a schermo.
   */
  contenuti(nomi: readonly string[]): string[] {
    const presi = new Set<string>();
    const righe: string[] = [];
    const prendi = (k: string) => {
      const e = this.entita.get(k);
      if (!e || presi.has(k) || righe.length >= TETTO_ESTRATTO) return;
      presi.add(k);
      for (const r of e.righe) {
        if (r.smentita || righe.length >= TETTO_ESTRATTO) continue;
        righe.push(`${e.nome}: ${chiusa(r)}`);
      }
    };
    const primi = nomi.map(chiave);
    for (const k of primi) prendi(k);
    for (const k of primi) {
      const e = this.entita.get(k);
      if (!e) continue;
      for (const r of e.righe) {
        if (r.smentita) continue;
        for (const c of r.collegamenti) prendi(chiave(c));
      }
    }

    // Il seme non è una scheda e non ha collegamenti: si pesca per nome, come si
    // pescherebbe una frase in un foglio. Se non nomini niente che conosce, non dice
    // niente — è memoria anche lui, e la memoria non si rovescia addosso a nessuno.
    for (const r of this.seme) {
      if (righe.length >= TETTO_ESTRATTO) break;
      if (nomi.some((n) => r.toLowerCase().includes(n.toLowerCase()))) righe.push(r);
    }
    return righe;
  }

  /** I nomi che conosce. Serve al locale per capire di chi stai parlando. */
  nomi(): string[] {
    return [...this.entita.values()].map((e) => e.nome);
  }

  cosaSa(nome: string): Entita | undefined {
    return this.entita.get(chiave(nome));
  }

  // ─── dichiarato e osservato ──────────────────────────────────────────────

  /** Una prova in più per un'abitudine. Vive in `osservato.md`, con le sue prove. */
  osservaAbitudine(chiaveAbitudine: string, testo: string, quando: Date): Ipotesi {
    let i = this.ipotesi.get(chiaveAbitudine);
    if (!i) {
      i = { chiave: chiaveAbitudine, testo, prove: [] };
      this.ipotesi.set(chiaveAbitudine, i);
    }
    i.prove.push(quando);
    this.salvaOsservato();
    return i;
  }

  /** Abbastanza prove per proporre la promozione, e non l'hai già dichiarata. */
  daProporre(chiaveAbitudine: string): Ipotesi | undefined {
    const i = this.ipotesi.get(chiaveAbitudine);
    if (!i || this.dichiarate.has(chiaveAbitudine)) return undefined;
    return i.prove.length >= PROVE_PER_PROPORRE ? i : undefined;
  }

  /** «sì, è vero»: la riga sale da osservato.md a preferenze.md. */
  promuovi(chiaveAbitudine: string): boolean {
    const i = this.ipotesi.get(chiaveAbitudine);
    if (!i) return false;
    this.dichiarate.set(chiaveAbitudine, i.testo);
    this.ipotesi.delete(chiaveAbitudine);
    this.salvaOsservato();
    this.salvaPreferenze();
    return true;
  }

  /** «chiedimi sempre»: la riga scende. */
  revoca(chiaveAbitudine: string): boolean {
    if (!this.dichiarate.delete(chiaveAbitudine)) return false;
    this.salvaPreferenze();
    return true;
  }

  dichiarato(chiaveAbitudine: string): boolean {
    return this.dichiarate.has(chiaveAbitudine);
  }

  /** «cosa fai da solo?» — a parole, mai come elenco di impostazioni. */
  raccontaPreferenze(): string {
    const righe = [...this.dichiarate.values()];
    if (righe.length === 0) return 'Niente: ti chiedo sempre.';
    return `Senza chiederti: ${elenca(righe.map(spunta))}.`;
  }

  // ─── il seme, e il disco che per ora non c'è ─────────────────────────────

  /**
   * Il seme: `seme.txt`, prosa, una riga per riga. È tutto quello che la sessione sa
   * prima che tu apra bocca.
   *
   * Se non c'è, non è un guasto: è un agente che ti incontra oggi per la prima volta, e
   * la differenza fra le due cose è esattamente quello che la sospensione vuole guardare.
   */
  private semina(): void {
    const testo = this.disco.leggi(SEME);
    if (!testo) {
      console.info('[memoria] nessun seme: la sessione parte da zero (docs/07-memoria §6)');
      return;
    }
    for (const r of testo.split('\n')) {
      const t = r.trim();
      if (t && !t.startsWith('#')) this.seme.push(t);
    }
    console.info(`[memoria] ${this.seme.length} righe di seme, e niente disco: la sessione è sola`);
  }

  /**
   * Sospesa (docs/07-memoria §6). Qui ci andava una scrittura su disco, e adesso non ci
   * va niente: quello che la sessione si segna vive quanto la sessione.
   *
   * Resta un metodo invece di sparire perché è il punto in cui l'archivio torna, e
   * perché **un no-op con un nome si vede**, mentre delle chiamate tolte non si vedono.
   */
  private salva(_e: Entita): void {}

  private salvaOsservato(): void {}

  private salvaPreferenze(): void {}
}

/** Il seme sta nella memoria del profilo: `Archivio/<id>/memory/seme.txt`. */
const SEME = 'seme.txt';

// ─── minuzie ───────────────────────────────────────────────────────────────

/** Il nome è la parola con cui lo richiami: il confronto non deve inciampare. */
export function chiave(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Una riga raccontata come l'hai detta, con il punto in fondo. */
function chiusa(r: Riga): string {
  const t = r.testo.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

/** Togliere il punto finale: queste frasi vanno dentro un'altra frase. */
function spunta(t: string): string {
  const s = t.trim().replace(/[.!?]$/, '');
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Dev'essere dicibile: «a, b e c», non un elenco puntato (docs/05-interfaccia §1). */
function elenca(cose: readonly string[]): string {
  if (cose.length <= 1) return cose[0] ?? '';
  return `${cose.slice(0, -1).join(', ')} e ${cose.at(-1)}`;
}
