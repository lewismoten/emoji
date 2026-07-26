import fs from "node:fs/promises";
import path from "node:path";
import { format } from "prettier";

export function slug(value) {
  return value
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const json = await format(JSON.stringify(value), { parser: "json" });
  await fs.writeFile(file, json);
}

export function countBySequenceType(entries) {
  return Object.fromEntries(
    [...new Set(entries.map((entry) => entry.sequenceType))]
      .sort()
      .map((type) => [
        type,
        entries.filter((entry) => entry.sequenceType === type).length,
      ]),
  );
}

export function countByModifierType(entries, getModifierType) {
  return Object.fromEntries(
    ["base", "skin-tone", "hair", "skin-and-hair"].map((type) => [
      type,
      entries.filter((entry) => getModifierType(entry) === type).length,
    ]),
  );
}
