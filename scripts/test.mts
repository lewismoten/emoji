import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type Emoji = {
  key: string;
  emoji: string;
  codePoints: string;
  group: string;
  order: number;
  sequenceType: string;
};

type Version = {
  version: string;
  file: string;
  count: number;
};

type ProposedVersion = Version & {
  status: 'draft';
  released: null;
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = async <T,>(file: string) => JSON.parse(await fs.readFile(path.join(root, file), 'utf8')) as T;
const importFileDefault = async (file: string) =>
  (await import(pathToFileURL(path.join(root, file)).href)).default as Record<string, string>;
const importPackageDefault = async (specifier: string) =>
  (await import(specifier)).default as Record<string, string>;
const require = createRequire(import.meta.url);

const emoji = await readJson<Emoji[]>('emoji.json');
const orderManifest = await readJson<{ unicode: string[] }>('orders/manifest.json');
const packageManifest = await readJson<{
  name: string;
  packs: { id: string; count: number; importPath: string }[];
  categories: {
    id: string;
    label: string;
    count: number;
    importPath: string;
    subcategories: { id: string; label: string; unicodeSubgroup: string; count: number; importPath: string }[];
  }[];
  variations: { id: string; count: number; importPath: string }[];
}>('manifest.json');
const manifest = await readJson<{ versions: Version[]; proposed?: ProposedVersion[] }>('versions/manifest.json');
const emojiByKey = Object.fromEntries(emoji.map(item => [item.key, item.emoji]));
const browserEmoji = await importFileDefault('dist/esm/index.js');
const rootEmoji = await importPackageDefault('@lewismoten/emoji');
const allEmoji = await importPackageDefault('@lewismoten/emoji/all');
const popularEmoji = await importPackageDefault('@lewismoten/emoji/popular');
const allTypes = await fs.readFile(path.join(root, 'dist/esm/types/all.d.mts'), 'utf8');
const activitiesTypes = await fs.readFile(path.join(root, 'dist/esm/types/categories/activities/arts-and-crafts.d.mts'), 'utf8');

assert.equal(new Set(emoji.map(item => item.key)).size, emoji.length, 'emoji keys must be unique');
assert.ok(emoji.every(item => Number.isInteger(item.order)), 'every emoji must have a Unicode order');
assert.ok(emoji.every(item => ['single', 'modifier', 'zwj', 'flag', 'keycap', 'tag'].includes(item.sequenceType)), 'every emoji must have a known sequence type');
assert.deepEqual(orderManifest.unicode, [...emoji].sort((a, b) => a.order - b.order).map(item => item.key), 'Unicode order manifest must match emoji order metadata');
assert.deepEqual(browserEmoji, emojiByKey, 'browser bundle must contain every emoji value');
assert.deepEqual(allEmoji, emojiByKey, 'all export must contain every emoji value');
assert.match(allTypes, /declare const emoji: typeof \S+ & typeof \S+/, 'all merger must preserve the types of its imported category packs');
assert.match(activitiesTypes, /\*\* artist palette 🎨 \*\//, 'emoji declarations must document the emoji glyph');
assert.ok(Object.keys(popularEmoji).length > 0, 'popular export must not be empty');
assert.ok(Object.keys(popularEmoji).every(key => key in emojiByKey), 'popular export must only contain known keys');
assert.deepEqual(rootEmoji, popularEmoji, 'root export must resolve to the popular package export');
assert.deepEqual(require('@lewismoten/emoji/all'), allEmoji, 'CommonJS all export must resolve through package exports');
assert.deepEqual(require('@lewismoten/emoji/orders/manifest'), orderManifest, 'order manifest must resolve through package exports');
assert.equal(packageManifest.name, '@lewismoten/emoji', 'package manifest must identify this package');
assert.equal(packageManifest.packs.find(pack => pack.id === 'all')?.count, emoji.length, 'all pack count must match emoji data');
assert.equal(packageManifest.categories.length, new Set(emoji.map(item => item.group)).size, 'package manifest must list every Unicode category');
for (const category of packageManifest.categories) {
  assert.equal(category.importPath, `@lewismoten/emoji/categories/${category.id}`, `${category.label} must have a public import path`);
  assert.equal(category.count, emoji.filter(item => item.group === category.label).length, `${category.label} count must match emoji data`);
  assert.equal(category.subcategories.reduce((count, subcategory) => count + subcategory.count, 0), category.count, `${category.label} subcategories must account for every emoji`);
  const categoryEmoji = await importPackageDefault(category.importPath);
  assert.equal(Object.keys(categoryEmoji).length, category.count, `${category.label} export count must match its manifest`);
  for (const subcategory of category.subcategories) {
    assert.equal(subcategory.importPath, `@lewismoten/emoji/categories/${category.id}/${subcategory.id}`, `${subcategory.label} must have a public import path`);
    const subcategoryEmoji = await importPackageDefault(subcategory.importPath);
    assert.equal(Object.keys(subcategoryEmoji).length, subcategory.count, `${subcategory.label} export count must match its manifest`);
    assert.ok(Object.keys(subcategoryEmoji).every(key => key in categoryEmoji), `${subcategory.label} must belong to ${category.label}`);
  }
}
for (const variation of packageManifest.variations) {
  assert.equal(variation.importPath, `@lewismoten/emoji/variations/${variation.id}`, `${variation.id} must have a public import path`);
}

const versionKeys = new Set<string>();
for (const version of manifest.versions) {
  const keys = await readJson<string[]>(`versions/${version.file}`);
  assert.equal(keys.length, version.count, `Emoji ${version.version} count must match its manifest`);
  assert.equal(new Set(keys).size, keys.length, `Emoji ${version.version} keys must be unique`);
  for (const key of keys) {
    assert.ok(key in emojiByKey, `Emoji ${version.version} contains unknown key ${key}`);
    assert.ok(!versionKeys.has(key), `Emoji ${key} must be introduced by only one version`);
    versionKeys.add(key);
  }
}
assert.deepEqual(versionKeys, new Set(Object.keys(emojiByKey)), 'version files must account for every emoji');

const releasedCodePoints = new Set(emoji.map(item => item.codePoints));
for (const version of manifest.proposed ?? []) {
  assert.equal(version.status, 'draft', `Unicode ${version.version} must match its draft source data`);
  assert.equal(version.released, null, `Unicode ${version.version} must not have a release date`);
  const proposal = await readJson<{ count: number; emoji: Emoji[] }>(version.file);
  assert.equal(proposal.count, version.count, `Unicode ${version.version} proposed count must match its manifest`);
  assert.ok(proposal.emoji.every(item => !releasedCodePoints.has(item.codePoints)), 'proposed emoji must not be released emoji');
}

for (const variation of ['skin-tones', 'hair', 'families', 'all']) {
  const variationEmoji = await importPackageDefault(`@lewismoten/emoji/variations/${variation}`);
  assert.ok(Object.keys(variationEmoji).every(key => key in emojiByKey), `${variation} export must only contain known keys`);
}

for (const item of [emoji[0], emoji.at(Math.floor(emoji.length / 2)), emoji.at(-1)]) {
  assert.ok(item, 'individual lookup test items must exist');
  assert.equal(allEmoji[item.key], item.emoji, `${item.key} must be available from the all export`);
}

console.info(`Verified ${emoji.length.toLocaleString()} emoji, ${manifest.versions.length} Unicode version files, and package entry points.`);
