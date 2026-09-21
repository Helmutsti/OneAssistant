// L'AI engine, finto.
//
// `docs/03-architettura` dice che l'AI engine è l'API Claude: finché la chiave non c'è, o la
// porta non risponde, queste righe ne fanno le veci. Sta esattamente dietro lo stesso
// confine — riceve la frase, chiama gli stessi strumenti, e non tocca lo stato — quindi
// il giorno in cui quello vero risponde il motore non cambia di una riga.
//
// **Dove è finto, ed è giusto vederlo:** questo AI engine *guarda dentro* il motore invece
// di chiamare `guarda` e leggerne la fotografia. Non è una scorciatoia nascosta: è la
// stessa licenza dei servizi finti di `docs/06-confini §4` — finto oltre il confine, e
// da dentro indistinguibile. Quello che esce da qui sono chiamate, come quelle vere.
//
// Non pensa, e non finge di pensare: una domanda la ammette invece di inventarsi una
// risposta. Quello che sa fare è muovere l'interfaccia bene, e segnarsi le cose.

import type { Motore } from '../modello/motore.ts';
import { chiave, type Genere } from '../archivio/archivio.ts';
import { contesto } from '../conoscenza/contesto.ts';
import { nominati } from '../aree/raccolta.ts';
import { interpreta, type Lettura } from './regole.ts';
import type { Chiamata } from './strumenti.ts';
import type { Dialogo, AiEngineSincrono } from './ai-engine.ts';

export class AiEngineFinto implements AiEngineSincrono {
  readonly nome = 'AI engine finto';

  constructor(private readonly m: Motore) {}

  /**
   * Un passo solo, e il turno è finito: il finto non ha bisogno di guardare due volte,
   * perché guarda da dentro. Quello vero fa più passi, ed è la differenza che si sente.
   */
  passo(d: Dialogo): readonly Chiamata[] {
    if (d.passato.length) return [];
    return this.mosse(d.frase);
  }

  private mosse(frase: string): Chiamata[] {
    const m = this.m;
    const detti = nominati(frase, m);

    // Due nomi in una frase: **non si sceglie il più probabile.** Si chiede, e si
    // aspetta — e finché si aspetta niente si muove (docs/01-modello §5).
    if (detti.length > 1) {
      return [{ nome: 'chiedi', argomenti: { fra: detti.map((t) => t.id) } }];
    }

    // **La delega, nel finto.** Riconosce una forma di frase e nient'altro: «preparami
    // a…», che è l'esempio che docs/03-architettura dà da sempre come roba da AI engine. Un
    // modello vero decide di delegare guardando il lavoro; questo lo decide guardando
    // una regex, ed è tutta la differenza fra simulare e pensare.
    const preparami = /^(?:preparami|preparati|mettimi in pari)\s+(?:a|alla|al|allo|per)\s+(.+)$/i;
    const chiesto = frase.trim().match(preparami);
    if (chiesto) {
      const bersaglio = detti[0] ?? m.aFuoco();
      if (bersaglio) {
        return [
          {
            nome: 'delega',
            argomenti: {
              task: bersaglio.id,
              // Due lavori e non uno: delegare a un secondario solo sarebbe un'attesa
              // al posto di una mossa, e il documento dice di non farlo.
              lavori: [`leggi cosa chiede`, `guarda cosa manca per ${chiesto[1]!.trim()}`],
            },
          },
        ];
      }
    }

    const mosse: Chiamata[] = [];
    // Basta che una frase nomini una cosa a schermo perché quella diventi il discorso.
    // Muto: la riga la dice la mossa che viene dopo, o `parla` alla fine.
    if (detti[0]) mosse.push({ nome: 'al_centro', argomenti: { task: detti[0].id } });

    mosse.push(...this.tradotte(interpreta(frase, m), frase));
    return mosse;
  }

  /**
   * Da `Comando` a chiamate. È la parte che il modello vero fa da sé — leggere una
   * frase e decidere le mosse — e qui la fanno le regole di `regole.ts`.
   */
  private tradotte(c: Lettura, frase: string): Chiamata[] {
    const m = this.m;
    const una = (nome: string, argomenti: Record<string, unknown> = {}): Chiamata[] => [
      { nome, argomenti },
    ];

    switch (c.tipo) {
      // Più comandi in una frase sola: si srotolano in fila, e la fila è la stessa.
      case 'sequenza':
        return c.comandi.flatMap((uno) => this.tradotte(uno, frase));

      // Il fuoco che si muove **e** risponde: la mossa è muta, quindi la riga la dice
      // l'AI engine. È l'unico posto dove la bocca sola si vede lavorare.
      case 'al-centro': {
        const t = m.task.find((x) => x.id === c.task);
        return [
          { nome: 'al_centro', argomenti: { task: c.task } },
          ...(t ? una('parla', { testo: t.testo }) : []),
        ];
      }

      case 'consegna':
        return una('consegna', { task: c.task });
      case 'rimanda':
        return una('rimanda', { task: c.task });
      case 'annulla':
        return una('annulla', { task: c.task });
      case 'lascia':
        return una('lascia', { task: c.task });
      case 'aspetta':
        return una('aspetta');
      case 'non-ascoltare':
        return una('non_ascoltare');
      case 'voce':
        return una('voce', { come: c.come });
      case 'richiama':
        return una('richiama', { nome: c.nome });
      case 'indietro':
        return una('indietro');
      case 'scegli':
        return una('scegli', { indice: c.indice });
      case 'dentro':
        return una('dentro', { task: c.task });
      case 'leggi':
        return una('leggi', { task: c.task });
      case 'mostra':
        return una('mostra', { area: c.area });
      case 'chiudi':
        return una('chiudi');
      case 'riassumi':
        return una('riassumi', { task: c.task });
      // Il finto non scrive il messaggio: lascia che lo scriva `testi.ts`, e passa solo
      // la richiesta. Quello vero manda anche il testo, già scritto.
      case 'componi':
        return una('componi', { a: c.a, richiesta: c.richiesta });
      case 'aggiungi':
        return una('aggiungi', { task: c.task, cosa: c.cosa });
      case 'riscrivi':
        return una('riscrivi', { task: c.task });
      case 'metti':
        return una('metti', { task: c.task, gruppo: c.gruppo });
      case 'apri':
        return una('apri', { gruppo: c.gruppo });
      case 'separa':
        return una('separa', { gruppo: c.gruppo });
      case 'consegna-gruppo':
        return una('consegna_gruppo', { gruppo: c.gruppo });
      case 'rimanda-gruppo':
        return una('rimanda_gruppo', { gruppo: c.gruppo });
      case 'estrai':
        return una('estrai', { notifica: c.notifica });
      case 'sciogli':
        return una('sciogli', { task: c.task });
      case 'no':
        return una('no');
      case 'racconta':
        return una('racconta', { su: c.su });
      case 'dimentica':
        return una('dimentica');
      case 'conferma':
        return una('conferma');
      case 'revoca':
        return una('revoca');
      case 'salva-nota':
        return una('salva_nota', { testo: c.testo });

      // Quello che le regole non riconoscono è il posto dove servirebbe pensare. Il
      // finto non pensa: guarda se c'è un nome, e se c'è si segna la riga.
      case 'aperta':
        return this.senzaPensare(c.frase);
    }
  }

  /**
   * Il mestiere che resta: riconoscere di chi si sta parlando, e tenerne nota. Una
   * domanda non si segna — si risponde — e il finto lo dice invece di inventare.
   */
  private senzaPensare(frase: string): Chiamata[] {
    const nomi = this.trovaNomi(frase);
    const mosse: Chiamata[] = [];
    if (nomi.length) mosse.push({ nome: 'ricorda', argomenti: { chi: nomi } });

    const pulita = frase.trim();
    if (/\?$/.test(pulita) || /^(chi|cosa|come|quando|dove|perch)/i.test(pulita)) {
      return [
        ...mosse,
        {
          nome: 'parla',
          argomenti: { testo: 'Questa non la so ancora: per adesso mi segno le cose e basta.' },
        },
      ];
    }

    // Senza un nome, è una cosa che riguarda te: vissuto, gusti, modo di pensare.
    if (!nomi.length) {
      return [
        { nome: 'segna', argomenti: { nome: 'Appunti', genere: 'Ricordi', testo: pulita, collegamenti: [] } },
        { nome: 'parla', argomenti: { testo: 'Ho preso nota.' } },
      ];
    }

    const nome = nomi[0]!;
    return [
      ...mosse,
      {
        nome: 'segna',
        argomenti: {
          nome,
          genere: this.generePer(nome),
          testo: pulita,
          collegamenti: nomi.slice(1),
        },
      },
      { nome: 'parla', argomenti: { testo: `Me lo segno su ${nome}.` } },
    ];
  }

  /**
   * Chi è nominato: prima quello che l'archivio già conosce e i progetti del contesto —
   * quelli valgono anche in minuscolo — poi le maiuscole in mezzo alla frase.
   */
  private trovaNomi(frase: string): string[] {
    const f = frase.toLowerCase();
    const trovati: string[] = [];
    const aggiungi = (n: string) => {
      if (!trovati.some((t) => chiave(t) === chiave(n))) trovati.push(n);
    };

    for (const n of [...this.m.archivio.nomi(), ...contesto.progetti]) {
      if (n === 'Appunti') continue;
      if (new RegExp(`\\b${chiave(n).replace(/-/g, '[ -]')}\\b`).test(chiave(f).replace(/-/g, ' '))) {
        aggiungi(n);
      }
    }

    // Anche la prima parola può essere un nome — «Paolo dice che…» comincia così.
    // A tenerle fuori bastano le parole comuni: un nome proprio non è mai nell'elenco.
    for (const p of frase.trim().split(/\s+/)) {
      const pulita = p.replace(/[«».,;:!?]/g, '');
      if (pulita.length < 3) continue;
      if (!/^[A-ZÀ-Ý]/.test(pulita)) continue;
      if (NON_NOMI.has(pulita.toLowerCase())) continue;
      aggiungi(pulita);
    }

    return trovati;
  }

  private generePer(nome: string): Genere {
    const gia = this.m.archivio.cosaSa(nome);
    if (gia) return gia.genere;
    if (contesto.progetti.some((p) => chiave(p) === chiave(nome))) return 'Progetti';
    // Un nome che non conosce è quasi sempre una persona: è quello che si nomina di più.
    return 'Persone';
  }
}

/** Parole con la maiuscola che non sono nomi: la lingua è piena di trappole. */
const NON_NOMI = new Set([
  'il','lo','la','i','gli','le','un','uno','una','e','o','ma','se','che','non','mi','ti',
  'ci','vi','si','di','a','da','in','con','su','per','tra','fra','ho','hai','ha','è','sono',
  'domani','oggi','ieri','stamattina','stasera','lunedì','martedì','mercoledì','giovedì',
  'venerdì','sabato','domenica',
]);
