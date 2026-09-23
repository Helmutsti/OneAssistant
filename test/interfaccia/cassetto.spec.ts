// La NOTIFICATIONBAR: il badge, il cassetto che si apre e si richiude, «me ne occupo»
// (`docs/L02` §NOTIFICATIONBAR, `L2 - Notificationbar`).

import { expect, test } from '@playwright/test';
import { cornice, di, mossa, prepara, stile } from './copione.ts';

test('il cassetto sale sopra la campanella, 400 di larghezza, e aprirlo azzera il badge', async ({ page }) => {
  await prepara(page, { conversazione: [] });
  await expect(page.locator('[data-parte=badge]')).toHaveText('1');
  await page.getByRole('button', { name: 'apri le notifiche' }).click();
  const banner = page.locator('[data-parte=banner]');
  await expect(banner).toHaveCount(1);
  await expect(banner).toContainText('Andrea Riva', { ignoreCase: true });
  await expect(banner).toContainText('Proposta Acme');
  const r = await cornice(page, '[data-parte=banner]');
  expect(Math.round(r.width)).toBe(400);
  expect(r.destra).toBe(44);
  const s = await stile(page, '[data-parte=banner]');
  expect(s.raggio).toBe('20px');
  expect(s.padding).toBe('13px 16px');
  await expect(page.locator('[data-parte=badge]')).toHaveCount(0);
});

test('si richiude coi ritardi invertiti: il cassetto resta il tempo di far rientrare le righe', async ({ page }) => {
  await prepara(page, { conversazione: [] });
  await page.getByRole('button', { name: 'apri le notifiche' }).click();
  await expect(page.locator('[data-parte=banner]')).toHaveCount(1);
  await page.getByRole('button', { name: 'chiudi le notifiche' }).click();
  await expect(page.locator('[data-parte=banner]')).toHaveCount(1);
  await expect(page.locator('[data-parte=banner]')).toHaveCount(0, { timeout: 2000 });
});

test('«me ne occupo»: la notifica diventa una bozza nella dropzone, e il cassetto si richiude da sé', async ({ page }) => {
  await prepara(page, {
    conversazione: [
      [mossa('apri_cassetto'), mossa('rispondi', { testo: 'Una da Andrea.' })],
      [mossa('occupatene', { notifica: 'n1', nome: 'Rispondere ad Andrea', richiesta: 'rispondi sulla proposta' }), mossa('rispondi', { testo: 'La preparo.' })],
    ],
  });
  await di(page, 'cosa è arrivato?');
  await expect(page.locator('[data-parte=banner]')).toHaveCount(1);
  await di(page, 'me ne occupo');
  await expect(page.locator('[data-parte=dropzone]')).toContainText('Rispondere ad Andrea');
  await expect(page.locator('[data-parte=banner]')).toHaveCount(0, { timeout: 2000 });
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(0);
});

test('quella che il filtro non promuove entra muta: c\'è, ma non conta nel badge', async ({ page }) => {
  await prepara(page, {
    conversazione: [],
    archivio: { 'services/email.txt': 'storico:' },
  });
  await expect(page.locator('[data-parte=badge]')).toHaveCount(0);
});
