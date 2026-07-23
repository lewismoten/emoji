import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(workspace, '..');
const atlasDirectory = path.join(workspace, 'atlases');
const config = JSON.parse(await fs.readFile(path.join(workspace, 'config.json'), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.join(atlasDirectory, 'manifest.json'), 'utf8'));
const emoji = JSON.parse(await fs.readFile(path.join(root, 'emoji.json'), 'utf8'));
const excluded = new Set(config.excludedModifierCodePoints.map(point => point.toUpperCase()));
const eligible = emoji
  .filter(item => !item.codePoints.split(/\s+/).some(point => excluded.has(point.toUpperCase())));
const expectedKeys = new Set(eligible.map(item => item.key));
const expectedByKey = new Map(eligible.map(item => [item.key, item]));
const expectedSequenceTypeCounts = countBySequenceType(eligible);
const seenKeys = new Set();
let activeCount = 0;
let assignedCount = 0;

assert(manifest.cellSize === config.cellSize, 'Manifest cell size differs from config');
assert(manifest.columns === config.columns, 'Manifest column count differs from config');
assert(manifest.rows === config.rows, 'Manifest row count differs from config');
assert(
  manifest.sequenceGlyphCount === eligible.filter(item => item.sequenceType !== 'single').length,
  'Manifest sequence glyph count is incorrect'
);
assert(
  JSON.stringify(manifest.sequenceTypeCounts) === JSON.stringify(expectedSequenceTypeCounts),
  'Manifest sequence type counts are incorrect'
);

for (const sheet of manifest.sheets) {
  const sidecar = JSON.parse(await fs.readFile(path.join(atlasDirectory, sheet.mapping), 'utf8'));
  const image = await fs.readFile(path.join(atlasDirectory, sheet.image));
  const dimensions = readPngDimensions(image);
  assert(dimensions.width === config.columns * config.cellSize, `${sheet.image} has the wrong width`);
  assert(dimensions.height === config.rows * config.cellSize, `${sheet.image} has the wrong height`);
  assert(sidecar.id === sheet.id, `${sheet.mapping} has the wrong ID`);
  assert(sidecar.image === sheet.image, `${sheet.mapping} points to the wrong PNG`);
  assert(sidecar.entries.length <= config.glyphsPerAtlas, `${sheet.mapping} exceeds its capacity`);

  const indexes = new Set();
  for (const entry of sidecar.entries) {
    assert(!indexes.has(entry.index), `${sheet.mapping} repeats cell ${entry.index}`);
    indexes.add(entry.index);
    assert(entry.index >= 0 && entry.index < config.glyphsPerAtlas, `${entry.key} has an invalid cell`);
    assert(entry.row === Math.floor(entry.index / config.columns), `${entry.key} has an invalid row`);
    assert(entry.column === entry.index % config.columns, `${entry.key} has an invalid column`);
    assert(entry.x === entry.column * config.cellSize, `${entry.key} has an invalid x coordinate`);
    assert(entry.y === entry.row * config.cellSize, `${entry.key} has an invalid y coordinate`);
    assert(entry.width === config.cellSize && entry.height === config.cellSize, `${entry.key} has invalid bounds`);
    assert(!seenKeys.has(entry.key), `Emoji ${entry.key} is assigned more than once`);
    seenKeys.add(entry.key);
    assignedCount += 1;
    if (entry.active) {
      activeCount += 1;
      assert(expectedKeys.has(entry.key), `Active atlas entry ${entry.key} is not an eligible base emoji`);
      assert(
        !entry.codePoints.some(point => excluded.has(point.toUpperCase())),
        `Active atlas entry ${entry.key} contains an excluded modifier`
      );
      const expected = expectedByKey.get(entry.key);
      assert(entry.sequenceType === expected.sequenceType, `${entry.key} has the wrong sequence type`);
      const normalizedLength = entry.codePoints
        .filter(point => !['FE0E', 'FE0F'].includes(point.toUpperCase()))
        .length;
      assert(
        entry.sequenceType === 'single' ? normalizedLength === 1 : normalizedLength > 1,
        `${entry.key} has an invalid ${entry.sequenceType} sequence`
      );
    }
  }
}

for (const key of expectedKeys) {
  assert(seenKeys.has(key), `Eligible base emoji ${key} is missing from the atlases`);
}
assert(activeCount === manifest.activeGlyphCount, 'Manifest active glyph count is incorrect');
assert(assignedCount === manifest.assignedGlyphCount, 'Manifest assigned glyph count is incorrect');

console.log(
  `Verified ${activeCount.toLocaleString()} active base emoji in `
  + `${manifest.sheets.length} sprite atlases.`
);

function readPngDimensions(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert(buffer.subarray(0, 8).equals(signature), 'Atlas is not a PNG');
  assert(buffer.subarray(12, 16).toString('ascii') === 'IHDR', 'PNG is missing its IHDR chunk');
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countBySequenceType(entries) {
  return Object.fromEntries(
    [...new Set(entries.map(entry => entry.sequenceType))]
      .sort()
      .map(type => [type, entries.filter(entry => entry.sequenceType === type).length])
  );
}
