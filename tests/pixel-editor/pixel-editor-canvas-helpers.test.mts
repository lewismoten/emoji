import assert from "node:assert/strict";
import { CELL_SIZE } from "../../src/pixel-editor/core/pixel-editor-constants.js";
import {
  canvasIsBlackSilhouette,
  canvasToPng,
  createPixelEditorPreviewController,
  downloadBlob,
  drawBitmapText,
  drawCenteredEmoji,
  drawCheckerboard,
  imageDataCanvas,
  recolorVisibleCanvasPixels,
} from "../../src/pixel-editor/canvas/pixel-editor-canvas-helpers.js";

class FakeContext2D {
  fillStyle = "";
  font = "";
  textAlign = "";
  textBaseline = "";
  fillRects: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
  }> = [];
  fillTexts: Array<{
    value: string;
    x: number;
    y: number;
    font: string;
    color: string;
  }> = [];
  clearRects: Array<[number, number, number, number]> = [];
  drawImages: Array<any[]> = [];
  putImageDataCalls: Array<{ image: any; x: number; y: number }> = [];
  imageData = { data: new Uint8ClampedArray() };
  measureResult = { actualBoundingBoxAscent: 6, actualBoundingBoxDescent: 2 };

  fillRect(x: number, y: number, w: number, h: number) {
    this.fillRects.push({ x, y, w, h, color: this.fillStyle });
  }

  fillText(value: string, x: number, y: number) {
    this.fillTexts.push({
      value,
      x,
      y,
      font: this.font,
      color: this.fillStyle,
    });
  }

  clearRect(x: number, y: number, w: number, h: number) {
    this.clearRects.push([x, y, w, h]);
  }

  drawImage(...args: any[]) {
    this.drawImages.push(args);
  }

  getImageData() {
    return this.imageData;
  }

  putImageData(image: any, x: number, y: number) {
    this.putImageDataCalls.push({ image, x, y });
  }

  measureText() {
    return this.measureResult;
  }
}

class FakeCanvas {
  width = 0;
  height = 0;
  context = new FakeContext2D();
  blob: any = { type: "image/png" };

  getContext(_kind: string) {
    return this.context;
  }

  toBlob(callback: (blob: any) => void) {
    callback(this.blob);
  }
}

const browserGlobal = globalThis as any;
const originalDocument = browserGlobal.document;
const originalUrl = browserGlobal.URL;
const originalSetTimeout = browserGlobal.setTimeout;
const originalImageData = browserGlobal.ImageData;
const originalGetComputedStyle = browserGlobal.getComputedStyle;

const createdAnchors: Array<any> = [];
const createdCanvases: FakeCanvas[] = [];
let revokedUrl = "";
let timeoutDelay = -1;

browserGlobal.document = {
  createElement(tag: string) {
    if (tag === "a") {
      const anchor = {
        href: "",
        download: "",
        clicks: 0,
        click() {
          this.clicks += 1;
        },
      };
      createdAnchors.push(anchor);
      return anchor;
    }
    if (tag === "canvas") {
      const canvas = new FakeCanvas();
      createdCanvases.push(canvas);
      return canvas;
    }
    throw new Error(`Unexpected element ${tag}`);
  },
  documentElement: {},
  fonts: {
    load() {
      return Promise.resolve();
    },
  },
};

browserGlobal.URL = {
  createObjectURL() {
    return "blob:test";
  },
  revokeObjectURL(url: string) {
    revokedUrl = url;
  },
};

browserGlobal.setTimeout = (callback: () => void, delay: number) => {
  timeoutDelay = delay;
  callback();
  return 1;
};

browserGlobal.ImageData = class ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
};

browserGlobal.getComputedStyle = () => ({
  getPropertyValue(name: string) {
    if (name === "--pixel-emoji-proposed-family") return "";
    if (name === "--pixel-emoji-released-family") return '"Pixel Emoji Loaded"';
    return "";
  },
});

const bitmapContext = new FakeContext2D();
drawBitmapText(bitmapContext as any, 2, 3, "A?", "#ffeeaa");
assert.equal(bitmapContext.fillStyle, "#ffeeaa");
assert.ok(bitmapContext.fillRects.length > 0);

const successfulCanvas = new FakeCanvas();
assert.equal(await canvasToPng(successfulCanvas as any), successfulCanvas.blob);
const failedCanvas = new FakeCanvas();
failedCanvas.blob = null;
await assert.rejects(
  () => canvasToPng(failedCanvas as any),
  /PNG encoding failed/,
);

downloadBlob({ type: "image/png" }, "emoji.png");
assert.equal(createdAnchors[0].href, "blob:test");
assert.equal(createdAnchors[0].download, "emoji.png");
assert.equal(createdAnchors[0].clicks, 1);
assert.equal(timeoutDelay, 1000);
assert.equal(revokedUrl, "blob:test");

const checkerContext = new FakeContext2D();
drawCheckerboard(checkerContext as any, 32);
assert.equal(checkerContext.fillRects.length, 1024);
assert.equal(checkerContext.fillRects[0].color, "#f1f1f1");
assert.equal(checkerContext.fillRects[1].color, "#bdbdbd");

const silhouetteCanvas = new FakeCanvas();
silhouetteCanvas.width = 2;
silhouetteCanvas.height = 1;
silhouetteCanvas.context.imageData = {
  data: new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255]),
};
assert.equal(canvasIsBlackSilhouette(silhouetteCanvas as any), true);
silhouetteCanvas.context.imageData = {
  data: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 0, 255]),
};
assert.equal(canvasIsBlackSilhouette(silhouetteCanvas as any), false);
silhouetteCanvas.context.imageData = {
  data: new Uint8ClampedArray([0, 0, 0, 0]),
};
assert.equal(canvasIsBlackSilhouette(silhouetteCanvas as any), false);

const recolorCanvas = new FakeCanvas();
recolorCanvas.width = 2;
recolorCanvas.height = 1;
recolorCanvas.context.imageData = {
  data: new Uint8ClampedArray([0, 0, 0, 255, 2, 3, 4, 0]),
};
recolorVisibleCanvasPixels(recolorCanvas as any, 10, 11, 12);
assert.deepEqual(
  Array.from(recolorCanvas.context.putImageDataCalls[0].image.data),
  [10, 11, 12, 255, 2, 3, 4, 0],
);

const centeredContext = new FakeContext2D();
drawCenteredEmoji(centeredContext as any, "😀", '12px "Pixel Emoji"', 1, 2);
assert.equal(centeredContext.fillTexts.length, 1);
assert.equal(centeredContext.fillTexts[0].x, CELL_SIZE / 2 + 1);
centeredContext.measureResult = {
  actualBoundingBoxAscent: 0,
  actualBoundingBoxDescent: 0,
};
drawCenteredEmoji(centeredContext as any, "😀", '12px "Pixel Emoji"');
assert.equal(centeredContext.fillTexts.length, 2);

const dataCanvas = imageDataCanvas(new Uint8ClampedArray([1, 2, 3, 4]), 1, 1);
assert.equal(dataCanvas.width, 1);
assert.equal(dataCanvas.height, 1);
assert.equal(createdCanvases.at(-1)?.context.putImageDataCalls.length, 1);

const officialPreview = new FakeCanvas();
const fontPreview = new FakeCanvas();
const artworkPreview = new FakeCanvas();
const downloadPreview = new FakeCanvas();
const traceCanvas = new FakeCanvas();
const pixels = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
pixels[3] = 255;
const floatingPixels = new Uint8ClampedArray([1, 1, 1, 255]);
const previewController = createPixelEditorPreviewController({
  artworkPreview,
  canvasIsBlackSilhouette: (canvas: FakeCanvas) =>
    canvas === artworkPreview ? false : canvas.context.imageData.data[0] === 0,
  currentEmoji: () => "😀",
  currentEntry: () => ({
    painted: true,
    releaseStatus: "released",
    privateUseCodePoint: "E001",
  }),
  downloadPreview,
  drawCenteredEmoji: drawCenteredEmoji as any,
  effectiveLayerPixels: () => floatingPixels,
  floatingLayer: () => ({ x: 1, y: 2, width: 1, height: 1 }),
  fontPreview,
  imageDataCanvas: (
    buffer: Uint8ClampedArray,
    width: number,
    height: number,
  ) => {
    const canvas = new FakeCanvas();
    canvas.width = width;
    canvas.height = height;
    canvas.context.imageData = { data: buffer };
    return canvas;
  },
  officialPreview,
  paletteController: { activePaletteColors: () => ["#000000"] },
  pixels: () => pixels,
  recolorVisibleCanvasPixels: (
    canvas: FakeCanvas,
    r: number,
    g: number,
    b: number,
  ) => {
    canvas.context.fillStyle = `${r},${g},${b}`;
  },
  traceCanvas,
  traceOffsetX: () => 1,
  traceOffsetY: () => -1,
});
previewController.renderTrace();
assert.equal(traceCanvas.context.fillTexts.length > 0, true);
assert.equal(officialPreview.context.drawImages.length > 0, true);
await Promise.resolve();
assert.equal(fontPreview.context.fillTexts.length > 0, true);
previewController.drawArtworkPreview();
assert.equal(artworkPreview.context.drawImages.length > 0, true);
assert.equal(downloadPreview.context.drawImages.length > 0, true);
assert.equal(previewController.currentArtworkIsBlackSilhouette(), true);

const emptyFontPreviewController = createPixelEditorPreviewController({
  artworkPreview: new FakeCanvas(),
  canvasIsBlackSilhouette: () => false,
  currentEmoji: () => "😀",
  currentEntry: () => undefined,
  downloadPreview: new FakeCanvas(),
  drawCenteredEmoji: drawCenteredEmoji as any,
  effectiveLayerPixels: () => new Uint8ClampedArray(),
  floatingLayer: () => undefined,
  fontPreview: new FakeCanvas(),
  imageDataCanvas: (
    _buffer: Uint8ClampedArray,
    width: number,
    height: number,
  ) => {
    const canvas = new FakeCanvas();
    canvas.width = width;
    canvas.height = height;
    return canvas;
  },
  officialPreview: new FakeCanvas(),
  paletteController: { activePaletteColors: () => ["#000000"] },
  pixels: () => new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4),
  recolorVisibleCanvasPixels: () => undefined,
  traceCanvas: new FakeCanvas(),
  traceOffsetX: () => 0,
  traceOffsetY: () => 0,
});
emptyFontPreviewController.drawFontPreview();

browserGlobal.document = originalDocument;
browserGlobal.URL = originalUrl;
browserGlobal.setTimeout = originalSetTimeout;
browserGlobal.ImageData = originalImageData;
browserGlobal.getComputedStyle = originalGetComputedStyle;
