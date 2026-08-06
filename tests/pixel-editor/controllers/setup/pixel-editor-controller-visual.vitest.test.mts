import assert from "node:assert/strict";
import { beforeEach, describe, it, vi } from "vitest";

const previewCalls: any[] = [];
const canvasCalls: any[] = [];
const paletteCalls: any[] = [];
const modeCalls: any[] = [];
const runtimeCalls: any[] = [];
const toolCalls: any[] = [];
const transferCalls: any[] = [];

vi.mock(
  "../../../../src/pixel-editor/canvas/pixel-editor-canvas-helpers.js",
  () => ({
    canvasIsBlackSilhouette: "black-silhouette",
    createPixelEditorPreviewController(options: any) {
      previewCalls.push(options);
      return {
        drawArtworkPreview() {},
        kind: "preview-controller",
      };
    },
    drawCenteredEmoji: "draw-centered-emoji",
    drawCheckerboard: "checkerboard",
    imageDataCanvas: "image-data-canvas",
    recolorVisibleCanvasPixels: "recolor-visible",
  }),
);

vi.mock(
  "../../../../src/pixel-editor/canvas/pixel-editor-layer-canvas-controller.js",
  () => ({
    createPixelEditorCanvasController(options: any) {
      canvasCalls.push(options);
      return { draw() {}, kind: "render-controller" };
    },
  }),
);

vi.mock("../../../../src/pixel-editor/core/pixel-editor-constants.js", () => ({
  CELL_SIZE: 12,
  DISPLAY_SIZE: 240,
  IS_VITE_DEVELOPMENT: true,
}));

vi.mock(
  "../../../../src/pixel-editor/core/pixel-editor-geometry-helpers.js",
  () => ({
    cloneFloatingLayer: "clone-floating-layer",
    pixelOffset: "pixel-offset",
    trimVisiblePixels: "trim-visible-pixels",
  }),
);

vi.mock("../../../../src/pixel-editor/data/pixel-editor-atlas-io.js", () => ({
  extractCell: "extract-cell",
}));

vi.mock(
  "../../../../src/pixel-editor/layers/pixel-editor-layer-helpers.js",
  () => ({
    effectiveLayerPixels: "effective-layer-pixels",
    nearestPaletteColor: "nearest-palette-color",
  }),
);

vi.mock("../../../../src/pixel-editor/palette/pixel-editor-palette.js", () => ({
  createPixelEditorPaletteController(options: any) {
    paletteCalls.push(options);
    return { kind: "palette-controller" };
  },
}));

vi.mock(
  "../../../../src/pixel-editor/controllers/pixel-editor-mode.js",
  () => ({
    createPixelEditorModeController(options: any) {
      modeCalls.push(options);
      return {
        kind: "mode-controller",
        updateEditorModePanels() {},
        updateTransferButtons() {},
      };
    },
  }),
);

vi.mock(
  "../../../../src/pixel-editor/controllers/pixel-editor-runtime.js",
  () => ({
    createPixelEditorRuntimeController(options: any) {
      runtimeCalls.push(options);
      return {
        kind: "runtime-controller",
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
          return "loc";
        },
        undo() {
          return "undo";
        },
      };
    },
  }),
);

vi.mock(
  "../../../../src/pixel-editor/controllers/pixel-editor-tools.js",
  () => ({
    createPixelEditorToolController(options: any) {
      toolCalls.push(options);
      return {
        drawLine() {},
        drawShape() {},
        floodFill() {},
        kind: "tool-controller",
        updateShapeToolButtons() {},
      };
    },
  }),
);

vi.mock(
  "../../../../src/pixel-editor/controllers/pixel-editor-transfer.js",
  () => ({
    createPixelEditorTransferController(options: any) {
      transferCalls.push(options);
      return {
        bakeFloatingLayer() {},
        cancelFloatingLayer() {},
        copyPixelArt() {},
        copySelection() {},
        kind: "transfer-controller",
        moveFloatingLayer() {},
        pastePixelArt() {},
        transformFloatingLayer() {},
      };
    },
  }),
);

describe("pixel-editor-controller-visual", () => {
  beforeEach(() => {
    previewCalls.length = 0;
    canvasCalls.length = 0;
    paletteCalls.length = 0;
    modeCalls.length = 0;
    runtimeCalls.length = 0;
    toolCalls.length = 0;
    transferCalls.length = 0;
  });

  it("builds visual controllers through the real source module", async () => {
    const module =
      await import("../../../../src/pixel-editor/controllers/setup/pixel-editor-controller-visual.js");

    const state: any = {
      artworkClipboard: "clipboard",
      artworkDrafts: new Map(),
      cellLoaded: true,
      currentEmoji: "😀",
      currentEntry: { key: "smile" },
      fillShapesEnabled: false,
      floatingLayer: { id: 1 },
      manifestPromise: "manifest-promise",
      pastePending: false,
      pixels: new Uint8ClampedArray([1]),
      selectedColor: "#ffffff",
      selectedSkinTone: "1F3FB",
      selection: { x: 1 },
      selectionDashOffset: 2,
      tool: "pencil",
      traceOffsetX: 3,
      traceOffsetY: 4,
    };

    const elements: any = {
      artworkPreview: "artwork-preview",
      canvas: { getContext: () => "context" },
      copyArtButton: "copy-art",
      copyFontButton: "copy-font",
      copySelectionButton: "copy-selection",
      downloadButton: "download",
      downloadEmojiButton: "download-emoji",
      downloadPreview: "download-preview",
      drawingPanel: "drawing-panel",
      filePanel: "file-panel",
      fontPreview: "font-preview",
      historyPanel: "history-panel",
      invertLayerButton: "invert-layer",
      layerHelp: "layer-help",
      layerNudgeButtons: ["layer-nudge"],
      layerPanel: "layer-panel",
      layerTransformButtons: ["layer-transform"],
      location: { textContent: "" },
      officialPreview: "official-preview",
      paletteButtons: ["palette-button"],
      pasteArtButton: "paste-art",
      previewActions: "preview-actions",
      status: { textContent: "" },
      toolButtons: ["tool-button"],
      toolsPanel: "tools-panel",
      traceAlpha: "trace-alpha",
      traceCanvas: "trace-canvas",
      traceOutput: "trace-output",
      tracingPanel: "tracing-panel",
      transferPanel: "transfer-panel",
      view: "view",
    };

    const controllers = module.createPixelEditorVisualControllers({
      draftController: { kind: "draft-controller" },
      elements,
      formatNumber: (value: number) => `n:${value}`,
      formatPercent: (value: number) => `p:${value}`,
      state,
      translate: (key: string, fallback: string) => `${key}:${fallback}`,
    });

    assert.equal(
      (controllers.paletteController as any).kind,
      "palette-controller",
    );
    assert.equal((controllers.modeController as any).kind, "mode-controller");
    assert.equal(
      (controllers.runtimeController as any).kind,
      "runtime-controller",
    );
    assert.equal((controllers.toolController as any).kind, "tool-controller");
    assert.equal(
      (controllers.transferController as any).kind,
      "transfer-controller",
    );
    assert.equal(
      (controllers.renderController as any).kind,
      "render-controller",
    );
    assert.equal(previewCalls.length, 1);
    assert.equal(canvasCalls.length, 1);
    assert.equal(paletteCalls.length, 1);
    assert.equal(modeCalls.length, 1);
    assert.equal(runtimeCalls.length, 1);
    assert.equal(toolCalls.length, 1);
    assert.equal(transferCalls.length, 1);

    const paletteOptions = paletteCalls[0];
    assert.equal(paletteOptions.getPixels(), state.pixels);
    assert.equal(paletteOptions.getSelectedColor(), "#ffffff");
    assert.equal(paletteOptions.getSelectedSkinTone(), "1F3FB");
    assert.equal(paletteOptions.getTraceAlpha(), "trace-alpha");
    assert.equal(paletteOptions.getTraceCanvas(), "trace-canvas");
    paletteOptions.setSelectedColor("#000000");
    paletteOptions.setSelectedSkinTone("1F3FFC");
    assert.equal(state.selectedColor, "#000000");
    assert.equal(state.selectedSkinTone, "1F3FFC");

    const previewOptions = previewCalls[0];
    assert.equal(previewOptions.currentEmoji(), "😀");
    assert.equal(previewOptions.currentEntry(), state.currentEntry);
    assert.equal(previewOptions.floatingLayer(), state.floatingLayer);
    assert.equal(previewOptions.pixels(), state.pixels);
    assert.equal(previewOptions.selectionDashOffset(), 2);
    assert.equal(previewOptions.traceOffsetX(), 3);
    assert.equal(previewOptions.traceOffsetY(), 4);
    previewOptions.setSelectionDashOffset(9);
    assert.equal(state.selectionDashOffset, 9);

    const canvasOptions = canvasCalls[0];
    assert.equal(canvasOptions.context, "context");
    assert.equal(canvasOptions.currentEmoji(), "😀");
    assert.equal(canvasOptions.currentSelection(), state.selection);
    assert.equal(canvasOptions.currentTool(), "pencil");
    assert.equal(canvasOptions.displaySize, 240);
    assert.equal(canvasOptions.floatingLayer(), state.floatingLayer);
    assert.equal(canvasOptions.pixels(), state.pixels);
    assert.equal(canvasOptions.selectionDashOffset(), 9);
    canvasOptions.setSelectionDashOffset(12);
    assert.equal(state.selectionDashOffset, 12);

    const modeOptions = modeCalls[0];
    assert.equal(modeOptions.artworkClipboard(), "clipboard");
    assert.equal(modeOptions.cellLoaded(), true);
    assert.equal(modeOptions.currentEntry(), state.currentEntry);
    assert.equal(modeOptions.floatingLayer(), state.floatingLayer);
    assert.equal(modeOptions.pastePending(), false);
    assert.equal(modeOptions.selection(), state.selection);
    assert.equal(modeOptions.tool(), "pencil");

    const toolOptions = toolCalls[0];
    assert.equal(toolOptions.fillShapesEnabled(), false);
    assert.equal(toolOptions.getPixels(), state.pixels);
    assert.equal(toolOptions.getSelectedColor(), "#000000");
    assert.equal(toolOptions.getTool(), "pencil");
    assert.equal(toolOptions.hasFloatingLayer(), state.floatingLayer);
    toolOptions.selection("selection-2");
    toolOptions.setFillShapesEnabled(true);
    toolOptions.setTool("eraser");
    assert.equal(state.selection, "selection-2");
    assert.equal(state.fillShapesEnabled, true);
    assert.equal(state.tool, "eraser");

    const runtimeOptions = runtimeCalls[0];
    assert.equal(runtimeOptions.currentEntry(), state.currentEntry);
    assert.equal(runtimeOptions.getManifestPromise(), "manifest-promise");
    assert.equal(runtimeOptions.isViteDevelopment, true);
    runtimeOptions.setCurrentEntry({ key: "other" });
    runtimeOptions.setManifestPromise("next-manifest");
    runtimeOptions.updateLocation();
    assert.deepEqual(state.currentEntry, { key: "other" });
    assert.equal(state.manifestPromise, "next-manifest");
    assert.equal(elements.location.textContent, "loc");

    const transferOptions = transferCalls[0];
    assert.equal(transferOptions.artworkDrafts(), state.artworkDrafts);
    assert.equal(transferOptions.cellLoaded(), true);
    assert.equal(transferOptions.cellSize, 12);
    assert.deepEqual(transferOptions.currentEntry(), { key: "other" });
    assert.equal(transferOptions.floatingLayer(), state.floatingLayer);
    assert.equal(transferOptions.getArtworkClipboard(), "clipboard");
    assert.equal(transferOptions.getPixels(), state.pixels);
    assert.equal(transferOptions.getSelection(), "selection-2");
    assert.equal(transferOptions.getTool(), "eraser");
    assert.equal(transferOptions.pastePending(), false);
    assert.equal(
      transferOptions.formatClipboardStatus("clip", "fallback"),
      "clip:fallback",
    );
    assert.equal(
      transferOptions.formatStatus("status", "fallback"),
      "status:fallback",
    );
    assert.equal(transferOptions.loadManifest("a", "b"), "manifest");
    transferOptions.setArtworkClipboard("clipboard-2");
    transferOptions.setFloatingLayer(undefined);
    transferOptions.setPastePending(true);
    transferOptions.setSelection(undefined);
    transferOptions.writeStatus("status-2");
    assert.equal(state.artworkClipboard, "clipboard-2");
    assert.equal(state.floatingLayer, undefined);
    assert.equal(state.pastePending, true);
    assert.equal(state.selection, undefined);
    assert.equal(elements.status.textContent, "status-2");
  });
});
