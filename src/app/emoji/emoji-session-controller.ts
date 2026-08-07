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
    showEmojiSession({
      applyPixelArtworkClass: options.applyPixelArtworkClass,
      applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
      compositionMode: state.compositionMode.get(),
      developerMode: options.developerModeEnabled(),
      fullDeveloperMode: options.fullDeveloperModeEnabled?.(),
      dialog: options.dialog(),
      displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
      displayGroupName: options.displayGroupName,
      getIntroducedVersion: options.getIntroducedVersion,
      id,
      initialMode,
      items: state.items.get(),
      navigationKeys,
      openDialog,
      parentPanel,
      openDialogAction: options.openDialogAction,
      openEditor: options.openEditor,
      sequenceTranslationKeys: options.sequenceTranslationKeys,
      sequenceTypeLabels: options.sequenceTypeLabels,
      statusTranslationKeys: options.statusTranslationKeys,
      translate: options.translate,
      updateDialogNavigation: options.updateDialogNavigation,
      updateEmojiComposition: options.updateEmojiComposition,
      updateFavoriteButton: options.updateFavoriteButton,
      updateRenderingDiagnostic: options.updateRenderingDiagnostic,
    });
  };

  return { showEmoji };
}
