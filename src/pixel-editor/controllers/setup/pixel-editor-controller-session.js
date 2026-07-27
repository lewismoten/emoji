import {
  boundsFromPoints,
  clamp,
  cloneFloatingLayer,
  cloneSelection,
} from "../../core/pixel-editor-geometry-helpers.js";
import { CELL_SIZE } from "../../core/pixel-editor-constants.js";
import {
  createBlankAtlas,
  createPixelEditorInputController,
  extractCell,
  getNestedFileHandle,
} from "../../data/pixel-editor-atlas-io.js";
import { createPixelEditorAtlasController } from "../pixel-editor-atlas.js";
import { createPixelEditorSessionController } from "../pixel-editor-session.js";

export function createPixelEditorSessionControllers(options) {
  const { dialog, draftController, elements, state, translate, visual } = options;

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
    loadManifest: visual.runtimeController.loadManifest,
    paletteController: visual.paletteController,
    persistedArtwork: () => state.persistedArtwork,
    previewController: visual.previewController,
    refreshRuntimeFontBuild: visual.runtimeController.refreshFontBuild,
    refreshRuntimeTranslations: visual.runtimeController.refreshTranslations,
    renderController: visual.renderController,
    renderLocationText: visual.runtimeController.renderLocationText,
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
    updateTransferButtons: visual.modeController.updateTransferButtons,
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
    bakeFloatingLayer: visual.transferController.bakeFloatingLayer,
    boundsFromPoints,
    canvas: elements.canvas,
    cancelFloatingLayer: visual.transferController.cancelFloatingLayer,
    cellSize: CELL_SIZE,
    clamp,
    copyArtButton: elements.copyArtButton,
    copyPixelArt: visual.transferController.copyPixelArt,
    copySelection: visual.transferController.copySelection,
    copySelectionButton: elements.copySelectionButton,
    dialog,
    draftController,
    drawLine: visual.toolController.drawLine,
    drawShape: visual.toolController.drawShape,
    floodFill: visual.toolController.floodFill,
    floatingLayer: () => state.floatingLayer,
    moveFloatingLayer: visual.transferController.moveFloatingLayer,
    pasteArtButton: elements.pasteArtButton,
    pastePixelArt: visual.transferController.pastePixelArt,
    paletteController: visual.paletteController,
    pixels: () => state.pixels,
    redo: visual.runtimeController.redo,
    redoButton: elements.redoButton,
    releasePointerState: () => {
      state.pointerStart = undefined;
      state.pointerPrevious = undefined;
      state.shapeBase = undefined;
      state.layerDragStart = undefined;
      state.layerDragOrigin = undefined;
    },
    renderController: visual.renderController,
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
    transformFloatingLayer: visual.transferController.transformFloatingLayer,
    undo: visual.runtimeController.undo,
    undoButton: elements.undoButton,
    updateTransferButtons: visual.modeController.updateTransferButtons,
    view: elements.view,
  });

  return {
    atlasController,
    inputController,
    sessionController,
  };
}
