/** @type {import("jest").Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  cacheDirectory: "node_modules/.cache/jest",
  modulePathIgnorePatterns: ["<rootDir>/.claude/worktrees"],
  transform: { "\\.[jt]sx?$": "<rootDir>/jest-transformer.js" },
};
