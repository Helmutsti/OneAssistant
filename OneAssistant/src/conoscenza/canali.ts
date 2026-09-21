// I due canali, adesso: l'orecchio e la bocca.
//
// `docs/05-interfaccia §1` dice che i canali sono due — in ingresso voce e scrittura di pari
// grado, in uscita testo e voce in parallelo — e che **la voce si può spegnere senza
// perdere niente**. Questo file è dove quei due interruttori vivono a runtime.
//
// Il profilo dice come sono all'accensione (`macchina.microfono`, `assistente.lettura`,
// da `Archivio/<id>/settings.txt`); qui si dice come sono **adesso**. In mezzo c'è il
// fatto nuovo del 17 settembre 2026: **si premono**, e si dicono.
//
// Sta in un file suo e non dentro il profilo per una ragione precisa: il profilo è
// quello che c'è scritto nel file, e se lo mutassimo il file e la memoria direbbero due
// cose diverse senza che si veda. Qui invece si legge in una riga chi dei due parla.
//
// ─── le due modalità d'ingresso ──────────────────────────────────────────────
//
// Non sono due prodotti: sono **la stessa cosa con un'altra porta**. Voce e scrittura
// sono di pari grado, quindi spegnere il microfono non toglie niente — toglie un canale
// su due, e quello che resta fa tutto.
//
//   - **voce** — il microfono sente. Il punto d'ascolto pulsa, e dice una cosa sola:
//     ti sto sentendo;
//   - **tastiera** — il microfono è spento. Il punto **non c'è** (design/L2 - INPUT ·
//     «Senza voce»), e il campo prende il fuoco da sé: scrivere è l'ingresso, non il
//     ripiego di niente.
//
// ─── perché l'orecchio è asimmetrico e la bocca no ───────────────────────────
//
// È la parte che vale la pena leggere, perché sembra un'incoerenza e non lo è.
//
// **Il microfono si spegne a parole, e si riaccende solo premendo.** Non è una scelta di
// stile, è un fatto fisico più un confine:
//
//   - **non si può dire.** Col microfono spento non c'è niente che ti senta. Una frase
//     per riaccenderlo sarebbe una frase che il sistema non può ricevere;
//   - **non è una mossa dell'AI engine.** Un assistente che ti apre il microfono da sé è un
//     altro prodotto. Non c'è uno strumento per farlo — non «c'è e non lo usa»: non c'è
//     (src/ai-engine/strumenti.ts).
//
// **La bocca invece va in tutti e due i versi**, e per la ragione opposta: spegnere la
// voce non spegne l'orecchio, quindi una frase per riaccenderla arriva sempre — e
// riaccendere la voce non apre niente su di te. Nessuna asimmetria da dichiarare: si
// dice, si preme, in entrambi i sensi.
//
// Riaccendere il microfono resta quindi **l'unico atto del sistema che esiste soltanto
// come gesto**. È un'eccezione dichiarata alla legge 01 (nessun bottone), nella stessa
// famiglia della campanella — un indicatore che si può anche premere — con una
// differenza: la campanella ha *anche* una frase, e questo no, perché non può averla.

import { profilo } from './profilo.ts';

/** Da dove entra quello che dici. Due, e la seconda non è un ripiego. */
export type Modo = 'voce' | 'tastiera';

/** `undefined` finché nessuno l'ha toccato: comanda il profilo. */
let orecchio: boolean | undefined;
let bocca: boolean | undefined;

// ─── l'orecchio ─────────────────────────────────────────────────────────────

/** Se il microfono sente, adesso. */
export function sente(): boolean {
  return orecchio ?? profilo().macchina.microfono;
}

export function modo(): Modo {
  return sente() ? 'voce' : 'tastiera';
}

/**
 * Spegnere il microfono. Si dice o si preme, indifferentemente: è una mossa come le
 * altre (`non_ascoltare`), e l'AI engine ce l'ha in mano.
 */
export function nonAscoltare(): void {
  orecchio = false;
}

/**
 * Riaccenderlo. **Solo da un gesto**: non c'è una frase che ci arrivi e non c'è uno
 * strumento dell'AI engine che la chiami. Il perché sta in cima a questo file.
 */
export function ascolta(): void {
  orecchio = true;
}

// ─── la bocca ───────────────────────────────────────────────────────────────

/** Se legge ad alta voce, adesso. Lo stesso testo dello schermo, mai un altro. */
export function legge(): boolean {
  return bocca ?? profilo().assistente.lettura;
}

/**
 * Accendere e spegnere la voce. **Va in tutti e due i versi**, a parole e premendo:
 * spegnerla non porta via niente, perché il testo a schermo è la verità e la voce ne è
 * solo la lettura (docs/05-interfaccia §1).
 */
export function leggiAVoce(accesa: boolean): void {
  bocca = accesa;
}

// ─── il banco ───────────────────────────────────────────────────────────────

/** Tornare a quello che dice il profilo. Un mondo pulito è pulito anche qui. */
export function comeIlProfilo(): void {
  orecchio = undefined;
  bocca = undefined;
}
