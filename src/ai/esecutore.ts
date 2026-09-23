// Da una mossa chiesta dall'AI a una mossa del motore. Qui il contratto si chiude: una
// mossa che non è nel vocabolario del ruolo non esiste, un argomento che manca o che è
// fuori dall'insieme ammesso la rifiuta, e il motore rifiuta quello che il modello dei
// task non ammette. In tutti i casi l'AI riceve cosa è successo, o perché no.

import { Rifiuto, type Motore } from '../modello/motore.ts';
import { TIPI, colore, type Elemento, type Task, type Tipo } from '../modello/tipi.ts';
import { uscita } from '../servizi/servizi.ts';
import { strumentiPer, type Chiamata, type Ruolo, type Strumento } from './vocabolario.ts';

export interface Esito {
  /** Quello che l'AI legge come risultato della mossa. */
  readonly visto: string;
  readonly sbagliata: boolean;
}

const bene = (visto: string): Esito => ({ visto, sbagliata: false });
const male = (visto: string): Esito => ({ visto, sbagliata: true });

/** Gli argomenti, controllati contro la dichiarazione della mossa. */
function controlla(s: Strumento, a: Readonly<Record<string, unknown>>): string | undefined {
  for (const arg of s.argomenti ?? []) {
    const v = a[arg.nome];
    if (v === undefined || v === null || v === '') {
      if (arg.obbligatorio) return `manca l'argomento ${arg.nome}`;
      continue;
    }
    if (arg.genere === 'testo' && typeof v !== 'string') return `${arg.nome} dev'essere un testo`;
    if (arg.genere === 'numero' && typeof v !== 'number') return `${arg.nome} dev'essere un numero`;
    if (arg.genere === 'si-no' && typeof v !== 'boolean') return `${arg.nome} dev'essere sì o no`;
    if (arg.genere === 'elenco' && !(Array.isArray(v) && v.every((x) => typeof x === 'string'))) {
      return `${arg.nome} dev'essere un elenco di testi`;
    }
    if (arg.fra && !arg.fra.includes(v as string)) return `${arg.nome} non può valere «${String(v)}»: ${arg.fra.join(' | ')}`;
  }
  const noti = new Set((s.argomenti ?? []).map((x) => x.nome));
  const ignoti = Object.keys(a).filter((k) => !noti.has(k));
  if (ignoti.length) return `argomenti che la mossa non ha: ${ignoti.join(', ')}`;
  return undefined;
}

function elementi(v: unknown): Elemento[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.map((x: string) => {
    const [tipo, nome, dato] = x.split('|').map((p) => p.trim());
    const t = (TIPI as readonly string[]).includes(tipo ?? '') || tipo === 'task' ? (tipo as Tipo | 'task') : 'documento';
    return { tipo: t, nome: nome || tipo || x, dato: dato || undefined };
  });
}

function ora(v: unknown): number | undefined {
  if (typeof v !== 'string') return undefined;
  const ms = Date.parse(v);
  if (Number.isNaN(ms)) throw new Rifiuto(`«${v}» non è un'ora che so leggere: scrivila come 2026-09-23T15:30`);
  return ms;
}

function testo(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function lista(v: unknown): string[] | undefined {
  return Array.isArray(v) ? (v as string[]) : undefined;
}

function suoUscita(a: Readonly<Record<string, unknown>>) {
  if (typeof a.servizio !== 'string') return undefined;
  if (typeof a.a !== 'string' || !a.a.trim()) throw new Rifiuto(`per uscire dal servizio ${a.servizio} serve a chi`);
  return uscita(a.servizio, a.a);
}

/** Una bolla detta all'AI. Niente di più di quello che serve a decidere. */
function riga(m: Motore, t: ReturnType<Motore['fotografia']>['bolle'][number]) {
  const adesso = m.adesso();
  if (t.genere === 'documento') {
    return { id: t.id, genere: 'documento', tipo: t.tipo, nome: t.nome, luogo: t.luogo, provenienza: t.provenienza, frasi: t.frasi };
  }
  return {
    id: t.id,
    genere: 'task',
    tipo: t.tipo,
    nome: t.nome,
    stato: t.stato,
    attesa: t.attesa,
    colore: colore(t, adesso),
    luogo: t.luogo,
    richiesta: t.richiesta,
    corpo: t.corpo,
    contesto: t.contesto,
    frasi: t.frasi,
    uscita: t.uscita,
    ora: t.ora !== undefined ? new Date(t.ora).toISOString() : undefined,
    invio: t.invio
      ? { secondiAlla_partenza: Math.max(0, Math.ceil((t.invio.scadenza - adesso) / 1000)), subito: t.invio.bypass }
      : undefined,
  };
}

/** Lo schermo, come lo legge l'AI della conversazione. */
export function guarda(m: Motore): string {
  const f = m.fotografia();
  return JSON.stringify({
    adesso: new Date(m.adesso()).toISOString(),
    bolle: f.bolle.map((b) => riga(m, b)),
    active: f.active,
    focus: f.focus,
    domandaAperta: f.domanda,
    frasiInInput: m.frasiInput().frasi,
    notifiche: f.notifiche.map((n) => ({
      id: n.id,
      tipo: n.tipo,
      mittente: n.mittente,
      oggetto: n.oggetto,
      testo: n.testo,
      promossa: n.promossa,
      nuova: n.nuova,
    })),
    cassettoAperto: f.cassettoAperto,
  });
}

/** Il task, come lo legge l'AI del lavoro. */
export function schedaDiLavoro(m: Motore, t: Task): string {
  return JSON.stringify({ adesso: new Date(m.adesso()).toISOString(), task: { ...riga(m, t), note: t.note } });
}

/**
 * Esegue una mossa. `task` è il task su cui si lavora, per il ruolo del lavoro: le mosse di
 * lavoro non scelgono il task, lo ricevono.
 */
export function esegui(c: Chiamata, m: Motore, ruolo: Ruolo, task?: string): Esito {
  const s = strumentiPer(ruolo).find((x) => x.nome === c.nome);
  if (!s) return male(`la mossa ${c.nome} non esiste per te`);
  const errore = controlla(s, c.argomenti);
  if (errore) return male(errore);
  const a = c.argomenti;
  try {
    return ruolo === 'conversazione' ? conversazione(c.nome, a, m) : lavoro(c.nome, a, m, task!);
  } catch (e) {
    if (e instanceof Rifiuto || e instanceof Error) return male(e.message);
    throw e;
  }
}

function conversazione(nome: string, a: Readonly<Record<string, unknown>>, m: Motore): Esito {
  switch (nome) {
    case 'guarda':
      return bene(guarda(m));
    case 'rispondi':
      return bene(m.rispondi(testo(a.testo)));
    case 'componi_bozza': {
      const t = m.componi({
        tipo: a.tipo as Tipo,
        nome: testo(a.nome),
        richiesta: testo(a.richiesta),
        contesto: elementi(a.elementi),
        frasi: lista(a.frasi),
        uscita: suoUscita(a),
        ora: ora(a.ora),
      });
      return bene(`bozza ${t.id} «${t.nome}» nella dropzone`);
    }
    case 'modifica_bozza': {
      const t = m.modificaBozza(testo(a.bozza), {
        tipo: a.tipo as Tipo | undefined,
        nome: typeof a.nome === 'string' ? a.nome : undefined,
        richiesta: typeof a.richiesta === 'string' ? a.richiesta : undefined,
        contesto: elementi(a.elementi),
        frasi: lista(a.frasi),
        uscita: suoUscita(a),
        ora: ora(a.ora),
      });
      return bene(`bozza ${t.id} aggiornata`);
    }
    case 'scarta_bozza':
      m.scarta(testo(a.bozza));
      return bene('bozza scartata');
    case 'conferma': {
      const t = m.conferma(testo(a.bozza));
      return bene(t.luogo === 'DESK' ? `${t.nome} è partito e lavora` : `${t.nome} aspetta la sua ora in SIDEBAR`);
    }
    case 'rispondi_domanda': {
      const { task } = m.rispondiDomanda(testo(a.risposta));
      return bene(`domanda chiusa: ${task.nome} torna a lavorare`);
    }
    case 'riprendi': {
      const t = m.riprendi(testo(a.task), testo(a.richiesta));
      return bene(`${t.nome} torna a lavorare`);
    }
    case 'invia': {
      const t = m.invia(testo(a.task), a.subito === true);
      return bene(
        t.invio?.bypass
          ? `${t.nome} parte adesso, senza attesa: è definitivo`
          : `${t.nome} parte fra 90 secondi; fino ad allora «no, aspetta» lo ferma`,
      );
    }
    case 'annulla_invio': {
      const t = m.annullaInvio(testo(a.task), a.resta_da_parte === true);
      return bene(
        `invio annullato: ${t.nome} non è uscito, e si può cambiare; è ${t.luogo === 'DESK' ? 'tornato sulla scrivania' : 'rimasto in SIDEBAR'}`,
      );
    }
    case 'concludi': {
      const t = m.concludi(testo(a.task));
      return bene(t.invio ? `${t.nome} sta partendo` : `${t.nome} ha finito`);
    }
    case 'rendi_active':
      return bene(`${m.rendiActive(testo(a.bolla)).nome} è la active`);
    case 'metti_da_parte':
      return bene(`${m.mettiDaParte(testo(a.bolla)).nome} è in SIDEBAR`);
    case 'richiama': {
      const b = m.richiama(testo(a.bolla));
      return bene(`${b.nome} è tornata ${b.luogo === 'DROPZONE' ? 'nella dropzone' : 'sulla scrivania'}`);
    }
    case 'rimanda': {
      const t = m.rimanda(testo(a.task), ora(a.ora)!);
      return bene(`${t.nome} rimandato alle ${new Date(t.ora!).toISOString()}`);
    }
    case 'apri_focus':
      return bene(`${m.apriFocus(testo(a.bolla)).nome} è in focus`);
    case 'esci_focus':
      m.esciFocus();
      return bene('focus chiuso: le bolle sono tornate');
    case 'mostra_documento': {
      const d = m.mostraDocumento({
        tipo: a.tipo as Tipo,
        nome: testo(a.nome),
        contenuto: { forma: 'testo', valore: testo(a.testo) },
        provenienza: typeof a.provenienza === 'string' ? a.provenienza : undefined,
        frasi: lista(a.frasi),
      });
      return bene(`documento ${d.id} al centro`);
    }
    case 'chiudi_documento':
      m.chiudiDocumento(testo(a.bolla));
      return bene('documento chiuso');
    case 'assorbi': {
      const t = m.assorbi(testo(a.documento), testo(a.task));
      return bene(`il documento è fra le cose di ${t.nome}`);
    }
    case 'apri_cassetto':
      m.apriCassetto();
      return bene('cassetto aperto');
    case 'chiudi_cassetto':
      m.chiudiCassetto();
      return bene('cassetto chiuso');
    case 'occupatene': {
      const t = m.occupatene(testo(a.notifica), {
        nome: testo(a.nome),
        richiesta: testo(a.richiesta),
        frasi: lista(a.frasi),
        uscita: suoUscita(a),
      });
      return bene(`bozza ${t.id} «${t.nome}» nella dropzone`);
    }
  }
  return male(`la mossa ${nome} non ha un'esecuzione`);
}

function lavoro(nome: string, a: Readonly<Record<string, unknown>>, m: Motore, task: string): Esito {
  switch (nome) {
    case 'avanza':
      m.avanza(task, typeof a.corpo === 'string' ? a.corpo : undefined, typeof a.dato === 'string' ? a.dato : undefined);
      return bene('avanzamento mostrato');
    case 'chiedi':
      m.chiedi(task, testo(a.domanda), lista(a.risposte) ?? []);
      return bene('domanda in INPUT: il task aspetta la risposta');
    case 'pronto':
      m.pronto(task, testo(a.corpo), lista(a.frasi) ?? []);
      return bene("pronto: aspetta la parola dell'utente");
    case 'fermo':
      m.fermo(task, testo(a.perche), lista(a.frasi) ?? []);
      return bene("fermo: aspetta l'utente");
    case 'concludi': {
      // Il lavoro non fa uscire niente da solo: un invio verso il mondo parte solo se
      // l'utente l'ha detto. Qui si dichiara pronto, e la parola resta sua.
      if (m.task(task).uscita?.attraversaConfine) {
        return male("questo task esce dal computer: non si conclude da solo, usa pronto e aspetta la parola dell'utente");
      }
      m.concludi(task);
      return bene('concluso');
    }
    case 'sottotask': {
      const t = m.sottotask(task, { tipo: a.tipo as Tipo, nome: testo(a.nome), richiesta: testo(a.richiesta) });
      return bene(`sotto-task ${t.id} nato`);
    }
  }
  return male(`la mossa ${nome} non ha un'esecuzione`);
}
