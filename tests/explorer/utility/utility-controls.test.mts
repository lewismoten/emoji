import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Pairing source: ../../../src/explorer/utility/utility-controls.js

const sourcePath = path.join(
  process.cwd(),
  "src/explorer/utility/utility-controls.ts",
);

assert.equal(fs.existsSync(sourcePath), true);
