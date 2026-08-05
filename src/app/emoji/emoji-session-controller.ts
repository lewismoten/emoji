import { showEmojiSession } from "../../explorer/dialog/emoji-session.js";
import * as state from "../../state.js";

/** Assemble dependencies for opening an emoji-details session. */
export function createEmojiSessionController(options: any) {
  const providedState = options.state?.();
  const showEmoji = (
    id: string,
    openDialog = true,
    navigationKeys?: string[],
    initialMode: "details" | "code" | "editor" = "details",
    parentPanel?: "" | "favorites" | "help" | "language",
  ) => {
    const currentEmojiCopies = {
      value: providedState?.currentEmojiCopies ?? state.currentEmojiCopies.get(),
    };
    const currentEmojiKey = {
      value: providedState?.currentEmojiKey ?? state.currentEmojiKey.get(),
    };
    const currentDialogParentStack = {
      value:
        providedState?.currentDialogParentStack ??
        state.currentDialogParentStack.get(),
    };
    const dialogNavigationKeys = {
      value: providedState?.dialogNavigationKeys ?? state.dialogNavigationKeys.get(),
    };

    showEmojiSession({
      applyPixelArtworkClass: options.applyPixelArtworkClass,
      applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
      byId: providedState?.byId ?? state.byId.get(),
      compositionMode:
        providedState?.compositionMode ?? state.compositionMode.get(),
      currentEmojiCopies,
      currentEmojiKey,
      currentDialogParentStack,
      developerMode: options.developerModeEnabled(),
      fullDeveloperMode: options.fullDeveloperModeEnabled?.(),
      dialog: options.dialog(),
      dialogNavigationKeys,
      displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
      displayGroupName: options.displayGroupName,
      displayedKeys: {
        value: providedState?.displayedKeys ?? state.displayedKeys.get(),
      },
      emojiByKey: providedState?.emojiByKey ?? state.emojiByKey.get(),
      getIntroducedVersion: options.getIntroducedVersion,
      id,
      initialMode,
      items: providedState?.items ?? state.items.get(),
      navigationKeys,
      openDialog,
      parentPanel,
      openDialogAction: options.openDialogAction,
      openEditor: options.openEditor,
      searchAnnotations:
        providedState?.searchAnnotations ?? state.searchAnnotations.get(),
      selectedSearchLocale:
        providedState?.selectedSearchLocale ??
        state.selectedSearchLocale.get(),
      sequenceTranslationKeys: options.sequenceTranslationKeys,
      sequenceTypeLabels: options.sequenceTypeLabels,
      statusTranslationKeys: options.statusTranslationKeys,
      translate: options.translate,
      updateDialogNavigation: options.updateDialogNavigation,
      updateEmojiComposition: options.updateEmojiComposition,
      updateFavoriteButton: options.updateFavoriteButton,
      updateRenderingDiagnostic: options.updateRenderingDiagnostic,
    });

    if (providedState) {
      providedState.currentEmojiCopies = currentEmojiCopies.value;
      providedState.currentEmojiKey = currentEmojiKey.value;
      providedState.currentDialogParentStack = currentDialogParentStack.value;
      providedState.dialogNavigationKeys = dialogNavigationKeys.value;
    } else {
      state.currentEmojiCopies.replace(currentEmojiCopies.value);
      state.currentEmojiKey.set(currentEmojiKey.value);
      state.currentDialogParentStack.set(currentDialogParentStack.value);
      state.dialogNavigationKeys.set(dialogNavigationKeys.value);
    }
  };

  return { showEmoji };
}
