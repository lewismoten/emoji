import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  cropRgba,
  decodeRgbaPng,
  encodeRgbaPng,
  hasVisiblePixels,
} from "../png.mjs";
import { isBlackSilhouette, renderSvg } from "./renderers.mjs";

const PRIVATE_USE_START = 0xf0000;
const PRIVATE_USE_END = 0xffffd;

export async function collectGlyphArtifacts(context) {
  const manifest = { ...context.atlasManifest, ...context.config };
  const glyphs = [];
  const editorGlyphs = {};
  const paintedAtlasSheets = [];

  for (const sheet of manifest.sheets) {
    const mapping = JSON.parse(
      await fs.readFile(path.join(context.atlasDirectory, sheet.mapping), "utf8"),
    );
    const atlas = await readAtlasImage(context, sheet.image);
    const paintedCount = await collectSheetGlyphs({
      atlas,
      context,
      editorGlyphs,
      glyphs,
      mapping,
      sheet,
    });
    if (atlas && paintedCount > 0) paintedAtlasSheets.push({ ...sheet, paintedCount });
  }

  assignPrivateUseCodePoints(glyphs);
  for (const glyph of glyphs) {
    editorGlyphs[glyph.key].privateUseCodePoint = glyph.privateUseCodePoint;
  }

  return { editorGlyphs, glyphs, manifest, paintedAtlasSheets };
}

async function collectSheetGlyphs(options) {
  let paintedCount = 0;
  for (const entry of options.mapping.entries.filter((item) => item.active)) {
    const cell = options.atlas
      ? cropRgba(options.atlas, entry.x, entry.y, entry.width, entry.height)
      : emptyCell(entry);
    const painted = Boolean(options.atlas && hasVisiblePixels(cell));
    options.editorGlyphs[entry.key] = createEditorGlyph(entry, options, painted);
    if (!painted) continue;
    paintedCount += 1;
    await writeGlyphArtifacts(entry, cell, options);
  }
  return paintedCount;
}

async function writeGlyphArtifacts(entry, cell, options) {
  const rendering = isBlackSilhouette(cell) ? "silhouette" : "color";
  const png = `${entry.key}.png`;
  const svg = `${entry.key}.svg`;
  if (!options.context.fontsOnly) {
    await fs.writeFile(path.join(options.context.pngDirectory, png), encodeRgbaPng(cell));
    await fs.writeFile(
      path.join(options.context.svgDirectory, svg),
      renderSvg(cell, entry, rendering),
    );
  }
  options.glyphs.push({
    key: entry.key,
    name: entry.name,
    emoji: entry.emoji,
    codePoints: entry.codePoints,
    sequenceType: entry.sequenceType,
    releaseStatus: options.mapping.releaseStatus ?? "released",
    unicodeVersion: options.mapping.unicodeVersion ?? null,
    proposalStage: options.mapping.proposalStage ?? null,
    expectedRelease: options.mapping.expectedRelease ?? null,
    rendering,
    atlas: options.sheet.id,
    atlasImage: options.sheet.image,
    atlasWidth: options.mapping.imageWidth,
    atlasHeight: options.mapping.imageHeight,
    index: entry.index,
    row: entry.row,
    column: entry.column,
    x: entry.x,
    y: entry.y,
    width: entry.width,
    height: entry.height,
    ...(!options.context.fontsOnly ? { png: `png/${png}`, svg: `svg/${svg}` } : {}),
    pixels: [...cell.pixels],
  });
}

function createEditorGlyph(entry, options, painted) {
  return {
    key: entry.key,
    name: entry.name,
    emoji: entry.emoji,
    atlas: options.sheet.image,
    atlasWidth: options.mapping.imageWidth,
    atlasHeight: options.mapping.imageHeight,
    index: entry.index,
    row: entry.row,
    column: entry.column,
    x: entry.x,
    y: entry.y,
    width: entry.width,
    height: entry.height,
    codePoints: entry.codePoints,
    sequenceType: entry.sequenceType,
    group: options.mapping.group,
    subGroup: options.mapping.subGroup,
    part: options.mapping.part,
    partCount: options.mapping.partCount,
    modifierType: options.mapping.modifierType,
    releaseStatus: options.mapping.releaseStatus ?? "released",
    unicodeVersion: options.mapping.unicodeVersion ?? null,
    proposalStage: options.mapping.proposalStage ?? null,
    expectedRelease: options.mapping.expectedRelease ?? null,
    painted,
  };
}

async function readAtlasImage(context, imageFile) {
  try {
    return decodeRgbaPng(await fs.readFile(path.join(context.atlasDirectory, imageFile)));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return null;
  }
}

function emptyCell(entry) {
  return {
    width: entry.width,
    height: entry.height,
    pixels: Buffer.alloc(entry.width * entry.height * 4),
  };
}

export function normalizedCodePoints(glyph) {
  return glyph.codePoints.filter(
    (codePoint) => codePoint !== "FE0E" && codePoint !== "FE0F",
  );
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

export function assignPrivateUseCodePoints(entries) {
  const rangeSize = PRIVATE_USE_END - PRIVATE_USE_START + 1;
  const assigned = new Set();
  for (const entry of [...entries].sort((left, right) => left.key.localeCompare(right.key))) {
    const digest = createHash("sha256").update(entry.key).digest();
    let point = PRIVATE_USE_START + (digest.readUInt32BE(0) % rangeSize);
    while (assigned.has(point)) {
      point = point === PRIVATE_USE_END ? PRIVATE_USE_START : point + 1;
    }
    assigned.add(point);
    entry.privateUseCodePoint = point.toString(16).toUpperCase();
  }
}

export function coverageEntry(version, keys, paintedKeys) {
  const paintedGlyphCount = keys.filter((key) => paintedKeys.has(key)).length;
  const trackedGlyphCount = keys.length;
  return {
    version: version.version,
    ...(version.released ? { released: version.released } : {}),
    ...(version.status ? { status: version.status } : {}),
    ...(version.stage ? { stage: version.stage } : {}),
    ...(version.expectedRelease ? { expectedRelease: version.expectedRelease } : {}),
    trackedGlyphCount,
    paintedGlyphCount,
    coverage:
      trackedGlyphCount === 0
        ? 0
        : Number(((paintedGlyphCount / trackedGlyphCount) * 100).toFixed(1)),
    complete: paintedGlyphCount === trackedGlyphCount,
  };
}

