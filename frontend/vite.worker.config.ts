import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    ssr: 'src/worker.ts',
    emptyOutDir: false, // Do not empty the dist folder, as it contains the app
    rollupOptions: {
      input: {
        worker: 'src/worker.ts',
      },
      output: {
        entryFileNames: 'worker.js',
      },
    },
  },
});
