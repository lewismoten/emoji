import {
  createDialogHeading,
  createTextBlock,
  setPressedState,
} from "../dialog/dialog-control-helpers.js";
import { LanguagePickerControl as SearchLanguagePickerButtonControl } from "../../controls/pickers/language-picker.js";

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

export type LanguagePickerParts = {
  button: HTMLButtonElement;
  flag: HTMLElement;
  label: HTMLElement;
};

export function createLanguagePickerControl(): LanguagePickerParts {
  const button = SearchLanguagePickerButtonControl.create({
    accessibleLabel: "Choose a search language",
    accessibleLabelId: "language-picker-accessible-label",
    controlsId: "language-dialog",
    flag: "🌐",
    label: "Language",
    labelId: "language-picker-current-label",
  }) as HTMLButtonElement;
  const flag = button.querySelector(".language-picker-flag") as HTMLElement;
  const label = button.querySelector(".language-picker-label") as HTMLElement;
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
  list.setAttribute("role", "radiogroup");
  list.setAttribute("aria-labelledby", "language-title");

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
  const option = document.createElement("label");
  option.className = "language-option";
  option.setAttribute("role", "radio");
  option.setAttribute("aria-checked", String(options.selected));
  option.tabIndex = options.selected ? 0 : -1;
  setPressedState(option, options.selected);

  const input = document.createElement("input");
  input.className = "language-option-input";
  input.type = "radio";
  input.name = "language-choice";
  input.value = options.locale;
  input.checked = options.selected;
  input.tabIndex = -1;

  const flag = document.createElement("span");
  flag.className = "language-option-flag";
  flag.setAttribute("aria-hidden", "true");
  flag.textContent = options.flag;

  const label = document.createElement("span");
  label.className = "language-option-label";
  label.textContent = options.label;

  option.append(input, flag, label);
  option.addEventListener("click", (event) =>
    options.onSelectLanguageLink(event, options.locale, options.href),
  );
  return option;
}

export function getLocalizedLanguageName(
  locale: SearchLocale,
  selectedSearchLocale: string,
) {
  const uiLocale = document.documentElement.lang || "en";
  let localizedLabel = locale.label;
  try {
    localizedLabel =
      new Intl.DisplayNames([uiLocale], { type: "language" }).of(
        locale.locale,
      ) ??
      new Intl.DisplayNames([uiLocale], { type: "language" }).of(
        locale.baseLocale ?? locale.locale.split("-")[0],
      ) ??
      locale.label;
  } catch {
    localizedLabel = locale.label;
  }
  return locale.locale === selectedSearchLocale ||
    localizedLabel === locale.nativeLabel
    ? localizedLabel
    : `${localizedLabel} (${locale.nativeLabel})`;
}
