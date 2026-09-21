// docs/07-memoria §2 e §2. Quello che è vero di te e cambia lentamente.
// Non si mostra mai per sé: alimenta il filtro e le frasi, e basta.

/**
 * Chi sta parlando adesso, nei tre casi che il sistema deve distinguere
 * (docs/07-memoria §2). L'input è riservato a chi ha la sessione.
 */
export type Ascoltatore =
  /** Il titolare della sessione: comanda. */
  | { readonly chi: 'tu' }
  /** Una persona che il sistema conosce: può solo lasciare un messaggio. */
  | { readonly chi: 'conosciuto'; readonly nome: string }
  /** Una voce che non riconosce: non risponde. */
  | { readonly chi: 'sconosciuto' };

export interface Contesto {
  utilizzatore: string;
  ascoltatore: Ascoltatore;
  dove: string;
  readonly mestiere: string;
  /** Le ore in cui lavori. Fuori da qui il sistema non propone lavoro da sé. */
  readonly oreDiLavoro: { readonly da: number; readonly a: number };
  readonly progetti: readonly string[];
}

export const contesto: Contesto = {
  utilizzatore: 'Manuel Cucca',
  ascoltatore: { chi: 'tu' },
  dove: 'casa · Genova',
  mestiere: 'sviluppatore',
  oreDiLavoro: { da: 8, a: 19 },
  progetti: ['Acme', 'Aurora'],
};

export function soloTu(c: Contesto): boolean {
  return c.ascoltatore.chi === 'tu';
}

/** Come si chiama chi sta parlando, per la targa e per la fonte di un messaggio. */
export function nomeDiChiParla(c: Contesto): string {
  return c.ascoltatore.chi === 'tu'
    ? c.utilizzatore
    : c.ascoltatore.chi === 'conosciuto'
      ? c.ascoltatore.nome
      : 'una voce che non conosco';
}

export function dentroLOrario(c: Contesto, quando: Date): boolean {
  const ora = quando.getHours();
  return ora >= c.oreDiLavoro.da && ora < c.oreDiLavoro.a;
}
