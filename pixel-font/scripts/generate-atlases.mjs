import fs from "node:fs/promises";
import path from "node:path";

import {
  assignBucket,
  loadPreviousAssignments,
} from "./generate-atlases/assignments.mjs";
import {
  buildBuckets,
  compareBuckets,
  createModifierTypeResolver,
} from "./generate-atlases/buckets.mjs";
import { loadAtlasGenerationContext } from "./generate-atlases/generate-atlases-context.mjs";
import {
  countByModifierType,
  countBySequenceType,
  writeJson,
} from "./generate-atlases/generate-atlases-helpers.mjs";
import { writeBucketAtlases } from "./generate-atlases/manifest.mjs";

const context = await loadAtlasGenerationContext();
const getModifierType = createModifierTypeResolver(context.config);
const eligible = [...context.emoji, ...context.proposedEmoji].sort(
  (left, right) =>
    left.order - right.order || left.key.localeCompare(right.key),
);
const eligibleByKey = new Map(eligible.map((item) => [item.key, item]));

await fs.mkdir(context.atlasDirectory, { recursive: true });
const previousAssignments = await loadPreviousAssignments(
  context.atlasDirectory,
  context.sheetCapacity,
);
const buckets = buildBuckets(eligible, getModifierType);
const manifestSheets = [];

for (const bucket of [...buckets.values()].sort(compareBuckets)) {
  manifestSheets.push(
    ...(await writeBucketAtlases({
      assignBucket,
      atlasDirectory: context.atlasDirectory,
      bucket,
      config: context.config,
      eligibleByKey,
      imageWidth: context.imageWidth,
      previousAssignments,
      sheetCapacity: context.sheetCapacity,
    })),
  );
}

const manifest = {
  schemaVersion: context.config.schemaVersion,
  familyName: context.config.familyName,
  fontVersion: context.config.fontVersion,
  packageName: context.config.packageName,
  setName: context.config.setName,
  author: context.config.author,
  url: context.config.url,
  createdDate: context.config.createdDate,
  copyright: context.config.copyright,
  license: context.config.license,
  licenseUrl: context.config.licenseUrl,
  embeddingPermissions: context.config.embeddingPermissions,
  kind: "grouped-subgroups-with-modifier-atlases",
  layout: "grouped-subgroups-v3",
  cellSize: context.config.cellSize,
  cellPadding: context.config.cellPadding,
  slotSize: context.slotSize,
  columns: context.config.columns,
  maxRows: context.config.maxRows,
  outerPadding: context.config.outerPadding,
  headerHeight: context.config.headerHeight,
  footerHeight: context.config.footerHeight,
  activeGlyphCount: eligible.length,
  releasedGlyphCount: context.emoji.length,
  proposedGlyphCount: context.proposedEmoji.length,
  proposedVersions: (context.versionManifest.proposed ?? []).map((version) => ({
    version: version.version,
    status: version.status,
    stage: version.stage ?? version.status,
    expectedRelease: version.expectedRelease ?? null,
    count: context.proposedEmoji.filter(
      (item) => item.unicodeVersion === version.version,
    ).length,
  })),
  baseGlyphCount: eligible.filter((item) => getModifierType(item) === "base")
    .length,
  modifierGlyphCount: eligible.filter(
    (item) => getModifierType(item) !== "base",
  ).length,
  modifierTypeCounts: countByModifierType(eligible, getModifierType),
  sequenceGlyphCount: eligible.filter((item) => item.sequenceType !== "single")
    .length,
  sequenceTypeCounts: countBySequenceType(eligible),
  assignedGlyphCount: manifestSheets.reduce(
    (total, sheet) => total + sheet.assignedCount,
    0,
  ),
  groupCount: new Set(eligible.map((item) => item.group)).size,
  subGroupCount: buckets.size,
  sheets: manifestSheets,
};

await writeJson(path.join(context.atlasDirectory, "manifest.json"), manifest);

console.log(
  `Mapped ${eligible.length.toLocaleString()} emoji into ${manifestSheets.length} ` +
    `subgroup atlas mappings across ${manifest.groupCount} groups.`,
);
