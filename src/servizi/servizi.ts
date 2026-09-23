// I servizi, gli arti del sistema (`docs/L01`). Nel prototipo non sono integrazioni reali:
// i loro dati sono documenti di contesto in `services/`, e un invio non raggiunge nessuno
// (`docs/L04`). Il confine però esiste già, ed è qui: ogni destinazione dichiara **una sola
// cosa**, se attraversa il confine del computer. Una destinazione nuova la dichiara, o la
// Funzione Delay non la protegge (`docs/L01` §Importante).

import type { Uscita } from '../modello/tipi.ts';

export interface Servizio {
  readonly nome: string;
  readonly attraversaConfine: boolean;
}

export const SERVIZI: readonly Servizio[] = [
  { nome: 'email', attraversaConfine: true },
  { nome: 'contatti', attraversaConfine: false },
  // Il filesystem è l'unico servizio sempre attivo, e non si può non usare (`docs/L03`).
  { nome: 'filesystem', attraversaConfine: false },
];

export function servizio(nome: string): Servizio | undefined {
  return SERVIZI.find((s) => s.nome === nome);
}

/** L'uscita di un task, con il confine preso dal servizio e non da chi la chiede. */
export function uscita(nome: string, a: string): Uscita {
  const s = servizio(nome);
  if (!s) throw new Error(`il servizio ${nome} non esiste`);
  return { servizio: s.nome, a, attraversaConfine: s.attraversaConfine };
}

/** Quello che i servizi simulati hanno ricevuto. Non si salva: nel prototipo l'unica scrittura è la chat raw. */
export const consegnati: Array<{ quando: number; uscita: Uscita; cosa: string }> = [];

/**
 * La chiamata al servizio. Simulata: non raggiunge nessuno, e lo dice in console. È il
 * punto dove domani entrerà l'integrazione vera, e dove la Delay avrà già fatto il suo.
 */
export async function consegna(u: Uscita, cosa: string): Promise<void> {
  if (!servizio(u.servizio)) throw new Error(`il servizio ${u.servizio} non esiste`);
  consegnati.push({ quando: Date.now(), uscita: u, cosa });
  console.info(`[servizi] ${u.servizio} → ${u.a} (simulato, non esce dal computer)`);
}
