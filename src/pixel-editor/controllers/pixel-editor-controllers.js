import {
  canvasIsBlackSilhouette,
  createPixelEditorPreviewController,
  drawCenteredEmoji,
  drawCheckerboard,
  imageDataCanvas,
  recolorVisibleCanvasPixels,
} from "../canvas/pixel-editor-canvas-helpers.js";
import {
  createBlankAtlas,
  createPixelEditorInputController,
  extractCell,
  getNestedFileHandle,
} from "../data/pixel-editor-atlas-io.js";
import {
  CELL_SIZE,
  DISPLAY_SIZE,
  IS_VITE_DEVELOPMENT,
} from "../core/pixel-editor-constants.js";
import { createPixelEditorAtlasController } from "./controllers/pixel-editor-atlas.js";
import { createPixelEditorModeController } from "./controllers/pixel-editor-mode.js";
import { createPixelEditorRuntimeController } from "./controllers/pixel-editor-runtime.js";
import { createPixelEditorSessionController } from "./controllers/pixel-editor-session.js";
import { initializePixelEditorUi } from "./controllers/pixel-editor-startup.js";
import { createPixelEditorToolController } from "./controllers/pixel-editor-tools.js";
import { createPixelEditorDraftController } from "../data/pixel-editor-drafts.js";
import {
  boundsFromPoints,
  clamp,
  cloneFloatingLayer,
  cloneSelection,
  extractPixels,
  hasVisiblePixels,
  pixelOffset,
  pixelsEqual,
  trimVisiblePixels,
} from "../core/pixel-editor-geometry-helpers.js";
import {
  createPixelEditorCanvasController,
  effectiveLayerPixels,
  nearestPaletteColor,
} from "../layers/pixel-editor-layer-helpers.js";
import { createPixelEditorPaletteController } from "../palette/pixel-editor-palette.js";
import { createPixelEditorTransferController } from "./controllers/pixel-editor-transfer.js";

export function createPixelEditorControllers({
  dialog,
  elements,
  formatNumber,
  formatPercent,
  state,
  translate,
}) {
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
  const modeController = createPixelEditorModeController({
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
  const sessionController = createPixelEditorSessionController({
    artworkDrafts: () => state.artworkDrafts,
    cellSize: CELL_SIZE,
    cloneFloatingLayer,
    cloneSelection,
    createBlankAtlas,
    currentEntry: () => state.currentEntry,
    currentEmoji: () => state.currentEmoji,
    draftController,
    downloadButton: elements.downloadButton,
    extractCell,
    getAtlasDimensions: () => ({
      width: state.atlasWidth,
      height: state.atlasHeight,
    }),
    getAtlasState: () => ({
      atlasBlob: state.atlasBlob,
      atlasExists: state.atlasExists,
      cellLoaded: state.cellLoaded,
    }),
    getPixels: () => state.pixels,
    loadManifest: runtimeController.loadManifest,
    paletteController,
    persistedArtwork: () => state.persistedArtwork,
    previewController,
    refreshRuntimeFontBuild: runtimeController.refreshFontBuild,
    refreshRuntimeTranslations: runtimeController.refreshTranslations,
    renderController,
    renderLocationText: runtimeController.renderLocationText,
    saveButton: elements.saveButton,
    setAtlasBlob: (value) => {
      state.atlasBlob = value;
    },
    setAtlasDimensions: (width, height) => {
      state.atlasWidth = width;
      state.atlasHeight = height;
    },
    setAtlasExists: (value) => {
      state.atlasExists = value;
    },
    setCellLoaded: (value) => {
      state.cellLoaded = value;
    },
    setCurrentEmoji: (value) => {
      state.currentEmoji = value;
    },
    setCurrentEntry: (value) => {
      state.currentEntry = value;
    },
    setFloatingLayer: (value) => {
      state.floatingLayer = value;
    },
    setLocationText: (value) => {
      elements.location.textContent = value;
    },
    setPixels: (value) => {
      state.pixels = value;
    },
    setSelection: (value) => {
      state.selection = value;
    },
    setStatusText: (value) => {
      elements.status.textContent = value;
    },
    setTraceOffsets: (x, y) => {
      state.traceOffsetX = x;
      state.traceOffsetY = y;
    },
    translate,
    updateTransferButtons,
  });
  const atlasController = createPixelEditorAtlasController({
    currentEntry: () => state.currentEntry,
    draftController,
    downloadButton: elements.downloadButton,
    downloadEmojiButton: elements.downloadEmojiButton,
    getAtlasBlob: () => state.atlasBlob,
    getAtlasDimensions: () => ({
      width: state.atlasWidth,
      height: state.atlasHeight,
    }),
    getDirectoryHandle: () => state.directoryHandle,
    getNestedFileHandle,
    getPixels: () => state.pixels,
    setAtlasBlob: (value) => {
      state.atlasBlob = value;
    },
    setAtlasExists: (value) => {
      state.atlasExists = value;
    },
    setDirectoryHandle: (value) => {
      state.directoryHandle = value;
    },
    translate,
    writeStatus: (value) => {
      elements.status.textContent = value;
    },
  });
  const inputController = createPixelEditorInputController({
    bakeFloatingLayer: transferController.bakeFloatingLayer,
    boundsFromPoints,
    canvas: elements.canvas,
    cancelFloatingLayer: transferController.cancelFloatingLayer,
    cellSize: CELL_SIZE,
    clamp,
    copyArtButton: elements.copyArtButton,
    copyPixelArt: transferController.copyPixelArt,
    copySelection: transferController.copySelection,
    copySelectionButton: elements.copySelectionButton,
    dialog,
    draftController,
    drawLine: toolController.drawLine,
    drawShape: toolController.drawShape,
    floodFill: toolController.floodFill,
    floatingLayer: () => state.floatingLayer,
    moveFloatingLayer: transferController.moveFloatingLayer,
    pasteArtButton: elements.pasteArtButton,
    pastePixelArt: transferController.pastePixelArt,
    paletteController,
    pixels: () => state.pixels,
    redo: runtimeController.redo,
    redoButton: elements.redoButton,
    releasePointerState: () => {
      state.pointerStart = undefined;
      state.pointerPrevious = undefined;
      state.shapeBase = undefined;
      state.layerDragStart = undefined;
      state.layerDragOrigin = undefined;
    },
    renderController,
    selectionState: {
      cellLoaded: () => state.cellLoaded,
      currentEntry: () => state.currentEntry,
      layerDragOrigin: () => state.layerDragOrigin,
      layerDragStart: () => state.layerDragStart,
      pointerPrevious: () => state.pointerPrevious,
      pointerStart: () => state.pointerStart,
      shapeBase: () => state.shapeBase,
    },
    setLayerDragOrigin: (value) => {
      state.layerDragOrigin = value;
    },
    setLayerDragStart: (value) => {
      state.layerDragStart = value;
    },
    setPointerPrevious: (value) => {
      state.pointerPrevious = value;
    },
    setPointerStart: (value) => {
      state.pointerStart = value;
    },
    setSelection: (value) => {
      state.selection = value;
    },
    setShapeBase: (value) => {
      state.shapeBase = value;
    },
    toolState: () => state.tool,
    transformFloatingLayer: transferController.transformFloatingLayer,
    undo: runtimeController.undo,
    undoButton: elements.undoButton,
    updateTransferButtons: modeController.updateTransferButtons,
    view: elements.view,
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
