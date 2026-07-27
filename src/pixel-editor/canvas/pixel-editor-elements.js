import { CELL_SIZE } from "../core/pixel-editor-constants.js";
import { renderPixelEditorTemplate } from "./pixel-editor-template.js";

export function createPixelEditorElements(dialog) {
  const view = document.createElement("section");
  view.className = "pixel-editor-view";
  view.hidden = true;
  view.innerHTML = renderPixelEditorTemplate();
  dialog.append(view);
  const item = (selector) => view.querySelector(selector);
  const items = (selector) => [...view.querySelectorAll(selector)];
  const traceCanvas = document.createElement("canvas");
  traceCanvas.width = CELL_SIZE;
  traceCanvas.height = CELL_SIZE;
  return {
    view,
    canvas: item(".pixel-editor-canvas"),
    traceAlpha: item(".pixel-editor-trace-alpha"),
    traceOutput: item(".pixel-editor-trace-value"),
    officialPreview: item(".pixel-editor-preview-official"),
    fontPreview: item(".pixel-editor-preview-font"),
    artworkPreview: item(".pixel-editor-preview-artwork"),
    downloadPreview: item(".pixel-editor-download-preview"),
    undoButton: item(".pixel-editor-undo"),
    redoButton: item(".pixel-editor-redo"),
    toolsPanel: item(".pixel-editor-tools"),
    historyPanel: item(".pixel-editor-history"),
    drawingPanel: item(".pixel-editor-drawing"),
    tracingPanel: item(".pixel-editor-tracing"),
    transferPanel: item(".pixel-editor-transfer"),
    filePanel: item(".pixel-editor-file"),
    previewActions: item(".pixel-editor-preview-actions"),
    dirtyIndicator: item(".pixel-editor-dirty"),
    copyArtButton: item(".pixel-editor-copy-art"),
    copyFontButton: item(".pixel-editor-copy-font"),
    copySelectionButton: item(".pixel-editor-copy-selection"),
    pasteArtButton: item(".pixel-editor-paste-art"),
    layerPanel: item(".pixel-editor-layer"),
    layerNudgeButtons: items(".pixel-editor-layer-nudge"),
    layerTransformButtons: items("[data-layer-transform]"),
    bakeLayerButton: item(".pixel-editor-bake-layer"),
    cancelLayerButton: item(".pixel-editor-cancel-layer"),
    invertLayerButton: item(".pixel-editor-invert-layer"),
    layerHelp: item(".pixel-editor-layer-help"),
    saveButton: item(".pixel-editor-save"),
    downloadButton: item(".pixel-editor-download"),
    downloadEmojiButton: item(".pixel-editor-download-emoji"),
    location: item(".pixel-editor-location"),
    status: item(".pixel-editor-status"),
    toolButtons: items("[data-tool]"),
    historyButtons: [item(".pixel-editor-undo"), item(".pixel-editor-redo")],
    paletteButtons: items(".pixel-editor-swatch"),
    traceNudgeButtons: items(".pixel-editor-trace-nudge"),
    previewActionButtons: [
      item(".pixel-editor-save"),
      item(".pixel-editor-download"),
      item(".pixel-editor-download-emoji"),
    ],
    traceCanvas,
  };
}

export function createPixelEditorState() {
  return {
    manifestPromise: undefined,
    currentEntry: undefined,
    currentEmoji: "",
    atlasBlob: undefined,
    atlasExists: false,
    cellLoaded: false,
    atlasWidth: CELL_SIZE * 16,
    atlasHeight: CELL_SIZE * 16,
    pixels: new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4),
    selectedColor: "#ffff55",
    selectedSkinTone: "",
    artworkClipboard: undefined,
    pastePending: false,
    selection: undefined,
    floatingLayer: undefined,
    artworkDrafts: new Map(),
    persistedArtwork: new Map(),
    dirtyKeys: new Set(),
    traceOffsetX: 0,
    traceOffsetY: 0,
    tool: "pencil",
    fillShapesEnabled: false,
    pointerStart: undefined,
    pointerPrevious: undefined,
    shapeBase: undefined,
    layerDragStart: undefined,
    layerDragOrigin: undefined,
    selectionDashOffset: 0,
    directoryHandle: undefined,
  };
}
