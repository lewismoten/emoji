import { loadAtlasValidationData } from "./atlas-validation/data.mjs";
import { assert } from "./atlas-validation/helpers.mjs";
import { validateAtlasSheet } from "./atlas-validation/sheet-validator.mjs";

const context = await loadAtlasValidationData();
const seenKeys = new Set();
let activeCount = 0;
let assignedCount = 0;
let imageCount = 0;

assert(
  context.manifest.cellSize === context.config.cellSize,
  "Manifest cell size differs from config",
);
assert(
  context.manifest.columns === context.config.columns,
  "Manifest column count differs from config",
);
assert(
  context.manifest.layout === "grouped-subgroups-v3",
  "Manifest does not use grouped subgroup sheets",
);
assert(
  context.manifest.author === context.config.author,
  "Manifest author differs from config",
);
assert(
  context.manifest.url === context.config.url,
  "Manifest URL differs from config",
);
assert(
  context.manifest.fontVersion === context.config.fontVersion,
  "Manifest font version differs from config",
);
assert(
  context.manifest.packageName === context.config.packageName,
  "Manifest package name differs from config",
);
assert(
  context.manifest.embeddingPermissions === "installable",
  "Font embedding permissions must remain installable",
);
assert(
  context.manifest.sequenceGlyphCount ===
    context.eligible.filter((item) => item.sequenceType !== "single").length,
  "Manifest sequence glyph count is incorrect",
);
assert(
  JSON.stringify(context.manifest.sequenceTypeCounts) ===
    JSON.stringify(context.expectedSequenceTypeCounts),
  "Manifest sequence type counts are incorrect",
);
assert(
  JSON.stringify(context.manifest.modifierTypeCounts) ===
    JSON.stringify(context.expectedModifierTypeCounts),
  "Manifest modifier type counts are incorrect",
);
assert(
  context.manifest.baseGlyphCount === context.expectedModifierTypeCounts.base,
  "Manifest base glyph count is incorrect",
);
assert(
  context.manifest.modifierGlyphCount ===
    context.eligible.length - context.expectedModifierTypeCounts.base,
  "Manifest modifier glyph count is incorrect",
);
assert(
  context.manifest.releasedGlyphCount === context.emoji.length,
  "Manifest released glyph count is incorrect",
);
assert(
  context.manifest.proposedGlyphCount === context.proposedEmoji.length,
  "Manifest proposed glyph count is incorrect",
);

for (const sheet of context.manifest.sheets) {
  const counts = await validateAtlasSheet(sheet, {
    ...context,
    seenKeys,
  });
  activeCount += counts.activeCount;
  assignedCount += counts.assignedCount;
  imageCount += counts.imageCount;
}

for (const key of context.expectedKeys) {
  assert(
    seenKeys.has(key),
    `Eligible emoji ${key} is missing from the atlases`,
  );
}
assert(
  activeCount === context.manifest.activeGlyphCount,
  "Manifest active glyph count is incorrect",
);
assert(
  assignedCount === context.manifest.assignedGlyphCount,
  "Manifest assigned glyph count is incorrect",
);

console.log(
  `Verified ${activeCount.toLocaleString()} active emoji in ` +
    `${context.manifest.sheets.length} atlas mappings; ${imageCount.toLocaleString()} PNG ` +
    `${imageCount === 1 ? "file contains" : "files contain"} artwork.`,
);
