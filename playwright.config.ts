import { defineConfig } from '@playwright/test';

// I test dell'interfaccia girano nel browser vero, perché misurano: ancoraggi, taglie,
// tipografia, movimenti. L'AI è a copione (`test/interfaccia/copione.ts`) e la chat raw
// non scrive niente nell'archivio: nessuna prova tocca i dati dell'utente.
export default defineConfig({
  testDir: 'test/interfaccia',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5393',
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    // Le tavole disegnano a 1440 × 900 (`docs/design/L0` legge 08).
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  },
  webServer: {
    command: 'npx vite --port 5393 --strictPort',
    url: 'http://localhost:5393',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
