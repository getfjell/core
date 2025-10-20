import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        'tests/**',
        'src/index.ts',
        '**/*.d.ts',
        'dist/**',
        'build.js',
        'docs/**',
        'coverage/**',
      ],
      thresholds: {
        global: {
          branches: 91,
          functions: 100,
          lines: 98,
          statements: 98,
        },
      },
    },
  },
});
