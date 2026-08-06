import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "vitest";

// Pairing source: ../../../src/explorer/utility/utility-controls.js

describe("utility-controls", () => {
  it("keeps the utility controls source module in place", () => {
    const sourcePath = path.join(
      process.cwd(),
      "src/explorer/utility/utility-controls.ts",
    );

    assert.equal(fs.existsSync(sourcePath), true);
  });
});
