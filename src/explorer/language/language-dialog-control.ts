import { setPressedState } from "../dialog/dialog-control-helpers.js";
import { createDialogControlParts } from "../dialog/parts/dialog-control-parts.js";
import { LanguageOptionControl } from "../../controls/pickers/language-option.js";

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

export async function createLanguagePickerControl(): Promise<LanguagePickerParts> {
  const { LanguagePickerControl: SearchLanguagePickerButtonControl } =
    await import("../../controls/pickers/language-picker.js");
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

export async function createLanguageDialogControl(): Promise<LanguageDialogControl> {
  const { LanguageDialogControl: SearchLanguageDialogControl } = await import(
    "../../controls/dialog/content/language-dialog.js"
  );
  const dialog = SearchLanguageDialogControl.create() as HTMLDialogElement;
  return createDialogControlParts(dialog, {
    list: ".language-list",
  });
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
  const option = LanguageOptionControl.create({
    flag: options.flag,
    href: options.href,
    label: options.label,
    locale: options.locale,
    selected: options.selected,
  }) as HTMLLabelElement;
  setPressedState(option, options.selected);
  option.addEventListener("click", (event) =>
    options.onSelectLanguageLink(event, options.locale, options.href),
  );
  return option;
}

const localizedNewspeakLabels: Record<string, string> = {
  ar: "لغة الأخبار",
  en: "Newspeak",
  es: "Neohabla",
  hi: "न्यूस्पीक",
  zh: "新话",
};

export function getLocalizedLanguageName(
  locale: SearchLocale,
  selectedSearchLocale: string,
) {
  const uiLocale = document.documentElement.lang || "en";
  if (uiLocale === "en-x-newspeak") {
    if (locale.locale === "en-x-newspeak") return "newspeak";
    const label = locale.locale.startsWith("en") ? "oldspeak" : "other oldspeak";
    return locale.locale === selectedSearchLocale ||
      label === locale.nativeLabel
      ? label
      : `${label} (${locale.nativeLabel})`;
  }
  if (locale.locale === "en-x-newspeak") {
    const uiBaseLocale = uiLocale.toLowerCase().split("-")[0];
    const localizedLabel =
      localizedNewspeakLabels[uiBaseLocale] ?? localizedNewspeakLabels.en;
    return locale.locale === selectedSearchLocale ||
      localizedLabel === locale.nativeLabel
      ? localizedLabel
      : `${localizedLabel} (${locale.nativeLabel})`;
  }
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
