// @ts-nocheck -- Transitional TypeScript migration.
import { hasVisiblePixels } from "../core/pixel-editor-geometry-helpers.js";
import {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  compareSkinToneHelpers,
  skinToneBaseSequence,
  skinToneSequence,
} from "../palette/pixel-editor-skin-tone.js";

export async function findSkinTonePasteHelper(options) {
  const {
    artworkDrafts,
    clipboard,
    currentEntry,
    extractCell,
    loadManifest,
  } = options;
  const sourceTones = clipboard.skinTones ?? [];
  const targetTones = skinToneSequence(currentEntry.codePoints);
  if (
    sourceTones.length < 2 ||
    sourceTones.length !== targetTones.length ||
    clipboard.baseSequence !== skinToneBaseSequence(currentEntry.codePoints)
  )
    return undefined;
  const manifest = await loadManifest();
  const candidates = Object.values(manifest.glyphs)
    .filter((entry) => {
      const tones = skinToneSequence(entry.codePoints);
      return (
        entry.key !== clipboard.sourceKey &&
        entry.key !== currentEntry.key &&
        skinToneBaseSequence(entry.codePoints) === clipboard.baseSequence &&
        tones.length === sourceTones.length &&
        new Set(tones).size === tones.length &&
        (entry.painted || artworkDrafts().has(entry.key))
      );
    })
    .sort(compareSkinToneHelpers);
  for (const entry of candidates) {
    const helperPixels = await loadHelperPixels({
      artworkDrafts,
      entry,
      extractCell,
    });
    if (!helperPixels) continue;
    const ownership = buildSkinToneOwnership(
      helperPixels,
      skinToneSequence(entry.codePoints),
    );
    if (ownership) return { entry, ownership };
  }
  return sourceTones.length === 2
    ? { entry: undefined, ownership: buildTwoPersonOwnership() }
    : undefined;
}

async function loadHelperPixels(options) {
  const { artworkDrafts, entry, extractCell } = options;
  const draft = artworkDrafts().get(entry.key);
  if (draft?.pixels && hasVisiblePixels(draft.pixels)) return draft.pixels.slice();
  const response = await fetch(`pixel-font/atlases/${entry.atlas}`).catch(
    () => undefined,
  );
  if (
    !response?.ok ||
    !response.headers.get("content-type")?.includes("image/png")
  ) {
    return undefined;
  }
  const helperPixels = await extractCell(await response.blob(), entry);
  return hasVisiblePixels(helperPixels) ? helperPixels : undefined;
}
