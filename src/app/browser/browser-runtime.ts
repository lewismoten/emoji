import { createSearchLanguageLifecycle } from "../../explorer/language/search-language-lifecycle.js";
import { openPanelDialog } from "../../explorer/pwa-panels.js";
import {
  installPixelFontHotReload,
  refreshExplorerPixelFont,
  refreshPixelFontStylesheet,
} from "../../pixel-font-hot-reload.js";

export function isViteDevelopmentRuntime() {
  const override = Reflect.get(globalThis, "__TEST_VITE_DEV__");
  if (typeof override === "boolean") return override;
  return typeof import.meta.env !== "undefined" && import.meta.env.DEV === true;
}

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

export function bindServiceWorkerRuntime(options: {
  navigatorRef?: Navigator & {
    serviceWorker?: {
      getRegistrations?: () => Promise<
        Array<{ scope: string; unregister: () => Promise<unknown> }>
      >;
      register?: (url: string) => Promise<unknown>;
    };
  };
  windowRef?: Window & {
    isSecureContext: boolean;
    location: { origin: string };
  };
  cachesRef?: {
    keys: () => Promise<string[]>;
    delete: (name: string) => Promise<unknown>;
  };
  isViteDevelopment: boolean;
  warn?: typeof console.warn;
}) {
  const navigatorRef =
    options.navigatorRef ??
    (typeof navigator !== "undefined" ? navigator : undefined);
  const windowRef =
    options.windowRef ?? (typeof window !== "undefined" ? window : undefined);
  const cachesRef =
    options.cachesRef ?? (typeof caches !== "undefined" ? caches : undefined);
  const warn = options.warn ?? console.warn;
  const hostname = windowRef?.location?.hostname ?? "";
  const isLocalPreviewHost =
    hostname === "localhost" || hostname === "127.0.0.1";
  if (
    navigatorRef &&
    windowRef &&
    "serviceWorker" in navigatorRef &&
    windowRef.isSecureContext &&
    (options.isViteDevelopment || isLocalPreviewHost)
  ) {
    windowRef.addEventListener("load", async () => {
      try {
        const registrations =
          await navigatorRef.serviceWorker!.getRegistrations!();
        await Promise.all(
          registrations
            .filter((registration) =>
              registration.scope.startsWith(windowRef.location.origin),
            )
            .map((registration) => registration.unregister()),
        );
        if (!cachesRef) return;
        const cacheNames = await cachesRef.keys();
        await Promise.all(
          cacheNames
            .filter((name) => name.startsWith("emoji-explorer-"))
            .map((name) => cachesRef.delete(name)),
        );
      } catch (error) {
        warn("Could not clear local offline cache", error);
      }
    });
  } else if (
    navigatorRef &&
    windowRef &&
    "serviceWorker" in navigatorRef &&
    windowRef.isSecureContext
  ) {
    windowRef.addEventListener("load", () => {
      navigatorRef.serviceWorker!.register!("./service-worker.js").catch(
        (error) => {
          warn("Offline support unavailable", error);
        },
      );
    });
  }
}

export function restoreLanguageParentPanel(
  options: {
    languageDialog: () => any;
    languageList: () => any;
    syncUrlState: (...args: any[]) => void;
  },
  openPanel = openPanelDialog,
) {
  const dialog = options.languageDialog();
  const panel = dialog?.dataset?.returnPanel ?? "help";
  if (dialog?.dataset) delete dialog.dataset.returnPanel;
  if (panel === "help") {
    openPanel({
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
    options.syncUrlState();
  }
}

export function createPixelFontRefreshOptions(
  options: any,
  dependencies = {
    refreshPixelFontStylesheet,
    refreshExplorerPixelFont,
  },
) {
  return {
    refreshStylesheet: (revision: string) =>
      dependencies.refreshPixelFontStylesheet(
        {
          onStylesheetLoaded: (loadedRevision: string) => {
            options.onPixelFontRevisionLoaded();
            void dependencies.refreshExplorerPixelFont(
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
  };
}

export function initializeBrowserRuntime(options: any) {
  const isViteDevelopment = isViteDevelopmentRuntime();

  bindServiceWorkerRuntime({ isViteDevelopment });

  const searchLanguageLifecycle = createSearchLanguageLifecycle({
    applyDialogUrlState: options.applyDialogUrlState,
    closeLanguageDialog: () =>
      options.closePanelDialog(
        options.languageDialog(),
        options.suppressedPanelCloses(),
      ),
    restoreLanguageParentPanel: () => restoreLanguageParentPanel(options),
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

  installPixelFontHotReload(createPixelFontRefreshOptions(options));

  return searchLanguageLifecycle;
}
