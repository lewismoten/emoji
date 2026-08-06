import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Sheet = { id: string; image: string };

const root = process.cwd();
const read = (file: string) => fs.readFile(path.join(root, file), "utf8");
const readJson = async <T,>(file: string) => JSON.parse(await read(file)) as T;

describe("pixel-font/atlas-sidecars", () => {
  it("keeps atlas metadata and entries out of the service worker precache", async () => {
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
      expect(serviceWorker.includes(`"${mappingAsset}"`)).toBe(false);
      expect(serviceWorker.includes(`"${imageAsset}"`)).toBe(false);
      for (const field of sidecarFields) {
        expect(field in sidecar).toBe(false);
      }
      for (const entry of sidecar.entries) {
        for (const field of entryFields) {
          expect(field in entry).toBe(false);
        }
      }
      const imageExists = await fs
        .access(path.join(root, imageAsset))
        .then(() => true)
        .catch(() => false);
      if (atlasReadme.includes(`atlases/${sheet.image}`)) {
        expect(imageExists).toBe(true);
      }
    }
  });
});
