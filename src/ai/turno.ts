// I due giri dell'AI.
//
//   - **la conversazione**: l'utente scrive, la frase entra nella chat raw, e l'AI muove lo
//     schermo finché non risponde. Una frase apre un turno; il turno finisce con la risposta;
//   - **il lavoro**: ogni task che entra in `T_LAVORAZIONE` si lavora finché non chiede,
//     è pronto, è fermo o ha finito. Un task alla volta, in ordine.
//
// Lo stato resta nel browser e l'AI lo legge con `guarda`: il server fa un passo alla volta.

import type { Motore } from '../modello/motore.ts';
import { esegui, schedaDiLavoro } from './esecutore.ts';
import { Guasto, type Giro, type Passo, type Pensiero } from './porta.ts';
import { FINE_CONVERSAZIONE, FINE_LAVORO, type Ruolo } from './vocabolario.ts';

/** Oltre una decina di mosse lo schermo smette di essere una conseguenza di quello che hai detto. */
const PASSI = 10;

/** Quanti scambi della sessione l'AI rilegge. La chat raw li tiene tutti; questo è solo il filo del discorso. */
const FILO = 12;

export interface Diario {
  salva(ruolo: 'user' | 'assistant', testo: string): void;
}

export class Turni {
  private readonly filo: Giro[] = [];
  private lavorando = false;

  constructor(
    private readonly m: Motore,
    private readonly ai: Pensiero,
    private readonly diario: Diario,
  ) {
    m.ascolta(() => void this.lavora());
  }

  /** La frase dell'utente. Passa da qui e da nessun'altra parte. */
  async conversa(frase: string): Promise<void> {
    const f = frase.trim();
    if (!f) return;
    this.m.dici(f);
    this.m.segnalaGuasto('ai', undefined);
    this.diario.salva('user', f);
    this.m.pensando(true);
    let risposta: string | undefined;
    try {
      risposta = await this.giro('conversazione', f, undefined);
    } catch (e) {
      this.m.segnalaGuasto('ai', e instanceof Guasto ? e.message : `Qualcosa si è rotto: ${String(e)}`);
    } finally {
      this.m.pensando(false);
    }
    this.filo.push({ tua: f, risposta });
    if (this.filo.length > FILO) this.filo.shift();
    if (risposta) this.diario.salva('assistant', risposta);
  }

  /** Lavora i task in coda, uno alla volta. */
  private async lavora(): Promise<void> {
    if (this.lavorando) return;
    this.lavorando = true;
    try {
      for (let t = this.m.prendiLavoro(); t; t = this.m.prendiLavoro()) {
        const id = t.id;
        try {
          const chiuso = await this.giro('lavoro', schedaDiLavoro(this.m, t), id);
          if (chiuso === undefined) this.fermaSeLavora(id, 'Il lavoro si è interrotto senza un esito.');
        } catch (e) {
          const perche = e instanceof Guasto ? e.message : `Qualcosa si è rotto: ${String(e)}`;
          this.m.segnalaGuasto('ai', perche);
          this.fermaSeLavora(id, perche);
        }
      }
    } finally {
      this.lavorando = false;
    }
  }

  /** Un task non resta azzurro per sempre se il lavoro si è rotto: diventa fermo, e lo dice. */
  private fermaSeLavora(id: string, perche: string): void {
    const t = this.m.fotografia().bolle.find((b) => b.id === id);
    if (t?.genere === 'task' && t.stato === 'T_LAVORAZIONE' && !t.invio) this.m.fermo(id, perche);
  }

  /**
   * Un giro: passi finché una mossa chiude il turno. Torna il testo della risposta, per la
   * conversazione, o il nome della mossa che ha chiuso il lavoro.
   */
  private async giro(ruolo: Ruolo, frase: string, task: string | undefined): Promise<string | undefined> {
    const passato: Passo[] = [];
    const fine = ruolo === 'conversazione' ? FINE_CONVERSAZIONE : FINE_LAVORO;
    for (let i = 0; i < PASSI; i++) {
      const chiamate = await this.ai.passo({ ruolo, frase, passato, prima: ruolo === 'conversazione' ? this.filo : [] });
      if (!chiamate.length) return undefined;
      for (const c of chiamate) {
        const esito = esegui(c, this.m, ruolo, task);
        passato.push({ chiamata: c, visto: esito.visto, sbagliata: esito.sbagliata });
        if (!esito.sbagliata && fine.has(c.nome)) {
          return ruolo === 'conversazione' ? String(c.argomenti.testo ?? '') : c.nome;
        }
      }
    }
    return undefined;
  }
}
