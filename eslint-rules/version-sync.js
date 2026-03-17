/**
 * ESLint rule: version-sync
 *
 * Ensures that "version" and "runtimeVersion" match in app.json.
 * Checks both top-level and per-platform (ios/android) pairs.
 */

const fs = require("fs");
const path = require("path");

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        'Ensure "version" and "runtimeVersion" match in app.json',
    },
    messages: {
      mismatch:
        'app.json {{scope}} "version" ({{version}}) and "runtimeVersion" ({{runtimeVersion}}) must match.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        const appJsonPath = path.resolve(
          context.cwd ?? process.cwd(),
          "app.json",
        );

        let raw;
        try {
          raw = fs.readFileSync(appJsonPath, "utf8");
        } catch {
          return;
        }

        let config;
        try {
          config = JSON.parse(raw);
        } catch {
          return;
        }

        const expo = config.expo ?? config;

        // Check top-level version/runtimeVersion (if present)
        checkPair(context, expo, "top-level");

        // Check per-platform version/runtimeVersion
        if (expo.ios) {
          checkPair(context, expo.ios, "ios");
        }
        if (expo.android) {
          checkPair(context, expo.android, "android");
        }
      },
    };
  },
};

function checkPair(context, obj, scope) {
  const version = obj.version;
  const runtimeVersion = obj.runtimeVersion;

  if (
    version &&
    runtimeVersion &&
    typeof runtimeVersion === "string" &&
    version !== runtimeVersion
  ) {
    context.report({
      loc: { line: 1, column: 0 },
      messageId: "mismatch",
      data: { version, runtimeVersion, scope },
    });
  }
}
