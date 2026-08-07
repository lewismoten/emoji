import {
  renderSearchLanguages,
  selectLanguageLink,
  setSearchLanguage as setSearchLanguageHelper,
} from "./search-language-picker.js";
import * as route from '../../app/route.js';
import * as state from "../../state.js";

export function createSearchLanguageLifecycle(options: any) {
  const getSearchLocales = () => options.searchLocales?.() ?? state.searchLocales.get();
  const getSelectedSearchLocale = () =>
    options.selectedSearchLocale?.() ?? state.selectedSearchLocale.get();
  const setSearchLocales = (locales: Array<any>) => {
    state.searchLocales.replace(locales);
    options.setSearchLocales?.(locales);
  };
  const setSelectedSearchLocale = (locale: string) => {
    state.selectedSearchLocale.set(locale);
    options.setSelectedLocale?.(locale);
  };
  const setSearchLabels = (labels: Record<string, string>) => {
    state.searchLabels.replace(labels);
    options.setSearchLabels?.(labels);
  };
  const setSearchSubgroupLabels = (labels: Record<string, string>) => {
    state.searchSubgroupLabels.replace(labels);
    options.setSearchSubgroupLabels?.(labels);
  };
  const render = () =>
    renderSearchLanguages({
      languageFlags: options.languageFlags,
      languageList: options.languageList(),
      searchLocales: getSearchLocales(),
      selectedSearchLocale: getSelectedSearchLocale(),
      translate: options.translate,
      onSelectLanguageLink: select,
    });

  const set = async (requestedLocale: string) => {
    const loadId = options.nextLoadId();
    const hasLanguageUi = Boolean(
      options.languagePicker?.() &&
        options.languagePickerFlag?.() &&
        options.languagePickerLabel?.(),
    );
    const result = await setSearchLanguageHelper({
      requestedLocale,
      searchLoadId: loadId,
      searchLocales: getSearchLocales(),
      languagePicker: options.languagePicker(),
      languagePickerFlag: options.languagePickerFlag(),
      languagePickerLabel: options.languagePickerLabel(),
      languageFlags: options.languageFlags,
      translate: options.translate,
      loadUiTranslations: options.loadUiTranslations,
      updateWebAppManifest: options.updateWebAppManifest,
      closeLanguageDialog: options.closeLanguageDialog,
      restoreLanguageParentPanel: options.restoreLanguageParentPanel,
      refreshLocalizedLabels: options.refreshLocalizedLabels,
      updateUi: hasLanguageUi,
    });
    if (result.loadId !== options.currentLoadId()) return;
    setSelectedSearchLocale(result.selectedSearchLocale);
    setSearchLabels(result.searchLabels);
    setSearchSubgroupLabels(result.searchSubgroupLabels);
    options.refreshLocalizedLabels();
    render();
  };

  const select = (event: MouseEvent, locale: string, href: string) =>
    selectLanguageLink(event, locale, href, set);

  const load = async (initialLocale = "") => {
    try {
      const primary = await fetch("locales/manifest.json");
      const manifest = primary.ok
        ? await primary.json()
        : await fetch("src/data/locales/manifest.json").then((response) => {
            if (!response.ok) {
              throw new Error("Search locale manifest unavailable");
            }
            return response.json();
          });
      setSearchLocales(manifest.locales ?? []);
      render();
      if (
        initialLocale &&
        getSearchLocales().some((locale: any) => locale.locale === initialLocale)
      ) {
        await set(initialLocale);
      }
    } catch (error) {
      console.warn("Search language packs unavailable", error);
      const languagePicker = options.languagePicker?.();
      if (languagePicker) languagePicker.disabled = true;
    }
  };

  const onPopState = async () => {
    options.setApplyingUrlState(true);
    try {
      options.restoreDeveloperMode();
      const locale = route.getLocale() ?? "";
      if (
        !locale ||
        getSearchLocales().some((entry: any) => entry.locale === locale)
      ) {
        await set(locale);
      }
      await options.applyDialogUrlState();
    } finally {
      options.setApplyingUrlState(false);
      options.syncUrlState();
    }
  };

  return { load, onPopState, render, select, set };
}
