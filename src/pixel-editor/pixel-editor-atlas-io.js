import { CELL_SIZE } from "./pixel-editor-constants.js";
import { canvasToPng, drawBitmapText } from "./pixel-editor-canvas-helpers.js";

export async function getNestedFileHandle(root, relativePath, create = false) {
  const parts = relativePath.split("/");
  const fileName = parts.pop();
  let directory = root;
  for (const part of parts) {
    directory = await directory.getDirectoryHandle(part, { create });
  }
  return directory.getFileHandle(fileName, { create });
}

export async function createBlankAtlas(manifest, entry) {
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

export async function extractCell(blob, entry) {
  const image = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  image.close();
  return context.getImageData(entry.x, entry.y, CELL_SIZE, CELL_SIZE).data;
}

export function createPixelEditorInputController(options) {
  const {
    boundsFromPoints,
    canvas,
    cellSize,
    clamp,
    copyArtButton,
    copyPixelArt,
    copySelection,
    copySelectionButton,
    dialog,
    draftController,
    drawLine,
    drawShape,
    floodFill,
    floatingLayer,
    moveFloatingLayer,
    pasteArtButton,
    pastePixelArt,
    paletteController,
    pixels,
    releasePointerState,
    renderController,
    redo,
    redoButton,
    selectionState,
    setLayerDragOrigin,
    setLayerDragStart,
    setPointerPrevious,
    setPointerStart,
    setSelection,
    setShapeBase,
    toolState,
    transformFloatingLayer,
    undo,
    undoButton,
    updateTransferButtons,
    view,
    bakeFloatingLayer,
    cancelFloatingLayer,
  } = options;

  function onPointerDown(event) {
    if (!selectionState.currentEntry() || !selectionState.cellLoaded() || event.button !== 0) return;
    canvas.focus({ preventScroll: true });
    const point = pointerCell(event);
    canvas.setPointerCapture(event.pointerId);
    if (floatingLayer()) {
      if (renderController.pointInFloatingLayer(point)) {
        setLayerDragStart(point);
        setLayerDragOrigin({ x: floatingLayer().x, y: floatingLayer().y });
      }
      return;
    }
    setPointerStart(point);
    setPointerPrevious(point);
    if (toolState() === "select") {
      setSelection(boundsFromPoints(point, point));
      renderController.draw();
      return;
    }
    if (toolState() === "eyedropper") {
      paletteController.pickColor(point);
      return;
    }
    draftController.pushHistory();
    if (toolState() === "bucket") {
      floodFill(point);
      setPointerStart(undefined);
      renderController.draw();
      return;
    }
    setShapeBase(pixels().slice());
    if (toolState() === "pencil" || toolState() === "line") drawLine(point, point);
    if (toolState() === "rectangle" || toolState() === "ellipse") drawShape(point, point, toolState());
    renderController.draw();
  }

  function onPointerMove(event) {
    if (selectionState.layerDragStart() && canvas.hasPointerCapture(event.pointerId)) {
      const point = pointerCell(event);
      moveFloatingLayer(
        selectionState.layerDragOrigin().x + point.x - selectionState.layerDragStart().x,
        selectionState.layerDragOrigin().y + point.y - selectionState.layerDragStart().y,
      );
      return;
    }
    if (!selectionState.pointerStart() || !canvas.hasPointerCapture(event.pointerId)) return;
    const point = pointerCell(event);
    if (toolState() === "select") {
      setSelection(boundsFromPoints(selectionState.pointerStart(), point));
    } else if (toolState() === "pencil") {
      drawLine(selectionState.pointerPrevious(), point);
      setPointerPrevious(point);
    } else if (toolState() === "line") {
      pixels().set(selectionState.shapeBase());
      drawLine(selectionState.pointerStart(), point);
    } else if (toolState() === "rectangle" || toolState() === "ellipse") {
      pixels().set(selectionState.shapeBase());
      drawShape(selectionState.pointerStart(), point, toolState());
    }
    renderController.draw();
  }

  function onPointerUp(event) {
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    releasePointerState();
    updateTransferButtons();
  }

  function onPointerCancel(event) {
    if (selectionState.shapeBase()) pixels().set(selectionState.shapeBase());
    onPointerUp(event);
    renderController.draw();
  }

  function onCanvasKeyDown(event) {
    if (!floatingLayer()) return;
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
    } else if (key === "c" && toolState() === "select" && !copySelectionButton.disabled) {
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
        Math.floor(((event.clientX - bounds.left) / bounds.width) * cellSize),
        0,
        cellSize - 1,
      ),
      y: clamp(
        Math.floor(((event.clientY - bounds.top) / bounds.height) * cellSize),
        0,
        cellSize - 1,
      ),
    };
  }

  return {
    onCanvasKeyDown,
    onEditorKeyDown,
    onPointerCancel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
