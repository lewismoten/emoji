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
  languageList: HTMLElement;
  searchLocales: SearchLocale[];
  selectedSearchLocale: string;
  translate: (key: string, fallback: string) => string;
  onSelectLanguageLink: (
    event: MouseEvent,
    locale: string,
    href: string
  ) => Promise<void>;
};

export function renderSearchLanguages({
  languageFlags,
  languageList,
  searchLocales,
  selectedSearchLocale,
  translate,
  onSelectLanguageLink
}: RenderSearchLanguageOptions) {
  languageList.replaceChildren();
  const navigationParams = new URLSearchParams(window.location.search);
  navigationParams.delete('panel');
  navigationParams.delete('emoji');
  navigationParams.delete('emojiMode');
  const navigationQuery = navigationParams.toString();
  const navigationSearch = navigationQuery ? `?${navigationQuery}` : '';
  const noLanguage = document.createElement('a');
  noLanguage.href = `./${navigationSearch}`;
  noLanguage.className = 'language-option';
  noLanguage.classList.toggle('is-selected', selectedSearchLocale === '');
  noLanguage.setAttribute('aria-pressed', String(selectedSearchLocale === ''));
  noLanguage.innerHTML = `<span class="language-option-flag" aria-hidden="true">🌐</span><span class="language-option-label">${translate('noLanguagePack', 'No language pack')}</span>`;
  noLanguage.addEventListener('click', event =>
    onSelectLanguageLink(event, '', noLanguage.href)
  );
  languageList.appendChild(noLanguage);

  searchLocales.forEach(locale => {
    const option = document.createElement('a');
    const flag = languageFlags[locale.locale] ?? '🌐';
    option.href = `./index.${locale.locale}.html${navigationSearch}`;
    option.className = 'language-option';
    option.classList.toggle(
      'is-selected',
      locale.locale === selectedSearchLocale
    );
    option.setAttribute(
      'aria-pressed',
      String(locale.locale === selectedSearchLocale)
    );
    const uiLocale = document.documentElement.lang || 'en';
    const localizedLabel =
      new Intl.DisplayNames([uiLocale], { type: 'language' }).of(
        locale.locale
      ) ?? locale.label;
    const label =
      locale.locale === selectedSearchLocale ||
      localizedLabel === locale.nativeLabel
        ? localizedLabel
        : `${localizedLabel} (${locale.nativeLabel})`;
    option.innerHTML = `<span class="language-option-flag" aria-hidden="true">${flag}</span><span class="language-option-label">${label}</span>`;
    option.addEventListener('click', event =>
      onSelectLanguageLink(event, locale.locale, option.href)
    );
    languageList.appendChild(option);
  });
}

export async function selectLanguageLink(
  event: MouseEvent,
  locale: string,
  href: string,
  setSearchLanguage: (locale: string) => Promise<void>
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
  window.history.pushState({ locale }, '', href);
}

type SetSearchLanguageOptions = {
  requestedLocale: string;
  searchLoadId: number;
  searchLocales: SearchLocale[];
  languagePicker: HTMLButtonElement;
  languagePickerFlag: HTMLElement;
  languagePickerLabel: HTMLElement;
  languageFlags: Record<string, string>;
  translate: (key: string, fallback: string) => string;
  loadUiTranslations: (locale: string, rtl?: boolean) => Promise<void>;
  updateWebAppManifest: (locale?: string) => void;
  closeLanguageDialog: () => void;
  saveExplorerPreference: (key: string, value: string) => void;
  refreshLocalizedLabels: () => void;
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
  saveExplorerPreference,
  refreshLocalizedLabels
}: SetSearchLanguageOptions): Promise<SetSearchLanguageResult> {
  const loadId = searchLoadId;
  if (!requestedLocale) {
    updateWebAppManifest();
    languagePickerFlag.textContent = '🌐';
    languagePickerLabel.textContent = translate(
      'languageNotLoaded',
      'Language not loaded'
    );
    closeLanguageDialog();
    await loadUiTranslations('en');
    saveExplorerPreference('locale', '');
    refreshLocalizedLabels();
    return {
      loadId,
      selectedSearchLocale: '',
      searchAnnotations: {},
      searchLabels: {},
      searchSubgroupLabels: {}
    };
  }

  const locale = searchLocales.find(entry => entry.locale === requestedLocale);
  if (!locale) {
    return {
      loadId,
      selectedSearchLocale: '',
      searchAnnotations: {},
      searchLabels: {},
      searchSubgroupLabels: {}
    };
  }
  updateWebAppManifest(locale.locale);
  languagePicker.disabled = true;
  languagePickerLabel.textContent = translate(
    'loadingLanguage',
    'Loading language…'
  );
  try {
    const packs = (await Promise.all([
      ...(locale.baseLocale
        ? [
            fetch(`locales/${locale.baseLocale}.json`).then(response =>
              response.json()
            )
          ]
        : []),
      fetch(`locales/${locale.file}`).then(response => response.json())
    ])) as SearchLocalePack[];
    const searchAnnotations = Object.assign(
      {},
      ...packs.map(pack => pack.annotations ?? {})
    );
    const searchLabels = Object.assign(
      {},
      ...packs.map(pack => pack.labels ?? {})
    );
    const searchSubgroupLabels = Object.assign(
      {},
      ...packs.map(pack => pack.subgroups ?? {})
    );
    await loadUiTranslations(locale.locale, locale.rtl);
    languagePickerFlag.textContent = languageFlags[locale.locale] ?? '🌐';
    languagePickerLabel.textContent = locale.nativeLabel;
    closeLanguageDialog();
    saveExplorerPreference('locale', locale.locale);
    refreshLocalizedLabels();
    return {
      loadId,
      selectedSearchLocale: locale.locale,
      searchAnnotations,
      searchLabels,
      searchSubgroupLabels
    };
  } catch (error) {
    console.warn(`Search language ${requestedLocale} unavailable`, error);
    languagePickerFlag.textContent = '🌐';
    languagePickerLabel.textContent = translate(
      'languageNotLoaded',
      'Language not loaded'
    );
    refreshLocalizedLabels();
    return {
      loadId,
      selectedSearchLocale: '',
      searchAnnotations: {},
      searchLabels: {},
      searchSubgroupLabels: {}
    };
  } finally {
    languagePicker.disabled = false;
  }
}
