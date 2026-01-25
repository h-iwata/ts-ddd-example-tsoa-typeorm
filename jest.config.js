/** @type {import('ts-jest').JestConfigWithTsJest} */

/** 共通設定 */
const baseConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
};

/** ユニットテスト設定 */
const unitConfig = {
  ...baseConfig,
  displayName: 'unit',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.test\\.ts$'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};

/** 統合テスト設定 */
const integrationConfig = {
  ...baseConfig,
  displayName: 'integration',
  testMatch: ['**/*.integration.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/integration/setup.ts'],
};

module.exports = {
  // プロジェクト定義（--selectProjects で選択可能）
  projects: [unitConfig, integrationConfig],

  // カバレッジ設定
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
};
