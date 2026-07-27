import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readEmojiJson } from "../shared/emoji-data.mjs";

type LocalePack = {
  locale: string;
  baseLocale?: string;
  label: string;
  nativeLabel: string;
  rtl: boolean;
  cldrVersion: string;
  annotations: Record<string, string[]>;
  labels: Record<string, string>;
  subgroups: Record<string, string>;
};
type LocaleEntry = {
  locale: string;
  label: string;
  nativeLabel: string;
  rtl: boolean;
  baseLocale?: string;
  count: number;
  totalCount: number;
  characterLabelCount: number;
  totalCharacterLabelCount: number;
  subgroupLabelCount: number;
  cldrVersion: string;
};

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const readJson = async <T,>(file: string) =>
  JSON.parse(await fs.readFile(path.join(root, file), "utf8")) as T;
const require = createRequire(import.meta.url);
const knownEmoji = new Set((await readEmojiJson(root)).map((item) => item.key));
const localeManifest = await readJson<{ locales: LocaleEntry[] }>(
  "src/data/locales/manifest.json",
);

assert.deepEqual(
  localeManifest.locales.map((locale) => locale.locale),
  ["ar", "en", "en-GB", "es", "hi", "zh"],
);
assert.deepEqual(require("@lewismoten/emoji/locales/manifest"), localeManifest);
for (const locale of localeManifest.locales) {
  const pack = require(
    `@lewismoten/emoji/locales/${locale.locale}`,
  ) as LocalePack;
  assert.equal(pack.locale, locale.locale);
  assert.equal(pack.label, locale.label);
  assert.equal(pack.nativeLabel, locale.nativeLabel);
  assert.equal(pack.rtl, locale.rtl);
  assert.equal(pack.cldrVersion, locale.cldrVersion);
  assert.equal(pack.baseLocale, locale.baseLocale);
  assert.equal(Object.keys(pack.annotations).length, locale.count);
  assert.equal(Object.keys(pack.labels).length, locale.characterLabelCount);
  assert.equal(Object.keys(pack.subgroups).length, locale.subgroupLabelCount);
  assert.ok(locale.count > 0 || locale.characterLabelCount > 0);
  if (!locale.baseLocale) assert.ok(locale.characterLabelCount > 0);
  assert.ok(Object.keys(pack.annotations).every((key) => knownEmoji.has(key)));
}

const { createEmojiSearch, mergeEmojiLocalePacks } =
  await import("@lewismoten/emoji/search");
const searchEnglish = createEmojiSearch(
  require("@lewismoten/emoji/locales/en") as LocalePack,
);
assert.ok(searchEnglish("artist palette").includes("artistPalette"));
assert.ok(searchEnglish("painting").includes("artistPalette"));
for (const locale of localeManifest.locales.filter(
  (entry) => entry.baseLocale,
)) {
  const base = require(
    `@lewismoten/emoji/locales/${locale.baseLocale}`,
  ) as LocalePack;
  const regional = require(
    `@lewismoten/emoji/locales/${locale.locale}`,
  ) as LocalePack;
  const merged = mergeEmojiLocalePacks(base, regional);
  assert.equal(Object.keys(merged.annotations).length, locale.totalCount);
  assert.equal(
    Object.keys(merged.labels ?? {}).length,
    locale.totalCharacterLabelCount,
  );
}
