import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  shims: true,
  sourcemap: process.env.NODE_ENV === 'production',
  clean: true,
  target: 'es2019',
  platform: 'node',
  minify: true,
  tsconfig: 'tsconfig.lib.json',
  bundle: true,
  skipNodeModulesBundle: true,
  // https://github.com/egoist/tsup/issues/619
  noExternal: [/(.*)/],
  splitting: false,
});
