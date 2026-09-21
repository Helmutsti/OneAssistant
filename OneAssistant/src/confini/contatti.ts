// Servizio finto: i contatti. È il terzo dei sette (docs/06-confini §2), ed era il più
// urgente: senza, «manda un messaggio a mia madre» non ha un destinatario e la
// composizione non può cominciare.
//
// Non osserva — nessuno ti scrive per dirti che una rubrica è cambiata — e fa due cose:
// dice **chi è** quello che hai nominato, e accetta un contatto nuovo.
//
// Il modo in cui lo dici non è il suo nome: «mia madre», «la mamma» e «mamma» sono la
// stessa persona, e il sistema deve saperlo prima di aprire bocca.

import type { Uscita } from '../modello/tipi.ts';
import { ConsegnaFallita, type Proposta, type Servizio } from './servizio.ts';

export interface Contatto {
  /** Come lo diresti tu, ed è anche come lo dirà lui. Due parole al massimo. */
  readonly nome: string;
  /** Il nome per intero. Non si dice quasi mai: serve alla targa di una consegna. */
  readonly completo: string;
  /** Tutti i modi in cui lo nomini. Il primo non è più vero degli altri. */
  readonly modi: readonly string[];
  /** Dove arriva quello che esce. Senza questo è **noto ma senza recapito**
   *  (docs/07-memoria §4): si sa chi è, non gli si può scrivere. */
  readonly recapito?: string;
}

export class Contatti implements Servizio {
  readonly nome = 'contatti';

  guasto = false;
  private readonly aggiunti: Contatto[] = [];

  osserva(_annuncia: (p: Proposta) => void): void {}

  // Alla rubrica non serve un testo: quello che aggiunge è un nome, non un contenuto.
  async consegna(u: Uscita, _cosa: string): Promise<void> {
    if (this.guasto) throw new ConsegnaFallita('la rubrica non risponde');
    this.aggiunti.push({ nome: u.a, completo: u.a, modi: [u.a.toLowerCase()] });
  }

  leggi(): readonly string[] {
    return this.tutti().map((c) => c.completo);
  }

  /**
   * Chi hai nominato. Si guarda il modo più lungo per primo, o «mamma» vincerebbe
   * dentro «mia mamma» e il pezzo di frase che resta sarebbe sbagliato.
   */
  cerca(detto: string): Contatto | undefined {
    return [...this.nominati(detto)].sort((a, b) => b.detto.length - a.detto.length)[0]?.chi;
  }

  /**
   * **Tutti** quelli che una frase nomina, e con quali parole. Serve alla raccolta di
   * INPUT (docs/05-interfaccia §1): lì si mostra come l'hai detto tu — «mia madre» — non
   * come si chiama lui, perché la raccolta è il riflesso di quello che hai appena detto.
   */
  nominati(frase: string): ReadonlyArray<{ readonly chi: Contatto; readonly detto: string }> {
    const d = frase.toLowerCase().trim();
    const fuori: Array<{ chi: Contatto; detto: string }> = [];
    for (const chi of this.tutti()) {
      // Per ogni contatto vince il suo modo più lungo: uno solo, o «andrea» e «andrea
      // riva» sarebbero due cose agganciate per la stessa persona.
      const detto = [...chi.modi]
        .sort((a, b) => b.length - a.length)
        .find((m) => d === m || d.includes(m));
      if (detto) fuori.push({ chi, detto });
    }
    return fuori;
  }

  private tutti(): readonly Contatto[] {
    return [...RUBRICA, ...this.aggiunti];
  }
}

/** La rubrica di chi è di casa. È finta oltre il confine: da dentro è indistinguibile. */
const RUBRICA: readonly Contatto[] = [
  {
    nome: 'Mamma',
    completo: 'Carla Moretti',
    modi: ['mia madre', 'la mamma', 'mamma', 'madre'],
    recapito: 'carla.moretti@posta.it',
  },
  {
    nome: 'Andrea',
    completo: 'Andrea Riva',
    modi: ['andrea riva', 'andrea'],
    recapito: 'andrea.riva@acme.it',
  },
  {
    nome: 'Giulia',
    completo: 'Giulia Fabbri',
    modi: ['giulia fabbri', 'giulia'],
    recapito: 'giulia.fabbri@posta.it',
  },
  {
    nome: 'Capo',
    completo: 'Renzo Baldi',
    modi: ['il capo', 'capo', 'renzo baldi', 'renzo'],
    recapito: 'r.baldi@studiobaldi.it',
  },
  {
    // Noto, e senza recapito: esiste nella memoria e non gli si può scrivere.
    nome: 'Paolo',
    completo: 'Paolo Neri',
    modi: ['paolo neri', 'paolo'],
  },
];
