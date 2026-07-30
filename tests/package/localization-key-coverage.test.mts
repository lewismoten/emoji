import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type UiLocale = Record<string, string>;

type SearchLocale = {
  locale: string;
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
  return Object.keys(base).filter((key) => !(key in candidate)).sort();
}

function extraKeys(
  base: Record<string, unknown>,
  candidate: Record<string, unknown>,
) {
  return Object.keys(candidate).filter((key) => !(key in base)).sort();
}

const baseUi = await readJson<UiLocale>("src/demo-locales/ui.en.json");
for (const file of [
  "ui.ar.json",
  "ui.en-x-newspeak.json",
  "ui.es.json",
  "ui.hi.json",
  "ui.zh.json",
]) {
  const locale = await readJson<UiLocale>(`src/demo-locales/${file}`);
  assert.deepEqual(
    missingKeys(baseUi, locale),
    [],
    `${file} is missing UI keys required by ui.en.json`,
  );
  assert.deepEqual(
    extraKeys(baseUi, locale),
    [],
    `${file} contains UI keys that do not exist in ui.en.json`,
  );
}

const baseSearchLocale = await readJson<SearchLocale>("src/data/locales/en.json");
for (const file of [
  "ar.json",
  "en-x-newspeak.json",
  "es.json",
  "hi.json",
  "zh.json",
]) {
  const locale = await readJson<SearchLocale>(`src/data/locales/${file}`);
  assert.deepEqual(
    missingKeys(baseSearchLocale.annotations, locale.annotations),
    [],
    `${file} is missing annotation keys required by en.json`,
  );
  assert.deepEqual(
    extraKeys(baseSearchLocale.annotations, locale.annotations),
    [],
    `${file} contains annotation keys that do not exist in en.json`,
  );
  assert.deepEqual(
    missingKeys(baseSearchLocale.labels, locale.labels),
    [],
    `${file} is missing character label keys required by en.json`,
  );
  assert.deepEqual(
    extraKeys(baseSearchLocale.labels, locale.labels),
    [],
    `${file} contains character label keys that do not exist in en.json`,
  );
  assert.deepEqual(
    missingKeys(baseSearchLocale.subgroups, locale.subgroups),
    [],
    `${file} is missing subgroup keys required by en.json`,
  );
  assert.deepEqual(
    extraKeys(baseSearchLocale.subgroups, locale.subgroups),
    [],
    `${file} contains subgroup keys that do not exist in en.json`,
  );
}
