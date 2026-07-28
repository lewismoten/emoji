// @ts-nocheck -- Transitional TypeScript migration.
import { BITMAP_FONT_5X7 } from "../../../pixel-font/retro-text-bitmap.mjs";

import { CELL_SIZE } from "../core/pixel-editor-constants.js";

export function drawBitmapText(context, x, y, value, color) {
  context.fillStyle = color;
  for (const [index, character] of [...value].entries()) {
    const glyph = BITMAP_FONT_5X7[character] ?? BITMAP_FONT_5X7["?"];
    for (let rowIndex = 0; rowIndex < glyph.length / 5; rowIndex++) {
      for (let columnIndex = 0; columnIndex < 5; columnIndex++) {
        const pixel = glyph[rowIndex * 5 + columnIndex];
        if (pixel === "1") {
          context.fillRect(x + index * 8 + columnIndex + 1, y + rowIndex, 1, 1);
        }
      }
    }
  }
}

export function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("PNG encoding failed")),
      "image/png",
    );
  });
}

export function downloadBlob(blob, fileName) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function drawCheckerboard(context, size) {
  const checker = size / 32;
  for (let y = 0; y < size / checker; y += 1) {
    for (let x = 0; x < size / checker; x += 1) {
      context.fillStyle = (x + y) % 2 === 0 ? "#f1f1f1" : "#bdbdbd";
      context.fillRect(x * checker, y * checker, checker, checker);
    }
  }
}

export function canvasIsBlackSilhouette(canvas) {
  const data = canvas
    .getContext("2d")
    .getImageData(0, 0, canvas.width, canvas.height).data;
  let hasVisiblePixel = false;
  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset + 3] === 0) continue;
    hasVisiblePixel = true;
    if (data[offset] !== 0 || data[offset + 1] !== 0 || data[offset + 2] !== 0)
      return false;
  }
  return hasVisiblePixel;
}

export function recolorVisibleCanvasPixels(canvas, red, green, blue) {
  const context = canvas.getContext("2d");
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let offset = 0; offset < image.data.length; offset += 4) {
    if (image.data[offset + 3] === 0) continue;
    image.data[offset] = red;
    image.data[offset + 1] = green;
    image.data[offset + 2] = blue;
  }
  context.putImageData(image, 0, 0);
}

export function drawCenteredEmoji(
  context,
  value,
  font,
  horizontalOffset = 0,
  verticalOffset = 0,
) {
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  const metrics = context.measureText(value);
  const ascent = metrics.actualBoundingBoxAscent || CELL_SIZE * 0.8;
  const descent = metrics.actualBoundingBoxDescent || CELL_SIZE * 0.2;
  const baseline = (CELL_SIZE - ascent - descent) / 2 + ascent;
  context.fillText(
    value,
    CELL_SIZE / 2 + horizontalOffset,
    baseline + verticalOffset,
  );
}

export function imageDataCanvas(pixels, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas
    .getContext("2d")
    .putImageData(new ImageData(pixels.slice(), width, height), 0, 0);
  return canvas;
}

export function createPixelEditorPreviewController(options) {
  const {
    artworkPreview,
    canvasIsBlackSilhouette,
    currentEmoji,
    currentEntry,
    downloadPreview,
    drawCenteredEmoji: drawEmoji,
    effectiveLayerPixels,
    floatingLayer,
    fontPreview,
    imageDataCanvas: toCanvas,
    officialPreview,
    paletteController,
    pixels,
    recolorVisibleCanvasPixels,
    traceCanvas,
    traceOffsetX,
    traceOffsetY,
  } = options;

  function renderTrace() {
    const traceContext = traceCanvas.getContext("2d");
    traceContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    drawEmoji(
      traceContext,
      currentEmoji(),
      '11px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      traceOffsetX(),
      traceOffsetY(),
    );
    drawOfficialPreview();
    drawFontPreview();
  }

  function drawOfficialPreview() {
    const previewContext = officialPreview.getContext("2d");
    previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    previewContext.drawImage(traceCanvas, 0, 0);
  }

  function drawFontPreview() {
    const previewContext = fontPreview.getContext("2d");
    previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    if (!currentEntry()?.painted) return;
    const proposed = currentEntry().releaseStatus === "proposed";
    const familyProperty = proposed
      ? "--pixel-emoji-proposed-family"
      : "--pixel-emoji-released-family";
    const familyFallback = proposed
      ? '"Pixel Emoji Proposed"'
      : '"Pixel Emoji"';
    const family =
      getComputedStyle(document.documentElement)
        .getPropertyValue(familyProperty)
        .trim() || familyFallback;
    const render = () => {
      previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
      previewContext.fillStyle = currentArtworkIsBlackSilhouette()
        ? "#ffffff"
        : "#000000";
      const fontEmoji = currentEntry().privateUseCodePoint
        ? String.fromCodePoint(
            Number.parseInt(currentEntry().privateUseCodePoint, 16),
          )
        : currentEmoji();
      drawEmoji(previewContext, fontEmoji, `${CELL_SIZE}px ${family}`);
    };
    render();
    document.fonts
      ?.load(
        `${CELL_SIZE}px ${family}`,
        currentEntry().privateUseCodePoint
          ? String.fromCodePoint(
              Number.parseInt(currentEntry().privateUseCodePoint, 16),
            )
          : currentEmoji(),
      )
      .then(render);
  }

  function drawArtworkPreview() {
    const renderedArtwork = currentArtworkPreviewCanvas();
    if (canvasIsBlackSilhouette(renderedArtwork)) {
      recolorVisibleCanvasPixels(renderedArtwork, 255, 255, 255);
    }
    const previewContexts = [
      artworkPreview.getContext("2d"),
      downloadPreview.getContext("2d"),
    ];
    previewContexts.forEach((previewContext) => {
      previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
      previewContext.drawImage(renderedArtwork, 0, 0);
    });
  }

  function currentArtworkPreviewCanvas() {
    const renderedArtwork = toCanvas(pixels(), CELL_SIZE, CELL_SIZE);
    const layer = floatingLayer();
    if (layer) {
      const layerCanvas = toCanvas(
        effectiveLayerPixels(layer, paletteController.activePaletteColors()),
        layer.width,
        layer.height,
      );
      renderedArtwork.getContext("2d").drawImage(layerCanvas, layer.x, layer.y);
    }
    return renderedArtwork;
  }

  function currentArtworkIsBlackSilhouette() {
    return canvasIsBlackSilhouette(currentArtworkPreviewCanvas());
  }

  return {
    currentArtworkIsBlackSilhouette,
    drawFontPreview,
    drawArtworkPreview,
    renderTrace,
  };
}
