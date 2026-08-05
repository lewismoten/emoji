import { createDialogNavigationController } from "../../explorer/dialog/dialog-navigation-controller.js";
import { createEmojiSessionController } from "../emoji/emoji-session-controller.js";
import { withoutCompositionParent } from "../../explorer/dialog/dialog-runtime-helpers.js";
import { resolveDialogNavigationState } from "../../explorer/dialog/dialog-state.js";
import * as state from "../../state.js";

export function initializeDialogRuntime(options: any) {
  const { showEmoji } = createEmojiSessionController({
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    developerModeEnabled: options.developerModeEnabled,
    fullDeveloperModeEnabled: options.fullDeveloperModeEnabled,
    dialog: options.dialog,
    displayGroupName: options.displayGroupName,
    getIntroducedVersion: options.getIntroducedVersion,
    openDialogAction(
      mode: "details" | "code" | "editor" = "details",
      parentPanel: "" | "favorites" | "help" | "language" = "",
    ) {
      if (options.copyStatus()) options.copyStatus().textContent = "";
      options.dialog().dataset.dialogParentPanel = parentPanel;
      options.setCurrentDialogParentStack(parentPanel ? [parentPanel] : []);
      options.setDialogView(mode, false);
      options.dialog().showModal();
      options.focusInitialAction();
      options.syncUrlState("push", {
        ...withoutCompositionParent(window.history.state),
        emojiDialogEntry: true,
        dialogParentPanel: parentPanel,
      });
      options.updateCompositionBackButton();
    },
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

  const dialogNavigation = createDialogNavigationController({
    currentDialogParentStack: state.currentDialogParentStack.get,
    currentEmojiKey: state.currentEmojiKey.get,
    dialog: options.dialog,
    dialogNavigationKeys: state.dialogNavigationKeys.get,
    displayedKeys: state.displayedKeys.get,
    emojiNext: options.emojiNext,
    emojiParent: options.emojiParent,
    emojiPrevious: options.emojiPrevious,
    resolveNavigation: resolveDialogNavigationState,
    showEmoji,
    syncUrlState: options.syncUrlState,
    translate: options.translate,
  });

  return {
    showEmoji,
    navigateEmoji: dialogNavigation.navigate,
    updateDialogNavigation: dialogNavigation.update,
    updateCompositionBackButton: dialogNavigation.updateBack,
  };
}
