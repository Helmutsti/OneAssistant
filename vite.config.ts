// Il cablaggio del sito: React, Tailwind, e le tre porte del processo Node — l'AI, l'archivio
// in lettura, la chat raw in scrittura (`docs/L04`). Le porte stanno in `server/`.

import { sep } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { portaAi } from './server/ai.ts';
import { ARCHIVIO, portaArchivio, portaSistema } from './server/archivio.ts';
import { portaChatRaw } from './server/chatRaw.ts';

function porte(): Plugin {
  return {
    name: 'oneassist-porte',
    configureServer(server) {
      server.middlewares.use('/ai-engine', portaAi);
      server.middlewares.use('/archivio', portaArchivio);
      server.middlewares.use('/sistema', portaSistema);
      server.middlewares.use('/chat-raw', portaChatRaw);
    },
  };
}

/**
 * onnxruntime, che fa parlare la voce, carica i suoi binari con un import dinamico, e Vite
 * aggiunge `?import` anche ai file serviti così: qui gli si dice di servirli com'è.
 */
function lasciaStareOrt(): Plugin {
  return {
    name: 'lascia-stare-ort',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith('/ort/') && req.url.includes('?')) req.url = req.url.split('?')[0];
        next();
      });
    },
  };
}

export default defineConfig({
  // Quello che l'app spedisce, e niente di quello che è di qualcuno (`pubblico/LEGGIMI.md`).
  publicDir: 'pubblico',
  server: {
    // `Archivio/` si raggiunge solo dalle porte. Il diniego esplicito copre `/@fs/…`, che ci
    // arriverebbe senza passare da nessun setaccio; `.env` è dove sta la chiave.
    fs: { deny: ['.env', '.env.*', 'chiave.txt', '*.pem', `${ARCHIVIO.split(sep).join('/')}/**`] },
  },
  build: { target: 'esnext' },
  optimizeDeps: { exclude: ['onnxruntime-web'] },
  plugins: [lasciaStareOrt(), porte(), react(), tailwindcss()],
});
