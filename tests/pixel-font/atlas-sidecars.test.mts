import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Sheet = { id: string; image: string };

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const read = (file: string) => fs.readFile(path.join(root, file), "utf8");
const readJson = async <T,>(file: string) => JSON.parse(await read(file)) as T;
const manifest = await readJson<{ sheets: Sheet[] }>(
  "pixel-font/atlases/manifest.json",
);
const [serviceWorker, atlasReadme, sidecars] = await Promise.all([
  read("build/demo-pages/service-worker.js"),
  read("pixel-font/ATLASES.md"),
  Promise.all(
    manifest.sheets.map((sheet) =>
      readJson<{
        entries: Record<string, unknown>[];
        [key: string]: unknown;
      }>(`pixel-font/atlases/${sheet.id}.json`),
    ),
  ),
]);
const sidecarFields = [
  "setName",
  "author",
  "url",
  "createdDate",
  "cellSize",
  "cellPadding",
  "slotSize",
  "columns",
  "headerHeight",
  "footerHeight",
];
const entryFields = [
  "group",
  "subGroup",
  "modifierType",
  "releaseStatus",
  "unicodeVersion",
  "proposalStage",
  "expectedRelease",
];

for (const [index, sheet] of manifest.sheets.entries()) {
  const sidecar = sidecars[index];
  const mappingAsset = `./pixel-font/atlases/${sheet.id}.json`;
  const imageAsset = `./pixel-font/atlases/${sheet.image}`;
  assert.ok(
    !serviceWorker.includes(`"${mappingAsset}"`),
    `${mappingAsset} must load on demand`,
  );
  assert.ok(
    !serviceWorker.includes(`"${imageAsset}"`),
    `${imageAsset} must load on demand`,
  );
  for (const field of sidecarFields) {
    assert.ok(!(field in sidecar), `${sheet.id}.json must inherit ${field}`);
  }
  for (const entry of sidecar.entries) {
    for (const field of entryFields) {
      assert.ok(!(field in entry), `${sheet.id}.json entries inherit ${field}`);
    }
  }
  const imageExists = await fs
    .access(path.join(root, imageAsset))
    .then(() => true)
    .catch(() => false);
  if (imageExists) assert.ok(atlasReadme.includes(`atlases/${sheet.image}`));
}
