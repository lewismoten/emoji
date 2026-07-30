import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const markdown = await fs.readFile(
  path.join(root, "pixel-font", "COVERAGE_AND_RELEASES.md"),
  "utf8",
);

assert.match(
  markdown,
  /<!-- coverage-summary:start -->[\s\S]*<!-- coverage-summary:end -->/,
  "COVERAGE_AND_RELEASES.md must keep the generated coverage summary markers",
);
