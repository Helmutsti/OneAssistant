// La porta verso l'AI: un errore di passaggio del fornitore si riprova; il resto si dice
// subito, e non si finge mai una risposta (storico §7).

import { afterEach, describe, expect, it, vi } from 'vitest';
import { Guasto, creaPorta, type Richiesta } from './porta.ts';

const R: Richiesta = { ruolo: 'conversazione', frase: 'ciao', passato: [], prima: [] };
const risposta = (status: number, corpo: unknown) => ({ ok: status < 400, status, json: async () => corpo });

afterEach(() => vi.unstubAllGlobals());

describe('la porta verso l’AI', () => {
  it('un sovraccarico si riprova, e quando passa torna la risposta', async () => {
    const risposte = [
      risposta(502, { perche: 'Upstream error from Nvidia: Service temporarily overloaded' }),
      risposta(200, { chiamate: [{ nome: 'rispondi', argomenti: { testo: 'Eccomi.' } }] }),
    ];
    let volte = 0;
    vi.stubGlobal('fetch', async () => risposte[volte++]);
    const mosse = await creaPorta([0, 0]).passo(R);
    expect(volte).toBe(2);
    expect(mosse[0]!.nome).toBe('rispondi');
  });

  it('dopo i tentativi si arrende, e lo dice', async () => {
    let volte = 0;
    vi.stubGlobal('fetch', async () => {
      volte++;
      return risposta(502, { perche: 'is temporarily rate-limited upstream' });
    });
    await expect(creaPorta([0, 0]).passo(R)).rejects.toThrow(/rate-limited/);
    expect(volte).toBe(3);
  });

  it('un errore che non è di passaggio non si riprova', async () => {
    let volte = 0;
    vi.stubGlobal('fetch', async () => {
      volte++;
      return risposta(502, { perche: 'No endpoints found that support tool use' });
    });
    await expect(creaPorta([0, 0]).passo(R)).rejects.toBeInstanceOf(Guasto);
    expect(volte).toBe(1);
  });

  it('senza chiave non si riprova e non si finge', async () => {
    let volte = 0;
    vi.stubGlobal('fetch', async () => {
      volte++;
      return risposta(503, { perche: 'manca la chiave' });
    });
    await expect(creaPorta([0, 0]).passo(R)).rejects.toThrow(/Manca la chiave/);
    expect(volte).toBe(1);
  });

  it('le parole invece di una mossa diventano la risposta, nella conversazione', async () => {
    vi.stubGlobal('fetch', async () => risposta(200, { chiamate: [], detto: 'Te la scrivo così?' }));
    const mosse = await creaPorta([]).passo(R);
    expect(mosse).toEqual([{ nome: 'rispondi', argomenti: { testo: 'Te la scrivo così?' } }]);
  });
});
