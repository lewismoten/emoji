import assert from "node:assert/strict";
import { beforeEach, describe, it, vi } from "vitest";

const draftCalls: any[] = [];
const startupCalls: any[] = [];
const sessionCalls: any[] = [];
const visualCalls: any[] = [];

vi.mock("../../../src/pixel-editor/data/pixel-editor-drafts.js", () => ({
  createPixelEditorDraftController(options: any) {
    draftCalls.push(options);
    return { kind: "draft-controller" };
  },
}));

vi.mock(
  "../../../src/pixel-editor/core/pixel-editor-geometry-helpers.js",
  () => ({
    cloneFloatingLayer: "clone-floating-layer",
    cloneSelection: "clone-selection",
    extractPixels: "extract-pixels",
    hasVisiblePixels: "has-visible-pixels",
    pixelsEqual: "pixels-equal",
  }),
);

vi.mock(
  "../../../src/pixel-editor/controllers/pixel-editor-startup.js",
  () => ({
    initializePixelEditorUi(options: any) {
      startupCalls.push(options);
    },
  }),
);

vi.mock(
  "../../../src/pixel-editor/controllers/setup/pixel-editor-controller-session.js",
  () => ({
    createPixelEditorSessionControllers(options: any) {
      sessionCalls.push(options);
      return {
        atlasController: { kind: "atlas-controller" },
        inputController: { kind: "input-controller" },
        sessionController: {
          open() {
            return "open";
          },
          refreshTranslations() {
            return "translations";
          },
          refreshFontBuild() {
            return "font";
          },
        },
      };
    },
  }),
);

vi.mock(
  "../../../src/pixel-editor/controllers/setup/pixel-editor-controller-visual.js",
  () => ({
    createPixelEditorVisualControllers(options: any) {
      visualCalls.push(options);
      return {
        modeController: {
          updateTransferButtons() {
            return "transfer-buttons";
          },
        },
        paletteController: { kind: "palette" },
        previewController: { kind: "preview" },
        renderController: { kind: "render" },
        runtimeController: { kind: "runtime" },
        toolController: { kind: "tool" },
        transferController: { kind: "transfer" },
      };
    },
  }),
);

describe("pixel-editor-controllers", () => {
  beforeEach(() => {
    draftCalls.length = 0;
    startupCalls.length = 0;
    sessionCalls.length = 0;
    visualCalls.length = 0;
  });

  it("builds and wires the controller composition root", async () => {
    const module =
      await import("../../../src/pixel-editor/controllers/pixel-editor-controllers.js");

    const state: any = {
      artworkDrafts: new Map(),
      atlasBlob: "blob",
      atlasExists: true,
      cellLoaded: true,
      currentEntry: { key: "smile" },
      dirtyKeys: new Set(["smile"]),
      fillShapesEnabled: false,
      floatingLayer: "layer",
      persistedArtwork: new Map(),
      pixels: new Uint8ClampedArray([1]),
      selection: "selection",
      traceOffsetX: 1,
      traceOffsetY: 2,
    };

    const elements: any = {
      bakeLayerButton: "bake",
      cancelLayerButton: "cancel",
      canvas: "canvas",
      copyArtButton: "copy-art",
      copyFontButton: "copy-font",
      copySelectionButton: "copy-selection",
      dirtyIndicator: "dirty",
      downloadButton: "download",
      downloadEmojiButton: "download-emoji",
      historyButtons: ["history"],
      invertLayerButton: "invert",
      layerNudgeButtons: ["layer-nudge"],
      layerTransformButtons: ["layer-transform"],
      paletteButtons: ["palette"],
      pasteArtButton: "paste-art",
      previewActionButtons: ["preview-action"],
      redoButton: "redo",
      saveButton: "save",
      status: "status",
      toolButtons: ["tool"],
      traceAlpha: "trace-alpha",
      traceNudgeButtons: ["trace-nudge"],
      undoButton: "undo",
    };

    const result = module.createPixelEditorControllers({
      dialog: "dialog",
      elements,
      formatNumber: "format-number",
      formatPercent: "format-percent",
      state,
      translate: "translate",
    });

    assert.equal(typeof result.open, "function");
    assert.equal(typeof result.refreshTranslations, "function");
    assert.equal(typeof result.refreshFontBuild, "function");

    assert.equal(draftCalls.length, 1);
    assert.equal(visualCalls.length, 1);
    assert.equal(sessionCalls.length, 1);
    assert.equal(startupCalls.length, 1);

    const draftOptions = draftCalls[0];
    assert.equal(draftOptions.artworkDrafts(), state.artworkDrafts);
    assert.equal(draftOptions.atlasBlob(), state.atlasBlob);
    assert.equal(draftOptions.atlasExists(), state.atlasExists);
    assert.equal(draftOptions.cellLoaded(), state.cellLoaded);
    assert.equal(draftOptions.currentEntry(), state.currentEntry);
    assert.equal(draftOptions.dirtyKeys(), state.dirtyKeys);
    assert.equal(draftOptions.floatingLayer(), state.floatingLayer);
    assert.equal(draftOptions.persistedArtwork(), state.persistedArtwork);
    assert.equal(draftOptions.pixels(), state.pixels);
    assert.equal(draftOptions.selection(), state.selection);
    assert.equal(draftOptions.traceOffsetX(), state.traceOffsetX);
    assert.equal(draftOptions.traceOffsetY(), state.traceOffsetY);
    assert.equal(draftOptions.translate, "translate");
    assert.deepEqual(draftOptions.floatingLayerUndoState(), {
      redoButton: elements.redoButton,
      undoButton: elements.undoButton,
    });
    draftOptions.pixelsSetter(new Uint8ClampedArray([9]));
    assert.deepEqual(Array.from(state.pixels), [9]);

    const sessionOptions = sessionCalls[0];
    assert.equal(sessionOptions.dialog, "dialog");
    assert.equal(sessionOptions.translate, "translate");
    assert.equal(sessionOptions.visual.paletteController.kind, "palette");
    assert.equal(sessionOptions.visual.transferController.kind, "transfer");

    const startupOptions = startupCalls[0];
    assert.equal(startupOptions.canvas, elements.canvas);
    assert.equal(startupOptions.atlasController.kind, "atlas-controller");
    assert.equal(startupOptions.inputController.kind, "input-controller");
    startupOptions.adjustTraceOffsets(5, -2);
    assert.equal(state.traceOffsetX, 6);
    assert.equal(state.traceOffsetY, 0);
  });
});
