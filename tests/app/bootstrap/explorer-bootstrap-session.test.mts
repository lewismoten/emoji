const pairedSource = "../../../src/app/bootstrap/explorer-bootstrap-session.js";
void pairedSource;

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const sourcePath = path.join(
  process.cwd(),
  "src/app/bootstrap/explorer-bootstrap-session.ts",
);

assert.equal(fs.existsSync(sourcePath), true);
