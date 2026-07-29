import { DialogNavigateButtonControl } from "../../controls/dialog/dialog-navigate-button.js";

export function upgradeEmojiDialog(options: {
  ensureImportExamples: (dialog: HTMLElement) => void;
  exampleDialog: HTMLElement;
}) {
  removeLegacyDialogElements();
  options.ensureImportExamples(options.exampleDialog);
  ensureCodeDialogView(options.exampleDialog);
  ensureCompactCopyLabels(options.exampleDialog);
  ensureRenderingDiagnostic(options.exampleDialog);
  const dialogControls =
    options.exampleDialog.querySelector(".dialog-controls");
  if (dialogControls && !dialogControls.querySelector(".emoji-parent")) {
    const parent = DialogNavigateButtonControl.create({
      ariaLabel: "Back to parent emoji",
      buttonClassName: "dialog-navigate emoji-parent",
      hidden: true,
      text: "↩",
    });
    dialogControls.prepend(parent);
  }
  const eyebrow = options.exampleDialog.querySelector<HTMLElement>(
    ".emoji-dialog-eyebrow",
  );
  if (eyebrow) {
    eyebrow.dataset.i18n = "emojiDetails";
    eyebrow.textContent = "Emoji details";
  }
  upgradeEmojiPreview(options.exampleDialog);
  if (!options.exampleDialog.querySelector(".copy-status")) {
    const status = document.createElement("div");
    status.className = "copy-status sr-only";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    options.exampleDialog.querySelector(".dialog-heading")?.after(status);
  }
}

export function removeLegacyDialogElements() {
  const dialog = document.querySelector(".example-dialog");
  dialog?.querySelector('[data-i18n="copiedDescription"]')?.remove();
  dialog?.querySelector(".example-link")?.remove();
  dialog?.querySelector('.emoji-copy-actions [data-copy="emoji"]')?.remove();
  dialog?.querySelector(".emoji-code-points")?.closest("div")?.remove();
  dialog
    ?.querySelector('.emoji-metadata [data-i18n="codePoints"]')
    ?.closest("div")
    ?.remove();
}

function upgradeEmojiPreview(dialog: HTMLElement) {
  let preview = dialog.querySelector<HTMLElement>(".emoji-preview");
  if (preview?.tagName !== "BUTTON") {
    const button = document.createElement("button");
    button.className = "emoji-preview";
    button.type = "button";
    button.textContent = preview?.textContent ?? "🍻";
    preview?.replaceWith(button);
    preview = button;
  }
  if (!preview) return;
  const previewValue =
    preview.querySelector(".emoji-preview-glyph")?.textContent ??
    preview.textContent?.trim() ??
    "🍻";
  let glyph = preview.querySelector<HTMLElement>(".emoji-preview-glyph");
  let copyLabel = preview.querySelector<HTMLElement>(
    ".emoji-preview-copy-label",
  );
  if (!glyph || !copyLabel) {
    glyph = document.createElement("span");
    glyph.className = "emoji-preview-glyph";
    glyph.textContent = previewValue;
    copyLabel = document.createElement("span");
    copyLabel.className = "emoji-preview-copy-label";
    copyLabel.dataset.i18n = "copy";
    copyLabel.textContent = "Copy";
    preview.replaceChildren(glyph, copyLabel);
  }
  preview.removeAttribute("aria-hidden");
  preview.dataset.copy = "emoji";
  preview.dataset.i18nAriaLabel = "copyEmoji";
  preview.setAttribute("aria-label", "Copy emoji");
}

function ensureRenderingDiagnostic(dialog: HTMLElement) {
  const details = dialog.querySelector(".emoji-dialog-details");
  let section = dialog.querySelector<HTMLElement>(".rendering-diagnostic");
  if (!section && details) {
    section = document.createElement("section");
    section.className = "rendering-diagnostic developer-only";
    section.hidden = true;
    details.after(section);
  }
  if (
    section &&
    (!section.querySelector(".system-render-glyph") ||
      !section.querySelector(".pixel-render-glyph") ||
      !section.querySelector(".rendering-result"))
  ) {
    section.setAttribute("aria-labelledby", "rendering-diagnostic-title");
    section.innerHTML = `
      <h3 id="rendering-diagnostic-title" data-i18n="deviceRendering">Rendering on this device</h3>
      <div class="rendering-comparison">
        <div><span data-i18n="systemRendering">System rendering</span><b class="system-render-glyph"></b></div>
        <div><span data-i18n="pixelRendering">Pixel rendering</span><b class="pixel-render-glyph"></b></div>
      </div>
      <p class="rendering-result"></p>
    `;
  }
  let invitation = dialog.querySelector<HTMLElement>(
    ".pixel-design-invitation",
  );
  if (!invitation && section) {
    invitation = document.createElement("section");
    invitation.className = "pixel-design-invitation developer-only full-developer-only";
    invitation.hidden = true;
    invitation.innerHTML = `
      <strong data-i18n="pixelDesignMissing">This emoji has no pixel design yet.</strong>
      <button class="show-pixel-editor" type="button" data-i18n="createPixelDesign">Create the 12×12 version</button>
    `;
    section.after(invitation);
  }
}

function ensureCodeDialogView(dialog: HTMLElement) {
  const actions = dialog.querySelector(".emoji-copy-actions");
  addAction(actions, "show-emoji-code developer-only", "viewCode", "View code");
  addAction(
    actions,
    "show-pixel-editor developer-only full-developer-only",
    "editPixelArt",
    "Edit pixel art",
  );
  const code = dialog.querySelector(".code");
  if (!code) return;
  let codeView = code.closest<HTMLElement>(".emoji-code-view");
  if (!codeView) {
    codeView = document.createElement("div");
    codeView.className = "emoji-code-view";
    codeView.hidden = true;
    code.replaceWith(codeView);
    codeView.append(code);
  }
  let toolbar = codeView.querySelector<HTMLElement>(".emoji-code-toolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.className = "emoji-code-toolbar";
    codeView.prepend(toolbar);
  }
  addCopyAction(toolbar, "code", "copyCode", "Copy code");
  addCopyAction(toolbar, "link", "copyLink", "Copy link");
  const codeCopy = toolbar.querySelector<HTMLElement>('[data-copy="code"]');
  const codeLink = toolbar.querySelector<HTMLElement>('[data-copy="link"]');
  if (codeCopy) {
    codeCopy.className = "emoji-code-copy";
    codeCopy.innerHTML =
      '<span class="copy-action-long" data-i18n="copy">Copy</span><span class="copy-action-short" data-i18n="copy">Copy</span>';
  }
  if (codeLink) {
    codeLink.className = "emoji-code-link";
    codeLink.innerHTML =
      '<span class="copy-action-long" aria-hidden="true">🔗</span><span class="copy-action-short" aria-hidden="true">🔗</span>';
  }
  if (codeLink && codeCopy) toolbar.append(codeLink, codeCopy);
  code.after(toolbar);
  if (actions && !actions.querySelector('[data-copy="link"]')) {
    const copyLink = addCopyAction(actions, "link", "copyLink", "Copy link");
    actions.querySelector(".show-emoji-code")?.before(copyLink);
  }
  actions
    ?.querySelectorAll(
      '[data-copy="key"], [data-copy="escape"], [data-copy="codePoints"], .show-emoji-code, .show-pixel-editor',
    )
    .forEach((element) => element.classList.add("developer-only"));
  dialog
    .querySelectorAll(
      ".rendering-diagnostic, .pixel-design-invitation, .emoji-composition, .emoji-metadata > div:has(.emoji-sequence-type), .emoji-metadata > div:has(.emoji-status)",
    )
    .forEach((element) => element.classList.add("developer-only"));
}

function addAction(
  actions: Element | null,
  className: string,
  key: string,
  text: string,
) {
  if (!actions || actions.querySelector(`.${className.split(" ")[0]}`)) return;
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.dataset.i18n = key;
  button.textContent = text;
  actions.append(button);
}

function addCopyAction(
  parent: Element,
  copy: string,
  key: string,
  text: string,
) {
  const existing = parent.querySelector<HTMLElement>(`[data-copy="${copy}"]`);
  if (existing) return existing;
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.copy = copy;
  button.dataset.i18n = key;
  button.textContent = text;
  parent.append(button);
  return button;
}

function ensureCompactCopyLabels(dialog: HTMLElement) {
  const definitions: Record<string, string[]> = {
    key: ["copyKey", "Copy key", "keyShort", "Key"],
    escape: ["copyEscape", "Copy escape", "escapeShort", "Escape"],
    codePoints: [
      "copyCodePoints",
      "Copy code points",
      "codePoints",
      "Code points",
    ],
    code: ["copyCode", "Copy code", "codeShort", "Code"],
    link: ["copyLink", "Copy link", "linkShort", "Link"],
  };
  dialog
    .querySelectorAll<HTMLElement>("[data-copy]:not(.emoji-preview)")
    .forEach((button) => {
      const definition = definitions[button.dataset.copy ?? ""];
      if (!definition) return;
      const [longKey, longFallback, shortKey, shortFallback] = definition;
      if (!button.querySelector(".copy-action-long")) {
        const longLabel = document.createElement("span");
        const shortLabel = document.createElement("span");
        longLabel.className = "copy-action-long";
        longLabel.dataset.i18n = longKey;
        longLabel.textContent = longFallback;
        shortLabel.className = "copy-action-short";
        shortLabel.dataset.i18n = shortKey;
        shortLabel.textContent = shortFallback;
        button.replaceChildren(longLabel, shortLabel);
      }
      button.dataset.i18nAriaLabel = longKey;
      button.setAttribute("aria-label", longFallback);
    });
}
