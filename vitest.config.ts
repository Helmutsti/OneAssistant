import { defineConfig } from 'vitest/config';

// I test girano sul modello e sull'AI, senza server e senza browser: la configurazione
// del sito (`vite.config.ts`) porta con sé le porte verso l'archivio e verso OpenRouter,
// e qui non servono.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
