// I binari della voce non stanno nel repo: pesano 58 MB e arrivano con i pacchetti.
// Questo li mette dove il sito può servirli — `pubblico/ort/` — perché un `.wasm` non si
// importa come un modulo, va servito come file.
//
// Sono l'unica cosa di `pubblico/` che **non** è nel repo, ed è il motivo per cui
// rimettere in piedi il sito è `npm install` e non solo `git clone`: il resto è già lì.
//
// Gira da solo dopo `npm install`, o a mano con `npm run voce`.

import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const DOVE = 'pubblico/ort';
const FILE = [
  'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm',
  'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs',
  'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm',
  'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.mjs',
  'node_modules/espeak-ng/dist/espeak-ng.wasm',
];

await mkdir(DOVE, { recursive: true });
let presi = 0;
for (const da of FILE) {
  if (!existsSync(da)) continue;
  await copyFile(da, `${DOVE}/${da.split('/').pop()}`);
  presi++;
}
console.log(`la voce è pronta: ${presi} file in ${DOVE}`);
