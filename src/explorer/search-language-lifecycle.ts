import {
  renderSearchLanguages,
  selectLanguageLink,
  setSearchLanguage as setSearchLanguageHelper,
} from "./language-picker.js";

export function createSearchLanguageLifecycle(options: any) {
  const render = () =>
    renderSearchLanguages({
      languageFlags: options.languageFlags,
      languageList: options.languageList(),
      searchLocales: options.searchLocales(),
      selectedSearchLocale: options.selectedSearchLocale(),
      translate: options.translate,
      onSelectLanguageLink: select,
    });

  const set = async (requestedLocale: string) => {
    const loadId = options.nextLoadId();
    const result = await setSearchLanguageHelper({
      requestedLocale,
      searchLoadId: loadId,
      searchLocales: options.searchLocales(),
      languagePicker: options.languagePicker(),
      languagePickerFlag: options.languagePickerFlag(),
      languagePickerLabel: options.languagePickerLabel(),
      languageFlags: options.languageFlags,
      translate: options.translate,
      loadUiTranslations: options.loadUiTranslations,
      updateWebAppManifest: options.updateWebAppManifest,
      closeLanguageDialog: options.closeLanguageDialog,
      restoreLanguageParentPanel: options.restoreLanguageParentPanel,
      saveExplorerPreference: options.saveExplorerPreference,
      refreshLocalizedLabels: options.refreshLocalizedLabels,
    });
    if (result.loadId !== options.currentLoadId()) return;
    options.setSelectedLocale(result.selectedSearchLocale);
    options.setSearchAnnotations(result.searchAnnotations);
    options.setSearchLabels(result.searchLabels);
    options.setSearchSubgroupLabels(result.searchSubgroupLabels);
    render();
  };

  const select = (event: MouseEvent, locale: string, href: string) =>
    selectLanguageLink(event, locale, href, set);

  const load = async (initialLocale = "") => {
    try {
      const manifest = await fetch("locales/manifest.json").then((response) =>
        response.json(),
      );
      options.setSearchLocales(manifest.locales ?? []);
      render();
      if (
        initialLocale &&
        options
          .searchLocales()
          .some((locale: any) => locale.locale === initialLocale)
      ) {
        await set(initialLocale);
      }
    } catch (error) {
      console.warn("Search language packs unavailable", error);
      options.languagePicker().disabled = true;
    }
  };

  const onPopState = async () => {
    options.setApplyingUrlState(true);
    try {
      options.restoreDeveloperMode();
      const locale =
        window.location.pathname.match(
          /index\.([a-z]{2,3}(?:-[A-Z]{2})?)\.html$/,
        )?.[1] ?? "";
      if (
        !locale ||
        options.searchLocales().some((entry: any) => entry.locale === locale)
      ) {
        await set(locale);
      }
      options.applyDialogUrlState();
    } finally {
      options.setApplyingUrlState(false);
      options.syncUrlState();
    }
  };

  return { load, onPopState, render, select, set };
}
