// Come si muove una bolla (`docs/design/L2 - Bubble movement`). Quattro movimenti, e nessuno
// senza una causa: la nascita dalla dropzone, la messa da parte verso la SIDEBAR, l'uscita
// sul posto, e il richiamo che risale dove stava. Le misure sono di `L1 - Token`.
//
// Tre regole valgono per tutti: ogni movimento ha una causa; l'acqua non rimbalza — ogni
// spostamento parte veloce e si spegne, niente molle; il posto non è assegnato — una bolla
// sta dove c'è spazio, e si sposta solo quando il movimento la riguarda.

import { useSyncExternalStore } from 'react';

/** La curva di tutto il sistema: parte veloce e si spegne. */
export const CURVA = 'cubic-bezier(.22,1,.36,1)';
export const NASCITA_MS = 420;
export const CONTRAZIONE_MS = 280;
export const MIGRAZIONE_MS = 420;
export const USCITA_MS = 320;
export const SFALSAMENTO_MS = 40;
/** L'onda: lo spostamento delle tre vicine più vicine, la più vicina di più. */
export const ONDA = [12, 8, 6] as const;
/** Le vicine restano dove l'onda le ha lasciate, con un rientro parziale. */
export const RIENTRO = 0.4;

export function fermo(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface Rettangolo {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rettangolo(el: Element | null | undefined): Rettangolo | undefined {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

/**
 * Da un rettangolo a un altro lungo un arco, non in linea retta. Il punto di mezzo sale
 * sopra la retta: si vede che la cosa che arriva è quella che era là.
 */
export function arco(da: Rettangolo, a: Rettangolo, alzata = 60): Keyframe[] {
  const dx = da.x - a.x;
  const dy = da.y - a.y;
  const sx = da.w / Math.max(1, a.w);
  const sy = da.h / Math.max(1, a.h);
  return [
    { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, transformOrigin: 'top left' },
    {
      transform: `translate(${dx / 2}px, ${dy / 2 - alzata}px) scale(${(sx + 1) / 2}, ${(sy + 1) / 2})`,
      transformOrigin: 'top left',
      offset: 0.5,
    },
    { transform: 'none', transformOrigin: 'top left' },
  ];
}

// ─── quali chip sono ancora in volo ─────────────────────────────────
//
// Un chip che arriva dalla scrivania non compare finché la bolla che lo diventa non è
// arrivata: sarebbe la stessa cosa in due posti per un attimo.

const inVolo = new Set<string>();
const chi = new Set<() => void>();
let versione = 0;

function avvisa(): void {
  versione++;
  for (const fn of chi) fn();
}

export function parte(id: string): void {
  inVolo.add(id);
  avvisa();
}

export function arriva(id: string): void {
  if (inVolo.delete(id)) avvisa();
}

export function useInVolo(): ReadonlySet<string> {
  useSyncExternalStore(
    (fn) => {
      chi.add(fn);
      return () => chi.delete(fn);
    },
    () => versione,
  );
  return inVolo;
}
