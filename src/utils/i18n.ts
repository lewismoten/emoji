import * as doc from "./document.js";
import * as route from "../app/route.js";

import { pascalToDashed } from "./nameTransformers.js";

const KEY_I18N = "i18n";
const KEY_I18N_PLACEHOLDER = "i18nPlaceholder";
const KEY_I18N_ARIA_LABEL = "i18nAriaLabel";

type i18nKeys =
  typeof KEY_I18N | typeof KEY_I18N_PLACEHOLDER | typeof KEY_I18N_ARIA_LABEL;

const dataSelector = (key: i18nKeys) => `[data-${pascalToDashed(key)}]`;

type Dataset = Partial<Record<i18nKeys, string>>;

type DatasetElement = Element & {
  dataset: Dataset;
};
type TextContentElement = DatasetElement & {
  textContent: string;
  dataset: Dataset & {
    [KEY_I18N]: string;
  };
};
type PlaceholderElement = DatasetElement & {
  placeholder: string;
  dataset: Dataset & {
    [KEY_I18N_PLACEHOLDER]: string;
  };
};
type AriaLabelElement = DatasetElement & {
  dataset: Dataset & {
    [KEY_I18N_ARIA_LABEL]: string;
  };
};
const keyMap = new Map<string, string>();

export const getLocale = () => route.getLocale() ?? doc.getLocale();

export const setTranslations = (
  locale: string,
  rtl: boolean,
  translations: Record<string, string>[] = [{}],
) => {
  const merged = Object.assign({}, ...translations) as Record<string, string>;
  doc.setLocale(locale, rtl ? "rtl" : "ltr");
  keyMap.clear();
  for (const [key, value] of Object.entries(merged)) {
    keyMap.set(key, value);
  }
  doc.setTitle(translate("title", "Emoji Explorer"));
  applyTranslations();
};

export const translate = (key: string | undefined, fallback: string) =>
  key ? (keyMap.get(key) ?? fallback) : fallback;

const updateProp = <T extends DatasetElement, K extends keyof T & string>(
  el: T,
  name: K,
  dataKey: i18nKeys,
) => {
  const i18nKey = el.dataset[dataKey];
  el[name] = translate(i18nKey, String(el[name] ?? "")) as T[K];
};

const updateAttr = (
  el: Element & DatasetElement,
  name: string,
  dataKey: i18nKeys,
) => {
  const i18nKey = el.dataset[dataKey];
  el.setAttribute(name, translate(i18nKey, el.getAttribute(name) ?? ""));
};

export const applyTranslations = () => {
  doc.selectAllAndApply<TextContentElement>(dataSelector(KEY_I18N), (el) => {
    updateProp(el, "textContent", KEY_I18N);
  });
  doc.selectAllAndApply<PlaceholderElement>(
    dataSelector(KEY_I18N_PLACEHOLDER),
    (el) => {
      updateProp(el, "placeholder", KEY_I18N_PLACEHOLDER);
    },
  );
  doc.selectAllAndApply<AriaLabelElement>(
    dataSelector(KEY_I18N_ARIA_LABEL),
    (el) => {
      updateAttr(el, "aria-label", KEY_I18N_ARIA_LABEL);
    },
  );
};
