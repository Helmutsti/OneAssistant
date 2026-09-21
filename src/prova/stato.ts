// Lo stato della prova. **Non fa parte del design**: è il contesto dentro cui una
// parola vuol dire qualcosa.
//
// L'alfabeto dichiarava due volte cosa presuppone una frase: una in prosa (`serve`) e
// una in codice (`pronta`). Due copie divergono sempre, e divergevano: «sì, fai pure»
// si accendeva su qualunque cosa senza uscita invece che su una domanda in sospeso, e
// «apri Acme» su un gruppo qualunque anche quando Acme non c'era.
//
// Qui la condizione è una cosa sola, e ne sa tre:
//
//   - **come si chiama**, perché si legge sotto la frase;
//   - **se c'è adesso**, perché è lei ad accendere o spegnere la parola;
//   - **come ci si arriva**, perché una parola che non si può dire non si può nemmeno
//     provare. Ogni condizione sa portarcisi da sola — dicendo frasi e facendo
//     succedere cose del mondo, mai toccando il motore — e quelle da cui dipende se le
//     tira dietro. È l'unica differenza fra leggere «separale» e provarla.
//
// Le condizioni stanno in ordine di profondità: si comincia da uno schermo vuoto e ogni
// riga presuppone qualcuna di quelle sopra. Quell'ordine è anche come si leggono.

import type { Motore } from '../modello/motore.ts';
import { dentroSiVede, type Task } from '../modello/tipi.ts';
import { PROVE_PER_PROPORRE } from '../archivio/archivio.ts';
import type { Attrezzi } from './flussi.ts';

/** Quante volte al massimo si insiste, quando si sgombra il davanti. */
const TETTO = 6;

/** Le quattro dello scenario che passano il filtro, in ordine (docs/09-catene §1). */
const CHE_PASSANO = ['Proposta Acme', 'Revisione contratto', 'Nuovo cliente', 'Foto vacanza'];

/**
 * Far arrivare qualcosa che non c'è già. **Il nome conta**: due task che si chiamano
 * uguale rendono ambigua ogni frase che li nomina, e la parola che si stava provando
 * finirebbe per provare l'ambiguità invece che sé stessa.
 */
function faiArrivare(a: Attrezzi): void {
  const gia = new Set([
    ...a.motore.task.map((t) => t.nome),
    ...a.motore.notifiche.map((n) => n.nome),
  ]);
  a.posta.fai(CHE_PASSANO.find((n) => !gia.has(n)) ?? CHE_PASSANO[0] ?? '');
}

/**
 * L'insieme chiuso delle situazioni che sappiamo nominare, in ordine di profondità: si
 * comincia da uno schermo vuoto e ogni riga presuppone qualcuna di quelle sopra.
 *
 * È scritto due volte — qui e nella tavola qui sotto — perché una condizione dichiara
 * da quali altre dipende, e un tipo che si legge da sé non si può scrivere. Il compilatore
 * tiene allineate le due copie: una chiave in più o in meno di là, e questo file non gira.
 */
export type Chiave =
  | 'una-carta'
  | 'due-carte'
  | 'a-fuoco'
  | 'un-dentro'
  | 'un-uscita'
  | 'al-centro'
  | 'da-richiamare'
  | 'fuoco-mosso'
  | 'un-elenco'
  | 'un-elenco-lungo'
  | 'una-composizione'
  | 'un-gruppo'
  | 'un-gruppo-aperto'
  | 'un-gruppo-pronto'
  | 'una-consegna'
  | 'un-blocco'
  | 'in-sospeso'
  | 'il-cassetto'
  | 'una-notifica'
  | 'due-notifiche'
  | 'un-cassetto-aperto';

export interface Condizione {
  /** Come si legge. È una frase, non un'etichetta: si mostra sotto le parole. */
  readonly nome: string;
  /**
   * Lo stesso, in due parole. Serve alla barra dello stato, dove stanno tutte insieme:
   * diciassette frasi intere si mangiavano mezza corsia prima che cominciasse il
   * vocabolario. La frase intera resta, e si legge passandoci sopra.
   */
  readonly corto: string;
  /** Se c'è adesso. L'unica cosa che accende o spegne una parola. */
  readonly ce: (m: Motore) => boolean;
  /** Le condizioni che vengono prima: si avverano loro, e poi lei. */
  readonly serve?: readonly Chiave[];
  /**
   * Come ci si arriva. Passa dalle stesse porte di tutti — `dillo` e i servizi finti —
   * perché uno stato costruito a mano dentro il motore non sarebbe uno stato vero.
   * Se manca, vuol dire che la condizione viene da sé quando ci sono quelle che serve.
   */
  readonly come?: (a: Attrezzi) => void | Promise<void>;
}

export const CONDIZIONI: Record<Chiave, Condizione> = {
  'una-carta': {
    nome: 'una carta nella pila',
    corto: 'una carta',
    ce: (m) => m.inCima() !== undefined,
    come: faiArrivare,
  },
  'due-carte': {
    nome: 'due carte nella pila',
    corto: 'due carte',
    ce: (m) => m.in('CARTA').length > 1,
    serve: ['una-carta'],
    come: faiArrivare,
  },
  'a-fuoco': {
    nome: 'qualcosa a fuoco',
    corto: 'a fuoco',
    ce: (m) => m.aFuoco() !== undefined,
    serve: ['una-carta'],
  },
  'un-dentro': {
    nome: 'a fuoco qualcosa che ha un dentro',
    corto: 'con un dentro',
    ce: (m) => {
      const t = m.aFuoco();
      return t !== undefined && dentroSiVede(t) !== undefined;
    },
    serve: ['una-carta'],
  },
  'un-uscita': {
    nome: 'a fuoco qualcosa che ha un’uscita',
    corto: 'con un’uscita',
    ce: (m) => m.aFuoco()?.uscita !== undefined,
    serve: ['una-carta'],
  },
  'al-centro': {
    nome: 'qualcosa al centro',
    corto: 'al centro',
    ce: (m) => m.main() !== undefined,
    serve: ['una-carta'],
    come: (a) => a.dillo('portala al centro'),
  },
  'da-richiamare': {
    nome: 'qualcosa che si può richiamare per nome',
    corto: 'da richiamare',
    ce: (m) => daRichiamare(m) !== undefined,
    serve: ['una-carta'],
  },
  'fuoco-mosso': {
    nome: 'il fuoco si è già mosso una volta',
    corto: 'fuoco mosso',
    ce: (m) => m.fuocoDiPrima() !== undefined,
    serve: ['due-carte', 'al-centro'],
    // Richiamare un'altra sposta il fuoco **da** qualcosa: solo così esiste una «quella
    // di prima».
    come: (a) => {
      const t = daRichiamare(a.motore);
      if (t) a.dillo(`torna a ${t.nome.toLowerCase()}`);
    },
  },
  'un-elenco': {
    nome: 'un elenco aperto',
    corto: 'un elenco',
    ce: (m) => m.espansa !== null,
    serve: ['una-carta'],
    come: (a) => a.dillo('fammi vedere le altre'),
  },
  'un-elenco-lungo': {
    nome: 'un elenco aperto con almeno due cose',
    corto: 'elenco di due',
    ce: (m) => m.espansa === 'NOTIFICATIONBAR' && m.in('CARTA').length > 1,
    serve: ['due-carte'],
    come: (a) => a.dillo('fammi vedere le altre'),
  },
  'una-composizione': {
    nome: 'una composizione a fuoco',
    corto: 'una composizione',
    ce: (m) => m.aFuoco()?.forma === 'composizione',
    come: (a) => a.dillo('scrivi a mia madre e chiedile a che ora ci vediamo'),
  },
  'un-gruppo': {
    nome: 'un gruppo',
    corto: 'un gruppo',
    ce: (m) => m.gruppi().length > 0,
    serve: ['una-carta'],
    come: (a) => a.dillo('mettila con Acme'),
  },
  'un-gruppo-aperto': {
    nome: 'un gruppo aperto',
    corto: 'gruppo aperto',
    ce: (m) => m.gruppoAperto() !== undefined,
    serve: ['un-gruppo'],
    come: (a) => {
      const g = a.motore.gruppi()[0];
      if (g) a.dillo(`apri ${g.nome}`);
    },
  },
  'un-gruppo-pronto': {
    nome: 'un gruppo in cui tutte aspettano te e hanno un’uscita',
    corto: 'gruppo pronto',
    ce: (m) => m.gruppi().some((g) => g.membri.every((t) => t.avanzamento === 'aspetta te' && t.uscita)),
    serve: ['due-carte'],
    come: (a) => {
      a.dillo('mettila con Acme');
      a.dillo('mettila con Acme');
    },
  },
  'una-consegna': {
    nome: 'qualcosa di consegnato, e la finestra è ancora aperta',
    corto: 'consegnato',
    ce: (m) => m.task.some((t) => t.avanzamento === 'consegnato'),
    serve: ['un-uscita'],
    come: async (a) => {
      a.dillo('manda');
      await finoA(a.motore, (m) => m.task.some((t) => t.avanzamento === 'consegnato'));
    },
  },
  'un-blocco': {
    nome: 'un blocco «non ho capito quale»',
    corto: 'un blocco',
    ce: (m) => m.task.some((t) => t.alternative !== undefined),
    serve: ['due-carte', 'al-centro'],
    // Una frase che ne nomina due: l'ambiguità è un esito, non un errore, e si ottiene
    // dicendo una cosa sola su due cose (docs/01-modello §5). I due nomi devono essere
    // diversi e **soli**: fra due omonime non si può nemmeno rispondere quale.
    come: (a) => {
      const [x, y] = dueChiare(a.motore);
      if (x && y) a.dillo(`manda ${x.nome.toLowerCase()} e ${y.nome.toLowerCase()}`);
    },
  },
  'il-cassetto': {
    corto: 'il cassetto acceso',
    // Non è una situazione del mondo: è **quale delle due versioni** stiamo guardando
    // (docs/11-aperte). Per questo è l'unica ricetta che tocca il motore invece di dire
    // una frase — non sposta niente, sceglie il disegno in cui le frasi hanno senso.
    nome: 'la NOTIFICATIONBAR nella seconda versione',
    ce: (m) => m.conCassetto,
    come: (a) => {
      a.motore.conCassetto = true;
    },
  },
  'una-notifica': {
    corto: 'una notifica',
    nome: 'qualcosa nel cassetto',
    ce: (m) => m.notifiche.length > 0,
    serve: ['il-cassetto'],
    come: faiArrivare,
  },
  'due-notifiche': {
    corto: 'due notifiche',
    nome: 'due cose nel cassetto',
    ce: (m) => m.notifiche.length > 1,
    serve: ['una-notifica'],
    come: faiArrivare,
  },
  'un-cassetto-aperto': {
    corto: 'cassetto aperto',
    nome: 'il cassetto delle notifiche aperto',
    ce: (m) => m.cassettoAperto(),
    serve: ['una-notifica'],
    come: (a) => a.dillo('apri'),
  },
  'in-sospeso': {
    // Le due metà contano tutte e due: con una consegna a fuoco «sì» vuol dire manda,
    // e la stessa parola è un'altra parola.
    nome: 'un’abitudine appena proposta, e niente da mandare',
    corto: 'in sospeso',
    ce: (m) => m.domandaInSospeso() && m.aFuoco()?.uscita === undefined,
    // Alla terza volta che la confermi, osservato.md ha le prove e il sistema propone:
    // l'unico modo di arrivarci è farla per davvero tre volte (docs/06-confini §6).
    come: async (a) => {
      // Tre appunti diversi, non tre volte lo stesso: due task che si chiamano uguale
      // rendono ambigua la frase dopo, e la terza non nascerebbe nemmeno.
      const appunti = ['il codice del portone', 'la targa del furgone', 'la scadenza del bollo'];
      for (let giro = 1; giro <= PROVE_PER_PROPORRE; giro++) {
        a.dillo(`nelle note: ${appunti[giro - 1] ?? 'una cosa qualunque'}`);
        a.dillo('sì');
        await finoA(
          a.motore,
          (m) => m.task.filter((t) => t.avanzamento === 'consegnato').length >= giro,
        );
      }
      // Quello che è rimasto davanti con un'uscita si toglie di mezzo, o «sì» parlerebbe
      // a lui: la pila non è un dettaglio dello sfondo, è il bersaglio.
      for (let giro = 0; giro < TETTO && a.motore.aFuoco()?.uscita !== undefined; giro++) {
        a.dillo('lascia stare');
      }
    },
  },
};

/** In ordine di profondità, che è anche l'ordine in cui si leggono. */
export const CHIAVI = Object.keys(CONDIZIONI) as readonly Chiave[];

/**
 * Un task che si può richiamare per nome: sta a schermo, non è già al centro, e — se
 * possibile — **si chiama in modo unico**. Nominarne uno che ha un omonimo non è un
 * richiamo, è una domanda: «non ho capito quale» (docs/01-modello §5). Giusto per il
 * sistema, inutile per chi sta provando il richiamo.
 */
export function daRichiamare(m: Motore): Task | undefined {
  const fuori = m.task.filter((t) => t.luogo !== 'MAIN' && t.luogo !== 'MEMORIA');
  const sola = (t: Task) =>
    m.task.filter((x) => x.nome.toLowerCase() === t.nome.toLowerCase()).length === 1;
  return fuori.find(sola) ?? fuori[0];
}

/** Due task con nomi diversi, e ognuno unico a schermo: fra omonime non si sceglie. */
function dueChiare(m: Motore): readonly Task[] {
  const sole = m.task.filter(
    (t) => m.task.filter((x) => x.nome.toLowerCase() === t.nome.toLowerCase()).length === 1,
  );
  return sole.slice(0, 2);
}

/** Quali delle condizioni chieste non ci sono adesso. Vuoto vuol dire: si può dire. */
export function mancano(m: Motore, chiavi: readonly Chiave[] = []): readonly Chiave[] {
  return chiavi.filter((k) => !CONDIZIONI[k].ce(m));
}

/**
 * Portare il mondo dentro le condizioni chieste. Ognuna si tira dietro quelle da cui
 * dipende, e niente si rifà se c'è già: preparare due volte lo stesso stato lo
 * sporcherebbe invece di costruirlo. Torna false se una non ce l'ha fatta — e allora
 * è una condizione che non sappiamo raggiungere, che è a sua volta una cosa da sapere.
 */
export async function porta(a: Attrezzi, chiavi: readonly Chiave[] = []): Promise<boolean> {
  let tutto = true;
  for (const k of chiavi) {
    if (!(await portaUna(a, k, new Set()))) tutto = false;
  }
  return tutto;
}

async function portaUna(a: Attrezzi, k: Chiave, visti: Set<Chiave>): Promise<boolean> {
  const c: Condizione = CONDIZIONI[k];
  if (c.ce(a.motore)) return true;
  // Una condizione non si prepara due volte nello stesso giro: se ci fosse un anello
  // fra due `serve`, qui si ferma invece di girare per sempre.
  if (visti.has(k)) return false;
  visti.add(k);

  for (const d of c.serve ?? []) await portaUna(a, d, visti);
  if (c.ce(a.motore)) return true;
  if (!c.come) return false;

  await c.come(a);
  await finoA(a.motore, c.ce);
  return c.ce(a.motore);
}

/**
 * Aspettare che una cosa diventi vera. L'orologio del mondo sta fermo, ma una consegna
 * ci mette dei millisecondi veri: senza questo, si guarderebbe lo stato un attimo prima
 * che arrivi.
 */
export async function finoA(
  m: Motore,
  test: (m: Motore) => boolean,
  entro = 3000,
): Promise<boolean> {
  const scadenza = Date.now() + entro;
  while (!test(m) && Date.now() < scadenza) {
    await new Promise((r) => setTimeout(r, 30));
  }
  return test(m);
}
