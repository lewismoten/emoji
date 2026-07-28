// @ts-nocheck -- Transitional TypeScript migration.
import { CELL_SIZE } from "../core/pixel-editor-constants.js";
import { effectiveLayerPixels } from "../layers/pixel-editor-layer-helpers.js";

export function createPixelEditorCanvasController(options) {
  const {
    context,
    currentEmoji,
    currentSelection,
    currentTool,
    displaySize,
    draftController,
    drawArtworkPreview,
    drawCheckerboard,
    floatingLayer,
    paletteController,
    pixelOffset,
    pixels,
    selectionDashOffset,
    setSelectionDashOffset,
    traceAlpha,
    traceCanvas,
    updateEditorModePanels,
    updateTransferButtons,
    view,
  } = options;
  let selectionAnimationFrame;

  function draw(updateState = true) {
    const displayCell = displaySize / CELL_SIZE;
    context.clearRect(0, 0, displaySize, displaySize);
    drawCheckerboard(context, displaySize);
    if (Number(traceAlpha.value) > 0 && currentEmoji()) {
      context.save();
      context.globalAlpha = Number(traceAlpha.value) / 100;
      context.imageSmoothingEnabled = false;
      context.drawImage(traceCanvas, 0, 0, displaySize, displaySize);
      context.restore();
    }
    for (let y = 0; y < CELL_SIZE; y += 1) {
      for (let x = 0; x < CELL_SIZE; x += 1) {
        const offset = pixelOffset(x, y);
        const alpha = pixels()[offset + 3];
        if (alpha === 0) continue;
        context.fillStyle = `rgba(${pixels()[offset]}, ${pixels()[offset + 1]}, ${pixels()[offset + 2]}, ${alpha / 255})`;
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
      context.lineTo(position, displaySize);
      context.moveTo(0, position);
      context.lineTo(displaySize, position);
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
    const layer = floatingLayer();
    if (!layer) return;
    const layerPixels = effectiveLayerPixels(
      layer,
      paletteController.activePaletteColors(),
    );
    for (let y = 0; y < layer.height; y += 1) {
      for (let x = 0; x < layer.width; x += 1) {
        const offset = (y * layer.width + x) * 4;
        const alpha = layerPixels[offset + 3];
        if (alpha === 0) continue;
        targetContext.fillStyle = `rgba(${layerPixels[offset]}, ${layerPixels[offset + 1]}, ${layerPixels[offset + 2]}, ${alpha / 255})`;
        targetContext.fillRect(
          (layer.x + x) * displayCell,
          (layer.y + y) * displayCell,
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
      layer.x * displayCell + 1,
      layer.y * displayCell + 1,
      layer.width * displayCell - 2,
      layer.height * displayCell - 2,
    );
    targetContext.restore();
  }

  function drawSelectionOutline(targetContext, displayCell) {
    const selection = currentSelection();
    if (!selection || floatingLayer() || currentTool() !== "select") return;
    targetContext.save();
    targetContext.setLineDash([7, 7]);
    targetContext.lineDashOffset = selectionDashOffset();
    targetContext.strokeStyle = "#000000";
    targetContext.lineWidth = 4;
    targetContext.strokeRect(
      selection.x * displayCell + 2,
      selection.y * displayCell + 2,
      selection.width * displayCell - 4,
      selection.height * displayCell - 4,
    );
    targetContext.lineDashOffset = selectionDashOffset() + 7;
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
      currentTool() === "select" &&
      Boolean(currentSelection()) &&
      !floatingLayer() &&
      !view.hidden;
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
    if (
      currentTool() !== "select" ||
      !currentSelection() ||
      floatingLayer() ||
      view.hidden
    ) {
      return;
    }
    setSelectionDashOffset(-(timestamp / 55) % 14);
    draw(false);
  }

  function pointInFloatingLayer(point) {
    const layer = floatingLayer();
    return (
      point.x >= layer.x &&
      point.x < layer.x + layer.width &&
      point.y >= layer.y &&
      point.y < layer.y + layer.height
    );
  }

  return { draw, pointInFloatingLayer };
}
