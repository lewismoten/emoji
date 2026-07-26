import { CELL_SIZE } from "./pixel-editor-constants.js";

export function pixelOffset(x, y) {
  return (y * CELL_SIZE + x) * 4;
}

export function boundsFromPoints(start, end) {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  return {
    x,
    y,
    width: Math.abs(start.x - end.x) + 1,
    height: Math.abs(start.y - end.y) + 1,
  };
}

export function extractPixels(source, sourceWidth, x, y, width, height) {
  const result = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row += 1) {
    const sourceStart = ((y + row) * sourceWidth + x) * 4;
    result.set(source.slice(sourceStart, sourceStart + width * 4), row * width * 4);
  }
  return result;
}

export function trimVisiblePixels(source, width, height) {
  let minimumX = width;
  let minimumY = height;
  let maximumX = -1;
  let maximumY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = source[(y * width + x) * 4 + 3];
      if (alpha === 0) continue;
      minimumX = Math.min(minimumX, x);
      minimumY = Math.min(minimumY, y);
      maximumX = Math.max(maximumX, x);
      maximumY = Math.max(maximumY, y);
    }
  }
  if (maximumX < minimumX || maximumY < minimumY) return undefined;
  return {
    pixels: extractPixels(source, width, minimumX, minimumY, maximumX - minimumX + 1, maximumY - minimumY + 1),
    width: maximumX - minimumX + 1,
    height: maximumY - minimumY + 1,
    x: minimumX,
    y: minimumY,
  };
}

export function cloneSelection(value) {
  return value ? { ...value } : undefined;
}

export function cloneFloatingLayer(value) {
  return value
    ? {
        ...value,
        pixels: value.pixels.slice(),
        skinTones: value.skinTones?.slice(),
        rotationSource: value.rotationSource
          ? {
              ...value.rotationSource,
              pixels: value.rotationSource.pixels.slice(),
            }
          : undefined,
      }
    : undefined;
}

export function hasVisiblePixels(value) {
  return value.some((channel, index) => index % 4 === 3 && channel > 0);
}

export function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function pixelsEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
