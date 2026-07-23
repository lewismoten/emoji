const CELL_SIZE = 12;
const DISPLAY_SIZE = 384;
const TOOLS = ["pencil", "rectangle", "ellipse", "bucket", "eyedropper"];
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
  setDialogMode,
}) {
  const view = document.createElement("section");
  view.className = "pixel-editor-view";
  view.hidden = true;
  view.innerHTML = `
    <div class="pixel-editor-toolbar">
      <button class="pixel-editor-back" type="button" data-i18n="backToEmoji">Back to emoji</button>
      <div class="pixel-editor-tools" role="toolbar" data-i18n-aria-label="drawingTools" aria-label="Drawing tools">
        ${toolButton("pencil", "✎", "pencil", "Pencil", true)}
        ${toolButton("rectangle", "□", "rectangle", "Rectangle")}
        ${toolButton("ellipse", "○", "ellipse", "Ellipse")}
        ${toolButton("bucket", "▰", "paintBucket", "Paint bucket")}
        ${toolButton("eyedropper", "⌞", "eyedropper", "Eyedropper")}
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
        </div>
      </div>
      <div class="pixel-editor-controls">
        <fieldset>
          <legend data-i18n="drawingColor">Drawing color</legend>
          <div class="pixel-editor-palette" role="group" data-i18n-aria-label="egaPalette" aria-label="Classic EGA color palette">
            ${EGA_COLORS.map(egaSwatch).join("")}
            <button class="pixel-editor-swatch is-transparent" type="button" data-transparent="true" data-i18n-aria-label="transparentEraser" aria-label="Transparent eraser" title="Transparent"><span aria-hidden="true">╱</span></button>
          </div>
          <label><input class="pixel-editor-fill-shapes" type="checkbox"> <span data-i18n="fillShapeInteriors">Fill rectangle and ellipse interiors</span></label>
        </fieldset>
        <fieldset>
          <legend data-i18n="tracing">Tracing</legend>
          <label class="pixel-editor-trace-opacity">
            <span class="pixel-editor-trace-opacity-heading">
              <span data-i18n="traceOpacity">Trace opacity</span>
              <output class="pixel-editor-trace-value" dir="auto">35%</output>
            </span>
            <input class="pixel-editor-trace-alpha" type="range" min="0" max="100" value="35">
          </label>
          <div class="pixel-editor-trace-position">
            <span data-i18n="tracePosition">Position</span>
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
            <button class="pixel-editor-paste-art" type="button" disabled>
              <span aria-hidden="true">▣</span>
              <span data-i18n="pastePixelArt">Paste</span>
            </button>
          </div>
        </fieldset>
        <div class="pixel-editor-file">
          <p class="pixel-editor-location"></p>
          <div>
            <button class="pixel-editor-save" type="button" data-i18n="saveAtlas">Save atlas</button>
            <button class="pixel-editor-download" type="button" data-i18n="downloadAtlas">Download atlas</button>
          </div>
          <p class="pixel-editor-status" role="status" aria-live="polite"></p>
        </div>
      </div>
    </div>`;
  dialog.append(view);

  const canvas = view.querySelector(".pixel-editor-canvas");
  const context = canvas.getContext("2d", { alpha: true });
  const fillShapes = view.querySelector(".pixel-editor-fill-shapes");
  const traceAlpha = view.querySelector(".pixel-editor-trace-alpha");
  const traceOutput = view.querySelector(".pixel-editor-trace-value");
  const officialPreview = view.querySelector(".pixel-editor-preview-official");
  const fontPreview = view.querySelector(".pixel-editor-preview-font");
  const artworkPreview = view.querySelector(".pixel-editor-preview-artwork");
  const undoButton = view.querySelector(".pixel-editor-undo");
  const redoButton = view.querySelector(".pixel-editor-redo");
  const copyArtButton = view.querySelector(".pixel-editor-copy-art");
  const copyFontButton = view.querySelector(".pixel-editor-copy-font");
  const pasteArtButton = view.querySelector(".pixel-editor-paste-art");
  const saveButton = view.querySelector(".pixel-editor-save");
  const downloadButton = view.querySelector(".pixel-editor-download");
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
  let copiedPixels;
  let traceOffsetX = 0;
  let traceOffsetY = 0;
  let tool = "pencil";
  let pointerStart;
  let pointerPrevious;
  let shapeBase;
  let directoryHandle;
  let loadId = 0;
  let undoStack = [];
  let redoStack = [];

  view
    .querySelector(".pixel-editor-back")
    .addEventListener("click", () => setDialogMode("details"));
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
  fillShapes.addEventListener("change", draw);
  paletteButtons.forEach((button) =>
    button.addEventListener("click", () => selectPaletteColor(button)),
  );
  undoButton.addEventListener("click", undo);
  redoButton.addEventListener("click", redo);
  copyArtButton.addEventListener("click", copyPixelArt);
  copyFontButton.addEventListener("click", copyFontGlyph);
  pasteArtButton.addEventListener("click", pastePixelArt);
  saveButton.addEventListener("click", saveAtlas);
  downloadButton.addEventListener("click", downloadAtlas);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  updatePaletteSelection();
  updateTraceOutput();
  draw();

  return {
    element: view,
    async open(key, emoji) {
      const requestedLoadId = ++loadId;
      currentEmoji = emoji;
      traceOffsetX = 0;
      traceOffsetY = 0;
      currentEntry = undefined;
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
        pixels = loadedPixels;
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
    if (!TOOLS.includes(nextTool)) return;
    tool = nextTool;
    toolButtons.forEach((button) => {
      const selected = button.dataset.tool === tool;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("is-active", selected);
    });
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
    traceContext.font =
      '11px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    traceContext.textAlign = "center";
    traceContext.textBaseline = "middle";
    traceContext.fillText(
      currentEmoji,
      CELL_SIZE / 2 + traceOffsetX,
      CELL_SIZE / 2 + 2 + traceOffsetY,
    );
    drawOfficialPreview();
    drawFontPreview();
  }

  function draw() {
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
    drawArtworkPreview();
    updateFileButtons();
    updateTransferButtons();
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
      previewContext.font = `${CELL_SIZE}px "Pixel Emoji"`;
      previewContext.textAlign = "center";
      previewContext.textBaseline = "alphabetic";
      previewContext.fillText(currentEmoji, CELL_SIZE / 2, CELL_SIZE - 1);
    };
    render();
    document.fonts
      ?.load(`${CELL_SIZE}px "Pixel Emoji"`, currentEmoji)
      .then(render);
  }

  function drawArtworkPreview() {
    const previewContext = artworkPreview.getContext("2d");
    previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    previewContext.putImageData(
      new ImageData(pixels.slice(), CELL_SIZE, CELL_SIZE),
      0,
      0,
    );
  }

  function onPointerDown(event) {
    if (!currentEntry || !cellLoaded || event.button !== 0) return;
    const point = pointerCell(event);
    canvas.setPointerCapture(event.pointerId);
    pointerStart = point;
    pointerPrevious = point;
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
    if (!pointerStart || !canvas.hasPointerCapture(event.pointerId)) return;
    const point = pointerCell(event);
    if (tool === "pencil") {
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
  }

  function onPointerCancel(event) {
    if (shapeBase) pixels.set(shapeBase);
    onPointerUp(event);
    draw();
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
            fillShapes.checked ||
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
        if (outer && (fillShapes.checked || !inner)) paintPixel({ x, y });
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
      alpha === 0 ? "transparent" : nearestEgaColor(red, green, blue);
    updatePaletteSelection();
  }

  function selectPaletteColor(button) {
    selectedColor =
      button.dataset.transparent === "true"
        ? "transparent"
        : button.dataset.color;
    updatePaletteSelection();
  }

  function updatePaletteSelection() {
    paletteButtons.forEach((button) => {
      const selected =
        button.dataset.transparent === "true"
          ? selectedColor === "transparent"
          : button.dataset.color === selectedColor;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
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
    undoButton.disabled = undoStack.length === 0;
    redoButton.disabled = redoStack.length === 0;
  }

  function copyPixelArt() {
    if (!currentEntry || !cellLoaded || !hasVisibleArtwork()) return;
    copiedPixels = pixels.slice();
    updateTransferButtons();
    status.textContent = translate("pixelArtCopied", "Pixel art copied.");
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
      copiedPixels = await extractCell(await response.blob(), {
        x: 0,
        y: 0,
      });
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
    if (!currentEntry || !cellLoaded || !copiedPixels) return;
    pushHistory();
    pixels = copiedPixels.slice();
    draw();
    status.textContent = translate(
      "pixelArtPasted",
      "Pixel art pasted into this emoji.",
    );
  }

  function updateTransferButtons() {
    copyArtButton.disabled =
      !currentEntry || !cellLoaded || !hasVisibleArtwork();
    copyFontButton.disabled = !currentEntry?.painted || !cellLoaded;
    pasteArtButton.disabled = !currentEntry || !cellLoaded || !copiedPixels;
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
    updateFileButtons();
    const link = document.createElement("a");
    const url = URL.createObjectURL(updatedBlob);
    link.href = url;
    link.download = currentEntry.atlas.split("/").at(-1);
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = translate(
      "atlasDownloaded",
      "Updated atlas PNG downloaded.",
    );
  }

  async function renderUpdatedAtlas(source) {
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
    atlasContext.putImageData(
      new ImageData(pixels.slice(), CELL_SIZE, CELL_SIZE),
      currentEntry.x,
      currentEntry.y,
    );
    return new Promise((resolve, reject) => {
      atlasCanvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("PNG encoding failed")),
        "image/png",
      );
    });
  }

  function updateFileButtons() {
    const canWrite =
      Boolean(currentEntry && atlasBlob) &&
      (atlasExists || hasVisibleArtwork());
    saveButton.disabled = !canWrite;
    downloadButton.disabled = !canWrite;
  }

  function hasVisibleArtwork() {
    return pixels.some((value, index) => index % 4 === 3 && value > 0);
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

function preview(kind, translationKey, fallback) {
  return `<figure data-i18n-aria-label="${translationKey}" aria-label="${fallback}">
    <canvas class="pixel-editor-preview-${kind}" width="${CELL_SIZE}" height="${CELL_SIZE}"></canvas>
  </figure>`;
}

function egaSwatch(color) {
  return `<button class="pixel-editor-swatch" type="button" data-color="${color}" aria-label="EGA ${color}" title="EGA ${color}" aria-pressed="false" style="--swatch: ${color}"></button>`;
}

function pixelOffset(x, y) {
  return (y * CELL_SIZE + x) * 4;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function nearestEgaColor(red, green, blue) {
  return EGA_COLORS.reduce(
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
    { color: EGA_COLORS[0], distance: Number.POSITIVE_INFINITY },
  ).color;
}
