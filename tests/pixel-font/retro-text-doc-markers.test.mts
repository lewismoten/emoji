import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..", "..");
const markdown = await fs.readFile(
  path.join(root, "pixel-font", "RETRO_TEXT_FONT.md"),
  "utf8",
);

test("RETRO_TEXT_FONT.md keeps generated build stat markers", () => {
  assert.match(
    markdown,
    /<!-- retro-text-build-stats:start -->[\s\S]*<!-- retro-text-build-stats:end -->/,
    "RETRO_TEXT_FONT.md must keep the generated retro text build stat markers",
  );
});
