import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/',
    '<rootDir>/src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 91,
      functions: 100,
      lines: 98,
      statements: 98,
    },
  },
  preset: 'ts-jest/presets/js-with-ts',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '@/(.*)': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
  transform: {
    '^.+\\.ts?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};

export default config;