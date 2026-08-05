import { getCodeExampleText as getCodeExampleTextValue } from "../../explorer/emoji/import-examples.js";
import {
  withoutDialogParentPanel,
  withoutCompositionParent,
} from "../../explorer/dialog/dialog-runtime-helpers.js";
import { createEmojiDialogClickHandler } from "../../explorer/dialog/emoji-dialog-events.js";
import * as route from "../route.js";
import * as state from "../../state.js";
export function createEmojiDialogClickRuntime(options: any) {
  return createEmojiDialogClickHandler({
    animateCopy: options.animateCopy,
    copy: options.copy,
    copyValue: (kind: string) =>
      kind === "code"
        ? getCodeExampleTextValue(options.dialog())
        : kind === "link"
          ? route.getHref()
          : options.currentEmojiCopies()[kind],
    currentEmojiKey: options.currentEmojiKey,
    dialog: options.dialog,
    openParentPanel: (panel: string) => {
      options.setSuppressDialogCloseSync(true);
      const dialog = options.dialog();
      dialog.dataset.dialogParentPanel = "";
      options.clearCurrentDialogParentStack();
      dialog.close();
      options.setSuppressDialogCloseSync(false);
      options.openPanel({
        panel,
        addHistory: false,
        dialogs: options.panelDialogs(),
        languageList: options.languageList(),
        renderSavedEmoji: options.renderSavedEmoji,
        syncUrlState: options.syncUrlState,
      });
      options.syncUrlState(
        "replace",
        withoutDialogParentPanel(
          withoutCompositionParent(window.history.state),
        ),
      );
    },
    openComposition: (key: string) => {
      const parentEmojiKey = options.currentEmojiKey();
      options.showEmoji(key, false);
      options.syncUrlState("push", {
        ...window.history.state,
        emojiDialogEntry: false,
        compositionParent: parentEmojiKey,
      });
      options.updateCompositionBackButton();
    },
    recordCopiedEmoji: options.recordCopiedEmoji,
    refreshComposition: () =>
      options.updateEmojiComposition(
        state.byId.get(options.currentEmojiKey) ?? {},
        state.emojiByKey.get(options.currentEmojiKey()) ?? "",
      ),
    setView: options.setView,
    syncUrlState: () => options.syncUrlState(),
    toggleComposition: () => options.toggleComposition(),
    toggleFavorite: () => options.toggleFavorite(options.currentEmojiKey()),
    translate: options.translate,
  });
}
