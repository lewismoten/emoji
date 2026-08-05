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
  const providedState = options.state?.();
  const readRecord: any = (getter: any, key: any) => () =>
    providedState?.[key] ?? getter();
  const readList: any = (getter: any, key: any) => () =>
    providedState?.[key] ?? getter();
  const writeList: any =
    (setter: any, key: any) =>
    (value: string[]) => {
      if (providedState) providedState[key] = value;
      else setter(value);
    };
  const savedEmoji = helpers.createSavedEmojiController({
    applyPixelArtworkClass: () => options.applyPixelArtworkClass(),
    byId: readRecord(state.byId.get, "byId"),
    copiedEmojiKeys: readList(state.copiedEmojiKeys.get, "copiedEmojiKeys"),
    currentEmojiKey: () =>
      providedState?.currentEmojiKey ?? state.currentEmojiKey.get(),
    emojiByKey: readRecord(state.emojiByKey.get, "emojiByKey"),
    favoriteEmojiKeys: readList(
      state.favoriteEmojiKeys.get,
      "favoriteEmojiKeys",
    ),
    savedDialog: options.savedDialog,
    searchAnnotations: readRecord(state.searchAnnotations.get, "searchAnnotations"),
    setCopiedEmojiKeys: writeList(state.copiedEmojiKeys.set, "copiedEmojiKeys"),
    setFavoriteEmojiKeys: writeList(
      state.favoriteEmojiKeys.set,
      "favoriteEmojiKeys",
    ),
    translate: options.translate,
  });

  const audio = helpers.createExplorerAudioController();

  function renderPixelFontToggle() {
    helpers.renderPixelFontToggleHelper({
      choices: options.emojiFontChoices,
      refreshRenderedPixelEmoji: options.refreshRenderedPixelEmoji,
      state: options.state,
    });
  }

  function selectEmojiFont(event: Event) {
    helpers.selectEmojiFontHelper({ renderPixelFontToggle }, event);
  }

  function disableDeveloperFeatures() {
    const versionModeSelector = options.versionModeSelector();
    if (versionModeSelector) versionModeSelector.value = "through";
    const latest =
      providedState?.versionManifests?.at(-1)?.version ??
      state.versionManifests.get().at(-1)?.version;
    const versionSelector = options.versionSelector();
    if (latest && versionSelector) versionSelector.value = latest;
    options.renderVersionModeToggle();
    options.syncVersionRange();
    const currentOrderMode = providedState?.orderMode ?? state.orderMode.get();
    if (currentOrderMode === "sequence") {
      if (providedState) {
        providedState.orderMode = "grouped";
        providedState.selectedSequenceType = "";
      } else {
        state.orderMode.set("grouped");
        state.selectedSequenceType.set("");
      }
      options.orderButtons()?.forEach((button: HTMLButtonElement) => {
        const active =
          button.dataset.order ===
          (providedState?.orderMode ?? state.orderMode.get());
        button.classList.toggle("is-active", active);
        aria.setPressed(button, active);
      });
    }
    if ((providedState?.items ?? state.items.get()).length > 0) {
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
    state: options.state,
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
