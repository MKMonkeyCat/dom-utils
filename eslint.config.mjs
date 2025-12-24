import { defineConfig } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default defineConfig([
  { ignores: ['dist/**', 'node_modules/**', 'example-dist/**'] },
  ...tseslint.configs.recommended,
  {
    name: 'globals-and-rules',
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      prettier,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'prettier/prettier': ['warn', { endOfLine: 'auto' }],
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
]);
