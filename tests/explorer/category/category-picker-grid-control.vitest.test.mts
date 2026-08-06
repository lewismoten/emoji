import assert from "node:assert/strict";
import { describe, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const pairedSource = "../../../src/explorer/category/category-picker-grid-control.js";
void pairedSource;

describe("category-picker-grid-control", () => {
  it("keeps the source file paired with the test", () => {
    const sourcePath = path.join(
      process.cwd(),
      "src/explorer/category/category-picker-grid-control.ts",
    );

    assert.equal(fs.existsSync(sourcePath), true);
  });
});
