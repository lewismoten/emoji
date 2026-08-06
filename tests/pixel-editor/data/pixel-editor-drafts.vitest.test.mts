import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createPixelEditorDraftController } from "../../../src/pixel-editor/data/pixel-editor-drafts.js";

describe("pixel-editor-drafts", () => {
  it("tracks draft visibility, dirty state, history, and file actions", () => {
    const sourceModuleSpecifier =
      "../../../src/pixel-editor/data/pixel-editor-drafts.js";

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
    const downloadButton: any = {
      disabled: false,
      setAttribute() {},
      title: "",
    };
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
      cloneSelection: (value: any) =>
        value ? { ...value, cloned: true } : value,
      currentEntry: () => current.entry,
      dirtyIndicator,
      dirtyKeys: () => dirtyKeys,
      downloadButton,
      downloadEmojiButton,
      extractPixels: () => new Uint8ClampedArray([4, 5, 6, 255]),
      floatingLayer: () => current.floatingLayer,
      floatingLayerUndoState: () => ({ redoButton, undoButton }),
      hasVisiblePixels: (value: Uint8ClampedArray<ArrayBufferLike>) =>
        value.some((_, index) => index % 4 === 3 && value[index] > 0),
      persistedArtwork: () => persisted,
      pixels: () => current.pixels,
      pixelsEqual: (
        left: Uint8ClampedArray<ArrayBufferLike>,
        right: Uint8ClampedArray<ArrayBufferLike>,
      ) =>
        left.length === right.length &&
        left.every((value, index) => value === right[index]),
      pixelsSetter: (value: Uint8ClampedArray<ArrayBufferLike>) => {
        current.pixels = value as Uint8ClampedArray<ArrayBuffer>;
      },
      saveButton,
      selection: () => current.selection,
      status,
      traceOffsetX: () => current.traceOffsetX,
      traceOffsetY: () => current.traceOffsetY,
      translate: (_key: string, fallback: string) => fallback,
    });

    assert.equal(
      sourceModuleSpecifier,
      "../../../src/pixel-editor/data/pixel-editor-drafts.js",
    );
    assert.equal(controller.hasVisibleArtwork(), true);
    assert.equal(controller.selectionHasVisibleArtwork(), true);
    assert.equal(controller.hasVisibleAtlasDraft(), true);
    assert.equal(controller.hasDirtyAtlasDraft(), false);
    assert.equal(controller.hasPendingAtlasLayer(), false);

    current.selection = undefined as any;
    assert.equal(controller.selectionHasVisibleArtwork(), false);
    current.selection = { x: 0, y: 0, width: 1, height: 1 };

    controller.rememberCurrentDraft();
    assert.equal(draftMap.get("smile").selection.cloned, true);

    current.cellLoaded = false;
    controller.rememberCurrentDraft();
    assert.equal(draftMap.size, 2);
    current.cellLoaded = true;
    current.entry = { atlas: "missing.png", key: "missing" } as any;
    controller.rememberCurrentDraft();
    current.entry = { atlas: "faces.png", key: "smile" };

    current.pixels = new Uint8ClampedArray([9, 9, 9, 255]);
    controller.updateDirtyState();
    assert.equal(dirtyIndicator.hidden, false);
    assert.equal(dirtyKeys.has("smile"), true);
    current.entry = { atlas: "faces.png", key: "smile" };
    current.floatingLayer = undefined;
    current.cellLoaded = true;
    persisted.set("smile", current.pixels.slice());
    controller.updateDirtyState();
    assert.equal(dirtyKeys.has("smile"), false);
    assert.equal(dirtyIndicator.hidden, true);

    current.cellLoaded = false;
    controller.updateDirtyState();
    assert.equal(dirtyIndicator.hidden, true);
    current.cellLoaded = true;
    dirtyKeys.add("smile");
    dirtyIndicator.hidden = false;

    controller.updateFileButtons();
    assert.equal(saveButton.disabled, false);
    assert.equal(downloadButton.disabled, false);
    assert.equal(downloadEmojiButton.disabled, false);
    current.entry = undefined as any;
    controller.updateFileButtons();
    assert.equal(downloadEmojiButton.disabled, true);
    current.entry = { atlas: "faces.png", key: "smile" };
    current.cellLoaded = false;
    controller.updateFileButtons();
    assert.equal(downloadEmojiButton.disabled, true);
    current.cellLoaded = true;
    current.pixels = new Uint8ClampedArray([0, 0, 0, 0]);
    controller.updateFileButtons();
    assert.equal(downloadEmojiButton.disabled, true);
    current.pixels = new Uint8ClampedArray([9, 9, 9, 255]);

    current.floatingLayer = { id: 2 };
    controller.updateFileButtons();
    assert.equal(downloadEmojiButton.disabled, true);
    current.floatingLayer = undefined;

    current.atlasBlob = undefined as any;
    controller.updateFileButtons();
    assert.equal(saveButton.disabled, true);
    assert.equal(downloadButton.disabled, true);
    current.atlasBlob = { kind: "blob" };
    current.pixels = new Uint8ClampedArray([0, 0, 0, 0]);
    draftMap.set("ghost", {
      entry: { atlas: "faces.png", key: "ghost" },
      pixels: new Uint8ClampedArray([1, 1, 1, 255]),
    });
    assert.equal(controller.hasVisibleAtlasDraft(), true);
    current.pixels = new Uint8ClampedArray([9, 9, 9, 255]);

    controller.pushHistory();
    current.pixels = new Uint8ClampedArray([7, 7, 7, 255]);
    controller.undo();
    assert.deepEqual(Array.from(current.pixels), [9, 9, 9, 255]);
    assert.equal(redoButton.disabled, false);
    controller.redo();
    assert.deepEqual(Array.from(current.pixels), [7, 7, 7, 255]);
    controller.resetHistory();
    assert.equal(undoButton.disabled, true);
    controller.undo();
    controller.redo();

    controller.markAtlasClean("faces.png");
    assert.equal(dirtyKeys.has("smile"), true);
    assert.equal(dirtyIndicator.hidden, false);
    controller.markAtlasClean("hands.png");
    assert.equal(dirtyKeys.has("wave"), false);

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

    dirtyKeys.clear();
    status.textContent = "";
    const cleanUnloadEvent: any = {
      preventDefaultCalled: false,
      preventDefault() {
        this.preventDefaultCalled = true;
      },
      returnValue: "",
    };
    controller.warnAboutDirtyArtwork(cleanUnloadEvent);
    assert.equal(cleanUnloadEvent.preventDefaultCalled, false);
    assert.equal(cleanUnloadEvent.returnValue, "");
    assert.equal(status.textContent, "");

    current.entry = undefined as any;
    current.pixels = new Uint8ClampedArray([0, 0, 0, 0]);
    assert.equal(controller.hasDirtyAtlasDraft(), false);
    assert.equal(controller.hasPendingAtlasLayer(), false);
    assert.equal(controller.hasVisibleAtlasDraft(), false);
    assert.equal(controller.hasVisibleArtwork(), false);
    controller.updateDirtyState();
    assert.equal(dirtyIndicator.hidden, true);
  });
});
