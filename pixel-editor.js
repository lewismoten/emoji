const CELL_SIZE = 16;
const DISPLAY_SIZE = 512;
const TOOLS = ['pencil', 'rectangle', 'ellipse', 'bucket', 'eyedropper'];

export function createPixelEditor({ dialog, translate, setDialogMode }) {
  const view = document.createElement('section');
  view.className = 'pixel-editor-view';
  view.hidden = true;
  view.innerHTML = `
    <div class="pixel-editor-toolbar">
      <button class="pixel-editor-back" type="button" data-i18n="backToEmoji">Back to emoji</button>
      <div class="pixel-editor-tools" role="toolbar" data-i18n-aria-label="drawingTools" aria-label="Drawing tools">
        ${toolButton('pencil', '✎', 'pencil', 'Pencil', true)}
        ${toolButton('rectangle', '□', 'rectangle', 'Rectangle')}
        ${toolButton('ellipse', '○', 'ellipse', 'Ellipse')}
        ${toolButton('bucket', '▰', 'paintBucket', 'Paint bucket')}
        ${toolButton('eyedropper', '⌞', 'eyedropper', 'Eyedropper')}
      </div>
      <div class="pixel-editor-history">
        <button class="pixel-editor-undo" type="button" data-i18n-aria-label="undo" aria-label="Undo" disabled>↶</button>
        <button class="pixel-editor-redo" type="button" data-i18n-aria-label="redo" aria-label="Redo" disabled>↷</button>
      </div>
    </div>
    <div class="pixel-editor-layout">
      <div class="pixel-editor-stage">
        <canvas class="pixel-editor-canvas" width="${DISPLAY_SIZE}" height="${DISPLAY_SIZE}" tabindex="0" data-i18n-aria-label="pixelCanvas" aria-label="16 by 16 pixel drawing canvas"></canvas>
      </div>
      <div class="pixel-editor-controls">
        <div class="pixel-editor-previews" data-i18n-aria-label="pixelPreviews" aria-label="Emoji at actual 16 by 16 pixel size">
          ${preview('official', 'officialEmoji', 'Official')}
          ${preview('font', 'customFontEmoji', 'Custom font')}
          ${preview('artwork', 'currentArtwork', 'Current grid')}
        </div>
        <fieldset>
          <legend data-i18n="drawingColor">Drawing color</legend>
          <label class="pixel-color-control">
            <span data-i18n="color">Color</span>
            <input class="pixel-editor-color" type="color" value="#fffa00">
          </label>
          <label>
            <span data-i18n="opacity">Opacity</span>
            <input class="pixel-editor-alpha" type="range" min="0" max="255" value="255">
            <output class="pixel-editor-alpha-value">100%</output>
          </label>
          <label><input class="pixel-editor-fill-shapes" type="checkbox"> <span data-i18n="fillShapes">Fill shapes</span></label>
        </fieldset>
        <fieldset>
          <legend data-i18n="tracing">Tracing</legend>
          <label><input class="pixel-editor-trace" type="checkbox" checked> <span data-i18n="traceEmoji">Trace native emoji</span></label>
          <label>
            <span data-i18n="traceOpacity">Trace opacity</span>
            <input class="pixel-editor-trace-alpha" type="range" min="0" max="100" value="35">
            <output class="pixel-editor-trace-value">35%</output>
          </label>
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

  const canvas = view.querySelector('.pixel-editor-canvas');
  const context = canvas.getContext('2d', { alpha: true });
  const colorInput = view.querySelector('.pixel-editor-color');
  const alphaInput = view.querySelector('.pixel-editor-alpha');
  const alphaOutput = view.querySelector('.pixel-editor-alpha-value');
  const fillShapes = view.querySelector('.pixel-editor-fill-shapes');
  const traceInput = view.querySelector('.pixel-editor-trace');
  const traceAlpha = view.querySelector('.pixel-editor-trace-alpha');
  const traceOutput = view.querySelector('.pixel-editor-trace-value');
  const officialPreview = view.querySelector('.pixel-editor-preview-official');
  const fontPreview = view.querySelector('.pixel-editor-preview-font');
  const artworkPreview = view.querySelector('.pixel-editor-preview-artwork');
  const undoButton = view.querySelector('.pixel-editor-undo');
  const redoButton = view.querySelector('.pixel-editor-redo');
  const saveButton = view.querySelector('.pixel-editor-save');
  const downloadButton = view.querySelector('.pixel-editor-download');
  const location = view.querySelector('.pixel-editor-location');
  const status = view.querySelector('.pixel-editor-status');
  const toolButtons = [...view.querySelectorAll('[data-tool]')];
  const traceCanvas = document.createElement('canvas');
  traceCanvas.width = CELL_SIZE;
  traceCanvas.height = CELL_SIZE;

  let manifestPromise;
  let currentEntry;
  let currentEmoji = '';
  let atlasBlob;
  let pixels = new Uint8ClampedArray(CELL_SIZE * CELL_SIZE * 4);
  let tool = 'pencil';
  let pointerStart;
  let pointerPrevious;
  let shapeBase;
  let directoryHandle;
  let loadId = 0;
  let undoStack = [];
  let redoStack = [];

  view.querySelector('.pixel-editor-back').addEventListener('click', () => setDialogMode('details'));
  toolButtons.forEach(button => button.addEventListener('click', () => selectTool(button.dataset.tool)));
  alphaInput.addEventListener('input', updateAlphaOutput);
  traceAlpha.addEventListener('input', () => {
    traceOutput.value = `${traceAlpha.value}%`;
    draw();
  });
  traceInput.addEventListener('change', draw);
  fillShapes.addEventListener('change', draw);
  undoButton.addEventListener('click', undo);
  redoButton.addEventListener('click', redo);
  saveButton.addEventListener('click', saveAtlas);
  downloadButton.addEventListener('click', downloadAtlas);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);
  updateAlphaOutput();
  draw();

  return {
    element: view,
    async open(key, emoji) {
      const requestedLoadId = ++loadId;
      currentEmoji = emoji;
      status.textContent = translate('pixelEditorLoading', 'Loading pixel cell…');
      saveButton.disabled = true;
      downloadButton.disabled = true;
      try {
        const manifest = await loadManifest();
        if (requestedLoadId !== loadId) return;
        const entry = manifest.glyphs[key];
        currentEntry = entry;
        if (!entry) {
          location.textContent = '';
          status.textContent = translate(
            'pixelEditorUnavailable',
            'This modified emoji is not part of the base atlas set.'
          );
          pixels.fill(0);
          renderTrace();
          draw();
          return;
        }
        const loadedAtlasBlob = await fetch(`pixel-font/atlases/${entry.atlas}`)
          .then(response => {
            if (!response.ok) throw new Error(`Unable to load ${entry.atlas}`);
            return response.blob();
          });
        if (requestedLoadId !== loadId) return;
        const loadedPixels = await extractCell(loadedAtlasBlob, entry);
        if (requestedLoadId !== loadId) return;
        atlasBlob = loadedAtlasBlob;
        pixels = loadedPixels;
        undoStack = [];
        redoStack = [];
        location.textContent = `${currentEntry.atlas} · ${translate('row', 'row')} ${currentEntry.row + 1} · ${translate('column', 'column')} ${currentEntry.column + 1}`;
        status.textContent = '';
        saveButton.disabled = false;
        downloadButton.disabled = false;
        renderTrace();
        updateHistoryButtons();
        draw();
      } catch (error) {
        if (requestedLoadId !== loadId) return;
        console.warn('Pixel editor unavailable', error);
        status.textContent = translate('pixelEditorLoadFailed', 'The pixel atlas could not be loaded.');
      }
    },
    refreshTranslations() {
      if (currentEntry) {
        location.textContent = `${currentEntry.atlas} · ${translate('row', 'row')} ${currentEntry.row + 1} · ${translate('column', 'column')} ${currentEntry.column + 1}`;
      }
    }
  };

  function loadManifest() {
    manifestPromise ??= fetch('pixel-font/build/editor-manifest.json').then(response => {
      if (!response.ok) throw new Error('Pixel editor manifest is unavailable');
      return response.json();
    });
    return manifestPromise;
  }

  function selectTool(nextTool) {
    if (!TOOLS.includes(nextTool)) return;
    tool = nextTool;
    toolButtons.forEach(button => {
      const selected = button.dataset.tool === tool;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-active', selected);
    });
  }

  function updateAlphaOutput() {
    alphaOutput.value = `${Math.round(Number(alphaInput.value) / 255 * 100)}%`;
  }

  function renderTrace() {
    const traceContext = traceCanvas.getContext('2d');
    traceContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    traceContext.font =
      '14px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    traceContext.textAlign = 'center';
    traceContext.textBaseline = 'middle';
    traceContext.fillText(currentEmoji, CELL_SIZE / 2, CELL_SIZE / 2 + 2.5);
    drawOfficialPreview();
    drawFontPreview();
  }

  function draw() {
    const displayCell = DISPLAY_SIZE / CELL_SIZE;
    context.clearRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
    drawCheckerboard(context, DISPLAY_SIZE);
    if (traceInput.checked && currentEmoji) {
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
        context.fillStyle =
          `rgba(${pixels[offset]}, ${pixels[offset + 1]}, ${pixels[offset + 2]}, ${alpha / 255})`;
        context.fillRect(x * displayCell, y * displayCell, displayCell, displayCell);
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
    context.strokeStyle = 'rgb(255 255 255 / 24%)';
    context.lineWidth = 1;
    context.stroke();
    drawArtworkPreview();
  }

  function drawOfficialPreview() {
    const previewContext = officialPreview.getContext('2d');
    previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    previewContext.drawImage(traceCanvas, 0, 0);
  }

  function drawFontPreview() {
    const previewContext = fontPreview.getContext('2d');
    previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    if (!currentEntry?.painted) return;
    const render = () => {
      previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
      previewContext.font = '16px "Pixel Emoji"';
      previewContext.textAlign = 'center';
      previewContext.textBaseline = 'alphabetic';
      previewContext.fillText(currentEmoji, CELL_SIZE / 2, 14);
    };
    render();
    document.fonts?.load('16px "Pixel Emoji"', currentEmoji).then(render);
  }

  function drawArtworkPreview() {
    const previewContext = artworkPreview.getContext('2d');
    previewContext.clearRect(0, 0, CELL_SIZE, CELL_SIZE);
    previewContext.putImageData(new ImageData(pixels.slice(), CELL_SIZE, CELL_SIZE), 0, 0);
  }

  function onPointerDown(event) {
    if (!currentEntry || event.button !== 0) return;
    const point = pointerCell(event);
    canvas.setPointerCapture(event.pointerId);
    pointerStart = point;
    pointerPrevious = point;
    if (tool === 'eyedropper') {
      pickColor(point);
      return;
    }
    pushHistory();
    if (tool === 'bucket') {
      floodFill(point);
      pointerStart = undefined;
      draw();
      return;
    }
    shapeBase = pixels.slice();
    if (tool === 'pencil') paintPixel(point);
    if (tool === 'rectangle' || tool === 'ellipse') drawShape(point, point, tool);
    draw();
  }

  function onPointerMove(event) {
    if (!pointerStart || !canvas.hasPointerCapture(event.pointerId)) return;
    const point = pointerCell(event);
    if (tool === 'pencil') {
      drawLine(pointerPrevious, point);
      pointerPrevious = point;
    } else if (tool === 'rectangle' || tool === 'ellipse') {
      pixels.set(shapeBase);
      drawShape(pointerStart, point, tool);
    }
    draw();
  }

  function onPointerUp(event) {
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
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
      x: clamp(Math.floor((event.clientX - bounds.left) / bounds.width * CELL_SIZE), 0, 15),
      y: clamp(Math.floor((event.clientY - bounds.top) / bounds.height * CELL_SIZE), 0, 15)
    };
  }

  function currentColor() {
    const value = colorInput.value.slice(1);
    return [
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
      Number(alphaInput.value)
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
    if (shape === 'rectangle') {
      for (let y = top; y <= bottom; y += 1) {
        for (let x = left; x <= right; x += 1) {
          if (fillShapes.checked || x === left || x === right || y === top || y === bottom) {
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
          ((x + 0.5 - centerX) / radiusX) ** 2
          + ((y + 0.5 - centerY) / radiusY) ** 2 <= 1;
        const innerRadiusX = radiusX - 1;
        const innerRadiusY = radiusY - 1;
        const inner = innerRadiusX > 0 && innerRadiusY > 0
          && ((x + 0.5 - centerX) / innerRadiusX) ** 2
            + ((y + 0.5 - centerY) / innerRadiusY) ** 2 <= 1;
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
      if (!target.every((value, index) => pixels[pointOffset + index] === value)) continue;
      pixels.set(replacement, pointOffset);
      if (point.x > 0) queue.push({ x: point.x - 1, y: point.y });
      if (point.x < 15) queue.push({ x: point.x + 1, y: point.y });
      if (point.y > 0) queue.push({ x: point.x, y: point.y - 1 });
      if (point.y < 15) queue.push({ x: point.x, y: point.y + 1 });
    }
  }

  function pickColor(point) {
    const offset = pixelOffset(point.x, point.y);
    let [red, green, blue, alpha] = pixels.slice(offset, offset + 4);
    if (alpha === 0 && traceInput.checked) {
      [red, green, blue, alpha] = traceCanvas
        .getContext('2d')
        .getImageData(point.x, point.y, 1, 1)
        .data;
    }
    colorInput.value = `#${hex(red)}${hex(green)}${hex(blue)}`;
    alphaInput.value = String(alpha);
    updateAlphaOutput();
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

  async function saveAtlas() {
    if (!currentEntry) return;
    if (!window.showDirectoryPicker) {
      status.textContent = translate(
        'directoryAccessUnavailable',
        'Direct folder access is unavailable; downloading the atlas instead.'
      );
      await downloadAtlas();
      return;
    }
    try {
      directoryHandle ??= await window.showDirectoryPicker({
        id: 'pixel-emoji-atlases',
        mode: 'readwrite',
        startIn: 'documents'
      });
      const fileHandle = await directoryHandle.getFileHandle(currentEntry.atlas);
      const sourceFile = await fileHandle.getFile();
      const updatedBlob = await renderUpdatedAtlas(sourceFile);
      const writable = await fileHandle.createWritable();
      await writable.write(updatedBlob);
      await writable.close();
      atlasBlob = updatedBlob;
      status.textContent = translate('atlasSaved', 'Atlas PNG saved.');
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.warn('Unable to save pixel atlas', error);
      status.textContent = translate(
        'atlasSaveFailed',
        `Could not save ${currentEntry.atlas}. Choose the pixel-font/atlases directory.`
      );
      directoryHandle = undefined;
    }
  }

  async function downloadAtlas() {
    if (!currentEntry || !atlasBlob) return;
    const updatedBlob = await renderUpdatedAtlas(atlasBlob);
    atlasBlob = updatedBlob;
    const link = document.createElement('a');
    const url = URL.createObjectURL(updatedBlob);
    link.href = url;
    link.download = currentEntry.atlas;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = translate('atlasDownloaded', 'Updated atlas PNG downloaded.');
  }

  async function renderUpdatedAtlas(source) {
    const image = await createImageBitmap(source);
    if (image.width !== 256 || image.height !== 256) {
      image.close();
      throw new Error('The selected atlas must be exactly 256 by 256 pixels');
    }
    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = image.width;
    atlasCanvas.height = image.height;
    const atlasContext = atlasCanvas.getContext('2d');
    atlasContext.drawImage(image, 0, 0);
    image.close();
    atlasContext.putImageData(new ImageData(pixels.slice(), CELL_SIZE, CELL_SIZE), currentEntry.x, currentEntry.y);
    return new Promise((resolve, reject) => {
      atlasCanvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG encoding failed')), 'image/png');
    });
  }
}

async function extractCell(blob, entry) {
  const image = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  image.close();
  return context.getImageData(entry.x, entry.y, CELL_SIZE, CELL_SIZE).data;
}

function drawCheckerboard(context, size) {
  const checker = size / 32;
  for (let y = 0; y < size / checker; y += 1) {
    for (let x = 0; x < size / checker; x += 1) {
      context.fillStyle = (x + y) % 2 === 0 ? '#f1f1f1' : '#bdbdbd';
      context.fillRect(x * checker, y * checker, checker, checker);
    }
  }
}

function toolButton(tool, icon, translationKey, fallback, selected = false) {
  return `<button type="button" data-tool="${tool}" data-i18n-aria-label="${translationKey}" aria-label="${fallback}" aria-pressed="${selected}" class="${selected ? 'is-active' : ''}"><span aria-hidden="true">${icon}</span></button>`;
}

function preview(kind, translationKey, fallback) {
  return `<figure>
    <span class="pixel-editor-preview-swatch"><canvas class="pixel-editor-preview-${kind}" width="16" height="16"></canvas></span>
    <figcaption data-i18n="${translationKey}">${fallback}</figcaption>
  </figure>`;
}

function pixelOffset(x, y) {
  return (y * CELL_SIZE + x) * 4;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function hex(value) {
  return value.toString(16).padStart(2, '0');
}
