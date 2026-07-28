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
  await fs.readFile(path.join(root, "src/explorer-entry.ts"), "utf8"),
  /^import "\.\/explorer-bootstrap\.js";\s*$/m,
  "the dedicated Explorer entry must bootstrap the shared Explorer runtime",
);
assert.match(
  `${explorerGeneratorScript}\n${await fs.readFile(
    path.join(root, "scripts/generate-demo-pages.mjs"),
    "utf8",
  )}`,
  /file === (["'])index\.ts\1[\s\S]*path\.join\(outputDirectory,\s*(["'])index\.js\2\)[\s\S]*transpileModule\(/,
  "the deployment entry point must be generated from TypeScript into the demo output",
);
assert.match(
  explorerGeneratorScript,
  /readdirSync\((["'])src\/explorer\1\)[\s\S]*`explorer\/\$\{file\.replace\(\/\\\.ts\$\/,\s*(["'])\.js\2\)\}`/,
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
const getPublicEmojiDatasetSize = async () => {
  try {
    return (await fs.stat(path.join(root, "emoji.json"))).size;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== "ENOENT") throw error;
    const compact = {
      schemaVersion: 2,
      fields: [
        "key",
        "codePoints",
        "group",
        "subGroup",
        "order",
        "sequenceType",
        "shortName",
        "status",
      ],
      emoji: Object.fromEntries(
        emoji.map((item) => [
          item.emoji,
          [
            item.key,
            item.codePoints,
            item.group,
            item.subGroup,
            item.order,
            item.sequenceType,
            item.shortName,
            item.status,
          ],
        ]),
      ),
    };
    return Buffer.byteLength(`${JSON.stringify(compact)}\n`, "utf8");
  }
};
assert.ok(
  (await getPublicEmojiDatasetSize()) <=
    (await fs.stat(path.join(root, "explorer/catalog.json"))).size + 256,
  "the public emoji dataset must remain at least as compact as the Explorer catalog within a narrow schema-overhead margin",
);
assert.deepEqual(
  orderManifest.unicode,
  [...emoji].sort((a, b) => a.order - b.order).map((item) => item.key),
  "Unicode order manifest must match emoji order metadata",
);
