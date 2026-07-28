// @ts-nocheck -- Transitional TypeScript migration.
import { createPixelEditorDraftController } from "../data/pixel-editor-drafts.js";
import {
  cloneFloatingLayer,
  cloneSelection,
  extractPixels,
  hasVisiblePixels,
  pixelsEqual,
} from "../core/pixel-editor-geometry-helpers.js";
import { initializePixelEditorUi } from "./pixel-editor-startup.js";
import { createPixelEditorSessionControllers } from "./setup/pixel-editor-controller-session.js";
import { createPixelEditorVisualControllers } from "./setup/pixel-editor-controller-visual.js";

export function createPixelEditorControllers({
  dialog,
  elements,
  formatNumber,
  formatPercent,
  state,
  translate,
}) {
  const draftController = createPixelEditorDraftController({
    artworkDrafts: () => state.artworkDrafts,
    atlasBlob: () => state.atlasBlob,
    atlasExists: () => state.atlasExists,
    cellLoaded: () => state.cellLoaded,
    cloneFloatingLayer,
    cloneSelection,
    currentEntry: () => state.currentEntry,
    dirtyIndicator: elements.dirtyIndicator,
    dirtyKeys: () => state.dirtyKeys,
    downloadButton: elements.downloadButton,
    downloadEmojiButton: elements.downloadEmojiButton,
    extractPixels,
    floatingLayer: () => state.floatingLayer,
    hasVisiblePixels,
    persistedArtwork: () => state.persistedArtwork,
    pixels: () => state.pixels,
    pixelsEqual,
    pixelsSetter: (value) => {
      state.pixels = value;
    },
    saveButton: elements.saveButton,
    selection: () => state.selection,
    status: elements.status,
    traceOffsetX: () => state.traceOffsetX,
    traceOffsetY: () => state.traceOffsetY,
    translate,
    floatingLayerUndoState: () => ({
      undoButton: elements.undoButton,
      redoButton: elements.redoButton,
    }),
  });
  const {
    modeController,
    paletteController,
    previewController,
    renderController,
    runtimeController,
    toolController,
    transferController,
  } = createPixelEditorVisualControllers({
    draftController,
    elements,
    formatNumber,
    formatPercent,
    state,
    translate,
  });
  const { atlasController, inputController, sessionController } =
    createPixelEditorSessionControllers({
      dialog,
      draftController,
      elements,
      state,
      translate,
      visual: {
        modeController,
        paletteController,
        previewController,
        renderController,
        runtimeController,
        toolController,
        transferController,
      },
    });
  initializePixelEditorUi({
    adjustTraceOffsets: (x, y) => {
      state.traceOffsetX += x;
      state.traceOffsetY += y;
    },
    atlasController,
    bakeLayerButton: elements.bakeLayerButton,
    cancelLayerButton: elements.cancelLayerButton,
    canvas: elements.canvas,
    copyArtButton: elements.copyArtButton,
    copyFontButton: elements.copyFontButton,
    copySelectionButton: elements.copySelectionButton,
    draftController,
    downloadButton: elements.downloadButton,
    downloadEmojiButton: elements.downloadEmojiButton,
    historyButtons: elements.historyButtons,
    inputController,
    invertLayerButton: elements.invertLayerButton,
    layerNudgeButtons: elements.layerNudgeButtons,
    layerTransformButtons: elements.layerTransformButtons,
    paletteButtons: elements.paletteButtons,
    paletteController,
    pasteArtButton: elements.pasteArtButton,
    previewActionButtons: elements.previewActionButtons,
    previewController,
    redoButton: elements.redoButton,
    renderController,
    runtimeController,
    saveButton: elements.saveButton,
    toolButtons: elements.toolButtons,
    toolController,
    traceAlpha: elements.traceAlpha,
    traceNudgeButtons: elements.traceNudgeButtons,
    transferController,
    undoButton: elements.undoButton,
  });
  return {
    open: sessionController.open,
    refreshTranslations: sessionController.refreshTranslations,
    refreshFontBuild: sessionController.refreshFontBuild,
  };
}
