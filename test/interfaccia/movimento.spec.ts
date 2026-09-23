// I movimenti di `L2 - Bubble movement`: chi si muove, da dove, e per quanto.

import { expect, test, type Page } from '@playwright/test';
import { di, mossa, prepara } from './copione.ts';

/** Registra le animazioni che il sistema crea, col loro bersaglio e la loro durata. */
async function spia(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __moti: unknown[] }).__moti = [];
    const originale = Element.prototype.animate;
    Element.prototype.animate = function (k, o) {
      const el = this as HTMLElement;
      (window as unknown as { __moti: unknown[] }).__moti.push({
        chi: el.dataset.posto ?? (el.querySelector('[data-parte=bolla]') ? 'fantasma' : el.className.slice(0, 20)),
        durata: typeof o === 'object' ? o?.duration : o,
        primo: JSON.stringify((k as Keyframe[])[0] ?? {}),
      });
      return originale.call(this, k, o);
    };
  });
}

const moti = (page: Page) =>
  page.evaluate(() => (window as unknown as { __moti: Array<{ chi: string; durata: number; primo: string }> }).__moti);

const DUE_BOLLE = [
  mossa('componi_bozza', { tipo: 'cartella', nome: 'Riordino Acme', richiesta: 'riordina' }),
  mossa('conferma', { bozza: 't2' }),
  mossa('componi_bozza', { tipo: 'documento', nome: 'Leggere il verbale', richiesta: 'leggi' }),
  mossa('conferma', { bozza: 't3' }),
  mossa('rispondi', { testo: 'Vanno.' }),
];

test('la nascita: la bozza vola dalla dropzone al suo posto in 420 ms', async ({ page }) => {
  await spia(page);
  await prepara(page, {
    conversazione: [
      [mossa('componi_bozza', { tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'scrivi' }), mossa('rispondi', { testo: 'Così?' })],
      [mossa('conferma', { bozza: 't2' }), mossa('rispondi', { testo: 'Va.' })],
    ],
    lavoro: { 'Scrivere a Elena': 'appeso' },
  });
  await di(page, 'scrivi a Elena');
  await expect(page.locator('[data-parte=dropzone]')).toHaveCount(1);
  await di(page, 'vai');
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(1);
  const volo = (await moti(page)).find((m) => m.chi === 't2');
  expect(volo?.durata).toBe(420);
  // Parte da un punto lontano, in basso a sinistra: dove stava la dropzone.
  const [, dy] = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(volo!.primo)!.slice(1).map(Number);
  expect(dy).toBeGreaterThan(100);
});

test('l\'onda: all\'arrivo le vicine fanno spazio, sfalsate', async ({ page }) => {
  await spia(page);
  await prepara(page, { conversazione: [DUE_BOLLE], lavoro: { 'Riordino Acme': 'appeso', 'Leggere il verbale': 'appeso' } });
  await di(page, 'prepara');
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(2);
  await page.waitForTimeout(100);
  expect((await moti(page)).some((m) => m.chi === 't2' && m.primo.includes('translate'))).toBe(true);
});

test('la messa da parte: la bolla si contrae, vola al chip, e il chip compare solo all\'arrivo', async ({ page }) => {
  await spia(page);
  await prepara(page, {
    conversazione: [DUE_BOLLE, [mossa('metti_da_parte', { bolla: 't3' }), mossa('rispondi', { testo: 'Messa da parte.' })]],
    lavoro: { 'Riordino Acme': 'appeso', 'Leggere il verbale': 'appeso' },
  });
  await di(page, 'prepara');
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(2);
  await di(page, 'metti da parte il verbale');
  const chip = page.locator('[data-parte=chip]', { hasText: 'Leggere il verbale' });
  await expect(chip).toHaveCount(1);
  await expect(chip).toHaveCSS('visibility', 'hidden');
  await expect(chip).toHaveCSS('visibility', 'visible', { timeout: 2000 });
  const durate = (await moti(page)).filter((m) => m.chi === 'fantasma' || m.chi.startsWith('overflow')).map((m) => m.durata);
  expect(durate).toEqual(expect.arrayContaining([280, 420]));
});

test('l\'uscita: una bolla finita svanisce sul posto in 320 ms, a scala 94%', async ({ page }) => {
  await spia(page);
  await prepara(page, {
    conversazione: [DUE_BOLLE, [mossa('concludi', { task: 't2' }), mossa('rispondi', { testo: 'Fatto.' })]],
    lavoro: { 'Riordino Acme': 'appeso', 'Leggere il verbale': 'appeso' },
  });
  await di(page, 'prepara');
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(2);
  await di(page, 'il riordino è finito');
  await expect(page.locator('[data-posto=t2]')).toHaveCount(0);
  await expect.poll(async () => (await moti(page)).some((m) => m.chi === 'fantasma' && m.durata === 320)).toBe(true);
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(1, { timeout: 2000 });
});

test('con il movimento ridotto non si muove niente', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await spia(page);
  await prepara(page, { conversazione: [DUE_BOLLE], lavoro: { 'Riordino Acme': 'appeso', 'Leggere il verbale': 'appeso' } });
  await di(page, 'prepara');
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(2);
  expect((await moti(page)).filter((m) => m.chi.startsWith('t'))).toEqual([]);
});
