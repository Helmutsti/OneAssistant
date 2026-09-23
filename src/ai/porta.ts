// La porta verso l'AI: `/ai-engine`, servita dal processo Node, dove sta la chiave di
// OpenRouter (`docs/L04`). Un passo per chiamata: si manda quello che è già successo nel
// turno, e tornano le mosse da fare adesso.
//
// Non c'è un ripiego finto. Se OpenRouter non è disponibile l'azione si blocca e
// l'interfaccia mostra un errore chiaro (storico §7).

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
  constructor(messaggio: string) {
    super(messaggio);
    this.name = 'Guasto';
  }
}

export interface Pensiero {
  passo(r: Richiesta): Promise<readonly Chiamata[]>;
}

export const portaAi: Pensiero = {
  async passo(r) {
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
    if (risposta.status === 503) throw new Guasto('Manca la chiave di OpenRouter: va messa in .env.');
    if (!risposta.ok) throw new Guasto(`OpenRouter non ha risposto${corpo.perche ? `: ${corpo.perche}` : ''}.`);
    const chiamate = corpo.chiamate ?? [];
    if (chiamate.length) return chiamate;
    // Ha risposto a parole invece che con una mossa: nella conversazione quelle parole
    // sono la risposta. Nel lavoro no, e il turno si chiude senza mosse.
    if (r.ruolo === 'conversazione' && corpo.detto?.trim()) {
      return [{ nome: 'rispondi', argomenti: { testo: corpo.detto.trim() } }];
    }
    if (corpo.perche === 'rifiuto') throw new Guasto('Il modello ha rifiutato la richiesta.');
    if (corpo.perche === 'troppo lungo') throw new Guasto('La risposta del modello si è interrotta a metà.');
    return [];
  },
};
