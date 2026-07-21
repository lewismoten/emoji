import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type Emoji = {
  key: string;
  emoji: string;
  group: string;
};

type Version = {
  version: string;
  file: string;
  count: number;
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = async <T,>(file: string) => JSON.parse(await fs.readFile(path.join(root, file), 'utf8')) as T;
const importDefault = async (file: string) =>
  (await import(pathToFileURL(path.join(root, file)).href)).default as Record<string, string>;

const emoji = await readJson<Emoji[]>('emoji.json');
const manifest = await readJson<{ versions: Version[] }>('versions/manifest.json');
const emojiByKey = Object.fromEntries(emoji.map(item => [item.key, item.emoji]));
const browserEmoji = await importDefault('dist/esm/index.js');
const allEmoji = await importDefault('dist/esm/all.min.js');
const popularEmoji = await importDefault('dist/esm/popular.min.js');

assert.equal(new Set(emoji.map(item => item.key)).size, emoji.length, 'emoji keys must be unique');
assert.deepEqual(browserEmoji, emojiByKey, 'browser bundle must contain every emoji value');
assert.deepEqual(allEmoji, emojiByKey, 'all export must contain every emoji value');
assert.ok(Object.keys(popularEmoji).length > 0, 'popular export must not be empty');
assert.ok(Object.keys(popularEmoji).every(key => key in emojiByKey), 'popular export must only contain known keys');

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

for (const group of new Set(emoji.map(item => item.group))) {
  const category = group.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const categoryEmoji = await importDefault(`dist/esm/categories/${category}.min.js`);
  assert.ok(Object.keys(categoryEmoji).every(key => key in emojiByKey), `${group} export must only contain known keys`);
}

for (const variation of ['skin-tones', 'hair', 'families', 'all']) {
  const variationEmoji = await importDefault(`dist/esm/variations/${variation}.min.js`);
  assert.ok(Object.keys(variationEmoji).every(key => key in emojiByKey), `${variation} export must only contain known keys`);
}

for (const item of [emoji[0], emoji.at(Math.floor(emoji.length / 2)), emoji.at(-1)]) {
  assert.ok(item, 'individual export test items must exist');
  const individualEmoji = (await import(pathToFileURL(
    path.join(root, 'dist/esm/individual', `${item.key}.min.js`)
  ).href)).default;
  assert.equal(individualEmoji, item.emoji, `${item.key} individual export must match its emoji`);
}

console.info(`Verified ${emoji.length.toLocaleString()} emoji, ${manifest.versions.length} Unicode version files, and package entry points.`);
