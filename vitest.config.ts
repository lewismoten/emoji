import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.vitest.test.mts"],
    environment: "node",
    clearMocks: true,
    restoreMocks: true,
  },
});
