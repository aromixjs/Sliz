import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { globals: false, include: ["tests/**/*.test.ts"] },
  resolve: {
    alias: {
      "@/src": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
