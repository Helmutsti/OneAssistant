// La mail a Elena, da `docs/design/L3 - Flusso task`: bozza, conferma, domanda, pronta,
// invio trattenuto dalla Funzione Delay, «no, aspetta». L'orologio della pagina è finto, così
// i novanta secondi si fanno passare invece di aspettarli.

import { expect, test } from '@playwright/test';
import { di, mossa, prepara, stile } from './copione.ts';

const BOZZA = mossa('componi_bozza', {
  tipo: 'email',
  nome: 'Scrivere a Elena',
  richiesta: 'scrivi a Elena che venerdì non ci sono',
  elementi: ['contatto | Elena Sarti', 'appuntamento | venerdì'],
  frasi: ['vai', 'cambia'],
  servizio: 'email',
  a: 'Elena Sarti',
});

async function finoAllaMailPronta(page: import('@playwright/test').Page, extra: import('./copione.ts').Mossa[][] = []) {
  const chat = await prepara(page, {
    conversazione: [
      [BOZZA, mossa('rispondi', { testo: 'Te la scrivo così?' })],
      [mossa('conferma', { bozza: 't2' }), mossa('rispondi', { testo: 'La scrivo.' })],
      [mossa('rispondi_domanda', { risposta: 'no, solo venerdì' }), mossa('rispondi', { testo: 'Solo venerdì.' })],
      ...extra,
    ],
    lavoro: {
      'Scrivere a Elena': [
        [mossa('chiedi', { domanda: 'Le dico anche del lunedì?', risposte: ['sì, anche lunedì', 'no, solo venerdì'] })],
        [mossa('pronto', { corpo: 'Cara Elena, venerdì non sarò in ufficio.', frasi: ['manda la mail', 'leggila'] })],
      ],
    },
  });
  await di(page, 'scrivi a Elena che venerdì non ci sono');
  await expect(page.locator('[data-parte=dropzone]')).toContainText('Scrivere a Elena');
  await di(page, 'vai');
  await expect(page.locator('[data-parte=input]')).toContainText('Le dico anche del lunedì?');
  await di(page, 'no, solo venerdì');
  await expect(page.locator('[data-parte=bolla]')).toContainText('aspetta te', { ignoreCase: true });
  return chat;
}

test('la bozza nasce grigia nella dropzone, con le sue tessere, e INPUT resta libero', async ({ page }) => {
  await prepara(page, { conversazione: [[BOZZA, mossa('rispondi', { testo: 'Te la scrivo così?' })]] });
  await di(page, 'scrivi a Elena che venerdì non ci sono');
  const dropzone = page.locator('[data-parte=dropzone]');
  await expect(dropzone).toContainText('Bozza');
  await expect(page.locator('[data-parte=tessera]')).toHaveCount(2);
  expect((await stile(page, '[data-parte=dropzone] svg')).colore).toBe('rgb(148, 150, 142)');
  await expect(page.locator('[data-parte=input]')).toContainText('«vai»');
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(0);
});

test('conferma, domanda in ambra, poi la mail pronta diventa la active con le sue frasi', async ({ page }) => {
  const chat = await finoAllaMailPronta(page);
  await expect(page.locator('[data-parte=bolla-targa] .pallino')).toHaveCount(1);
  await expect(page.locator('[data-parte=input-frasi]')).toContainText('«manda la mail»');
  await expect(page.locator('[data-parte=input-frasi]')).toContainText('«mettila da parte»');
  expect(chat[0]).toBe('user: scrivi a Elena che venerdì non ci sono');
  expect(chat).toContain('assistant: Te la scrivo così?');
});

test('la domanda: in ambra dentro INPUT, anello fuori, risposte senza pallino', async ({ page }) => {
  await prepara(page, {
    conversazione: [[BOZZA, mossa('conferma', { bozza: 't2' }), mossa('rispondi', { testo: 'La scrivo.' })]],
    lavoro: { 'Scrivere a Elena': [[mossa('chiedi', { domanda: 'Le dico anche del lunedì?', risposte: ['sì, anche lunedì', 'no, solo venerdì'] })]] },
  });
  await di(page, 'scrivi a Elena');
  const input = page.locator('[data-parte=input]');
  await expect(input).toContainText('ti sto chiedendo', { ignoreCase: true });
  await expect(page.locator('[data-parte=input-frasi] .pallino')).toHaveCount(0);
  expect((await stile(page, '[data-parte=input]')).raggio).toBe('26px');
  await expect(page.locator('[data-parte=bolla]')).toContainText('ti sto chiedendo', { ignoreCase: true });
});

test('la Funzione Delay: la mail resta in SIDEBAR, azzurra, per novanta secondi, e poi sparisce', async ({ page }) => {
  await page.clock.install();
  await finoAllaMailPronta(page, [[mossa('invia', { task: 't2' }), mossa('rispondi', { testo: 'Pronta. La mando fra 90 secondi.' })]]);
  await di(page, 'manda la mail');
  const chip = page.locator('[data-parte=chip]');
  await expect(chip).toContainText('Scrivere a Elena');
  await expect(chip).toContainText('fatto');
  await expect(page.locator('[data-parte=input-frasi]')).toContainText('«manda subito»');
  await expect(page.locator('[data-parte=input-frasi]')).toContainText('«no, aspetta»');
  await page.clock.fastForward(60_000);
  await expect(chip).toHaveCount(1);
  await page.clock.fastForward(31_000);
  await expect(chip).toHaveCount(0);
});

test('«no, aspetta» dentro la finestra: la mail torna sulla scrivania, ambra, e non parte', async ({ page }) => {
  await page.clock.install();
  await finoAllaMailPronta(page, [
    [mossa('invia', { task: 't2' }), mossa('rispondi', { testo: 'Pronta. La mando fra 90 secondi.' })],
    [mossa('annulla_invio', { task: 't2' }), mossa('rispondi', { testo: 'Fermata: non è uscita.' })],
  ]);
  await di(page, 'manda la mail');
  await expect(page.locator('[data-parte=chip]')).toHaveCount(1);
  await page.clock.fastForward(30_000);
  await di(page, 'no, aspetta');
  // La bolla sulla scrivania, non la sua ombra che finisce il volo.
  const bolla = page.locator('[data-posto=t2] [data-parte=bolla]');
  await expect(bolla).toContainText('Scrivere a Elena');
  await expect(page.locator('[data-parte=chip]')).toHaveCount(0);
  await page.clock.fastForward(120_000);
  await expect(bolla).toContainText('aspetta te', { ignoreCase: true });
});

test('senza chiave non si finge: il guasto si dice in INPUT', async ({ page }) => {
  await prepara(page, { conversazione: [] }, { senzaChiave: true });
  await di(page, 'ciao');
  await expect(page.locator('[data-parte=input]')).toContainText('Manca la chiave di OpenRouter');
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(0);
});
