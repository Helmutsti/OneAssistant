// Le due righe che servono a chiunque scriva HTML a mano.
//
// Stavano dentro `schermo.ts`, dove sono nate. Sono uscite il 17 settembre 2026, quando
// la Timeline è diventata un file suo e si è trovata a dover scegliere fra importare da
// `schermo.ts` — che importa lei, e quindi un cerchio — e ricopiarsi tre righe.
//
// Nessuna delle due: un'escape ricopiata è un'escape che un giorno diverge, e quel
// giorno il buco non si vede perché il testo *sembra* giusto.

/** Il nome di un task arriva dal mondo. Quello che va in un attributo passa da qui. */
export function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
