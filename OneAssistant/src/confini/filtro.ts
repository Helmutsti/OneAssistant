// docs/06-confini §3. Decide se una proposta diventa una CARTA, un ORARIO, o niente.
// «Niente» è un esito legittimo e frequente.
//
// Prima approssimazione dichiarata come tale nel documento: la forma è queste tre
// domande in quest'ordine; i pesi vanno visti su dati finti prima di essere scritti
// sul serio.

import type { Proposta } from './servizio.ts';
import { dentroLOrario, type Contesto } from '../conoscenza/contesto.ts';

export type Esito = 'CARTA' | 'ORARIO' | 'niente';

export interface Giudizio {
  readonly esito: Esito;
  /** Perché. Non si mostra all'utente: serve a noi per capire se il filtro sbaglia. */
  readonly perche: string;
}

/** Sopra questo numero la pila accumula, e una pila che accumula è un filtro che sbaglia. */
export const TETTO_CARTE = 5;

export function filtra(
  p: Proposta,
  c: Contesto,
  adesso: Date,
  carteAperte: number,
): Giudizio {
  // 1 — è per te?
  if (!p.perTe) {
    return { esito: 'niente', perche: 'non ti riguarda' };
  }

  // 2 — puoi farci qualcosa?
  if (!p.azionabile) {
    return { esito: 'niente', perche: 'non c’è una frase da offrirti: è una cosa da sapere' };
  }

  // 3 — è adesso?
  if (p.ora && p.ora.getTime() - adesso.getTime() > 60 * 60_000) {
    return { esito: 'ORARIO', perche: 'ha un’ora, ed è lontana' };
  }

  if (!dentroLOrario(c, adesso)) {
    return p.ora
      ? { esito: 'ORARIO', perche: 'fuori orario: aspetta il mattino' }
      : { esito: 'niente', perche: 'fuori orario, e non ha un’ora' };
  }

  if (carteAperte >= TETTO_CARTE) {
    return p.ora
      ? { esito: 'ORARIO', perche: 'la pila è piena: si alza l’asticella' }
      : { esito: 'niente', perche: 'la pila è piena: si alza l’asticella' };
  }

  return { esito: 'CARTA', perche: 'per te, azionabile, adesso' };
}
