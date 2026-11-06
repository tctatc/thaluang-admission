import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const sharedDir = fileURLToPath(new URL('../shared', import.meta.url));

export default defineConfig({
  // base แบบ relative + HashRouter: วางที่ https://<user>.github.io/<repo>/ ได้โดยไม่ต้องตั้ง base ใหม่
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@shared': sharedDir } },
  server: { port: 5174, fs: { allow: ['..'] } },
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 400 },
});
