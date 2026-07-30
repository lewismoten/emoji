// @ts-nocheck -- Transitional TypeScript migration.
export function createPixelEditorRuntimeController(options) {
  const {
    currentEntry,
    draftController,
    formatNumber,
    formatPercent,
    getLoadId,
    getManifestPromise,
    isViteDevelopment,
    paletteController,
    previewController,
    renderController,
    setCurrentEntry,
    setManifestPromise,
    status,
    traceAlpha,
    traceOutput,
    translate,
    updateLocation,
    updateShapeToolButtons,
    updateTransferButtons,
  } = options;

  function updateTraceOutput() {
    traceOutput.value = formatPercent(Number(traceAlpha.value) / 100);
  }

  function renderLocationText(entry) {
    return `${entry.atlas} · ${translate("row", "row")} ${formatNumber(entry.row + 1)} · ${translate("column", "column")} ${formatNumber(entry.column + 1)}`;
  }

  function applyTranslatedAttributes(root) {
    root?.querySelectorAll?.("[data-i18n]").forEach((element) => {
      element.textContent = translate(
        element.dataset.i18n,
        element.textContent,
      );
    });
    root?.querySelectorAll?.("[data-i18n-aria-label]").forEach((element) => {
      const label = translate(
        element.dataset.i18nAriaLabel,
        element.getAttribute("aria-label"),
      );
      element.setAttribute("aria-label", label);
      if (element.hasAttribute("title")) element.setAttribute("title", label);
    });
  }

  function refreshTranslations() {
    applyTranslatedAttributes(status?.closest(".pixel-editor-view"));
    if (currentEntry()) updateLocation();
    updateTraceOutput();
    updateShapeToolButtons();
    draftController.updatePreviewActionLabels();
    paletteController.updateSkinTonePalette(currentEntry()?.codePoints);
  }

  async function refreshFontBuild() {
    try {
      const currentKey = currentEntry()?.key;
      const manifest = await loadManifest(true);
      if (currentKey) setCurrentEntry(manifest.glyphs[currentKey]);
      previewController.drawFontPreview();
      updateTransferButtons();
    } catch (error) {
      console.warn("Pixel font preview refresh unavailable", error);
    }
  }

  function loadManifest(refresh = false) {
    if (refresh) setManifestPromise(undefined);
    const bypassCache = refresh || isViteDevelopment;
    const suffix = bypassCache ? `?v=${Date.now()}` : "";
    if (!getManifestPromise()) {
      setManifestPromise(
        fetch(
          `pixel-font/build/editor-manifest.json${suffix}`,
          bypassCache ? { cache: "no-store" } : undefined,
        ).then((response) => {
          if (!response.ok)
            throw new Error("Pixel editor manifest is unavailable");
          return response.json();
        }),
      );
    }
    return getManifestPromise();
  }

  function undo() {
    draftController.undo();
    renderController.draw();
  }

  function redo() {
    draftController.redo();
    renderController.draw();
  }

  return {
    loadManifest,
    redo,
    refreshFontBuild,
    refreshTranslations,
    renderLocationText,
    undo,
    updateTraceOutput,
  };
}
