// @ts-nocheck -- Transitional TypeScript migration.
import {
  flipPixels,
  layerTransformChangesPixels,
  nextLayerRotation,
} from "../layers/pixel-editor-layer-helpers.js";
import {
  layerPositionAllowed,
  pixelsEqual,
} from "../core/pixel-editor-geometry-helpers.js";
import { syncRovingGrid } from "../core/pixel-editor-grid-navigation.js";

export function createPixelEditorModeController(options) {
  const {
    canvas,
    cellLoaded,
    copyArtButton,
    copyFontButton,
    copySelectionButton,
    currentEntry,
    draftController,
    filePanel,
    floatingLayer,
    historyPanel,
    invertLayerButton,
    layerHelp,
    layerNudgeButtons,
    layerPanel,
    layerTransformButtons,
    paletteController,
    pasteArtButton,
    pastePending,
    previewActions,
    selection,
    tool,
    toolButtons,
    toolsPanel,
    tracingPanel,
    transferPanel,
    drawingPanel,
    view,
    artworkClipboard,
  } = options;

  function updateTransferButtons() {
    copyArtButton.disabled =
      !currentEntry() ||
      !cellLoaded() ||
      Boolean(floatingLayer()) ||
      !draftController.hasVisibleArtwork();
    copyFontButton.disabled =
      !currentEntry()?.painted || !cellLoaded() || Boolean(floatingLayer());
    copySelectionButton.disabled =
      !currentEntry() ||
      !cellLoaded() ||
      Boolean(floatingLayer()) ||
      !selection() ||
      !draftController.selectionHasVisibleArtwork();
    pasteArtButton.disabled =
      !currentEntry() ||
      !cellLoaded() ||
      !artworkClipboard() ||
      pastePending() ||
      Boolean(floatingLayer()) ||
      (tool() === "select" && artworkClipboard().kind !== "selection");
  }

  function updateEditorModePanels() {
    const layerMode = Boolean(floatingLayer());
    const selectionMode = tool() === "select" && !layerMode;
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
      String(Boolean(floatingLayer()?.inverted)),
    );
    invertLayerButton.classList.toggle(
      "is-active",
      Boolean(floatingLayer()?.inverted),
    );
    updateLayerControlStates();
  }

  function updateLayerControlStates() {
    if (!floatingLayer()) return;
    layerNudgeButtons.forEach((button) => {
      const nextX = floatingLayer().x + Number(button.dataset.layerX);
      const nextY = floatingLayer().y + Number(button.dataset.layerY);
      button.disabled = !layerPositionAllowed(floatingLayer(), nextX, nextY);
    });
    syncRovingGrid(layerNudgeButtons);
    layerTransformButtons.forEach((button) => {
      const transform = button.dataset.layerTransform;
      if (transform === "rotate-left" || transform === "rotate-right") {
        const rotated = nextLayerRotation(
          floatingLayer(),
          transform === "rotate-right",
          paletteController.activePaletteColors(),
        );
        button.disabled = !layerTransformChangesPixels(
          floatingLayer(),
          rotated,
        );
      } else {
        button.disabled = pixelsEqual(
          floatingLayer().pixels,
          flipPixels(floatingLayer(), transform === "flip-horizontal"),
        );
      }
    });
  }

  return {
    updateEditorModePanels,
    updateLayerControlStates,
    updateTransferButtons,
  };
}
