import { createSavedEmojiController } from '../explorer/saved-emoji.js';
import {
  installApp as installWebApp,
  renderInstallAppButton as renderInstallAppButtonHelper
} from '../explorer/pwa-panels.js';
import {
  createDeveloperModeController,
  createExplorerUiController,
  renderPixelFontToggle as renderPixelFontToggleHelper,
  renderThemeToggle as renderThemeToggleHelper,
  selectEmojiFont as selectEmojiFontHelper,
  selectTheme as selectThemeHelper
} from '../explorer-ui.js';

export function createExplorerShell(options: any) {
  const savedEmoji = createSavedEmojiController({
    applyPixelArtworkClass: () => options.applyPixelArtworkClass(),
    byId: () => options.state().byId,
    copiedEmojiKeys: () => options.state().copiedEmojiKeys,
    currentEmojiKey: () => options.state().currentEmojiKey,
    emojiByKey: () => options.state().emojiByKey,
    favoriteEmojiKeys: () => options.state().favoriteEmojiKeys,
    savePreference: options.savePreference,
    savedDialog: options.savedDialog,
    searchAnnotations: () => options.state().searchAnnotations,
    setCopiedEmojiKeys: (keys: string[]) => (options.state().copiedEmojiKeys = keys),
    setFavoriteEmojiKeys: (keys: string[]) => (options.state().favoriteEmojiKeys = keys),
    translate: options.translate
  });

  function renderPixelFontToggle() {
    renderPixelFontToggleHelper({
      choices: options.emojiFontChoices,
      refreshRenderedPixelEmoji: options.refreshRenderedPixelEmoji,
      state: options.state
    });
  }

  function selectEmojiFont(event: Event) {
    selectEmojiFontHelper(
      { renderPixelFontToggle, savePreference: options.savePreference },
      event
    );
  }

  function renderThemeToggle() {
    renderThemeToggleHelper({
      choices: options.themeChoices,
      state: options.state
    });
  }

  function selectTheme(event: Event) {
    selectThemeHelper(
      { renderThemeToggle, savePreference: options.savePreference },
      event
    );
  }

  function disableDeveloperFeatures() {
    const versionModeSelector = options.versionModeSelector();
    if (versionModeSelector) versionModeSelector.value = 'through';
    const latest = options.state().versionManifests.at(-1)?.version;
    const versionSelector = options.versionSelector();
    if (latest && versionSelector) versionSelector.value = latest;
    options.renderVersionModeToggle();
    options.syncVersionRange();
    if (options.state().orderMode === 'sequence') {
      options.state().orderMode = 'grouped';
      options.state().selectedSequenceType = '';
      options.orderButtons()?.forEach((button: HTMLButtonElement) => {
        const active = button.dataset.order === options.state().orderMode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }
    if (options.state().items.length > 0) {
      options.renderCategoryFilters();
      options.drawList();
    }
  }

  const developerMode = createDeveloperModeController({
    dialog: options.dialog,
    disableDeveloperFeatures,
    loadVersionData: options.loadVersionData,
    savePreference: options.savePreference,
    setDialogView: options.setDialogView,
    state: options.state,
    syncUrlState: options.syncUrlState,
    toggle: options.developerModeToggle
  });

  let deferredInstallPrompt: Event | undefined;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    renderInstallAppButtonHelper(options.installAppButton());
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = undefined;
    const installAppButton = options.installAppButton();
    if (installAppButton) installAppButton.hidden = true;
  });

  const explorerUi = createExplorerUiController({
    deferredInstallPrompt: () => deferredInstallPrompt,
    installAppButton: options.installAppButton,
    installDialog: options.installDialog,
    installWebApp,
    offlineStatus: options.offlineStatus,
    pixelEditor: options.pixelEditor,
    renderDeveloperMode: developerMode.render,
    renderInstallAppButton: renderInstallAppButtonHelper,
    renderPixelFontToggle,
    renderThemeToggle,
    renderSearchLanguages: options.renderSearchLanguages,
    renderVersionModeToggle: options.renderVersionModeToggle,
    setDeferredInstallPrompt: (value: Event | undefined) =>
      (deferredInstallPrompt = value),
    state: options.state
  });

  return {
    ...savedEmoji,
    developerModeEnabled: developerMode.enabled,
    installApp: explorerUi.installApp,
    loadUiTranslations: explorerUi.loadUiTranslations,
    renderDeveloperMode: developerMode.render,
    renderInstallAppButton: explorerUi.renderInstallAppButton,
    renderPixelFontToggle,
    renderThemeToggle,
    selectEmojiFont,
    selectTheme,
    toggleDeveloperMode: developerMode.change,
    updateOnlineStatus: explorerUi.updateOnlineStatus,
    applyUiTranslations: explorerUi.applyTranslations
  };
}
