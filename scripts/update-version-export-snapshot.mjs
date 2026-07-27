import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const readJson = async (file) =>
  JSON.parse(await fs.readFile(path.join(root, file), "utf8"));

const emoji = await readJson("emoji.json");
const manifest = await readJson("versions/manifest.json");
const emojiByKey = Object.fromEntries(emoji.map((item) => [item.key, item]));

const sha256 = (lines) =>
  createHash("sha256").update(lines.join("\n")).digest("hex");

const snapshot = {
  all: {
    count: emoji.length,
    sha256: sha256(
      emoji.map((item) => `${item.key}|${item.emoji}|${item.codePoints}`),
    ),
  },
  versions: {},
};

for (const version of manifest.versions) {
  const keys = await readJson(`versions/${version.file}`);
  snapshot.versions[version.version] = {
    count: keys.length,
    sha256: sha256(
      keys.map((key) => {
        const item = emojiByKey[key];
        if (!item) throw new Error(`Unknown key in ${version.file}: ${key}`);
        return `${key}|${item.emoji}|${item.codePoints}`;
      }),
    ),
  };
}

const outputFile = path.join(
  root,
  "tests/package/version-exports.snapshot.json",
);
await fs.writeFile(outputFile, `${JSON.stringify(snapshot, null, 2)}\n`);

console.info(
  `Updated version export snapshot for ${manifest.versions.length} released Unicode versions.`,
);
