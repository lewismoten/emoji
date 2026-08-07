import { createSavedEmojiController } from "../explorer/saved-emoji.js";
import { createExplorerAudioController } from "../explorer-audio.js";
import {
  installApp as installWebApp,
  renderInstallAppButton as renderInstallAppButtonHelper,
} from "../explorer/pwa/pwa-panels.js";
import {
  createDeveloperModeController,
  createExplorerUiController,
  renderPixelFontToggle as renderPixelFontToggleHelper,
  selectEmojiFont as selectEmojiFontHelper,
} from "../explorer-ui.js";
import * as state from "../state.js";
import * as aria from "../utils/aria.js";

export function createExplorerShellDependencies() {
  return {
    createDeveloperModeController,
    createExplorerAudioController,
    createExplorerUiController,
    createSavedEmojiController,
    installWebApp,
    renderInstallAppButtonHelper,
    renderPixelFontToggleHelper,
    selectEmojiFontHelper,
  };
}

export function createExplorerShell(options: any, dependencies?: any) {
  const helpers = dependencies ?? createExplorerShellDependencies();
  const savedEmoji = helpers.createSavedEmojiController({
    applyPixelArtworkClass: () => options.applyPixelArtworkClass(),
    byId: state.byId.get,
    emojiByKey: state.emojiByKey.get,
    savedDialog: options.savedDialog,
    searchAnnotations: state.searchAnnotations.get,
    translate: options.translate,
  });

  const audio = helpers.createExplorerAudioController();

  function renderPixelFontToggle() {
    helpers.renderPixelFontToggleHelper({
      choices: options.emojiFontChoices,
      refreshRenderedPixelEmoji: options.refreshRenderedPixelEmoji,
    });
  }

  function selectEmojiFont(event: Event) {
    helpers.selectEmojiFontHelper({ renderPixelFontToggle }, event);
  }

  function disableDeveloperFeatures() {
    const versionModeSelector = options.versionModeSelector();
    if (versionModeSelector) versionModeSelector.value = "through";
    const latest = state.versionManifests.get().at(-1)?.version;
    const versionSelector = options.versionSelector();
    if (latest && versionSelector) versionSelector.value = latest;
    options.renderVersionModeToggle();
    options.syncVersionRange();
    if (state.orderMode.get() === "sequence") {
      state.orderMode.set("grouped");
      state.selectedSequenceType.set("");
      options.orderButtons()?.forEach((button: HTMLButtonElement) => {
        const active = button.dataset.order === state.orderMode.get();
        button.classList.toggle("is-active", active);
        aria.setPressed(button, active);
      });
    }
    if (state.items.get().length > 0) {
      options.renderCategoryFilters();
      options.drawList();
    }
  }

  const developerMode = helpers.createDeveloperModeController({
    choices: options.modeChoices,
    dialog: options.dialog,
    disableDeveloperFeatures,
    loadVersionData: options.loadVersionData,
    setDialogView: options.setDialogView,
    syncUrlState: options.syncUrlState,
    toggle: options.developerModeToggle,
  });

  let deferredInstallPrompt: Event | undefined;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    helpers.renderInstallAppButtonHelper(options.installAppButton());
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = undefined;
    const installAppButton = options.installAppButton();
    if (installAppButton) installAppButton.hidden = true;
  });

  const explorerUi = helpers.createExplorerUiController({
    deferredInstallPrompt: () => deferredInstallPrompt,
    installAppButton: options.installAppButton,
    installDialog: options.installDialog,
    installWebApp: helpers.installWebApp,
    offlineStatus: options.offlineStatus,
    pixelEditor: options.pixelEditor,
    renderDeveloperMode: developerMode.render,
    renderInstallAppButton: helpers.renderInstallAppButtonHelper,
    renderPixelFontToggle,
    renderSearchLanguages: options.renderSearchLanguages,
    renderVersionModeToggle: options.renderVersionModeToggle,
    setDeferredInstallPrompt: (value: Event | undefined) =>
      (deferredInstallPrompt = value),
  });

  return {
    ...savedEmoji,
    bindAudioInteractions: audio.bindAudioInteractions,
    developerModeEnabled: developerMode.enabled,
    fullDeveloperModeEnabled: developerMode.fullEnabled,
    installApp: explorerUi.installApp,
    loadUiTranslations: explorerUi.loadUiTranslations,
    renderDeveloperMode: developerMode.render,
    renderInstallAppButton: explorerUi.renderInstallAppButton,
    renderPixelFontToggle,
    selectEmojiFont,
    syncHelpMusic: audio.syncHelpMusic,
    toggleDeveloperMode: developerMode.change,
    updateOnlineStatus: explorerUi.updateOnlineStatus,
    applyUiTranslations: explorerUi.applyTranslations,
  };
}
