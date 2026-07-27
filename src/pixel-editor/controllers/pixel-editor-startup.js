import {
  bindPaletteGrid,
  bindRovingGrid,
} from "../pixel-editor-grid-navigation.js";

export function initializePixelEditorUi(options) {
  const {
    bakeLayerButton,
    canvas,
    copyArtButton,
    copyFontButton,
    copySelectionButton,
    documentTarget = document,
    downloadButton,
    downloadEmojiButton,
    historyButtons,
    inputController,
    invertLayerButton,
    layerNudgeButtons,
    layerTransformButtons,
    paletteButtons,
    paletteController,
    pasteArtButton,
    previewActionButtons,
    renderController,
    runtimeController,
    saveButton,
    toolButtons,
    toolController,
    traceAlpha,
    traceNudgeButtons,
    transferController,
    windowTarget = window,
    draftController,
  } = options;

  const {
    onCanvasKeyDown,
    onEditorKeyDown,
    onPointerCancel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = inputController;

  toolButtons.forEach((button) =>
    button.addEventListener("click", () =>
      toolController.selectTool(button.dataset.tool),
    ),
  );
  traceAlpha.addEventListener("input", () => {
    runtimeController.updateTraceOutput();
    renderController.draw();
  });
  traceNudgeButtons.forEach((button) =>
    button.addEventListener("click", () => {
      options.adjustTraceOffsets(
        Number(button.dataset.traceX),
        Number(button.dataset.traceY),
      );
      options.previewController.renderTrace();
      renderController.draw();
    }),
  );
  paletteButtons.forEach((button) =>
    button.addEventListener("click", () =>
      paletteController.selectPaletteColor(button),
    ),
  );
  options.undoButton.addEventListener("click", runtimeController.undo);
  options.redoButton.addEventListener("click", runtimeController.redo);
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
  options.cancelLayerButton.addEventListener(
    "click",
    transferController.cancelFloatingLayer,
  );
  invertLayerButton.addEventListener(
    "click",
    transferController.toggleFloatingLayerInversion,
  );
  saveButton.addEventListener("click", options.atlasController.saveAtlas);
  downloadButton.addEventListener("click", options.atlasController.downloadAtlas);
  downloadEmojiButton.addEventListener(
    "click",
    options.atlasController.downloadEmojiPng,
  );
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("keydown", onCanvasKeyDown);
  documentTarget.addEventListener("keydown", onEditorKeyDown, true);
  windowTarget.addEventListener(
    "beforeunload",
    draftController.warnAboutDirtyArtwork,
  );
  bindRovingGrid(toolButtons);
  bindRovingGrid(historyButtons);
  bindPaletteGrid(paletteButtons);
  bindRovingGrid(traceNudgeButtons);
  bindRovingGrid(layerNudgeButtons);
  bindRovingGrid(previewActionButtons);
  paletteController.updatePaletteSelection();
  toolController.updateShapeToolButtons();
  runtimeController.updateTraceOutput();
  draftController.updatePreviewActionLabels();
  renderController.draw();
}
