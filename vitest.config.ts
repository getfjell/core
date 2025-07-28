import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/index.ts',
        'tests/**',
        '**/*.d.ts',
        'node_modules/**',
        'dist/**',
      ],
      reportsDirectory: './coverage',
      reporter: ['text', 'html', 'clover', 'json'],
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
