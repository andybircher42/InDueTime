/**
 * ESLint rule: react-native-platform-coverage
 *
 * Flags Platform.OS comparisons that only check one platform without
 * handling the other, and Platform.select() calls missing "ios" or
 * "android" keys.
 *
 * Allowed patterns (no warning):
 *   Platform.OS === "ios" ? A : B          — ternary handles both implicitly
 *   Platform.OS === "ios" ? "iOS" : "Android" — display string mapping
 *   Platform.select({ ios: …, android: … })
 *
 * Flagged patterns (warning):
 *   if (Platform.OS === "ios") { … }       — no else branch
 *   Platform.select({ ios: … })            — missing android key
 *   Platform.select({ android: … })        — missing ios key
 */

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require Platform.OS checks to handle both iOS and Android, and Platform.select to include both keys",
    },
    messages: {
      missingElseBranch:
        'Platform.OS check for "{{platform}}" has no else branch — add handling for {{missing}} or an explanatory comment.',
      missingSelectKey:
        'Platform.select() is missing the "{{missing}}" key. Add it or use a "default" key.',
    },
    schema: [],
  },

  create(context) {
    /**
     * Returns true when the node is `Platform.OS`.
     * @param {import("eslint").Rule.Node} node
     */
    function isPlatformOS(node) {
      return (
        node.type === "MemberExpression" &&
        node.object.type === "Identifier" &&
        node.object.name === "Platform" &&
        node.property.type === "Identifier" &&
        node.property.name === "OS"
      );
    }

    /**
     * Returns true when the node is `Platform.select`.
     * @param {import("eslint").Rule.Node} node
     */
    function isPlatformSelect(node) {
      return (
        node.type === "MemberExpression" &&
        node.object.type === "Identifier" &&
        node.object.name === "Platform" &&
        node.property.type === "Identifier" &&
        node.property.name === "select"
      );
    }

    /**
     * Checks whether a comment containing the missing platform name
     * exists near the node (same line or line before).
     */
    function hasNearbyPlatformComment(node, missingPlatform) {
      const sourceCode = context.sourceCode ?? context.getSourceCode();
      const comments = sourceCode.getAllComments();
      const nodeLine = node.loc.start.line;

      return comments.some((comment) => {
        const commentLine = comment.loc.start.line;
        return (
          (commentLine === nodeLine ||
            commentLine === nodeLine - 1 ||
            commentLine === nodeLine + 1) &&
          comment.value.toLowerCase().includes(missingPlatform)
        );
      });
    }

    return {
      // Check if-statements: if (Platform.OS === "ios") { ... }
      IfStatement(node) {
        const test = node.test;
        if (
          test.type !== "BinaryExpression" ||
          (test.operator !== "===" && test.operator !== "!==")
        ) {
          return;
        }

        const leftIsPlatformOS = isPlatformOS(test.left);
        const rightIsPlatformOS = isPlatformOS(test.right);
        if (!leftIsPlatformOS && !rightIsPlatformOS) {
          return;
        }

        const literal = leftIsPlatformOS ? test.right : test.left;
        if (literal.type !== "Literal") {
          return;
        }

        const checkedPlatform = literal.value;
        if (checkedPlatform !== "ios" && checkedPlatform !== "android") {
          return;
        }

        // For !== checks, the logic is inverted: the if-body runs for
        // the *other* platform, so missing else means the named platform
        // is unhandled.
        const isNegated = test.operator === "!==";
        const missing = isNegated
          ? checkedPlatform
          : checkedPlatform === "ios"
            ? "android"
            : "ios";

        // Allow if there's an else branch
        if (node.alternate) {
          return;
        }

        // Allow if there's a nearby comment mentioning the other platform
        if (hasNearbyPlatformComment(node, missing)) {
          return;
        }

        context.report({
          node: test,
          messageId: "missingElseBranch",
          data: {
            platform: checkedPlatform,
            missing,
          },
        });
      },

      // Check Platform.select({ ... }) calls
      CallExpression(node) {
        if (
          node.callee.type !== "MemberExpression" ||
          !isPlatformSelect(node.callee)
        ) {
          return;
        }

        const arg = node.arguments[0];
        if (!arg || arg.type !== "ObjectExpression") {
          return;
        }

        const keys = new Set(
          arg.properties
            .filter((p) => p.type === "Property" && !p.computed)
            .map((p) => (p.key.type === "Identifier" ? p.key.name : p.key.value)),
        );

        // "default" key acts as a catch-all, so no warning needed
        if (keys.has("default")) {
          return;
        }

        if (!keys.has("ios")) {
          context.report({
            node: arg,
            messageId: "missingSelectKey",
            data: { missing: "ios" },
          });
        }
        if (!keys.has("android")) {
          context.report({
            node: arg,
            messageId: "missingSelectKey",
            data: { missing: "android" },
          });
        }
      },
    };
  },
};
