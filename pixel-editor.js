import {
  canvasIsBlackSilhouette,
  canvasToPng,
  downloadBlob,
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
  paintPixelInto,
  pixelOffset,
  pixelsEqual,
  trimVisiblePixels,
} from "./src/pixel-editor/pixel-editor-geometry-helpers.js";
import {
  compositeLayer,
  effectiveLayerPixels,
  flipPixels,
  layerAxisBounds,
  layerPositionAllowed,
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
  extractCell,
  getNestedFileHandle,
} from "./src/pixel-editor/pixel-editor-atlas-io.js";
import { createPixelEditorDraftController } from "./src/pixel-editor/pixel-editor-drafts.js";
import { createPixelEditorPaletteController } from "./src/pixel-editor/pixel-editor-palette.js";
import {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  compareSkinToneHelpers,
  findSkinTone,
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
  let selectionAnimationFrame;
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

  toolButtons.forEach((button) =>
    button.addEventListener("click", () => selectTool(button.dataset.tool)),
  );
  traceAlpha.addEventListener("input", () => {
    updateTraceOutput();
    draw();
  });
  traceNudgeButtons.forEach((button) =>
    button.addEventListener("click", () => {
      traceOffsetX += Number(button.dataset.traceX);
      traceOffsetY += Number(button.dataset.traceY);
      renderTrace();
      draw();
    }),
  );
  paletteButtons.forEach((button) =>
    button.addEventListener("click", () =>
      paletteController.selectPaletteColor(button),
    ),
  );
  undoButton.addEventListener("click", undo);
  redoButton.addEventListener("click", redo);
  copyArtButton.addEventListener("click", copyPixelArt);
  copyFontButton.addEventListener("click", copyFontGlyph);
  copySelectionButton.addEventListener("click", copySelection);
  pasteArtButton.addEventListener("click", pastePixelArt);
  layerNudgeButtons.forEach((button) =>
    button.addEventListener("click", () =>
      moveFloatingLayer(
        Number(button.dataset.layerX),
        Number(button.dataset.layerY),
      ),
    ),
  );
  layerTransformButtons.forEach((button) =>
    button.addEventListener("click", () =>
      transformFloatingLayer(button.dataset.layerTransform),
    ),
  );
  bakeLayerButton.addEventListener("click", bakeFloatingLayer);
  cancelLayerButton.addEventListener("click", cancelFloatingLayer);
  invertLayerButton.addEventListener("click", toggleFloatingLayerInversion);
  saveButton.addEventListener("click", saveAtlas);
  downloadButton.addEventListener("click", downloadAtlas);
  downloadEmojiButton.addEventListener("click", downloadEmojiPng);
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
  draw();

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
      renderTrace();
      draftController.resetHistory();
      draw();
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
          renderTrace();
          draw();
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
        renderTrace();
        draw();
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
        drawFontPreview();
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
      draw();
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
    draw();
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

  function renderTrace() {
    const traceContext = traceCanvas.getContext("2d");
    traceContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    drawCenteredEmoji(
      traceContext,
      currentEmoji,
      '11px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      traceOffsetX,
      traceOffsetY,
    );
    drawOfficialPreview();
    drawFontPreview();
  }

  function draw(updateState = true) {
    const displayCell = DISPLAY_SIZE / CELL_SIZE;
    context.clearRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
    drawCheckerboard(context, DISPLAY_SIZE);
    if (Number(traceAlpha.value) > 0 && currentEmoji) {
      context.save();
      context.globalAlpha = Number(traceAlpha.value) / 100;
      context.imageSmoothingEnabled = false;
      context.drawImage(traceCanvas, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
      context.restore();
    }
    for (let y = 0; y < CELL_SIZE; y += 1) {
      for (let x = 0; x < CELL_SIZE; x += 1) {
        const offset = pixelOffset(x, y);
        const alpha = pixels[offset + 3];
        if (alpha === 0) continue;
        context.fillStyle = `rgba(${pixels[offset]}, ${pixels[offset + 1]}, ${pixels[offset + 2]}, ${alpha / 255})`;
        context.fillRect(
          x * displayCell,
          y * displayCell,
          displayCell,
          displayCell,
        );
      }
    }
    drawFloatingLayer(context, displayCell);
    context.beginPath();
    for (let index = 0; index <= CELL_SIZE; index += 1) {
      const position = index * displayCell + 0.5;
      context.moveTo(position, 0);
      context.lineTo(position, DISPLAY_SIZE);
      context.moveTo(0, position);
      context.lineTo(DISPLAY_SIZE, position);
    }
    context.strokeStyle = "rgb(255 255 255 / 24%)";
    context.lineWidth = 1;
    context.stroke();
    drawSelectionOutline(context, displayCell);
    drawArtworkPreview();
    if (updateState) {
      draftController.rememberCurrentDraft();
      draftController.updateDirtyState();
      draftController.updateFileButtons();
      updateTransferButtons();
      draftController.updateHistoryButtons();
      updateEditorModePanels();
    }
    updateSelectionAnimation();
  }

  function drawFloatingLayer(targetContext, displayCell) {
    if (!floatingLayer) return;
    const layerPixels = effectiveLayerPixels(
      floatingLayer,
      paletteController.activePaletteColors(),
    );
    for (let y = 0; y < floatingLayer.height; y += 1) {
      for (let x = 0; x < floatingLayer.width; x += 1) {
        const offset = (y * floatingLayer.width + x) * 4;
        const alpha = layerPixels[offset + 3];
        if (alpha === 0) continue;
        targetContext.fillStyle = `rgba(${layerPixels[offset]}, ${layerPixels[offset + 1]}, ${layerPixels[offset + 2]}, ${alpha / 255})`;
        targetContext.fillRect(
          (floatingLayer.x + x) * displayCell,
          (floatingLayer.y + y) * displayCell,
          displayCell,
          displayCell,
        );
      }
    }
    targetContext.save();
    targetContext.setLineDash([5, 4]);
    targetContext.strokeStyle = "#6de0ff";
    targetContext.lineWidth = 2;
    targetContext.strokeRect(
      floatingLayer.x * displayCell + 1,
      floatingLayer.y * displayCell + 1,
      floatingLayer.width * displayCell - 2,
      floatingLayer.height * displayCell - 2,
    );
    targetContext.restore();
  }

  function drawSelectionOutline(targetContext, displayCell) {
    if (!selection || floatingLayer || tool !== "select") return;
    targetContext.save();
    targetContext.setLineDash([7, 7]);
    targetContext.lineDashOffset = selectionDashOffset;
    targetContext.strokeStyle = "#000000";
    targetContext.lineWidth = 4;
    targetContext.strokeRect(
      selection.x * displayCell + 2,
      selection.y * displayCell + 2,
      selection.width * displayCell - 4,
      selection.height * displayCell - 4,
    );
    targetContext.lineDashOffset = selectionDashOffset + 7;
    targetContext.strokeStyle = "#ffffff";
    targetContext.lineWidth = 2;
    targetContext.strokeRect(
      selection.x * displayCell + 2,
      selection.y * displayCell + 2,
      selection.width * displayCell - 4,
      selection.height * displayCell - 4,
    );
    targetContext.restore();
  }

  function updateSelectionAnimation() {
    const shouldAnimate =
      tool === "select" && Boolean(selection) && !floatingLayer && !view.hidden;
    if (!shouldAnimate) {
      if (selectionAnimationFrame)
        cancelAnimationFrame(selectionAnimationFrame);
      selectionAnimationFrame = undefined;
      return;
    }
    if (selectionAnimationFrame) return;
    selectionAnimationFrame = requestAnimationFrame(animateSelectionOutline);
  }

  function animateSelectionOutline(timestamp) {
    selectionAnimationFrame = undefined;
    if (tool !== "select" || !selection || floatingLayer || view.hidden) return;
    selectionDashOffset = -(timestamp / 55) % 14;
    draw(false);
  }

  function pointInFloatingLayer(point) {
    return (
      point.x >= floatingLayer.x &&
      point.x < floatingLayer.x + floatingLayer.width &&
      point.y >= floatingLayer.y &&
      point.y < floatingLayer.y + floatingLayer.height
    );
  }

  function drawOfficialPreview() {
    const previewContext = officialPreview.getContext("2d");
    previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    previewContext.drawImage(traceCanvas, 0, 0);
  }

  function drawFontPreview() {
    const previewContext = fontPreview.getContext("2d");
    previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    if (!currentEntry?.painted) return;
    const proposed = currentEntry.releaseStatus === "proposed";
    const familyProperty = proposed
      ? "--pixel-emoji-proposed-family"
      : "--pixel-emoji-released-family";
    const familyFallback = proposed
      ? '"Pixel Emoji Proposed"'
      : '"Pixel Emoji"';
    const family =
      getComputedStyle(document.documentElement)
        .getPropertyValue(familyProperty)
        .trim() || familyFallback;
    const render = () => {
      previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
      previewContext.fillStyle = currentArtworkIsBlackSilhouette()
        ? "#ffffff"
        : "#000000";
      const fontEmoji = currentEntry.privateUseCodePoint
        ? String.fromCodePoint(
            Number.parseInt(currentEntry.privateUseCodePoint, 16),
          )
        : currentEmoji;
      drawCenteredEmoji(previewContext, fontEmoji, `${CELL_SIZE}px ${family}`);
    };
    render();
    document.fonts
      ?.load(
        `${CELL_SIZE}px ${family}`,
        currentEntry.privateUseCodePoint
          ? String.fromCodePoint(
              Number.parseInt(currentEntry.privateUseCodePoint, 16),
            )
          : currentEmoji,
      )
      .then(render);
  }

  function drawArtworkPreview() {
    const renderedArtwork = currentArtworkPreviewCanvas();
    if (canvasIsBlackSilhouette(renderedArtwork)) {
      recolorVisibleCanvasPixels(renderedArtwork, 255, 255, 255);
    }
    const previewContexts = [
      artworkPreview.getContext("2d"),
      downloadPreview.getContext("2d"),
    ];
    previewContexts.forEach((previewContext) => {
      previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
      previewContext.drawImage(renderedArtwork, 0, 0);
    });
  }

  function currentArtworkPreviewCanvas() {
    const renderedArtwork = imageDataCanvas(
      pixels,
      CELL_SIZE,
      CELL_SIZE,
    );
    if (floatingLayer) {
      const layerCanvas = imageDataCanvas(
        effectiveLayerPixels(floatingLayer, paletteController.activePaletteColors()),
        floatingLayer.width,
        floatingLayer.height,
      );
      renderedArtwork
        .getContext("2d")
        .drawImage(layerCanvas, floatingLayer.x, floatingLayer.y);
    }
    return renderedArtwork;
  }

  function currentArtworkIsBlackSilhouette() {
    return canvasIsBlackSilhouette(currentArtworkPreviewCanvas());
  }

  function onPointerDown(event) {
    if (!currentEntry || !cellLoaded || event.button !== 0) return;
    canvas.focus({ preventScroll: true });
    const point = pointerCell(event);
    canvas.setPointerCapture(event.pointerId);
    if (floatingLayer) {
      if (pointInFloatingLayer(point)) {
        layerDragStart = point;
        layerDragOrigin = { x: floatingLayer.x, y: floatingLayer.y };
      }
      return;
    }
    pointerStart = point;
    pointerPrevious = point;
    if (tool === "select") {
      selection = boundsFromPoints(point, point);
      draw();
      return;
    }
    if (tool === "eyedropper") {
      paletteController.pickColor(point);
      return;
    }
    draftController.pushHistory();
    if (tool === "bucket") {
      floodFill(point);
      pointerStart = undefined;
      draw();
      return;
    }
    shapeBase = pixels.slice();
    if (tool === "pencil") paintPixel(point);
    if (tool === "line") drawLine(point, point);
    if (tool === "rectangle" || tool === "ellipse")
      drawShape(point, point, tool);
    draw();
  }

  function onPointerMove(event) {
    if (layerDragStart && canvas.hasPointerCapture(event.pointerId)) {
      const point = pointerCell(event);
      setFloatingLayerPosition(
        layerDragOrigin.x + point.x - layerDragStart.x,
        layerDragOrigin.y + point.y - layerDragStart.y,
      );
      return;
    }
    if (!pointerStart || !canvas.hasPointerCapture(event.pointerId)) return;
    const point = pointerCell(event);
    if (tool === "select") {
      selection = boundsFromPoints(pointerStart, point);
    } else if (tool === "pencil") {
      drawLine(pointerPrevious, point);
      pointerPrevious = point;
    } else if (tool === "line") {
      pixels.set(shapeBase);
      drawLine(pointerStart, point);
    } else if (tool === "rectangle" || tool === "ellipse") {
      pixels.set(shapeBase);
      drawShape(pointerStart, point, tool);
    }
    draw();
  }

  function onPointerUp(event) {
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
    pointerStart = undefined;
    pointerPrevious = undefined;
    shapeBase = undefined;
    layerDragStart = undefined;
    layerDragOrigin = undefined;
    updateTransferButtons();
  }

  function onPointerCancel(event) {
    if (shapeBase) pixels.set(shapeBase);
    onPointerUp(event);
    draw();
  }

  function onCanvasKeyDown(event) {
    if (!floatingLayer) return;
    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        transformFloatingLayer("rotate-left");
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        transformFloatingLayer("rotate-right");
        return;
      }
    }
    if (event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        transformFloatingLayer("flip-horizontal");
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        transformFloatingLayer("flip-vertical");
        return;
      }
    }
    const movement = {
      ArrowLeft: [-1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowRight: [1, 0],
    }[event.key];
    if (movement) {
      event.preventDefault();
      moveFloatingLayer(...movement);
    } else if (event.key === "Enter") {
      event.preventDefault();
      bakeFloatingLayer();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelFloatingLayer();
    }
  }

  function onEditorKeyDown(event) {
    if (view.hidden || !dialog.open) return;
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === "z") {
      if (event.shiftKey && !redoButton.disabled) {
        event.preventDefault();
        redo();
      } else if (!event.shiftKey && !undoButton.disabled) {
        event.preventDefault();
        undo();
      }
      return;
    }
    if (key === "y" && !redoButton.disabled) {
      event.preventDefault();
      redo();
    } else if (
      key === "c" &&
      tool === "select" &&
      !copySelectionButton.disabled
    ) {
      event.preventDefault();
      copySelection();
    } else if (key === "c" && !copyArtButton.disabled) {
      event.preventDefault();
      copyPixelArt();
    } else if (key === "v" && !pasteArtButton.disabled) {
      event.preventDefault();
      pastePixelArt();
    }
  }

  function pointerCell(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: clamp(
        Math.floor(((event.clientX - bounds.left) / bounds.width) * CELL_SIZE),
        0,
        CELL_SIZE - 1,
      ),
      y: clamp(
        Math.floor(((event.clientY - bounds.top) / bounds.height) * CELL_SIZE),
        0,
        CELL_SIZE - 1,
      ),
    };
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
    draw();
  }

  function redo() {
    draftController.redo();
    draw();
  }

  function copyPixelArt() {
    if (!currentEntry || !cellLoaded || !draftController.hasVisibleArtwork()) return;
    const trimmed = trimVisiblePixels(pixels, CELL_SIZE, CELL_SIZE);
    if (!trimmed) return;
    artworkClipboard = {
      kind: "art",
      pixels: trimmed.pixels,
      width: trimmed.width,
      height: trimmed.height,
      x: trimmed.x,
      y: trimmed.y,
      skinTones: skinToneSequence(currentEntry.codePoints),
      baseSequence: skinToneBaseSequence(currentEntry.codePoints),
      sourceKey: currentEntry.key,
    };
    updateTransferButtons();
    status.textContent = translate("pixelArtCopied", "Pixel art copied.");
  }

  function copySelection() {
    if (!currentEntry || !cellLoaded || !selection) return;
    const selectedPixels = extractPixels(
      pixels,
      CELL_SIZE,
      selection.x,
      selection.y,
      selection.width,
      selection.height,
    );
    if (!hasVisiblePixels(selectedPixels)) return;
    artworkClipboard = {
      kind: "selection",
      pixels: selectedPixels,
      width: selection.width,
      height: selection.height,
      x: selection.x,
      y: selection.y,
      skinTones: skinToneSequence(currentEntry.codePoints),
      baseSequence: skinToneBaseSequence(currentEntry.codePoints),
      sourceKey: currentEntry.key,
    };
    updateTransferButtons();
    status.textContent = translate(
      "selectionCopied",
      "Selected artwork copied.",
    );
  }

  async function copyFontGlyph() {
    if (!currentEntry?.painted || !cellLoaded) return;
    copyFontButton.disabled = true;
    try {
      const response = await fetch(
        `pixel-font/atlases/${currentEntry.atlas}`,
      );
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("image/png")
      ) {
        throw new Error("Pixel font source atlas is unavailable");
      }
      artworkClipboard = {
        kind: "font",
        pixels: await extractCell(await response.blob(), currentEntry),
        width: CELL_SIZE,
        height: CELL_SIZE,
        x: 0,
        y: 0,
        skinTones: skinToneSequence(currentEntry.codePoints),
        baseSequence: skinToneBaseSequence(currentEntry.codePoints),
        sourceKey: currentEntry.key,
      };
      status.textContent = translate(
        "fontGlyphCopied",
        "Custom font glyph copied.",
      );
    } catch (error) {
      console.warn("Unable to copy custom font glyph", error);
      status.textContent = translate(
        "fontGlyphCopyFailed",
        "The custom font glyph could not be copied.",
      );
    }
    updateTransferButtons();
  }

  async function pastePixelArt() {
    if (
      !currentEntry ||
      !cellLoaded ||
      !artworkClipboard ||
      pastePending ||
      (tool === "select" && artworkClipboard.kind !== "selection")
    )
      return;
    const targetEntry = currentEntry;
    const clipboard = cloneFloatingLayer(artworkClipboard);
    pastePending = true;
    updateTransferButtons();
    const helper = await findSkinTonePasteHelper(clipboard, targetEntry).catch(
      (error) => {
        console.warn("Unable to load skin-tone paste helper", error);
        return undefined;
      },
    );
    pastePending = false;
    if (currentEntry !== targetEntry) {
      updateTransferButtons();
      return;
    }
    floatingLayer = clipboard;
    floatingLayer.pixels = remapSkinTonePixels(
      floatingLayer.pixels,
      clipboard.skinTones,
      skinToneSequence(targetEntry.codePoints),
      helper
        ? {
            ownership: helper.ownership,
            ownershipWidth: CELL_SIZE,
            width: clipboard.width,
            offsetX: clipboard.x,
            offsetY: clipboard.y,
          }
        : undefined,
    );
    floatingLayer.inverted = false;
    selection = undefined;
    draw();
    canvas.focus({ preventScroll: true });
    status.textContent = translate(
      "layerPasted",
      "Artwork pasted as a floating layer.",
    );
  }

  function moveFloatingLayer(horizontal, vertical) {
    if (!floatingLayer) return;
    const nextX = floatingLayer.x + horizontal;
    const nextY = floatingLayer.y + vertical;
    if (!layerPositionAllowed(floatingLayer, nextX, nextY)) return;
    setFloatingLayerPosition(nextX, nextY);
  }

  function setFloatingLayerPosition(x, y) {
    if (!floatingLayer) return;
    const [minimumX, maximumX] = layerAxisBounds(floatingLayer.width);
    const [minimumY, maximumY] = layerAxisBounds(floatingLayer.height);
    floatingLayer.x = clamp(x, minimumX, maximumX);
    floatingLayer.y = clamp(y, minimumY, maximumY);
    draw();
  }

  function transformFloatingLayer(transform) {
    if (!floatingLayer) return;
    const previousCenterX = floatingLayer.x + floatingLayer.width / 2;
    const previousCenterY = floatingLayer.y + floatingLayer.height / 2;
    if (transform === "rotate-left" || transform === "rotate-right") {
      const rotated = nextLayerRotation(
        floatingLayer,
        transform === "rotate-right",
        paletteController.activePaletteColors(),
      );
      if (!layerTransformChangesPixels(floatingLayer, rotated)) return;
      floatingLayer.pixels = rotated.pixels;
      floatingLayer.width = rotated.width;
      floatingLayer.height = rotated.height;
      floatingLayer.rotationSource = rotated.rotationSource;
      floatingLayer.rotationDegrees = rotated.rotationDegrees;
      floatingLayer.x = Math.round(previousCenterX - rotated.width / 2);
      floatingLayer.y = Math.round(previousCenterY - rotated.height / 2);
    } else if (transform === "flip-horizontal") {
      const flipped = flipPixels(floatingLayer, true);
      if (pixelsEqual(floatingLayer.pixels, flipped)) return;
      floatingLayer.pixels = flipped;
      resetLayerRotation(floatingLayer);
    } else if (transform === "flip-vertical") {
      const flipped = flipPixels(floatingLayer, false);
      if (pixelsEqual(floatingLayer.pixels, flipped)) return;
      floatingLayer.pixels = flipped;
      resetLayerRotation(floatingLayer);
    }
    setFloatingLayerPosition(floatingLayer.x, floatingLayer.y);
  }

  function bakeFloatingLayer() {
    if (!floatingLayer) return;
    draftController.pushHistory();
    compositeLayer(pixels, {
      ...floatingLayer,
      pixels: effectiveLayerPixels(floatingLayer, paletteController.activePaletteColors()),
    });
    floatingLayer = undefined;
    draw();
    status.textContent = translate(
      "layerBaked",
      "Floating layer merged into the artwork.",
    );
  }

  function cancelFloatingLayer() {
    if (!floatingLayer) return;
    floatingLayer = undefined;
    draw();
    status.textContent = "";
  }

  function toggleFloatingLayerInversion() {
    if (!floatingLayer) return;
    floatingLayer.inverted = !floatingLayer.inverted;
    draw();
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

  async function findSkinTonePasteHelper(clipboard, targetEntry) {
    const sourceTones = clipboard.skinTones ?? [];
    const targetTones = skinToneSequence(targetEntry.codePoints);
    if (
      sourceTones.length < 2 ||
      sourceTones.length !== targetTones.length ||
      clipboard.baseSequence !== skinToneBaseSequence(targetEntry.codePoints)
    )
      return undefined;

    const manifest = await loadManifest();
    const candidates = Object.values(manifest.glyphs)
      .filter((entry) => {
        const tones = skinToneSequence(entry.codePoints);
        return (
          entry.key !== clipboard.sourceKey &&
          entry.key !== targetEntry.key &&
          skinToneBaseSequence(entry.codePoints) === clipboard.baseSequence &&
          tones.length === sourceTones.length &&
          new Set(tones).size === tones.length &&
          (entry.painted || artworkDrafts.has(entry.key))
        );
      })
      .sort(compareSkinToneHelpers);

    for (const entry of candidates) {
      const helperPixels = await loadHelperPixels(entry);
      if (!helperPixels) continue;
      const ownership = buildSkinToneOwnership(
        helperPixels,
        skinToneSequence(entry.codePoints),
      );
      if (ownership) return { entry, ownership };
    }
    if (sourceTones.length === 2) {
      return {
        entry: undefined,
        ownership: buildTwoPersonOwnership(),
      };
    }
    return undefined;
  }

  async function loadHelperPixels(entry) {
    const draft = artworkDrafts.get(entry.key);
    if (draft?.pixels && hasVisiblePixels(draft.pixels))
      return draft.pixels.slice();
    const response = await fetch(`pixel-font/atlases/${entry.atlas}`).catch(
      () => undefined,
    );
    if (
      !response?.ok ||
      !response.headers.get("content-type")?.includes("image/png")
    )
      return undefined;
    const helperPixels = await extractCell(await response.blob(), entry);
    return hasVisiblePixels(helperPixels) ? helperPixels : undefined;
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

  async function saveAtlas() {
    if (!currentEntry || !atlasBlob || saveButton.disabled) return;
    if (!window.showDirectoryPicker) {
      status.textContent = translate(
        "directoryAccessUnavailable",
        "Direct folder access is unavailable; downloading the atlas instead.",
      );
      await downloadAtlas();
      return;
    }
    try {
      directoryHandle ??= await window.showDirectoryPicker({
        id: "pixel-emoji-atlases",
        mode: "readwrite",
        startIn: "documents",
      });
      const fileHandle = await getNestedFileHandle(
        directoryHandle,
        currentEntry.atlas,
        true,
      );
      const updatedBlob = await renderUpdatedAtlas(atlasBlob);
      const writable = await fileHandle.createWritable();
      await writable.write(updatedBlob);
      await writable.close();
      atlasBlob = updatedBlob;
      atlasExists = true;
      draftController.markAtlasClean(currentEntry.atlas);
      draftController.updateFileButtons();
      status.textContent = translate("atlasSaved", "Atlas PNG saved.");
    } catch (error) {
      if (error.name === "AbortError") return;
      console.warn("Unable to save pixel atlas", error);
      status.textContent = translate(
        "atlasSaveFailed",
        `Could not save ${currentEntry.atlas}. Choose the pixel-font/atlases directory.`,
      );
      directoryHandle = undefined;
    }
  }

  async function downloadAtlas() {
    if (!currentEntry || !atlasBlob || downloadButton.disabled) return;
    const updatedBlob = await renderUpdatedAtlas(atlasBlob);
    atlasBlob = updatedBlob;
    atlasExists = true;
    draftController.markAtlasClean(currentEntry.atlas);
    draftController.updateFileButtons();
    downloadBlob(updatedBlob, currentEntry.atlas.split("/").at(-1));
    status.textContent = translate(
      "atlasDownloaded",
      "Updated atlas PNG downloaded.",
    );
  }

  async function renderUpdatedAtlas(source) {
    draftController.rememberCurrentDraft();
    const image = await createImageBitmap(source);
    if (image.width !== atlasWidth || image.height !== atlasHeight) {
      image.close();
      throw new Error(
        `The selected atlas must be exactly ${atlasWidth} by ${atlasHeight} pixels`,
      );
    }
    const atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = image.width;
    atlasCanvas.height = image.height;
    const atlasContext = atlasCanvas.getContext("2d");
    atlasContext.drawImage(image, 0, 0);
    image.close();
    for (const draft of artworkDrafts.values()) {
      if (draft.entry.atlas !== currentEntry.atlas) continue;
      atlasContext.putImageData(
        new ImageData(draft.pixels.slice(), CELL_SIZE, CELL_SIZE),
        draft.entry.x,
        draft.entry.y,
      );
    }
    return new Promise((resolve, reject) => {
      atlasCanvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("PNG encoding failed")),
        "image/png",
      );
    });
  }

  async function downloadEmojiPng() {
    if (downloadEmojiButton.disabled || !currentEntry) return;
    const blob = await canvasToPng(
      imageDataCanvas(pixels, CELL_SIZE, CELL_SIZE),
    );
    downloadBlob(blob, `${currentEntry.key}.png`);
    status.textContent = translate(
      "emojiPngDownloaded",
      "12 by 12 emoji PNG downloaded.",
    );
  }

}
