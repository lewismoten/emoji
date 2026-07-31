import {
  buildLanguageOption,
  getLocalizedLanguageName,
} from "./language-dialog-control.js";

type SearchLocale = {
  locale: string;
  label: string;
  nativeLabel: string;
  rtl: boolean;
  file: string;
  baseLocale?: string;
};

type SearchLocalePack = {
  annotations?: Record<string, string[]>;
  labels?: Record<string, string>;
  subgroups?: Record<string, string>;
};

type RenderSearchLanguageOptions = {
  languageFlags: Record<string, string>;
  languageList?: HTMLElement;
  searchLocales: SearchLocale[];
  selectedSearchLocale: string;
  translate: (key: string, fallback: string) => string;
  onSelectLanguageLink: (
    event: MouseEvent,
    locale: string,
    href: string,
  ) => Promise<void>;
};

export function renderSearchLanguages({
  languageFlags,
  languageList,
  searchLocales,
  selectedSearchLocale,
  translate,
  onSelectLanguageLink,
}: RenderSearchLanguageOptions) {
  const routeLocale =
    window.location.pathname.match(
      /index\.([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)\.html$/,
    )?.[1] ?? "";
  const activeLocale =
    selectedSearchLocale ||
    (searchLocales.some((locale) => locale.locale === routeLocale)
      ? routeLocale
      : "");
  if (!languageList) return;
  languageList.replaceChildren();
  const navigationParams = new URLSearchParams(window.location.search);
  navigationParams.delete("panel");
  navigationParams.delete("emoji");
  navigationParams.delete("emojiMode");
  const navigationQuery = navigationParams.toString();
  const navigationSearch = navigationQuery ? `?${navigationQuery}` : "";
  languageList.appendChild(
    buildLanguageOption({
      flag: "🌐",
      href: `./${navigationSearch}`,
      label: translate("noLanguagePack", "No language pack"),
      locale: "",
      onSelectLanguageLink,
      selected: activeLocale === "",
    }),
  );

  searchLocales.forEach((locale) => {
    const flag = languageFlags[locale.locale] ?? "🌐";
    languageList.appendChild(
      buildLanguageOption({
        flag,
        href: `./index.${locale.locale}.html${navigationSearch}`,
        label: getLocalizedLanguageName(locale, activeLocale),
        locale: locale.locale,
        onSelectLanguageLink,
        selected: locale.locale === activeLocale,
      }),
    );
  });
}

export async function selectLanguageLink(
  event: MouseEvent,
  locale: string,
  href: string,
  setSearchLanguage: (locale: string) => Promise<void>,
) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  await setSearchLanguage(locale);
  const baseUrl =
    window.location.href ??
    document.baseURI ??
    `http://localhost${window.location.pathname ?? "/"}${window.location.search ?? ""}${window.location.hash ?? ""}`;
  const target = new URL(href, baseUrl);
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.history.pushState(
    { locale },
    "",
    `${target.pathname}${target.search}${target.hash}`,
  );
}

type SetSearchLanguageOptions = {
  requestedLocale: string;
  searchLoadId: number;
  searchLocales: SearchLocale[];
  languagePicker?: HTMLButtonElement;
  languagePickerFlag?: HTMLElement;
  languagePickerLabel?: HTMLElement;
  languageFlags: Record<string, string>;
  translate: (key: string, fallback: string) => string;
  loadUiTranslations: (locale: string, rtl?: boolean) => Promise<void>;
  updateWebAppManifest: (locale?: string) => void;
  closeLanguageDialog: () => void;
  restoreLanguageParentPanel?: () => void;
  saveExplorerPreference: (key: string, value: string) => void;
  refreshLocalizedLabels: () => void;
  updateUi?: boolean;
};

type SetSearchLanguageResult = {
  loadId: number;
  selectedSearchLocale: string;
  searchAnnotations: Record<string, string[]>;
  searchLabels: Record<string, string>;
  searchSubgroupLabels: Record<string, string>;
};

export async function setSearchLanguage({
  requestedLocale,
  searchLoadId,
  searchLocales,
  languagePicker,
  languagePickerFlag,
  languagePickerLabel,
  languageFlags,
  translate,
  loadUiTranslations,
  updateWebAppManifest,
  closeLanguageDialog,
  restoreLanguageParentPanel,
  saveExplorerPreference,
  refreshLocalizedLabels,
  updateUi = true,
}: SetSearchLanguageOptions): Promise<SetSearchLanguageResult> {
  const fetchJsonWithFallback = async (primary: string, fallback: string) => {
    const response = await fetch(primary);
    if (response.ok) return response.json();
    const secondary = await fetch(fallback);
    if (!secondary.ok) {
      throw new Error(`Unable to load ${primary} or ${fallback}`);
    }
    return secondary.json();
  };
  const loadId = searchLoadId;
  if (!requestedLocale) {
    updateWebAppManifest();
    if (updateUi) {
      if (languagePickerFlag) languagePickerFlag.textContent = "🌐";
      if (languagePickerLabel) {
        languagePickerLabel.textContent = translate(
          "languageNotLoaded",
          "Language not loaded",
        );
      }
      closeLanguageDialog();
      restoreLanguageParentPanel?.();
    }
    await loadUiTranslations("en");
    saveExplorerPreference("locale", "");
    return {
      loadId,
      selectedSearchLocale: "",
      searchAnnotations: {},
      searchLabels: {},
      searchSubgroupLabels: {},
    };
  }

  const locale = searchLocales.find(
    (entry) => entry.locale === requestedLocale,
  );
  if (!locale) {
    return {
      loadId,
      selectedSearchLocale: "",
      searchAnnotations: {},
      searchLabels: {},
      searchSubgroupLabels: {},
    };
  }
  updateWebAppManifest(locale.locale);
  if (updateUi) {
    if (languagePicker) languagePicker.disabled = true;
    if (languagePickerLabel) {
      languagePickerLabel.textContent = translate(
        "loadingLanguage",
        "Loading language…",
      );
    }
  }
  try {
    if (updateUi) {
      closeLanguageDialog();
      restoreLanguageParentPanel?.();
    }
    const packs = (await Promise.all([
      ...(locale.baseLocale
        ? [
            fetchJsonWithFallback(
              `locales/${locale.baseLocale}.json`,
              `src/data/locales/${locale.baseLocale}.json`,
            ),
          ]
        : []),
      fetchJsonWithFallback(
        `locales/${locale.file}`,
        `src/data/locales/${locale.file}`,
      ),
    ])) as SearchLocalePack[];
    const searchAnnotations = Object.assign(
      {},
      ...packs.map((pack) => pack.annotations ?? {}),
    );
    const searchLabels = Object.assign(
      {},
      ...packs.map((pack) => pack.labels ?? {}),
    );
    const searchSubgroupLabels = Object.assign(
      {},
      ...packs.map((pack) => pack.subgroups ?? {}),
    );
    await loadUiTranslations(locale.locale, locale.rtl);
    if (updateUi) {
      if (languagePickerFlag) {
        languagePickerFlag.textContent = languageFlags[locale.locale] ?? "🌐";
      }
      if (languagePickerLabel) {
        languagePickerLabel.textContent = locale.nativeLabel;
      }
    }
    saveExplorerPreference("locale", locale.locale);
    return {
      loadId,
      selectedSearchLocale: locale.locale,
      searchAnnotations,
      searchLabels,
      searchSubgroupLabels,
    };
  } catch (error) {
    console.warn(`Search language ${requestedLocale} unavailable`, error);
    if (updateUi) {
      if (languagePickerFlag) languagePickerFlag.textContent = "🌐";
      if (languagePickerLabel) {
        languagePickerLabel.textContent = translate(
          "languageNotLoaded",
          "Language not loaded",
        );
      }
    }
    return {
      loadId,
      selectedSearchLocale: "",
      searchAnnotations: {},
      searchLabels: {},
      searchSubgroupLabels: {},
    };
  } finally {
    if (updateUi && languagePicker) languagePicker.disabled = false;
  }
}
