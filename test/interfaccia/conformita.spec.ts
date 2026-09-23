// Le schede di conformità (`tasks/conformita.md`), come test: se un numero del codice si
// allontana dal suo documento, qui si rompe. Ogni riga cita la tavola da cui viene.

import { expect, test, type Page } from '@playwright/test';
import { cornice, di, mossa, prepara, stile } from './copione.ts';

/** Una scena con quasi tutto: una bolla active e ambra, una che lavora, i chip, la dropzone. */
async function scena(page: Page) {
  await prepara(page, {
    conversazione: [
      [
        mossa('componi_bozza', { tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'scrivi a Elena', servizio: 'email', a: 'Elena Sarti' }),
        mossa('conferma', { bozza: 't2' }),
        mossa('componi_bozza', { tipo: 'cartella', nome: 'Riordino Acme', richiesta: 'riordina' }),
        mossa('conferma', { bozza: 't3' }),
        mossa('componi_bozza', { tipo: 'documento', nome: 'Leggere il verbale', richiesta: 'leggi' }),
        mossa('componi_bozza', {
          tipo: 'email', nome: 'Mandare la v3 a Paolo', richiesta: 'manda a Paolo la v3',
          elementi: ['contatto | Paolo Neri | paolo@acme.it', 'task | Riordino Acme', 'persone | Paolo | | memoria'],
          frasi: ['vai', 'cambia'],
        }),
        mossa('rispondi', { testo: 'Ecco.' }),
      ],
    ],
    lavoro: {
      'Scrivere a Elena': [[mossa('pronto', { corpo: 'Cara Elena, venerdì non sarò in ufficio.', frasi: ['manda la mail'] })]],
      'Riordino Acme': [[mossa('avanza', { corpo: '128 su 412 · niente cancellato', dato: '128/412' })]],
    },
  });
  await di(page, 'prepara la scena');
  await expect(page.locator('[data-parte=bolla]')).toHaveCount(2);
  await expect(page.locator('[data-parte=bolla-targa] .pallino')).toHaveCount(1);
}

test.describe('BUBBLE · L2 - Bubble, L1 - Token', () => {
  test.beforeEach(async ({ page }) => scena(page));

  test('la ricetta: raggio 26, padding 20 / 22, larghezza 348–452', async ({ page }) => {
    const s = await stile(page, '[data-parte=bolla]');
    expect(s.raggio).toBe('26px');
    expect(s.padding).toBe('20px 22px');
    for (const b of await page.locator('[data-parte=bolla]').all()) {
      const w = (await b.boundingBox())!.width;
      expect(w).toBeGreaterThanOrEqual(348);
      expect(w).toBeLessThanOrEqual(452);
    }
  });

  test('la targa: IBM Plex Mono 12 / 500 / +0.16em, nel colore dello stato', async ({ page }) => {
    const s = await stile(page, '[data-parte=bolla-targa] .targa');
    expect(s.font).toBe('IBM Plex Mono');
    expect(s.size).toBe(12);
    expect(s.peso).toBe('500');
    expect(s.spaziatura).toBe('1.92px');
    expect(s.colore).toBe('rgb(237, 163, 28)');
  });

  test('il titolo: Manrope 600 / 21 / −0.035em', async ({ page }) => {
    const s = await stile(page, '[data-parte=bolla-titolo]');
    expect(s.font).toBe('Manrope');
    expect(s.size).toBe(21);
    expect(s.peso).toBe('600');
    expect(s.spaziatura).toBe('-0.735px');
  });

  test('il corpo: Manrope 400 / 15,5, inchiostro al 70%', async ({ page }) => {
    const s = await stile(page, '[data-parte=bolla-corpo]');
    expect(s.size).toBe(15.5);
    expect(s.peso).toBe('400');
    expect(s.opacita).toBeCloseTo(0.7);
  });

  test('il pallino della active: 9, verde, a sinistra dell\'icona', async ({ page }) => {
    const p = await cornice(page, '[data-parte=bolla-targa] .pallino');
    const icona = await cornice(page, '[data-parte=bolla-targa]:has(.pallino) svg');
    expect(Math.round(p.width)).toBe(9);
    expect(p.x).toBeLessThan(icona.x);
    expect((await page.locator('[data-parte=bolla-targa] .pallino').evaluate((e) => getComputedStyle(e).backgroundColor))).toBe('rgb(0, 168, 120)');
  });

  test('le frasi non stanno nella bolla: stanno in INPUT', async ({ page }) => {
    for (const b of await page.locator('[data-parte=bolla]').all()) await expect(b).not.toContainText('«');
  });
});

test.describe('DESK · L0 leggi 09–11', () => {
  test.beforeEach(async ({ page }) => scena(page));

  test('le bolle stanno sopra la pila di INPUT, dropzone compresa, e a sinistra della pila di destra', async ({ page }) => {
    const dropzone = await cornice(page, '[data-parte=dropzone]');
    const guida = await cornice(page, '[data-parte=guida]');
    for (const b of await page.locator('[data-parte=bolla]').all()) {
      const r = (await b.boundingBox())!;
      expect(r.y + r.height).toBeLessThanOrEqual(dropzone.y);
      expect(r.x + r.width).toBeLessThanOrEqual(guida.x);
      expect(r.x).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('SIDEBAR · L2 - Sidebar', () => {
  test.beforeEach(async ({ page }) => scena(page));

  test('il chip: alto 30, raggio 20, padding 0 / 14, gap 9; nome 14, dato mono 10', async ({ page }) => {
    const chip = await cornice(page, '[data-parte=chip]');
    expect(Math.round(chip.height)).toBe(30);
    const s = await stile(page, '[data-parte=chip]');
    expect(s.raggio).toBe('20px');
    expect(s.padding).toBe('0px 14px');
    expect(s.gap).toBe('9px');
    expect((await stile(page, '[data-parte=chip-nome]')).size).toBe(14);
    const d = await stile(page, '[data-parte=chip-dato]');
    expect(d.font).toBe('IBM Plex Mono');
    expect(d.size).toBe(10);
  });

  test('22 sotto la SYSTEMBAR, e al 45% mentre si compone una bozza', async ({ page }) => {
    const sistema = await cornice(page, '[data-parte=systembar]');
    const chip = await cornice(page, '[data-parte=chip]');
    expect(Math.round(chip.y - (sistema.y + sistema.height))).toBe(22);
    const pila = page.locator('[data-parte=chip]').first().locator('..');
    await expect.poll(async () => pila.evaluate((e) => parseFloat(getComputedStyle(e).opacity))).toBeCloseTo(0.45);
  });

  test('la bozza sganciata è velata di grigio', async ({ page }) => {
    const bozza = page.locator('[data-parte=chip]', { hasText: 'Leggere il verbale' });
    await expect(bozza).toContainText('bozza');
    expect(await bozza.evaluate((e) => getComputedStyle(e).backgroundImage)).toContain('rgba(148, 150, 142, 0.22)');
  });
});

test.describe('INPUT · L2 - INPUT', () => {
  test.beforeEach(async ({ page }) => scena(page));

  test('la dropzone: sopra INPUT a 12, raggio 22, padding 12 / 14; titolo 15 / 500', async ({ page }) => {
    const dz = await cornice(page, '[data-parte=dropzone]');
    const input = await cornice(page, '[data-parte=input]');
    expect(Math.round(input.y - (dz.y + dz.height))).toBe(12);
    const s = await stile(page, '[data-parte=dropzone]');
    expect(s.raggio).toBe('22px');
    expect(s.padding).toBe('12px 14px');
  });

  test('le tessere: carta per le cose raccolte, vetro per i task, tratteggio per la memoria', async ({ page }) => {
    await expect(page.locator('[data-parte=tessera][data-materiale=carta]')).toHaveCount(1);
    await expect(page.locator('[data-parte=tessera][data-materiale=vetro]')).toHaveCount(1);
    const memoria = page.locator('[data-parte=tessera][data-materiale=memoria]');
    await expect(memoria).toHaveCount(1);
    await expect(memoria).toContainText('ricordo', { ignoreCase: true });
    expect(await memoria.evaluate((e) => getComputedStyle(e).borderStyle)).toBe('dashed');
    const s = await stile(page, '[data-parte=tessera]');
    expect(s.raggio).toBe('12px');
    expect(s.padding).toBe('7px 11px');
  });

  test('lo scambio: la risposta al posto del campo, raggio 26; il campo torna al primo tasto', async ({ page }) => {
    await expect(page.locator('[data-parte=input-risposta]')).toHaveText('Ecco.');
    expect((await stile(page, '[data-parte=input]')).raggio).toBe('26px');
    await page.keyboard.type('a');
    await expect(page.locator('[data-parte=input-risposta]')).toHaveCount(0);
    expect((await stile(page, '[data-parte=input]')).raggio).toBe('22px');
    expect((await cornice(page, '[data-parte=input-campo]')).height).toBeLessThan(45);
  });
});

test.describe('TIMELINE · la struttura estetica di L2 - TIMELINE', () => {
  test.beforeEach(async ({ page }) => scena(page));

  test('targhe mono 10 / 500 / +0.14em; «adesso» 20 / 600', async ({ page }) => {
    const targa = await stile(page, '[data-parte=timeline] > .targa');
    expect(targa.font).toBe('IBM Plex Mono');
    expect(targa.size).toBe(10);
    expect(targa.peso).toBe('500');
    expect(targa.spaziatura).toBe('1.4px');
    const adesso = await stile(page, '[data-parte=timeline] > :nth-child(2)');
    expect(adesso.size).toBe(20);
    expect(adesso.peso).toBe('600');
  });
});

test.describe('SYSTEMBAR e PROFILEBAR', () => {
  test.beforeEach(async ({ page }) => prepara(page, { conversazione: [] }));

  test('la SYSTEMBAR è IBM Plex Mono 11 / 500, +0.06em, senza contenitore', async ({ page }) => {
    const s = await stile(page, '[data-parte=systembar]');
    expect(s.font).toBe('IBM Plex Mono');
    expect(s.size).toBe(11);
    expect(s.peso).toBe('500');
    expect(s.spaziatura).toBe('0.66px');
    expect(s.sfondo).toBe('none');
  });

  test('l\'ora della PROFILEBAR è Manrope 13 / 500 a cifre tabellari', async ({ page }) => {
    const ora = page.locator('.profile-date time');
    const s = await stile(page, '.profile-date time');
    expect(s.font).toBe('Manrope');
    expect(s.size).toBe(13);
    expect(s.peso).toBe('500');
    expect(await ora.evaluate((e) => getComputedStyle(e).fontVariantNumeric)).toBe('tabular-nums');
  });
});
