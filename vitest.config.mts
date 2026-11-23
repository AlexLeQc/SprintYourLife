import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "e2e/support/**/*.test.ts"],
    environment: "node",
  },
});
