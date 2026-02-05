/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/../test/env-mock.ts'],
  moduleNameMapper: {
    '^@project-bridge/database/client$': '<rootDir>/test/mocks/prisma.mock.ts',
    '^@project-bridge/database$': '<rootDir>/test/mocks/prisma.mock.ts',
  },
};
