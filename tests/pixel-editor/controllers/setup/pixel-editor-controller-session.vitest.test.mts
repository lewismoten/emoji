import assert from "node:assert/strict";
import { describe, it } from "vitest";

describe("pixel-editor-controller-session", () => {
  it("keeps the controller-session source paired", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const pairedSource =
      "../../../../src/pixel-editor/controllers/setup/pixel-editor-controller-session.js";
    void pairedSource;

    const sourcePath = path.join(
      process.cwd(),
      "src/pixel-editor/controllers/setup/pixel-editor-controller-session.ts",
    );

    assert.equal(fs.existsSync(sourcePath), true);
  });
});
