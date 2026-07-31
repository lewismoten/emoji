type MinimalElement = {
  textContent: string | null;
};

declare const document: {
  documentElement: { dataset: Record<string, string | undefined> };
};
declare const window: {
  matchMedia(query: string): { matches: boolean };
  setTimeout(callback: () => void, delay?: number): number;
};
declare const navigator: {
  clipboard?: {
    writeText?(value: string): Promise<void>;
  };
};

export function announceStatus(
  copyStatus: MinimalElement | undefined,
  message: string,
) {
  if (!copyStatus) return;
  copyStatus.textContent = "";
  window.setTimeout(() => {
    copyStatus.textContent = message;
  }, 0);
}

export async function copyToClipboard(options: {
  value: string;
  successMessage: string;
  copyStatus: MinimalElement | undefined;
  translate: (key: string, fallback: string) => string;
}) {
  try {
    if (!navigator.clipboard?.writeText)
      throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(options.value);
    announceStatus(options.copyStatus, options.successMessage);
    return true;
  } catch {
    announceStatus(
      options.copyStatus,
      options.translate("copyFailed", "Could not copy to the clipboard."),
    );
    return false;
  }
}

export function animateCopyConfirmation(button: any) {
  if (document.documentElement.dataset.theme === "retro") {
    if (!button?.animate) return;
    button
      .getAnimations()
      .find((animation: any) => animation.id === "emoji-copy-confirmation")
      ?.cancel();
    const animation = button.animate(
      [
        {
          transform: "translate(0, 0)",
          backgroundColor: "#000000",
          color: "#ffffff",
        },
        {
          transform: "translate(1px, 1px)",
          backgroundColor: "#55ffff",
          color: "#000000",
          offset: 0.45,
        },
        {
          transform: "translate(0, 0)",
          backgroundColor: "#000000",
          color: "#ffffff",
        },
      ],
      { duration: 160, easing: "steps(2, end)" },
    );
    animation.id = "emoji-copy-confirmation";
    return;
  }
  if (
    !button?.animate ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  button
    .getAnimations()
    .find((animation: any) => animation.id === "emoji-copy-confirmation")
    ?.cancel();
  const animation = button.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(0.9)", offset: 0.2 },
      {
        transform: "scale(1.05)",
        backgroundColor: "#15384d",
        boxShadow: "0 0 0 0.2rem rgb(127 216 255 / 35%)",
        offset: 0.62,
      },
      { transform: "scale(1)", boxShadow: "none" },
    ],
    { duration: 240, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  );
  animation.id = "emoji-copy-confirmation";
}
