import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const here = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  root: here,
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  resolve: {
    alias: {
      react: resolve(here, 'node_modules/react'),
      'react-dom': resolve(here, 'node_modules/react-dom'),
      'lucide-react': resolve(here, 'node_modules/lucide-react')
    }
  },
  plugins: [react()],
  build: {
    outDir: 'public', emptyOutDir: false,
    lib: { entry: resolve(here, 'bubble-entry.tsx'), formats: ['es'], fileName: () => 'bubble.js' },
    rollupOptions: { output: { assetFileNames: 'bubble.css' } }
  }
});
