module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.spec.ts',
    '**/tests/**/*.test.ts',
    '**/*.integration.spec.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/api/src/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 30000,
};
