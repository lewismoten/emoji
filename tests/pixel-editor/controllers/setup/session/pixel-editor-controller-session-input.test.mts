import assert from "node:assert/strict";
import { loadControllerSessionFixture } from "./pixel-editor-controller-session-fixture.mjs";

const fixture = await loadControllerSessionFixture();

const inputOptions = fixture.inputStub.inputCalls[0];
assert.equal(inputOptions.dialog, "dialog");
assert.equal(inputOptions.canvas, fixture.elements.canvas);
assert.equal(inputOptions.copyArtButton, fixture.elements.copyArtButton);
assert.equal(
  inputOptions.copySelectionButton,
  fixture.elements.copySelectionButton,
);
assert.equal(
  inputOptions.copyPixelArt,
  fixture.visual.transferController.copyPixelArt,
);
assert.equal(
  inputOptions.copySelection,
  fixture.visual.transferController.copySelection,
);
assert.equal(
  inputOptions.pastePixelArt,
  fixture.visual.transferController.pastePixelArt,
);
assert.equal(inputOptions.undo, fixture.visual.runtimeController.undo);
assert.equal(inputOptions.redo, fixture.visual.runtimeController.redo);
assert.equal(inputOptions.paletteController, fixture.visual.paletteController);
inputOptions.releasePointerState();
assert.equal(fixture.state.pointerStart, undefined);
assert.equal(fixture.state.pointerPrevious, undefined);
assert.equal(fixture.state.shapeBase, undefined);
assert.equal(fixture.state.layerDragStart, undefined);
assert.equal(fixture.state.layerDragOrigin, undefined);
inputOptions.setSelection("new-selection");
assert.equal(fixture.state.selection, "new-selection");
inputOptions.setLayerDragOrigin("drag-origin");
inputOptions.setLayerDragStart("drag-start");
inputOptions.setPointerPrevious("pointer-prev");
inputOptions.setPointerStart("pointer-start");
inputOptions.setShapeBase("shape-base");
assert.equal(fixture.state.layerDragOrigin, "drag-origin");
assert.equal(fixture.state.layerDragStart, "drag-start");
assert.equal(fixture.state.pointerPrevious, "pointer-prev");
assert.equal(fixture.state.pointerStart, "pointer-start");
assert.equal(fixture.state.shapeBase, "shape-base");
