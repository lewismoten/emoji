import { initializeDialogRuntime } from "./dialog-runtime.js";

export function createDialogRuntimeConfig(options: any) {
  return initializeDialogRuntime({
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    byId: () => options.byId(),
    copyStatus: () => options.copyStatus(),
    currentDialogParentStack: () => options.currentDialogParentStack(),
    currentEmojiKey: () => options.currentEmojiKey(),
    developerModeEnabled: options.developerModeEnabled,
    dialog: () => options.dialog(),
    dialogNavigationKeys: () => options.dialogNavigationKeys(),
    displayedKeys: () => options.displayedKeys(),
    displayGroupName: options.displayGroupName,
    displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
    emojiByKey: () => options.emojiByKey(),
    emojiNext: () => options.emojiNext(),
    emojiParent: () => options.emojiParent(),
    emojiPrevious: () => options.emojiPrevious(),
    focusInitialAction: options.focusInitialAction,
    getIntroducedVersion: options.getIntroducedVersion,
    openEditor: (key: string, value: string) => options.openEditor(key, value),
    searchAnnotations: () => options.searchAnnotations(),
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeLabels: options.sequenceTypeLabels,
    setCurrentDialogParentStack: (value: string[]) =>
      options.setCurrentDialogParentStack(value),
    setDialogView: (...args: any[]) => options.setDialogView(...args),
    state: () => options.state(),
    statusTranslationKeys: options.statusTranslationKeys,
    syncUrlState: (...args: any[]) => options.syncUrlState(...args),
    translate: options.translate,
    updateCompositionBackButton: (...args: any[]) =>
      options.updateCompositionBackButton(...args),
    updateDialogNavigation: (...args: any[]) =>
      options.updateDialogNavigation(...args),
    updateEmojiComposition: options.updateEmojiComposition,
    updateFavoriteButton: options.updateFavoriteButton,
    updateRenderingDiagnostic: options.updateRenderingDiagnostic,
  });
}
