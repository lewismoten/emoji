import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const retroDirectory = path.join(root, "src", "site", "themes", "retro");
const retroFiles = fs
  .readdirSync(retroDirectory)
  .filter((file) => file.endsWith(".css"))
  .sort();

const rawColorPattern = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/;
const selectorLiteralAllowList = ['[data-color="#000000"]'];
const problems: string[] = [];

for (const file of retroFiles) {
  const fullPath = path.join(retroDirectory, file);
  let source = fs.readFileSync(fullPath, "utf8");
  for (const selector of selectorLiteralAllowList) {
    source = source.replaceAll(selector, "[allowed-selector-color]");
  }
  const match = source.match(rawColorPattern);
  if (match) {
    problems.push(`${file} contains non-EGA raw color ${match[0]}`);
  }
}

assert.deepEqual(
  problems,
  [],
  "Retro theme CSS must source colors from ega.css variables rather than hard-coded color literals.",
);
