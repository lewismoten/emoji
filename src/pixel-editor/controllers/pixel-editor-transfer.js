import { clamp, extractPixels, hasVisiblePixels, layerAxisBounds, layerPositionAllowed, pixelsEqual, trimVisiblePixels } from "../pixel-editor-geometry-helpers.js";
import { compositeLayer, effectiveLayerPixels, flipPixels, layerTransformChangesPixels, nextLayerRotation, resetLayerRotation } from "../pixel-editor-layer-helpers.js";
import { buildSkinToneOwnership, buildTwoPersonOwnership, compareSkinToneHelpers, remapSkinTonePixels, skinToneBaseSequence, skinToneSequence } from "../pixel-editor-skin-tone.js";

export function createPixelEditorTransferController(options) {
  const {
    canvas,
    cellLoaded,
    cellSize,
    cloneFloatingLayer,
    currentEntry,
    downloadBlob,
    draftController,
    extractCell,
    floatingLayer,
    formatClipboardStatus,
    formatStatus,
    getArtworkClipboard,
    getPixels,
    getSelection,
    getTool,
    loadManifest,
    paletteController,
    renderController,
    artworkDrafts,
    setArtworkClipboard,
    setFloatingLayer,
    setPastePending,
    setSelection,
    trimVisiblePixels: trimPixels = trimVisiblePixels,
    updateTransferButtons,
    writeStatus,
  } = options;

  function copyPixelArt() {
    if (!currentEntry() || !cellLoaded() || !draftController.hasVisibleArtwork()) return;
    const trimmed = trimPixels(getPixels(), cellSize, cellSize);
    if (!trimmed) return;
    setArtworkClipboard({
      kind: "art",
      pixels: trimmed.pixels,
      width: trimmed.width,
      height: trimmed.height,
      x: trimmed.x,
      y: trimmed.y,
      skinTones: skinToneSequence(currentEntry().codePoints),
      baseSequence: skinToneBaseSequence(currentEntry().codePoints),
      sourceKey: currentEntry().key,
    });
    updateTransferButtons();
    writeStatus(formatClipboardStatus("pixelArtCopied", "Pixel art copied."));
  }

  function copySelection() {
    if (!currentEntry() || !cellLoaded() || !getSelection()) return;
    const selectedPixels = extractPixels(getPixels(), cellSize, getSelection().x, getSelection().y, getSelection().width, getSelection().height);
    if (!hasVisiblePixels(selectedPixels)) return;
    setArtworkClipboard({
      kind: "selection",
      pixels: selectedPixels,
      width: getSelection().width,
      height: getSelection().height,
      x: getSelection().x,
      y: getSelection().y,
      skinTones: skinToneSequence(currentEntry().codePoints),
      baseSequence: skinToneBaseSequence(currentEntry().codePoints),
      sourceKey: currentEntry().key,
    });
    updateTransferButtons();
    writeStatus(formatClipboardStatus("selectionCopied", "Selected artwork copied."));
  }

  async function copyFontGlyph(copyFontButton) {
    if (!currentEntry()?.painted || !cellLoaded()) return;
    copyFontButton.disabled = true;
    try {
      const response = await fetch(`pixel-font/atlases/${currentEntry().atlas}`);
      if (!response.ok || !response.headers.get("content-type")?.includes("image/png")) {
        throw new Error("Pixel font source atlas is unavailable");
      }
      setArtworkClipboard({
        kind: "font",
        pixels: await extractCell(await response.blob(), currentEntry()),
        width: cellSize,
        height: cellSize,
        x: 0,
        y: 0,
        skinTones: skinToneSequence(currentEntry().codePoints),
        baseSequence: skinToneBaseSequence(currentEntry().codePoints),
        sourceKey: currentEntry().key,
      });
      writeStatus(formatClipboardStatus("fontGlyphCopied", "Custom font glyph copied."));
    } catch (error) {
      console.warn("Unable to copy custom font glyph", error);
      writeStatus(formatClipboardStatus("fontGlyphCopyFailed", "The custom font glyph could not be copied."));
    }
    updateTransferButtons();
  }

  async function pastePixelArt() {
    if (
      !currentEntry() ||
      !cellLoaded() ||
      !getArtworkClipboard() ||
      options.pastePending() ||
      (getTool() === "select" && getArtworkClipboard().kind !== "selection")
    ) return;
    const targetEntry = currentEntry();
    const clipboard = cloneFloatingLayer(getArtworkClipboard());
    setPastePending(true);
    updateTransferButtons();
    const helper = await findSkinTonePasteHelper(clipboard, targetEntry).catch((error) => {
      console.warn("Unable to load skin-tone paste helper", error);
      return undefined;
    });
    setPastePending(false);
    if (currentEntry() !== targetEntry) {
      updateTransferButtons();
      return;
    }
    setFloatingLayer(clipboard);
    floatingLayer().pixels = remapSkinTonePixels(floatingLayer().pixels, clipboard.skinTones, skinToneSequence(targetEntry.codePoints), helper ? { ownership: helper.ownership, ownershipWidth: cellSize, width: clipboard.width, offsetX: clipboard.x, offsetY: clipboard.y } : undefined);
    floatingLayer().inverted = false;
    setSelection(undefined);
    renderController.draw();
    canvas.focus({ preventScroll: true });
    writeStatus(formatStatus("layerPasted", "Artwork pasted as a floating layer."));
  }

  function moveFloatingLayer(horizontal, vertical) {
    if (!floatingLayer()) return;
    const nextX = floatingLayer().x + horizontal;
    const nextY = floatingLayer().y + vertical;
    if (!layerPositionAllowed(floatingLayer(), nextX, nextY)) return;
    setFloatingLayerPosition(nextX, nextY);
  }

  function setFloatingLayerPosition(x, y) {
    if (!floatingLayer()) return;
    const [minimumX, maximumX] = layerAxisBounds(floatingLayer().width);
    const [minimumY, maximumY] = layerAxisBounds(floatingLayer().height);
    floatingLayer().x = clamp(x, minimumX, maximumX);
    floatingLayer().y = clamp(y, minimumY, maximumY);
    renderController.draw();
  }

  function transformFloatingLayer(transform) {
    if (!floatingLayer()) return;
    const previousCenterX = floatingLayer().x + floatingLayer().width / 2;
    const previousCenterY = floatingLayer().y + floatingLayer().height / 2;
    if (transform === "rotate-left" || transform === "rotate-right") {
      const rotated = nextLayerRotation(floatingLayer(), transform === "rotate-right", paletteController.activePaletteColors());
      if (!layerTransformChangesPixels(floatingLayer(), rotated)) return;
      floatingLayer().pixels = rotated.pixels;
      floatingLayer().width = rotated.width;
      floatingLayer().height = rotated.height;
      floatingLayer().rotationSource = rotated.rotationSource;
      floatingLayer().rotationDegrees = rotated.rotationDegrees;
      floatingLayer().x = Math.round(previousCenterX - rotated.width / 2);
      floatingLayer().y = Math.round(previousCenterY - rotated.height / 2);
    } else if (transform === "flip-horizontal") {
      const flipped = flipPixels(floatingLayer(), true);
      if (pixelsEqual(floatingLayer().pixels, flipped)) return;
      floatingLayer().pixels = flipped;
      resetLayerRotation(floatingLayer());
    } else if (transform === "flip-vertical") {
      const flipped = flipPixels(floatingLayer(), false);
      if (pixelsEqual(floatingLayer().pixels, flipped)) return;
      floatingLayer().pixels = flipped;
      resetLayerRotation(floatingLayer());
    }
    setFloatingLayerPosition(floatingLayer().x, floatingLayer().y);
  }

  function bakeFloatingLayer() {
    if (!floatingLayer()) return;
    draftController.pushHistory();
    compositeLayer(getPixels(), { ...floatingLayer(), pixels: effectiveLayerPixels(floatingLayer(), paletteController.activePaletteColors()) });
    setFloatingLayer(undefined);
    renderController.draw();
    writeStatus(formatStatus("layerBaked", "Floating layer merged into the artwork."));
  }

  function cancelFloatingLayer() {
    if (!floatingLayer()) return;
    setFloatingLayer(undefined);
    renderController.draw();
    writeStatus("");
  }

  function toggleFloatingLayerInversion() {
    if (!floatingLayer()) return;
    floatingLayer().inverted = !floatingLayer().inverted;
    renderController.draw();
  }

  async function findSkinTonePasteHelper(clipboard, targetEntry) {
    const sourceTones = clipboard.skinTones ?? [];
    const targetTones = skinToneSequence(targetEntry.codePoints);
    if (
      sourceTones.length < 2 ||
      sourceTones.length !== targetTones.length ||
      clipboard.baseSequence !== skinToneBaseSequence(targetEntry.codePoints)
    ) return undefined;
    const manifest = await loadManifest();
    const candidates = Object.values(manifest.glyphs)
      .filter((entry) => {
        const tones = skinToneSequence(entry.codePoints);
        return (
          entry.key !== clipboard.sourceKey &&
          entry.key !== targetEntry.key &&
          skinToneBaseSequence(entry.codePoints) === clipboard.baseSequence &&
          tones.length === sourceTones.length &&
          new Set(tones).size === tones.length &&
          (entry.painted || artworkDrafts().has(entry.key))
        );
      })
      .sort(compareSkinToneHelpers);
    for (const entry of candidates) {
      const helperPixels = await loadHelperPixels(entry);
      if (!helperPixels) continue;
      const ownership = buildSkinToneOwnership(helperPixels, skinToneSequence(entry.codePoints));
      if (ownership) return { entry, ownership };
    }
    return sourceTones.length === 2
      ? { entry: undefined, ownership: buildTwoPersonOwnership() }
      : undefined;
  }

  async function loadHelperPixels(entry) {
    const draft = artworkDrafts().get(entry.key);
    if (draft?.pixels && hasVisiblePixels(draft.pixels)) return draft.pixels.slice();
    const response = await fetch(`pixel-font/atlases/${entry.atlas}`).catch(() => undefined);
    if (!response?.ok || !response.headers.get("content-type")?.includes("image/png")) {
      return undefined;
    }
    const helperPixels = await extractCell(await response.blob(), entry);
    return hasVisiblePixels(helperPixels) ? helperPixels : undefined;
  }

  return { bakeFloatingLayer, cancelFloatingLayer, copyFontGlyph, copyPixelArt, copySelection, moveFloatingLayer, pastePixelArt, setFloatingLayerPosition, toggleFloatingLayerInversion, transformFloatingLayer };
}
