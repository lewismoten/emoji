import assert from "node:assert/strict";

import {
  emoji,
  manifest,
  pixelAtlasManifest,
} from "../shared/unit-fixtures.mjs";

assert.equal(
  pixelAtlasManifest.layout,
  "grouped-subgroups-v3",
  "pixel atlases must use the grouped subgroup layout",
);
assert.equal(
  pixelAtlasManifest.author,
  "Lewis Moten",
  "pixel atlas metadata must identify its author",
);
assert.equal(
  pixelAtlasManifest.url,
  "https://lewismoten.com",
  "pixel atlas metadata must identify its source URL",
);
assert.equal(
  pixelAtlasManifest.cellSize,
  12,
  "pixel atlas artwork must use 12-pixel cells",
);
assert.equal(
  pixelAtlasManifest.cellPadding,
  2,
  "pixel atlas cells must have two transparent pixels of padding per side",
);
assert.equal(
  pixelAtlasManifest.slotSize,
  pixelAtlasManifest.cellSize + pixelAtlasManifest.cellPadding * 2,
  "pixel atlas slot size must include transparent padding on both sides",
);
assert.ok(
  pixelAtlasManifest.groupCount > 1,
  "pixel atlases must be divided into Unicode groups",
);
assert.ok(
  pixelAtlasManifest.subGroupCount > pixelAtlasManifest.groupCount,
  "pixel atlases must be divided into Unicode subgroups",
);
assert.equal(
  pixelAtlasManifest.activeGlyphCount,
  emoji.length + pixelAtlasManifest.proposedGlyphCount,
  "pixel atlases must assign released and proposed emoji",
);
assert.equal(
  pixelAtlasManifest.releasedGlyphCount,
  emoji.length,
  "pixel atlases must distinguish released emoji",
);
assert.equal(
  pixelAtlasManifest.proposedGlyphCount,
  (manifest.proposed ?? []).reduce(
    (count, version) => count + version.count,
    0,
  ),
  "pixel atlases must distinguish every proposed emoji",
);
assert.equal(
  pixelAtlasManifest.baseGlyphCount + pixelAtlasManifest.modifierGlyphCount,
  pixelAtlasManifest.activeGlyphCount,
  "pixel atlas base and modifier counts must cover every emoji",
);
assert.ok(
  pixelAtlasManifest.modifierTypeCounts["skin-tone"] > 0 &&
    pixelAtlasManifest.modifierTypeCounts.hair > 0 &&
    pixelAtlasManifest.modifierTypeCounts["skin-and-hair"] > 0,
  "pixel atlases must provide skin-tone, hair, and combined modifier sets",
);
assert.ok(
  pixelAtlasManifest.sheets.some(
    (sheet) =>
      sheet.modifierType === "skin-tone" &&
      sheet.id.startsWith("modifiers/skin-tone/"),
  ),
  "skin-tone emoji must use separate modifier atlas paths",
);
for (const version of manifest.proposed ?? []) {
  assert.ok(
    pixelAtlasManifest.sheets.some(
      (sheet) =>
        sheet.releaseStatus === "proposed" &&
        sheet.unicodeVersion === version.version &&
        sheet.id.startsWith(`proposed/${version.version}/`),
    ),
    `proposed Emoji ${version.version} must use versioned atlas paths`,
  );
}
assert.ok(
  pixelAtlasManifest.sheets.every(
    (sheet) =>
      sheet.image.includes("/") &&
      sheet.id.includes("/") &&
      sheet.group &&
      sheet.subGroup &&
      sheet.rows >= 1 &&
      sheet.rows <= pixelAtlasManifest.maxRows &&
      sheet.assignedCount <= pixelAtlasManifest.columns * sheet.rows,
  ),
  "every pixel atlas sheet must be grouped, labeled, compact, and within capacity",
);
assert.ok(
  new Set(pixelAtlasManifest.sheets.map((sheet) => sheet.imageHeight)).size > 1,
  "pixel atlas sheets must use variable heights instead of a fixed 16-row canvas",
);
