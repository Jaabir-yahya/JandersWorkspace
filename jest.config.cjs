module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: [
    "**/tests/**/*.spec.ts",
    "**/tests/**/*.test.ts",
    "**/*.integration.spec.ts",
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/integration/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/api/src/$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "apps/api/tsconfig.json",
      },
    ],
  },
  testTimeout: 30000,
  globals: {
    "ts-jest": {
      tsconfig: {
        module: "commonjs",
        target: "ES2022",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },
};
