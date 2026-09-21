// Il disco di docs/06-confini §5. Legge e scrive, ma **non osserva**: nessuno ti bussa
// perché un file è cambiato. E quello che il sistema ci scrive non attraversa nessun
// confine — è la sua stessa testa — quindi non passa dal cancello `aspetta te`.
//
// Per questo non implementa `Servizio`: non ha `osserva`, e `scrivi` non è `consegna`.
//
// ─── Il 17 settembre 2026 è diventato vero ──────────────────────────────────
//
// Prima era una `Map` e basta, e l'effetto non era «il disco è finto»: era che
// **l'archivio dimenticava tutto a ogni ricarica**. `Archivio.rileggi()` dice «all'avvio
// l'archivio è quello che c'è sul disco: i file sono la verità», e sul disco non c'era
// mai niente. Non era finta la memoria — era finto il ripiano su cui posava.
//
// Adesso dietro c'è una porticina di Node (`/disco`, nel `vite.config.ts`), e i file
// sono file: si aprono nell'editor, si leggono, si correggono a mano.
//
// **La Map è rimasta, e non è un residuo: è il motivo per cui sopra non cambia niente.**
// `Archivio` legge e scrive in modo sincrono, e lo fa già dentro il suo costruttore; una
// porta sta dietro la rete, e la rete è asincrona. Quindi: si scarica tutto una volta
// all'avvio (`accendi`), la Map diventa una copia di lavoro, e ogni `scrivi` va a
// segno subito qui e parte in sottofondo di là. Verità sul disco, velocità in memoria.
//
// **E quando arriverà Electron** questo file è l'unico che cambia: `fetch` diventa
// `ipcRenderer`, e i quattro verbi restano quelli. È il confine che cambia, mai il
// modello.

/** La porta dell’archivio. Una sola, come `/ai-engine`: si passa da un punto solo. */
const PORTA = '/archivio';

export class Disco {
  readonly nome = 'disco';
  private readonly file = new Map<string, string>();

  /**
   * **Di chi è questa memoria.** Un disco è di una persona sola, e non per pudore: è la
   * forma dell’archivio (`Archivio/users/<id>/memory/`). Prima la separazione fra profili era
   * un prefisso dentro la stessa mappa — adesso sono due cartelle diverse, il che è una
   * garanzia più forte e più difficile da rompere per sbaglio.
   *
   * Senza id resta in memoria e non parla con nessuno: è il banco (`npm run scenario`),
   * dove un disco vero non serve e non deve esserci.
   */
  constructor(private readonly chi?: string) {}

  /** Un servizio finto sa fallire su richiesta (docs/06-confini §4). */
  guasto = false;

  /**
   * C'è davvero qualcosa dietro? Se `accendi` non è stato chiamato o la porta non
   * risponde, questo resta falso e il disco torna a essere quello di prima: una Map che
   * dura quanto la scheda. Non è un guasto — è il banco (`npm run scenario`), dove un
   * disco vero non serve e non deve esserci.
   */
  private posato = false;

  /**
   * Riempire la copia di lavoro con quello che c'è di là. Va chiamato **prima** di
   * costruire l'`Archivio`, perché lei si rilegge nel costruttore.
   *
   * Non lancia mai: se la porta non c'è si va avanti in memoria, e si dice.
   */
  async accendi(): Promise<void> {
    if (!this.chi) return;
    try {
      const r = await fetch(`${PORTA}/${this.chi}/memory`);
      if (!r.ok) throw new Error(String(r.status));
      const { file } = (await r.json()) as { file: Record<string, string> };
      for (const [percorso, testo] of Object.entries(file)) this.file.set(percorso, testo);
      this.posato = true;
      console.info(`[disco] ${this.file.size} file dalla porta: la memoria sopravvive alla ricarica`);
    } catch (e) {
      console.warn(
        '[disco] la porta non risponde: vado in memoria, e quello che scrivo non sopravvive ' +
          'alla ricarica.',
        e instanceof Error ? e.message : e,
      );
    }
  }

  leggi(percorso: string): string | undefined {
    if (this.guasto) throw new Error('il disco non risponde');
    return this.file.get(percorso);
  }

  scrivi(percorso: string, testo: string): void {
    if (this.guasto) throw new Error('il disco non risponde');
    this.file.set(percorso, testo);
    if (this.posato) void this.posa(percorso, testo);
  }

  esiste(percorso: string): boolean {
    return this.file.has(percorso);
  }

  /** Tutti i percorsi sotto una cartella, in ordine. */
  elenca(prefisso: string): string[] {
    return [...this.file.keys()].filter((p) => p.startsWith(prefisso)).sort();
  }

  /** Quanto pesa, per la pedana di prova. Non lo vede mai l'utente. */
  quanti(): number {
    return this.file.size;
  }

  /**
   * La scrittura vera, che parte per conto suo. Se fallisce lo dice forte e non zitto:
   * un archivio che crede di aver scritto e non ha scritto è peggio di uno che non
   * scrive — la prossima ricarica scoprirebbe il buco, e troppo tardi.
   */
  private async posa(percorso: string, testo: string): Promise<void> {
    try {
      const r = await fetch(`${PORTA}/${this.chi}/memory`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ percorso, testo }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    } catch (e) {
      console.error(`[disco] NON ho scritto ${percorso}:`, e instanceof Error ? e.message : e);
    }
  }
}
