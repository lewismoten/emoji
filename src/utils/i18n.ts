import { selectAllAndApply, setLocale, setTitle } from "./document-ref.js";

const KEY_I18N = "i18n";
const KEY_I18N_PLACEHOLDER = "i18nPlaceholder";
const KEY_I18N_ARIA_LABEL = "i18nAriaLabel";

enum i18nKeys {
  i18n = KEY_I18N,
  i18nPlaceholder = KEY_I18N_PLACEHOLDER,
  i18nAriaLabel = KEY_I18N_ARIA_LABEL,
}

const pascalToDashed = (str: string) =>
  str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const dataKey = (key: keyof typeof i18nKeys) => `data-${pascalToDashed(key)}`;
const selector = (key: keyof typeof i18nKeys) => `[${dataKey(key)}]`;

type DatasetElement = Element & {
  dataset: {
    [key in i18nKeys]?: string;
  };
};
type TextContentElement = Element & {
  textContent: string;
  dataset: {
    [i18nKeys.i18n]: string;
  };
};
type PlaceholderElement = Element & {
  placeholder: string;
  dataset: {
    [i18nKeys.i18nPlaceholder]: string;
  };
};
type AriaLabelElement = Element & {
  dataset: {
    [i18nKeys.i18nAriaLabel]: string;
  };
};

const keyMap = new Map<string, string>();

export const setTranslations = (
  locale: string,
  rtl: boolean,
  translations: Record<string, string>[] = [{}],
) => {
  const merged = Object.assign({}, ...translations) as Record<string, string>;
  setLocale(locale, rtl ? "rtl" : "ltr");
  keyMap.clear();
  for (const [key, value] of Object.entries(merged)) {
    keyMap.set(key, value);
  }
  setTitle(translate("title", "Emoji Explorer"));
  applyTranslations();
};

export const translate = (key: string | undefined, fallback: string) =>
  key ? (keyMap.get(key) ?? fallback) : fallback;

const data = (el: DatasetElement, name: keyof typeof i18nKeys) =>
  el.dataset[name];

const translateElement = (
  el: DatasetElement,
  attrName: string,
  i18nDataKey: keyof typeof i18nKeys,
) => {
  const i18nKey = data(el, i18nDataKey);
  el.setAttribute(
    attrName,
    translate(i18nKey, el.getAttribute(attrName) ?? ""),
  );
};

export const applyTranslations = () => {
  selectAllAndApply<TextContentElement>(selector(KEY_I18N), (el) => {
    translateElement(el, "textContent", KEY_I18N);
  });
  selectAllAndApply<PlaceholderElement>(
    selector(KEY_I18N_PLACEHOLDER),
    (el) => {
      translateElement(el, "placeholder", KEY_I18N_PLACEHOLDER);
    },
  );
  selectAllAndApply<AriaLabelElement>(selector(KEY_I18N_ARIA_LABEL), (el) => {
    translateElement(el, "aria-label", KEY_I18N_ARIA_LABEL);
  });
};
