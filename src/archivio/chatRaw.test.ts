// La chat raw dal lato del browser: «integrale» vuol dire garantito (storico §16). I
// messaggi partono in ordine, si riprova finché il server non conferma, e un fallimento si
// dice a schermo.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatRaw } from './chatRaw.ts';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('la chat raw nel browser', () => {
  it('manda i messaggi in ordine, uno dopo l’altro', async () => {
    const mandati: string[] = [];
    vi.stubGlobal('fetch', async (_u: string, o: { body: string }) => {
      mandati.push(JSON.parse(o.body).text);
      return { ok: true, status: 204 };
    });
    const chat = new ChatRaw(() => {});
    chat.salva('user', 'uno');
    chat.salva('assistant', 'due');
    chat.salva('user', 'tre');
    await vi.waitFor(() => expect(mandati).toEqual(['uno', 'due', 'tre']));
  });

  it('se il server non risponde riprova, lo dice a schermo, e quando torna lo toglie', async () => {
    vi.useFakeTimers();
    let giu = true;
    const mandati: string[] = [];
    vi.stubGlobal('fetch', async (_u: string, o: { body: string }) => {
      if (giu) throw new Error('rete');
      mandati.push(JSON.parse(o.body).text);
      return { ok: true, status: 204 };
    });
    const guasti: Array<string | undefined> = [];
    const chat = new ChatRaw((t) => guasti.push(t));
    chat.salva('user', 'non perdermi');
    await vi.advanceTimersByTimeAsync(4_000);
    expect(guasti[0]).toMatch(/non si sta salvando/);
    expect(mandati).toEqual([]);
    giu = false;
    await vi.advanceTimersByTimeAsync(10_000);
    expect(mandati).toEqual(['non perdermi']);
    expect(guasti.at(-1)).toBeUndefined();
  });

  it('un messaggio malformato non si riprova all’infinito: si dice, e si va avanti', async () => {
    const guasti: Array<string | undefined> = [];
    let volte = 0;
    vi.stubGlobal('fetch', async () => {
      volte++;
      return { ok: false, status: 400 };
    });
    const chat = new ChatRaw((t) => guasti.push(t));
    chat.salva('user', 'x');
    await vi.waitFor(() => expect(guasti[0]).toMatch(/malformato/));
    expect(volte).toBe(1);
  });
});
