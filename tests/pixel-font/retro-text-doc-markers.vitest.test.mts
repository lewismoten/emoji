import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("pixel-font/retro-text-doc-markers", () => {
  it("keeps generated build stat markers", async () => {
    const markdown = await fs.readFile(
      path.join(process.cwd(), "pixel-font", "RETRO_TEXT_FONT.md"),
      "utf8",
    );

    expect(markdown).toMatch(
      /<!-- retro-text-build-stats:start -->[\s\S]*<!-- retro-text-build-stats:end -->/,
    );
  });
});
