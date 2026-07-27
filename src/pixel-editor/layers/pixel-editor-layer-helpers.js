import {
  CELL_SIZE,
  EGA_COLORS,
  ROTATION_ALPHA_THRESHOLD,
} from "../core/pixel-editor-constants.js";
import { imageDataCanvas } from "../canvas/pixel-editor-canvas-helpers.js";
import {
  layerAxisBounds as geometryLayerAxisBounds,
  layerPositionAllowed as geometryLayerPositionAllowed,
  pixelOffset,
  pixelsEqual,
} from "../core/pixel-editor-geometry-helpers.js";

export function nextLayerRotation(
  layer,
  clockwise,
  paletteColors = EGA_COLORS,
) {
  const rotationSource = layer.rotationSource ?? {
    pixels: layer.pixels.slice(),
    width: layer.width,
    height: layer.height,
  };
  const rotationDegrees =
    ((layer.rotationDegrees ?? 0) + (clockwise ? 45 : -45) + 360) % 360;
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
  const width = Math.ceil(
    Math.abs(layer.width * cosine) + Math.abs(layer.height * sine) - 1e-10,
  );
  const height = Math.ceil(
    Math.abs(layer.width * sine) + Math.abs(layer.height * cosine) - 1e-10,
  );
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
  return {
    pixels: quantizeToPalette(interpolated, paletteColors),
    width,
    height,
  };
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

export function flipPixels(layer, horizontal) {
  const result = new Uint8ClampedArray(layer.pixels.length);
  for (let y = 0; y < layer.height; y += 1) {
    for (let x = 0; x < layer.width; x += 1) {
      const targetX = horizontal ? layer.width - 1 - x : x;
      const targetY = horizontal ? y : layer.height - 1 - y;
      const sourceOffset = (y * layer.width + x) * 4;
      result.set(
        layer.pixels.slice(sourceOffset, sourceOffset + 4),
        (targetY * layer.width + targetX) * 4,
      );
    }
  }
  return result;
}

export function compositeLayer(target, layer) {
  for (let y = 0; y < layer.height; y += 1) {
    for (let x = 0; x < layer.width; x += 1) {
      const targetX = layer.x + x;
      const targetY = layer.y + y;
      if (
        targetX < 0 ||
        targetX >= CELL_SIZE ||
        targetY < 0 ||
        targetY >= CELL_SIZE
      )
        continue;
      const sourceOffset = (y * layer.width + x) * 4;
      if (layer.pixels[sourceOffset + 3] === 0) continue;
      target.set(
        layer.pixels.slice(sourceOffset, sourceOffset + 4),
        pixelOffset(targetX, targetY),
      );
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
      const distance =
        (red - colorRed) ** 2 +
        (green - colorGreen) ** 2 +
        (blue - colorBlue) ** 2;
      return distance < nearest.distance ? { color, distance } : nearest;
    },
    { color: colors[0] ?? EGA_COLORS[0], distance: Number.POSITIVE_INFINITY },
  ).color;
}

export function createPixelEditorCanvasController(options) {
  const {
    context,
    currentEmoji,
    currentSelection,
    currentTool,
    displaySize,
    draftController,
    drawArtworkPreview,
    drawCheckerboard,
    floatingLayer,
    paletteController,
    pixelOffset,
    pixels,
    selectionDashOffset,
    setSelectionDashOffset,
    traceAlpha,
    traceCanvas,
    updateEditorModePanels,
    updateTransferButtons,
    view,
  } = options;
  let selectionAnimationFrame;

  function draw(updateState = true) {
    const displayCell = displaySize / CELL_SIZE;
    context.clearRect(0, 0, displaySize, displaySize);
    drawCheckerboard(context, displaySize);
    if (Number(traceAlpha.value) > 0 && currentEmoji()) {
      context.save();
      context.globalAlpha = Number(traceAlpha.value) / 100;
      context.imageSmoothingEnabled = false;
      context.drawImage(traceCanvas, 0, 0, displaySize, displaySize);
      context.restore();
    }
    for (let y = 0; y < CELL_SIZE; y += 1) {
      for (let x = 0; x < CELL_SIZE; x += 1) {
        const offset = pixelOffset(x, y);
        const alpha = pixels()[offset + 3];
        if (alpha === 0) continue;
        context.fillStyle = `rgba(${pixels()[offset]}, ${pixels()[offset + 1]}, ${pixels()[offset + 2]}, ${alpha / 255})`;
        context.fillRect(
          x * displayCell,
          y * displayCell,
          displayCell,
          displayCell,
        );
      }
    }
    drawFloatingLayer(context, displayCell);
    context.beginPath();
    for (let index = 0; index <= CELL_SIZE; index += 1) {
      const position = index * displayCell + 0.5;
      context.moveTo(position, 0);
      context.lineTo(position, displaySize);
      context.moveTo(0, position);
      context.lineTo(displaySize, position);
    }
    context.strokeStyle = "rgb(255 255 255 / 24%)";
    context.lineWidth = 1;
    context.stroke();
    drawSelectionOutline(context, displayCell);
    drawArtworkPreview();
    if (updateState) {
      draftController.rememberCurrentDraft();
      draftController.updateDirtyState();
      draftController.updateFileButtons();
      updateTransferButtons();
      draftController.updateHistoryButtons();
      updateEditorModePanels();
    }
    updateSelectionAnimation();
  }

  function drawFloatingLayer(targetContext, displayCell) {
    const layer = floatingLayer();
    if (!layer) return;
    const layerPixels = effectiveLayerPixels(
      layer,
      paletteController.activePaletteColors(),
    );
    for (let y = 0; y < layer.height; y += 1) {
      for (let x = 0; x < layer.width; x += 1) {
        const offset = (y * layer.width + x) * 4;
        const alpha = layerPixels[offset + 3];
        if (alpha === 0) continue;
        targetContext.fillStyle = `rgba(${layerPixels[offset]}, ${layerPixels[offset + 1]}, ${layerPixels[offset + 2]}, ${alpha / 255})`;
        targetContext.fillRect(
          (layer.x + x) * displayCell,
          (layer.y + y) * displayCell,
          displayCell,
          displayCell,
        );
      }
    }
    targetContext.save();
    targetContext.setLineDash([5, 4]);
    targetContext.strokeStyle = "#6de0ff";
    targetContext.lineWidth = 2;
    targetContext.strokeRect(
      layer.x * displayCell + 1,
      layer.y * displayCell + 1,
      layer.width * displayCell - 2,
      layer.height * displayCell - 2,
    );
    targetContext.restore();
  }

  function drawSelectionOutline(targetContext, displayCell) {
    const selection = currentSelection();
    if (!selection || floatingLayer() || currentTool() !== "select") return;
    targetContext.save();
    targetContext.setLineDash([7, 7]);
    targetContext.lineDashOffset = selectionDashOffset();
    targetContext.strokeStyle = "#000000";
    targetContext.lineWidth = 4;
    targetContext.strokeRect(
      selection.x * displayCell + 2,
      selection.y * displayCell + 2,
      selection.width * displayCell - 4,
      selection.height * displayCell - 4,
    );
    targetContext.lineDashOffset = selectionDashOffset() + 7;
    targetContext.strokeStyle = "#ffffff";
    targetContext.lineWidth = 2;
    targetContext.strokeRect(
      selection.x * displayCell + 2,
      selection.y * displayCell + 2,
      selection.width * displayCell - 4,
      selection.height * displayCell - 4,
    );
    targetContext.restore();
  }

  function updateSelectionAnimation() {
    const shouldAnimate =
      currentTool() === "select" &&
      Boolean(currentSelection()) &&
      !floatingLayer() &&
      !view.hidden;
    if (!shouldAnimate) {
      if (selectionAnimationFrame)
        cancelAnimationFrame(selectionAnimationFrame);
      selectionAnimationFrame = undefined;
      return;
    }
    if (selectionAnimationFrame) return;
    selectionAnimationFrame = requestAnimationFrame(animateSelectionOutline);
  }

  function animateSelectionOutline(timestamp) {
    selectionAnimationFrame = undefined;
    if (
      currentTool() !== "select" ||
      !currentSelection() ||
      floatingLayer() ||
      view.hidden
    ) {
      return;
    }
    setSelectionDashOffset(-(timestamp / 55) % 14);
    draw(false);
  }

  function pointInFloatingLayer(point) {
    const layer = floatingLayer();
    return (
      point.x >= layer.x &&
      point.x < layer.x + layer.width &&
      point.y >= layer.y &&
      point.y < layer.y + layer.height
    );
  }

  return { draw, pointInFloatingLayer };
}

export function layerAxisBounds(size) {
  return size <= CELL_SIZE ? [0, CELL_SIZE - size] : [CELL_SIZE - size, 0];
}

export function layerPositionAllowed(layer, x, y) {
  return geometryLayerPositionAllowed(layer, x, y, CELL_SIZE);
}
