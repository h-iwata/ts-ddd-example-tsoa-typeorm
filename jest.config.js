/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/application/use-cases/**/*.ts',
    '!src/**/index.ts',
    '!src/domain/repositories/**',
    '!src/domain/events/**',
  ],
  coverageThreshold: {
    // ドメイン層は100%、アプリケーション層はデコレータの影響で閾値を調整
    // 参考: https://github.com/kulshekhar/ts-jest/issues/4538
    global: {
      branches: 50,
      functions: 100,
      lines: 95,
      statements: 85,
    },
    './src/domain/aggregates/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/domain/shared/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageReporters: ['text', 'text-summary', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
