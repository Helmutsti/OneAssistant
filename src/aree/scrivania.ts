// La scrivania: dove stanno le bolle e come si spostano quando qualcosa cambia.
// Trascritto da L1 - Soap Bubbles, e poi fatto funzionare davvero.
//
//   «Le bolle si fanno spazio a vicenda.»
//
// Non è un layout: è un piccolo campo di forze. Ogni bolla è tirata verso la sua meta
// da una molla e respinta dalle vicine quando le tocca. Da lì vengono tutte e tre le
// cose che il documento chiede:
//
//   - occupano volume, non celle — la posizione è il risultato di un equilibrio;
//   - non si attraversano mai — la repulsione cresce con la compenetrazione;
//   - nessun movimento senza causa — il campo si muove solo dopo un evento e si ferma
//     da solo. A riposo è immobile: niente galleggiamento perpetuo.
//
// Solo TABLE si muove. WHEN, WHO, INPUT, Taskbar e Notificationbar sono terra ferma.

export interface Posto {
  x: number;
  y: number;
  larghezza: number;
}

interface Rettangolo {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Il palco è la finestra, non più una tela di 1440 × 900 scalata dentro (16 settembre
 * 2026). Le distanze restano quelle di L3, ma si misurano **dai bordi** invece che in
 * coordinate assolute: è l'unico modo perché lo stesso ancoraggio regga su 1440 × 900
 * come su 1920 × 1080. L3 va riallineato di conseguenza.
 */
// Dal 17 settembre 2026 la cornice è tutta sul bordo destro: in alto a sinistra non c'è
// più niente, e le bolle possono salire. A destra resta la guida — Profilebar, Systembar,
// Taskbar, campanella — e lì non si entra (legge 11).
const BORDI = { sinistra: 60, alto: 96, destra: 400, basso: 240 };

/** La misura viva del palco: la aggiorna `misuraPalco` a ogni ridimensionamento. */
export const palco = { larghezza: 1440, altezza: 900 };

/**
 * L'area libera della scrivania: **a sinistra della guida** e sopra INPUT. La cornice
 * non si tocca.
 */
let AREA: Rettangolo = { x0: 60, y0: 150, x1: 1040, y1: 660 };

/**
 * Dove la cornice occupa già lo spazio: INPUT in basso a sinistra (che cresce fino a
 * 340 px) e la campanella in basso a destra. La legge 11 dice che ogni componente ha il
 * suo ancoraggio e nessuno si allarga a spese di un altro: TABLE sta fuori da qui.
 */
let CORNICE: Rettangolo[] = [];

/**
 * Il palco ha cambiato misura: si rifanno i confini. Sotto una certa taglia l'area si
 * rovescerebbe su se stessa, quindi non scende mai sotto una bolla a fuoco più l'aria
 * che le serve: meglio stretta che al contrario.
 */
export function misuraPalco(larghezza: number, altezza: number): void {
  palco.larghezza = larghezza;
  palco.altezza = altezza;
  AREA = {
    x0: BORDI.sinistra,
    y0: BORDI.alto,
    x1: Math.max(larghezza - BORDI.destra, BORDI.sinistra + LARGA_FUOCO + ARIA),
    y1: Math.max(altezza - BORDI.basso, BORDI.alto + 200),
  };
  CORNICE = [
    // INPUT: ancorato in basso a sinistra, e cresce verso l'alto fino a 400 dal fondo.
    { x0: 44, y0: altezza - 400, x1: 620, y1: altezza },
    // La campanella, in basso a destra. Si tiene il suo angolo e basta: il cassetto che
    // si apre copre quello che c'è sotto, ma lo copre col velo — quindi non ha bisogno
    // di spazio suo, ha bisogno che lì non ci sia niente da guardare.
    { x0: larghezza - 170, y0: altezza - 170, x1: larghezza, y1: altezza },
  ];
}

/** L1 - Soap Bubbles · nascita: le vicine si allontanano di 6–12 px, le più vicine di più. */
const ONDA = [12, 8, 6];

/** Fuoco: le altre cedono verso i bordi. La più vicina cede di più. */
const CESSIONE = [68, 34, 26];

/** Ogni vicina parte 40 ms dopo la precedente, in ordine di distanza. */
export const RITARDO_CASCATA = 40;

/** Larghezza di riposo e larghezza a fuoco (L3 · «00 La scrivania»). */
export const LARGA_RIPOSO = 388;
export const LARGA_FUOCO = 452;
/** Dentro: la bolla mostra quello che tiene, e per farlo serve posto (docs/01-modello §7). */
export const LARGA_DENTRO = 560;

/** La scrivania ha memoria delle posizioni per un'ora. */
const MEMORIA = 60 * 60_000;

/** Aria fra due bolle: si sfiorano, non si coprono. */
const ARIA = 20;

/**
 * La molla che porta ogni bolla alla sua meta, e l'attrito che la ferma.
 *
 * Il ghiaccio (16 settembre 2026). Prima erano 0.14 e 0.76: una molla forte con poco
 * attrito, cioè un sistema molto sotto-smorzato — la bolla scattava alla meta, la
 * superava e ci rimbalzava attorno. Da lì l'aria elettrica.
 *
 * Adesso la molla è un terzo e l'attrito quasi critico (ζ ≈ 0.74): la bolla parte
 * piano, prende velocità e **rallenta progressivamente** mentre arriva, senza tornare
 * indietro. È una cosa che scivola e si ferma da sola, non una che scatta.
 */
const RIGIDEZZA = 0.05;
const SMORZAMENTO = 0.67;
/** Quanto si respingono quando si toccano: più entrano, più spingono. Uno scostarsi,
 *  non una scintilla — anche il contatto è morbido. */
const REPULSIONE = 0.18;
/** Sotto questa velocità, e senza compenetrazioni, il campo è fermo. Bassa apposta:
 *  la coda del movimento è la parte che si vede, tagliarla è quello che faceva scatto. */
const QUIETE = 0.02;

interface Bolla {
  x: number;
  y: number;
  /** Dove vorrebbe stare: la molla tira qui. */
  mx: number;
  my: number;
  vx: number;
  vy: number;
  larghezza: number;
  altezza: number;
  /** Quanto è schiacciata dalle vicine, 0–1. Le bolle si comprimono leggermente. */
  compressione: number;
  /** Quando può cominciare a muoversi: è il ritardo a cascata dell'onda. */
  parteA: number;
}

export class Scrivania {
  private readonly bolle = new Map<string, Bolla>();
  private readonly ricordi = new Map<string, { posto: Posto; quando: number }>();

  posto(id: string): Posto | undefined {
    const b = this.bolle.get(id);
    return b ? { x: b.x, y: b.y, larghezza: b.larghezza } : undefined;
  }

  compressione(id: string): number {
    return this.bolle.get(id)?.compressione ?? 0;
  }

  /** L'altezza vera la sa solo il disegno: una bolla è alta quanto quello che contiene. */
  misura(id: string, altezza: number): void {
    const b = this.bolle.get(id);
    if (b) b.altezza = altezza;
  }

  /**
   * Nascita. La bolla nasce **nel punto più libero**, non al centro: come una cosa
   * appoggiata su un tavolo occupato. Se c'era già stata da meno di un'ora, torna dove
   * stava — la scrivania ha memoria delle posizioni.
   */
  accogli(id: string, adesso: number): Posto {
    const ricordo = this.ricordi.get(id);
    const posto =
      ricordo && adesso - ricordo.quando < MEMORIA
        ? { ...ricordo.posto, larghezza: LARGA_RIPOSO }
        : this.puntoPiuLibero(LARGA_RIPOSO, 180);
    this.bolle.set(id, {
      x: posto.x, y: posto.y, mx: posto.x, my: posto.y,
      vx: 0, vy: 0,
      larghezza: LARGA_RIPOSO, altezza: 180,
      compressione: 0, parteA: 0,
    });
    return posto;
  }

  /**
   * L'onda. Le vicine si allontanano lungo la retta che le unisce al punto di nascita,
   * le più vicine di più, ognuna 40 ms dopo la precedente — ed è il ritardo a cascata
   * che fa leggere il movimento come un'onda e non come uno scatto simultaneo.
   * **Restano dove l'onda le lascia**: la scrivania ha una configurazione nuova.
   */
  onda(nato: string, adesso: number): void {
    const centro = this.centro(nato);
    if (!centro) return;
    this.vicine(nato, centro).forEach(({ id, dir }, i) => {
      const quanto = ONDA[i] ?? 0;
      const b = this.bolle.get(id)!;
      b.mx += dir.x * quanto;
      b.my += dir.y * quanto;
      b.parteA = adesso + i * RITARDO_CASCATA;
    });
  }

  /**
   * Fuoco. La nominata cresce e si porta verso il centro; le altre si spostano verso i
   * bordi **senza rimpicciolirsi**: perdono spazio, non dignità.
   */
  fuoco(id: string, larghezza = LARGA_FUOCO): void {
    const b = this.bolle.get(id);
    if (!b) return;
    b.larghezza = larghezza;
    const cx = (AREA.x0 + AREA.x1) / 2;
    const cy = (AREA.y0 + AREA.y1) / 2;
    const centro = this.centro(id)!;
    b.mx += (cx - centro.x) * 0.5;
    b.my += (cy - centro.y) * 0.4;

    for (const [altra, q] of this.bolle) if (altra !== id) q.larghezza = LARGA_RIPOSO;

    this.vicine(id, this.centro(id)!).forEach(({ id: vicina, dir }, i) => {
      const quanto = CESSIONE[i] ?? 20;
      const q = this.bolle.get(vicina)!;
      q.mx += dir.x * quanto;
      q.my += dir.y * quanto;
    });
  }

  /**
   * Il palco ha cambiato misura e i confini con lui: chi è rimasto fuori rientra.
   * Si sposta la **meta**, non solo la posizione — il bordo da solo spinge dentro, ma
   * la molla ritirerebbe subito fuori, e la bolla resterebbe a ronzare sul confine.
   * Il movimento ha una causa: la finestra.
   */
  rientra(): void {
    for (const [, b] of this.bolle) {
      const maxX = Math.max(AREA.x0, AREA.x1 - b.larghezza);
      const maxY = Math.max(AREA.y0, AREA.y1 - b.altezza);
      b.mx = Math.min(Math.max(b.mx, AREA.x0), maxX);
      b.my = Math.min(Math.max(b.my, AREA.y0), maxY);
    }
  }

  /**
   * Una bolla se ne va. Le rimaste **si riavvicinano del 40%** dello spazio liberato:
   * un'onda al contrario.
   */
  togli(id: string, adesso: number): void {
    const b = this.bolle.get(id);
    if (!b) return;
    this.ricordi.set(id, { posto: { x: b.x, y: b.y, larghezza: b.larghezza }, quando: adesso });
    const centro = this.centro(id)!;
    this.bolle.delete(id);
    for (const [, q] of this.bolle) {
      const c = { x: q.x + q.larghezza / 2, y: q.y + q.altezza / 2 };
      const dx = centro.x - c.x;
      const dy = centro.y - c.y;
      const d = Math.hypot(dx, dy) || 1;
      const quanto = Math.min(14, 1200 / d) * 0.4;
      q.mx += (dx / d) * quanto;
      q.my += (dy / d) * quanto;
    }
  }

  // ─── il campo di forze ───────────────────────────────────────────────────

  /**
   * Un passo. Torna `true` finché qualcosa si muove: chi lo chiama si ferma quando
   * torna `false`, perché a riposo la scrivania è immobile.
   */
  passo(adesso: number, fuoco?: string): boolean {
    let vivo = false;

    // la molla verso la meta, per chi ha già cominciato a muoversi
    for (const [, b] of this.bolle) {
      if (adesso < b.parteA) { vivo = true; continue; }
      b.vx += (b.mx - b.x) * RIGIDEZZA;
      b.vy += (b.my - b.y) * RIGIDEZZA;
    }

    // la repulsione: cresce con la compenetrazione, lungo la retta fra i centri
    for (const [, b] of this.bolle) b.compressione *= 0.8;
    for (const [ida, a] of this.bolle) {
      for (const [idb, b] of this.bolle) {
        if (ida >= idb) continue;
        const ca = this.centroDi(a);
        const cb = this.centroDi(b);
        const sx = (a.larghezza + b.larghezza) / 2 + ARIA - Math.abs(ca.x - cb.x);
        const sy = (a.altezza + b.altezza) / 2 + ARIA - Math.abs(ca.y - cb.y);
        if (sx <= 0 || sy <= 0) continue;

        const dentro = Math.min(sx, sy);
        // Si spingono lungo l'asse in cui si toccano meno: è il verso in cui devono
        // scostarsi per liberarsi, e tiene la scrivania larga invece che a pila.
        let dx = sx < sy ? Math.sign(cb.x - ca.x) || 1 : 0;
        let dy = sx < sy ? 0 : Math.sign(cb.y - ca.y) || 1;
        // chi ha il fuoco cede meno, e chi è contro un bordo non può cedere affatto
        const pesoA = (fuoco === ida ? 0.25 : 1) * this.spazio(a, -dx, -dy);
        const pesoB = (fuoco === idb ? 0.25 : 1) * this.spazio(b, dx, dy);
        const somma = pesoA + pesoB || 1;
        const qa = (pesoA / somma) * dentro;
        const qb = (pesoB / somma) * dentro;
        // la spinta: una parte subito sulla posizione, il resto come velocità — così
        // si separano davvero invece di ronzarsi addosso.
        a.x -= dx * qa; a.y -= dy * qa;
        b.x += dx * qb; b.y += dy * qb;
        // anche la meta si sposta, o la molla le ritirerebbe subito addosso: una bolla
        // spinta via **resta** dove l'hanno spinta.
        a.mx -= dx * qa; a.my -= dy * qa;
        b.mx += dx * qb; b.my += dy * qb;
        a.vx -= dx * qa * REPULSIONE;
        a.vy -= dy * qa * REPULSIONE;
        b.vx += dx * qb * REPULSIONE;
        b.vy += dy * qb * REPULSIONE;
        // si comprimono leggermente dove si toccano
        const schiaccio = Math.min(1, dentro / 60);
        a.compressione = Math.max(a.compressione, schiaccio);
        b.compressione = Math.max(b.compressione, schiaccio);
        vivo = true;
      }
    }

    // i bordi: la scrivania finisce dove comincia la cornice
    for (const [, b] of this.bolle) {
      if (adesso < b.parteA) continue;
      if (b.x < AREA.x0) b.vx += (AREA.x0 - b.x) * 0.3;
      if (b.x + b.larghezza > AREA.x1) b.vx += (AREA.x1 - b.larghezza - b.x) * 0.3;
      if (b.y < AREA.y0) b.vy += (AREA.y0 - b.y) * 0.3;
      if (b.y + b.altezza > AREA.y1) b.vy += (AREA.y1 - b.altezza - b.y) * 0.3;

      // e fuori da dove sta la cornice: INPUT e la Notificationbar non cedono il passo a nessuno
      for (const z of CORNICE) {
        const sx = Math.min(b.x + b.larghezza, z.x1) - Math.max(b.x, z.x0);
        const sy = Math.min(b.y + b.altezza, z.y1) - Math.max(b.y, z.y0);
        if (sx <= 0 || sy <= 0) continue;
        // si esce dal lato più vicino, e verso l'alto si esce sempre volentieri
        const su = b.y + b.altezza - z.y0;
        const lato = b.x + b.larghezza / 2 < (z.x0 + z.x1) / 2 ? z.x0 - (b.x + b.larghezza) : z.x1 - b.x;
        if (su <= Math.abs(lato)) { b.y -= su; b.my -= su; }
        else { b.x += lato; b.mx += lato; }
        vivo = true;
      }

      b.vx *= SMORZAMENTO;
      b.vy *= SMORZAMENTO;
      b.x += b.vx;
      b.y += b.vy;
      if (Math.hypot(b.vx, b.vy) > QUIETE) vivo = true;
    }

    // quando si ferma, resta dove il campo l'ha lasciata: la meta diventa il posto.
    if (!vivo) for (const [, b] of this.bolle) { b.mx = b.x; b.my = b.y; b.vx = 0; b.vy = 0; }
    return vivo;
  }

  /** Quanto spazio ha per cedere in quella direzione: contro un bordo, nessuno. */
  private spazio(b: Bolla, dx: number, dy: number): number {
    if (dx > 0 && b.x + b.larghezza > AREA.x1 - 8) return 0.08;
    if (dx < 0 && b.x < AREA.x0 + 8) return 0.08;
    if (dy > 0 && b.y + b.altezza > AREA.y1 - 8) return 0.08;
    if (dy < 0 && b.y < AREA.y0 + 8) return 0.08;
    return 1;
  }

  // ─── la geometria ────────────────────────────────────────────────────────

  private vicine(id: string, centro: { x: number; y: number }) {
    return [...this.bolle.keys()]
      .filter((k) => k !== id)
      .map((k) => {
        const c = this.centro(k)!;
        const dx = c.x - centro.x;
        const dy = c.y - centro.y;
        const d = Math.hypot(dx, dy) || 1;
        return { id: k, d, dir: { x: dx / d, y: dy / d } };
      })
      .sort((a, b) => a.d - b.d);
  }

  private centroDi(b: Bolla) {
    return { x: b.x + b.larghezza / 2, y: b.y + b.altezza / 2 };
  }

  private centro(id: string): { x: number; y: number } | undefined {
    const b = this.bolle.get(id);
    return b ? this.centroDi(b) : undefined;
  }

  /**
   * Il punto più libero: quello che sta più lontano da tutte le altre. Non serve
   * precisione, serve che una bolla nuova non nasca addosso a una che c'è già.
   */
  private puntoPiuLibero(larghezza: number, altezza: number): Posto {
    let migliore: Posto = { x: AREA.x0, y: AREA.y0, larghezza };
    let punteggio = -Infinity;
    for (let x = AREA.x0; x <= AREA.x1 - larghezza; x += 28) {
      for (let y = AREA.y0; y <= AREA.y1 - altezza; y += 28) {
        const c = { x: x + larghezza / 2, y: y + altezza / 2 };
        let distanza = Infinity;
        for (const [, b] of this.bolle) {
          const o = this.centroDi(b);
          distanza = Math.min(distanza, Math.hypot(o.x - c.x, o.y - c.y));
        }
        // a parità, si preferisce l'alto a sinistra: è da lì che si legge.
        const p = distanza === Infinity ? 10_000 - x - y : distanza - (x + y) * 0.02;
        if (p > punteggio) {
          punteggio = p;
          migliore = { x, y, larghezza };
        }
      }
    }
    return migliore;
  }
}

// I confini esistono da subito, anche prima che qualcuno misuri la finestra: senza
// questa riga la zona di INPUT resterebbe vuota fino al primo ridimensionamento, e una
// bolla potrebbe nascerci sopra.
misuraPalco(palco.larghezza, palco.altezza);
