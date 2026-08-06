import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { readEmojiJson } from "../../shared/emoji-data.mjs";

type EmojiRecord = {
  codePoints: string;
  emoji: string;
  key: string;
};

type VersionManifestEntry = {
  count: number;
  file: string;
  version: string;
};

type VersionContract = {
  count: number;
  sha256: string;
};

type VersionSnapshot = {
  all: VersionContract;
  versions: Record<string, VersionContract>;
};

const root = path.resolve(process.cwd());
const require = createRequire(import.meta.url);

const readJson = async <T,>(file: string) =>
  JSON.parse(await fs.readFile(path.join(root, file), "utf8")) as T;

const importDefault = async (specifier: string) => {
  const localSpecifier = (() => {
    if (specifier === "@lewismoten/emoji") {
      return path.join(root, "dist/commonjs/popular.min.cjs");
    }
    if (specifier === "@lewismoten/emoji/all") {
      return path.join(root, "dist/commonjs/all.min.cjs");
    }
    if (specifier === "@lewismoten/emoji/popular") {
      return path.join(root, "dist/commonjs/popular.min.cjs");
    }
    if (specifier.startsWith("@lewismoten/emoji/categories/")) {
      return path.join(
        root,
        "dist/commonjs/categories",
        `${specifier.slice("@lewismoten/emoji/categories/".length)}.min.cjs`,
      );
    }
    if (specifier.startsWith("@lewismoten/emoji/variations/")) {
      return path.join(
        root,
        "dist/commonjs/variations",
        `${specifier.slice("@lewismoten/emoji/variations/".length)}.min.cjs`,
      );
    }
    return specifier;
  })();
  return require(localSpecifier) as Record<string, string>;
};

const emoji = (await readEmojiJson(root)) as EmojiRecord[];
const emojiByKey = Object.fromEntries(
  emoji.map((item) => [item.key, item] as const),
);
const allEmoji = await importDefault("@lewismoten/emoji/all");
const manifest = await readJson<{
  versions: VersionManifestEntry[];
}>("src/data/versions/manifest.json");
const snapshot = await readJson<VersionSnapshot>(
  "tests/package/versions/version-exports.snapshot.json",
);

const versionManifestByVersion = new Map(
  manifest.versions.map((entry) => [entry.version, entry] as const),
);

const sha256 = (lines: readonly string[]) =>
  createHash("sha256").update(lines.join("\n")).digest("hex");

export async function verifyAllEmojiContract() {
  const actual = emoji.map(
    (item) => `${item.key}|${item.emoji}|${item.codePoints}`,
  );

  assert.equal(
    emoji.length,
    snapshot.all.count,
    "the emoji dataset count must match the checked-in all-export contract",
  );
  assert.equal(
    sha256(actual),
    snapshot.all.sha256,
    "the emoji dataset key/emoji/codePoint contract changed; update the snapshot only when the rename or sequence change is intentional",
  );

  for (const item of emoji) {
    assert.equal(
      allEmoji[item.key],
      item.emoji,
      `all export must expose ${item.key} as ${item.emoji}`,
    );
  }

  assert.deepEqual(
    Object.keys(allEmoji).sort(),
    Object.keys(emojiByKey).sort(),
    "all export keys must exactly match the emoji dataset keys",
  );
}

export async function verifyVersionContract(version: string) {
  const entry = versionManifestByVersion.get(version);
  const contract = snapshot.versions[version];

  assert.ok(entry, `Missing version manifest entry for ${version}`);
  assert.ok(contract, `Missing checked-in snapshot for Unicode ${version}`);

  const keys = await readJson<string[]>(`src/data/versions/${entry!.file}`);
  const lines = keys.map((key) => {
    const item = emojiByKey[key];
    assert.ok(item, `${version} contains unknown key ${key}`);
    assert.equal(
      allEmoji[key],
      item.emoji,
      `${version} key ${key} must export the expected emoji from @lewismoten/emoji/all`,
    );
    return `${key}|${item.emoji}|${item.codePoints}`;
  });

  assert.equal(
    keys.length,
    contract.count,
    `${version} key count must match the checked-in snapshot`,
  );
  assert.equal(
    sha256(lines),
    contract.sha256,
    `${version} key/emoji/codePoint contract changed; update the snapshot only when the rename or sequence change is intentional`,
  );
}
