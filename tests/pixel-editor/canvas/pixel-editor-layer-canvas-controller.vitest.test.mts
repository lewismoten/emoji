import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, vi } from "vitest";

const helperCalls: any[] = [];

vi.mock("../../../src/pixel-editor/core/pixel-editor-constants.js", () => ({
  CELL_SIZE: 12,
}));

vi.mock(
  "../../../src/pixel-editor/layers/pixel-editor-layer-helpers.js",
  () => ({
    effectiveLayerPixels(layer: any) {
      helperCalls.push(layer);
      return layer.pixels;
    },
  }),
);

const originalRequestAnimationFrame = Object.getOwnPropertyDescriptor(
  globalThis,
  "requestAnimationFrame",
);
const originalCancelAnimationFrame = Object.getOwnPropertyDescriptor(
  globalThis,
  "cancelAnimationFrame",
);

describe("pixel-editor-layer-canvas-controller", () => {
  beforeEach(() => {
    helperCalls.length = 0;
  });

  afterEach(() => {
    if (originalRequestAnimationFrame) {
      Object.defineProperty(
        globalThis,
        "requestAnimationFrame",
        originalRequestAnimationFrame,
      );
    } else {
      Reflect.deleteProperty(globalThis, "requestAnimationFrame");
    }
    if (originalCancelAnimationFrame) {
      Object.defineProperty(
        globalThis,
        "cancelAnimationFrame",
        originalCancelAnimationFrame,
      );
    } else {
      Reflect.deleteProperty(globalThis, "cancelAnimationFrame");
    }
  });

  it("renders layers and selection state through the real source module", async () => {
    const module =
      await import("../../../src/pixel-editor/canvas/pixel-editor-layer-canvas-controller.js");

    const calls: string[] = [];
    let frameId = 0;
    let lastFrame: ((timestamp: number) => void) | undefined;
    Object.defineProperty(globalThis, "requestAnimationFrame", {
      configurable: true,
      value(callback: (timestamp: number) => void) {
        lastFrame = callback;
        frameId += 1;
        calls.push("request-animation-frame");
        return frameId;
      },
    });
    Object.defineProperty(globalThis, "cancelAnimationFrame", {
      configurable: true,
      value(id: number) {
        calls.push(`cancel-animation-frame:${id}`);
      },
    });

    const context = {
      beginPath() {
        calls.push("begin-path");
      },
      clearRect() {
        calls.push("clear-rect");
      },
      drawImage() {
        calls.push("draw-image");
      },
      fillRect() {
        calls.push("fill-rect");
      },
      lineWidth: 0,
      lineTo() {},
      moveTo() {},
      restore() {
        calls.push("restore");
      },
      save() {
        calls.push("save");
      },
      setLineDash() {
        calls.push("set-line-dash");
      },
      stroke() {
        calls.push("stroke");
      },
      strokeRect() {
        calls.push("stroke-rect");
      },
    } as any;

    let selectionDash = 0;
    const state = {
      currentEmoji: "😀",
      currentSelection: { x: 1, y: 1, width: 2, height: 2 } as any,
      currentTool: "select",
      floatingLayer: undefined as any,
      pixels: new Uint8ClampedArray(12 * 12 * 4),
      view: { hidden: false },
    };
    state.pixels[3] = 255;
    state.pixels[0] = 10;
    state.pixels[1] = 20;
    state.pixels[2] = 30;

    const controller = module.createPixelEditorCanvasController({
      context,
      currentEmoji: () => state.currentEmoji,
      currentSelection: () => state.currentSelection,
      currentTool: () => state.currentTool,
      displaySize: 240,
      draftController: {
        rememberCurrentDraft() {
          calls.push("remember-draft");
        },
        updateDirtyState() {
          calls.push("update-dirty");
        },
        updateFileButtons() {
          calls.push("update-file-buttons");
        },
        updateHistoryButtons() {
          calls.push("update-history-buttons");
        },
      },
      drawArtworkPreview() {
        calls.push("draw-artwork-preview");
      },
      drawCheckerboard() {
        calls.push("draw-checkerboard");
      },
      floatingLayer: () => state.floatingLayer,
      paletteController: {
        activePaletteColors: () => ["#fff"],
      },
      pixelOffset: (x: number, y: number) => (y * 12 + x) * 4,
      pixels: () => state.pixels,
      selectionDashOffset: () => selectionDash,
      setSelectionDashOffset(value: number) {
        selectionDash = value;
        calls.push(`set-selection-dash:${value}`);
      },
      traceAlpha: { value: "50" },
      traceCanvas: {},
      updateEditorModePanels() {
        calls.push("update-editor-mode-panels");
      },
      updateTransferButtons() {
        calls.push("update-transfer-buttons");
      },
      view: state.view,
    });

    controller.draw();
    assert.equal(calls.includes("clear-rect"), true);
    assert.equal(calls.includes("draw-checkerboard"), true);
    assert.equal(calls.includes("draw-image"), true);
    assert.equal(calls.includes("fill-rect"), true);
    assert.equal(calls.includes("stroke"), true);
    assert.equal(calls.includes("draw-artwork-preview"), true);
    assert.equal(calls.includes("remember-draft"), true);
    assert.equal(calls.includes("update-dirty"), true);
    assert.equal(calls.includes("update-file-buttons"), true);
    assert.equal(calls.includes("update-transfer-buttons"), true);
    assert.equal(calls.includes("update-history-buttons"), true);
    assert.equal(calls.includes("update-editor-mode-panels"), true);
    assert.equal(calls.includes("request-animation-frame"), true);

    state.floatingLayer = {
      x: 1,
      y: 2,
      width: 1,
      height: 1,
      pixels: new Uint8ClampedArray([5, 6, 7, 255]),
    };
    controller.draw();
    assert.equal(helperCalls.length >= 1, true);
    assert.equal(
      calls.filter((entry) => entry === "stroke-rect").length >= 1,
      true,
    );
    assert.equal(controller.pointInFloatingLayer({ x: 1, y: 2 }), true);
    assert.equal(controller.pointInFloatingLayer({ x: 5, y: 5 }), false);

    state.floatingLayer = undefined;
    state.view.hidden = true;
    controller.draw();
    assert.equal(
      calls.some((entry) =>
        String(entry).startsWith("cancel-animation-frame:"),
      ),
      true,
    );

    state.currentSelection = { x: 1, y: 1, width: 2, height: 2 };
    state.currentTool = "select";
    controller.draw();
    state.view.hidden = true;
    lastFrame?.(90);
    assert.equal(
      calls.some((entry) => entry === "request-animation-frame"),
      true,
    );

    state.view.hidden = false;
    state.currentSelection = { x: 1, y: 1, width: 2, height: 2 };
    state.currentTool = "select";
    lastFrame?.(110);
    assert.equal(
      calls.some((entry) => String(entry).startsWith("set-selection-dash:")),
      true,
    );

    state.currentTool = "brush";
    controller.draw(false);
    assert.equal(calls.includes("remember-draft"), true);
  });
});
