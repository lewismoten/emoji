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
  bindPaletteGrid,
  bindRovingGrid,
  syncRovingGrid,
} from "./src/pixel-editor/pixel-editor-grid-navigation.js";
import {
  boundsFromPoints,
  clamp,
  cloneFloatingLayer,
  cloneSelection,
  currentColorValue,
  drawLineOnPixels,
  drawShapeOnPixels,
  extractPixels,
  floodFillPixels,
  hasVisiblePixels,
  layerPositionAllowed,
  paintPixelInto,
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
  TOOLS,
} from "./src/pixel-editor/pixel-editor-constants.js";
import {
  createBlankAtlas,
  createPixelEditorInputController,
  extractCell,
  getNestedFileHandle,
} from "./src/pixel-editor/pixel-editor-atlas-io.js";
import { createPixelEditorAtlasController } from "./src/pixel-editor/controllers/pixel-editor-atlas.js";
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
  let loadId = 0;
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
    updateTransferButtons,
    writeStatus: (value) => {
      status.textContent = value;
    },
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
    drawLine,
    drawShape,
    floodFill,
    floatingLayer: () => floatingLayer,
    moveFloatingLayer: transferController.moveFloatingLayer,
    pasteArtButton,
    pastePixelArt: transferController.pastePixelArt,
    paletteController,
    pixels: () => pixels,
    redo,
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
    undo,
    undoButton,
    updateTransferButtons,
    view,
  });
  const {
    onCanvasKeyDown,
    onEditorKeyDown,
    onPointerCancel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = inputController;

  toolButtons.forEach((button) =>
    button.addEventListener("click", () => selectTool(button.dataset.tool)),
  );
  traceAlpha.addEventListener("input", () => {
    updateTraceOutput();
    renderController.draw();
  });
  traceNudgeButtons.forEach((button) =>
    button.addEventListener("click", () => {
      traceOffsetX += Number(button.dataset.traceX);
      traceOffsetY += Number(button.dataset.traceY);
      previewController.renderTrace();
      renderController.draw();
    }),
  );
  paletteButtons.forEach((button) =>
    button.addEventListener("click", () =>
      paletteController.selectPaletteColor(button),
    ),
  );
  undoButton.addEventListener("click", undo);
  redoButton.addEventListener("click", redo);
  copyArtButton.addEventListener("click", transferController.copyPixelArt);
  copyFontButton.addEventListener("click", () =>
    transferController.copyFontGlyph(copyFontButton),
  );
  copySelectionButton.addEventListener("click", transferController.copySelection);
  pasteArtButton.addEventListener("click", transferController.pastePixelArt);
  layerNudgeButtons.forEach((button) =>
    button.addEventListener("click", () =>
      transferController.moveFloatingLayer(
        Number(button.dataset.layerX),
        Number(button.dataset.layerY),
      ),
    ),
  );
  layerTransformButtons.forEach((button) =>
    button.addEventListener("click", () =>
      transferController.transformFloatingLayer(button.dataset.layerTransform),
    ),
  );
  bakeLayerButton.addEventListener("click", transferController.bakeFloatingLayer);
  cancelLayerButton.addEventListener(
    "click",
    transferController.cancelFloatingLayer,
  );
  invertLayerButton.addEventListener(
    "click",
    transferController.toggleFloatingLayerInversion,
  );
  saveButton.addEventListener("click", atlasController.saveAtlas);
  downloadButton.addEventListener("click", atlasController.downloadAtlas);
  downloadEmojiButton.addEventListener("click", atlasController.downloadEmojiPng);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("keydown", onCanvasKeyDown);
  document.addEventListener("keydown", onEditorKeyDown, true);
  window.addEventListener("beforeunload", draftController.warnAboutDirtyArtwork);
  bindRovingGrid(toolButtons);
  bindRovingGrid(historyButtons);
  bindPaletteGrid(paletteButtons);
  bindRovingGrid(traceNudgeButtons);
  bindRovingGrid(layerNudgeButtons);
  bindRovingGrid(previewActionButtons);
  paletteController.updatePaletteSelection();
  updateShapeToolButtons();
  updateTraceOutput();
  draftController.updatePreviewActionLabels();
  renderController.draw();

  return {
    element: view,
    async open(key, emoji) {
      const requestedLoadId = ++loadId;
      draftController.rememberCurrentDraft();
      currentEmoji = emoji;
      traceOffsetX = 0;
      traceOffsetY = 0;
      currentEntry = undefined;
      selection = undefined;
      floatingLayer = undefined;
      atlasBlob = undefined;
      atlasExists = false;
      cellLoaded = false;
      pixels.fill(0);
      previewController.renderTrace();
      draftController.resetHistory();
      renderController.draw();
      status.textContent = translate(
        "pixelEditorLoading",
        "Loading pixel cell…",
      );
      saveButton.disabled = true;
      downloadButton.disabled = true;
      try {
        const manifest = await loadManifest();
        if (requestedLoadId !== loadId) return;
        if (manifest.cellSize !== CELL_SIZE) {
          throw new Error(`Expected ${CELL_SIZE} by ${CELL_SIZE} pixel cells`);
        }
        const entry = manifest.glyphs[key];
        currentEntry = entry;
        paletteController.updateSkinTonePalette(entry?.codePoints);
        updateTransferButtons();
        if (!entry) {
          location.textContent = "";
          status.textContent = translate(
            "pixelEditorUnavailable",
            "This modified emoji is not part of the base atlas set.",
          );
          pixels.fill(0);
          previewController.renderTrace();
          renderController.draw();
          return;
        }
        atlasWidth = entry.atlasWidth;
        atlasHeight = entry.atlasHeight;
        const atlasResponse = await fetch(
          `pixel-font/atlases/${entry.atlas}`,
        ).catch(() => undefined);
        const hasPng =
          atlasResponse?.ok &&
          atlasResponse.headers.get("content-type")?.includes("image/png");
        const loadedAtlasBlob = hasPng
          ? await atlasResponse.blob()
          : await createBlankAtlas(manifest, entry);
        if (requestedLoadId !== loadId) return;
        const loadedPixels = await extractCell(loadedAtlasBlob, entry);
        if (requestedLoadId !== loadId) return;
        atlasBlob = loadedAtlasBlob;
        atlasExists = hasPng;
        cellLoaded = true;
        const draft = artworkDrafts.get(entry.key);
        if (!persistedArtwork.has(entry.key))
          persistedArtwork.set(entry.key, loadedPixels.slice());
        pixels = draft?.pixels.slice() ?? loadedPixels;
        selection = cloneSelection(draft?.selection);
        floatingLayer = cloneFloatingLayer(draft?.floatingLayer);
        traceOffsetX = draft?.traceOffsetX ?? 0;
        traceOffsetY = draft?.traceOffsetY ?? 0;
        draftController.resetHistory();
        updateLocation();
        status.textContent = "";
        previewController.renderTrace();
        renderController.draw();
      } catch (error) {
        if (requestedLoadId !== loadId) return;
        console.warn("Pixel editor unavailable", error);
        status.textContent = translate(
          "pixelEditorLoadFailed",
          "The pixel atlas could not be loaded.",
        );
      }
    },
    refreshTranslations() {
      if (currentEntry) {
        updateLocation();
      }
      updateTraceOutput();
      updateShapeToolButtons();
      draftController.updatePreviewActionLabels();
      paletteController.updateSkinTonePalette(currentEntry?.codePoints);
    },
    async refreshFontBuild() {
      try {
        const currentKey = currentEntry?.key;
        const manifest = await loadManifest(true);
        if (currentKey) currentEntry = manifest.glyphs[currentKey];
        previewController.drawFontPreview();
        updateTransferButtons();
      } catch (error) {
        console.warn("Pixel font preview refresh unavailable", error);
      }
    },
  };

  function loadManifest(refresh = false) {
    if (refresh) manifestPromise = undefined;
    const bypassCache = refresh || IS_VITE_DEVELOPMENT;
    const suffix = bypassCache ? `?v=${Date.now()}` : "";
    manifestPromise ??= fetch(
      `pixel-font/build/editor-manifest.json${suffix}`,
      bypassCache ? { cache: "no-store" } : undefined,
    ).then((response) => {
      if (!response.ok)
        throw new Error("Pixel editor manifest is unavailable");
      return response.json();
    });
    return manifestPromise;
  }

  function selectTool(nextTool) {
    if (!TOOLS.includes(nextTool) || floatingLayer) return;
    if (
      nextTool === tool &&
      (nextTool === "rectangle" || nextTool === "ellipse")
    ) {
      fillShapesEnabled = !fillShapesEnabled;
      updateShapeToolButtons();
      renderController.draw();
      return;
    }
    if (nextTool !== "select") selection = undefined;
    tool = nextTool;
    toolButtons.forEach((button) => {
      const selected = button.dataset.tool === tool;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("is-active", selected);
    });
    syncRovingGrid(
      toolButtons,
      toolButtons.find((button) => button.dataset.tool === tool),
    );
    updateShapeToolButtons();
    renderController.draw();
  }

  function updateShapeToolButtons() {
    for (const shape of ["rectangle", "ellipse"]) {
      const button = toolButtons.find(
        (candidate) => candidate.dataset.tool === shape,
      );
      const filled = fillShapesEnabled;
      button.querySelector("[aria-hidden]").textContent =
        shape === "rectangle" ? (filled ? "⬛" : "🔲") : filled ? "🔴" : "⭕";
      const key =
        shape === "rectangle"
          ? filled
            ? "filledRectangle"
            : "outlineRectangle"
          : filled
            ? "filledEllipse"
            : "outlineEllipse";
      const fallback =
        shape === "rectangle"
          ? filled
            ? "Filled rectangle"
            : "Outline rectangle"
          : filled
            ? "Filled ellipse"
            : "Outline ellipse";
      const label = translate(key, fallback);
      button.setAttribute("aria-label", label);
      button.title = label;
    }
  }

  function updateTraceOutput() {
    traceOutput.value = formatPercent(Number(traceAlpha.value) / 100);
  }

  function updateLocation() {
    location.textContent = `${currentEntry.atlas} · ${translate("row", "row")} ${formatNumber(currentEntry.row + 1)} · ${translate("column", "column")} ${formatNumber(currentEntry.column + 1)}`;
  }

  function currentColor() {
    return currentColorValue(selectedColor);
  }

  function paintPixel(point, color = currentColor()) {
    paintPixelInto(pixels, point, color);
  }

  function drawLine(start, end) {
    drawLineOnPixels(pixels, start, end, currentColor());
  }

  function drawShape(start, end, shape) {
    drawShapeOnPixels(
      pixels,
      start,
      end,
      shape,
      currentColor(),
      fillShapesEnabled,
    );
  }

  function floodFill(start) {
    floodFillPixels(pixels, start, currentColor());
  }

  function undo() {
    draftController.undo();
    renderController.draw();
  }

  function redo() {
    draftController.redo();
    renderController.draw();
  }

  function updateTransferButtons() {
    copyArtButton.disabled =
      !currentEntry ||
      !cellLoaded ||
      Boolean(floatingLayer) ||
      !draftController.hasVisibleArtwork();
    copyFontButton.disabled =
      !currentEntry?.painted || !cellLoaded || Boolean(floatingLayer);
    copySelectionButton.disabled =
      !currentEntry ||
      !cellLoaded ||
      Boolean(floatingLayer) ||
      !selection ||
      !draftController.selectionHasVisibleArtwork();
    pasteArtButton.disabled =
      !currentEntry ||
      !cellLoaded ||
      !artworkClipboard ||
      pastePending ||
      Boolean(floatingLayer) ||
      (tool === "select" && artworkClipboard.kind !== "selection");
  }

  function updateEditorModePanels() {
    const layerMode = Boolean(floatingLayer);
    const selectionMode = tool === "select" && !layerMode;
    view.classList.toggle("is-layer-mode", layerMode);
    view.classList.toggle("is-selection-mode", selectionMode);
    canvas.tabIndex = layerMode ? 0 : -1;
    toolsPanel.hidden = layerMode;
    historyPanel.hidden = layerMode || selectionMode;
    drawingPanel.hidden = layerMode || selectionMode;
    tracingPanel.hidden = layerMode || selectionMode;
    transferPanel.hidden = layerMode;
    layerPanel.hidden = !layerMode;
    if (layerHelp) layerHelp.hidden = !layerMode;
    filePanel.hidden = layerMode || selectionMode;
    copyArtButton.hidden = selectionMode;
    copyFontButton.hidden = selectionMode;
    copySelectionButton.hidden = !selectionMode;
    pasteArtButton.hidden = false;
    previewActions.hidden = layerMode || selectionMode;
    toolButtons.forEach((button) => {
      button.disabled = layerMode;
    });
    invertLayerButton.setAttribute(
      "aria-pressed",
      String(Boolean(floatingLayer?.inverted)),
    );
    invertLayerButton.classList.toggle(
      "is-active",
      Boolean(floatingLayer?.inverted),
    );
    updateLayerControlStates();
  }

  function updateLayerControlStates() {
    if (!floatingLayer) return;
    layerNudgeButtons.forEach((button) => {
      const nextX = floatingLayer.x + Number(button.dataset.layerX);
      const nextY = floatingLayer.y + Number(button.dataset.layerY);
      button.disabled = !layerPositionAllowed(floatingLayer, nextX, nextY);
    });
    syncRovingGrid(layerNudgeButtons);
    layerTransformButtons.forEach((button) => {
      const transform = button.dataset.layerTransform;
      if (transform === "rotate-left" || transform === "rotate-right") {
        const rotated = nextLayerRotation(
          floatingLayer,
          transform === "rotate-right",
          paletteController.activePaletteColors(),
        );
        button.disabled = !layerTransformChangesPixels(floatingLayer, rotated);
      } else {
        button.disabled = pixelsEqual(
          floatingLayer.pixels,
          flipPixels(floatingLayer, transform === "flip-horizontal"),
        );
      }
    });
  }

}
