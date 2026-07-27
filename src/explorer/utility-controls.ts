import {
  createLanguageDialogControl,
  createLanguagePickerControl,
} from "./language-dialog-control.js";
import { createHelpDialogControl } from "./help-settings-control.js";
import { ensurePickerControls } from "./utility-picker-controls.js";
import {
  emojiCompositionMarkup,
  helpPickerMarkup,
  savedDialogMarkup,
  savedPickerMarkup,
} from "./utility-control-markup.js";

type MinimalElement = {
  append(...nodes: unknown[]): void;
  before(...nodes: unknown[]): void;
  childNodes: unknown[];
  className: string;
  closest?(selector: string): MinimalElement | null;
  dataset: Record<string, string | undefined>;
  innerHTML: string;
  insertAdjacentHTML(position: InsertPosition, text: string): void;
  prepend(...nodes: unknown[]): void;
  querySelector(selector: string): MinimalElement | null;
  remove(): void;
  replaceWith(...nodes: unknown[]): void;
  setAttribute(name: string, value: string): void;
  hidden?: boolean;
  textContent: string | null;
  title?: string;
  type?: string;
};

declare const document: {
  createElement(tagName: string): MinimalElement;
  querySelector(selector: string): MinimalElement | null;
};

type InsertPosition = "beforebegin" | "afterbegin" | "beforeend" | "afterend";

declare const window: {
  matchMedia(query: string): { matches: boolean };
};

export function positionFavoriteButton() {
  const favoriteButton = document.querySelector(
    ".example-dialog .toggle-favorite",
  );
  const dialogTitleRow = document.querySelector(
    ".example-dialog .dialog-title-row",
  );
  const dialogControls = document.querySelector(
    ".example-dialog .dialog-controls",
  );
  if (!favoriteButton || !dialogTitleRow || !dialogControls) return;
  if (window.matchMedia("(max-width: 560px)").matches) {
    dialogControls.querySelector("form")?.before(favoriteButton);
  } else {
    dialogTitleRow.prepend(favoriteButton);
  }
}

export function ensureUtilityControls() {
  const searchControls = document.querySelector(".search-controls");
  const fontComparison = document.querySelector(".pixel-comparison");
  if (fontComparison && !fontComparison.querySelector(".emoji-font-choice")) {
    fontComparison.setAttribute("role", "group");
    fontComparison.dataset.i18nAriaLabel = "emojiStyle";
    fontComparison.setAttribute("aria-label", "Emoji style");
    Array.from(fontComparison.childNodes).forEach((preview, index) => {
      if (!preview || typeof preview !== "object") return;
      const button = document.createElement("button");
      const font = index === 0 ? "system" : "pixel";
      button.className = `emoji-font-choice emoji-font-choice-${font}`;
      button.type = "button";
      button.dataset.emojiFont = font;
      button.setAttribute("aria-pressed", String(font === "pixel"));
      button.append(...(preview as MinimalElement).childNodes);
      (preview as MinimalElement).replaceWith(button);
    });
  }
  if (searchControls && !searchControls.querySelector(".saved-picker")) {
    searchControls.insertAdjacentHTML("beforeend", savedPickerMarkup);
  }
  searchControls?.querySelector(".pixel-font-toggle")?.remove();
  if (searchControls && !searchControls.querySelector(".help-picker")) {
    searchControls.insertAdjacentHTML("beforeend", helpPickerMarkup);
  }
  ensurePickerControls();

  const dialogTitle = document.querySelector(
    ".example-dialog .dialog-heading > div:first-child",
  );
  let dialogTitleRow = dialogTitle?.querySelector(".dialog-title-row");
  if (dialogTitle && !dialogTitleRow) {
    dialogTitleRow = document.createElement("div");
    dialogTitleRow.className = "dialog-title-row";
    const title = dialogTitle.querySelector("h2");
    title?.before(dialogTitleRow);
    if (title) dialogTitleRow.append(title);
  }
  let favoriteButton = document.querySelector(
    ".example-dialog .toggle-favorite",
  );
  const dialogControls = document.querySelector(
    ".example-dialog .dialog-controls",
  );
  if (dialogControls && !favoriteButton) {
    favoriteButton = document.createElement("button");
    favoriteButton.className = "toggle-favorite";
    favoriteButton.type = "button";
    favoriteButton.setAttribute("aria-pressed", "false");
    favoriteButton.dataset.favoriteState = "off";
    favoriteButton.innerHTML =
      '<span class="modifier-emoji favorite-glyph" aria-hidden="true">☆</span>';
    dialogControls.querySelector("form")?.before(favoriteButton);
  }
  if (dialogControls && favoriteButton) {
    favoriteButton.querySelector(".toggle-favorite-label")?.remove();
    favoriteButton.dataset.i18nAriaLabel = "addFavorite";
    favoriteButton.setAttribute("aria-label", "Add favorite");
    favoriteButton.title = "Add favorite";
    positionFavoriteButton();
  }
  const dialogDetails = document.querySelector(
    ".example-dialog .emoji-dialog-details",
  );
  if (
    dialogDetails &&
    !document.querySelector(".example-dialog .emoji-composition")
  ) {
    dialogDetails.insertAdjacentHTML("afterend", emojiCompositionMarkup);
  }
  const composition = document.querySelector(
    ".example-dialog .emoji-composition",
  );
  if (composition && !composition.querySelector(".emoji-composition-heading")) {
    const heading = document.createElement("div");
    const title = composition.querySelector("h3");
    heading.className = "emoji-composition-heading";
    title?.before(heading);
    if (title) heading.append(title);
  }
  const compositionHeading = composition?.querySelector(
    ".emoji-composition-heading",
  );
  if (
    compositionHeading &&
    !compositionHeading.querySelector(".emoji-composition-mode")
  ) {
    const mode = document.createElement("button");
    mode.className = "emoji-composition-mode";
    mode.type = "button";
    mode.hidden = true;
    mode.setAttribute("aria-pressed", "false");
    mode.textContent = "Show full sequence";
    compositionHeading.append(mode);
  }

  const main = document.querySelector("main");
  if (main && !document.querySelector(".saved-dialog")) {
    main.insertAdjacentHTML("beforeend", savedDialogMarkup);
  }
  if (main && !document.querySelector(".language-dialog")) {
    const languageDialogControl = createLanguageDialogControl();
    main.append(languageDialogControl.dialog);
  }
  let helpDialogControl:
    | ReturnType<typeof createHelpDialogControl>
    | undefined;
  if (main && !document.querySelector(".help-dialog")) {
    helpDialogControl = createHelpDialogControl();
    main.append(helpDialogControl.element);
  }
  let languagePicker = document.querySelector(".language-picker");
  if (!languagePicker && helpDialogControl) {
    const languagePickerControl = createLanguagePickerControl();
    languagePicker = languagePickerControl.button as unknown as MinimalElement;
  }
  if (helpDialogControl && languagePicker) {
    helpDialogControl.mountLanguagePicker(languagePicker as unknown as HTMLElement);
  } else {
    const helpLanguageControl = document.querySelector(
      ".help-dialog .help-language-control",
    );
    if (helpLanguageControl && languagePicker) {
      helpLanguageControl.append(languagePicker);
    }
  }
}
