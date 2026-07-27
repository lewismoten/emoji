export function createPixelEditorSessionController(options) {
  const {
    artworkDrafts,
    cellSize,
    cloneFloatingLayer,
    cloneSelection,
    createBlankAtlas,
    currentEntry,
    currentEmoji,
    draftController,
    extractCell,
    getAtlasDimensions,
    getAtlasState,
    getPixels,
    loadManifest,
    persistedArtwork,
    paletteController,
    previewController,
    renderController,
    saveButton,
    setAtlasBlob,
    setAtlasDimensions,
    setAtlasExists,
    setCellLoaded,
    setCurrentEmoji,
    setCurrentEntry,
    setFloatingLayer,
    setLocationText,
    setPixels,
    setSelection,
    setStatusText,
    setTraceOffsets,
    translate,
    updateTransferButtons,
  } = options;

  let loadId = 0;

  async function open(key, emoji) {
    const requestedLoadId = ++loadId;
    draftController.rememberCurrentDraft();
    setCurrentEmoji(emoji);
    setTraceOffsets(0, 0);
    setCurrentEntry(undefined);
    setSelection(undefined);
    setFloatingLayer(undefined);
    setAtlasBlob(undefined);
    setAtlasExists(false);
    setCellLoaded(false);
    getPixels().fill(0);
    previewController.renderTrace();
    draftController.resetHistory();
    renderController.draw();
    setStatusText(translate("pixelEditorLoading", "Loading pixel cell…"));
    saveButton.disabled = true;
    options.downloadButton.disabled = true;
    try {
      const manifest = await loadManifest();
      if (requestedLoadId !== loadId) return;
      if (manifest.cellSize !== cellSize) {
        throw new Error(`Expected ${cellSize} by ${cellSize} pixel cells`);
      }
      const entry = manifest.glyphs[key];
      setCurrentEntry(entry);
      paletteController.updateSkinTonePalette(entry?.codePoints);
      updateTransferButtons();
      if (!entry) {
        setLocationText("");
        setStatusText(
          translate(
            "pixelEditorUnavailable",
            "This modified emoji is not part of the base atlas set.",
          ),
        );
        getPixels().fill(0);
        previewController.renderTrace();
        renderController.draw();
        return;
      }
      setAtlasDimensions(entry.atlasWidth, entry.atlasHeight);
      const hasPaintedAtlas = Boolean(entry.painted);
      const atlasResponse = hasPaintedAtlas
        ? await fetch(`pixel-font/atlases/${entry.atlas}`).catch(() => undefined)
        : undefined;
      const hasPng =
        hasPaintedAtlas &&
        atlasResponse?.ok &&
        atlasResponse.headers.get("content-type")?.includes("image/png");
      const loadedAtlasBlob = hasPng
        ? await atlasResponse.blob()
        : await createBlankAtlas(manifest, entry);
      if (requestedLoadId !== loadId) return;
      const loadedPixels = await extractCell(loadedAtlasBlob, entry);
      if (requestedLoadId !== loadId) return;
      setAtlasBlob(loadedAtlasBlob);
      setAtlasExists(hasPng);
      setCellLoaded(true);
      const draft = artworkDrafts().get(entry.key);
      if (!persistedArtwork().has(entry.key)) {
        persistedArtwork().set(entry.key, loadedPixels.slice());
      }
      setPixels(draft?.pixels.slice() ?? loadedPixels);
      setSelection(cloneSelection(draft?.selection));
      setFloatingLayer(cloneFloatingLayer(draft?.floatingLayer));
      setTraceOffsets(draft?.traceOffsetX ?? 0, draft?.traceOffsetY ?? 0);
      draftController.resetHistory();
      setLocationText(options.renderLocationText(currentEntry()));
      setStatusText("");
      previewController.renderTrace();
      renderController.draw();
    } catch (error) {
      if (requestedLoadId !== loadId) return;
      console.warn("Pixel editor unavailable", error);
      setStatusText(
        translate(
          "pixelEditorLoadFailed",
          "The pixel atlas could not be loaded.",
        ),
      );
    }
  }

  function refreshTranslations() {
    if (currentEntry()) {
      setLocationText(options.renderLocationText(currentEntry()));
    }
    options.refreshRuntimeTranslations();
  }

  async function refreshFontBuild() {
    await options.refreshRuntimeFontBuild();
    if (currentEntry()) {
      setLocationText(options.renderLocationText(currentEntry()));
    }
  }

  return {
    open,
    refreshFontBuild,
    refreshTranslations,
  };
}
