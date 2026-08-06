import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { CELL_SIZE } from "../../../src/pixel-editor/core/pixel-editor-constants.js";
import {
  boundsFromPoints,
  clamp,
  cloneFloatingLayer,
  cloneSelection,
  currentColorValue,
  drawLineOnPixels,
  drawShapeOnPixels,
  extractPixels,
  floodFillPixels,
  hasVisiblePixels,
  layerAxisBounds,
  layerPositionAllowed,
  paintPixelInto,
  pixelOffset,
  pixelsEqual,
  trimVisiblePixels,
} from "../../../src/pixel-editor/core/pixel-editor-geometry-helpers.js";

function alphaAt(pixels: Uint8ClampedArray, x: number, y: number) {
  return pixels[pixelOffset(x, y) + 3];
}

function redAt(pixels: Uint8ClampedArray, x: number, y: number) {
  return pixels[pixelOffset(x, y)];
}

describe("pixel-editor-geometry-helpers", () => {
  it("covers geometry, painting, shape, and fill helpers", () => {
    assert.equal(pixelOffset(1, 2), (2 * CELL_SIZE + 1) * 4);

    assert.deepEqual(boundsFromPoints({ x: 5, y: 1 }, { x: 2, y: 4 }), {
      x: 2,
      y: 1,
      width: 4,
      height: 4,
    });

    const source = new Uint8ClampedArray([
      1, 2, 3, 255, 4, 5, 6, 255, 7, 8, 9, 255, 10, 11, 12, 255, 13, 14, 15,
      255, 16, 17, 18, 255,
    ]);
    assert.deepEqual(
      Array.from(extractPixels(source, 3, 1, 0, 2, 2)),
      [4, 5, 6, 255, 7, 8, 9, 255, 13, 14, 15, 255, 16, 17, 18, 255],
    );

    const trimmedSource = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
    paintPixelInto(trimmedSource, { x: 2, y: 3 }, [255, 0, 0, 255]);
    paintPixelInto(trimmedSource, { x: 4, y: 5 }, [0, 255, 0, 255]);
    const trimmed = trimVisiblePixels(trimmedSource, CELL_SIZE, CELL_SIZE)!;
    assert.equal(trimmed.width, 3);
    assert.equal(trimmed.height, 3);
    assert.equal(trimmed.x, 2);
    assert.equal(trimmed.y, 3);
    assert.deepEqual(Array.from(trimmed.pixels.slice(0, 4)), [255, 0, 0, 255]);
    assert.deepEqual(Array.from(trimmed.pixels.slice(-4)), [0, 255, 0, 255]);
    assert.equal(trimVisiblePixels(new Uint8ClampedArray(16), 2, 2), undefined);

    const selection = { x: 1, y: 2, width: 3, height: 4 };
    assert.deepEqual(cloneSelection(selection), selection);
    assert.notEqual(cloneSelection(selection), selection);
    assert.equal(cloneSelection(undefined), undefined);

    const floatingLayer = {
      x: 1,
      y: 2,
      width: 1,
      height: 1,
      pixels: new Uint8ClampedArray([1, 2, 3, 255]),
      skinTones: ["#111111"],
      rotationSource: {
        width: 1,
        height: 1,
        pixels: new Uint8ClampedArray([4, 5, 6, 255]),
      },
    };
    const clonedFloatingLayer = cloneFloatingLayer(floatingLayer)!;
    assert.deepEqual(clonedFloatingLayer, floatingLayer);
    assert.notEqual(clonedFloatingLayer.pixels, floatingLayer.pixels);
    assert.notEqual(clonedFloatingLayer.skinTones, floatingLayer.skinTones);
    assert.notEqual(
      clonedFloatingLayer.rotationSource?.pixels,
      floatingLayer.rotationSource?.pixels,
    );
    assert.equal(cloneFloatingLayer(undefined), undefined);

    assert.equal(hasVisiblePixels(new Uint8ClampedArray([0, 0, 0, 0])), false);
    assert.equal(hasVisiblePixels(new Uint8ClampedArray([0, 0, 0, 255])), true);

    assert.equal(clamp(5, 1, 4), 4);
    assert.equal(clamp(-1, 1, 4), 1);
    assert.equal(clamp(3, 1, 4), 3);

    assert.equal(
      pixelsEqual(new Uint8ClampedArray([1, 2]), new Uint8ClampedArray([1, 2])),
      true,
    );
    assert.equal(
      pixelsEqual(new Uint8ClampedArray([1, 2]), new Uint8ClampedArray([2, 1])),
      false,
    );
    assert.equal(
      pixelsEqual(new Uint8ClampedArray([1, 2]), new Uint8ClampedArray([1])),
      false,
    );

    assert.deepEqual(layerAxisBounds(3, 12), [0, 9]);
    assert.deepEqual(layerAxisBounds(14, 12), [-2, 0]);
    assert.equal(layerPositionAllowed({ width: 3, height: 3 }, 9, 9, 12), true);
    assert.equal(
      layerPositionAllowed({ width: 3, height: 3 }, 10, 0, 12),
      false,
    );

    assert.deepEqual(currentColorValue("transparent"), [0, 0, 0, 0]);
    assert.deepEqual(currentColorValue("#a1b2c3"), [161, 178, 195, 255]);

    const canvasPixels = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
    paintPixelInto(canvasPixels, { x: 0, y: 0 }, [9, 8, 7, 255]);
    assert.deepEqual(Array.from(canvasPixels.slice(0, 4)), [9, 8, 7, 255]);

    drawLineOnPixels(
      canvasPixels,
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      [255, 0, 0, 255],
    );
    assert.equal(alphaAt(canvasPixels, 1, 1), 255);
    assert.equal(redAt(canvasPixels, 2, 2), 255);

    const rectangleOutline = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
    drawShapeOnPixels(
      rectangleOutline,
      { x: 1, y: 1 },
      { x: 3, y: 3 },
      "rectangle",
      [255, 0, 0, 255],
      false,
    );
    assert.equal(alphaAt(rectangleOutline, 1, 1), 255);
    assert.equal(alphaAt(rectangleOutline, 2, 2), 0);

    const rectangleFill = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
    drawShapeOnPixels(
      rectangleFill,
      { x: 1, y: 1 },
      { x: 3, y: 3 },
      "rectangle",
      [255, 0, 0, 255],
      true,
    );
    assert.equal(alphaAt(rectangleFill, 2, 2), 255);

    const ellipseOutline = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
    drawShapeOnPixels(
      ellipseOutline,
      { x: 1, y: 1 },
      { x: 5, y: 3 },
      "ellipse",
      [255, 0, 0, 255],
      false,
    );
    assert.equal(alphaAt(ellipseOutline, 3, 2), 0);
    assert.equal(alphaAt(ellipseOutline, 1, 2), 255);

    const ellipseFill = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
    drawShapeOnPixels(
      ellipseFill,
      { x: 1, y: 1 },
      { x: 5, y: 3 },
      "ellipse",
      [255, 0, 0, 255],
      true,
    );
    assert.equal(alphaAt(ellipseFill, 3, 2), 255);

    const fillPixels = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
    paintPixelInto(fillPixels, { x: 0, y: 0 }, [1, 1, 1, 255]);
    paintPixelInto(fillPixels, { x: 1, y: 0 }, [1, 1, 1, 255]);
    paintPixelInto(fillPixels, { x: 0, y: 1 }, [1, 1, 1, 255]);
    paintPixelInto(fillPixels, { x: 1, y: 1 }, [1, 1, 1, 255]);
    paintPixelInto(fillPixels, { x: 2, y: 2 }, [9, 9, 9, 255]);
    floodFillPixels(fillPixels, { x: 0, y: 0 }, [2, 2, 2, 255]);
    assert.deepEqual(
      Array.from(fillPixels.slice(0, 8)),
      [2, 2, 2, 255, 2, 2, 2, 255],
    );
    assert.deepEqual(
      Array.from(fillPixels.slice(pixelOffset(2, 2), pixelOffset(2, 2) + 4)),
      [9, 9, 9, 255],
    );
    floodFillPixels(fillPixels, { x: 2, y: 2 }, [9, 9, 9, 255]);
  });
});
