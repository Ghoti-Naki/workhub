import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Default environment for API/utility tests.
    // Component tests override this with: // @vitest-environment jsdom
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
