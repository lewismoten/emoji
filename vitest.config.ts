import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@lewismoten/emoji": path.resolve(
        process.cwd(),
        "dist/esm/popular.min.js",
      ),
      "@lewismoten/emoji/all": path.resolve(
        process.cwd(),
        "dist/esm/all.min.js",
      ),
      "@lewismoten/emoji/categories/activities": path.resolve(
        process.cwd(),
        "dist/esm/categories/activities.min.js",
      ),
      "@lewismoten/emoji/search": path.resolve(
        process.cwd(),
        "dist/esm/search.min.js",
      ),
    },
  },
  test: {
    include: ["tests/**/*.vitest.test.mts"],
    environment: "node",
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "build/**",
        "dist/**",
        "tests/**",
        "docs/**",
        "pixel-font/**",
        "scripts/**",
      ],
    },
  },
});
