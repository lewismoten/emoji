import { createEmojiDialogViewController } from "../../explorer/dialog/dialog-view.js";

export function createDialogViewRuntime(options: any) {
  return createEmojiDialogViewController({
    currentDialogParentStack: () => options.currentDialogParentStack(),
    currentEmojiKey: () => options.currentEmojiKey(),
    developerModeEnabled: options.developerModeEnabled,
    fullDeveloperModeEnabled: options.fullDeveloperModeEnabled,
    dialog: () => options.dialog(),
    emojiParent: () => options.emojiParent(),
    ensurePixelEditor: () => options.ensurePixelEditor(),
    getPixelEditor: () => options.getPixelEditor(),
    loadPackageManifest: options.loadPackageManifest,
    syncUrlState: options.syncUrlState,
    translate: options.translate,
    updateCompositionBackButton: options.updateCompositionBackButton,
    updateImportExamples: options.updateImportExamples,
  });
}
