// Dove una chiamata dell'AI engine diventa una mossa vera.
//
// `strumenti.ts` dice **cosa** si può chiedere; questo file lo esegue. In mezzo c'è una
// sola cosa che conta: ogni mossa passa dal motore. L'AI engine non ha un riferimento al
// motore, non tiene lo stato, e non c'è una scorciatoia — se una mossa non è qui, non
// si fa (docs/03-architettura §2).
//
// Quello che una chiamata restituisce è quello che l'AI engine **legge**: o la vista, o
// l'estratto, o una riga che dice com'è andata. Anche l'errore torna a lui, in italiano:
// è così che impara a non ripeterlo, e non c'è un posto dove un errore si perde.

import type { Motore } from '../modello/motore.ts';
import type { Orologio } from '../modello/tempo.ts';
import type { Comando } from '../modello/tipi.ts';
import type { Genere } from '../archivio/archivio.ts';
import { nomeDiChiParla, contesto } from '../conoscenza/contesto.ts';
import { guarda } from './vista.ts';
import { strumento, type Chiamata } from './strumenti.ts';

/** Com'è andata una mossa. `visto` è quello che l'AI engine legge in risposta. */
export interface Esito {
  readonly visto: string;
  /** Se la chiamata non si è potuta fare. Non è un'eccezione: è una risposta. */
  readonly sbagliata?: true;
  /**
   * In quale comando del modello si è tradotta, quando si traduce in uno. Non serve al
   * AI engine: serve al registro della pedana, che su questo misura se la lingua regge
   * (src/prova/alfabeto.ts).
   */
  readonly comando?: Comando['tipo'];
}

const fatto = (visto = 'fatto'): Esito => ({ visto });
const male = (visto: string): Esito => ({ visto, sbagliata: true });

/**
 * Eseguire una chiamata. Non lancia mai: quello che va storto torna all'AI engine come
 * testo, perché un turno che muore a metà lascia lo schermo in mezzo a una frase.
 */
export function chiama(
  c: Chiamata,
  m: Motore,
  o: Orologio,
  /**
   * Le mosse che chi chiama ha il diritto di chiedere. Senza, sono tutte: è il
   * principale. Con, è un **secondario** — e quello che non è nell'elenco non si fa
   * (`MOSSE_SECONDARIE`, docs/02-parallelo §3).
   *
   * Il permesso si controlla qui e non dentro il motore per la stessa ragione per cui
   * gli argomenti si controllano qui: il motore riceve comandi validi, e questo è il
   * posto dove diventano validi. E si nega **come si nega una mossa che non esiste**,
   * perché per un secondario `consegna` *non* esiste.
   */
  permesso?: readonly string[],
): Esito {
  const s = strumento(c.nome);
  if (!s) return male(`Non ho una mossa che si chiama ${c.nome}.`);
  if (permesso && !permesso.includes(c.nome)) {
    return male(
      `Non ho una mossa che si chiama ${c.nome}. Le mie sono: ${permesso.join(', ')}.`,
    );
  }

  // Gli argomenti obbligatori, e gli insiemi chiusi. Si controlla qui e non nel motore:
  // il motore riceve comandi validi, e questo è il posto dove diventano validi.
  for (const a of s.argomenti ?? []) {
    const v = c.argomenti[a.nome];
    if (a.obbligatorio && (v === undefined || v === null || v === '')) {
      return male(`A ${c.nome} manca ${a.nome}: ${a.cosa}.`);
    }
    if (a.fra && v !== undefined && !a.fra.includes(String(v))) {
      return male(`${a.nome} di ${c.nome} può essere solo ${a.fra.join(' o ')}.`);
    }
  }

  const testo = (nome: string): string => String(c.argomenti[nome] ?? '');
  const elenco = (nome: string): string[] => {
    const v = c.argomenti[nome];
    if (Array.isArray(v)) return v.map(String);
    return v === undefined || v === null || v === '' ? [] : [String(v)];
  };
  /** Un id che deve esistere adesso. Se non esiste, l'AI engine ha una vista vecchia. */
  const ilTask = (): string | undefined => {
    const id = testo('task');
    return m.task.some((t) => t.id === id) ? id : undefined;
  };

  switch (c.nome) {
    // ─── guardare ─────────────────────────────────────────────────────────
    case 'guarda':
      return fatto(guarda(m, o));

    case 'ricorda': {
      const nomi = elenco('chi');
      const righe = m.archivio.contenuti(nomi);
      return fatto(
        righe.length
          ? righe.join('\n')
          : `Non mi sono segnato niente su ${nomi.join(', ')}.`,
      );
    }

    // ─── parlare ──────────────────────────────────────────────────────────
    case 'parla':
      m.parla(testo('testo'));
      return fatto('detto');

    case 'chiedi': {
      const fra = elenco('fra').filter((id) => m.task.some((t) => t.id === id));
      if (!fra.length) return male('Nessuno di quegli id è a schermo: guarda di nuovo.');
      m.chiedi(fra);
      return fatto('chiesto, e adesso si aspetta');
    }

    // Un secondario riporta, e finisce lì. Chi lo guida legge il testo dalla chiamata
    // (src/ai-engine/secondari.ts): qui si conferma e basta, perché il lavoro non è uno
    // stato — è una cosa che torna a chi l'ha chiesta.
    case 'riporta':
      return fatto('riportato');

    // ─── tutto il resto: un comando del modello ───────────────────────────
    default: {
      const comando = inComando(c, m, testo, elenco, ilTask);
      if ('visto' in comando) return comando;
      m.esegui(comando);
      return { visto: 'fatto', comando: comando.tipo };
    }
  }
}

/**
 * Da chiamata a `Comando`. È una traduzione e nient'altro: i nomi delle mosse usano il
 * trattino basso perché è quello che i modelli scrivono senza sbagliare, i comandi del
 * modello usano il trattino perché è come sono scritti in docs/01-modello. L'unico
 * posto dove le due grafie si incontrano è qui.
 */
function inComando(
  c: Chiamata,
  m: Motore,
  testo: (n: string) => string,
  elenco: (n: string) => string[],
  ilTask: () => string | undefined,
): Comando | Esito {
  /** Le mosse che hanno un task dentro: l'id deve esistere, o non si fa niente. */
  const conTask = (fn: (task: string) => Comando): Comando | Esito => {
    const task = ilTask();
    return task
      ? fn(task)
      : male(`Non c'è nessun task ${testo('task')}: guarda di nuovo, gli id cambiano.`);
  };
  /** Le mosse che hanno un gruppo dentro: il gruppo deve esistere adesso. */
  const conGruppo = (fn: (gruppo: string) => Comando): Comando | Esito => {
    const detto = testo('gruppo');
    const g = m.gruppi().find((x) => x.nome.toLowerCase() === detto.toLowerCase());
    return g ? fn(g.nome) : male(`Non c'è nessun gruppo ${detto}.`);
  };

  switch (c.nome) {
    case 'al_centro':
      return conTask((task) => ({ tipo: 'al-centro', task }));
    case 'richiama':
      return { tipo: 'richiama', nome: testo('nome') };
    case 'indietro':
      return { tipo: 'indietro' };
    case 'scegli': {
      const i = Number(c.argomenti['indice']);
      return Number.isFinite(i) && i >= 1
        ? { tipo: 'scegli', indice: i }
        : male('indice deve essere un numero da 1.');
    }
    case 'dentro':
      return conTask((task) => ({ tipo: 'dentro', task }));
    case 'leggi':
      return conTask((task) => ({ tipo: 'leggi', task }));
    case 'mostra':
      return { tipo: 'mostra', area: testo('area') as 'NOTIFICATIONBAR' | 'TASKBAR' };
    case 'chiudi':
      return { tipo: 'chiudi' };

    case 'consegna':
      return conTask((task) => ({ tipo: 'consegna', task }));
    case 'rimanda':
      return conTask((task) => ({ tipo: 'rimanda', task }));
    case 'annulla':
      return conTask((task) => ({ tipo: 'annulla', task }));
    case 'lascia':
      return conTask((task) => ({ tipo: 'lascia', task }));
    case 'aspetta':
      return { tipo: 'aspetta' };
    // Spegnere c'è; accendere no, e non è una riga che manca: è la riga che non deve
    // esserci (src/conoscenza/canali.ts).
    case 'non_ascoltare':
      return { tipo: 'non-ascoltare' };
    case 'voce':
      return { tipo: 'voce', come: testo('come') as 'accesa' | 'spenta' };

    // Il testo del messaggio lo scrive l'AI engine, e arriva già scritto: `componi` del
    // motore non lo riscrive più (docs/09-catene §3).
    case 'componi':
      return {
        tipo: 'componi',
        a: testo('a'),
        richiesta: testo('richiesta'),
        testo: testo('testo') || undefined,
      };
    case 'aggiungi':
      return conTask((task) => ({ tipo: 'aggiungi', task, cosa: testo('cosa') }));
    case 'riscrivi':
      return conTask((task) => ({ tipo: 'riscrivi', task }));
    case 'riassumi':
      return conTask((task) => ({ tipo: 'riassumi', task }));

    case 'metti':
      return conTask((task) => ({ tipo: 'metti', task, gruppo: testo('gruppo') }));
    case 'apri':
      return conGruppo((gruppo) => ({ tipo: 'apri', gruppo }));
    case 'separa':
      return conGruppo((gruppo) => ({ tipo: 'separa', gruppo }));
    case 'consegna_gruppo':
      return conGruppo((gruppo) => ({ tipo: 'consegna-gruppo', gruppo }));
    case 'rimanda_gruppo':
      return conGruppo((gruppo) => ({ tipo: 'rimanda-gruppo', gruppo }));

    // Delegare non è un comando del modello: è l'AI engine che si moltiplica, e il motore
    // lo orchestra perché è l'unico che sa far pulsare un task (docs/02-parallelo §3).
    case 'delega': {
      const task = ilTask();
      if (!task) return male(`Non c'è nessun task ${testo('task')}: guarda di nuovo.`);
      const lavori = elenco('lavori').filter((x) => x.trim());
      if (!lavori.length) return male('A delega serve almeno un lavoro.');
      const quanti = m.delega(task, lavori);
      return quanti > 0
        ? fatto(`delegato a ${quanti}: lavorano, e il task pulsa con la frazione`)
        : male('Non ho nessuno a cui delegare: non è collegato nessun secondario.');
    }

    case 'estrai': {
      const id = testo('notifica');
      return m.notifiche.some((n) => n.id === id)
        ? { tipo: 'estrai', notifica: id }
        : male(`Non c'è nessuna notifica ${id} nel cassetto.`);
    }

    case 'sciogli':
      return conTask((task) => ({ tipo: 'sciogli', task }));
    case 'no':
      return { tipo: 'no' };

    case 'segna':
      // La penna sola (docs/07-memoria §9). Passa dal motore come tutto il resto: chi
      // l'ha detto se lo porta con la riga, e il sistema non finge mai che sia suo.
      m.segnati(
        testo('nome'),
        testo('genere') as Genere,
        testo('testo'),
        elenco('collegamenti'),
        nomeDiChiParla(contesto),
      );
      return fatto('segnato');
    case 'ricordami': {
      // Non nasce un task: si scrive nei suoi promemoria, e il promemoria torna dalla
      // porta di sempre (src/modello/motore.ts). La legge regge — un task nasce dal
      // filtro — e intanto «devo comprare il pane» ha finalmente una strada.
      const cosa = testo('cosa').trim();
      if (!cosa) return male('ricordami vuole sapere cosa.');
      const fra = Number(c.argomenti['fra_minuti']);
      if (!Number.isFinite(fra) || fra < 0) {
        return male('fra_minuti deve essere un numero di minuti da adesso.');
      }
      return m.ricordami(cosa, fra)
        ? fatto('lo ricordo io')
        : male('Non ho un modo per scrivere nei promemoria.');
    }
    case 'racconta':
      return { tipo: 'racconta', su: testo('su') };
    case 'dimentica':
      return { tipo: 'dimentica' };
    case 'conferma':
      return { tipo: 'conferma' };
    case 'revoca':
      return { tipo: 'revoca' };
    case 'salva_nota':
      return { tipo: 'salva-nota', testo: testo('testo') };

    default:
      return male(`${c.nome} è una mossa che non so eseguire.`);
  }
}
