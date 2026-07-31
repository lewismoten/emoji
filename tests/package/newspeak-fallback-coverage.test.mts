import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type UiLocale = Record<string, string>;

type SearchLocale = {
  baseLocale?: string;
  annotations: Record<string, string[]>;
  labels: Record<string, string>;
  subgroups: Record<string, string>;
};

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

const readJson = async <T,>(file: string) =>
  JSON.parse(await fs.readFile(path.join(root, file), "utf8")) as T;

function missingKeys(
  base: Record<string, unknown>,
  candidate: Record<string, unknown>,
) {
  return Object.keys(base)
    .filter((key) => !(key in candidate))
    .sort();
}

function blankStringKeys(values: Record<string, string>) {
  return Object.entries(values)
    .filter(([, value]) => value.trim().length === 0)
    .map(([key]) => key)
    .sort();
}

function blankAnnotationKeys(values: Record<string, string[]>) {
  return Object.entries(values)
    .filter(
      ([, value]) =>
        value.length === 0 || value.every((entry) => entry.trim().length === 0),
    )
    .map(([key]) => key)
    .sort();
}

const baseUi = await readJson<UiLocale>("src/demo-locales/ui.en.json");
const newspeakUi = await readJson<UiLocale>(
  "src/demo-locales/ui.en-x-newspeak.json",
);

assert.deepEqual(
  missingKeys(baseUi, newspeakUi),
  [],
  "ui.en-x-newspeak.json is missing UI keys and would fall back to English",
);

assert.deepEqual(
  blankStringKeys(newspeakUi),
  [],
  "ui.en-x-newspeak.json contains blank UI values",
);

const baseSearchLocale = await readJson<SearchLocale>(
  "src/data/locales/en.json",
);
const newspeakSearchLocale = await readJson<SearchLocale>(
  "src/data/locales/en-x-newspeak.json",
);

assert.equal(
  newspeakSearchLocale.baseLocale,
  "en",
  "en-x-newspeak.json should continue to declare English as its base fallback locale",
);

assert.deepEqual(
  missingKeys(baseSearchLocale.annotations, newspeakSearchLocale.annotations),
  [],
  "en-x-newspeak.json is missing annotation keys and would fall back to English",
);

assert.deepEqual(
  missingKeys(baseSearchLocale.labels, newspeakSearchLocale.labels),
  [],
  "en-x-newspeak.json is missing character-label keys and would fall back to English",
);

assert.deepEqual(
  missingKeys(baseSearchLocale.subgroups, newspeakSearchLocale.subgroups),
  [],
  "en-x-newspeak.json is missing subgroup keys and would fall back to English",
);

assert.deepEqual(
  blankAnnotationKeys(newspeakSearchLocale.annotations),
  [],
  "en-x-newspeak.json contains blank annotation values",
);

assert.deepEqual(
  blankStringKeys(newspeakSearchLocale.labels),
  [],
  "en-x-newspeak.json contains blank character-label values",
);

assert.deepEqual(
  blankStringKeys(newspeakSearchLocale.subgroups),
  [],
  "en-x-newspeak.json contains blank subgroup values",
);
