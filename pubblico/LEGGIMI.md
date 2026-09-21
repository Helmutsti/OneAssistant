# Il pubblico

Quello che **l'app spedisce**, e niente di quello che è **di qualcuno**. È il `publicDir`
di Vite: questa cartella *è* la radice del sito, quindi tutto ciò che sta qui dentro lo
scarica chiunque apra la pagina — e va bene, perché qui dentro non c'è niente di privato.

Il confine è quello: i dati delle persone stanno in `Archivio/`, che non è servita e ci
si arriva solo dalla porta `/archivio`. Se stai per mettere un file qui e appartiene a
un utente, sta andando nel posto sbagliato.

```
pubblico/
  volto.png       il volto di riserva, quando un utente non ha un avatar suo
  suoni/          i campanelli che spedisce l'app
  ort/            i binari della voce — NON nel repo, vedi sotto
```

## `ort/` non è nel repo

Sono i WASM di onnxruntime e di eSpeak NG: pesano 58 MB e arrivano coi pacchetti. Li
mette qui `strumenti/prepara-voce.mjs`, che gira da solo dopo `npm install` — o a mano
con `npm run voce` se la cartella sparisce. Un `.wasm` non si importa come un modulo: va
servito come file, e per questo sta qui e non in `src/`.

La voce di Piper invece si scarica la prima volta che parla, e resta nella cache del
browser.

## Rimettere in piedi tutto

```bash
git clone …
npm install          # scarica i pacchetti e mette i binari della voce in pubblico/ort
npm run dev
```

Non c'è un percorso di nessuna macchina in nessun file — ed è l'unica ragione per cui
questo repo parte anche su un computer che non è quello di chi l'ha scritto.
