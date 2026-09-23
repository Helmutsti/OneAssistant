// La porta dell'archivio, lato Node.
//
// L'interfaccia web non legge percorsi arbitrari del disco: l'accesso ai documenti
// dell'utente passa da qui, e il processo Node espone soltanto i file dell'utente attivo
// (`docs/L04`). L'utente del prototipo è uno solo, `user_123`, configurato qui e non dal
// browser (`docs/L04`, `docs/L03`).
//
// Questa porta **legge e basta**. Nel prototipo l'unica scrittura persistente autorizzata è
// la chat raw, che ha la sua porta (storico §5).

import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve, sep } from 'node:path';
import type { Connect } from 'vite';

export const UTENTE = 'user_123';
export const ARCHIVIO = resolve('Archivio');
export const RADICE = join(ARCHIVIO, 'users');
export const CASA = join(RADICE, UTENTE);
const SISTEMA = join(ARCHIVIO, 'system-storage');

/** I tipi che la porta sa servire. Quello che non è qui non esce. */
const TIPI: Record<string, string> = {
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
};

/** `dove` è `cartella` stessa o sta sotto di lei. Confronto sul percorso, non sul testo. */
function dentro(dove: string, cartella: string): boolean {
  return dove === cartella || dove.startsWith(cartella + sep);
}

/**
 * Da percorso chiesto dal browser a percorso su disco, o `undefined`. Tre controlli, e
 * ognuno regge anche se un altro sbaglia (audit F-009, F-010):
 *
 * 1. il primo pezzo è l'utente attivo, e ogni pezzo è fatto di lettere, numeri, punto e
 *    trattino, ma non è `.` né `..`;
 * 2. il percorso risolto cade dentro la cartella dell'utente, non soltanto dentro `users/`;
 * 3. lo stesso vale per il percorso **reale**: un collegamento dentro l'archivio non porta fuori.
 */
export function dentroLArchivio(percorso: string, base = RADICE, primo: string | null = UTENTE): string | undefined {
  const pezzi = percorso.split('/').filter(Boolean);
  if (
    !pezzi.length ||
    (primo !== null && pezzi[0] !== primo) ||
    !pezzi.every((x) => x !== '.' && x !== '..' && /^[A-Za-z0-9._-]+$/.test(x))
  ) return undefined;
  const casa = primo !== null ? resolve(base, primo) : base;
  const dove = resolve(base, ...pezzi);
  if (!dentro(dove, casa)) return undefined;
  try {
    const casaVera = realpathSync(casa);
    let esiste = dove;
    while (!existsSync(esiste) && dentro(dirname(esiste), casa)) esiste = dirname(esiste);
    return existsSync(esiste) && dentro(realpathSync(esiste), casaVera) ? dove : undefined;
  } catch {
    return undefined;
  }
}

/** I documenti di testo sotto una cartella, col percorso relativo. */
export function documenti(dove: string, prefisso = ''): Record<string, string> {
  const fuori: Record<string, string> = {};
  if (!existsSync(dove)) return fuori;
  for (const voce of readdirSync(dove, { withFileTypes: true })) {
    const relativo = prefisso ? `${prefisso}/${voce.name}` : voce.name;
    if (voce.isDirectory()) Object.assign(fuori, documenti(join(dove, voce.name), relativo));
    else if (voce.isFile() && ['.txt', '.md'].includes(extname(voce.name))) {
      fuori[relativo] = readFileSync(join(dove, voce.name), 'utf8');
    }
  }
  return fuori;
}

/** L'elenco dei file del servizio filesystem, per il contesto: nomi, non contenuti. */
export function elencoFile(dove: string, prefisso = ''): string[] {
  if (!existsSync(dove)) return [];
  return readdirSync(dove, { withFileTypes: true }).flatMap((v) => {
    const relativo = prefisso ? `${prefisso}/${v.name}` : v.name;
    return v.isDirectory() ? elencoFile(join(dove, v.name), relativo) : [relativo];
  });
}

function servi(res: import('node:http').ServerResponse, dove: string | undefined): void {
  const tipo = dove ? TIPI[extname(dove).toLowerCase()] : undefined;
  if (!dove || !tipo || !existsSync(dove) || !statSync(dove).isFile()) {
    res.statusCode = dove ? 404 : 400;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ perche: dove ? 'non c’è' : 'percorso non valido' }));
    return;
  }
  res.setHeader('content-type', tipo);
  // La roba di una persona non si mette in cache dai proxy: è sua.
  res.setHeader('cache-control', 'no-cache, private');
  res.end(readFileSync(dove));
}

/** `GET /archivio/user_123/<percorso>`: un file dell'utente attivo, e niente altro. */
export const portaArchivio: Connect.NextHandleFunction = (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ perche: 'l’archivio si legge soltanto' }));
    return;
  }
  const chiesto = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
  const dove = dentroLArchivio(chiesto);
  if (!dove) console.warn(`[archivio] rifiutato: ${chiesto}`);
  servi(res, dove);
};

/**
 * `GET /sistema/<file>`: i file condivisi del sistema, come il suono delle notifiche
 * (`docs/L03` §system-storage). Non appartengono a nessun utente, e la porta serve solo
 * quella cartella.
 */
export const portaSistema: Connect.NextHandleFunction = (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end();
    return;
  }
  const chiesto = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
  servi(res, dentroLArchivio(chiesto, SISTEMA, null));
};
