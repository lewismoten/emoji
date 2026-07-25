const copyMessages: Record<string, [string, string]> = {
  emoji: ['emojiCopied', 'Emoji copied to the clipboard.'],
  key: ['keyCopied', 'Emoji key copied to the clipboard.'],
  escape: ['escapeCopied', 'Escape sequence copied to the clipboard.'],
  codePoints: ['codePointsCopied', 'Code points copied to the clipboard.'],
  code: ['codeCopied', 'Code copied to the clipboard.'],
  link: ['linkCopied', 'Link copied to the clipboard.']
};

export function createEmojiDialogClickHandler(options: any) {
  return (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const dialog = options.dialog();
    if (target.closest('.emoji-composition-mode')) {
      options.toggleComposition();
      options.refreshComposition();
      options.syncUrlState();
      return;
    }
    const composition = target.closest('[data-composition-emoji]') as HTMLElement | null;
    if (composition) return options.openComposition(composition.dataset.compositionEmoji);
    if (target.closest('.emoji-parent')) return window.history.back();
    if (target.closest('.toggle-favorite')) return options.toggleFavorite();
    if (target.closest('.show-emoji-code')) {
      options.setView('code');
      dialog.querySelector('.dialog-mode-back:not([hidden])')?.focus();
      return;
    }
    if (target.closest('.show-pixel-editor')) {
      options.setView('editor');
      dialog.querySelector('.pixel-editor-canvas')?.focus();
      return;
    }
    if (target.closest('.dialog-mode-back, .back-to-emoji')) {
      const selector = dialog.classList.contains('is-editor-view')
        ? '.show-pixel-editor'
        : '.show-emoji-code';
      options.setView('details');
      dialog.querySelector(selector)?.focus();
      return;
    }
    const button = target.closest('[data-copy]') as HTMLElement | null;
    if (!button) return;
    const kind = button.dataset.copy ?? '';
    const value = options.copyValue(kind);
    if (value === undefined) return;
    const [key, fallback] = copyMessages[kind] ?? [
      'copiedToClipboard',
      'Copied to the clipboard.'
    ];
    const emojiKey = options.currentEmojiKey();
    options.copy(value, options.translate(key, fallback)).then((copied: boolean) => {
      if (!copied) return;
      options.recordCopiedEmoji(emojiKey);
      if (button.matches('.emoji-preview')) options.animateCopy(button);
    });
  };
}
