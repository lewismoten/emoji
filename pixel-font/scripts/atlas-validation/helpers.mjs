export function assert(condition, message) {
  if (!condition) throw new Error(message);
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

export function createModifierTypeResolver(config) {
  const skinToneModifiers = new Set(
    config.skinToneModifierCodePoints.map((point) => point.toUpperCase()),
  );
  const hairModifiers = new Set(
    config.hairModifierCodePoints.map((point) => point.toUpperCase()),
  );

  return function getModifierType(item) {
    const points = Array.isArray(item.codePoints)
      ? item.codePoints.map((point) => point.toUpperCase())
      : item.codePoints.split(/\s+/).map((point) => point.toUpperCase());
    const hasSkinTone = points.some((point) => skinToneModifiers.has(point));
    const hasHair = points.some((point) => hairModifiers.has(point));
    if (hasSkinTone && hasHair) return "skin-and-hair";
    if (hasSkinTone) return "skin-tone";
    if (hasHair) return "hair";
    return "base";
  };
}

export function countByModifierType(entries, getModifierType) {
  return Object.fromEntries(
    ["base", "skin-tone", "hair", "skin-and-hair"].map((type) => [
      type,
      entries.filter((entry) => getModifierType(entry) === type).length,
    ]),
  );
}

export function readPngDimensions(buffer) {
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

export function assertCellPaddingTransparent(atlas, sidecar, layout) {
  for (let row = 0; row < sidecar.rows; row += 1) {
    for (let column = 0; column < layout.columns; column += 1) {
      const slotX = layout.outerPadding + column * layout.slotSize;
      const slotY = layout.headerHeight + row * layout.slotSize;
      for (let y = 0; y < layout.slotSize; y += 1) {
        for (let x = 0; x < layout.slotSize; x += 1) {
          const artwork =
            x >= layout.cellPadding &&
            x < layout.cellPadding + layout.cellSize &&
            y >= layout.cellPadding &&
            y < layout.cellPadding + layout.cellSize;
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
