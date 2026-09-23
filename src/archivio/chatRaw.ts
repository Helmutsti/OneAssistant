// La chat raw: l'archivio integrale degli scambi dell'utente attivo, separato dalla memoria
// (`docs/L01`, `docs/L03`). «Integrale» vuol dire **garantito** (storico §16): ogni
// messaggio entra in coda, parte in ordine, si riprova finché il server non conferma, e un
// fallimento si dichiara a schermo, non in console.

import type { Diario } from '../ai/turno.ts';

interface Messaggio {
  readonly timestamp: string;
  readonly role: 'user' | 'assistant';
  readonly text: string;
}

const ATTESE = [500, 1_000, 2_000, 5_000, 10_000];

export class ChatRaw implements Diario {
  private readonly coda: Messaggio[] = [];
  private inCorso = false;

  /** `guasto` riceve il messaggio da mostrare, o `undefined` quando la coda si è svuotata. */
  constructor(private readonly guasto: (testo: string | undefined) => void) {}

  salva(role: 'user' | 'assistant', text: string): void {
    this.coda.push({ timestamp: new Date().toISOString(), role, text });
    void this.svuota();
  }

  private async svuota(): Promise<void> {
    if (this.inCorso) return;
    this.inCorso = true;
    let tentativo = 0;
    let dichiarato = false;
    while (this.coda.length) {
      const m = this.coda[0]!;
      try {
        const r = await fetch('/chat-raw', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(m),
        });
        if (r.status === 400) {
          // Un messaggio malformato non diventa buono riprovando: si dice e si va avanti.
          this.guasto('Un messaggio non è entrato nella chat raw: era malformato.');
          dichiarato = true;
          this.coda.shift();
          continue;
        }
        if (!r.ok) throw new Error(String(r.status));
        this.coda.shift();
        tentativo = 0;
      } catch {
        if (tentativo >= 2 && !dichiarato) {
          this.guasto('La chat raw non si sta salvando: riprovo.');
          dichiarato = true;
        }
        await new Promise((ok) => setTimeout(ok, ATTESE[Math.min(tentativo, ATTESE.length - 1)]));
        tentativo++;
      }
    }
    if (dichiarato) this.guasto(undefined);
    this.inCorso = false;
  }
}
