// L'AI a copione, per i test dell'interfaccia. Risponde al posto di `/ai-engine` con le
// mosse scritte qui, e intercetta la chat raw perché nessuna prova scriva nell'archivio.
//
// La conversazione ha una fila di turni: ogni frase dell'utente ne consuma uno. Il lavoro
// risponde per nome del task: una fila di passi per ciascuno, o `'appeso'` per lasciarlo a
// lavorare.

import type { Page } from '@playwright/test';

export interface Mossa {
  readonly nome: string;
  readonly argomenti: Record<string, unknown>;
}

export const mossa = (nome: string, argomenti: Record<string, unknown> = {}): Mossa => ({ nome, argomenti });

export interface Copione {
  conversazione: Mossa[][];
  lavoro?: Record<string, Mossa[][] | 'appeso'>;
  /** I documenti dell'utente, al posto di quelli dell'archivio. */
  archivio?: Record<string, string>;
}

/** L'utente di prova: gli stessi documenti del prototipo, fissati qui. */
const T = String.fromCharCode(9);
const A_CAPO = String.fromCharCode(10);

export const ARCHIVIO: Record<string, string> = {
  'preferences.txt': [
    'Utente:',
    `${T}name: Lucia Moretti`,
    `${T}language: italian`,
    'System preferences',
    `${T}focuses:`,
    `${T}${T}Via della libertà, Bologna - Lavoro`,
    `${T}${T}Piazza della speranza, Bologna - Casa`,
    `${T}theme: cenere`,
    'assistant:',
    `${T}reading: off`,
    `${T}settings:`,
    `${T}${T}voice: femminile`,
  ].join(A_CAPO),
  'system.txt': [
    'microfono: spento',
    'batteria: 55%',
    'WIFI: collegato a "WIFI-lucia"',
    'VOLUME: 40%',
    'gps: Piazza della speranza, Bologna',
  ].join(A_CAPO),
  'memory/general.txt': 'Lavoro dalle 9 alle 13 e dalle 14 alle 18.',
  'services/email.txt': [
    'storico:',
    '2026-06-10 10:22 | ricevuta | Andrea Riva | Proposta Acme | ci vediamo giovedì?',
    '2026-06-15 12:32 | inviata | Mamma | Tanti auguri | Auguri',
  ].join(A_CAPO),
};

export async function prepara(page: Page, c: Copione, opzioni: { senzaChiave?: boolean } = {}): Promise<string[]> {
  const chatRaw: string[] = [];
  const archivio = { ...ARCHIVIO, ...c.archivio };
  await page.route('**/archivio/user_123/**', async (route) => {
    const percorso = decodeURIComponent(new URL(route.request().url()).pathname.replace('/archivio/user_123/', ''));
    if (percorso in archivio) return route.fulfill({ status: 200, contentType: 'text/plain; charset=utf-8', body: archivio[percorso]! });
    return route.continue();
  });
  await page.route('**/chat-raw', async (route) => {
    const m = JSON.parse(route.request().postData() || '{}') as { role: string; text: string };
    chatRaw.push(`${m.role}: ${m.text}`);
    await route.fulfill({ status: 204 });
  });
  await page.route('**/ai-engine', async (route) => {
    if (opzioni.senzaChiave) {
      return route.fulfill({ status: 503, contentType: 'application/json', body: '{"perche":"manca la chiave"}' });
    }
    const corpo = JSON.parse(route.request().postData() || '{}') as { ruolo: string; frase: string; passato: unknown[] };
    // Un passo per turno: il secondo passo dello stesso turno non ha più niente da dire.
    if (corpo.passato.length) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"chiamate":[]}' });
    let chiamate: Mossa[] = [];
    if (corpo.ruolo === 'lavoro') {
      const nome = Object.keys(c.lavoro ?? {}).find((n) => corpo.frase.includes(n));
      const fila = nome ? c.lavoro![nome] : undefined;
      if (fila === 'appeso') return; // resta a lavorare
      chiamate = fila?.shift() ?? [];
    } else {
      chiamate = c.conversazione.shift() ?? [];
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ chiamate }) });
  });
  await page.goto('/');
  await page.locator('[data-parte=input]').waitFor();
  return chatRaw;
}

/** L'utente scrive e preme invio. */
export async function di(page: Page, frase: string): Promise<void> {
  await page.keyboard.type(frase);
  await page.keyboard.press('Enter');
}

/**
 * Aspetta che i movimenti finiscano: le misure si prendono a riposo. La pulsazione di chi
 * lavora non finisce mai, e non si aspetta.
 */
export async function quiete(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}

/** Il rettangolo di un elemento, e la sua distanza dai bordi destro e basso. */
export async function cornice(page: Page, selettore: string) {
  await quiete(page);
  const r = await page.locator(selettore).first().boundingBox();
  if (!r) throw new Error(`${selettore} non è a schermo`);
  const vp = page.viewportSize()!;
  return { ...r, destra: Math.round(vp.width - r.x - r.width), fondo: Math.round(vp.height - r.y - r.height) };
}

/** Gli stili calcolati che contano per le schede di conformità. */
export async function stile(page: Page, selettore: string) {
  await quiete(page);
  return page.locator(selettore).first().evaluate((el) => {
    const c = getComputedStyle(el);
    return {
      font: c.fontFamily.split(',')[0]!.replace(/["']/g, ''),
      size: parseFloat(c.fontSize),
      peso: c.fontWeight,
      spaziatura: c.letterSpacing,
      colore: c.color,
      raggio: c.borderRadius,
      padding: c.padding,
      gap: c.gap,
      opacita: parseFloat(c.opacity),
      visibilita: c.visibility,
      sfondo: c.backgroundImage,
      bordo: c.border,
    };
  });
}
