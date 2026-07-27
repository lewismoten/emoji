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

export function layerAxisBounds(size, cellSize = CELL_SIZE) {
  return size <= cellSize ? [0, cellSize - size] : [cellSize - size, 0];
}

export function layerPositionAllowed(layer, x, y, cellSize = CELL_SIZE) {
  const [minimumX, maximumX] = layerAxisBounds(layer.width, cellSize);
  const [minimumY, maximumY] = layerAxisBounds(layer.height, cellSize);
  return x >= minimumX && x <= maximumX && y >= minimumY && y <= maximumY;
}

export function currentColorValue(selectedColor) {
  if (selectedColor === "transparent") return [0, 0, 0, 0];
  const value = selectedColor.slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    255,
  ];
}

export function paintPixelInto(pixels, point, color) {
  pixels.set(color, pixelOffset(point.x, point.y));
}

export function drawLineOnPixels(pixels, start, end, color) {
  let x = start.x;
  let y = start.y;
  const deltaX = Math.abs(end.x - x);
  const deltaY = -Math.abs(end.y - y);
  const stepX = x < end.x ? 1 : -1;
  const stepY = y < end.y ? 1 : -1;
  let error = deltaX + deltaY;
  while (true) {
    paintPixelInto(pixels, { x, y }, color);
    if (x === end.x && y === end.y) break;
    const doubled = error * 2;
    if (doubled >= deltaY) {
      error += deltaY;
      x += stepX;
    }
    if (doubled <= deltaX) {
      error += deltaX;
      y += stepY;
    }
  }
}

export function drawShapeOnPixels(
  pixels,
  start,
  end,
  shape,
  color,
  fillShapesEnabled,
) {
  const left = Math.min(start.x, end.x);
  const right = Math.max(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const bottom = Math.max(start.y, end.y);
  if (shape === "rectangle") {
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        if (
          fillShapesEnabled ||
          x === left ||
          x === right ||
          y === top ||
          y === bottom
        ) {
          paintPixelInto(pixels, { x, y }, color);
        }
      }
    }
    return;
  }
  const radiusX = Math.max((right - left + 1) / 2, 0.5);
  const radiusY = Math.max((bottom - top + 1) / 2, 0.5);
  const centerX = (left + right + 1) / 2;
  const centerY = (top + bottom + 1) / 2;
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      const outer =
        ((x + 0.5 - centerX) / radiusX) ** 2 +
          ((y + 0.5 - centerY) / radiusY) ** 2 <=
        1;
      const innerRadiusX = radiusX - 1;
      const innerRadiusY = radiusY - 1;
      const inner =
        innerRadiusX > 0 &&
        innerRadiusY > 0 &&
        ((x + 0.5 - centerX) / innerRadiusX) ** 2 +
          ((y + 0.5 - centerY) / innerRadiusY) ** 2 <=
          1;
      if (outer && (fillShapesEnabled || !inner)) {
        paintPixelInto(pixels, { x, y }, color);
      }
    }
  }
}

export function floodFillPixels(pixels, start, color) {
  const offset = pixelOffset(start.x, start.y);
  const target = [...pixels.slice(offset, offset + 4)];
  if (target.every((value, index) => value === color[index])) return;
  const queue = [start];
  const visited = new Set();
  while (queue.length > 0) {
    const point = queue.pop();
    const key = `${point.x},${point.y}`;
    if (visited.has(key)) continue;
    visited.add(key);
    const pointOffset = pixelOffset(point.x, point.y);
    if (!target.every((value, index) => pixels[pointOffset + index] === value)) {
      continue;
    }
    pixels.set(color, pointOffset);
    if (point.x > 0) queue.push({ x: point.x - 1, y: point.y });
    if (point.x < CELL_SIZE - 1) queue.push({ x: point.x + 1, y: point.y });
    if (point.y > 0) queue.push({ x: point.x, y: point.y - 1 });
    if (point.y < CELL_SIZE - 1) queue.push({ x: point.x, y: point.y + 1 });
  }
}
