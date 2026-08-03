import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: { globals: false, include: ["tests/**/*.test.ts"] },
  resolve: {
    alias: {
      "@lib": fileURLToPath(new URL("./lib", import.meta.url)),
    },
  },
});
