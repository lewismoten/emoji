import { updateEmojiComposition } from "./dialog-render.js";

export function updateExplorerComposition(
  options: any,
  item: any,
  value: string,
) {
  const locale =
    document.documentElement.lang || options.selectedLocale() || undefined;
  updateEmojiComposition({
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    compositionMode: options.compositionMode(),
    developerMode: options.developerModeEnabled(),
    detailsVisible:
      !options.dialog().classList.contains("is-code-view") &&
      !options.dialog().classList.contains("is-editor-view"),
    dir: document.documentElement.dir,
    emojiKeyByCodePoints: options.emojiKeyByCodePoints(),
    exampleDialog: options.dialog(),
    item,
    locale,
    numberingSystem: locale?.startsWith("ar") ? "arab" : undefined,
    translate: options.translate,
    value,
  });
}
