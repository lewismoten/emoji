import { initializeBrowserRuntime } from "./browser-runtime.js";
import * as state from "../../state.js";

export function createBrowserRuntimeConfig(options: any) {
  return initializeBrowserRuntime({
    applyDialogUrlState: options.applyDialogUrlState,
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    closePanelDialog: options.closePanelDialog,
    dialog: options.dialog,
    languageDialog: options.languageDialog,
    languageFlags: options.languageFlags,
    languageList: options.languageList,
    languagePicker: options.languagePicker,
    languagePickerFlag: options.languagePickerFlag,
    languagePickerLabel: options.languagePickerLabel,
    loadUiTranslations: options.loadUiTranslations,
    nextLoadId: options.nextLoadId,
    onPixelFontRevisionLoaded: options.onPixelFontRevisionLoaded,
    refreshLocalizedLabels: options.refreshLocalizedLabels,
    restoreDeveloperMode: options.restoreDeveloperMode,
    setApplyingUrlState: options.setApplyingUrlState,
    suppressedPanelCloses: options.suppressedPanelCloses,
    syncUrlState: options.syncUrlState,
    translate: options.translate,
    updateModifierArtwork: options.updateModifierArtwork,
    updatePixelArtworkManifest: options.updatePixelArtworkManifest,
    updateWebAppManifest: options.updateWebAppManifest,
  });
}
