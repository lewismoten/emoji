function colorCounts(pixels) {
  const colors = new Map();
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (pixels[offset + 3] === 0) continue;
    const color = pixels.slice(offset, offset + 4).join(",");
    colors.set(color, (colors.get(color) ?? 0) + 1);
  }
  return colors;
}

function silhouetteMask(pixels) {
  const mask = Buffer.alloc(pixels.length / 4);
  for (let offset = 0; offset < pixels.length; offset += 4) {
    mask[offset / 4] = pixels[offset + 3] > 0 ? 1 : 0;
  }
  return mask.toString("base64");
}

function layerMask(pixels, color, useSilhouette) {
  if (useSilhouette) return silhouetteMask(pixels);
  const values = color.split(",").map(Number);
  const mask = Buffer.alloc(pixels.length / 4);
  for (let offset = 0; offset < pixels.length; offset += 4) {
    const pixel = pixels.slice(offset, offset + 4);
    mask[offset / 4] = pixel.every((value, index) => value === values[index])
      ? 1
      : 0;
  }
  return mask.toString("base64");
}

function compareSerializedColors(left, right) {
  const leftValues = left.split(",").map(Number);
  const rightValues = right.split(",").map(Number);
  for (let index = 0; index < leftValues.length; index += 1) {
    const difference = leftValues[index] - rightValues[index];
    if (difference) return difference;
  }
  return 0;
}

function uniqueLayerMasks(entries, specs) {
  const masks = new Set();
  for (const entry of entries) {
    for (const { color, useSilhouette } of specs.get(entry.key)) {
      masks.add(layerMask(entry.pixels, color, useSilhouette));
    }
  }
  return masks;
}

function countMaskPixels(mask) {
  return mask.reduce((count, value) => count + (value ? 1 : 0), 0);
}

function maskIsProperSubset(candidate, target) {
  return (
    candidate.some((value, index) => value !== target[index]) &&
    candidate.every((value, index) => !value || target[index])
  );
}

function masksAreDisjoint(left, right) {
  return left.every((value, index) => !value || !right[index]);
}

function maskUnionEquals(left, right, target) {
  return target.every(
    (value, index) => Boolean(value) === Boolean(left[index] || right[index]),
  );
}

function exactMaskUnions(maskKeys) {
  const masks = [...maskKeys]
    .map((key) => ({ key, value: Buffer.from(key, "base64") }))
    .sort(
      (left, right) =>
        countMaskPixels(left.value) - countMaskPixels(right.value) ||
        left.key.localeCompare(right.key),
    );
  const decompositions = new Map();
  for (const target of masks) {
    const parts = masks.filter(
      (candidate) =>
        candidate.key !== target.key &&
        maskIsProperSubset(candidate.value, target.value),
    );
    let match;
    for (let leftIndex = 0; leftIndex < parts.length && !match; leftIndex++) {
      for (
        let rightIndex = leftIndex;
        rightIndex < parts.length;
        rightIndex++
      ) {
        if (
          masksAreDisjoint(parts[leftIndex].value, parts[rightIndex].value) &&
          maskUnionEquals(
            parts[leftIndex].value,
            parts[rightIndex].value,
            target.value,
          )
        ) {
          match = [parts[leftIndex].key, parts[rightIndex].key];
          break;
        }
      }
    }
    if (match) decompositions.set(target.key, match);
  }
  return decompositions;
}

function expandMask(key, decompositions) {
  const parts = decompositions.get(key);
  return parts
    ? parts.flatMap((part) => expandMask(part, decompositions))
    : [key];
}

export function analyzeColorMasks(entries, optimizeMasks = false) {
  let colorLayerCount = 0;
  let silhouetteGlyphCount = 0;
  let specs = new Map();
  const silhouetteGroups = new Map();
  for (const entry of entries) {
    const colors = colorCounts(entry.pixels);
    if (entry.rendering === "silhouette") silhouetteGlyphCount += 1;
    else colorLayerCount += colors.size;
    specs.set(
      entry.key,
      [...colors.keys()].map((color) => ({ color, useSilhouette: false })),
    );
    const silhouette = silhouetteMask(entry.pixels);
    const group = silhouetteGroups.get(silhouette) ?? [];
    group.push(entry);
    silhouetteGroups.set(silhouette, group);
  }
  let maskCount = uniqueLayerMasks(entries, specs).size;
  if (optimizeMasks) {
    for (const [, group] of [...silhouetteGroups].sort(([left], [right]) =>
      left.localeCompare(right),
    )) {
      if (group.length < 2) continue;
      const candidate = new Map(specs);
      let changed = false;
      for (const entry of group) {
        const colors = colorCounts(entry.pixels);
        const opaque = [...colors.keys()].every(
          (color) => Number(color.split(",")[3]) === 255,
        );
        if (!colors.size || !opaque) continue;
        const baseColor = [...colors].sort(
          ([leftColor, leftCount], [rightColor, rightCount]) =>
            rightCount - leftCount ||
            compareSerializedColors(leftColor, rightColor),
        )[0][0];
        candidate.set(entry.key, [
          { color: baseColor, useSilhouette: true },
          ...[...colors.keys()]
            .filter((color) => color !== baseColor)
            .map((color) => ({ color, useSilhouette: false })),
        ]);
        changed = true;
      }
      if (!changed) continue;
      const candidateMaskCount = uniqueLayerMasks(entries, candidate).size;
      if (candidateMaskCount < maskCount) {
        specs = candidate;
        maskCount = candidateMaskCount;
      }
    }
  }
  return createAnalysisSummary(entries, optimizeMasks, specs, silhouetteGroups);
}

function createAnalysisSummary(
  entries,
  optimizeMasks,
  specs,
  silhouetteGroups,
) {
  const sourceMasks = uniqueLayerMasks(entries, specs);
  const maskDecompositions = optimizeMasks
    ? exactMaskUnions(sourceMasks)
    : new Map();
  const masks = new Set();
  let renderedLayerCount = 0;
  let composedLayerCount = 0;
  const baseMasks = new Map();
  let baseLayerCount = 0;
  for (const entry of entries) {
    for (const spec of specs.get(entry.key)) {
      const renderedMasks = expandMask(
        layerMask(entry.pixels, spec.color, spec.useSilhouette),
        maskDecompositions,
      );
      renderedLayerCount += renderedMasks.length;
      if (renderedMasks.length > 1) composedLayerCount += 1;
      renderedMasks.forEach((mask) => masks.add(mask));
      if (!spec.useSilhouette) continue;
      baseLayerCount += 1;
      const key = silhouetteMask(entry.pixels);
      baseMasks.set(key, (baseMasks.get(key) ?? 0) + 1);
    }
  }
  const sharedFallbackCompositeCount = optimizeMasks
    ? [...silhouetteGroups.values()]
        .filter((group) => group.length > 1)
        .reduce((total, group) => total + group.length, 0)
    : 0;
  return {
    strategy: optimizeMasks
      ? "shared-base-color-and-composed-masks"
      : "direct-color-layers",
    silhouetteGlyphCount: entries.filter(
      (entry) => entry.rendering === "silhouette",
    ).length,
    colorLayerCount: entries.reduce(
      (total, entry) =>
        total +
        (entry.rendering === "silhouette" ? 0 : colorCounts(entry.pixels).size),
      0,
    ),
    renderedLayerCount,
    uniqueMaskCount: masks.size,
    reusedLayerCount: renderedLayerCount - masks.size,
    composedMaskCount: maskDecompositions.size,
    composedLayerCount,
    fallbackCompositeCount: entries.length,
    sharedFallbackCompositeCount,
    layerFallbackCompositeCount: entries.length - sharedFallbackCompositeCount,
    baseLayerCount,
    uniqueBaseMaskCount: baseMasks.size,
    reusedBaseLayerCount: [...baseMasks.values()].reduce(
      (total, count) => total + Math.max(0, count - 1),
      0,
    ),
  };
}
