import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const pairedSource =
  "../../../../src/pixel-editor/controllers/setup/pixel-editor-controller-session.js";
void pairedSource;

const sourcePath = path.join(
  process.cwd(),
  "src/pixel-editor/controllers/setup/pixel-editor-controller-session.ts",
);

assert.equal(fs.existsSync(sourcePath), true);
