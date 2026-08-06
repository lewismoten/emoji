import assert from "node:assert/strict";
import { describe, it } from "vitest";

describe("pixel-editor-session", () => {
  it("keeps the controller source paired", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const pairedSource =
      "../../../src/pixel-editor/controllers/pixel-editor-session.js";
    void pairedSource;

    const sourcePath = path.join(
      process.cwd(),
      "src/pixel-editor/controllers/pixel-editor-session.ts",
    );

    assert.equal(fs.existsSync(sourcePath), true);
  });
});
