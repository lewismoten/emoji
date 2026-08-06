import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  createFakeCanvas,
  createInputOptions,
  createSelectionState,
} from "../../shared/pixel-editor-atlas-io-fixtures.js";

// Additional source coverage for ../../../src/pixel-editor/data/pixel-editor-atlas-io.js

describe("pixel-editor-atlas-io input", () => {
  it("covers remaining controller branches and early returns", async () => {
    const module =
      await import("../../../src/pixel-editor/data/pixel-editor-atlas-io.js");
    const calls: string[] = [];
    const pixelBuffer = new Uint8ClampedArray([1, 2, 3, 4]);
    const fakeCanvas = createFakeCanvas(calls);
    const buildInput = (
      tool: string,
      selectionState: any,
      floatingLayer?: () => any,
    ) =>
      module.createPixelEditorInputController(
        createInputOptions(
          calls,
          fakeCanvas,
          selectionState,
          tool,
          floatingLayer,
          pixelBuffer,
        ),
      );

    buildInput(
      "bucket",
      createSelectionState({ cellLoaded: () => false }),
    ).onPointerDown({
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 1,
    });
    assert.equal(calls.length, 0);

    fakeCanvas.captured = true;
    buildInput(
      "select",
      createSelectionState({
        pointerStart: () => ({ x: 0, y: 0 }),
        shapeBase: () => pixelBuffer,
      }),
    ).onPointerMove({ clientX: 10, clientY: 10, pointerId: 2 });
    buildInput("select", createSelectionState()).onPointerDown({
      button: 0,
      clientX: 10,
      clientY: 10,
      pointerId: 2,
    });
    buildInput("eyedropper", createSelectionState()).onPointerDown({
      button: 0,
      clientX: 5,
      clientY: 5,
      pointerId: 2,
    });
    buildInput("pencil", createSelectionState()).onPointerDown({
      button: 0,
      clientX: 12,
      clientY: 12,
      pointerId: 2,
    });
    buildInput("ellipse", createSelectionState()).onPointerDown({
      button: 0,
      clientX: 14,
      clientY: 14,
      pointerId: 2,
    });
    for (const [tool, coord] of [
      ["pencil", 15],
      ["line", 18],
      ["rectangle", 20],
    ] as const) {
      buildInput(
        tool,
        createSelectionState({
          pointerStart: () => ({ x: 0, y: 0 }),
          shapeBase: () => pixelBuffer,
        }),
      ).onPointerMove({ clientX: coord, clientY: coord, pointerId: 2 });
    }
    fakeCanvas.captured = false;
    buildInput(
      "line",
      createSelectionState({
        pointerStart: () => ({ x: 0, y: 0 }),
        shapeBase: () => pixelBuffer,
      }),
    ).onPointerMove({ clientX: 10, clientY: 10, pointerId: 2 });
    fakeCanvas.captured = true;
    buildInput(
      "select",
      createSelectionState({
        layerDragOrigin: () => ({ x: 1, y: 1 }),
        layerDragStart: () => ({ x: 0, y: 0 }),
        pointerStart: () => ({ x: 0, y: 0 }),
        shapeBase: () => pixelBuffer,
      }),
      () => ({ x: 1, y: 1 }),
    ).onPointerMove({ clientX: 30, clientY: 30, pointerId: 2 });
    buildInput(
      "select",
      createSelectionState({
        pointerStart: () => ({ x: 0, y: 0 }),
        shapeBase: () => pixelBuffer,
      }),
    ).onPointerCancel({ pointerId: 2 });
    buildInput("select", createSelectionState(), () => ({
      x: 0,
      y: 0,
    })).onCanvasKeyDown({
      altKey: false,
      ctrlKey: true,
      key: "ArrowLeft",
      metaKey: false,
      preventDefault() {
        calls.push("prevent-rotate-left");
      },
      shiftKey: false,
    });
    buildInput("select", createSelectionState(), () => ({
      x: 0,
      y: 0,
    })).onCanvasKeyDown({
      altKey: false,
      ctrlKey: false,
      key: "ArrowUp",
      metaKey: false,
      preventDefault() {},
      shiftKey: true,
    });
    buildInput("select", createSelectionState(), () => ({
      x: 0,
      y: 0,
    })).onCanvasKeyDown({
      altKey: false,
      ctrlKey: false,
      key: "ArrowRight",
      metaKey: false,
      preventDefault() {
        calls.push("prevent-move");
      },
      shiftKey: false,
    });
    buildInput("select", createSelectionState()).onEditorKeyDown({
      altKey: false,
      ctrlKey: true,
      key: "c",
      metaKey: false,
      preventDefault() {},
      shiftKey: false,
    });
    buildInput("select", createSelectionState()).onEditorKeyDown({
      altKey: false,
      ctrlKey: true,
      key: "z",
      metaKey: false,
      preventDefault() {
        calls.push("prevent-redo-shift-z");
      },
      shiftKey: true,
    });

    assert.equal(calls.includes("pick"), true);
    assert.equal(calls.includes("select"), true);
    assert.equal(calls.includes("draw-line"), true);
    assert.equal(calls.includes("draw-shape:rectangle"), true);
    assert.equal(
      calls.some((entry) => entry.startsWith("move:")),
      true,
    );
    assert.equal(calls.includes("transform:flip-vertical"), true);
    assert.equal(calls.includes("transform:rotate-left"), true);
    assert.equal(calls.includes("prevent-rotate-left"), true);
    assert.equal(calls.includes("prevent-move"), true);
    assert.equal(calls.includes("redo"), true);
    assert.equal(calls.includes("prevent-redo-shift-z"), true);
    assert.equal(calls.includes("copy-selection"), true);
  });
});
