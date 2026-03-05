import { readdirSync } from 'fs';
import { relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const name = 'MKDomUtils';
const fileName = name.toLowerCase();
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const srcRoot = resolve(__dirname, 'src');

const collectEntries = (dir: string, root: string): Record<string, string> => {
  const entries: Record<string, string> = {};

  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = resolve(dir, item.name);

    if (item.isDirectory()) {
      Object.assign(entries, collectEntries(absolutePath, root));
      continue;
    }

    if (!item.isFile() || !item.name.endsWith('.ts') || item.name.endsWith('.d.ts')) {
      continue;
    }

    // Skip app/demo entry so npm build only ships library modules.
    if (absolutePath === resolve(root, 'main.ts')) {
      continue;
    }

    const key = relative(root, absolutePath).replace(/\.ts$/, '');
    entries[key] = absolutePath;
  }

  return entries;
};

const entry = collectEntries(srcRoot, srcRoot);

export default defineConfig({
  build: {
    lib: {
      name,
      entry,
      // Ship ESM/CJS for npm consumers and keep output names aligned with package exports.
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      output: {
        assetFileNames: () => `${fileName}[extname]`,
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
  plugins: [dts({ entryRoot: 'src' })],
});
