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
  extractPixels,
  hasVisiblePixels,
  pixelOffset,
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
  let undoStack = [];
  let redoStack = [];

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
    button.addEventListener("click", () => selectPaletteColor(button)),
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
  window.addEventListener("beforeunload", warnAboutDirtyArtwork);
  bindRovingGrid(toolButtons);
  bindRovingGrid(historyButtons);
  bindPaletteGrid(paletteButtons);
  bindRovingGrid(traceNudgeButtons);
  bindRovingGrid(layerNudgeButtons);
  bindRovingGrid(previewActionButtons);
  updatePaletteSelection();
  updateShapeToolButtons();
  updateTraceOutput();
  updatePreviewActionLabels();
  draw();

  return {
    element: view,
    async open(key, emoji) {
      const requestedLoadId = ++loadId;
      rememberCurrentDraft();
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
      undoStack = [];
      redoStack = [];
      renderTrace();
      updateHistoryButtons();
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
        updateSkinTonePalette(entry?.codePoints);
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
        undoStack = [];
        redoStack = [];
        updateLocation();
        status.textContent = "";
        renderTrace();
        updateHistoryButtons();
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
      updatePreviewActionLabels();
      updateSkinTonePalette(currentEntry?.codePoints);
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
      rememberCurrentDraft();
      updateDirtyState();
      updateFileButtons();
      updateTransferButtons();
      updateHistoryButtons();
      updateEditorModePanels();
    }
    updateSelectionAnimation();
  }

  function drawFloatingLayer(targetContext, displayCell) {
    if (!floatingLayer) return;
    const layerPixels = effectiveLayerPixels(
      floatingLayer,
      activePaletteColors(),
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
        effectiveLayerPixels(floatingLayer, activePaletteColors()),
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
      pickColor(point);
      return;
    }
    pushHistory();
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
    if (selectedColor === "transparent") return [0, 0, 0, 0];
    const value = selectedColor.slice(1);
    return [
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
      255,
    ];
  }

  function paintPixel(point, color = currentColor()) {
    pixels.set(color, pixelOffset(point.x, point.y));
  }

  function drawLine(start, end) {
    let x = start.x;
    let y = start.y;
    const deltaX = Math.abs(end.x - x);
    const deltaY = -Math.abs(end.y - y);
    const stepX = x < end.x ? 1 : -1;
    const stepY = y < end.y ? 1 : -1;
    let error = deltaX + deltaY;
    while (true) {
      paintPixel({ x, y });
      if (x === end.x && y === end.y) break;
      const doubled = error * 2;
      if (doubled >= deltaY) {
        error += deltaY;
        x += stepX;
      }
      if (doubled <= deltaX) {
        error += deltaX;
        y += stepY;
      }
    }
  }

  function drawShape(start, end, shape) {
    const left = Math.min(start.x, end.x);
    const right = Math.max(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const bottom = Math.max(start.y, end.y);
    if (shape === "rectangle") {
      for (let y = top; y <= bottom; y += 1) {
        for (let x = left; x <= right; x += 1) {
          if (
            fillShapesEnabled ||
            x === left ||
            x === right ||
            y === top ||
            y === bottom
          ) {
            paintPixel({ x, y });
          }
        }
      }
      return;
    }
    const radiusX = Math.max((right - left + 1) / 2, 0.5);
    const radiusY = Math.max((bottom - top + 1) / 2, 0.5);
    const centerX = (left + right + 1) / 2;
    const centerY = (top + bottom + 1) / 2;
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        const outer =
          ((x + 0.5 - centerX) / radiusX) ** 2 +
            ((y + 0.5 - centerY) / radiusY) ** 2 <=
          1;
        const innerRadiusX = radiusX - 1;
        const innerRadiusY = radiusY - 1;
        const inner =
          innerRadiusX > 0 &&
          innerRadiusY > 0 &&
          ((x + 0.5 - centerX) / innerRadiusX) ** 2 +
            ((y + 0.5 - centerY) / innerRadiusY) ** 2 <=
            1;
        if (outer && (fillShapesEnabled || !inner)) paintPixel({ x, y });
      }
    }
  }

  function floodFill(start) {
    const replacement = currentColor();
    const offset = pixelOffset(start.x, start.y);
    const target = [...pixels.slice(offset, offset + 4)];
    if (target.every((value, index) => value === replacement[index])) return;
    const queue = [start];
    const visited = new Set();
    while (queue.length > 0) {
      const point = queue.pop();
      const key = `${point.x},${point.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const pointOffset = pixelOffset(point.x, point.y);
      if (
        !target.every((value, index) => pixels[pointOffset + index] === value)
      )
        continue;
      pixels.set(replacement, pointOffset);
      if (point.x > 0) queue.push({ x: point.x - 1, y: point.y });
      if (point.x < CELL_SIZE - 1) queue.push({ x: point.x + 1, y: point.y });
      if (point.y > 0) queue.push({ x: point.x, y: point.y - 1 });
      if (point.y < CELL_SIZE - 1) queue.push({ x: point.x, y: point.y + 1 });
    }
  }

  function pickColor(point) {
    const offset = pixelOffset(point.x, point.y);
    let [red, green, blue, alpha] = pixels.slice(offset, offset + 4);
    if (alpha === 0 && Number(traceAlpha.value) > 0) {
      [red, green, blue, alpha] = traceCanvas
        .getContext("2d")
        .getImageData(point.x, point.y, 1, 1).data;
    }
    selectedColor =
      alpha === 0
        ? "transparent"
        : nearestPaletteColor(red, green, blue, activePaletteColors());
    selectedSkinTone = "";
    if (selectedColor !== "transparent") {
      const activeToneButtons = paletteButtons.filter(
        (button) => button.dataset.skinTone && !button.hidden,
      );
      const matchingButton =
        activeToneButtons.find((button) => {
          const tone = findSkinTone(button.dataset.skinTone);
          return tone?.color === selectedColor;
        }) ??
        activeToneButtons.find((button) =>
          skinToneCycle(button.dataset.skinTone).some(
            (shade) => shade.color === selectedColor,
          ),
        );
      if (matchingButton) {
        const cycle = skinToneCycle(matchingButton.dataset.skinTone);
        const cycleIndex = cycle.findIndex(
          (shade) => shade.color === selectedColor,
        );
        selectedSkinTone = matchingButton.dataset.skinTone;
        setSkinToneShade(matchingButton, Math.max(0, cycleIndex));
      }
    }
    updatePaletteSelection();
  }

  function activePaletteColors() {
    return [
      ...EGA_COLORS,
      ...paletteButtons
        .filter((button) => button.dataset.skinTone && !button.hidden)
        .flatMap((button) =>
          skinToneCycle(button.dataset.skinTone).map((shade) => shade.color),
        ),
    ];
  }

  function updateSkinTonePalette(codePoints = []) {
    const previousSkinTone = selectedSkinTone;
    const previousButton = paletteButtons.find(
      (button) => button.dataset.skinTone === previousSkinTone,
    );
    const previousCycleIndex = Number(previousButton?.dataset.cycleIndex ?? 0);
    const activeCodePoints = new Set(
      codePoints.map((codePoint) => codePoint.toUpperCase()),
    );
    const activeButtons = paletteButtons.filter((button) => {
      if (!button.dataset.skinTone) return false;
      button.hidden = !activeCodePoints.has(button.dataset.skinTone);
      button.style.removeProperty("grid-column");
      delete button.dataset.gridColumn;
      delete button.dataset.gridRow;
      if (button.hidden) {
        setSkinToneShade(button, 0);
      } else {
        updateSkinToneShadeLabel(button);
      }
      return !button.hidden;
    });
    const palette = view.querySelector(".pixel-editor-palette");
    palette.classList.toggle("has-one-skin-tone", activeButtons.length === 1);
    palette.classList.toggle(
      "has-multiple-skin-tones",
      activeButtons.length > 1,
    );
    if (activeButtons.length > 1) {
      const firstColumn = Math.floor((9 - activeButtons.length) / 2) + 1;
      activeButtons.forEach((button, index) => {
        button.style.gridColumn = String(firstColumn + index);
        button.dataset.gridColumn = String(firstColumn + index);
        button.dataset.gridRow = "3";
      });
    } else if (activeButtons.length === 1) {
      activeButtons[0].dataset.gridColumn = "9";
      activeButtons[0].dataset.gridRow = "2";
    }
    if (previousSkinTone) {
      const nextButton =
        activeButtons.find(
          (button) => button.dataset.skinTone === previousSkinTone,
        ) ?? activeButtons[0];
      if (nextButton) {
        selectedSkinTone = nextButton.dataset.skinTone;
        const nextCycleIndex =
          nextButton.dataset.skinTone === previousSkinTone
            ? Math.min(
                previousCycleIndex,
                skinToneCycle(nextButton.dataset.skinTone).length - 1,
              )
            : 0;
        setSkinToneShade(nextButton, nextCycleIndex);
        selectedColor = skinToneCycle(nextButton.dataset.skinTone)[
          nextCycleIndex
        ].color;
      } else {
        // Keep the contextual skin-tone tool ready for the next applicable
        // emoji, but select the eraser so navigation cannot paint EGA yellow.
        selectedColor = "transparent";
      }
    } else if (
      selectedColor !== "transparent" &&
      !activePaletteColors().includes(selectedColor)
    ) {
      selectedColor = "transparent";
    }
    updatePaletteSelection();
  }

  function selectPaletteColor(button) {
    if (button.dataset.transparent === "true") {
      selectedColor = "transparent";
      selectedSkinTone = "";
    } else if (button.dataset.skinTone) {
      const cycle = skinToneCycle(button.dataset.skinTone);
      const currentIndex = Number(button.dataset.cycleIndex ?? 0);
      const nextIndex =
        selectedSkinTone === button.dataset.skinTone
          ? (currentIndex + 1) % cycle.length
          : 0;
      selectedSkinTone = button.dataset.skinTone;
      setSkinToneShade(button, nextIndex);
      selectedColor = cycle[nextIndex].color;
    } else {
      selectedColor = button.dataset.color;
      selectedSkinTone = "";
    }
    updatePaletteSelection();
  }

  function updatePaletteSelection() {
    paletteButtons.forEach((button) => {
      const selected = button.dataset.skinTone
        ? selectedSkinTone === button.dataset.skinTone
        : button.dataset.transparent === "true"
          ? selectedColor === "transparent"
          : button.dataset.color === selectedColor;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    syncRovingGrid(
      paletteButtons,
      paletteButtons.find((button) => button.getAttribute("aria-pressed") === "true"),
    );
  }

  function setSkinToneShade(button, cycleIndex) {
    const cycle = skinToneCycle(button.dataset.skinTone);
    const shade = cycle[cycleIndex] ?? cycle[0];
    button.dataset.cycleIndex = String(cycleIndex);
    button.dataset.shade = shade.kind;
    button.dataset.color = shade.color;
    button.style.setProperty("--swatch", shade.color);
    updateSkinToneShadeLabel(button);
  }

  function updateSkinToneShadeLabel(button) {
    const tone = findSkinTone(button.dataset.skinTone);
    const cycle = skinToneCycle(button.dataset.skinTone);
    const shade = cycle[Number(button.dataset.cycleIndex ?? 0)] ?? cycle[0];
    if (!tone || !shade) return;
    const toneLabel = translate(tone.translationKey, tone.fallback);
    const shadeLabels = {
      normal: translate("normalColor", "Normal color"),
      lighter: translate("lighterColor", "Lighter color"),
      darker: translate("darkerColor", "Darker color"),
    };
    const label = `${toneLabel} — ${shadeLabels[shade.kind]}`;
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  function pushHistory() {
    undoStack.push(pixels.slice());
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
    updateHistoryButtons();
  }

  function undo() {
    const previous = undoStack.pop();
    if (!previous) return;
    redoStack.push(pixels.slice());
    pixels = previous;
    updateHistoryButtons();
    draw();
  }

  function redo() {
    const next = redoStack.pop();
    if (!next) return;
    undoStack.push(pixels.slice());
    pixels = next;
    updateHistoryButtons();
    draw();
  }

  function updateHistoryButtons() {
    undoButton.disabled = Boolean(floatingLayer) || undoStack.length === 0;
    redoButton.disabled = Boolean(floatingLayer) || redoStack.length === 0;
  }

  function copyPixelArt() {
    if (!currentEntry || !cellLoaded || !hasVisibleArtwork()) return;
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
        activePaletteColors(),
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
    pushHistory();
    compositeLayer(pixels, {
      ...floatingLayer,
      pixels: effectiveLayerPixels(floatingLayer, activePaletteColors()),
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
      !hasVisibleArtwork();
    copyFontButton.disabled =
      !currentEntry?.painted || !cellLoaded || Boolean(floatingLayer);
    copySelectionButton.disabled =
      !currentEntry ||
      !cellLoaded ||
      Boolean(floatingLayer) ||
      !selection ||
      !selectionHasVisibleArtwork();
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
          activePaletteColors(),
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
      markAtlasClean(currentEntry.atlas);
      updateFileButtons();
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
    markAtlasClean(currentEntry.atlas);
    updateFileButtons();
    downloadBlob(updatedBlob, currentEntry.atlas.split("/").at(-1));
    status.textContent = translate(
      "atlasDownloaded",
      "Updated atlas PNG downloaded.",
    );
  }

  async function renderUpdatedAtlas(source) {
    rememberCurrentDraft();
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

  function updateFileButtons() {
    const pendingAtlasLayer = hasPendingAtlasLayer();
    const canWrite =
      Boolean(currentEntry && atlasBlob) &&
      !pendingAtlasLayer &&
      (atlasExists || hasVisibleAtlasDraft());
    saveButton.disabled = !canWrite || !hasDirtyAtlasDraft();
    downloadButton.disabled = !canWrite;
    downloadEmojiButton.disabled =
      !currentEntry ||
      !cellLoaded ||
      Boolean(floatingLayer) ||
      !hasVisibleArtwork();
  }

  function hasDirtyAtlasDraft() {
    if (!currentEntry) return false;
    return [...artworkDrafts.values()].some(
      (draft) =>
        draft.entry.atlas === currentEntry.atlas &&
        dirtyKeys.has(draft.entry.key),
    );
  }

  function hasPendingAtlasLayer() {
    if (!currentEntry) return false;
    return [...artworkDrafts.values()].some(
      (draft) =>
        draft.entry.atlas === currentEntry.atlas && draft.floatingLayer,
    );
  }

  function hasVisibleArtwork() {
    return hasVisiblePixels(pixels);
  }

  function selectionHasVisibleArtwork() {
    if (!selection) return false;
    return hasVisiblePixels(
      extractPixels(
        pixels,
        CELL_SIZE,
        selection.x,
        selection.y,
        selection.width,
        selection.height,
      ),
    );
  }

  function hasVisibleAtlasDraft() {
    if (hasVisibleArtwork()) return true;
    if (!currentEntry) return false;
    return [...artworkDrafts.values()].some(
      (draft) =>
        draft.entry.atlas === currentEntry.atlas &&
        draft.pixels.some((value, index) => index % 4 === 3 && value > 0),
    );
  }

  function rememberCurrentDraft() {
    if (!currentEntry || !cellLoaded) return;
    artworkDrafts.set(currentEntry.key, {
      entry: currentEntry,
      pixels: pixels.slice(),
      traceOffsetX,
      traceOffsetY,
      selection: cloneSelection(selection),
      floatingLayer: cloneFloatingLayer(floatingLayer),
    });
  }

  function updateDirtyState() {
    if (!currentEntry || !cellLoaded) {
      dirtyIndicator.hidden = true;
      return;
    }
    const baseline = persistedArtwork.get(currentEntry.key);
    const dirty =
      Boolean(floatingLayer) || !baseline || !pixelsEqual(pixels, baseline);
    if (dirty) dirtyKeys.add(currentEntry.key);
    else dirtyKeys.delete(currentEntry.key);
    dirtyIndicator.hidden = !dirty;
  }

  function markAtlasClean(atlas) {
    for (const draft of artworkDrafts.values()) {
      if (draft.entry.atlas !== atlas || draft.floatingLayer) continue;
      persistedArtwork.set(draft.entry.key, draft.pixels.slice());
      dirtyKeys.delete(draft.entry.key);
    }
    updateDirtyState();
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

  function updatePreviewActionLabels() {
    for (const [button, key, fallback] of [
      [saveButton, "saveAtlas", "Save atlas"],
      [downloadButton, "downloadAtlas", "Download atlas"],
      [downloadEmojiButton, "downloadEmojiPng", "Download 12 by 12 emoji PNG"],
    ]) {
      const label = translate(key, fallback);
      button.setAttribute("aria-label", label);
      button.title = label;
    }
  }

  function warnAboutDirtyArtwork(event) {
    if (dirtyKeys.size === 0) return;
    event.preventDefault();
    event.returnValue = translate(
      "unsavedArtworkPrompt",
      "Save all unsaved pixel artwork before leaving.",
    );
  }
}

async function getNestedFileHandle(root, relativePath, create = false) {
  const parts = relativePath.split("/");
  const fileName = parts.pop();
  let directory = root;
  for (const part of parts) {
    directory = await directory.getDirectoryHandle(part, { create });
  }
  return directory.getFileHandle(fileName, { create });
}

async function createBlankAtlas(manifest, entry) {
  const canvas = document.createElement("canvas");
  canvas.width = entry.atlasWidth;
  canvas.height = entry.atlasHeight;
  const context = canvas.getContext("2d");
  const footerY = canvas.height - manifest.footerHeight;
  context.fillStyle = "#160622";
  context.fillRect(0, 0, canvas.width, manifest.headerHeight);
  context.fillRect(0, footerY, canvas.width, manifest.footerHeight);
  context.fillStyle = "#6de0ff";
  context.fillRect(0, manifest.headerHeight - 1, canvas.width, 1);
  context.fillRect(0, footerY, canvas.width, 1);
  const subGroupTitle =
    entry.partCount > 1
      ? `${entry.subGroup} ${entry.part}/${entry.partCount}`
      : entry.subGroup;
  drawBitmapText(context, 8, 4, manifest.setName, "#ffe28e");
  drawBitmapText(context, 8, 12, `GROUP: ${entry.group}`, "#f5f3f8");
  drawBitmapText(context, 8, 20, `SUBGROUP: ${subGroupTitle}`, "#f5f3f8");
  drawBitmapText(context, 8, 28, `CREATED: ${manifest.createdDate}`, "#99afba");
  drawBitmapText(
    context,
    8,
    footerY + 4,
    `AUTHOR: ${manifest.author}`,
    "#f5f3f8",
  );
  drawBitmapText(context, 8, footerY + 12, manifest.url, "#6de0ff");
  return canvasToPng(canvas);
}

async function extractCell(blob, entry) {
  const image = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  image.close();
  return context.getImageData(entry.x, entry.y, CELL_SIZE, CELL_SIZE).data;
}
