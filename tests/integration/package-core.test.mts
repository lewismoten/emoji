import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import {
  demoHtml,
  emoji,
  explorerCatalog,
  explorerGeneratorScript,
  orderManifest,
  packageJson,
  root,
} from "../shared/unit-fixtures.mjs";

assert.equal(
  new Set(emoji.map((item) => item.key)).size,
  emoji.length,
  "emoji keys must be unique",
);
assert.match(
  demoHtml,
  /src="\.\/src\/index\.ts"/,
  "Vite must use the TypeScript Explorer entry point",
);
assert.match(
  explorerGeneratorScript,
  /transpileExplorerModule\('src\/index\.ts', 'index\.js'\)/,
  "the deployment entry point must be generated from TypeScript",
);
assert.match(
  explorerGeneratorScript,
  /readdirSync\('src\/explorer'\)[\s\S]*`explorer\/\$\{file\.replace\(\/\\\.ts\$\/, '\.js'\)\}`/,
  "the deployment build must generate imported Explorer modules",
);
assert.match(
  packageJson.scripts.build,
  /tsc -p src\/explorer\.tsconfig\.json/,
  "package builds must type-check the Explorer source",
);
assert.ok(
  emoji.every((item) => Number.isInteger(item.order)),
  "every emoji must have a Unicode order",
);
assert.ok(
  emoji.every((item) =>
    ["single", "modifier", "zwj", "flag", "keycap", "tag"].includes(
      item.sequenceType,
    ),
  ),
  "every emoji must have a known sequence type",
);
assert.equal(
  explorerCatalog.emoji.length,
  emoji.length,
  "the compact Explorer catalog must contain every released emoji",
);
assert.deepEqual(
  explorerCatalog.fields,
  [
    "key",
    "emoji",
    "codePoints",
    "status",
    "shortName",
    "group",
    "subGroup",
    "order",
    "sequenceType",
  ],
  "the compact Explorer catalog schema must remain explicit",
);
assert.ok(
  (await fs.stat(path.join(root, "explorer/catalog.json"))).size <
    (await fs.stat(path.join(root, "emoji.json"))).size / 2,
  "the Explorer catalog must remain less than half the verbose public dataset",
);
assert.deepEqual(
  orderManifest.unicode,
  [...emoji].sort((a, b) => a.order - b.order).map((item) => item.key),
  "Unicode order manifest must match emoji order metadata",
);
