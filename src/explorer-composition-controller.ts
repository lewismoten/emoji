import { updateEmojiComposition } from './explorer/dialog-render.js';

export function updateExplorerComposition(options: any, item: any, value: string) {
  const locale = document.documentElement.lang || options.selectedLocale() || undefined;
  updateEmojiComposition({
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    byId: options.byId(),
    compositionMode: options.compositionMode(),
    developerMode: options.developerModeEnabled(),
    detailsVisible: !options.dialog().classList.contains('is-code-view') &&
      !options.dialog().classList.contains('is-editor-view'),
    dir: document.documentElement.dir,
    emojiByKey: options.emojiByKey(),
    emojiKeyByCodePoints: options.emojiKeyByCodePoints(),
    exampleDialog: options.dialog(),
    item,
    locale,
    numberingSystem: locale?.startsWith('ar') ? 'arab' : undefined,
    searchAnnotations: options.searchAnnotations(),
    translate: options.translate,
    value
  });
}
