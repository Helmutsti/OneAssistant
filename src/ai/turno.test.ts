import { describe, expect, it } from 'vitest';
import { Motore } from '../modello/motore.ts';
import { OrologioFermo } from '../modello/orologio.ts';
import { DELAY_MS } from '../modello/tipi.ts';
import { esegui } from './esecutore.ts';
import { Guasto, type Pensiero, type Richiesta } from './porta.ts';
import { Turni } from './turno.ts';
import type { Chiamata } from './vocabolario.ts';

/** Un pensiero scritto a mano: per ogni passo, le mosse da fare. */
function copione(passi: Array<(r: Richiesta) => Chiamata[]>): Pensiero & { visti: Richiesta[] } {
  const visti: Richiesta[] = [];
  return {
    visti,
    async passo(r) {
      visti.push(r);
      const p = passi.shift();
      return p ? p(r) : [];
    },
  };
}

const mossa = (nome: string, argomenti: Record<string, unknown> = {}): Chiamata => ({ nome, argomenti });
const attesa = () => new Promise((ok) => setTimeout(ok, 0));

function banco(passi: Array<(r: Richiesta) => Chiamata[]>) {
  const orologio = new OrologioFermo(Date.parse('2026-09-23T09:00:00Z'));
  const inviati: string[] = [];
  const m = new Motore(orologio, async (u) => void inviati.push(u.a));
  const salvati: string[] = [];
  const ai = copione(passi);
  const turni = new Turni(m, ai, { salva: (r, t) => salvati.push(`${r}: ${t}`) });
  return { m, orologio, inviati, salvati, ai, turni };
}

describe('la mail a Elena, da L3 - Flusso task', () => {
  it('bozza, conferma, domanda, pronta, invio dopo 90 secondi', async () => {
    const { m, orologio, inviati, salvati, turni } = banco([
      // 1 · «scrivi a Elena che venerdì non ci sono»: guarda, bozza, risponde.
      () => [mossa('guarda')],
      () => [
        mossa('componi_bozza', {
          tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'scrivi a Elena che venerdì non ci sono',
          elementi: ['contatto | Elena Sarti', 'appuntamento | venerdì'], frasi: ['vai', 'cambia'], servizio: 'email', a: 'Elena Sarti',
        }),
        mossa('rispondi', { testo: 'Te la scrivo così?' }),
      ],
      // 2 · «vai»: conferma.
      () => [mossa('conferma', { bozza: 't1' }), mossa('rispondi', { testo: 'La scrivo.' })],
      // 3 · il lavoro: chiede del lunedì.
      () => [mossa('avanza', { corpo: 'Cara Elena, venerdì non sarò in ufficio…' }), mossa('chiedi', { domanda: 'Le dico anche del lunedì?', risposte: ['sì, anche lunedì', 'no, solo venerdì'] })],
      // 4 · «no, solo venerdì».
      () => [mossa('rispondi_domanda', { risposta: 'no, solo venerdì' }), mossa('rispondi', { testo: 'Solo venerdì.' })],
      // 5 · il lavoro riprende e la mail è pronta.
      (r) => {
        expect(r.frase).toContain('Risposta: no, solo venerdì');
        return [mossa('pronto', { corpo: 'Cara Elena, venerdì non sarò in ufficio.', frasi: ['manda la mail', 'leggila', 'cambia il venerdì'] })];
      },
      // 6 · «manda la mail».
      () => [mossa('invia', { task: 't1' }), mossa('rispondi', { testo: 'Pronta. La mando fra 90 secondi.' })],
    ]);

    await turni.conversa('scrivi a Elena che venerdì non ci sono');
    expect(m.bozzaInDropzone()?.nome).toBe('Scrivere a Elena');
    expect(m.fotografia().scambio?.risposta).toBe('Te la scrivo così?');

    await turni.conversa('vai');
    await attesa();
    expect(m.fotografia().domanda?.testo).toBe('Le dico anche del lunedì?');

    await turni.conversa('no, solo venerdì');
    await attesa();
    const t = m.task('t1');
    expect(t.attesa).toBe('parola');
    expect(m.fotografia().active).toBe('t1');
    expect(m.frasiInput().frasi[0]).toBe('manda la mail');

    await turni.conversa('manda la mail');
    expect(m.frasiInput().frasi).toEqual(['manda subito', 'no, aspetta']);
    orologio.salta(DELAY_MS - 1);
    m.batti();
    await attesa();
    expect(inviati).toEqual([]);
    orologio.salta(1);
    m.batti();
    await attesa();
    expect(inviati).toEqual(['Elena Sarti']);
    expect(m.fotografia().bolle).toHaveLength(0);
    expect(salvati[0]).toBe('user: scrivi a Elena che venerdì non ci sono');
    expect(salvati).toContain('assistant: Pronta. La mando fra 90 secondi.');
  });
});

describe('i confini del giro', () => {
  it('senza AI non si finge: il guasto si dice a schermo', async () => {
    const orologio = new OrologioFermo(0);
    const m = new Motore(orologio, async () => {});
    const turni = new Turni(m, { passo: async () => { throw new Guasto('Manca la chiave di OpenRouter: va messa in .env.'); } }, { salva: () => {} });
    await turni.conversa('ciao');
    expect(m.fotografia().guasto).toMatch(/chiave/);
    expect(m.fotografia().pensa).toBe(false);
  });

  it('il lavoro non fa uscire niente da solo', () => {
    const m = new Motore(new OrologioFermo(0), async () => {});
    const t = m.componi({ tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'a', uscita: { servizio: 'email', a: 'Elena', attraversaConfine: true } });
    m.conferma(t.id);
    const e = esegui(mossa('concludi'), m, 'lavoro', t.id);
    expect(e.sbagliata).toBe(true);
    expect(t.invio).toBeUndefined();
  });

  it('una mossa che non è del ruolo non esiste', () => {
    const m = new Motore(new OrologioFermo(0), async () => {});
    expect(esegui(mossa('invia', { task: 'x' }), m, 'lavoro', 'x').sbagliata).toBe(true);
    expect(esegui(mossa('pronto', { corpo: 'x', frasi: [] }), m, 'conversazione').sbagliata).toBe(true);
  });

  it('un argomento fuori dall\'insieme la rifiuta', () => {
    const m = new Motore(new OrologioFermo(0), async () => {});
    const e = esegui(mossa('componi_bozza', { tipo: 'razzo', nome: 'x', richiesta: 'y' }), m, 'conversazione');
    expect(e.sbagliata).toBe(true);
    expect(e.visto).toMatch(/tipo/);
  });

  it('un lavoro che si interrompe senza esito lascia il task fermo, non azzurro per sempre', async () => {
    const { m, turni } = banco([
      () => [mossa('componi_bozza', { tipo: 'documento', nome: 'Leggere il verbale', richiesta: 'leggi' }), mossa('conferma', { bozza: 't1' }), mossa('rispondi', { testo: 'Lo leggo.' })],
      () => [],
    ]);
    await turni.conversa('leggi il verbale');
    await attesa();
    expect(m.task('t1').attesa).toBe('fermo');
  });
});
