import assert from "node:assert/strict";
import { describe, it } from "vitest";

describe("pixel-editor-entry", () => {
  it("keeps the entry module wiring intact", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const sourceModuleSpecifier = "../src/pixel-editor-entry.js";
    const source = await fs.readFile(
      path.join(process.cwd(), "src/pixel-editor-entry.ts"),
      "utf8",
    );

    assert.equal(sourceModuleSpecifier, "../src/pixel-editor-entry.js");
    assert.match(
      source,
      /import \{ drawBitmapText \} from "\.\/pixel-editor\/canvas\/pixel-editor-canvas-helpers\.js";/,
    );
    assert.match(
      source,
      /import \{ createPixelEditorControllers \} from "\.\/pixel-editor\/controllers\/pixel-editor-controllers\.js";/,
    );
    assert.match(source, /export function createPixelEditor\(\{/);
    assert.match(
      source,
      /export \{\s*buildSkinToneOwnership,[\s\S]*compareSkinToneHelpers,\s*\};/,
    );
  });
});
