// La Timeline, provata senza browser.
//
// Il componente disegna il tempo, e il tempo è la cosa più facile da sbagliare in
// silenzio: un filo i cui tratti non sommano 242 *sembra* giusto — è un filo, ha dei
// colori — e invece sta mentendo su dove sei nella giornata. Qui si somma.
//
// Gira dentro `npm run scenario`, e non ha bisogno di un DOM: la Timeline è una
// funzione pura dello stato, quindi si può guardare come stringa.

import { timeline } from '../aree/timeline.ts';
import type { Motore } from '../modello/motore.ts';
import { MINUTO, type Orologio } from '../modello/tempo.ts';

/** Quanto è larga la giornata a schermo, come in `src/aree/timeline.ts`. */
const FILO = 242;

function larghezze(html: string): number[] {
  return [...html.matchAll(/class="tratto [^"]*" style="width:([\d.]+)px"/g)].map((m) => Number(m[1]));
}

export function provaLaTimeline(
  m: Motore,
  o: Orologio,
  verifica: (cosa: string, atteso: unknown, ottenuto: unknown, dettaglio?: unknown) => void,
): void {
  const html = timeline(m, o);

  // ─── il filo somma ────────────────────────────────────────────────────────
  // Se questa cade, il filo dice un'ora che non è quella: i tratti si sono
  // sovrapposti, o uno è uscito dall'orizzonte senza essere tagliato.
  const pezzi = larghezze(html);
  const somma = Math.round(pezzi.reduce((a, b) => a + b, 0));
  verifica('il filo della giornata somma 242', FILO, somma, pezzi);

  // Nessun tratto negativo o di zero: un tratto che non si vede è un tratto che
  // racconta una cosa che non si può leggere.
  verifica(
    'nessun tratto invisibile',
    true,
    pezzi.every((x) => x > 0),
    pezzi,
  );

  // ─── i due momenti ci sono sempre ────────────────────────────────────────
  // «Il posto non resta vuoto e non mente» (design/L2 - Timeline): anche senza niente
  // in corso e senza niente dopo, le due righe ci sono.
  verifica('c’è sempre un adesso', true, /class="momento (adesso|libero)"/.test(html));
  verifica('c’è sempre un dopo', true, /class="momento dopo/.test(html));

  // ─── quello che la Timeline non fa ───────────────────────────────────────
  // Le tre regole del componente, e se una cade è un task in due posti (legge 03).
  verifica('non offre frasi', false, html.includes('class="frase'));
  verifica('non si preme', false, html.includes('premibile') || html.includes('data-'));

  // ─── niente prima ────────────────────────────────────────────────────────
  // Il passato è l'unica informazione che riguarda una cosa che non si può più
  // cambiare, e sta fuori. Se un giorno rientra, questa riga lo dice.
  verifica('niente «prima»', false, /class="momento prima/.test(html));
}

/** Il tempo libero si dice in minuti, non in «niente». */
export function provaIlLibero(
  m: Motore,
  o: Orologio,
  verifica: (cosa: string, atteso: unknown, ottenuto: unknown, dettaglio?: unknown) => void,
): void {
  const html = timeline(m, o);
  if (!html.includes('class="momento libero"')) return;
  const dice = /class="soggetto">([^<]+)</.exec(html)?.[1] ?? '';
  verifica(
    'quando sei libero dice quanto tempo hai',
    true,
    /\d/.test(dice),
    dice,
  );
}

export { MINUTO };
