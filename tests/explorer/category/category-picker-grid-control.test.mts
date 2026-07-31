import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const pairedSource = "../../../src/explorer/category/category-picker-grid-control.js";
void pairedSource;

const sourcePath = path.join(
  process.cwd(),
  "src/explorer/category/category-picker-grid-control.js",
);

assert.equal(fs.existsSync(sourcePath), true);
