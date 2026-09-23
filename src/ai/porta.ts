// La porta verso l'AI: `/ai-engine`, servita dal processo Node, dove sta la chiave di
// Anthropic (`docs/L04`). Un passo per chiamata: si manda quello che è già successo nel
// turno, e tornano le mosse da fare adesso.
//
// Non c'è un ripiego finto. Se Anthropic non è disponibile l'azione si blocca e
// l'interfaccia mostra un errore chiaro (storico §7). Un errore di passaggio del fornitore —
// sovraccarico, limite d'uso momentaneo — si riprova un paio di volte prima di dirlo: non è
// un ripiego, è la stessa domanda rifatta.

import type { Chiamata, Ruolo } from './vocabolario.ts';

export interface Passo {
  readonly chiamata: Chiamata;
  readonly visto: string;
  readonly sbagliata: boolean;
}

export interface Giro {
  readonly tua: string;
  readonly risposta?: string;
}

export interface Richiesta {
  readonly ruolo: Ruolo;
  /** La frase dell'utente, o la scheda del task da lavorare. */
  readonly frase: string;
  readonly passato: readonly Passo[];
  readonly prima: readonly Giro[];
}

/** Un guasto da dire a schermo. Il messaggio è per l'utente. */
export class Guasto extends Error {
  constructor(
    messaggio: string,
    /** Se è un errore di passaggio, che rifacendo la stessa domanda può non ripetersi. */
    readonly passeggero = false,
  ) {
    super(messaggio);
    this.name = 'Guasto';
  }
}

export interface Pensiero {
  passo(r: Richiesta): Promise<readonly Chiamata[]>;
}

/** Quanto si aspetta prima di rifare la domanda, un tentativo dopo l'altro. */
const ATTESE_MS = [1_500, 4_000];

/** Le parole con cui il fornitore dicono che è un momento, non un guasto. */
const DI_PASSAGGIO = /overload|rate.?limit|temporar|timeout|unavailable|try again|retry/i;

export function creaPorta(attese: readonly number[] = ATTESE_MS): Pensiero {
  return {
    async passo(r) {
      for (let tentativo = 0; ; tentativo++) {
        try {
          return await unPasso(r);
        } catch (e) {
          if (!(e instanceof Guasto) || !e.passeggero || tentativo >= attese.length) throw e;
          await new Promise((ok) => setTimeout(ok, attese[tentativo]));
        }
      }
    },
  };
}

export const portaAi: Pensiero = creaPorta();

async function unPasso(r: Richiesta): Promise<readonly Chiamata[]> {
  let risposta: Response;
  try {
    risposta = await fetch('/ai-engine', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ruolo: r.ruolo,
        frase: r.frase,
        prima: r.prima,
        passato: r.passato.map((p) => ({
          nome: p.chiamata.nome,
          argomenti: p.chiamata.argomenti,
          visto: p.visto,
          sbagliata: p.sbagliata,
        })),
      }),
    });
  } catch {
    throw new Guasto('Il server del prototipo non risponde: è acceso?');
  }
  const corpo = (await risposta.json().catch(() => ({}))) as {
    chiamate?: Chiamata[];
    detto?: string;
    perche?: string;
  };
  if (risposta.status === 503) throw new Guasto('Manca la chiave di Anthropic: va messa in .env.');
  if (!risposta.ok) {
    // La porta risponde 502 quando il fornitore non ce l'ha fatta, e il perché lo dice lui.
    throw new Guasto(
      `Anthropic non ha risposto${corpo.perche ? `: ${corpo.perche}` : ''}.`,
      risposta.status === 502 && DI_PASSAGGIO.test(corpo.perche ?? ''),
    );
  }
  const chiamate = corpo.chiamate ?? [];
  if (chiamate.length) return chiamate;
  // Ha risposto a parole invece che con una mossa: nella conversazione quelle parole sono la
  // risposta. Nel lavoro no, e il turno si chiude senza mosse.
  if (r.ruolo === 'conversazione' && corpo.detto?.trim()) {
    return [{ nome: 'rispondi', argomenti: { testo: corpo.detto.trim() } }];
  }
  if (corpo.perche === 'rifiuto') throw new Guasto('Il modello ha rifiutato la richiesta.');
  if (corpo.perche === 'troppo lungo') throw new Guasto('La risposta del modello si è interrotta a metà.');
  return [];
}
