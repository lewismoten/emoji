// @ts-nocheck -- Transitional TypeScript migration.
import {
  canvasIsBlackSilhouette,
  createPixelEditorPreviewController,
  drawCenteredEmoji,
  drawCheckerboard,
  imageDataCanvas,
  recolorVisibleCanvasPixels,
} from "../../canvas/pixel-editor-canvas-helpers.js";
import { createPixelEditorCanvasController } from "../../canvas/pixel-editor-layer-canvas-controller.js";
import {
  CELL_SIZE,
  DISPLAY_SIZE,
  IS_VITE_DEVELOPMENT,
} from "../../core/pixel-editor-constants.js";
import {
  cloneFloatingLayer,
  pixelOffset,
  trimVisiblePixels,
} from "../../core/pixel-editor-geometry-helpers.js";
import { extractCell } from "../../data/pixel-editor-atlas-io.js";
import {
  effectiveLayerPixels,
  nearestPaletteColor,
} from "../../layers/pixel-editor-layer-helpers.js";
import { createPixelEditorPaletteController } from "../../palette/pixel-editor-palette.js";
import { createPixelEditorModeController } from "../pixel-editor-mode.js";
import { createPixelEditorRuntimeController } from "../pixel-editor-runtime.js";
import { createPixelEditorToolController } from "../pixel-editor-tools.js";
import { createPixelEditorTransferController } from "../pixel-editor-transfer.js";

export function createPixelEditorVisualControllers(options) {
  const {
    draftController,
    elements,
    formatNumber,
    formatPercent,
    state,
    translate,
  } = options;
  let modeController;
  const updateTransferButtons = () => modeController.updateTransferButtons();
  const updateEditorModePanels = () => modeController.updateEditorModePanels();

  const paletteController = createPixelEditorPaletteController({
    getPixels: () => state.pixels,
    getSelectedColor: () => state.selectedColor,
    getSelectedSkinTone: () => state.selectedSkinTone,
    getTraceAlpha: () => elements.traceAlpha,
    getTraceCanvas: () => elements.traceCanvas,
    nearestPaletteColor,
    paletteButtons: elements.paletteButtons,
    pixelOffset,
    setSelectedColor: (value) => {
      state.selectedColor = value;
    },
    setSelectedSkinTone: (value) => {
      state.selectedSkinTone = value;
    },
    translate,
    view: elements.view,
  });

  const previewController = createPixelEditorPreviewController({
    artworkPreview: elements.artworkPreview,
    canvasIsBlackSilhouette,
    currentEmoji: () => state.currentEmoji,
    currentEntry: () => state.currentEntry,
    downloadPreview: elements.downloadPreview,
    drawCenteredEmoji,
    effectiveLayerPixels,
    floatingLayer: () => state.floatingLayer,
    fontPreview: elements.fontPreview,
    imageDataCanvas,
    officialPreview: elements.officialPreview,
    paletteController,
    pixelOffset,
    pixels: () => state.pixels,
    recolorVisibleCanvasPixels,
    selectionDashOffset: () => state.selectionDashOffset,
    setSelectionDashOffset: (value) => {
      state.selectionDashOffset = value;
    },
    traceAlpha: elements.traceAlpha,
    traceCanvas: elements.traceCanvas,
    traceOffsetX: () => state.traceOffsetX,
    traceOffsetY: () => state.traceOffsetY,
  });

  const renderController = createPixelEditorCanvasController({
    context: elements.canvas.getContext("2d", { alpha: true }),
    currentEmoji: () => state.currentEmoji,
    currentSelection: () => state.selection,
    currentTool: () => state.tool,
    displaySize: DISPLAY_SIZE,
    draftController,
    drawArtworkPreview: previewController.drawArtworkPreview,
    drawCheckerboard,
    floatingLayer: () => state.floatingLayer,
    paletteController,
    pixelOffset,
    pixels: () => state.pixels,
    selectionDashOffset: () => state.selectionDashOffset,
    setSelectionDashOffset: (value) => {
      state.selectionDashOffset = value;
    },
    traceAlpha: elements.traceAlpha,
    traceCanvas: elements.traceCanvas,
    updateEditorModePanels,
    updateTransferButtons,
    view: elements.view,
  });

  modeController = createPixelEditorModeController({
    artworkClipboard: () => state.artworkClipboard,
    canvas: elements.canvas,
    cellLoaded: () => state.cellLoaded,
    copyArtButton: elements.copyArtButton,
    copyFontButton: elements.copyFontButton,
    copySelectionButton: elements.copySelectionButton,
    currentEntry: () => state.currentEntry,
    draftController,
    drawingPanel: elements.drawingPanel,
    filePanel: elements.filePanel,
    floatingLayer: () => state.floatingLayer,
    historyPanel: elements.historyPanel,
    invertLayerButton: elements.invertLayerButton,
    layerHelp: elements.layerHelp,
    layerNudgeButtons: elements.layerNudgeButtons,
    layerPanel: elements.layerPanel,
    layerTransformButtons: elements.layerTransformButtons,
    paletteController,
    pasteArtButton: elements.pasteArtButton,
    pastePending: () => state.pastePending,
    previewActions: elements.previewActions,
    selection: () => state.selection,
    tool: () => state.tool,
    toolButtons: elements.toolButtons,
    toolsPanel: elements.toolsPanel,
    tracingPanel: elements.tracingPanel,
    transferPanel: elements.transferPanel,
    view: elements.view,
  });

  const toolController = createPixelEditorToolController({
    fillShapesEnabled: () => state.fillShapesEnabled,
    getPixels: () => state.pixels,
    getSelectedColor: () => state.selectedColor,
    getTool: () => state.tool,
    hasFloatingLayer: () => state.floatingLayer,
    renderController,
    selection: (value) => {
      state.selection = value;
    },
    setFillShapesEnabled: (value) => {
      state.fillShapesEnabled = value;
    },
    setTool: (value) => {
      state.tool = value;
    },
    toolButtons: elements.toolButtons,
    translate,
  });

  const runtimeController = createPixelEditorRuntimeController({
    currentEntry: () => state.currentEntry,
    draftController,
    formatNumber,
    formatPercent,
    getManifestPromise: () => state.manifestPromise,
    isViteDevelopment: IS_VITE_DEVELOPMENT,
    paletteController,
    previewController,
    renderController,
    setCurrentEntry: (value) => {
      state.currentEntry = value;
    },
    setManifestPromise: (value) => {
      state.manifestPromise = value;
    },
    traceAlpha: elements.traceAlpha,
    traceOutput: elements.traceOutput,
    translate,
    updateLocation: () => {
      elements.location.textContent = runtimeController.renderLocationText(
        state.currentEntry,
      );
    },
    updateShapeToolButtons: toolController.updateShapeToolButtons,
    updateTransferButtons: modeController.updateTransferButtons,
  });

  const transferController = createPixelEditorTransferController({
    artworkDrafts: () => state.artworkDrafts,
    canvas: elements.canvas,
    cellLoaded: () => state.cellLoaded,
    cellSize: CELL_SIZE,
    cloneFloatingLayer,
    currentEntry: () => state.currentEntry,
    draftController,
    extractCell,
    floatingLayer: () => state.floatingLayer,
    formatClipboardStatus: (key, fallback) => translate(key, fallback),
    formatStatus: (key, fallback) => translate(key, fallback),
    getArtworkClipboard: () => state.artworkClipboard,
    getPixels: () => state.pixels,
    getSelection: () => state.selection,
    getTool: () => state.tool,
    loadManifest: (...args) => runtimeController.loadManifest(...args),
    paletteController,
    pastePending: () => state.pastePending,
    renderController,
    setArtworkClipboard: (value) => {
      state.artworkClipboard = value;
    },
    setFloatingLayer: (value) => {
      state.floatingLayer = value;
    },
    setPastePending: (value) => {
      state.pastePending = value;
    },
    setSelection: (value) => {
      state.selection = value;
    },
    trimVisiblePixels,
    updateTransferButtons: modeController.updateTransferButtons,
    writeStatus: (value) => {
      elements.status.textContent = value;
    },
  });

  return {
    modeController,
    paletteController,
    previewController,
    renderController,
    runtimeController,
    toolController,
    transferController,
    updateTransferButtons,
  };
}
