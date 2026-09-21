// La raccolta di INPUT: cosa si è agganciato allo scambio, mentre parli.
//
// Questo file è quello che resta di `locale/intesa.ts`, ed è meno della metà. Il 17
// settembre 2026 il cervello piccolo è stato abolito: non c'è più un locale che intende
// e decide, e il metalinguaggio fra i due non serve a nessuno, perché i due sono uno.
//
// Quello che è rimasto è **disegno, non intelligenza**: `docs/05-interfaccia §1` dice che in
// INPUT ci stanno tre cose, e una è «la raccolta di file e concetti agganciati allo
// scambio». Per sapere che hai nominato Acme non serve un modello: serve lo stato, e lo
// stato è qui. È una ricerca in un elenco, e si vede mentre scrivi.
//
// Due cose che **non** fa più, e sono le due che contavano:
//
//   - **non muove niente.** Prima il nome che riconosceva spostava il fuoco in
//     millisecondi. Adesso no: finché l'AI engine non risponde, lo schermo sta fermo e
//     INPUT pulsa (17 settembre 2026). Quello che si vede qui è solo *che* l'hai
//     nominata, non una decisione presa;
//   - **non decide se serve l'AI engine.** Serve sempre.

import type { Motore } from '../modello/motore.ts';

/** Cosa si è riconosciuto dentro la frase, e come. */
export interface Riferimento {
  /** Le parole con cui l'hai nominata. */
  readonly detto: string;
  /** Chi è, risolto: l'id di un task, o `entità:nome` per una cosa dell'archivio. */
  readonly e: string;
  readonly come: 'nome' | 'ordinale' | 'pronome' | 'fuoco';
  /**
   * Solo per le entità: se ha un recapito o esiste solo nella memoria
   * (docs/07-memoria §4). È la differenza fra «mando a Paolo» e «Paolo non è nei
   * contatti», e si vede anche prima che la frase sia finita.
   */
  readonly ancorata?: boolean;
}

/** I task che la frase nomina. Una ricerca, non una lettura: il fuoco non si muove. */
export function nominati(frase: string, m: Motore) {
  const f = frase.toLowerCase();
  return m.task.filter((t) => f.includes(t.nome.toLowerCase()));
}

/**
 * Quello che la frase ha agganciato: i task a schermo, le cose che l'archivio conosce,
 * e i contatti della rubrica. Non cambia niente — descrive soltanto.
 */
export function raccolta(frase: string, m: Motore): Riferimento[] {
  const f = frase.toLowerCase();
  const riferimenti: Riferimento[] = [];

  for (const t of nominati(frase, m)) {
    riferimenti.push({ detto: t.nome.toLowerCase(), e: t.id, come: 'nome' });
  }

  // Chi è nominato nell'archivio: «Paolo» è una persona nota, e si sa se gli si può
  // scrivere o se esiste solo nella memoria (docs/07-memoria §4).
  for (const nome of m.archivio.nomi()) {
    if (nome === 'Appunti' || !f.includes(nome.toLowerCase())) continue;
    const e = m.archivio.cosaSa(nome);
    riferimenti.push({
      detto: nome.toLowerCase(),
      e: `${e?.genere ?? 'Ricordi'}:${nome}`,
      come: 'nome',
      ancorata: e?.ancoraggio === 'ancorata',
    });
  }

  // La rubrica: è la differenza fra una frase che parla di una persona e una che ha un
  // destinatario. In «scrivi a mia madre» il contatto si vede prima del verbo.
  for (const { chi, detto } of m.rubrica()?.nominati(frase) ?? []) {
    riferimenti.push({
      detto,
      e: `contatto:${chi.completo}`,
      come: 'nome',
      ancorata: chi.recapito !== undefined,
    });
  }

  return riferimenti;
}
