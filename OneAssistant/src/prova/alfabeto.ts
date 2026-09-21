// L'alfabeto. **Non fa parte del design**: è il banco dove si fissa la lingua.
//
// Un copione (`flussi.ts`) risponde a «questa catena funziona?». Questo risponde a
// un'altra domanda, e viene prima: **quali parole esistono?**
//
// È il vocabolario chiuso che il locale riconosce e che l'AI engine dovrà comporre da
// solo, ascoltando la voce (docs/04-metalinguaggio §2). Finché lo componiamo noi a mano, va
// letto tutto insieme: un linguaggio si giudica per quello che *non* si può dire.
//
// Quattro regole che lo tengono onesto:
//
//   - **si preme la frase, non il comando.** Ogni azione passa dalla stessa porta di
//     tutte le altre — `dillo` — così quello che si prova non è il motore, è la lingua.
//     Se «apri Acme» non produce `apri`, si vede qui, subito, in rosso;
//   - **ogni azione dichiara cosa presuppone**, e lo dichiara *una volta sola*: una
//     `Chiave` di `stato.ts`, che sa dire se la situazione c'è e sa costruirla. Prima
//     erano due — una riga di prosa e un predicato — e si contraddicevano;
//   - **una parola spenta si prova lo stesso.** Premerla porta il mondo nello stato che
//     le serve e *poi* la dice. Un vocabolario che si può solo leggere non è provato:
//     è dichiarato;
//   - **il mondo è una famiglia a parte.** Quello che succede non è quello che dici:
//     le proposte, i guasti e il tempo non hanno un comando, e non devono averlo.
//
// L'ordine delle famiglie è quello di una sessione, non quello dell'alfabeto: prima il
// mondo — che è l'unico modo di avere qualcosa a schermo —, poi come si guarda, poi
// cosa si fa a una cosa sola, poi le cose che ne chiedono più d'una, e in fondo le
// frasi che rispondono e quelle che la grammatica chiusa non regge.

import type { Motore } from '../modello/motore.ts';
import type { Comando } from '../modello/tipi.ts';
import { MINUTO } from '../modello/tempo.ts';
import type { Attrezzi } from './flussi.ts';
import { daRichiamare, porta, type Chiave } from './stato.ts';

export interface Azione {
  /** Il token della lingua: il `tipo` che il locale deve produrre. Il mondo non ne ha. */
  readonly comando?: Comando['tipo'];
  /**
   * Come la diresti. È una frase, non un'etichetta: i bottoni non esistono. Quando
   * nomina qualcosa che sta a schermo si scrive sul momento — «torna a Acme» dev'essere
   * il nome vero, o la si prova contro un mondo che non c'è.
   */
  readonly frase: string | ((m: Motore) => string);
  /** Cosa fa, in una riga. */
  readonly cosa: string;
  /** In quale situazione la frase vuol dire qualcosa (src/prova/stato.ts). */
  readonly serve?: readonly Chiave[];
  /**
   * Quello che non è una frase da mandare: il mondo che succede, o la dettatura che
   * prende il suo tempo. Non passa da `dillo` e non produce nessun token.
   */
  readonly fai?: (a: Attrezzi) => void | Promise<void>;
}

export interface Famiglia {
  readonly nome: string;
  readonly perche: string;
  readonly azioni: readonly Azione[];
}

/** La frase come si dice adesso, con dentro i nomi veri di quello che c'è a schermo. */
export function dilla(az: Azione, m: Motore): string {
  return typeof az.frase === 'function' ? az.frase(m) : az.frase;
}

/** Cosa si è visto premendo una parola. È tutto quello che questo banco deve dire. */
export interface Esito {
  /** Il token uscito davvero dal locale. Se non è quello dichiarato, la lingua non regge. */
  readonly uscito: string;
  /** La frase com'è stata detta: quelle che nominano qualcosa cambiano ogni volta. */
  readonly detta: string;
  /** Quello che ha risposto lei. Una parola che non fa rispondere niente è sospetta. */
  readonly risposta: string;
  /** Vero se lo stato che serviva non si è riusciti a costruirlo: la prova non vale. */
  readonly senzaStato?: boolean;
}

/**
 * Provare una parola per davvero: prima il mondo va dove la frase vuol dire qualcosa,
 * poi la frase si dice. Le due cose stanno insieme apposta — separarle rimetterebbe
 * addosso a chi guarda il compito di costruirsi lo stato a mano, che è esattamente
 * quello che teneva metà del vocabolario non provato.
 */
export async function prova(a: Attrezzi, az: Azione): Promise<Esito | undefined> {
  // Il mondo non si dice: succede, e non produce nessun token da confrontare.
  if (az.fai) {
    await az.fai(a);
    return undefined;
  }
  const pronta = await porta(a, az.serve);
  const detta = dilla(az, a.motore);
  // Un turno adesso è più di una mossa — il fuoco che si sposta, il comando, la riga
  // detta — e quello che si misura è la **prima che si traduce in un comando**: è lei
  // che la frase voleva. Le altre sono contorno, e il contorno non fa testo.
  const prima = a.motore.mosse.length;
  a.dillo(detta);
  const fatte = a.motore.mosse.slice(prima).filter((x) => x.comando !== undefined);
  // Una frase che nomina qualcosa sposta prima il fuoco e **poi** fa quello che dice:
  // «torna a proposta acme» muove il centro e richiama. Quella prima mossa è
  // orientamento, non intenzione, e si salta — a meno che sia l'unica, perché allora la
  // frase era «portala al centro» e l'intenzione era proprio quella.
  const salta = fatte.length > 1 && fatte[0]?.chiamata.nome === 'al_centro';
  const uscita = salta ? fatte[1] : fatte[0];
  return {
    uscito: uscita?.comando ?? '—',
    detta,
    risposta: a.motore.ultimaRisposta,
    ...(pronta ? {} : { senzaStato: true }),
  };
}

export const ALFABETO: readonly Famiglia[] = [
  {
    nome: 'il mondo',
    perche: 'quello che non dici tu. Non ha comandi, e non deve averne',
    azioni: [
      mondo('arriva · proposta acme', 'una mail che ti nomina: passa il filtro', (a) => a.posta.fai('Proposta Acme')),
      mondo('arriva · revisione contratto', 'una seconda cosa che aspetta te', (a) => a.posta.fai('Revisione contratto')),
      mondo('arriva · nuovo cliente', 'una terza', (a) => a.posta.fai('Nuovo cliente')),
      mondo('arriva · foto vacanza', 'una quarta, di tipo diverso', (a) => a.posta.fai('Foto vacanza')),
      mondo('arriva · newsletter', 'non ti nomina: il filtro la ferma alla prima domanda', (a) => a.posta.fai('Newsletter')),
      mondo('arriva · fattura acme', 'ti riguarda ma non c’è niente da fare: è una cosa da sapere', (a) => a.posta.fai('Fattura Acme')),
      // Il calendario e i promemoria, dal 17 settembre 2026. L'invito e la scadenza che
      // matura sono due CARTE come le altre; l'udienza di giovedì è l'unica cosa in tutto
      // il banco che diventa un **ORARIO** — prima quel ramo del filtro non si vedeva mai.
      mondo('arriva · invito pettinelli', 'un incontro fra 40 minuti: è per te, ed è adesso', (a) => a.calendario.fai('Invito Pettinelli')),
      mondo('arriva · udienza giovedì', 'ha un’ora, ed è lontana: dorme in ORARIO, non nella pila', (a) => a.calendario.fai('Udienza giovedì')),
      mondo('arriva · riunione generale', 'ti riguarda e non c’è niente da decidere: niente', (a) => a.calendario.fai('Riunione generale')),
      mondo('arriva · richiamare giulia', 'una cosa che ti eri segnata tu, e torna a scadenza', (a) => a.promemoria.fai('Richiamare Giulia')),
      mondo('arriva · rinnovo polizza', 'scade domani: ha un’ora, e non interrompe', (a) => a.promemoria.fai('Rinnovo polizza')),
      mondo('la prossima consegna fallisce', 'è il mondo che si guasta, non il sistema', (a) => (a.posta.guasta = true)),
      mondo('il calendario si guasta', 'e con lui si blocca quello che ci stava andando dentro', (a) => (a.calendario.guasto = true)),
      mondo('avanti di 5 minuti', 'l’ora si sposta', (a) => a.orologio.salta(5 * MINUTO)),
      mondo('avanti di un’ora', 'le carte che nessuno guarda scendono fra le cose di più tardi', (a) => a.orologio.salta(60 * MINUTO)),
      mondo('avanti di due ore', 'quello che avevi messo da parte torna a farsi vedere', (a) => a.orologio.salta(120 * MINUTO)),
    ],
  },
  {
    nome: 'la dettatura',
    perche:
      'quello che succede in INPUT **mentre** parli: la frase cresce una parola alla volta e la raccolta si aggancia da sé (docs/05-interfaccia §1)',
    azioni: [
      detta(
        'scrivi a mia madre e chiedile a che ora ci vediamo',
        'il contatto si aggancia a «mia madre» prima che la frase sia finita: l’orecchio non aspetta il punto',
      ),
      detta(
        'ho parlato con Paolo del preventivo Acme',
        'due cose dall’archivio, e una porta scritto che non ha un recapito (docs/07-memoria §4)',
      ),
      detta(
        'manda proposta acme e revisione contratto',
        'due task nominati: l’ambiguità si vede nella raccolta **prima** di premere invio',
      ),
      detta('riassumimela', 'una frase che non nomina niente: la raccolta resta vuota, e va bene così'),
    ],
  },
  {
    nome: 'le viste',
    perche: 'guardare un’area senza cambiare lo stato di niente',
    azioni: [
      d('mostra', 'fammi vedere le altre', 'apre la NOTIFICATIONBAR: quello che è arrivato'),
      d('mostra', 'cosa hai in mano', 'apre la TASKBAR'),
      d('mostra', 'cosa mi aspetta', 'la stessa apertura: nel cassetto, dopo le arrivate, ci sono le cose che hanno un’ora'),
      d('scegli', 'la seconda', 'sceglie per posizione dentro un elenco aperto', ['un-elenco-lungo']),
    ],
  },
  {
    nome: 'il fuoco',
    perche: 'spostare l’attenzione non cambia mai lo stato di niente',
    azioni: [
      d('al-centro', 'portala al centro', 'la carta in cima alla pila diventa la bolla grande', ['una-carta']),
      d('leggi', 'leggila', 'la porta a fuoco e la dice: il richiamo da solo non parla', ['a-fuoco']),
      d('dentro', 'aprila', 'la bolla si allarga e mostra il corpo; intorno si scurisce. Mostra, non dice', ['un-dentro']),
      d(
        'richiama',
        (m) => `torna a ${daRichiamare(m)?.nome.toLowerCase() ?? 'proposta acme'}`,
        'un task si richiama per nome, da qualunque area',
        ['da-richiamare'],
      ),
      d('indietro', 'torna a quella di prima', 'il fuoco fa un passo indietro, e nient’altro si muove', ['fuoco-mosso']),
      d('chiudi', 'chiudi', 'chiude l’elenco aperto o il dentro, senza toccare quello che c’era dentro', ['un-elenco']),
    ],
  },
  {
    nome: 'una cosa sola',
    perche: 'il giro di vita di un task, dal cancello alla memoria',
    azioni: [
      d('consegna', 'manda', 'attraversa il confine: l’unico verbo irreversibile', ['un-uscita']),
      d('rimanda', 'dopo', 'va fra le cose di più tardi, e lei dice fra quanto torna', ['a-fuoco']),
      d('lascia', 'lascia stare', 'finisce dentro il sistema: niente esce, e cade nella memoria', ['a-fuoco']),
      d('annulla', 'no, aspetta', 'ritira una consegna finché la finestra è aperta', ['una-consegna']),
      d('riassumi', 'riassumimela', 'nasce un task nuovo che legge e scrive: quello di prima non si muove', ['un-dentro']),
    ],
  },
  {
    nome: 'comporre',
    perche: 'un testo che esiste e non è ancora uscito da nessuna parte',
    azioni: [
      d('componi', 'scrivi a mia madre e chiedile a che ora ci vediamo',
        'nasce una composizione, non una consegna: finché non dici di mandarla non esce niente'),
      d('aggiungi', 'aggiungi una emoji del cuore', 'cambia il testo di una composizione, non lo manda', ['una-composizione']),
      d('riscrivi', 'riscrivilo', 'la stessa richiesta, detta in un altro modo', ['una-composizione']),
    ],
  },
  {
    nome: 'il gruppo',
    perche: 'l’unico posto in cui l’ordine è tuo e non suo (docs/01-modello §6)',
    azioni: [
      d('metti', 'mettila con Acme', 'il gruppo nasce quando lo nomini; il nome è quello che dici tu', ['a-fuoco']),
      d('apri', (m) => `apri ${m.gruppi()[0]?.nome ?? 'Acme'}`, 'espande il gruppo: è un momento, non una schermata', ['un-gruppo']),
      d('consegna-gruppo', 'manda tutte', 'l’unica frase che fa uscire più cose con una parola sola', ['un-gruppo-pronto']),
      d('rimanda-gruppo', 'dopo', 'a gruppo aperto, «dopo» parla al gruppo e non a ciò che avevi in mano', ['un-gruppo-aperto']),
      d('separa', 'separale', 'il gruppo smette di esistere; i chip restano dov’erano', ['un-gruppo-aperto']),
    ],
  },
  {
    nome: 'il cassetto',
    perche: 'la NOTIFICATIONBAR nella seconda versione: quello che arriva **non è un task** finché non lo prendi tu',
    azioni: [
      d('mostra', 'apri', 'apre il cassetto, e averlo aperto vuol dire averle viste: il badge si azzera qui', ['una-notifica']),
      d('estrai', 'me ne occupo', 'la notifica esce dal cassetto e diventa un task: è l’unico momento in cui una cosa arrivata entra nel modello',
        ['un-cassetto-aperto']),
      d('scegli', 'la seconda', 'dentro il cassetto l’ordinale sceglie fra le notifiche, non fra le carte',
        ['due-notifiche', 'un-cassetto-aperto']),
    ],
  },
  {
    nome: 'l’archivio',
    perche: 'quello che si è segnato si racconta, non si mostra (docs/07-memoria §9)',
    azioni: [
      d('racconta', 'cosa ti sei segnato', 'l’ultima cosa annotata, detta a parole'),
      d('racconta', 'cosa fai da solo', 'le consegne che hai autorizzato una volta per tutte'),
      d('racconta', 'cosa sai di Paolo', 'quello che sa di un’entità, e se ha un recapito'),
      d('dimentica', 'dimenticalo', 'smentisce l’ultima cosa segnata. Non cancella: smentisce'),
      d('salva-nota', 'mettilo nelle note', 'fa uscire qualcosa verso le note'),
      d('conferma', 'sì, fai pure', 'promuove un’abitudine osservata a preferenza dichiarata', ['in-sospeso']),
      d('revoca', 'chiedimi sempre', 'toglie un’autorizzazione data prima'),
    ],
  },
  {
    nome: 'le risposte',
    perche: 'parole che rispondono, e che non sono comandi',
    azioni: [
      d('no', 'no', 'non si muove niente — ed è un esito, non un fallimento'),
      d('aspetta', 'aspetta', 'ferma l’azione **e** la voce, a metà parola. Sempre udibile'),
      d('sciogli', quale, 'la risposta a «non ho capito quale»: si dice quale', ['un-blocco']),
    ],
  },
  {
    nome: 'da dove entri',
    perche:
      'voce e scrittura sono di pari grado, e questa è la parola che cambia porta. ' +
      'Ce n’è una sola: **riaccendere il microfono non è una frase**, è un gesto, e il ' +
      'perché sta in src/conoscenza/canali.ts',
    azioni: [
      d('non-ascoltare', 'non ascoltare',
        'il microfono si spegne e si entra scrivendo. Il punto si ferma, il campo prende il fuoco'),
      d('voce', 'non leggere',
        'la voce in uscita tace, e quello che avrebbe detto resta scritto. Si riaccende dicendolo'),
    ],
  },
  {
    nome: 'più mosse in un turno',
    perche:
      'una frase, più chiamate. Non sono un comando a parte: sono l’AI engine che muove ' +
      'due cose invece di una, e le fa in fila (docs/09-catene §5)',
    azioni: [
      d('aggiungi', 'aggiungi una emoji del cuore e invia',
        'due mosse in fila: prima cambia il testo, poi lo manda', ['una-composizione']),
      // Nessun comando da dichiarare: quello che esce da qui non muove niente. È il
      // AI engine che si segna una cosa e risponde, e prima del 17 settembre 2026 era
      // l'unico caso in cui una frase «usciva» — adesso escono tutte.
      { frase: 'trova il pdf che mi ha mandato Marco prima dell’estate',
        cosa: 'niente da muovere: si pensa, si segna, si risponde' },
      // Nemmeno questa: `delega` non è un comando del modello, è l'AI engine che si
      // moltiplica. Due secondari partono dentro il task a fuoco, e la frazione sale.
      { frase: 'preparami alla revisione',
        cosa: 'due secondari dentro il task che c’è già: la frazione è la loro faccia',
        serve: ['una-carta'] },
    ],
  },
];

/** Una parola della lingua. Dire una frase è l'unica cosa che si fa: il resto è conseguenza. */
function d(
  comando: Comando['tipo'],
  frase: Azione['frase'],
  cosa: string,
  serve?: readonly Chiave[],
): Azione {
  return { comando, frase, cosa, ...(serve ? { serve } : {}) };
}

/** Una frase dettata: entra in INPUT una parola alla volta, e lì si ferma. */
function detta(frase: string, cosa: string): Azione {
  return { frase: `detta · ${frase}`, cosa, fai: (a) => a.detta?.(frase) };
}

/** Una cosa del mondo. Non si dice: succede. */
function mondo(frase: string, cosa: string, fai: (a: Attrezzi) => void): Azione {
  return { frase, cosa, fai };
}

/** Il nome di una delle due fra cui il sistema non sa scegliere: è la risposta. */
function quale(m: Motore): string {
  const bloccato = m.task.find((t) => t.alternative?.length);
  const id = bloccato?.alternative?.[0];
  return m.task.find((t) => t.id === id)?.nome.toLowerCase() ?? 'proposta acme';
}
