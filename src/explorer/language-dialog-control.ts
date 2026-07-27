import {
  createDialogHeading,
  createTextBlock,
  setPressedState,
} from "./dialog-control-helpers.js";

type SearchLocale = {
  locale: string;
  label: string;
  nativeLabel: string;
  rtl: boolean;
  file: string;
  baseLocale?: string;
};

export type LanguageDialogControl = {
  dialog: HTMLDialogElement;
  list: HTMLElement;
};

export type LanguagePickerControl = {
  button: HTMLButtonElement;
  flag: HTMLElement;
  label: HTMLElement;
};

export function createLanguagePickerControl(): LanguagePickerControl {
  const button = document.createElement("button");
  button.className = "language-picker";
  button.type = "button";
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-controls", "language-dialog");
  button.setAttribute(
    "aria-labelledby",
    "language-picker-accessible-label language-picker-current-label",
  );

  const accessibleLabel = createTextBlock(
    "span",
    "chooseLanguage",
    "Choose a search language",
  );
  accessibleLabel.id = "language-picker-accessible-label";
  accessibleLabel.className = "sr-only";

  const flag = document.createElement("span");
  flag.className = "language-picker-flag";
  flag.setAttribute("aria-hidden", "true");
  flag.textContent = "🌐";

  const label = createTextBlock("span", "language", "Language");
  label.id = "language-picker-current-label";
  label.className = "language-picker-label";

  button.append(accessibleLabel, flag, label);
  return { button, flag, label };
}

export function createLanguageDialogControl(): LanguageDialogControl {
  const dialog = document.createElement("dialog");
  dialog.className = "language-dialog";
  dialog.id = "language-dialog";
  dialog.setAttribute("aria-labelledby", "language-title");

  const heading = createDialogHeading({
    titleId: "language-title",
    titleKey: "chooseLanguage",
    title: "Choose a search language",
    eyebrowKey: "localizedSearch",
    eyebrow: "Localized search",
  });

  const description = createTextBlock(
    "p",
    "chooseLanguageDescription",
    "Choose a language for emoji search.",
  );
  description.className = "dialog-description";

  const list = document.createElement("div");
  list.className = "language-list";
  list.setAttribute("role", "list");

  dialog.append(heading, description, list);
  return { dialog, list };
}

export function buildLanguageOption(options: {
  flag: string;
  label: string;
  href: string;
  selected: boolean;
  onSelectLanguageLink: (
    event: MouseEvent,
    locale: string,
    href: string,
  ) => Promise<void>;
  locale: string;
}) {
  const option = document.createElement("a");
  option.href = options.href;
  option.className = "language-option";
  setPressedState(option, options.selected);

  const flag = document.createElement("span");
  flag.className = "language-option-flag";
  flag.setAttribute("aria-hidden", "true");
  flag.textContent = options.flag;

  const label = document.createElement("span");
  label.className = "language-option-label";
  label.textContent = options.label;

  option.append(flag, label);
  option.addEventListener("click", (event) =>
    options.onSelectLanguageLink(event, options.locale, option.href),
  );
  return option;
}

export function getLocalizedLanguageName(
  locale: SearchLocale,
  selectedSearchLocale: string,
) {
  const uiLocale = document.documentElement.lang || "en";
  const localizedLabel =
    new Intl.DisplayNames([uiLocale], { type: "language" }).of(locale.locale) ??
    locale.label;
  return locale.locale === selectedSearchLocale ||
    localizedLabel === locale.nativeLabel
    ? localizedLabel
    : `${localizedLabel} (${locale.nativeLabel})`;
}
