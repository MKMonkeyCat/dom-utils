import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  root: path.resolve(__dirname, 'example'),
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'example-dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
