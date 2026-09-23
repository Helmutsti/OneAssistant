// Le aree a riposo, e i loro ancoraggi (`docs/design/L0` leggi 08, 09 e 11).

import { expect, test } from '@playwright/test';
import { cornice, prepara, stile } from './copione.ts';

test.beforeEach(async ({ page }) => {
  await prepara(page, { conversazione: [] });
});

test('la pila di destra: TIMELINE in alto a destra, poi PROFILEBAR e SYSTEMBAR, a 22 fra loro', async ({ page }) => {
  const timeline = await cornice(page, '[data-parte=timeline]');
  const profilo = await cornice(page, '[data-parte=profilebar]');
  const sistema = await cornice(page, '[data-parte=systembar]');
  expect(timeline.destra).toBe(44);
  expect(Math.round(timeline.y)).toBe(40);
  expect(profilo.destra).toBe(44);
  expect(Math.round(profilo.y - (timeline.y + timeline.height))).toBe(22);
  expect(sistema.destra).toBe(44);
  expect(Math.round(sistema.y - (profilo.y + profilo.height))).toBe(22);
});

test('INPUT in basso a sinistra, al margine 44', async ({ page }) => {
  const input = await cornice(page, '[data-parte=input]');
  expect(Math.round(input.x)).toBe(44);
  expect(input.fondo).toBe(44);
});

test('la NOTIFICATIONBAR in basso a destra, campanella 44 e badge 16', async ({ page }) => {
  const campanella = await cornice(page, '[data-parte=campanella]');
  expect(campanella.destra).toBe(44);
  expect(campanella.fondo).toBe(44);
  expect(Math.round(campanella.width)).toBe(44);
  const badge = await cornice(page, '[data-parte=badge]');
  expect(Math.round(badge.height)).toBe(16);
  await expect(page.locator('[data-parte=badge]')).toHaveText('1');
});

test('a riposo: nessuna bolla, nessuna dropzone, nessun chip', async ({ page }) => {
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(0);
  await expect(page.locator('[data-parte=dropzone]')).toHaveCount(0);
  await expect(page.locator('[data-parte=chip]')).toHaveCount(0);
  await expect(page.locator('[data-parte=input-campo] textarea')).toHaveAttribute('placeholder', 'scrivi');
});

test('la PROFILEBAR: il luogo conosciuto al posto dell\'indirizzo, e la geometria della bolla', async ({ page }) => {
  await expect(page.locator('.profile-place')).toHaveText('Casa');
  const s = await stile(page, '[data-parte=profilebar]');
  expect(s.raggio).toBe('30px');
  expect(s.padding).toBe('8px 12px 8px 24px');
  expect(Math.round((await cornice(page, '[data-parte=profilebar]')).height)).toBe(60);
});

test('la SYSTEMBAR: microfono per primo, spento dice SCRIVI in ambra', async ({ page }) => {
  const voci = page.locator('[data-parte=systembar] > *');
  await expect(voci.first()).toHaveText(/scrivi/i);
  expect((await stile(page, '[data-parte=systembar] > *')).colore).toBe('rgb(237, 163, 28)');
  await expect(voci.nth(2)).toHaveText(/WIFI-LUCIA/i);
  await expect(voci.nth(3)).toHaveText('55%');
});

test('il tema è quello del profilo, e il materiale chiaro se il profilo non ne sceglie un altro', async ({ page }) => {
  expect(await page.evaluate(() => document.documentElement.dataset.colori)).toBe('cenere');
  expect(await page.evaluate(() => document.documentElement.dataset.tema)).toBe('chiaro');
});
