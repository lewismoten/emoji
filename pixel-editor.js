const CELL_SIZE = 12;
const DISPLAY_SIZE = 384;
const ROTATION_ALPHA_THRESHOLD = 128;
const TOOLS = [
  "pencil",
  "rectangle",
  "ellipse",
  "bucket",
  "eyedropper",
  "select",
];
const EGA_COLORS = [
  "#000000",
  "#0000aa",
  "#00aa00",
  "#00aaaa",
  "#aa0000",
  "#aa00aa",
  "#aa5500",
  "#aaaaaa",
  "#555555",
  "#5555ff",
  "#55ff55",
  "#55ffff",
  "#ff5555",
  "#ff55ff",
  "#ffff55",
  "#ffffff",
];
const SKIN_TONE_COLORS = [
  {
    codePoint: "1F3FB",
    color: "#f2d2b6",
    translationKey: "light",
    fallback: "Light skin tone",
  },
  {
    codePoint: "1F3FC",
    color: "#d5a078",
    translationKey: "mediumLight",
    fallback: "Medium-light skin tone",
  },
  {
    codePoint: "1F3FD",
    color: "#a66a45",
    translationKey: "medium",
    fallback: "Medium skin tone",
  },
  {
    codePoint: "1F3FE",
    color: "#70452f",
    translationKey: "mediumDark",
    fallback: "Medium-dark skin tone",
  },
  {
    codePoint: "1F3FF",
    color: "#3b271d",
    translationKey: "dark",
    fallback: "Dark skin tone",
  },
];
const BITMAP_FONT = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00100", "00100"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
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
  view.innerHTML = `
    <div class="pixel-editor-toolbar">
      <div class="pixel-editor-tools" role="toolbar" data-i18n-aria-label="drawingTools" aria-label="Drawing tools">
        ${toolButton("pencil", "✎", "pencil", "Pencil", true)}
        ${toolButton("rectangle", "□", "rectangle", "Rectangle")}
        ${toolButton("ellipse", "○", "ellipse", "Ellipse")}
        ${toolButton("bucket", "▰", "paintBucket", "Paint bucket")}
        ${toolButton("eyedropper", "⌞", "eyedropper", "Eyedropper")}
        ${toolButton("select", "⌗", "selectRegion", "Select")}
      </div>
      <div class="pixel-editor-history">
        <button class="pixel-editor-undo" type="button" disabled><span aria-hidden="true">↶</span> <span data-i18n="undo">Undo</span></button>
        <button class="pixel-editor-redo" type="button" disabled><span aria-hidden="true">↷</span> <span data-i18n="redo">Redo</span></button>
      </div>
    </div>
    <div class="pixel-editor-layout">
      <div class="pixel-editor-workspace">
        <div class="pixel-editor-stage">
          <canvas class="pixel-editor-canvas" width="${DISPLAY_SIZE}" height="${DISPLAY_SIZE}" tabindex="0" data-i18n-aria-label="pixelCanvas" aria-label="12 by 12 pixel drawing canvas"></canvas>
        </div>
        <div class="pixel-editor-previews" data-i18n-aria-label="pixelPreviews" aria-label="Emoji at actual 12 by 12 pixel size">
          ${preview("official", "officialEmoji", "Official")}
          ${preview("font", "customFontEmoji", "Custom font")}
          ${preview("artwork", "currentArtwork", "Current grid")}
          <span class="pixel-editor-dirty" hidden>
            <span aria-hidden="true"></span>
            <span data-i18n="unsavedArtwork">Unsaved</span>
          </span>
          <div class="pixel-editor-preview-actions">
            <button class="pixel-editor-save" type="button" data-i18n-aria-label="saveAtlas" aria-label="Save atlas" title="Save atlas"><span aria-hidden="true">💾</span></button>
            <button class="pixel-editor-download" type="button" data-i18n-aria-label="downloadAtlas" aria-label="Download atlas" title="Download atlas"><span aria-hidden="true">⇩▦</span></button>
            <button class="pixel-editor-download-emoji" type="button" data-i18n-aria-label="downloadEmojiPng" aria-label="Download 12 by 12 emoji PNG" title="Download 12 by 12 emoji PNG">
              <span class="pixel-editor-download-emoji-icon" aria-hidden="true">⇩<canvas class="pixel-editor-download-preview" width="${CELL_SIZE}" height="${CELL_SIZE}"></canvas></span>
            </button>
          </div>
        </div>
      </div>
      <div class="pixel-editor-controls">
        <fieldset class="pixel-editor-drawing">
          <legend data-i18n="drawingColor">Drawing color</legend>
          <div class="pixel-editor-palette" role="group" data-i18n-aria-label="egaPalette" aria-label="Classic EGA color palette">
            ${EGA_COLORS.map(egaSwatch).join("")}
            <button class="pixel-editor-swatch is-transparent" type="button" data-transparent="true" data-i18n-aria-label="transparentEraser" aria-label="Transparent eraser" title="Transparent"><span aria-hidden="true">╱</span></button>
            ${SKIN_TONE_COLORS.map(skinToneSwatch).join("")}
          </div>
        </fieldset>
        <fieldset class="pixel-editor-tracing">
          <legend data-i18n="tracing">Tracing</legend>
          <label class="pixel-editor-trace-opacity">
            <span class="pixel-editor-trace-opacity-heading">
              <span data-i18n="traceOpacity">Trace opacity</span>
              <output class="pixel-editor-trace-value" dir="auto">35%</output>
            </span>
            <input class="pixel-editor-trace-alpha" type="range" min="0" max="100" value="35">
          </label>
          <div class="pixel-editor-trace-position">
            <div role="group" data-i18n-aria-label="tracePosition" aria-label="Trace position">
              ${traceNudgeButton("left", -1, 0, "←", "nudgeTraceLeft", "Move trace left one pixel")}
              ${traceNudgeButton("up", 0, -1, "↑", "nudgeTraceUp", "Move trace up one pixel")}
              ${traceNudgeButton("down", 0, 1, "↓", "nudgeTraceDown", "Move trace down one pixel")}
              ${traceNudgeButton("right", 1, 0, "→", "nudgeTraceRight", "Move trace right one pixel")}
            </div>
          </div>
        </fieldset>
        <fieldset class="pixel-editor-transfer">
          <legend data-i18n="artworkTransfer">Artwork transfer</legend>
          <div>
            <button class="pixel-editor-copy-art" type="button">
              <span aria-hidden="true">▦</span>
              <span data-i18n="copyPixelArt">Copy art</span>
            </button>
            <button class="pixel-editor-copy-font" type="button">
              <span class="pixel-editor-transfer-icon" aria-hidden="true">🔠</span>
              <span data-i18n="copyFontGlyph">Copy font</span>
            </button>
            <button class="pixel-editor-copy-selection" type="button" disabled>
              <span aria-hidden="true">▤</span>
              <span data-i18n="copySelection">Copy selection</span>
            </button>
            <button class="pixel-editor-paste-art" type="button" disabled>
              <span aria-hidden="true">▣</span>
              <span data-i18n="pasteAsLayer">Paste layer</span>
            </button>
          </div>
        </fieldset>
        <fieldset class="pixel-editor-layer" hidden>
          <legend data-i18n="floatingLayer">Floating layer</legend>
          <div class="pixel-editor-layer-controls">
            <div class="pixel-editor-layer-position" role="group" data-i18n-aria-label="moveLayer" aria-label="Move floating layer">
              ${layerNudgeButton("left", -1, 0, "←", "moveLayerLeft", "Move layer left one pixel")}
              ${layerNudgeButton("up", 0, -1, "↑", "moveLayerUp", "Move layer up one pixel")}
              ${layerNudgeButton("down", 0, 1, "↓", "moveLayerDown", "Move layer down one pixel")}
              ${layerNudgeButton("right", 1, 0, "→", "moveLayerRight", "Move layer right one pixel")}
            </div>
            <div class="pixel-editor-layer-transform" role="toolbar" data-i18n-aria-label="transformLayer" aria-label="Transform floating layer">
              <button type="button" data-layer-transform="rotate-left" data-i18n-aria-label="rotateLayerLeft" aria-label="Rotate layer 45 degrees left"><span aria-hidden="true">↶</span></button>
              <button type="button" data-layer-transform="rotate-right" data-i18n-aria-label="rotateLayerRight" aria-label="Rotate layer 45 degrees right"><span aria-hidden="true">↷</span></button>
              <button type="button" data-layer-transform="flip-horizontal" data-i18n-aria-label="flipLayerHorizontal" aria-label="Flip layer horizontally"><span aria-hidden="true">↔</span></button>
              <button type="button" data-layer-transform="flip-vertical" data-i18n-aria-label="flipLayerVertical" aria-label="Flip layer vertically"><span aria-hidden="true">↕</span></button>
              <button class="pixel-editor-invert-layer" type="button" aria-pressed="false">
                <span aria-hidden="true">◐</span>
                <span data-i18n="invertLayer">Invert</span>
              </button>
            </div>
            <div class="pixel-editor-layer-actions">
              <button class="pixel-editor-bake-layer" type="button" data-i18n="bakeLayer">Bake</button>
              <button class="pixel-editor-cancel-layer" type="button" data-i18n="cancelLayer">Cancel</button>
            </div>
          </div>
        </fieldset>
        <div class="pixel-editor-file">
          <p class="pixel-editor-location"></p>
          <p class="pixel-editor-status" role="status" aria-live="polite"></p>
        </div>
      </div>
    </div>`;
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
  const saveButton = view.querySelector(".pixel-editor-save");
  const downloadButton = view.querySelector(".pixel-editor-download");
  const downloadEmojiButton = view.querySelector(
    ".pixel-editor-download-emoji",
  );
  const location = view.querySelector(".pixel-editor-location");
  const status = view.querySelector(".pixel-editor-status");
  const toolButtons = [...view.querySelectorAll("[data-tool]")];
  const paletteButtons = [...view.querySelectorAll(".pixel-editor-swatch")];
  const traceNudgeButtons = [
    ...view.querySelectorAll(".pixel-editor-trace-nudge"),
  ];
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
      updateSkinTonePalette();
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
  };

  function loadManifest() {
    manifestPromise ??= fetch("pixel-font/build/editor-manifest.json").then(
      (response) => {
        if (!response.ok)
          throw new Error("Pixel editor manifest is unavailable");
        return response.json();
      },
    );
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
        shape === "rectangle" ? (filled ? "■" : "□") : filled ? "●" : "○";
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
    const render = () => {
      previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
      drawCenteredEmoji(
        previewContext,
        currentEmoji,
        `${CELL_SIZE}px "Pixel Emoji"`,
      );
    };
    render();
    document.fonts
      ?.load(`${CELL_SIZE}px "Pixel Emoji"`, currentEmoji)
      .then(render);
  }

  function drawArtworkPreview() {
    const previewContexts = [
      artworkPreview.getContext("2d"),
      downloadPreview.getContext("2d"),
    ];
    previewContexts.forEach((previewContext) => {
      previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
      previewContext.putImageData(
        new ImageData(pixels.slice(), CELL_SIZE, CELL_SIZE),
        0,
        0,
      );
    });
    if (floatingLayer) {
      const layerCanvas = imageDataCanvas(
        effectiveLayerPixels(floatingLayer, activePaletteColors()),
        floatingLayer.width,
        floatingLayer.height,
      );
      previewContexts.forEach((previewContext) =>
        previewContext.drawImage(layerCanvas, floatingLayer.x, floatingLayer.y),
      );
    }
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
    const activeCodePoints = new Set(
      codePoints.map((codePoint) => codePoint.toUpperCase()),
    );
    const activeButtons = paletteButtons.filter((button) => {
      if (!button.dataset.skinTone) return false;
      button.hidden = !activeCodePoints.has(button.dataset.skinTone);
      button.style.removeProperty("grid-column");
      if (button.hidden) {
        setSkinToneShade(button, 0);
        if (selectedSkinTone === button.dataset.skinTone) {
          selectedSkinTone = "";
        }
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
      });
    }
    if (
      selectedColor !== "transparent" &&
      !activePaletteColors().includes(selectedColor)
    ) {
      selectedColor = "#ffff55";
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
    artworkClipboard = {
      kind: "art",
      pixels: pixels.slice(),
      width: CELL_SIZE,
      height: CELL_SIZE,
      x: 0,
      y: 0,
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
        `pixel-font/build/png/${currentEntry.key}.png`,
      );
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("image/png")
      ) {
        throw new Error("Compiled font glyph PNG is unavailable");
      }
      artworkClipboard = {
        kind: "font",
        pixels: await extractCell(await response.blob(), { x: 0, y: 0 }),
        width: CELL_SIZE,
        height: CELL_SIZE,
        x: 0,
        y: 0,
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

  function pastePixelArt() {
    if (
      !currentEntry ||
      !cellLoaded ||
      !artworkClipboard ||
      (tool === "select" && artworkClipboard.kind !== "selection")
    )
      return;
    floatingLayer = cloneFloatingLayer(artworkClipboard);
    floatingLayer.inverted = false;
    selection = undefined;
    draw();
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
      "Floating layer baked into the artwork.",
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
      Boolean(floatingLayer) ||
      (tool === "select" && artworkClipboard.kind !== "selection");
  }

  function updateEditorModePanels() {
    const layerMode = Boolean(floatingLayer);
    const selectionMode = tool === "select" && !layerMode;
    view.classList.toggle("is-layer-mode", layerMode);
    view.classList.toggle("is-selection-mode", selectionMode);
    toolsPanel.hidden = layerMode;
    historyPanel.hidden = layerMode || selectionMode;
    drawingPanel.hidden = layerMode || selectionMode;
    tracingPanel.hidden = layerMode || selectionMode;
    transferPanel.hidden = layerMode;
    layerPanel.hidden = !layerMode;
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

function drawBitmapText(context, x, y, value, color) {
  context.fillStyle = color;
  for (const [index, character] of [...value.toUpperCase()].entries()) {
    const glyph = BITMAP_FONT[character] ?? BITMAP_FONT["?"];
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((pixel, columnIndex) => {
        if (pixel === "1")
          context.fillRect(x + index * 8 + columnIndex + 1, y + rowIndex, 1, 1);
      });
    });
  }
}

function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("PNG encoding failed")),
      "image/png",
    );
  });
}

function downloadBlob(blob, fileName) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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

function drawCheckerboard(context, size) {
  const checker = size / 32;
  for (let y = 0; y < size / checker; y += 1) {
    for (let x = 0; x < size / checker; x += 1) {
      context.fillStyle = (x + y) % 2 === 0 ? "#f1f1f1" : "#bdbdbd";
      context.fillRect(x * checker, y * checker, checker, checker);
    }
  }
}

function drawCenteredEmoji(
  context,
  value,
  font,
  horizontalOffset = 0,
  verticalOffset = 0,
) {
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  const metrics = context.measureText(value);
  const ascent = metrics.actualBoundingBoxAscent || CELL_SIZE * 0.8;
  const descent = metrics.actualBoundingBoxDescent || CELL_SIZE * 0.2;
  const baseline = (CELL_SIZE - ascent - descent) / 2 + ascent;
  context.fillText(
    value,
    CELL_SIZE / 2 + horizontalOffset,
    baseline + verticalOffset,
  );
}

function toolButton(tool, icon, translationKey, fallback, selected = false) {
  return `<button type="button" data-tool="${tool}" data-i18n-aria-label="${translationKey}" aria-label="${fallback}" aria-pressed="${selected}" class="${selected ? "is-active" : ""}"><span aria-hidden="true">${icon}</span><span data-i18n="${translationKey}">${fallback}</span></button>`;
}

function traceNudgeButton(
  direction,
  horizontal,
  vertical,
  icon,
  translationKey,
  fallback,
) {
  return `<button class="pixel-editor-trace-nudge" type="button" data-trace-direction="${direction}" data-trace-x="${horizontal}" data-trace-y="${vertical}" data-i18n-aria-label="${translationKey}" aria-label="${fallback}" title="${fallback}"><span aria-hidden="true">${icon}</span></button>`;
}

function layerNudgeButton(
  direction,
  horizontal,
  vertical,
  icon,
  translationKey,
  fallback,
) {
  return `<button class="pixel-editor-layer-nudge" type="button" data-layer-direction="${direction}" data-layer-x="${horizontal}" data-layer-y="${vertical}" data-i18n-aria-label="${translationKey}" aria-label="${fallback}" title="${fallback}"><span aria-hidden="true">${icon}</span></button>`;
}

function preview(kind, translationKey, fallback) {
  return `<figure data-i18n-aria-label="${translationKey}" aria-label="${fallback}">
    <canvas class="pixel-editor-preview-${kind}" width="${CELL_SIZE}" height="${CELL_SIZE}"></canvas>
  </figure>`;
}

function egaSwatch(color) {
  return `<button class="pixel-editor-swatch" type="button" data-color="${color}" aria-label="EGA ${color}" title="EGA ${color}" aria-pressed="false" style="--swatch: ${color}"></button>`;
}

function skinToneSwatch(tone) {
  return `<button class="pixel-editor-swatch is-skin-tone" type="button" data-color="${tone.color}" data-skin-tone="${tone.codePoint}" data-cycle-index="0" data-shade="normal" aria-label="${tone.fallback} — Normal color" title="${tone.fallback} — Normal color" aria-pressed="false" style="--swatch: ${tone.color}" hidden></button>`;
}

function findSkinTone(codePoint) {
  return SKIN_TONE_COLORS.find((tone) => tone.codePoint === codePoint);
}

function skinToneCycle(codePoint) {
  const index = SKIN_TONE_COLORS.findIndex(
    (tone) => tone.codePoint === codePoint,
  );
  if (index < 0) return [];
  return [
    { kind: "normal", color: SKIN_TONE_COLORS[index].color },
    index > 0
      ? { kind: "lighter", color: SKIN_TONE_COLORS[index - 1].color }
      : undefined,
    index < SKIN_TONE_COLORS.length - 1
      ? { kind: "darker", color: SKIN_TONE_COLORS[index + 1].color }
      : undefined,
  ].filter(Boolean);
}

function pixelOffset(x, y) {
  return (y * CELL_SIZE + x) * 4;
}

function boundsFromPoints(start, end) {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  return {
    x,
    y,
    width: Math.abs(start.x - end.x) + 1,
    height: Math.abs(start.y - end.y) + 1,
  };
}

function extractPixels(source, sourceWidth, x, y, width, height) {
  const result = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row += 1) {
    const sourceStart = ((y + row) * sourceWidth + x) * 4;
    result.set(
      source.slice(sourceStart, sourceStart + width * 4),
      row * width * 4,
    );
  }
  return result;
}

function nextLayerRotation(layer, clockwise, paletteColors = EGA_COLORS) {
  const rotationSource = layer.rotationSource ?? {
    pixels: layer.pixels.slice(),
    width: layer.width,
    height: layer.height,
  };
  const rotationDegrees =
    ((layer.rotationDegrees ?? 0) + (clockwise ? 45 : -45) + 360) % 360;
  return {
    ...rotatePixels(rotationSource, rotationDegrees, paletteColors),
    rotationSource,
    rotationDegrees,
  };
}

function resetLayerRotation(layer) {
  delete layer.rotationSource;
  delete layer.rotationDegrees;
}

function rotatePixels(layer, degrees, paletteColors = EGA_COLORS) {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const width = Math.ceil(
    Math.abs(layer.width * cosine) + Math.abs(layer.height * sine) - 1e-10,
  );
  const height = Math.ceil(
    Math.abs(layer.width * sine) + Math.abs(layer.height * cosine) - 1e-10,
  );
  const sourceCanvas = imageDataCanvas(layer.pixels, layer.width, layer.height);
  const rotatedCanvas = document.createElement("canvas");
  rotatedCanvas.width = width;
  rotatedCanvas.height = height;
  const rotatedContext = rotatedCanvas.getContext("2d");
  rotatedContext.imageSmoothingEnabled = true;
  rotatedContext.imageSmoothingQuality = "high";
  rotatedContext.translate(width / 2, height / 2);
  rotatedContext.rotate(radians);
  rotatedContext.drawImage(sourceCanvas, -layer.width / 2, -layer.height / 2);
  const interpolated = rotatedContext.getImageData(0, 0, width, height).data;
  return {
    pixels: quantizeToPalette(interpolated, paletteColors),
    width,
    height,
  };
}

function quantizeToPalette(source, paletteColors = EGA_COLORS) {
  const result = new Uint8ClampedArray(source.length);
  for (let offset = 0; offset < source.length; offset += 4) {
    if (source[offset + 3] < ROTATION_ALPHA_THRESHOLD) continue;
    const color = nearestPaletteColor(
      source[offset],
      source[offset + 1],
      source[offset + 2],
      paletteColors,
    ).slice(1);
    result[offset] = Number.parseInt(color.slice(0, 2), 16);
    result[offset + 1] = Number.parseInt(color.slice(2, 4), 16);
    result[offset + 2] = Number.parseInt(color.slice(4, 6), 16);
    result[offset + 3] = 255;
  }
  return result;
}

function layerTransformChangesPixels(layer, transformed) {
  return (
    layer.width !== transformed.width ||
    layer.height !== transformed.height ||
    !pixelsEqual(layer.pixels, transformed.pixels)
  );
}

function layerAxisBounds(size) {
  return size <= CELL_SIZE ? [0, CELL_SIZE - size] : [CELL_SIZE - size, 0];
}

function layerPositionAllowed(layer, x, y) {
  const [minimumX, maximumX] = layerAxisBounds(layer.width);
  const [minimumY, maximumY] = layerAxisBounds(layer.height);
  return x >= minimumX && x <= maximumX && y >= minimumY && y <= maximumY;
}

function pixelsEqual(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function flipPixels(layer, horizontal) {
  const result = new Uint8ClampedArray(layer.pixels.length);
  for (let y = 0; y < layer.height; y += 1) {
    for (let x = 0; x < layer.width; x += 1) {
      const targetX = horizontal ? layer.width - 1 - x : x;
      const targetY = horizontal ? y : layer.height - 1 - y;
      const sourceOffset = (y * layer.width + x) * 4;
      result.set(
        layer.pixels.slice(sourceOffset, sourceOffset + 4),
        (targetY * layer.width + targetX) * 4,
      );
    }
  }
  return result;
}

function compositeLayer(target, layer) {
  for (let y = 0; y < layer.height; y += 1) {
    for (let x = 0; x < layer.width; x += 1) {
      const targetX = layer.x + x;
      const targetY = layer.y + y;
      if (
        targetX < 0 ||
        targetX >= CELL_SIZE ||
        targetY < 0 ||
        targetY >= CELL_SIZE
      )
        continue;
      const sourceOffset = (y * layer.width + x) * 4;
      if (layer.pixels[sourceOffset + 3] === 0) continue;
      target.set(
        layer.pixels.slice(sourceOffset, sourceOffset + 4),
        pixelOffset(targetX, targetY),
      );
    }
  }
}

function cloneSelection(value) {
  return value ? { ...value } : undefined;
}

function cloneFloatingLayer(value) {
  return value
    ? {
        ...value,
        pixels: value.pixels.slice(),
        rotationSource: value.rotationSource
          ? {
              ...value.rotationSource,
              pixels: value.rotationSource.pixels.slice(),
            }
          : undefined,
      }
    : undefined;
}

function hasVisiblePixels(value) {
  return value.some((channel, index) => index % 4 === 3 && channel > 0);
}

function effectiveLayerPixels(layer, paletteColors = EGA_COLORS) {
  if (!layer.inverted) return layer.pixels;
  const result = new Uint8ClampedArray(layer.pixels.length);
  for (let offset = 0; offset < layer.pixels.length; offset += 4) {
    const alpha = layer.pixels[offset + 3];
    if (alpha === 0) continue;
    const paletteColor = nearestPaletteColor(
      255 - layer.pixels[offset],
      255 - layer.pixels[offset + 1],
      255 - layer.pixels[offset + 2],
      paletteColors,
    );
    const value = paletteColor.slice(1);
    result[offset] = Number.parseInt(value.slice(0, 2), 16);
    result[offset + 1] = Number.parseInt(value.slice(2, 4), 16);
    result[offset + 2] = Number.parseInt(value.slice(4, 6), 16);
    result[offset + 3] = alpha;
  }
  return result;
}

function imageDataCanvas(pixels, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas
    .getContext("2d")
    .putImageData(new ImageData(pixels.slice(), width, height), 0, 0);
  return canvas;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function nearestPaletteColor(red, green, blue, colors = EGA_COLORS) {
  return colors.reduce(
    (nearest, color) => {
      const value = color.slice(1);
      const colorRed = Number.parseInt(value.slice(0, 2), 16);
      const colorGreen = Number.parseInt(value.slice(2, 4), 16);
      const colorBlue = Number.parseInt(value.slice(4, 6), 16);
      const distance =
        (red - colorRed) ** 2 +
        (green - colorGreen) ** 2 +
        (blue - colorBlue) ** 2;
      return distance < nearest.distance ? { color, distance } : nearest;
    },
    { color: colors[0] ?? EGA_COLORS[0], distance: Number.POSITIVE_INFINITY },
  ).color;
}
