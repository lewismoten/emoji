import {
  canvasIsBlackSilhouette,
  createPixelEditorPreviewController,
  drawBitmapText,
  drawCenteredEmoji,
  drawCheckerboard,
  imageDataCanvas,
  recolorVisibleCanvasPixels,
} from "./src/pixel-editor/pixel-editor-canvas-helpers.js";
import {
  boundsFromPoints,
  clamp,
  cloneFloatingLayer,
  cloneSelection,
  extractPixels,
  hasVisiblePixels,
  layerPositionAllowed,
  pixelOffset,
  pixelsEqual,
  trimVisiblePixels,
} from "./src/pixel-editor/pixel-editor-geometry-helpers.js";
import {
  createPixelEditorCanvasController,
  effectiveLayerPixels,
  flipPixels,
  layerTransformChangesPixels,
  nearestPaletteColor,
  nextLayerRotation,
  resetLayerRotation,
} from "./src/pixel-editor/pixel-editor-layer-helpers.js";
import {
  CELL_SIZE,
  DISPLAY_SIZE,
  EGA_COLORS,
  IS_VITE_DEVELOPMENT,
  SKIN_TONE_COLORS,
} from "./src/pixel-editor/pixel-editor-constants.js";
import {
  createBlankAtlas,
  createPixelEditorInputController,
  extractCell,
  getNestedFileHandle,
} from "./src/pixel-editor/pixel-editor-atlas-io.js";
import { createPixelEditorAtlasController } from "./src/pixel-editor/controllers/pixel-editor-atlas.js";
import { createPixelEditorModeController } from "./src/pixel-editor/controllers/pixel-editor-mode.js";
import { createPixelEditorRuntimeController } from "./src/pixel-editor/controllers/pixel-editor-runtime.js";
import { createPixelEditorSessionController } from "./src/pixel-editor/controllers/pixel-editor-session.js";
import { initializePixelEditorUi } from "./src/pixel-editor/controllers/pixel-editor-startup.js";
import { createPixelEditorToolController } from "./src/pixel-editor/controllers/pixel-editor-tools.js";
import { createPixelEditorDraftController } from "./src/pixel-editor/pixel-editor-drafts.js";
import { createPixelEditorPaletteController } from "./src/pixel-editor/pixel-editor-palette.js";
import { createPixelEditorTransferController } from "./src/pixel-editor/controllers/pixel-editor-transfer.js";
import {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  compareSkinToneHelpers,
  remapSkinTonePixels,
  skinToneBaseSequence,
  skinToneCycle,
  skinToneSequence,
} from "./src/pixel-editor/pixel-editor-skin-tone.js";
import { renderPixelEditorTemplate } from "./src/pixel-editor/pixel-editor-template.js";

export {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  remapSkinTonePixels,
  skinToneBaseSequence,
  skinToneSequence,
};
export function createPixelEditor({
  dialog,
  translate,
  formatNumber = String,
  formatPercent = (value) => `${Math.round(value * 100)}%`,
}) {
  const view = document.createElement("section");
  view.className = "pixel-editor-view";
  view.hidden = true;
  view.innerHTML = renderPixelEditorTemplate();
  dialog.append(view);

  const canvas = view.querySelector(".pixel-editor-canvas");
  const context = canvas.getContext("2d", { alpha: true });
  const traceAlpha = view.querySelector(".pixel-editor-trace-alpha");
  const traceOutput = view.querySelector(".pixel-editor-trace-value");
  const officialPreview = view.querySelector(".pixel-editor-preview-official");
  const fontPreview = view.querySelector(".pixel-editor-preview-font");
  const artworkPreview = view.querySelector(".pixel-editor-preview-artwork");
  const downloadPreview = view.querySelector(".pixel-editor-download-preview");
  const undoButton = view.querySelector(".pixel-editor-undo");
  const redoButton = view.querySelector(".pixel-editor-redo");
  const toolsPanel = view.querySelector(".pixel-editor-tools");
  const historyPanel = view.querySelector(".pixel-editor-history");
  const drawingPanel = view.querySelector(".pixel-editor-drawing");
  const tracingPanel = view.querySelector(".pixel-editor-tracing");
  const transferPanel = view.querySelector(".pixel-editor-transfer");
  const filePanel = view.querySelector(".pixel-editor-file");
  const previewActions = view.querySelector(".pixel-editor-preview-actions");
  const dirtyIndicator = view.querySelector(".pixel-editor-dirty");
  const copyArtButton = view.querySelector(".pixel-editor-copy-art");
  const copyFontButton = view.querySelector(".pixel-editor-copy-font");
  const copySelectionButton = view.querySelector(
    ".pixel-editor-copy-selection",
  );
  const pasteArtButton = view.querySelector(".pixel-editor-paste-art");
  const layerPanel = view.querySelector(".pixel-editor-layer");
  const layerNudgeButtons = [
    ...view.querySelectorAll(".pixel-editor-layer-nudge"),
  ];
  const layerTransformButtons = [
    ...view.querySelectorAll("[data-layer-transform]"),
  ];
  const bakeLayerButton = view.querySelector(".pixel-editor-bake-layer");
  const cancelLayerButton = view.querySelector(".pixel-editor-cancel-layer");
  const invertLayerButton = view.querySelector(".pixel-editor-invert-layer");
  const layerHelp = view.querySelector(".pixel-editor-layer-help");
  const saveButton = view.querySelector(".pixel-editor-save");
  const downloadButton = view.querySelector(".pixel-editor-download");
  const downloadEmojiButton = view.querySelector(
    ".pixel-editor-download-emoji",
  );
  const location = view.querySelector(".pixel-editor-location");
  const status = view.querySelector(".pixel-editor-status");
  const toolButtons = [...view.querySelectorAll("[data-tool]")];
  const historyButtons = [undoButton, redoButton];
  const paletteButtons = [...view.querySelectorAll(".pixel-editor-swatch")];
  const traceNudgeButtons = [
    ...view.querySelectorAll(".pixel-editor-trace-nudge"),
  ];
  const previewActionButtons = [saveButton, downloadButton, downloadEmojiButton];
  const traceCanvas = document.createElement("canvas");
  traceCanvas.width = CELL_SIZE;
  traceCanvas.height = CELL_SIZE;

  let manifestPromise;
  let currentEntry;
  let currentEmoji = "";
  let atlasBlob;
  let atlasExists = false;
  let cellLoaded = false;
  let atlasWidth = CELL_SIZE * 16;
  let atlasHeight = CELL_SIZE * 16;
  let pixels = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
  let selectedColor = "#ffff55";
  let selectedSkinTone = "";
  let artworkClipboard;
  let pastePending = false;
  let selection;
  let floatingLayer;
  const artworkDrafts = new Map();
  const persistedArtwork = new Map();
  const dirtyKeys = new Set();
  let traceOffsetX = 0;
  let traceOffsetY = 0;
  let tool = "pencil";
  let fillShapesEnabled = false;
  let pointerStart;
  let pointerPrevious;
  let shapeBase;
  let layerDragStart;
  let layerDragOrigin;
  let selectionDashOffset = 0;
  let directoryHandle;
  const paletteController = createPixelEditorPaletteController({
    getPixels: () => pixels,
    getSelectedColor: () => selectedColor,
    getSelectedSkinTone: () => selectedSkinTone,
    getTraceAlpha: () => traceAlpha,
    getTraceCanvas: () => traceCanvas,
    nearestPaletteColor,
    paletteButtons,
    pixelOffset,
    setSelectedColor: (value) => {
      selectedColor = value;
    },
    setSelectedSkinTone: (value) => {
      selectedSkinTone = value;
    },
    translate,
    view,
  });
  const draftController = createPixelEditorDraftController({
    artworkDrafts: () => artworkDrafts,
    atlasBlob: () => atlasBlob,
    atlasExists: () => atlasExists,
    cellLoaded: () => cellLoaded,
    cloneFloatingLayer,
    cloneSelection,
    currentEntry: () => currentEntry,
    dirtyIndicator,
    dirtyKeys: () => dirtyKeys,
    downloadButton,
    downloadEmojiButton,
    extractPixels,
    floatingLayer: () => floatingLayer,
    hasVisiblePixels,
    persistedArtwork: () => persistedArtwork,
    pixels: () => pixels,
    pixelsEqual,
    pixelsSetter: (value) => {
      pixels = value;
    },
    saveButton,
    selection: () => selection,
    status,
    traceOffsetX: () => traceOffsetX,
    traceOffsetY: () => traceOffsetY,
    translate,
    floatingLayerUndoState: () => ({ undoButton, redoButton }),
  });
  const previewController = createPixelEditorPreviewController({
    artworkPreview,
    canvasIsBlackSilhouette,
    currentEmoji: () => currentEmoji,
    currentEntry: () => currentEntry,
    downloadPreview,
    drawCenteredEmoji,
    effectiveLayerPixels,
    floatingLayer: () => floatingLayer,
    fontPreview,
    imageDataCanvas,
    officialPreview,
    paletteController,
    pixelOffset,
    pixels: () => pixels,
    recolorVisibleCanvasPixels,
    selectionDashOffset: () => selectionDashOffset,
    setSelectionDashOffset: (value) => {
      selectionDashOffset = value;
    },
    traceAlpha,
    traceCanvas,
    traceOffsetX: () => traceOffsetX,
    traceOffsetY: () => traceOffsetY,
  });
  const renderController = createPixelEditorCanvasController({
    context,
    currentEmoji: () => currentEmoji,
    currentSelection: () => selection,
    currentTool: () => tool,
    displaySize: DISPLAY_SIZE,
    draftController,
    drawArtworkPreview: previewController.drawArtworkPreview,
    drawCheckerboard,
    floatingLayer: () => floatingLayer,
    paletteController,
    pixelOffset,
    pixels: () => pixels,
    selectionDashOffset: () => selectionDashOffset,
    setSelectionDashOffset: (value) => {
      selectionDashOffset = value;
    },
    traceAlpha,
    traceCanvas,
    updateEditorModePanels,
    updateTransferButtons,
    view,
  });
  const modeController = createPixelEditorModeController({
    artworkClipboard: () => artworkClipboard,
    canvas,
    cellLoaded: () => cellLoaded,
    copyArtButton,
    copyFontButton,
    copySelectionButton,
    currentEntry: () => currentEntry,
    draftController,
    drawingPanel,
    filePanel,
    floatingLayer: () => floatingLayer,
    historyPanel,
    invertLayerButton,
    layerHelp,
    layerNudgeButtons,
    layerPanel,
    layerTransformButtons,
    paletteController,
    pasteArtButton,
    pastePending: () => pastePending,
    previewActions,
    selection: () => selection,
    tool: () => tool,
    toolButtons,
    toolsPanel,
    tracingPanel,
    transferPanel,
    view,
  });
  const toolController = createPixelEditorToolController({
    fillShapesEnabled: () => fillShapesEnabled,
    getPixels: () => pixels,
    getSelectedColor: () => selectedColor,
    getTool: () => tool,
    hasFloatingLayer: () => floatingLayer,
    renderController,
    selection: (value) => {
      selection = value;
    },
    setFillShapesEnabled: (value) => {
      fillShapesEnabled = value;
    },
    setTool: (value) => {
      tool = value;
    },
    toolButtons,
    translate,
  });
  const loadManifest = (...args) => runtimeController.loadManifest(...args);
  const transferController = createPixelEditorTransferController({
    artworkDrafts: () => artworkDrafts,
    canvas,
    cellLoaded: () => cellLoaded,
    cellSize: CELL_SIZE,
    cloneFloatingLayer,
    currentEntry: () => currentEntry,
    draftController,
    extractCell,
    floatingLayer: () => floatingLayer,
    formatClipboardStatus: (key, fallback) => translate(key, fallback),
    formatStatus: (key, fallback) => translate(key, fallback),
    getArtworkClipboard: () => artworkClipboard,
    getPixels: () => pixels,
    getSelection: () => selection,
    getTool: () => tool,
    loadManifest,
    paletteController,
    pastePending: () => pastePending,
    renderController,
    setArtworkClipboard: (value) => {
      artworkClipboard = value;
    },
    setFloatingLayer: (value) => {
      floatingLayer = value;
    },
    setPastePending: (value) => {
      pastePending = value;
    },
    setSelection: (value) => {
      selection = value;
    },
    trimVisiblePixels,
    updateTransferButtons: modeController.updateTransferButtons,
    writeStatus: (value) => {
      status.textContent = value;
    },
  });
  const runtimeController = createPixelEditorRuntimeController({
    currentEntry: () => currentEntry,
    draftController,
    formatNumber,
    formatPercent,
    getManifestPromise: () => manifestPromise,
    isViteDevelopment: IS_VITE_DEVELOPMENT,
    paletteController,
    previewController,
    renderController,
    setCurrentEntry: (value) => {
      currentEntry = value;
    },
    setManifestPromise: (value) => {
      manifestPromise = value;
    },
    traceAlpha,
    traceOutput,
    translate,
    updateLocation: () => {
      location.textContent = runtimeController.renderLocationText(currentEntry);
    },
    updateShapeToolButtons: toolController.updateShapeToolButtons,
    updateTransferButtons: modeController.updateTransferButtons,
  });
  const sessionController = createPixelEditorSessionController({
    artworkDrafts: () => artworkDrafts,
    cellSize: CELL_SIZE,
    cloneFloatingLayer,
    cloneSelection,
    createBlankAtlas,
    currentEntry: () => currentEntry,
    currentEmoji: () => currentEmoji,
    draftController,
    downloadButton,
    extractCell,
    getAtlasDimensions: () => ({ width: atlasWidth, height: atlasHeight }),
    getAtlasState: () => ({ atlasBlob, atlasExists, cellLoaded }),
    getPixels: () => pixels,
    loadManifest: runtimeController.loadManifest,
    paletteController,
    persistedArtwork: () => persistedArtwork,
    previewController,
    refreshRuntimeFontBuild: runtimeController.refreshFontBuild,
    refreshRuntimeTranslations: runtimeController.refreshTranslations,
    renderController,
    renderLocationText: runtimeController.renderLocationText,
    saveButton,
    setAtlasBlob: (value) => {
      atlasBlob = value;
    },
    setAtlasDimensions: (width, height) => {
      atlasWidth = width;
      atlasHeight = height;
    },
    setAtlasExists: (value) => {
      atlasExists = value;
    },
    setCellLoaded: (value) => {
      cellLoaded = value;
    },
    setCurrentEmoji: (value) => {
      currentEmoji = value;
    },
    setCurrentEntry: (value) => {
      currentEntry = value;
    },
    setFloatingLayer: (value) => {
      floatingLayer = value;
    },
    setLocationText: (value) => {
      location.textContent = value;
    },
    setPixels: (value) => {
      pixels = value;
    },
    setSelection: (value) => {
      selection = value;
    },
    setStatusText: (value) => {
      status.textContent = value;
    },
    setTraceOffsets: (x, y) => {
      traceOffsetX = x;
      traceOffsetY = y;
    },
    translate,
    updateTransferButtons,
  });
  const atlasController = createPixelEditorAtlasController({
    currentEntry: () => currentEntry,
    draftController,
    downloadButton,
    downloadEmojiButton,
    getAtlasBlob: () => atlasBlob,
    getAtlasDimensions: () => ({ width: atlasWidth, height: atlasHeight }),
    getDirectoryHandle: () => directoryHandle,
    getNestedFileHandle,
    getPixels: () => pixels,
    setAtlasBlob: (value) => {
      atlasBlob = value;
    },
    setAtlasExists: (value) => {
      atlasExists = value;
    },
    setDirectoryHandle: (value) => {
      directoryHandle = value;
    },
    translate,
    writeStatus: (value) => {
      status.textContent = value;
    },
  });
  const inputController = createPixelEditorInputController({
    bakeFloatingLayer: transferController.bakeFloatingLayer,
    boundsFromPoints,
    canvas,
    cancelFloatingLayer: transferController.cancelFloatingLayer,
    cellSize: CELL_SIZE,
    clamp,
    copyArtButton,
    copyPixelArt: transferController.copyPixelArt,
    copySelection: transferController.copySelection,
    copySelectionButton,
    dialog,
    draftController,
    drawLine: toolController.drawLine,
    drawShape: toolController.drawShape,
    floodFill: toolController.floodFill,
    floatingLayer: () => floatingLayer,
    moveFloatingLayer: transferController.moveFloatingLayer,
    pasteArtButton,
    pastePixelArt: transferController.pastePixelArt,
    paletteController,
    pixels: () => pixels,
    redo: runtimeController.redo,
    redoButton,
    releasePointerState: () => {
      pointerStart = undefined;
      pointerPrevious = undefined;
      shapeBase = undefined;
      layerDragStart = undefined;
      layerDragOrigin = undefined;
    },
    renderController,
    selectionState: {
      cellLoaded: () => cellLoaded,
      currentEntry: () => currentEntry,
      layerDragOrigin: () => layerDragOrigin,
      layerDragStart: () => layerDragStart,
      pointerPrevious: () => pointerPrevious,
      pointerStart: () => pointerStart,
      shapeBase: () => shapeBase,
    },
    setLayerDragOrigin: (value) => {
      layerDragOrigin = value;
    },
    setLayerDragStart: (value) => {
      layerDragStart = value;
    },
    setPointerPrevious: (value) => {
      pointerPrevious = value;
    },
    setPointerStart: (value) => {
      pointerStart = value;
    },
    setSelection: (value) => {
      selection = value;
    },
    setShapeBase: (value) => {
      shapeBase = value;
    },
    toolState: () => tool,
    transformFloatingLayer: transferController.transformFloatingLayer,
    undo: runtimeController.undo,
    undoButton,
    updateTransferButtons: modeController.updateTransferButtons,
    view,
  });
  initializePixelEditorUi({
    adjustTraceOffsets: (x, y) => {
      traceOffsetX += x;
      traceOffsetY += y;
    },
    atlasController,
    bakeLayerButton,
    cancelLayerButton,
    canvas,
    copyArtButton,
    copyFontButton,
    copySelectionButton,
    draftController,
    downloadButton,
    downloadEmojiButton,
    historyButtons,
    inputController,
    invertLayerButton,
    layerNudgeButtons,
    layerTransformButtons,
    paletteButtons,
    paletteController,
    pasteArtButton,
    previewActionButtons,
    previewController,
    redoButton,
    renderController,
    runtimeController,
    saveButton,
    toolButtons,
    toolController,
    traceAlpha,
    traceNudgeButtons,
    transferController,
    undoButton,
  });

  return {
    element: view,
    open: sessionController.open,
    refreshTranslations: sessionController.refreshTranslations,
    refreshFontBuild: sessionController.refreshFontBuild,
  };

  function updateTransferButtons() {
    modeController.updateTransferButtons();
  }

  function updateEditorModePanels() {
    modeController.updateEditorModePanels();
  }

}
