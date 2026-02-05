module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.e2e-spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: {
          skipLibCheck: true,
          isolatedModules: false,
        },
      },
    ],
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/integration/prisma-mock.ts"],
  moduleNameMapper: {
    "^@project-bridge/database/client$":
      "<rootDir>/../apps/api/test/mocks/prisma.mock.ts",
    "^@project-bridge/database$":
      "<rootDir>/../apps/api/test/mocks/prisma.mock.ts",
    "^@project-bridge/(.*)$": "<rootDir>/../packages/$1/dist",
  },
};
