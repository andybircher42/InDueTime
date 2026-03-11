/**
 * Tests for the platform-coverage ESLint rule.
 *
 * Run with: npx jest eslint-rules/platform-coverage.test.js
 */
const { RuleTester } = require("eslint");
const rule = require("./platform-coverage");

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020, sourceType: "module" },
});

ruleTester.run("platform-coverage", rule, {
  valid: [
    // Ternary — both branches handled implicitly
    {
      code: `const behavior = Platform.OS === "ios" ? "padding" : "height";`,
    },
    // if/else — both branches present
    {
      code: `if (Platform.OS === "ios") { doA(); } else { doB(); }`,
    },
    // !== with else
    {
      code: `if (Platform.OS !== "ios") { doAndroid(); } else { doIos(); }`,
    },
    // Platform.select with both keys
    {
      code: `const style = Platform.select({ ios: { shadow: 1 }, android: { elevation: 1 } });`,
    },
    // Platform.select with default key
    {
      code: `const style = Platform.select({ ios: { shadow: 1 }, default: { elevation: 1 } });`,
    },
    // if with nearby comment mentioning the other platform
    {
      code: `// Android native dialog auto-closes; iOS stays open
if (Platform.OS !== "ios") { close(); }`,
    },
  ],
  invalid: [
    // if without else, no comment
    {
      code: `if (Platform.OS === "ios") { doIos(); }`,
      errors: [{ messageId: "missingElseBranch" }],
    },
    // !== without else, no comment
    {
      code: `if (Platform.OS !== "android") { doIos(); }`,
      errors: [{ messageId: "missingElseBranch" }],
    },
    // Platform.select missing android
    {
      code: `const style = Platform.select({ ios: { shadow: 1 } });`,
      errors: [{ messageId: "missingSelectKey", data: { missing: "android" } }],
    },
    // Platform.select missing ios
    {
      code: `const style = Platform.select({ android: { elevation: 1 } });`,
      errors: [{ messageId: "missingSelectKey", data: { missing: "ios" } }],
    },
    // Platform.select missing both
    {
      code: `const style = Platform.select({ web: {} });`,
      errors: [
        { messageId: "missingSelectKey", data: { missing: "ios" } },
        { messageId: "missingSelectKey", data: { missing: "android" } },
      ],
    },
  ],
});

// Signal success when run directly
console.log("All platform-coverage rule tests passed!");
