import assert from "node:assert/strict";
import {
  CELL_SIZE,
  EGA_COLORS,
} from "../../src/pixel-editor/core/pixel-editor-constants.js";
import {
  compositeLayer,
  effectiveLayerPixels,
  flipPixels,
  layerAxisBounds,
  layerPositionAllowed,
  layerTransformChangesPixels,
  nearestPaletteColor,
  nextLayerRotation,
  quantizeToPalette,
  resetLayerRotation,
  rotatePixels,
} from "../../src/pixel-editor/layers/pixel-editor-layer-helpers.js";

const layerAxisBoundsAny = layerAxisBounds as any;
const layerPositionAllowedAny = layerPositionAllowed as any;
const layerTransformChangesPixelsAny = layerTransformChangesPixels as any;
const nearestPaletteColorAny = nearestPaletteColor as any;
const quantizeToPaletteAny = quantizeToPalette as any;
const flipPixelsAny = flipPixels as any;
const compositeLayerAny = compositeLayer as any;
const effectiveLayerPixelsAny = effectiveLayerPixels as any;
const nextLayerRotationAny = nextLayerRotation as any;
const resetLayerRotationAny = resetLayerRotation as any;
const rotatePixelsAny = rotatePixels as any;

class FakeContext2D {
  imageSmoothingEnabled = false;
  imageSmoothingQuality = "";
  translated: Array<[number, number]> = [];
  rotated: number[] = [];
  drawImages: any[][] = [];
  returnedData = new Uint8ClampedArray();

  translate(x: number, y: number) {
    this.translated.push([x, y]);
  }

  rotate(value: number) {
    this.rotated.push(value);
  }

  drawImage(...args: any[]) {
    this.drawImages.push(args);
  }

  getImageData() {
    return { data: this.returnedData };
  }

  putImageData(_image: any, _x: number, _y: number) {}
}

class FakeCanvas {
  width = 0;
  height = 0;
  context = new FakeContext2D();

  getContext(_kind: string) {
    return this.context;
  }
}

const browserGlobal = globalThis as any;
const originalDocument = browserGlobal.document;
const originalImageData = browserGlobal.ImageData;

const createdCanvases: FakeCanvas[] = [];
browserGlobal.document = {
  createElement(tag: string) {
    if (tag !== "canvas") throw new Error(`Unexpected ${tag}`);
    const canvas = new FakeCanvas();
    createdCanvases.push(canvas);
    return canvas;
  },
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

assert.deepEqual(layerAxisBoundsAny(3), [0, CELL_SIZE - 3]);
assert.deepEqual(layerAxisBoundsAny(CELL_SIZE + 2), [-2, 0]);
assert.equal(layerPositionAllowedAny({ width: 3, height: 3 }, 0, 0), true);
assert.equal(layerPositionAllowedAny({ width: 3, height: 3 }, CELL_SIZE, 0), false);

assert.equal(
  layerTransformChangesPixelsAny(
    { width: 1, height: 1, pixels: new Uint8ClampedArray([1, 2, 3, 4]) },
    { width: 1, height: 1, pixels: new Uint8ClampedArray([1, 2, 3, 4]) },
  ),
  false,
);
assert.equal(
  layerTransformChangesPixelsAny(
    { width: 1, height: 1, pixels: new Uint8ClampedArray([1, 2, 3, 4]) },
    { width: 2, height: 1, pixels: new Uint8ClampedArray([1, 2, 3, 4]) },
  ),
  true,
);

assert.equal(nearestPaletteColorAny(0, 0, 0), EGA_COLORS[0]);
assert.equal(
  nearestPaletteColorAny(254, 254, 254, ["#000000", "#ffffff"]),
  "#ffffff",
);

const quantized = quantizeToPaletteAny(
  new Uint8ClampedArray([
    10, 10, 10, 254,
    240, 240, 240, 255,
    1, 2, 3, 0,
  ]),
  ["#000000", "#ffffff"],
);
assert.deepEqual(Array.from(quantized), [
  0, 0, 0, 255,
  255, 255, 255, 255,
  0, 0, 0, 0,
]);

const flipSource = {
  width: 2,
  height: 2,
  pixels: new Uint8ClampedArray([
    1, 0, 0, 255, 2, 0, 0, 255,
    3, 0, 0, 255, 4, 0, 0, 255,
  ]),
};
assert.deepEqual(Array.from(flipPixelsAny(flipSource, true)), [
  2, 0, 0, 255, 1, 0, 0, 255,
  4, 0, 0, 255, 3, 0, 0, 255,
]);
assert.deepEqual(Array.from(flipPixelsAny(flipSource, false)), [
  3, 0, 0, 255, 4, 0, 0, 255,
  1, 0, 0, 255, 2, 0, 0, 255,
]);

const target = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
compositeLayerAny(target, {
  x: 0,
  y: 0,
  width: 2,
  height: 2,
  pixels: new Uint8ClampedArray([
    5, 0, 0, 255, 0, 0, 0, 0,
    6, 0, 0, 255, 7, 0, 0, 255,
  ]),
});
assert.deepEqual(Array.from(target.slice(0, 4)), [5, 0, 0, 255]);
assert.deepEqual(Array.from(target.slice(4, 8)), [0, 0, 0, 0]);
assert.deepEqual(Array.from(target.slice(CELL_SIZE * 4, CELL_SIZE * 4 + 4)), [6, 0, 0, 255]);

const clippedTarget = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
compositeLayerAny(clippedTarget, {
  x: -1,
  y: -1,
  width: 2,
  height: 2,
  pixels: new Uint8ClampedArray([
    1, 1, 1, 255, 2, 2, 2, 255,
    3, 3, 3, 255, 4, 4, 4, 255,
  ]),
});
assert.deepEqual(Array.from(clippedTarget.slice(0, 4)), [4, 4, 4, 255]);

const uninverted = new Uint8ClampedArray([1, 2, 3, 255]);
assert.equal(
  effectiveLayerPixelsAny({ pixels: uninverted, inverted: false }),
  uninverted,
);
const inverted = effectiveLayerPixelsAny(
  {
    pixels: new Uint8ClampedArray([
      0, 0, 0, 255,
      100, 120, 140, 255,
      1, 2, 3, 0,
    ]),
    inverted: true,
  },
  ["#000000", "#ffffff"],
);
assert.deepEqual(Array.from(inverted), [
  255, 255, 255, 255,
  255, 255, 255, 255,
  0, 0, 0, 0,
]);

const rotatedPixels = new Uint8ClampedArray([
  250, 250, 250, 255,
  10, 10, 10, 100,
  20, 20, 20, 255,
  30, 30, 30, 255,
]);
const rotatedResultCanvas = new FakeCanvas();
rotatedResultCanvas.context.returnedData = rotatedPixels;
const sourceCanvas = new FakeCanvas();
createdCanvases.push(sourceCanvas, rotatedResultCanvas);
browserGlobal.document.createElement = (tag: string) => {
  if (tag !== "canvas") throw new Error(`Unexpected ${tag}`);
  return createdCanvases.shift() ?? new FakeCanvas();
};

const rotated = rotatePixelsAny(
  {
    pixels: new Uint8ClampedArray([1, 2, 3, 255]),
    width: 1,
    height: 1,
  },
  90,
  ["#000000", "#ffffff"],
);
assert.equal(rotated.width, 1);
assert.equal(rotated.height, 1);
assert.deepEqual(Array.from(rotated.pixels.slice(0, 4)), [255, 255, 255, 255]);
assert.equal(rotatedResultCanvas.context.translated.length, 1);
assert.equal(rotatedResultCanvas.context.rotated.length, 1);
assert.equal(rotatedResultCanvas.context.drawImages.length, 1);

createdCanvases.length = 0;
const sourceCanvasForNext = new FakeCanvas();
const rotatedCanvasForNext = new FakeCanvas();
rotatedCanvasForNext.context.returnedData = new Uint8ClampedArray([255, 255, 255, 255]);
createdCanvases.push(sourceCanvasForNext, rotatedCanvasForNext);
browserGlobal.document.createElement = (tag: string) => {
  if (tag !== "canvas") throw new Error(`Unexpected ${tag}`);
  return createdCanvases.shift() ?? new FakeCanvas();
};

const nextRotation = nextLayerRotationAny(
  {
    pixels: new Uint8ClampedArray([1, 2, 3, 255]),
    width: 1,
    height: 1,
  },
  true,
  ["#000000", "#ffffff"],
);
assert.equal(nextRotation.rotationDegrees, 45);
assert.equal(nextRotation.rotationSource.width, 1);
assert.equal(nextRotation.rotationSource.height, 1);

createdCanvases.length = 0;
const sourceCanvasReuse = new FakeCanvas();
const rotatedCanvasReuse = new FakeCanvas();
rotatedCanvasReuse.context.returnedData = new Uint8ClampedArray([0, 0, 0, 255]);
createdCanvases.push(sourceCanvasReuse, rotatedCanvasReuse);
browserGlobal.document.createElement = (tag: string) => {
  if (tag !== "canvas") throw new Error(`Unexpected ${tag}`);
  return createdCanvases.shift() ?? new FakeCanvas();
};

const wrappedRotation = nextLayerRotationAny(
  {
    pixels: new Uint8ClampedArray([1, 2, 3, 255]),
    width: 1,
    height: 1,
    rotationSource: { pixels: new Uint8ClampedArray([9, 9, 9, 255]), width: 1, height: 1 },
    rotationDegrees: 0,
  },
  false,
  ["#000000", "#ffffff"],
);
assert.equal(wrappedRotation.rotationDegrees, 315);
assert.deepEqual(Array.from(wrappedRotation.rotationSource.pixels), [9, 9, 9, 255]);

const layerForReset: any = {
  rotationSource: { pixels: new Uint8ClampedArray([1, 2, 3, 255]), width: 1, height: 1 },
  rotationDegrees: 90,
};
resetLayerRotationAny(layerForReset);
assert.equal("rotationSource" in layerForReset, false);
assert.equal("rotationDegrees" in layerForReset, false);

browserGlobal.document = originalDocument;
browserGlobal.ImageData = originalImageData;
