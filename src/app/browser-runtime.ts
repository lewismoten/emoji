import { createSearchLanguageLifecycle } from "../explorer/language/search-language-lifecycle.js";
import { openPanelDialog } from "../explorer/pwa-panels.js";
import {
  installPixelFontHotReload,
  refreshExplorerPixelFont,
  refreshPixelFontStylesheet,
} from "../pixel-font-hot-reload.js";

export function createUiFormatters(options: {
  document: Document;
  selectedSearchLocale: () => string;
  formatNumber: (
    value: number,
    locale?: string,
    numberingSystem?: string,
  ) => string;
  formatPercent: (
    value: number,
    locale?: string,
    numberingSystem?: string,
  ) => string;
}) {
  const localeOptions = () => {
    const locale =
      options.document.documentElement.lang ||
      options.selectedSearchLocale() ||
      undefined;
    return {
      locale,
      numberingSystem: locale?.startsWith("ar") ? "arab" : undefined,
    };
  };
  return {
    formatUiNumber(value: number) {
      const { locale, numberingSystem } = localeOptions();
      return options.formatNumber(value, locale, numberingSystem);
    },
    formatUiPercent(value: number) {
      const { locale, numberingSystem } = localeOptions();
      return options.formatPercent(value, locale, numberingSystem);
    },
  };
}

export function initializeBrowserRuntime(options: any) {
  const isViteDevelopment =
    typeof import.meta.env !== "undefined" && import.meta.env.DEV === true;

  if (
    "serviceWorker" in navigator &&
    window.isSecureContext &&
    isViteDevelopment
  ) {
    window.addEventListener("load", async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations
            .filter((registration: ServiceWorkerRegistration) =>
              registration.scope.startsWith(window.location.origin),
            )
            .map((registration: ServiceWorkerRegistration) =>
              registration.unregister(),
            ),
        );
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name: string) => name.startsWith("emoji-explorer-"))
            .map((name: string) => caches.delete(name)),
        );
      } catch (error) {
        console.warn("Could not clear local offline cache", error);
      }
    });
  } else if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        console.warn("Offline support unavailable", error);
      });
    });
  }

  const searchLanguageLifecycle = createSearchLanguageLifecycle({
    applyDialogUrlState: options.applyDialogUrlState,
    closeLanguageDialog: () =>
      options.closePanelDialog(
        options.languageDialog(),
        options.suppressedPanelCloses(),
      ),
    restoreLanguageParentPanel: () => {
      const dialog = options.languageDialog();
      const panel = dialog?.dataset?.returnPanel ?? "";
      if (!panel) return;
      delete dialog.dataset.returnPanel;
      if (panel === "help") {
        openPanelDialog({
          panel: "help",
          addHistory: false,
          dialogs: {
            help: dialog?.ownerDocument?.querySelector("#help-dialog") ?? null,
            language: dialog,
            favorites:
              dialog?.ownerDocument?.querySelector("#saved-dialog") ?? null,
          },
          languageList: options.languageList(),
          renderSavedEmoji: () => {},
          syncUrlState: options.syncUrlState,
        });
      }
    },
    currentLoadId: options.currentLoadId,
    languageFlags: options.languageFlags,
    languageList: options.languageList,
    languagePicker: options.languagePicker,
    languagePickerFlag: options.languagePickerFlag,
    languagePickerLabel: options.languagePickerLabel,
    loadUiTranslations: options.loadUiTranslations,
    nextLoadId: options.nextLoadId,
    refreshLocalizedLabels: options.refreshLocalizedLabels,
    restoreDeveloperMode: options.restoreDeveloperMode,
    saveExplorerPreference: options.saveExplorerPreference,
    searchLocales: options.searchLocales,
    selectedSearchLocale: options.selectedSearchLocale,
    setApplyingUrlState: options.setApplyingUrlState,
    setSearchAnnotations: options.setSearchAnnotations,
    setSearchLabels: options.setSearchLabels,
    setSearchLocales: options.setSearchLocales,
    setSearchSubgroupLabels: options.setSearchSubgroupLabels,
    setSelectedLocale: options.setSelectedLocale,
    syncUrlState: options.syncUrlState,
    translate: options.translate,
    updateWebAppManifest: options.updateWebAppManifest,
  });
  window.addEventListener("popstate", searchLanguageLifecycle.onPopState);

  installPixelFontHotReload({
    refreshStylesheet: (revision: string) =>
      refreshPixelFontStylesheet(
        {
          onStylesheetLoaded: (loadedRevision: string) => {
            options.onPixelFontRevisionLoaded();
            void refreshExplorerPixelFont(
              {
                applyArtwork: options.applyPixelArtworkClass,
                applyStandaloneArtwork: options.applyStandalonePixelArtwork,
                currentEmojiKey: options.currentEmojiKey,
                dialog: options.dialog,
                updateManifest: options.updatePixelArtworkManifest,
                updateModifierArtwork: options.updateModifierArtwork,
              },
              loadedRevision,
            );
          },
        },
        revision,
      ),
  });

  return searchLanguageLifecycle;
}
