import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("pixel-font/coverage-and-releases-markers", () => {
  it("keeps the generated coverage summary markers", async () => {
    const markdown = await fs.readFile(
      path.join(root, "pixel-font", "COVERAGE_AND_RELEASES.md"),
      "utf8",
    );

    expect(markdown).toMatch(
      /<!-- coverage-summary:start -->[\s\S]*<!-- coverage-summary:end -->/,
    );
  });
});
