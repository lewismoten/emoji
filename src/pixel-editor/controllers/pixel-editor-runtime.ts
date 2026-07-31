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

  function applyVisibleEditorText(root) {
    const setText = (selector, key, fallback) => {
      const element = root?.querySelector?.(selector);
      if (element) element.textContent = translate(key, fallback);
    };
    const setLabel = (selector, key, fallback) => {
      const element = root?.querySelector?.(selector);
      if (!element) return;
      const label = translate(key, fallback);
      element.setAttribute("aria-label", label);
      if (element.hasAttribute("title")) element.setAttribute("title", label);
    };

    setText(".pixel-editor-undo [data-i18n='undo']", "undo", "Undo");
    setText(".pixel-editor-redo [data-i18n='redo']", "redo", "Redo");
    setText(
      ".pixel-editor-paste-art [data-i18n='pasteAsLayer']",
      "pasteAsLayer",
      "Paste layer",
    );
    setText(".pixel-editor-layer > legend", "floatingLayer", "Floating layer");
    setText(
      ".pixel-editor-invert-layer [data-i18n='invertLayer']",
      "invertLayer",
      "Invert",
    );
    setText(".pixel-editor-bake-layer", "bakeLayer", "Merge");
    setText(".pixel-editor-cancel-layer", "cancelLayer", "Cancel");
    setLabel(
      ".pixel-editor-layer-position",
      "moveLayer",
      "Move floating layer",
    );
    setLabel(
      "[data-layer-transform='rotate-left']",
      "rotateLayerLeft",
      "Rotate layer 45 degrees left",
    );
    setLabel(
      "[data-layer-transform='rotate-right']",
      "rotateLayerRight",
      "Rotate layer 45 degrees right",
    );
    setLabel(
      "[data-layer-transform='flip-horizontal']",
      "flipLayerHorizontal",
      "Flip layer horizontally",
    );
    setLabel(
      "[data-layer-transform='flip-vertical']",
      "flipLayerVertical",
      "Flip layer vertically",
    );
  }

  function refreshTranslations() {
    const root = status?.closest(".pixel-editor-view");
    applyTranslatedAttributes(root);
    applyVisibleEditorText(root);
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
