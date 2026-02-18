import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: 'client',
  publicDir: 'assets',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'client/index.html'),
        dashboard: resolve(__dirname, 'client/dashboard.html'),
        templates: resolve(__dirname, 'client/templates.html'),
        portal: resolve(__dirname, 'client/portal.html'),
        compliance: resolve(__dirname, 'client/compliance.html'),
        mbai: resolve(__dirname, 'client/mbai.html'),
        docs: resolve(__dirname, 'client/docs.html'),
        glossary: resolve(__dirname, 'client/glossary.html'),
        skills: resolve(__dirname, 'client/skills.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/data': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    root: resolve(__dirname),
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: resolve(__dirname, 'coverage'),
      all: false,
      include: ['server/**/*.js', 'client/js/modules/**/*.js'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/codeql_db/**',
        '**/archive/**',
        'server/index.js', // entry point, not unit-testable
        'server/models/database.js', // mocked in tests
        'server/lib/**', // utility libs, tested via integration
        'server/controllers/**', // thin wrappers
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    setupFiles: ['tests/setup.js'],
  },
});
