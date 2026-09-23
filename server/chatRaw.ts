// La porta della chat raw: l'unica scrittura persistente del prototipo (storico §5).
//
// Un file JSONL per giorno, `chat-raw/YYYY-MM-DD.jsonl`, una riga per messaggio con data e
// ora, ruolo e testo originale, aggiunti in ordine senza riscrivere i precedenti
// (`docs/L03`). Il fuso orario è **uno solo**, Europe/Rome, per il nome del file e per l'ora
// scritta nella riga (storico §16).

import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Connect } from 'vite';
import { CASA } from './archivio.ts';

const FUSO = 'Europe/Rome';

/** L'istante come ora locale di Roma, con lo scarto: 2026-09-23T15:20:00+02:00. */
export function oraDiRoma(istante: Date): { giorno: string; timestamp: string } {
  const parti = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: FUSO,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    })
      .formatToParts(istante)
      .map((p) => [p.type, p.value]),
  );
  const giorno = `${parti.year}-${parti.month}-${parti.day}`;
  const locale = Date.UTC(+parti.year!, +parti.month! - 1, +parti.day!, +parti.hour!, +parti.minute!, +parti.second!);
  const scarto = Math.round((locale - Math.floor(istante.getTime() / 1000) * 1000) / 60_000);
  const segno = scarto >= 0 ? '+' : '-';
  const hh = String(Math.floor(Math.abs(scarto) / 60)).padStart(2, '0');
  const mm = String(Math.abs(scarto) % 60).padStart(2, '0');
  return { giorno, timestamp: `${giorno}T${parti.hour}:${parti.minute}:${parti.second}${segno}${hh}:${mm}` };
}

/** La porta, per la cartella di un utente. I test la aprono su una cartella temporanea. */
export const creaPortaChatRaw = (casa: string): Connect.NextHandleFunction => (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return;
  }
  let corpo = '';
  req.on('data', (pezzo) => (corpo += pezzo));
  req.on('end', () => {
    res.setHeader('content-type', 'application/json');
    let messaggio: { timestamp?: string; role?: string; text?: string };
    try {
      messaggio = JSON.parse(corpo);
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ perche: 'messaggio non valido' }));
      return;
    }
    const istante = new Date(messaggio.timestamp ?? '');
    if (
      Number.isNaN(istante.getTime()) ||
      !['user', 'assistant'].includes(messaggio.role ?? '') ||
      typeof messaggio.text !== 'string'
    ) {
      res.statusCode = 400;
      res.end(JSON.stringify({ perche: 'messaggio non valido' }));
      return;
    }
    try {
      const { giorno, timestamp } = oraDiRoma(istante);
      const cartella = join(casa, 'chat-raw');
      mkdirSync(cartella, { recursive: true });
      appendFileSync(
        join(cartella, `${giorno}.jsonl`),
        `${JSON.stringify({ timestamp, role: messaggio.role, text: messaggio.text })}\n`,
        'utf8',
      );
      res.statusCode = 204;
      res.end();
    } catch (errore) {
      console.error('[chat-raw]', errore instanceof Error ? errore.message : errore);
      res.statusCode = 500;
      res.end(JSON.stringify({ perche: 'chat raw non salvata' }));
    }
  });
};

export const portaChatRaw = creaPortaChatRaw(CASA);
