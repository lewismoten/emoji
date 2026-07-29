import { showEmojiSession } from "../explorer/dialog/emoji-session.js";

/** Assemble dependencies for opening an emoji-details session. */
export function createEmojiSessionController(options: any) {
  const showEmoji = (
    id: string,
    openDialog = true,
    navigationKeys?: string[],
    initialMode: "details" | "code" | "editor" = "details",
    parentPanel?: "" | "favorites" | "help" | "language",
  ) => {
    const currentEmojiCopies = { value: options.state().currentEmojiCopies };
    const currentEmojiKey = { value: options.state().currentEmojiKey };
    const currentDialogParentStack = {
      value: options.state().currentDialogParentStack,
    };
    const dialogNavigationKeys = {
      value: options.state().dialogNavigationKeys,
    };

    showEmojiSession({
      applyPixelArtworkClass: options.applyPixelArtworkClass,
      applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
      byId: options.state().byId,
      compositionMode: options.state().compositionMode,
      currentEmojiCopies,
      currentEmojiKey,
      currentDialogParentStack,
      developerMode: options.developerModeEnabled(),
      dialog: options.dialog(),
      dialogNavigationKeys,
      displayGroupName: options.displayGroupName,
      displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
      displayedKeys: { value: options.state().displayedKeys },
      emojiByKey: options.state().emojiByKey,
      getIntroducedVersion: options.getIntroducedVersion,
      id,
      initialMode,
      items: options.state().items,
      navigationKeys,
      openDialog,
      parentPanel,
      openDialogAction: options.openDialogAction,
      openEditor: options.openEditor,
      searchAnnotations: options.state().searchAnnotations,
      selectedSearchLocale: options.state().selectedSearchLocale,
      sequenceTranslationKeys: options.sequenceTranslationKeys,
      sequenceTypeLabels: options.sequenceTypeLabels,
      statusTranslationKeys: options.statusTranslationKeys,
      translate: options.translate,
      updateDialogNavigation: options.updateDialogNavigation,
      updateEmojiComposition: options.updateEmojiComposition,
      updateFavoriteButton: options.updateFavoriteButton,
      updateRenderingDiagnostic: options.updateRenderingDiagnostic,
    });

    options.state().currentEmojiCopies = currentEmojiCopies.value;
    options.state().currentEmojiKey = currentEmojiKey.value;
    options.state().currentDialogParentStack = currentDialogParentStack.value;
    options.state().dialogNavigationKeys = dialogNavigationKeys.value;
  };

  return { showEmoji };
}
