import {
  CELL_SIZE,
  EGA_COLORS,
  ROTATION_ALPHA_THRESHOLD,
} from "./pixel-editor-constants.js";
import { imageDataCanvas } from "./pixel-editor-canvas-helpers.js";
import {
  pixelOffset,
  pixelsEqual,
} from "./pixel-editor-geometry-helpers.js";

export function nextLayerRotation(layer, clockwise, paletteColors = EGA_COLORS) {
  const rotationSource = layer.rotationSource ?? {
    pixels: layer.pixels.slice(),
    width: layer.width,
    height: layer.height,
  };
  const rotationDegrees = ((layer.rotationDegrees ?? 0) + (clockwise ? 45 : -45) + 360) % 360;
  return {
    ...rotatePixels(rotationSource, rotationDegrees, paletteColors),
    rotationSource,
    rotationDegrees,
  };
}

export function resetLayerRotation(layer) {
  delete layer.rotationSource;
  delete layer.rotationDegrees;
}

export function rotatePixels(layer, degrees, paletteColors = EGA_COLORS) {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const width = Math.ceil(Math.abs(layer.width * cosine) + Math.abs(layer.height * sine) - 1e-10);
  const height = Math.ceil(Math.abs(layer.width * sine) + Math.abs(layer.height * cosine) - 1e-10);
  const sourceCanvas = imageDataCanvas(layer.pixels, layer.width, layer.height);
  const rotatedCanvas = document.createElement("canvas");
  rotatedCanvas.width = width;
  rotatedCanvas.height = height;
  const rotatedContext = rotatedCanvas.getContext("2d");
  rotatedContext.imageSmoothingEnabled = true;
  rotatedContext.imageSmoothingQuality = "high";
  rotatedContext.translate(width / 2, height / 2);
  rotatedContext.rotate(radians);
  rotatedContext.drawImage(sourceCanvas, -layer.width / 2, -layer.height / 2);
  const interpolated = rotatedContext.getImageData(0, 0, width, height).data;
  return { pixels: quantizeToPalette(interpolated, paletteColors), width, height };
}

export function quantizeToPalette(source, paletteColors = EGA_COLORS) {
  const result = new Uint8ClampedArray(source.length);
  for (let offset = 0; offset < source.length; offset += 4) {
    if (source[offset + 3] < ROTATION_ALPHA_THRESHOLD) continue;
    const color = nearestPaletteColor(
      source[offset],
      source[offset + 1],
      source[offset + 2],
      paletteColors,
    ).slice(1);
    result[offset] = Number.parseInt(color.slice(0, 2), 16);
    result[offset + 1] = Number.parseInt(color.slice(2, 4), 16);
    result[offset + 2] = Number.parseInt(color.slice(4, 6), 16);
    result[offset + 3] = 255;
  }
  return result;
}

export function layerTransformChangesPixels(layer, transformed) {
  return (
    layer.width !== transformed.width ||
    layer.height !== transformed.height ||
    !pixelsEqual(layer.pixels, transformed.pixels)
  );
}

export function layerAxisBounds(size) {
  return size <= CELL_SIZE ? [0, CELL_SIZE - size] : [CELL_SIZE - size, 0];
}

export function layerPositionAllowed(layer, x, y) {
  const [minimumX, maximumX] = layerAxisBounds(layer.width);
  const [minimumY, maximumY] = layerAxisBounds(layer.height);
  return x >= minimumX && x <= maximumX && y >= minimumY && y <= maximumY;
}

export function flipPixels(layer, horizontal) {
  const result = new Uint8ClampedArray(layer.pixels.length);
  for (let y = 0; y < layer.height; y += 1) {
    for (let x = 0; x < layer.width; x += 1) {
      const targetX = horizontal ? layer.width - 1 - x : x;
      const targetY = horizontal ? y : layer.height - 1 - y;
      const sourceOffset = (y * layer.width + x) * 4;
      result.set(layer.pixels.slice(sourceOffset, sourceOffset + 4), (targetY * layer.width + targetX) * 4);
    }
  }
  return result;
}

export function compositeLayer(target, layer) {
  for (let y = 0; y < layer.height; y += 1) {
    for (let x = 0; x < layer.width; x += 1) {
      const targetX = layer.x + x;
      const targetY = layer.y + y;
      if (targetX < 0 || targetX >= CELL_SIZE || targetY < 0 || targetY >= CELL_SIZE) continue;
      const sourceOffset = (y * layer.width + x) * 4;
      if (layer.pixels[sourceOffset + 3] === 0) continue;
      target.set(layer.pixels.slice(sourceOffset, sourceOffset + 4), pixelOffset(targetX, targetY));
    }
  }
}

export function effectiveLayerPixels(layer, paletteColors = EGA_COLORS) {
  if (!layer.inverted) return layer.pixels;
  const result = new Uint8ClampedArray(layer.pixels.length);
  for (let offset = 0; offset < layer.pixels.length; offset += 4) {
    const alpha = layer.pixels[offset + 3];
    if (alpha === 0) continue;
    const paletteColor = nearestPaletteColor(
      255 - layer.pixels[offset],
      255 - layer.pixels[offset + 1],
      255 - layer.pixels[offset + 2],
      paletteColors,
    );
    const value = paletteColor.slice(1);
    result[offset] = Number.parseInt(value.slice(0, 2), 16);
    result[offset + 1] = Number.parseInt(value.slice(2, 4), 16);
    result[offset + 2] = Number.parseInt(value.slice(4, 6), 16);
    result[offset + 3] = alpha;
  }
  return result;
}

export function nearestPaletteColor(red, green, blue, colors = EGA_COLORS) {
  return colors.reduce(
    (nearest, color) => {
      const value = color.slice(1);
      const colorRed = Number.parseInt(value.slice(0, 2), 16);
      const colorGreen = Number.parseInt(value.slice(2, 4), 16);
      const colorBlue = Number.parseInt(value.slice(4, 6), 16);
      const distance = (red - colorRed) ** 2 + (green - colorGreen) ** 2 + (blue - colorBlue) ** 2;
      return distance < nearest.distance ? { color, distance } : nearest;
    },
    { color: colors[0] ?? EGA_COLORS[0], distance: Number.POSITIVE_INFINITY },
  ).color;
}
