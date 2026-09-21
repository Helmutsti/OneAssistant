// I flussi di prova. **Non fanno parte del design**: sono il copione che si preme.
//
// Una casistica non è una lista di bottoni, è una **conversazione che va avanti**: il
// mondo annuncia, tu dici una cosa, lei risponde, tu ne dici un'altra. Perché si possa
// studiare serve vedere tre cose insieme — a che punto sei, cosa viene adesso, e cosa
// devi aspettarti di vedere quando l'hai premuto.
//
// Per questo ogni passo dichiara la sua `attesa`: se a schermo succede un'altra cosa,
// l'errore è del sistema e si vede subito, senza doverselo ricordare.
//
// Le tre voci del copione:
//
//   mondo   un servizio annuncia. Si preme.
//   tu      una frase che entra dalla stessa porta di tutte le altre. Si preme.
//   lei     quello che risponde il sistema. **Non si preme**: succede da sé, ed è
//           scritto qui solo perché si possa confrontare con quello che è successo.

import type { Motore } from '../modello/motore.ts';
import type { Orologio } from '../modello/tempo.ts';
import { MINUTO } from '../modello/tempo.ts';
import type { Posta } from '../confini/posta.ts';
import type { Calendario } from '../confini/calendario.ts';
import type { Promemoria } from '../confini/promemoria.ts';
import { contesto } from '../conoscenza/contesto.ts';

export type Chi = 'mondo' | 'tu' | 'lei';

export interface Passo {
  readonly chi: Chi;
  /** Quello che si dice, o quello che succede. */
  readonly cosa: string;
  /** Cosa devi vedere a schermo quando il passo è andato. */
  readonly attesa?: string;
  /** Cosa fa il passo. Se manca, il passo non si preme: è una risposta sua. */
  readonly fai?: () => void;
}

export interface Flusso {
  readonly nome: string;
  /** A cosa serve questo flusso: la domanda a cui risponde. */
  readonly perche: string;
  readonly passi: readonly Passo[];
}

export interface Attrezzi {
  readonly posta: Posta;
  /** Gli altri due che annunciano. Il calendario è l'unico che sa produrre un ORARIO. */
  readonly calendario: Calendario;
  readonly promemoria: Promemoria;
  readonly orologio: Orologio;
  readonly motore: Motore;
  /** L'unica porta d'ingresso di una frase, la stessa di INPUT. */
  readonly dillo: (frase: string) => void;
  /**
   * Dettare: la frase entra in INPUT **una parola alla volta**, e non parte. Non è un
   * altro modo di dire una cosa — è il tempo in cui la dici, che è l'unico momento in
   * cui si vede la raccolta agganciarsi (docs/05-interfaccia §1).
   *
   * Manca fuori dal browser: senza uno schermo non c'è niente da guardare crescere.
   */
  readonly detta?: (frase: string) => Promise<void>;
}

export function flussi(a: Attrezzi): readonly Flusso[] {
  /** Una cosa arriva dal mondo. */
  const arriva = (nome: string, attesa: string): Passo => ({
    chi: 'mondo',
    cosa: `arriva · ${nome.toLowerCase()}`,
    attesa,
    fai: () => a.posta.fai(nome),
  });

  /** Tu dici una frase. Passa da dove passano tutte. */
  const dici = (frase: string, attesa: string): Passo => ({
    chi: 'tu',
    cosa: frase,
    attesa,
    fai: () => a.dillo(frase),
  });

  /** Quello che risponde lei. Non si preme. */
  const lei = (cosa: string, attesa?: string): Passo => ({ chi: 'lei', cosa, attesa });

  return [
    {
      nome: 'Il riassunto',
      perche: 'una cosa lunga arriva, e tu vuoi sapere di cosa si tratta senza leggerla',
      passi: [
        arriva('Proposta Acme', 'una carta ambra: aspetta te, e il campanello suona'),
        dici(
          'ho ricevuto una nuova email, puoi riassumere il contenuto',
          'nasce una bolla salvia che lavora — leggo, capisco, scrivo — e la carta non si muove',
        ),
        lei('Certo, ci penso io.'),
        lei(
          'Ho finito il riassunto che mi hai chiesto. Vuoi che te lo legga?',
          'la bolla si espande e mostra il testo, e diventa ambra: adesso aspetta te',
        ),
        dici('no', 'non si muove niente: una risposta è un esito, non un comando'),
        dici(
          'metti da parte, ci penso dopo',
          'il riassunto va fra le cose di più tardi, e lei ti dice fra quanto te lo ricorda',
        ),
      ],
    },
    {
      nome: 'Due cose insieme',
      perche: 'stai guardando una cosa e ne arriva un’altra: il fuoco si sposta, e torna',
      passi: [
        arriva('Revisione contratto', 'una carta ambra in cima alla pila'),
        dici('portala al centro', 'la carta diventa la bolla grande al centro di TABLE'),
        arriva('Nuovo cliente', 'il campanello suona: una seconda carta aspetta te'),
        dici(
          'leggi la notifica',
          'la nuova va al centro e la prima si attenua e rimpicciolisce: un task in un posto solo',
        ),
        dici(
          'torna a quella di prima, questa non mi interessa',
          'il fuoco torna sulla revisione, e nessuno dei due cambia stato',
        ),
        dici(
          'adesso invia un messaggio a mia madre e chiedile a che ora ci vediamo per venerdì a cena',
          'le altre due si attenuano, nasce la terza col contatto già pescato, e il testo è in discorso diretto',
        ),
        lei(
          'Vuoi che lo invii?',
          'sotto la bolla compaiono quattro frasi: emoji, abbraccio, riscrivilo, lascia stare',
        ),
        dici(
          'aggiungi una emoji del cuore e invia',
          'una frase, due comandi: il cuore si attacca al testo e poi parte la consegna',
        ),
        lei('Mandata a Carla Moretti.', 'il chip va avanti da solo, e dopo 90 secondi cade nella memoria'),
      ],
    },
    {
      nome: 'Quando non va',
      perche: 'una consegna che fallisce, e la retromarcia che resta comunque',
      passi: [
        {
          chi: 'mondo',
          cosa: 'la prossima consegna fallisce',
          attesa: 'niente a schermo: è il mondo che si guasta, non il sistema',
          fai: () => (a.posta.guasta = true),
        },
        arriva('Foto vacanza', 'una carta ambra'),
        dici('manda', 'diventa un chip rosso: bloccato, con due uscite e mai zero'),
        dici('riprova', 'stavolta passa: salvia, consegnato'),
        dici('no, aspetta', 'torna indietro: finché la finestra è aperta, niente è irreversibile'),
      ],
    },
    {
      nome: 'La memoria',
      perche: 'quello che si segna, come lo racconta, e come lo smentisce',
      passi: [
        dici('Paolo dice che il preventivo Acme è alto', 'lei dice solo dove l’ha messo, mai come'),
        dici('cosa sai di acme', 'racconta contenuti, e mai posizioni: nessun percorso esce da qui'),
        dici('dimenticalo', 'smentisce, non cancella'),
        dici('cosa sai di acme', 'e smette di pescarla'),
      ],
    },
    {
      nome: 'Chi parla',
      perche: 'l’input è riservato a chi ha la sessione',
      passi: [
        {
          chi: 'mondo',
          cosa: 'parla una voce sconosciuta',
          attesa: 'in WHO: NON TI CONOSCO',
          fai: () => (contesto.ascoltatore = { chi: 'sconosciuto' }),
        },
        dici('manda', 'non si muove niente, e il sistema lo dice'),
        {
          chi: 'mondo',
          cosa: 'parla Giulia, che il sistema conosce',
          attesa: 'in WHO: GIULIA',
          fai: () => (contesto.ascoltatore = { chi: 'conosciuto', nome: 'Giulia' }),
        },
        dici('digli che il contratto è pronto', 'non comanda: lascia detto, e diventa una carta con la fonte scritta'),
        {
          chi: 'mondo',
          cosa: 'torni tu',
          attesa: 'in WHO: SOLO TU',
          fai: () => (contesto.ascoltatore = { chi: 'tu' }),
        },
      ],
    },
    {
      nome: 'Il gruppo',
      perche: 'tre cose che per te sono la stessa cosa, e che il sistema non avrebbe mai messo insieme da sé',
      passi: [
        arriva('Proposta Acme', 'una carta ambra in cima alla pila'),
        dici('mettila con Acme', 'lascia la pila e diventa un chip: adesso è roba che hai in mano'),
        lei('Messa con Acme. Per adesso è da sola.'),
        arriva('Revisione contratto', 'una seconda carta'),
        dici('mettila con Acme', 'i due chip diventano uno solo, con lo spessore dietro e il numero 2'),
        arriva('Nuovo cliente', 'una terza carta'),
        dici('mettila con Acme', 'sempre un elemento solo in TASKBAR, e il numero dice 3'),
        dici('apri Acme', 'l’elenco mostra i tre membri, e sotto compaiono le frasi del gruppo'),
        dici('manda tutte', 'partono insieme: tre chip salvia che lavorano, e l’elenco si chiude'),
        lei('Mandate tutte e 3.', 'una voce sola per una decisione sola, non tre'),
        dici('no, aspetta', 'si ritira il lotto intero: tornano tutte ad aspettare te, e non è uscito niente'),
      ],
    },
    {
      nome: 'Il tempo',
      perche: 'niente parte da solo: il tempo del mondo si muove a mano',
      passi: [
        {
          chi: 'mondo',
          cosa: 'avanti di 5 minuti',
          attesa: 'l’ora in WHEN si sposta',
          fai: () => a.orologio.salta(5 * MINUTO),
        },
        {
          chi: 'mondo',
          cosa: 'avanti di un’ora',
          attesa: 'le carte che nessuno ha guardato scendono fra le cose di più tardi',
          fai: () => a.orologio.salta(60 * MINUTO),
        },
        {
          chi: 'mondo',
          cosa: 'avanti di due ore',
          attesa: 'quello che avevi messo da parte torna a farsi vedere',
          fai: () => a.orologio.salta(120 * MINUTO),
        },
      ],
    },
  ];
}
