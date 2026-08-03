import * as aria from "./aria.js";
import { selectAll, setLocale, setTitle } from "./document-ref.js";

enum I18nDataType {
  TextContent = "i18n",
  Placeholder = "i18nPlaceholder",
  AriaLabel = "i18nAriaLabel",
}

const i18n = { key: I18nDataType.TextContent, selector: "[data-i18n]" };
const i18nPlaceholder = {
  key: I18nDataType.Placeholder,
  selector: "[data-i18n-placeholder]",
};
const i18nAriaLabel = {
  key: I18nDataType.AriaLabel,
  selector: "[data-i18n-aria-label]",
};

type DatasetElement = Element & {
  dataset: {
    [key in I18nDataType]?: string;
  };
};
type TextContentElement = Element & {
  textContent: string;
  dataset: {
    [I18nDataType.TextContent]: string;
  };
};
type PlaceholderElement = Element & {
  placeholder: string;
  dataset: {
    [I18nDataType.Placeholder]: string;
  };
};
type AriaLabelElement = Element & {
  dataset: {
    [I18nDataType.AriaLabel]: string;
  };
};

const keyMap: Record<string, string> = {};

export const setTranslations = (
  locale: string,
  rtl: boolean,
  translations: Record<string, string>[] = [{}],
) => {
  const merged = Object.assign({}, ...translations) as Record<string, string>;
  setLocale(locale, rtl ? "rtl" : "ltr");
  for (const [key, value] of Object.entries(merged)) {
    keyMap[key] = value;
  }
  setTitle(translate("title", "Emoji Explorer"));
  applyTranslations();
};

export const translate = (key: string | undefined, fallback: string) =>
  keyMap[key ?? ""] ?? fallback;

const data = (el: DatasetElement, name: keyof DatasetElement["dataset"]) =>
  el.dataset[name];

export const applyTranslations = () => {
  selectAll<TextContentElement>(i18n.selector).forEach((el) => {
    el.textContent = translate(data(el, i18n.key), el.textContent);
  });
  selectAll<PlaceholderElement>(i18nPlaceholder.selector).forEach((el) => {
    el.placeholder = translate(data(el, i18nPlaceholder.key), el.placeholder);
  });
  selectAll<AriaLabelElement>(i18nAriaLabel.selector).forEach((el) => {
    aria.setLabel(el, translate(data(el, i18nAriaLabel.key), aria.label(el)));
  });
};
