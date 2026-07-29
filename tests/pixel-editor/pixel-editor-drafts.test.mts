import assert from "node:assert/strict";
import { createPixelEditorDraftController } from "../../src/pixel-editor/data/pixel-editor-drafts.js";

const sourceModuleSpecifier =
  "../../src/pixel-editor/data/pixel-editor-drafts.js";

const draftMap = new Map<string, any>([
  [
    "smile",
    {
      entry: { atlas: "faces.png", key: "smile" },
      floatingLayer: undefined,
      pixels: new Uint8ClampedArray([1, 2, 3, 255]),
    },
  ],
  [
    "wave",
    {
      entry: { atlas: "hands.png", key: "wave" },
      floatingLayer: { id: 1 },
      pixels: new Uint8ClampedArray([0, 0, 0, 0]),
    },
  ],
]);

const persisted = new Map<string, Uint8ClampedArray>([
  ["smile", new Uint8ClampedArray([1, 2, 3, 255])],
]);
const dirtyKeys = new Set<string>();
const current = {
  atlasBlob: { kind: "blob" },
  atlasExists: true,
  cellLoaded: true,
  entry: { atlas: "faces.png", key: "smile" },
  floatingLayer: undefined as any,
  pixels: new Uint8ClampedArray([1, 2, 3, 255]),
  selection: { x: 0, y: 0, width: 1, height: 1 },
  traceOffsetX: 1,
  traceOffsetY: 2,
};

const dirtyIndicator = { hidden: true };
const downloadButton: any = { disabled: false, setAttribute() {}, title: "" };
const downloadEmojiButton: any = {
  disabled: false,
  setAttribute() {},
  title: "",
};
const saveButton: any = { disabled: false, setAttribute() {}, title: "" };
const status = { textContent: "" };
const undoButton: any = { disabled: false };
const redoButton: any = { disabled: false };

const controller = createPixelEditorDraftController({
  artworkDrafts: () => draftMap,
  atlasBlob: () => current.atlasBlob,
  atlasExists: () => current.atlasExists,
  cellLoaded: () => current.cellLoaded,
  cloneFloatingLayer: (value: any) =>
    value ? { ...value, cloned: true } : value,
  cloneSelection: (value: any) => (value ? { ...value, cloned: true } : value),
  currentEntry: () => current.entry,
  dirtyIndicator,
  dirtyKeys: () => dirtyKeys,
  downloadButton,
  downloadEmojiButton,
  extractPixels: () => new Uint8ClampedArray([4, 5, 6, 255]),
  floatingLayer: () => current.floatingLayer,
  floatingLayerUndoState: () => ({ redoButton, undoButton }),
  hasVisiblePixels: (value: Uint8ClampedArray) => value.some((_, index) => index % 4 === 3 && value[index] > 0),
  persistedArtwork: () => persisted,
  pixels: () => current.pixels,
  pixelsEqual: (left: Uint8ClampedArray, right: Uint8ClampedArray) =>
    left.length === right.length && left.every((value, index) => value === right[index]),
  pixelsSetter: (value: Uint8ClampedArray) => {
    current.pixels = value;
  },
  saveButton,
  selection: () => current.selection,
  status,
  traceOffsetX: () => current.traceOffsetX,
  traceOffsetY: () => current.traceOffsetY,
  translate: (_key: string, fallback: string) => fallback,
});

assert.equal(sourceModuleSpecifier, "../../src/pixel-editor/data/pixel-editor-drafts.js");
assert.equal(controller.hasVisibleArtwork(), true);
assert.equal(controller.selectionHasVisibleArtwork(), true);
assert.equal(controller.hasVisibleAtlasDraft(), true);
assert.equal(controller.hasDirtyAtlasDraft(), false);
assert.equal(controller.hasPendingAtlasLayer(), false);

controller.rememberCurrentDraft();
assert.equal(draftMap.get("smile").selection.cloned, true);

current.pixels = new Uint8ClampedArray([9, 9, 9, 255]);
controller.updateDirtyState();
assert.equal(dirtyIndicator.hidden, false);
assert.equal(dirtyKeys.has("smile"), true);

controller.updateFileButtons();
assert.equal(saveButton.disabled, false);
assert.equal(downloadButton.disabled, false);
assert.equal(downloadEmojiButton.disabled, false);

controller.pushHistory();
current.pixels = new Uint8ClampedArray([7, 7, 7, 255]);
controller.undo();
assert.deepEqual(Array.from(current.pixels), [9, 9, 9, 255]);
assert.equal(redoButton.disabled, false);
controller.redo();
assert.deepEqual(Array.from(current.pixels), [7, 7, 7, 255]);
controller.resetHistory();
assert.equal(undoButton.disabled, true);

controller.markAtlasClean("faces.png");
assert.equal(dirtyKeys.has("smile"), true);
assert.equal(dirtyIndicator.hidden, false);

controller.updatePreviewActionLabels();
assert.equal(saveButton.title, "Save atlas");
assert.equal(downloadButton.title, "Download atlas");
assert.equal(downloadEmojiButton.title, "Download 12 by 12 emoji PNG");

const unloadEvent: any = {
  preventDefaultCalled: false,
  preventDefault() {
    this.preventDefaultCalled = true;
  },
  returnValue: "",
};
dirtyKeys.add("smile");
controller.warnAboutDirtyArtwork(unloadEvent);
assert.equal(unloadEvent.preventDefaultCalled, true);
assert.equal(
  unloadEvent.returnValue,
  "Save all unsaved pixel artwork before leaving.",
);
assert.equal(status.textContent, unloadEvent.returnValue);
