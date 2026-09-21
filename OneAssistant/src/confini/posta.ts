// Servizio finto: la posta. Vive nel tempo, sa fallire, ricorda le consegne
// (docs/06-confini §4).
//
// Le sei che può far arrivare sono lo scenario di prova (docs/09-catene §1): quattro
// passano il filtro e due no, e le due che non passano servono a vedere il filtro
// lavorare. Ognuna ha una **riga dicibile** e, sotto, l'**ingresso** per intero: la riga
// è quello che si legge nella carta, l'ingresso è quello che l'AI engine apre quando gli
// chiedi un riassunto.

import type { Uscita } from '../modello/tipi.ts';
import { ConsegnaFallita, type Proposta, type Sorgente } from './servizio.ts';

interface Evento {
  readonly proposta: Proposta;
}

export class Posta implements Sorgente {
  readonly nome = 'posta';

  /** Se true, la prossima consegna fallisce. Serve a provare `bloccato`. */
  guasta = false;

  private inviate: string[] = [];
  private annuncia?: (p: Proposta) => void;

  // Un servizio vero annuncia quando vuole lui. Questo aspetta che glielo si chieda.

  osserva(annuncia: (p: Proposta) => void): void {
    this.annuncia = annuncia;
  }

  /** Cosa può arrivare. La pedana di prova le fa arrivare a mano, una alla volta. */
  cosaPuoArrivare(): readonly string[] {
    return this.scenario().map((e) => e.proposta.nome);
  }

  /** Far arrivare una cosa adesso. Niente parte da solo: si preme e succede. */
  fai(nome: string): void {
    const e = this.scenario().find((x) => x.proposta.nome === nome);
    if (e && this.annuncia) this.annuncia(e.proposta);
  }

  /**
   * Far arrivare una cosa che lo scenario non prevede: la compone la pedana, e da qui
   * in poi è una proposta come tutte le altre (`Sorgente`).
   */
  inventa(p: Proposta): void {
    this.annuncia?.(p);
  }

  async consegna(u: Uscita, cosa: string): Promise<void> {
    if (this.guasta) {
      this.guasta = false;
      throw new ConsegnaFallita('la posta non risponde');
    }
    await attesa(400);
    this.inviate.push(`a ${u.a}: ${cosa}`);
  }

  leggi(): readonly string[] {
    return this.inviate;
  }

  private scenario(): Evento[] {
    return [
      {
        proposta: {
          tipo: 'posta',
          nome: 'Proposta Acme',
          testo: 'Andrea Riva ti riscrive dopo un po’ e ha una proposta da farti.',
          ingresso:
            'Ciao Manuel, come stai, è tanto che non ci sentiamo. Ti volevo proporre di ' +
            'rientrare su Acme per la parte legale del nuovo contratto quadro: sono tre ' +
            'mesi di lavoro, si comincerebbe a ottobre e il compenso è quello dell’anno ' +
            'scorso rivalutato. Se ti va ne parliamo venerdì pomeriggio.',
          fonte: 'Andrea Riva',
          perTe: true,
          azionabile: true,
          esito: 'Ciao Andrea, venerdì pomeriggio va benissimo. Se ti va, alle 15.',
          uscita: {
            destinazione: 'posta',
            a: 'Andrea Riva',
          },
        },
      },
      {
        proposta: {
          tipo: 'immagine',
          nome: 'Foto vacanza',
          testo: 'Tua madre ti ha mandato le foto del mare.',
          ingresso:
            'Ciao tesoro sono la mamma, io e tuo padre stiamo andando al mare ogni ' +
            'giorno. Ti mando in allegato delle foto così puoi invidiarci un po’. ' +
            'Fatti sentire quando puoi.',
          fonte: 'Mamma',
          perTe: true,
          azionabile: true,
          esito: 'Belle! Vi invidio davvero. Ci sentiamo in settimana.',
          uscita: {
            destinazione: 'posta',
            a: 'Carla Moretti',
          },
        },
      },
      {
        proposta: {
          tipo: 'documento',
          nome: 'Revisione contratto',
          testo: 'Il capo ti vuole preparata sulla richiesta del cliente entro domani mattina.',
          ingresso:
            'Buongiorno avvocato Moretti, avrei bisogno che entro la mattinata di domani ' +
            'lei fosse preparata in merito a questa richiesta del cliente: vogliono ' +
            'rivedere le penali e la durata del vincolo di esclusiva. Le allego la bozza ' +
            'con le loro modifiche in rosso.',
          fonte: 'Capo',
          perTe: true,
          azionabile: true,
          esito: 'Letto, domattina sono pronta sulle penali e sull’esclusiva.',
          uscita: {
            destinazione: 'posta',
            a: 'Renzo Baldi',
          },
        },
      },
      {
        proposta: {
          tipo: 'persone',
          nome: 'Nuovo cliente',
          testo: 'C’è un cliente nuovo, il signor Pettinelli, con un problema con la banca.',
          ingresso:
            'Buongiorno avv. Moretti, abbiamo un nuovo cliente che si chiama Pettinelli. ' +
            'È un signore anziano che ha avuto dei problemi con la sua banca. Ci chiede di ' +
            'dargli una mano. La chiamo io domani per presentarglielo.',
          fonte: 'Capo',
          perTe: true,
          azionabile: true,
          esito: 'Va bene, mi prendo io Pettinelli. Sentiamoci domani.',
          uscita: {
            destinazione: 'posta',
            a: 'Renzo Baldi',
          },
        },
      },
      {
        proposta: {
          tipo: 'posta',
          nome: 'Newsletter',
          testo: 'Le dieci tendenze del design per il prossimo anno.',
          fonte: 'una lista a cui sei iscritta',
          // Non ti nomina: si ferma alla prima domanda del filtro.
          perTe: false,
          azionabile: false,
        },
      },
      {
        proposta: {
          tipo: 'posta',
          nome: 'Fattura Acme',
          testo: 'La fattura di settembre è stata registrata.',
          fonte: 'amministrazione',
          // Ti riguarda ma non c'è niente da fare: è una cosa da sapere.
          perTe: true,
          azionabile: false,
        },
      },
    ];
  }
}

function attesa(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
