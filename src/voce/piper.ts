// Piper: la voce dell'assistente, un modello che gira qui dentro, senza rete per il testo
// (`docs/L04`: «Piper e Serena HIGH»). Tre pezzi in fila: eSpeak NG trasforma le parole in
// fonemi, la mappa del modello li trasforma in numeri, onnxruntime restituisce l'audio.
// Il modello si scarica la prima volta e resta nella cache del browser.

import ESpeakNg from 'espeak-ng';
import * as ort from 'onnxruntime-web';

// I binari di onnxruntime stanno in `pubblico/ort/`: un `.wasm` non si importa come un
// modulo, va servito come file. Un solo thread perché senza intestazioni COOP/COEP il
// browser non dà `SharedArrayBuffer`, e per una frase alla volta basta e avanza.
ort.env.wasm.wasmPaths = '/ort/';
ort.env.wasm.numThreads = 1;
ort.env.logLevel = 'error';

/**
 * Le voci italiane di Piper. Il genere lo dice il profilo (`docs/L03`, `voice`).
 *
 * Nel catalogo di Piper l'italiano ha quattro voci e basta: `paola-medium`,
 * `serena-medium`, `serena-high`, `riccardo-x_low`. Si prende la migliore che c'è, e
 * per la femminile è **serena-high** — ascoltata contro le altre il 17 settembre 2026
 * con `strumenti/banco-voci.html`.
 *
 * Costa, e va detto: 114 MB invece di 63, e **otto volte** il tempo di generazione —
 * 8,5 s contro 1,05 s per una risposta lunga intera, su questa macchina.
 *
 * Quel numero però non è quello che si sente. `voce.ts` spezza in frasi e genera
 * la prossima **mentre** questa suona, quindi si aspetta solo la prima: misurata,
 * **1,3 s** per «Me lo segno su Acme.» e **3,5 s** per la prima frase di una risposta
 * lunga. È il prezzo vero, ed è quello da riguardare se un giorno sembra troppo — il
 * posto dove intervenire è la fila in `voce.ts`, non questa riga.
 *
 * Per la maschile non c'è scelta da fare: `riccardo-x_low` è l'unica che esista, ed è
 * anche la più leggera del gruppo.
 */
export const VOCI = {
  femminile: 'it/it_IT/serena/high/it_IT-serena-high',
  maschile: 'it/it_IT/riccardo/x_low/it_IT-riccardo-x_low',
} as const;

const DEPOSITO = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/';

interface Config {
  readonly audio: { readonly sample_rate: number };
  readonly phoneme_id_map: Record<string, number[]>;
  readonly inference: {
    readonly noise_scale: number;
    readonly length_scale: number;
    readonly noise_w: number;
  };
}

export class Piper {
  private sessione?: ort.InferenceSession;
  private config?: Config;

  /** Scarica il modello e lo prepara. La prima volta ci mette; poi è in cache. */
  async prepara(voce: string): Promise<void> {
    const [config, modello] = await Promise.all([
      fetch(`${DEPOSITO}${voce}.onnx.json`).then((r) => r.json() as Promise<Config>),
      fetch(`${DEPOSITO}${voce}.onnx`).then((r) => r.arrayBuffer()),
    ]);
    this.config = config;
    this.sessione = await ort.InferenceSession.create(modello, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
  }

  pronto(): boolean {
    return this.sessione !== undefined && this.config !== undefined;
  }

  /**
   * Da una frase a dei campioni audio.
   *
   * La sequenza di numeri segue la convenzione di Piper: si apre con `^`, si chiude con
   * `$`, e fra un fonema e l'altro si mette `_` — il separatore serve al modello per
   * sapere dove finisce un suono e comincia il prossimo.
   */
  async genera(testo: string): Promise<{ campioni: Float32Array; frequenza: number }> {
    if (!this.sessione || !this.config) throw new Error('la voce non è pronta');
    const mappa = this.config.phoneme_id_map;
    const fonemi = [...(await fonemizza(testo))];

    const numeri: number[] = [1]; // ^
    for (const f of fonemi) {
      const id = mappa[f];
      if (!id) continue; // un simbolo che il modello non conosce si lascia perdere
      numeri.push(...id, 0); // il fonema, poi il separatore `_`
    }
    numeri.push(2); // $

    const { noise_scale, length_scale, noise_w } = this.config.inference;
    const uscita = await this.sessione.run({
      input: new ort.Tensor('int64', BigInt64Array.from(numeri.map(BigInt)), [1, numeri.length]),
      input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(numeri.length)]), [1]),
      scales: new ort.Tensor('float32', Float32Array.from([noise_scale, length_scale, noise_w]), [3]),
    });
    const primo = uscita[Object.keys(uscita)[0]!]!;
    return {
      campioni: primo.data as Float32Array,
      frequenza: this.config.audio.sample_rate,
    };
  }
}

/**
 * eSpeak NG, quello completo: 17 MB di WebAssembly che contengono tutte le lingue, e
 * quindi anche l'italiano. Sa che «gli» non è «g-l-i» e che «perché» non finisce come
 * «perche» — ed è la ragione per cui non ci si scrive un fonemizzatore da soli.
 *
 * Gli si parla come al programma da riga di comando che è: gli si danno le opzioni, e
 * si legge il file che ha scritto nel suo disco finto.
 */
async function fonemizza(testo: string): Promise<string> {
  const espeak = await ESpeakNg({
    // **Gli argomenti non passano da una shell**, e questo cambia due cose che a occhio
    // sembravano giuste (17 settembre 2026):
    //
    //   - `-b` vuole il valore **separato**. Scritto `-b=1` il valore arrivava come la
    //     stringa `=1`, che `atoi` legge 0, cioè «indovina la codifica» — e su un testo
    //     italiano senza BOM eSpeak indovinava 8 bit. I byte UTF-8 di «é» (C3 A9)
    //     diventavano due caratteri, `Ã` e `©`, e la voce leggeva «perché» come
    //     «perc a con tilde copirait». Con `-b 1` i fonemi sono `perkˌe`, e bastava
    //     uno spazio;
    //   - `--sep=""` passava le virgolette **per davvero**: senza shell che le tolga,
    //     il separatore dei fonemi diventava il carattere `"`. Non serviva a niente e
    //     ora non c'è: Piper vuole i fonemi attaccati, ed è quello che escono.
    arguments: ['--phonout', 'fonemi', '-q', '-b', '1', '--ipa=3', '-v', 'it', testo],
    // anche lui cerca il suo binario accanto a sé, e lì non c'è: sta in `pubblico/ort/`
    locateFile: (f: string) => `/ort/${f}`,
  });
  return (espeak.FS.readFile('fonemi', { encoding: 'utf8' }) as string)
    .replace(/\s+/g, ' ')
    .trim();
}

/** I campioni diventano un wav, che è l'unica cosa che un browser sa suonare da sé. */
export function inWav(campioni: Float32Array, frequenza: number): Blob {
  const buffer = new ArrayBuffer(44 + campioni.length * 2);
  const v = new DataView(buffer);
  const scrivi = (pos: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(pos + i, s.charCodeAt(i));
  };
  scrivi(0, 'RIFF');
  v.setUint32(4, 36 + campioni.length * 2, true);
  scrivi(8, 'WAVEfmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // un canale
  v.setUint32(24, frequenza, true);
  v.setUint32(28, frequenza * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  scrivi(36, 'data');
  v.setUint32(40, campioni.length * 2, true);
  for (let i = 0; i < campioni.length; i++) {
    const c = Math.max(-1, Math.min(1, campioni[i]!));
    v.setInt16(44 + i * 2, c < 0 ? c * 0x8000 : c * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}
