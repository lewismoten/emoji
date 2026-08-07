const copyMessages: Record<string, [string, string]> = {
  emoji: ["emojiCopied", "Emoji copied to the clipboard."],
  key: ["keyCopied", "Emoji key copied to the clipboard."],
  escape: ["escapeCopied", "Escape sequence copied to the clipboard."],
  codePoints: ["codePointsCopied", "Code points copied to the clipboard."],
  code: ["codeCopied", "Code copied to the clipboard."],
  link: ["linkCopied", "Link copied to the clipboard."],
};

type ClosestCapableTarget = {
  closest(selector: string): Element | null;
  matches?(selector: string): boolean;
};

const resolveElementTarget = (target: EventTarget | null) => {
  if (
    target &&
    typeof (target as unknown as ClosestCapableTarget).closest === "function"
  ) {
    return target as unknown as ClosestCapableTarget;
  }
  const parentElement = (target as Node | null)?.parentElement;
  if (parentElement && typeof parentElement.closest === "function")
    return parentElement as ClosestCapableTarget;
  return null;
};

export function createEmojiDialogClickHandler(options: any) {
  return (event: MouseEvent) => {
    const target = resolveElementTarget(event.target);
    if (!target) return;
    const dialog = options.dialog();
    if (target.closest(".emoji-composition-mode")) {
      options.toggleComposition();
      options.refreshComposition();
      options.syncUrlState();
      return;
    }
    const composition = target.closest(
      "[data-composition-emoji]",
    ) as HTMLElement | null;
    if (composition)
      return options.openComposition(composition.dataset.compositionEmoji);
    if (target.closest(".emoji-parent")) {
      const parentPanel =
        dialog.dataset?.dialogParentPanel ??
        window.history.state?.dialogParentPanel;
      if (parentPanel) return options.openParentPanel(parentPanel);
      return window.history.back();
    }
    if (target.closest(".toggle-favorite")) return options.toggleFavorite();
    if (target.closest(".emoji-version")) {
      options.selectIntroducedVersion?.();
      return;
    }
    if (target.closest(".show-emoji-code")) {
      options.setView("code");
      dialog.querySelector(".dialog-mode-back:not([hidden])")?.focus();
      return;
    }
    if (target.closest(".show-pixel-editor")) {
      options.setView("editor");
      dialog.querySelector(".pixel-editor-canvas")?.focus();
      return;
    }
    if (target.closest(".dialog-mode-back, .back-to-emoji")) {
      const selector = dialog.classList.contains("is-editor-view")
        ? ".show-pixel-editor"
        : ".show-emoji-code";
      options.setView("details");
      dialog.querySelector(selector)?.focus();
      return;
    }
    const button = target.closest("[data-copy]") as HTMLElement | null;
    if (!button) return;
    const kind = button.dataset.copy ?? "";
    const value = options.copyValue(kind);
    if (value === undefined) return;
    const [key, fallback] = copyMessages[kind] ?? [
      "copiedToClipboard",
      "Copied to the clipboard.",
    ];
    const emojiKey = options.currentEmojiKey();
    options
      .copy(value, options.translate(key, fallback))
      .then((copied: boolean) => {
        if (!copied) return;
        options.recordCopiedEmoji(emojiKey);
        if (button.matches?.(".emoji-preview")) options.animateCopy(button);
      });
  };
}
