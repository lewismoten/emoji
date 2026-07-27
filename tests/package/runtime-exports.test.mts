import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readEmojiJson } from "../shared/emoji-data.mjs";

type Emoji = { key: string; emoji: string };
type Category = {
  id: string;
  label: string;
  count: number;
  importPath: string;
  subcategories: {
    id: string;
    label: string;
    count: number;
    importPath: string;
  }[];
};

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const readJson = async <T,>(file: string) =>
  JSON.parse(await fs.readFile(path.join(root, file), "utf8")) as T;
const importDefault = async (specifier: string) =>
  (await import(specifier)).default as Record<string, string>;
const require = createRequire(import.meta.url);
const emoji = (await readEmojiJson(root)) as Emoji[];
const emojiByKey = Object.fromEntries(
  emoji.map((item) => [item.key, item.emoji]),
);
const packageManifest = await readJson<{
  categories: Category[];
  variations: { id: string; importPath: string }[];
}>("manifest.json");
const [
  browserEmoji,
  rootEmoji,
  allEmoji,
  popularEmoji,
  allTypes,
  activityTypes,
] = await Promise.all([
  importDefault(pathToFileURL(path.join(root, "dist/esm/index.js")).href),
  importDefault("@lewismoten/emoji"),
  importDefault("@lewismoten/emoji/all"),
  importDefault("@lewismoten/emoji/popular"),
  fs.readFile(path.join(root, "dist/esm/types/all.d.mts"), "utf8"),
  fs.readFile(
    path.join(
      root,
      "dist/esm/types/categories/activities/arts-and-crafts.d.mts",
    ),
    "utf8",
  ),
]);

assert.deepEqual(browserEmoji, emojiByKey);
assert.deepEqual(allEmoji, emojiByKey);
assert.deepEqual(rootEmoji, popularEmoji);
assert.deepEqual(require("@lewismoten/emoji/all"), allEmoji);
assert.match(
  allTypes,
  /declare const emoji: typeof \S+ & typeof \S+/,
  "merged exports must preserve imported category types",
);
assert.match(
  activityTypes,
  /\*\* artist palette 🎨 \*\//,
  "emoji declarations must document their glyph",
);
assert.ok(Object.keys(popularEmoji).length > 0);
assert.ok(Object.keys(popularEmoji).every((key) => key in emojiByKey));
const categoryModules = new Map<string, Record<string, string>>(
  await Promise.all(
    packageManifest.categories.flatMap((category) =>
      [category, ...category.subcategories].map(
        async (entry) =>
          [entry.importPath, await importDefault(entry.importPath)] as const,
      ),
    ),
  ),
);
for (const category of packageManifest.categories) {
  const categoryEmoji = categoryModules.get(category.importPath) ?? {};
  assert.equal(Object.keys(categoryEmoji).length, category.count);
  for (const subcategory of category.subcategories) {
    const subcategoryEmoji = categoryModules.get(subcategory.importPath) ?? {};
    assert.equal(Object.keys(subcategoryEmoji).length, subcategory.count);
    assert.ok(
      Object.keys(subcategoryEmoji).every((key) => key in categoryEmoji),
    );
  }
}
for (const variation of packageManifest.variations) {
  assert.equal(
    variation.importPath,
    `@lewismoten/emoji/variations/${variation.id}`,
  );
}
for (const variation of ["skin-tones", "hair", "families", "all"]) {
  const variationEmoji = await importDefault(
    `@lewismoten/emoji/variations/${variation}`,
  );
  assert.ok(Object.keys(variationEmoji).every((key) => key in emojiByKey));
}
for (const item of [
  emoji[0],
  emoji.at(Math.floor(emoji.length / 2)),
  emoji.at(-1),
]) {
  assert.ok(item);
  assert.equal(allEmoji[item.key], item.emoji);
}
