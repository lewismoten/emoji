import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const moduleSpecifier = "../../src/explorer-entry.js";
const source = await fs.readFile(
  path.join(process.cwd(), "src/explorer-entry.ts"),
  "utf8",
);

assert.equal(moduleSpecifier, "../../src/explorer-entry.js");
assert.match(source, /^import "\.\/explorer-bootstrap\.js";\s*$/);
