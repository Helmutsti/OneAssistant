// Le porte del server: l'archivio che non si lascia attraversare (audit F-009, F-010), la chat
// raw con un fuso solo e una riga per messaggio (`docs/L03`, storico §16). Tutto su cartelle
// temporanee: nessun test scrive nell'archivio vero.

import { EventEmitter } from 'node:events';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { dentroLArchivio } from './archivio.ts';
import { creaPortaChatRaw, oraDiRoma } from './chatRaw.ts';

let radice: string;

beforeAll(() => {
  radice = mkdtempSync(join(tmpdir(), 'oneassist-'));
  mkdirSync(join(radice, 'user_123', 'memory'), { recursive: true });
  mkdirSync(join(radice, 'altro'), { recursive: true });
  writeFileSync(join(radice, 'user_123', 'memory', 'general.txt'), 'mio');
  writeFileSync(join(radice, 'altro', 'segreto.txt'), 'di un altro');
  // Un collegamento dentro la cartella dell'utente che porta fuori. Su Windows una junction
  // non chiede i privilegi di amministratore.
  symlinkSync(join(radice, 'altro'), join(radice, 'user_123', 'ponte'), 'junction');
});

afterAll(() => rmSync(radice, { recursive: true, force: true }));

describe("il confine dell'archivio", () => {
  const dentro = (p: string) => dentroLArchivio(p, radice, 'user_123');

  it("serve i file dell'utente attivo", () => {
    expect(dentro('user_123/memory/general.txt')).toBe(join(radice, 'user_123', 'memory', 'general.txt'));
  });

  it('non si attraversa con i due punti, in nessuna forma', () => {
    expect(dentro('user_123/../altro/segreto.txt')).toBeUndefined();
    expect(dentro('user_123/memory/../../altro/segreto.txt')).toBeUndefined();
    expect(dentro('user_123/./memory/general.txt')).toBeUndefined();
  });

  it("non serve un altro utente, né la radice degli utenti", () => {
    expect(dentro('altro/segreto.txt')).toBeUndefined();
    expect(dentro('')).toBeUndefined();
  });

  it('rifiuta i caratteri che non stanno in un nome di file', () => {
    expect(dentro('user_123/memory/gen%2eral.txt')).toBeUndefined();
    expect(dentro('user_123/memory/a b.txt')).toBeUndefined();
  });

  it('un collegamento dentro la cartella non porta fuori', () => {
    expect(dentro('user_123/ponte/segreto.txt')).toBeUndefined();
  });
});

/** Una richiesta e una risposta finte, quanto basta alla porta. */
function chiama(porta: ReturnType<typeof creaPortaChatRaw>, metodo: string, corpo?: unknown): Promise<number> {
  return new Promise((fatto) => {
    const req = Object.assign(new EventEmitter(), { method: metodo });
    const res = {
      statusCode: 200,
      setHeader: () => undefined,
      end: () => fatto(res.statusCode),
    };
    porta(req as never, res as never, () => undefined);
    if (corpo !== undefined) req.emit('data', JSON.stringify(corpo));
    req.emit('end');
  });
}

describe('la chat raw', () => {
  it("un fuso solo: Europe/Rome, per il giorno e per l'ora della riga", () => {
    // Le 23:30 UTC del 23 settembre sono già il 24 a Roma, all'1:30, in ora legale.
    expect(oraDiRoma(new Date('2026-09-23T23:30:00Z'))).toEqual({ giorno: '2026-09-24', timestamp: '2026-09-24T01:30:00+02:00' });
    // D'inverno lo scarto è di un'ora.
    expect(oraDiRoma(new Date('2026-01-10T08:00:00Z')).timestamp).toBe('2026-01-10T09:00:00+01:00');
  });

  it('una riga per messaggio, in ordine, nel file del giorno, senza riscrivere le precedenti', async () => {
    const casa = mkdtempSync(join(tmpdir(), 'oneassist-casa-'));
    const porta = creaPortaChatRaw(casa);
    expect(await chiama(porta, 'POST', { timestamp: '2026-09-23T10:00:00Z', role: 'user', text: 'scrivi a Elena' })).toBe(204);
    expect(await chiama(porta, 'POST', { timestamp: '2026-09-23T10:00:01Z', role: 'assistant', text: 'Te la scrivo così?' })).toBe(204);
    expect(readdirSync(join(casa, 'chat-raw'))).toEqual(['2026-09-23.jsonl']);
    const righe = readFileSync(join(casa, 'chat-raw', '2026-09-23.jsonl'), 'utf8').trim().split('\n').map((r) => JSON.parse(r));
    expect(righe).toEqual([
      { timestamp: '2026-09-23T12:00:00+02:00', role: 'user', text: 'scrivi a Elena' },
      { timestamp: '2026-09-23T12:00:01+02:00', role: 'assistant', text: 'Te la scrivo così?' },
    ]);
    rmSync(casa, { recursive: true, force: true });
  });

  it('rifiuta un messaggio malformato, e scrive solo con POST', async () => {
    const casa = mkdtempSync(join(tmpdir(), 'oneassist-casa-'));
    const porta = creaPortaChatRaw(casa);
    expect(await chiama(porta, 'POST', { timestamp: 'ieri', role: 'user', text: 'x' })).toBe(400);
    expect(await chiama(porta, 'POST', { timestamp: '2026-09-23T10:00:00Z', role: 'system', text: 'x' })).toBe(400);
    expect(await chiama(porta, 'GET')).toBe(405);
    rmSync(casa, { recursive: true, force: true });
  });
});
