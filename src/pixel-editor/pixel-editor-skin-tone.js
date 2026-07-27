import {
  CELL_SIZE,
  EGA_COLORS,
  SKIN_TONE_COLORS,
} from "./pixel-editor-constants.js";

export function findSkinTone(codePoint) {
  return SKIN_TONE_COLORS.find((tone) => tone.codePoint === codePoint);
}

export function skinToneCycle(codePoint) {
  const index = SKIN_TONE_COLORS.findIndex(
    (tone) => tone.codePoint === codePoint,
  );
  if (index < 0) return [];
  return [
    { kind: "normal", color: SKIN_TONE_COLORS[index].color },
    index > 0
      ? { kind: "lighter", color: SKIN_TONE_COLORS[index - 1].color }
      : undefined,
    index < SKIN_TONE_COLORS.length - 1
      ? { kind: "darker", color: SKIN_TONE_COLORS[index + 1].color }
      : undefined,
  ].filter(Boolean);
}

export function skinToneSequence(codePoints = []) {
  const skinTones = new Set(SKIN_TONE_COLORS.map((tone) => tone.codePoint));
  return codePoints
    .map((codePoint) => String(codePoint).toUpperCase())
    .filter((codePoint) => skinTones.has(codePoint));
}

export function skinToneBaseSequence(codePoints = []) {
  const skinTones = new Set(SKIN_TONE_COLORS.map((tone) => tone.codePoint));
  return codePoints
    .map((codePoint) => String(codePoint).toUpperCase())
    .filter((codePoint) => !skinTones.has(codePoint))
    .join(" ");
}

export function remapSkinTonePixels(
  pixels,
  sourceTones = [],
  targetTones = [],
  helper,
) {
  const result = pixels.slice();
  if (
    sourceTones.length === 0 ||
    targetTones.length === 0 ||
    (sourceTones.length === targetTones.length &&
      sourceTones.every((tone, index) => tone === targetTones[index]))
  )
    return result;
  const pairs = sourceTones.map((sourceTone, index) => ({
    sourceTone,
    targetTone: targetTones[Math.min(index, targetTones.length - 1)],
  }));
  const pairColors = pairs.map(({ sourceTone, targetTone }) =>
    skinToneColorMap(sourceTone, targetTone),
  );
  const colors = new Map();
  for (const { sourceTone, targetTone } of pairs) {
    const source = findSkinTone(sourceTone);
    const target = findSkinTone(targetTone);
    if (source && target && !colors.has(source.color))
      colors.set(source.color, target.color);
  }
  for (const { sourceTone, targetTone } of pairs) {
    for (const [sourceColor, targetColor] of skinToneColorMap(
      sourceTone,
      targetTone,
    )) {
      if (!colors.has(sourceColor)) colors.set(sourceColor, targetColor);
    }
  }
  for (let offset = 0; offset < result.length; offset += 4) {
    if (result[offset + 3] === 0) continue;
    const sourceColor = rgbHex(
      result[offset],
      result[offset + 1],
      result[offset + 2],
    );
    const pixelIndex = offset / 4;
    const owner = helper?.ownership
      ? (helper.ownership[
          (Math.floor(pixelIndex / helper.width) + (helper.offsetY ?? 0)) *
            helper.ownershipWidth +
            (pixelIndex % helper.width) +
            (helper.offsetX ?? 0)
        ] ?? -1)
      : -1;
    const targetColor =
      owner >= 0
        ? pairColors[owner]?.get(sourceColor)
        : colors.get(sourceColor);
    if (!targetColor) continue;
    const value = targetColor.slice(1);
    result[offset] = Number.parseInt(value.slice(0, 2), 16);
    result[offset + 1] = Number.parseInt(value.slice(2, 4), 16);
    result[offset + 2] = Number.parseInt(value.slice(4, 6), 16);
  }
  return result;
}

function skinToneColorMap(sourceTone, targetTone) {
  const colors = new Map();
  const source = findSkinTone(sourceTone);
  const target = findSkinTone(targetTone);
  if (!source || !target) return colors;
  colors.set(source.color, target.color);
  const targetCycle = skinToneCycle(targetTone);
  for (const sourceShade of skinToneCycle(sourceTone).filter(
    (shade) => shade.kind !== "normal",
  )) {
    const targetShade =
      targetCycle.find((shade) => shade.kind === sourceShade.kind) ??
      endpointSkinToneShade(targetTone, sourceShade.kind) ??
      targetCycle.find((shade) => shade.kind !== "normal") ??
      targetCycle[0];
    if (targetShade) colors.set(sourceShade.color, targetShade.color);
  }
  return colors;
}

export function buildSkinToneOwnership(
  pixels,
  tones,
  width = CELL_SIZE,
  height = CELL_SIZE,
) {
  if (new Set(tones).size !== tones.length || tones.length < 2)
    return undefined;
  const normalOwners = new Map(
    tones.map((tone, index) => [findSkinTone(tone)?.color, index]),
  );
  normalOwners.delete(undefined);
  const seeds = [];
  const ownersWithSeeds = new Set();
  for (let index = 0; index < pixels.length / 4; index += 1) {
    const offset = index * 4;
    if (pixels[offset + 3] === 0) continue;
    const owner = normalOwners.get(
      rgbHex(pixels[offset], pixels[offset + 1], pixels[offset + 2]),
    );
    if (owner === undefined) continue;
    seeds.push({ x: index % width, y: Math.floor(index / width), owner });
    ownersWithSeeds.add(owner);
  }
  if (ownersWithSeeds.size !== tones.length) return undefined;
  const ownership = new Int8Array(width * height);
  ownership.fill(-1);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let nearest;
      for (const seed of seeds) {
        const distance = (x - seed.x) ** 2 + (y - seed.y) ** 2;
        if (
          !nearest ||
          distance < nearest.distance ||
          (distance === nearest.distance && seed.owner < nearest.owner)
        ) {
          nearest = { distance, owner: seed.owner };
        }
      }
      ownership[y * width + x] = nearest.owner;
    }
  }
  return ownership;
}

export function buildTwoPersonOwnership(width = CELL_SIZE, height = CELL_SIZE) {
  const ownership = new Int8Array(width * height);
  const dividingColumn = Math.ceil(width / 2);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1)
      ownership[y * width + x] = x < dividingColumn ? 0 : 1;
  }
  return ownership;
}

export function compareSkinToneHelpers(left, right) {
  const endpointTones = new Set([
    SKIN_TONE_COLORS[0].codePoint,
    SKIN_TONE_COLORS.at(-1).codePoint,
  ]);
  const endpointCount = (entry) =>
    skinToneSequence(entry.codePoints).filter((tone) => endpointTones.has(tone))
      .length;
  return (
    endpointCount(left) - endpointCount(right) ||
    left.key.localeCompare(right.key)
  );
}

function endpointSkinToneShade(codePoint, shadeKind) {
  if (
    codePoint === SKIN_TONE_COLORS.at(-1)?.codePoint &&
    shadeKind === "darker"
  ) {
    return { kind: "darker", color: EGA_COLORS[0] };
  }
  if (codePoint === SKIN_TONE_COLORS[0]?.codePoint && shadeKind === "lighter") {
    return { kind: "lighter", color: EGA_COLORS.at(-1) };
  }
  return undefined;
}

function rgbHex(red, green, blue) {
  return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
