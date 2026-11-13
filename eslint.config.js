import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// v7+ exposes configs.flat.recommended; older versions used 'recommended-latest'.
const reactHooksRecommended =
  reactHooks.configs.flat?.recommended ?? reactHooks.configs['recommended-latest'];

export default defineConfig([
  globalIgnores(['dist', 'coverage']),

  // TypeScript: strict, type-aware rules (they can see real types, so they catch
  // floating promises, unsafe `any` and conditions that can never be false).
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooksRecommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignorePrimitives: { string: true } }],
    },
  },

  // Legacy JS from the starter: basic rules until each file is converted.
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooksRecommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.vitest },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // Config files run in Node.
  { files: ['*.config.{js,ts}'], languageOptions: { globals: globals.node } },

  // Last: switch off rules that would argue with Prettier.
  prettier,
]);
