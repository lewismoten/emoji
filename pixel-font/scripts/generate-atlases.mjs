import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(workspace, '..');
const atlasDirectory = path.join(workspace, 'atlases');
const config = JSON.parse(await fs.readFile(path.join(workspace, 'config.json'), 'utf8'));
const emoji = JSON.parse(await fs.readFile(path.join(root, 'emoji.json'), 'utf8'));
const excluded = new Set(config.excludedModifierCodePoints.map(point => point.toUpperCase()));
const eligible = emoji
  .filter(item => !item.codePoints.split(/\s+/).some(point => excluded.has(point.toUpperCase())))
  .sort((left, right) => left.order - right.order || left.key.localeCompare(right.key));
const eligibleByKey = new Map(eligible.map(item => [item.key, item]));

await fs.mkdir(atlasDirectory, { recursive: true });

const sidecarPattern = new RegExp(`^${config.atlasPrefix}-(\\d{3})\\.json$`);
const existingFiles = (await fs.readdir(atlasDirectory)).filter(file => sidecarPattern.test(file)).sort();
const assignments = new Map();
const occupied = new Set();

for (const file of existingFiles) {
  const sheet = Number(file.match(sidecarPattern)[1]);
  const sidecar = JSON.parse(await fs.readFile(path.join(atlasDirectory, file), 'utf8'));
  for (const entry of sidecar.entries ?? []) {
    const globalIndex = sheet * config.glyphsPerAtlas + entry.index;
    if (assignments.has(entry.key)) throw new Error(`Duplicate atlas assignment for ${entry.key}`);
    if (occupied.has(globalIndex)) throw new Error(`Duplicate atlas cell ${globalIndex}`);
    assignments.set(entry.key, { globalIndex, previous: entry });
    occupied.add(globalIndex);
  }
}

let nextCell = 0;
for (const item of eligible) {
  if (assignments.has(item.key)) continue;
  while (occupied.has(nextCell)) nextCell += 1;
  assignments.set(item.key, { globalIndex: nextCell, previous: undefined });
  occupied.add(nextCell);
}

const allAssignments = [...assignments.entries()]
  .map(([key, assignment]) => ({ key, ...assignment }))
  .sort((left, right) => left.globalIndex - right.globalIndex);
const highestCell = allAssignments.at(-1)?.globalIndex ?? -1;
const sheetCount = Math.ceil((highestCell + 1) / config.glyphsPerAtlas);
const width = config.columns * config.cellSize;
const height = config.rows * config.cellSize;
const manifestSheets = [];

for (let sheet = 0; sheet < sheetCount; sheet += 1) {
  const id = `${config.atlasPrefix}-${String(sheet).padStart(3, '0')}`;
  const image = `${id}.png`;
  const mapping = `${id}.json`;
  const entries = allAssignments
    .filter(assignment => Math.floor(assignment.globalIndex / config.glyphsPerAtlas) === sheet)
    .map(assignment => {
      const item = eligibleByKey.get(assignment.key);
      const index = assignment.globalIndex % config.glyphsPerAtlas;
      const row = Math.floor(index / config.columns);
      const column = index % config.columns;
      const previous = assignment.previous ?? {};
      return {
        index,
        row,
        column,
        x: column * config.cellSize,
        y: row * config.cellSize,
        width: config.cellSize,
        height: config.cellSize,
        key: assignment.key,
        name: item?.shortName ?? previous.name ?? assignment.key,
        emoji: item?.emoji ?? previous.emoji ?? '',
        codePoints: item?.codePoints.split(/\s+/) ?? previous.codePoints ?? [],
        group: item?.group ?? previous.group ?? '',
        subGroup: item?.subGroup ?? previous.subGroup ?? '',
        order: item?.order ?? previous.order ?? null,
        sequenceType: item?.sequenceType ?? previous.sequenceType ?? '',
        active: Boolean(item)
      };
    });
  const sidecar = {
    schemaVersion: config.schemaVersion,
    id,
    image,
    cellSize: config.cellSize,
    columns: config.columns,
    rows: config.rows,
    capacity: config.glyphsPerAtlas,
    entries
  };
  await writeJson(path.join(atlasDirectory, mapping), sidecar);

  const imagePath = path.join(atlasDirectory, image);
  try {
    await fs.access(imagePath);
  } catch {
    await fs.writeFile(imagePath, transparentPng(width, height));
  }

  manifestSheets.push({
    id,
    image,
    mapping,
    activeCount: entries.filter(entry => entry.active).length,
    assignedCount: entries.length,
    capacity: config.glyphsPerAtlas
  });
}

const manifest = {
  schemaVersion: config.schemaVersion,
  familyName: config.familyName,
  kind: 'base-without-skin-or-hair-modifiers',
  cellSize: config.cellSize,
  columns: config.columns,
  rows: config.rows,
  glyphsPerAtlas: config.glyphsPerAtlas,
  activeGlyphCount: eligible.length,
  assignedGlyphCount: assignments.size,
  excludedGlyphCount: emoji.length - eligible.length,
  sheets: manifestSheets
};
await writeJson(path.join(atlasDirectory, 'manifest.json'), manifest);

console.log(
  `Mapped ${eligible.length.toLocaleString()} base emoji across ${sheetCount} `
  + `${width}×${height} PNG atlases; existing artwork was not overwritten.`
);

async function writeJson(file, value) {
  const json = await format(JSON.stringify(value), { parser: 'json' });
  await fs.writeFile(file, json);
}

function transparentPng(imageWidth, imageHeight) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(imageWidth, 0);
  ihdr.writeUInt32BE(imageHeight, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const scanline = Buffer.alloc(1 + imageWidth * 4);
  const raw = Buffer.concat(Array.from({ length: imageHeight }, () => scanline));
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

function pngChunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  name.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length);
  return chunk;
}

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
