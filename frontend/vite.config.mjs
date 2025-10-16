import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'dist',
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    server: {
      port: 3000,
      proxy: {
        // https://vitejs.dev/config/server-options.html
      },
    },
  }
})
