// I due mestieri di scrittura, finti.
//
// Leggere una cosa lunga e dirla corta, e trasformare una richiesta in **discorso
// diretto**. Sono le due cose che un modello fa e una regola non può fare davvero:
// quello che c'è qui non è ciò che farà l'AI engine, è la *forma* di ciò che farà — e
// basta a vedere le catene di `docs/09-catene` girare.
//
// Stanno in un file loro e non nell'AI engine finto perché il motore le usa: `riassumi` e
// `riscrivi` sono mosse del modello, e finché l'AI engine vero non scrive lui il testo
// qualcuno deve pur metterci delle parole.

/** Convenevoli: aperture e chiusure che in un riassunto non dicono niente. */
const CONVENEVOLI =
  /^(ciao|buongiorno|buonasera|salve|cara|caro|gentile|fatti sentire|ci sentiamo|a presto|un abbraccio|grazie e|la chiamo io|ti abbraccio)/i;

/**
 * Il riassunto: si buttano i convenevoli e si tengono le due frasi che restano in cima.
 * Non è ciò che farà il modello — è la forma di ciò che farà, e basta a vederla girare.
 */
export function riassumi(corpo: string): string {
  const frasi = corpo
    .split(/(?<=[.?!])\s+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 0 && !CONVENEVOLI.test(f));
  const tutto = frasi.join(' ') || corpo.trim();
  if (tutto.length <= 140) return tutto;
  // Un riassunto che non accorcia non è un riassunto: si taglia allo stacco di frase
  // più vicino, così la riga resta dicibile invece di finire a metà parola.
  const taglio = tutto.slice(0, 170);
  const stacco = Math.max(taglio.lastIndexOf(', '), taglio.lastIndexOf(': '), taglio.lastIndexOf('; '));
  return `${stacco > 80 ? taglio.slice(0, stacco) : taglio.trimEnd()}…`;
}

/** Le emoji che si sanno dire a voce. Chiuso di proposito: si nominano, non si scelgono. */
const EMOJI: Record<string, string> = {
  cuore: '❤️',
  cuoricino: '❤️',
  sorriso: '🙂',
  bacio: '😘',
  pollice: '👍',
  festa: '🎉',
};

/** Le formule che si aggiungono a parole, e non sono emoji. */
const FORMULE: Record<string, string> = {
  abbraccio: 'Un abbraccio!',
  bacio: 'Un bacio!',
  saluti: 'Un saluto!',
};

/**
 * Da richiesta a messaggio. Due cose sole, e sono le due che si vedono:
 * il **discorso diretto** — «chiedile a che ora ci vediamo» diventa «a che ora ci
 * vediamo» — e l'apertura col nome con cui lo chiami tu.
 *
 * L'AI engine vero non passa da qui: scrive il testo e lo consegna già scritto a `componi`
 * (src/ai-engine/api.ts). Questo serve al finto, e a `riscrivi`.
 */
export function componi(richiesta: string, chi: string, giro = 0): string {
  let r = richiesta
    .trim()
    .replace(/^(?:e\s+)?(?:chiedil[ea]|chiedigli|chiedi|dill[ea]|digli|dici|di')\s+/i, '')
    .replace(/[.!?]+$/, '')
    .trim();

  // «per venerdì a cena» è come si racconta; «venerdì per cena» è come si dice.
  r = r.replace(
    /\bper (lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica|domani|stasera) a (pranzo|cena|colazione|caffè)\b/i,
    '$1 per $2',
  );

  const domanda = /^(a che ora|quando|come|dove|chi|cosa|quanto|perché|se |ti va|va bene)/i.test(r);
  const corpo = r.charAt(0).toLowerCase() + r.slice(1);
  // Riscrivere non vuol dire dire un'altra cosa: vuol dire aprire in un altro modo.
  const aperture = [`Ciao ${chi.toLowerCase()}, `, `Ehi ${chi.toLowerCase()}, `, `${chi}, senti: `];
  const apertura = aperture[giro % aperture.length]!;
  return `${apertura}${corpo}${domanda ? '?' : '.'}`;
}

/**
 * Aggiungere qualcosa a un messaggio già composto. Le emoji si attaccano alla fine
 * della riga, le formule vanno a capo: sono due cose diverse e si vede.
 */
export function aggiungiAl(testo: string, cosa: string): string {
  const c = cosa.toLowerCase();
  for (const [parola, segno] of Object.entries(EMOJI)) {
    if (c.includes(parola)) return `${testo} ${segno}`;
  }
  for (const [parola, formula] of Object.entries(FORMULE)) {
    if (c.includes(parola)) return `${testo} ${formula}`;
  }
  // Quello che non è né emoji né formula si aggiunge come l'hai detto.
  const pulito = cosa.replace(/^(?:un[ao]?|il|lo|la|del|della)\s+/i, '').trim();
  return pulito ? `${testo} ${pulito.charAt(0).toUpperCase()}${pulito.slice(1)}.` : testo;
}
