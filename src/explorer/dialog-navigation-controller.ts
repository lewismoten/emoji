import {
  updateCompositionBackButton,
  updateDialogNavigation
} from './dialog-render.js';

export function createDialogNavigationController(options: any) {
  const updateBack = () =>
    updateCompositionBackButton({
      byId: options.byId(),
      currentDialogParentStack: options.currentDialogParentStack?.() ?? [],
      dialogParentPanel:
        options.dialog()?.dataset?.dialogParentPanel ?? '',
      emojiByKey: options.emojiByKey(),
      emojiParent: options.emojiParent(),
      historyState: window.history.state,
      searchAnnotations: options.searchAnnotations(),
      translate: options.translate
    });
  const update = () =>
    updateDialogNavigation({
      currentEmojiKey: options.currentEmojiKey(), dialogNavigationKeys: options.dialogNavigationKeys(),
      displayedKeys: options.displayedKeys(), emojiNext: options.emojiNext(), emojiPrevious: options.emojiPrevious(),
      updateCompositionBackButton: updateBack
    });
  const navigate = (amount: number) => {
    const keys = options.dialogNavigationKeys().length ? options.dialogNavigationKeys() : options.displayedKeys();
    const state = options.resolveNavigation(keys, options.currentEmojiKey());
    const key = amount < 0 ? state.previousKey : state.nextKey;
    if (!key) return;
    options.showEmoji(key, false);
    options.syncUrlState();
  };
  return { navigate, update, updateBack };
}
