import { CELL_SIZE } from "./pixel-editor-constants.js";

export function createPixelEditorDraftController(options) {
  const {
    cloneFloatingLayer,
    cloneSelection,
    currentEntry,
    dirtyIndicator,
    dirtyKeys,
    downloadButton,
    downloadEmojiButton,
    extractPixels,
    floatingLayer,
    hasVisiblePixels,
    pixels,
    pixelsEqual,
    persistedArtwork,
    saveButton,
    selection,
    status,
    traceOffsetX,
    traceOffsetY,
    translate,
    artworkDrafts,
    cellLoaded,
    atlasBlob,
    atlasExists,
    floatingLayerUndoState,
    pixelsSetter,
  } = options;
  let undoStack = [];
  let redoStack = [];

  function updateFileButtons() {
    const pendingAtlasLayer = hasPendingAtlasLayer();
    const canWrite =
      Boolean(currentEntry() && atlasBlob()) &&
      !pendingAtlasLayer &&
      (atlasExists() || hasVisibleAtlasDraft());
    saveButton.disabled = !canWrite || !hasDirtyAtlasDraft();
    downloadButton.disabled = !canWrite;
    downloadEmojiButton.disabled =
      !currentEntry() ||
      !cellLoaded() ||
      Boolean(floatingLayer()) ||
      !hasVisibleArtwork();
  }

  function hasDirtyAtlasDraft() {
    if (!currentEntry()) return false;
    return [...artworkDrafts().values()].some(
      (draft) =>
        draft.entry.atlas === currentEntry().atlas &&
        dirtyKeys().has(draft.entry.key),
    );
  }

  function hasPendingAtlasLayer() {
    if (!currentEntry()) return false;
    return [...artworkDrafts().values()].some(
      (draft) => draft.entry.atlas === currentEntry().atlas && draft.floatingLayer,
    );
  }

  function hasVisibleArtwork() {
    return hasVisiblePixels(pixels());
  }

  function selectionHasVisibleArtwork() {
    if (!selection()) return false;
    return hasVisiblePixels(
      extractPixels(
        pixels(),
        CELL_SIZE,
        selection().x,
        selection().y,
        selection().width,
        selection().height,
      ),
    );
  }

  function hasVisibleAtlasDraft() {
    if (hasVisibleArtwork()) return true;
    if (!currentEntry()) return false;
    return [...artworkDrafts().values()].some(
      (draft) =>
        draft.entry.atlas === currentEntry().atlas &&
        draft.pixels.some((value, index) => index % 4 === 3 && value > 0),
    );
  }

  function rememberCurrentDraft() {
    if (!currentEntry() || !cellLoaded()) return;
    artworkDrafts().set(currentEntry().key, {
      entry: currentEntry(),
      pixels: pixels().slice(),
      traceOffsetX: traceOffsetX(),
      traceOffsetY: traceOffsetY(),
      selection: cloneSelection(selection()),
      floatingLayer: cloneFloatingLayer(floatingLayer()),
    });
  }

  function updateDirtyState() {
    if (!currentEntry() || !cellLoaded()) {
      dirtyIndicator.hidden = true;
      return;
    }
    const baseline = persistedArtwork().get(currentEntry().key);
    const dirty =
      Boolean(floatingLayer()) || !baseline || !pixelsEqual(pixels(), baseline);
    if (dirty) dirtyKeys().add(currentEntry().key);
    else dirtyKeys().delete(currentEntry().key);
    dirtyIndicator.hidden = !dirty;
  }

  function markAtlasClean(atlas) {
    for (const draft of artworkDrafts().values()) {
      if (draft.entry.atlas !== atlas || draft.floatingLayer) continue;
      persistedArtwork().set(draft.entry.key, draft.pixels.slice());
      dirtyKeys().delete(draft.entry.key);
    }
    updateDirtyState();
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

  function pushHistory() {
    undoStack.push(pixels().slice());
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
    updateHistoryButtons();
  }

  function undo() {
    const previous = undoStack.pop();
    if (!previous) return;
    redoStack.push(pixels().slice());
    pixelsSetter(previous);
    updateHistoryButtons();
  }

  function redo() {
    const next = redoStack.pop();
    if (!next) return;
    undoStack.push(pixels().slice());
    pixelsSetter(next);
    updateHistoryButtons();
  }

  function updateHistoryButtons() {
    floatingLayerUndoState().undoButton.disabled =
      Boolean(floatingLayer()) || undoStack.length === 0;
    floatingLayerUndoState().redoButton.disabled =
      Boolean(floatingLayer()) || redoStack.length === 0;
  }

  function resetHistory() {
    undoStack = [];
    redoStack = [];
    updateHistoryButtons();
  }

  function warnAboutDirtyArtwork(event) {
    if (dirtyKeys().size === 0) return;
    event.preventDefault();
    event.returnValue = translate(
      "unsavedArtworkPrompt",
      "Save all unsaved pixel artwork before leaving.",
    );
    status.textContent = event.returnValue;
  }

  return {
    hasDirtyAtlasDraft,
    hasPendingAtlasLayer,
    hasVisibleArtwork,
    hasVisibleAtlasDraft,
    markAtlasClean,
    pushHistory,
    redo,
    rememberCurrentDraft,
    resetHistory,
    selectionHasVisibleArtwork,
    undo,
    updateDirtyState,
    updateFileButtons,
    updateHistoryButtons,
    updatePreviewActionLabels,
    warnAboutDirtyArtwork,
  };
}
