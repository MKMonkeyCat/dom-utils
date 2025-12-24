import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const name = 'MKDomUtils';
const fileName = name.toLowerCase();
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      name,
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs', 'umd', 'iife'],
      fileName: (format) => `${fileName}${format.includes('es') ? '' : `.${format}`}.js`,
    },
    rollupOptions: { output: { assetFileNames: () => `${fileName}[extname]` } },
  },
  plugins: [dts()],
});
