import { showEmojiSession } from "../../explorer/dialog/emoji-session.js";
import * as state from "../../state.js";

/** Assemble dependencies for opening an emoji-details session. */
export function createEmojiSessionController(options: any) {
  const showEmoji = (
    id: string,
    openDialog = true,
    navigationKeys?: string[],
    initialMode: "details" | "code" | "editor" = "details",
    parentPanel?: "" | "favorites" | "help" | "language",
  ) => {
    const currentEmojiCopies = { value: state.currentEmojiCopies.get() };
    const currentEmojiKey = { value: state.currentEmojiKey.get() };
    const currentDialogParentStack = {
      value: state.currentDialogParentStack.get(),
    };
    const dialogNavigationKeys = {
      value: state.dialogNavigationKeys.get(),
    };

    showEmojiSession({
      applyPixelArtworkClass: options.applyPixelArtworkClass,
      applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
      byId: state.byId.get(),
      compositionMode: state.compositionMode.get(),
      currentEmojiCopies,
      currentEmojiKey,
      currentDialogParentStack,
      developerMode: options.developerModeEnabled(),
      fullDeveloperMode: options.fullDeveloperModeEnabled?.(),
      dialog: options.dialog(),
      dialogNavigationKeys,
      displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
      displayGroupName: options.displayGroupName,
      displayedKeys: { value: state.displayedKeys.get() },
      emojiByKey: state.emojiByKey.get(),
      getIntroducedVersion: options.getIntroducedVersion,
      id,
      initialMode,
      items: state.items.get(),
      navigationKeys,
      openDialog,
      parentPanel,
      openDialogAction: options.openDialogAction,
      openEditor: options.openEditor,
      searchAnnotations: state.searchAnnotations.get(),
      selectedSearchLocale: state.selectedSearchLocale.get(),
      sequenceTranslationKeys: options.sequenceTranslationKeys,
      sequenceTypeLabels: options.sequenceTypeLabels,
      statusTranslationKeys: options.statusTranslationKeys,
      translate: options.translate,
      updateDialogNavigation: options.updateDialogNavigation,
      updateEmojiComposition: options.updateEmojiComposition,
      updateFavoriteButton: options.updateFavoriteButton,
      updateRenderingDiagnostic: options.updateRenderingDiagnostic,
    });

    state.currentEmojiCopies.replace(currentEmojiCopies.value);
    state.currentEmojiKey.set(currentEmojiKey.value);
    state.currentDialogParentStack.set(currentDialogParentStack.value);
    state.dialogNavigationKeys.set(dialogNavigationKeys.value);
  };

  return { showEmoji };
}
