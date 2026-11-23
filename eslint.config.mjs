import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Spec 003 TR-3, plan 003 §4: the app never imports test code or Better Auth's test helpers,
// so the test sign-in cannot exist in production.
const noTestCode = {
  paths: [
    { name: "better-auth/plugins", importNames: ["testUtils"], message: "testUtils is for e2e/ only (spec 003 TR-3)." },
    { name: "@playwright/test", message: "Playwright is for e2e/ only (spec 003 TR-3)." },
  ],
  patterns: [
    { group: ["**/e2e", "**/e2e/**", "better-auth/plugins/test-utils"], message: "src/ must not import test code (spec 003 TR-3)." },
  ],
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { files: ["src/**/*.{ts,tsx}"], rules: { "no-restricted-imports": ["error", noTestCode] } },
  // Architecture rule (plan §2): the domain module stays framework- and database-free.
  // (Repeats noTestCode: a later rule for the same files replaces the earlier one.)
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: noTestCode.paths,
          patterns: [
            ...noTestCode.patterns,
            {
              group: ["@/app/*", "@/server/*", "../app/*", "../server/*", "next", "next/*", "react", "react-*", "drizzle-orm", "drizzle-orm/*", "better-auth", "better-auth/*"],
              message: "src/domain must stay pure: no framework, database, or server imports.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
