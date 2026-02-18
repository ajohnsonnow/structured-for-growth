import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  /* ── Global ignores ─────────────────────────── */
  {
    ignores: ['dist/', 'node_modules/', 'codeql_db/', 'archive/', 'coverage/'],
  },

  /* ── Base recommended rules ─────────────────── */
  js.configs.recommended,

  /* ── Prettier compat (turns off formatting rules) */
  prettier,

  /* ── Shared rules for all JS files ──────────── */
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_|^next$|^req$|^res$',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-return-await': 'warn',
      'require-await': 'warn',
    },
  },

  /* ── Server files (Node-only) ───────────────── */
  {
    files: ['server/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  /* ── Client files (Browser-only) ────────────── */
  {
    files: ['client/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        fetch: 'readonly',
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
      },
    },
  },

  /* ── E2E files (Playwright page objects + specs) ── */
  {
    files: ['e2e/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  /* ── Test files ─────────────────────────────── */
  {
    files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        test: 'readonly',
      },
    },
  },
];
