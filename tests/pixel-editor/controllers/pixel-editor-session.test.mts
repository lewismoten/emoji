import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const pairedSource =
  "../../../src/pixel-editor/controllers/pixel-editor-session.js";
void pairedSource;

const sourcePath = path.join(
  process.cwd(),
  "src/pixel-editor/controllers/pixel-editor-session.js",
);

assert.equal(fs.existsSync(sourcePath), true);
