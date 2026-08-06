import assert from "node:assert/strict";
import { beforeEach, describe, it, vi } from "vitest";

const atlasCalls: any[] = [];
const inputCalls: any[] = [];
const sessionCalls: any[] = [];

vi.mock(
  "../../../../src/pixel-editor/core/pixel-editor-geometry-helpers.js",
  () => ({
    boundsFromPoints: "bounds-from-points",
    clamp: "clamp-helper",
    cloneFloatingLayer: "clone-floating-layer",
    cloneSelection: "clone-selection",
  }),
);

vi.mock("../../../../src/pixel-editor/core/pixel-editor-constants.js", () => ({
  CELL_SIZE: 12,
}));

vi.mock("../../../../src/pixel-editor/data/pixel-editor-atlas-io.js", () => ({
  createBlankAtlas: "create-blank-atlas",
  createPixelEditorInputController(options: any) {
    inputCalls.push(options);
    return { kind: "input-controller" };
  },
  extractCell: "extract-cell",
  getNestedFileHandle: "get-nested-file-handle",
}));

vi.mock(
  "../../../../src/pixel-editor/controllers/pixel-editor-atlas.js",
  () => ({
    createPixelEditorAtlasController(options: any) {
      atlasCalls.push(options);
      return { kind: "atlas-controller" };
    },
  }),
);

vi.mock(
  "../../../../src/pixel-editor/controllers/pixel-editor-session.js",
  () => ({
    createPixelEditorSessionController(options: any) {
      sessionCalls.push(options);
      return { kind: "session-controller" };
    },
  }),
);

describe("pixel-editor-controller-session", () => {
  beforeEach(() => {
    atlasCalls.length = 0;
    inputCalls.length = 0;
    sessionCalls.length = 0;
  });

  it("wires session, atlas, and input controllers through the real source module", async () => {
    const module =
      await import("../../../../src/pixel-editor/controllers/setup/pixel-editor-controller-session.js");

    const state: any = {
      artworkDrafts: new Map([["draft", true]]),
      atlasBlob: "blob",
      atlasExists: true,
      atlasHeight: 4,
      atlasWidth: 5,
      cellLoaded: true,
      currentEmoji: "😀",
      currentEntry: { key: "grin" },
      directoryHandle: "directory",
      floatingLayer: { id: 1 },
      layerDragOrigin: { x: 5, y: 6 },
      layerDragStart: { x: 3, y: 4 },
      persistedArtwork: new Map([["persisted", true]]),
      pixels: new Uint8ClampedArray([1, 2, 3, 4]),
      pointerPrevious: { x: 2, y: 2 },
      pointerStart: { x: 1, y: 1 },
      selection: { x: 7, y: 8, width: 2, height: 3 },
      shapeBase: { x: 9, y: 10 },
      tool: "select",
      traceOffsetX: 11,
      traceOffsetY: 12,
    };

    const draftController = {
      kind: "draft-controller",
    };
    const elements: any = {
      canvas: "canvas",
      copyArtButton: "copy-art",
      copySelectionButton: "copy-selection",
      downloadButton: "download",
      downloadEmojiButton: "download-emoji",
      location: { textContent: "" },
      pasteArtButton: "paste-art",
      redoButton: "redo",
      saveButton: "save",
      status: { textContent: "" },
      undoButton: "undo",
      view: "view",
    };
    const visual: any = {
      modeController: {
        updateTransferButtons() {
          return "update-transfer-buttons";
        },
      },
      paletteController: { kind: "palette" },
      previewController: { kind: "preview" },
      renderController: { kind: "render" },
      runtimeController: {
        loadManifest() {
          return "manifest";
        },
        redo() {
          return "redo";
        },
        refreshFontBuild() {
          return "font-build";
        },
        refreshTranslations() {
          return "translations";
        },
        renderLocationText() {
          return "location";
        },
        undo() {
          return "undo";
        },
      },
      toolController: {
        drawLine() {
          return "line";
        },
        drawShape() {
          return "shape";
        },
        floodFill() {
          return "fill";
        },
      },
      transferController: {
        bakeFloatingLayer() {
          return "bake";
        },
        cancelFloatingLayer() {
          return "cancel";
        },
        copyPixelArt() {
          return "copy-art";
        },
        copySelection() {
          return "copy-selection";
        },
        moveFloatingLayer() {
          return "move-layer";
        },
        pastePixelArt() {
          return "paste-art";
        },
        transformFloatingLayer() {
          return "transform-layer";
        },
      },
    };
    const translate = (key: string, fallback: string) => `${key}:${fallback}`;

    const controllers = module.createPixelEditorSessionControllers({
      dialog: "dialog",
      draftController,
      elements,
      state,
      translate,
      visual,
    });

    assert.equal(
      (controllers.sessionController as any).kind,
      "session-controller",
    );
    assert.equal((controllers.atlasController as any).kind, "atlas-controller");
    assert.equal((controllers.inputController as any).kind, "input-controller");
    assert.equal(sessionCalls.length, 1);
    assert.equal(atlasCalls.length, 1);
    assert.equal(inputCalls.length, 1);

    const sessionOptions = sessionCalls[0];
    assert.equal(sessionOptions.cellSize, 12);
    assert.equal(sessionOptions.artworkDrafts(), state.artworkDrafts);
    assert.deepEqual(sessionOptions.getAtlasDimensions(), {
      width: 5,
      height: 4,
    });
    assert.deepEqual(sessionOptions.getAtlasState(), {
      atlasBlob: "blob",
      atlasExists: true,
      cellLoaded: true,
    });
    assert.equal(sessionOptions.currentEntry(), state.currentEntry);
    assert.equal(sessionOptions.currentEmoji(), "😀");
    assert.equal(sessionOptions.getPixels(), state.pixels);
    assert.equal(sessionOptions.persistedArtwork(), state.persistedArtwork);
    sessionOptions.setAtlasBlob("next-blob");
    sessionOptions.setAtlasDimensions(20, 21);
    sessionOptions.setAtlasExists(false);
    sessionOptions.setCellLoaded(false);
    sessionOptions.setCurrentEmoji("😎");
    sessionOptions.setCurrentEntry({ key: "cool" });
    sessionOptions.setFloatingLayer(undefined);
    sessionOptions.setLocationText("new-location");
    sessionOptions.setPixels(new Uint8ClampedArray([9, 9, 9, 255]));
    sessionOptions.setSelection(undefined);
    sessionOptions.setStatusText("status");
    sessionOptions.setTraceOffsets(30, 31);
    assert.equal(elements.location.textContent, "new-location");
    assert.equal(elements.status.textContent, "status");
    assert.equal(state.atlasBlob, "next-blob");
    assert.equal(state.atlasWidth, 20);
    assert.equal(state.atlasHeight, 21);
    assert.equal(state.atlasExists, false);
    assert.equal(state.cellLoaded, false);
    assert.equal(state.currentEmoji, "😎");
    assert.deepEqual(state.currentEntry, { key: "cool" });
    assert.equal(state.floatingLayer, undefined);
    assert.deepEqual(Array.from(state.pixels), [9, 9, 9, 255]);
    assert.equal(state.selection, undefined);
    assert.equal(state.traceOffsetX, 30);
    assert.equal(state.traceOffsetY, 31);

    const atlasOptions = atlasCalls[0];
    assert.equal(atlasOptions.currentEntry(), state.currentEntry);
    assert.equal(atlasOptions.getAtlasBlob(), "next-blob");
    assert.deepEqual(atlasOptions.getAtlasDimensions(), {
      width: 20,
      height: 21,
    });
    assert.equal(atlasOptions.getDirectoryHandle(), "directory");
    assert.deepEqual(Array.from(atlasOptions.getPixels()), [9, 9, 9, 255]);
    atlasOptions.setAtlasBlob("atlas-blob-2");
    atlasOptions.setAtlasExists(true);
    atlasOptions.setDirectoryHandle("directory-2");
    atlasOptions.writeStatus("atlas-status");
    assert.equal(state.atlasBlob, "atlas-blob-2");
    assert.equal(state.atlasExists, true);
    assert.equal(state.directoryHandle, "directory-2");
    assert.equal(elements.status.textContent, "atlas-status");

    const inputOptions = inputCalls[0];
    assert.equal(inputOptions.canvas, "canvas");
    assert.equal(inputOptions.cellSize, 12);
    assert.equal(inputOptions.dialog, "dialog");
    assert.equal(inputOptions.copyArtButton, "copy-art");
    assert.equal(inputOptions.copySelectionButton, "copy-selection");
    assert.equal(inputOptions.pasteArtButton, "paste-art");
    assert.equal(inputOptions.redoButton, "redo");
    assert.equal(inputOptions.undoButton, "undo");
    assert.equal(inputOptions.view, "view");
    assert.equal(inputOptions.floatingLayer(), undefined);
    assert.deepEqual(Array.from(inputOptions.pixels()), [9, 9, 9, 255]);
    assert.equal(inputOptions.toolState(), "select");
    assert.equal(inputOptions.selectionState.cellLoaded(), false);
    assert.equal(
      inputOptions.selectionState.currentEntry(),
      state.currentEntry,
    );
    assert.deepEqual(inputOptions.selectionState.layerDragOrigin(), {
      x: 5,
      y: 6,
    });
    assert.deepEqual(inputOptions.selectionState.layerDragStart(), {
      x: 3,
      y: 4,
    });
    assert.deepEqual(inputOptions.selectionState.pointerPrevious(), {
      x: 2,
      y: 2,
    });
    assert.deepEqual(inputOptions.selectionState.pointerStart(), {
      x: 1,
      y: 1,
    });
    assert.deepEqual(inputOptions.selectionState.shapeBase(), { x: 9, y: 10 });
    inputOptions.setLayerDragOrigin("origin-2");
    inputOptions.setLayerDragStart("start-2");
    inputOptions.setPointerPrevious("previous-2");
    inputOptions.setPointerStart("pointer-2");
    inputOptions.setSelection("selection-2");
    inputOptions.setShapeBase("shape-2");
    inputOptions.releasePointerState();
    assert.equal(state.layerDragOrigin, undefined);
    assert.equal(state.layerDragStart, undefined);
    assert.equal(state.pointerPrevious, undefined);
    assert.equal(state.pointerStart, undefined);
    assert.equal(state.shapeBase, undefined);
  });
});
