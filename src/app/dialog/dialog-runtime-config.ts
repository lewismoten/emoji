import { initializeDialogRuntime } from "./dialog-runtime.js";

export function createDialogRuntimeConfig(options: any) {
  return initializeDialogRuntime({
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    copyStatus: options.copyStatus,
    developerModeEnabled: options.developerModeEnabled,
    fullDeveloperModeEnabled: options.fullDeveloperModeEnabled,
    dialog: options.dialog,
    displayGroupName: options.displayGroupName,
    displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
    emojiNext: options.emojiNext,
    emojiParent: options.emojiParent,
    emojiPrevious: options.emojiPrevious,
    focusInitialAction: options.focusInitialAction,
    getIntroducedVersion: options.getIntroducedVersion,
    openEditor: options.openEditor,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeLabels: options.sequenceTypeLabels,
    setCurrentDialogParentStack: options.setCurrentDialogParentStack,
    setDialogView: options.setDialogView,
    statusTranslationKeys: options.statusTranslationKeys,
    syncUrlState: options.syncUrlState,
    translate: options.translate,
    updateCompositionBackButton: options.updateCompositionBackButton,
    updateDialogNavigation: options.updateDialogNavigation,
    updateEmojiComposition: options.updateEmojiComposition,
    updateFavoriteButton: options.updateFavoriteButton,
    updateRenderingDiagnostic: options.updateRenderingDiagnostic,
  });
}
