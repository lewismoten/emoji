import fs from "node:fs/promises";
import path from "node:path";

import { decodeRgbaPng } from "../png.mjs";
import {
  assert,
  assertCellPaddingTransparent,
  readPngDimensions,
} from "./helpers.mjs";

export async function validateAtlasSheet(sheet, context) {
  const mappingFile = `${sheet.id}.json`;
  const sidecar = JSON.parse(
    await fs.readFile(path.join(context.atlasDirectory, mappingFile), "utf8"),
  );
  validateSidecarMetadata(sheet, sidecar, context);
  const imageValidated = await validateSidecarImage(sidecar, sheet, context);
  const counts = validateSidecarEntries(sidecar, context);
  return {
    activeCount: counts.activeCount,
    assignedCount: counts.assignedCount,
    imageCount: imageValidated ? 1 : 0,
  };
}

function validateSidecarMetadata(sheet, sidecar, context) {
  const mappingFile = `${sheet.id}.json`;
  assert(sidecar.id === sheet.id, `${mappingFile} has the wrong ID`);
  assert(
    sidecar.modifierType === sheet.modifierType,
    `${mappingFile} has the wrong modifier type`,
  );
  assert(
    (sidecar.releaseStatus ?? "released") ===
      (sheet.releaseStatus ?? "released"),
    `${mappingFile} has the wrong release status`,
  );
  assert(
    sidecar.image === sheet.image,
    `${mappingFile} points to the wrong PNG`,
  );
  assert(sidecar.group === sheet.group, `${mappingFile} has the wrong group`);
  assert(
    sidecar.subGroup === sheet.subGroup,
    `${mappingFile} has the wrong subgroup`,
  );
  assert(
    sidecar.rows > 0 && sidecar.rows <= context.config.maxRows,
    `${mappingFile} has an invalid row count`,
  );
  assert(
    sidecar.entries.length <= context.config.columns * sidecar.rows,
    `${mappingFile} exceeds its capacity`,
  );
}

async function validateSidecarImage(sidecar, sheet, context) {
  try {
    const image = await fs.readFile(
      path.join(context.atlasDirectory, sheet.image),
    );
    const dimensions = readPngDimensions(image);
    const atlas = decodeRgbaPng(image);
    assert(
      dimensions.width === sidecar.imageWidth,
      `${sheet.image} has the wrong width`,
    );
    assert(
      dimensions.height === sidecar.imageHeight,
      `${sheet.image} has the wrong height`,
    );
    assert(
      atlas.pixels[3] === 255,
      `${sheet.image} must display an opaque branded header`,
    );
    assertCellPaddingTransparent(atlas, sidecar, {
      cellPadding: context.config.cellPadding,
      cellSize: context.config.cellSize,
      columns: context.config.columns,
      headerHeight: context.config.headerHeight,
      outerPadding: context.config.outerPadding,
      slotSize: context.manifest.slotSize,
    });
    return true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return false;
  }
}

function validateSidecarEntries(sidecar, context) {
  const indexes = new Set();
  let activeCount = 0;
  let assignedCount = 0;
  for (const entry of sidecar.entries) {
    validateEntryGeometry(entry, sidecar, indexes, context);
    validateEntryAssignment(entry, context);
    assignedCount += 1;
    if (!entry.active) continue;
    activeCount += 1;
    validateActiveEntry(entry, sidecar, context);
  }
  return { activeCount, assignedCount };
}

function validateEntryGeometry(entry, sidecar, indexes, context) {
  assert(
    !indexes.has(entry.index),
    `${sidecar.image} repeats cell ${entry.index}`,
  );
  indexes.add(entry.index);
  assert(
    entry.index >= 0 && entry.index < context.config.columns * sidecar.rows,
    `${entry.key} has an invalid cell`,
  );
  assert(
    entry.row === Math.floor(entry.index / context.config.columns),
    `${entry.key} has an invalid row`,
  );
  assert(
    entry.column === entry.index % context.config.columns,
    `${entry.key} has an invalid column`,
  );
  assert(
    entry.x ===
      context.config.outerPadding +
        entry.column * context.manifest.slotSize +
        context.config.cellPadding,
    `${entry.key} has an invalid x coordinate`,
  );
  assert(
    entry.y ===
      context.config.headerHeight +
        entry.row * context.manifest.slotSize +
        context.config.cellPadding,
    `${entry.key} has an invalid y coordinate`,
  );
  assert(
    entry.width === context.config.cellSize &&
      entry.height === context.config.cellSize,
    `${entry.key} has invalid bounds`,
  );
}

function validateEntryAssignment(entry, context) {
  assert(
    !context.seenKeys.has(entry.key),
    `Emoji ${entry.key} is assigned more than once`,
  );
  context.seenKeys.add(entry.key);
}

function validateActiveEntry(entry, sidecar, context) {
  assert(
    context.expectedKeys.has(entry.key),
    `Active atlas entry ${entry.key} is not an eligible emoji`,
  );
  assert(
    sidecar.modifierType ===
      context.getModifierType(context.expectedByKey.get(entry.key)),
    `Active atlas entry ${entry.key} has the wrong modifier type`,
  );
  const expected = context.expectedByKey.get(entry.key);
  assert(
    (sidecar.releaseStatus ?? "released") ===
      (expected.releaseStatus ?? "released"),
    `${entry.key} has the wrong release status`,
  );
  assert(
    (sidecar.unicodeVersion ?? null) ===
      (expected.releaseStatus === "proposed" ? expected.unicodeVersion : null),
    `${entry.key} has the wrong proposed Unicode version`,
  );
  assert(
    entry.sequenceType === expected.sequenceType,
    `${entry.key} has the wrong sequence type`,
  );
  assert(sidecar.group === expected.group, `${entry.key} has the wrong group`);
  assert(
    sidecar.subGroup === expected.subGroup,
    `${entry.key} has the wrong subgroup`,
  );
  const normalizedLength = entry.codePoints.filter(
    (point) => !["FE0E", "FE0F"].includes(point.toUpperCase()),
  ).length;
  assert(
    entry.sequenceType === "single"
      ? normalizedLength === 1
      : entry.sequenceType === "modifier"
        ? normalizedLength >= 1
        : normalizedLength > 1,
    `${entry.key} has an invalid ${entry.sequenceType} sequence`,
  );
}
