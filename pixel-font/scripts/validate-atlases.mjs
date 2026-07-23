import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodeRgbaPng } from "./png.mjs";

const workspace = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const root = path.resolve(workspace, "..");
const atlasDirectory = path.join(workspace, "atlases");
const config = JSON.parse(
  await fs.readFile(path.join(workspace, "config.json"), "utf8"),
);
const manifest = JSON.parse(
  await fs.readFile(path.join(atlasDirectory, "manifest.json"), "utf8"),
);
const emoji = JSON.parse(
  await fs.readFile(path.join(root, "emoji.json"), "utf8"),
);
const excluded = new Set(
  config.excludedModifierCodePoints.map((point) => point.toUpperCase()),
);
const eligible = emoji.filter(
  (item) =>
    !item.codePoints
      .split(/\s+/)
      .some((point) => excluded.has(point.toUpperCase())),
);
const expectedKeys = new Set(eligible.map((item) => item.key));
const expectedByKey = new Map(eligible.map((item) => [item.key, item]));
const expectedSequenceTypeCounts = countBySequenceType(eligible);
const seenKeys = new Set();
let activeCount = 0;
let assignedCount = 0;
let imageCount = 0;

assert(
  manifest.cellSize === config.cellSize,
  "Manifest cell size differs from config",
);
assert(
  manifest.columns === config.columns,
  "Manifest column count differs from config",
);
assert(
  manifest.layout === "grouped-subgroups-v1",
  "Manifest does not use grouped subgroup sheets",
);
assert(
  manifest.author === config.author,
  "Manifest author differs from config",
);
assert(manifest.url === config.url, "Manifest URL differs from config");
assert(
  manifest.sequenceGlyphCount ===
    eligible.filter((item) => item.sequenceType !== "single").length,
  "Manifest sequence glyph count is incorrect",
);
assert(
  JSON.stringify(manifest.sequenceTypeCounts) ===
    JSON.stringify(expectedSequenceTypeCounts),
  "Manifest sequence type counts are incorrect",
);

for (const sheet of manifest.sheets) {
  const sidecar = JSON.parse(
    await fs.readFile(path.join(atlasDirectory, sheet.mapping), "utf8"),
  );
  assert(sidecar.id === sheet.id, `${sheet.mapping} has the wrong ID`);
  assert(
    sidecar.image === sheet.image,
    `${sheet.mapping} points to the wrong PNG`,
  );
  assert(sidecar.group === sheet.group, `${sheet.mapping} has the wrong group`);
  assert(
    sidecar.subGroup === sheet.subGroup,
    `${sheet.mapping} has the wrong subgroup`,
  );
  assert(
    sidecar.author === config.author,
    `${sheet.mapping} has the wrong author`,
  );
  assert(sidecar.url === config.url, `${sheet.mapping} has the wrong URL`);
  assert(
    sidecar.rows > 0 && sidecar.rows <= config.maxRows,
    `${sheet.mapping} has an invalid row count`,
  );
  assert(
    sidecar.entries.length <= sidecar.capacity,
    `${sheet.mapping} exceeds its capacity`,
  );
  assert(
    sidecar.capacity === sidecar.columns * sidecar.rows,
    `${sheet.mapping} has the wrong capacity`,
  );
  try {
    const image = await fs.readFile(path.join(atlasDirectory, sheet.image));
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
    assertCellPaddingTransparent(atlas, sidecar);
    imageCount += 1;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const indexes = new Set();
  for (const entry of sidecar.entries) {
    assert(
      !indexes.has(entry.index),
      `${sheet.mapping} repeats cell ${entry.index}`,
    );
    indexes.add(entry.index);
    assert(
      entry.index >= 0 && entry.index < sidecar.capacity,
      `${entry.key} has an invalid cell`,
    );
    assert(
      entry.row === Math.floor(entry.index / config.columns),
      `${entry.key} has an invalid row`,
    );
    assert(
      entry.column === entry.index % config.columns,
      `${entry.key} has an invalid column`,
    );
    assert(
      entry.x ===
        config.outerPadding +
          entry.column * sidecar.slotSize +
          config.cellPadding,
      `${entry.key} has an invalid x coordinate`,
    );
    assert(
      entry.y ===
        config.headerHeight + entry.row * sidecar.slotSize + config.cellPadding,
      `${entry.key} has an invalid y coordinate`,
    );
    assert(
      entry.width === config.cellSize && entry.height === config.cellSize,
      `${entry.key} has invalid bounds`,
    );
    assert(
      !seenKeys.has(entry.key),
      `Emoji ${entry.key} is assigned more than once`,
    );
    seenKeys.add(entry.key);
    assignedCount += 1;
    if (entry.active) {
      activeCount += 1;
      assert(
        expectedKeys.has(entry.key),
        `Active atlas entry ${entry.key} is not an eligible base emoji`,
      );
      assert(
        !entry.codePoints.some((point) => excluded.has(point.toUpperCase())),
        `Active atlas entry ${entry.key} contains an excluded modifier`,
      );
      const expected = expectedByKey.get(entry.key);
      assert(
        entry.sequenceType === expected.sequenceType,
        `${entry.key} has the wrong sequence type`,
      );
      assert(
        entry.group === expected.group,
        `${entry.key} has the wrong group`,
      );
      assert(
        entry.subGroup === expected.subGroup,
        `${entry.key} has the wrong subgroup`,
      );
      const normalizedLength = entry.codePoints.filter(
        (point) => !["FE0E", "FE0F"].includes(point.toUpperCase()),
      ).length;
      assert(
        entry.sequenceType === "single"
          ? normalizedLength === 1
          : normalizedLength > 1,
        `${entry.key} has an invalid ${entry.sequenceType} sequence`,
      );
    }
  }
}

for (const key of expectedKeys) {
  assert(
    seenKeys.has(key),
    `Eligible base emoji ${key} is missing from the atlases`,
  );
}
assert(
  activeCount === manifest.activeGlyphCount,
  "Manifest active glyph count is incorrect",
);
assert(
  assignedCount === manifest.assignedGlyphCount,
  "Manifest assigned glyph count is incorrect",
);

console.log(
  `Verified ${activeCount.toLocaleString()} active base emoji in ` +
    `${manifest.sheets.length} atlas mappings; ${imageCount.toLocaleString()} PNG ` +
    `${imageCount === 1 ? "file contains" : "files contain"} artwork.`,
);

function readPngDimensions(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert(buffer.subarray(0, 8).equals(signature), "Atlas is not a PNG");
  assert(
    buffer.subarray(12, 16).toString("ascii") === "IHDR",
    "PNG is missing its IHDR chunk",
  );
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertCellPaddingTransparent(atlas, sidecar) {
  for (let row = 0; row < sidecar.rows; row += 1) {
    for (let column = 0; column < sidecar.columns; column += 1) {
      const slotX = config.outerPadding + column * sidecar.slotSize;
      const slotY = config.headerHeight + row * sidecar.slotSize;
      for (let y = 0; y < sidecar.slotSize; y += 1) {
        for (let x = 0; x < sidecar.slotSize; x += 1) {
          const artwork =
            x >= config.cellPadding &&
            x < config.cellPadding + config.cellSize &&
            y >= config.cellPadding &&
            y < config.cellPadding + config.cellSize;
          if (artwork) continue;
          const alpha =
            atlas.pixels[((slotY + y) * atlas.width + slotX + x) * 4 + 3];
          assert(
            alpha === 0,
            `${sidecar.image} has artwork in transparent cell padding`,
          );
        }
      }
    }
  }
}

function countBySequenceType(entries) {
  return Object.fromEntries(
    [...new Set(entries.map((entry) => entry.sequenceType))]
      .sort()
      .map((type) => [
        type,
        entries.filter((entry) => entry.sequenceType === type).length,
      ]),
  );
}
