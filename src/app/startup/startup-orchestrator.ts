import { ensureImportExamples as ensureImportExampleLines } from "../../explorer/emoji/import-examples.js";
import { upgradeEmojiDialog as upgradeEmojiDialogHelper } from "../../explorer/dialog/dialog-upgrade.js";
import {
  finishExplorerLoading as finishExplorerLoadingHelper,
  revealExplorer as revealExplorerHelper,
} from "../../explorer/loading-state.js";

export function createStartupOrchestrator(options: any) {
  function finishExplorerLoading() {
    finishExplorerLoadingHelper({
      applyPixelArtworkClass: options.applyPixelArtworkClass,
      emojiByKey: options.emojiByKey(),
      emojiList: options.emojiList(),
      matchCount: options.matchCount(),
      revealExplorer,
    });
  }

  function revealExplorer() {
    revealExplorerHelper(options.emojiList(), options.matchCount());
  }

  function upgradeEmojiDialog() {
    upgradeEmojiDialogHelper({
      // The import-example helper only reads HTMLElement-compatible members.
      // @ts-expect-error Its lightweight test DOM type is intentionally narrower.
      ensureImportExamples: ensureImportExampleLines,
      exampleDialog: options.dialog(),
      translate: options.translate,
    });
  }

  function removeLegacyDialogElements() {
    const dialog = document.querySelector(".example-dialog");
    dialog?.querySelector('[data-i18n="copiedDescription"]')?.remove();
    dialog?.querySelector(".example-link")?.remove();
    dialog?.querySelector('.emoji-copy-actions [data-copy="emoji"]')?.remove();
    dialog?.querySelector(".emoji-code-points")?.closest("div")?.remove();
    dialog
      ?.querySelector('.emoji-metadata [data-i18n="codePoints"]')
      ?.closest("div")
      ?.remove();
  }

  async function onLoad() {
    const requestedPanel =
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("panel") ?? "";
    if (
      requestedPanel === "favorites" ||
      requestedPanel === "help" ||
      requestedPanel === "language" ||
      requestedPanel === "filters"
    ) {
      await options.ensureUtilityPanel?.(requestedPanel);
    }
    await options.ensureEmojiCompositionControl?.();
    const elements = options.resolveElements();
    options.assignElements(elements);
    options.assignControls(
      options.initializeControls({
        createFilterControlSetup: options.createFilterControlSetup,
        groupFilterDialog: options.groupFilterDialog(),
        groupPickerTrigger: options.groupPickerTrigger(),
        groupSelector: options.groupSelector(),
        onCompactChoiceKeyDown: options.onCompactChoiceKeyDown,
        openFilterPicker: options.openFilterPicker,
        populateVersionModeOptions: options.populateVersionModeOptions,
        renderDeveloperMode: options.renderDeveloperMode,
        subGroupFilterDialog: options.subGroupFilterDialog(),
        subGroupPickerTrigger: options.subGroupPickerTrigger(),
        subGroupSelector: options.subGroupSelector(),
        versionModeSelector: options.versionModeSelector(),
        versionRange: options.versionRange,
        versionSelector: options.versionSelector(),
      }),
    );
    upgradeEmojiDialog();
    options.assignModifierFieldsets();
    options.hideModifierEmojiAccessibility();
    options.bindAudioInteractions();

    options.bindEvents({
      advancedFilters: options.advancedFilters(),
      advancedFiltersButton: options.advancedFiltersButton?.(),
      applyingUrlState: options.applyingUrlState,
      applyBasicUrlState: options.applyBasicUrlState,
      clearFiltersButton: options.clearFiltersButton(),
      closePanel: options.closePanel,
      copiedEmojiKeys: options.copiedEmojiKeys,
      developerModeToggle: options.developerModeToggle(),
      modeChoices: options.modeChoices?.(),
      drawList: options.drawList,
      emojiFontChoices: options.emojiFontChoices(),
      emojiList: options.emojiList(),
      favoriteEmojiKeys: options.favoriteEmojiKeys,
      genderCheckboxes: options.genderCheckboxes(),
      hairCheckboxes: options.hairCheckboxes(),
      helpDialog: options.helpDialog(),
      helpPicker: options.helpPicker(),
      getHelpDialog: options.helpDialog,
      getLanguageDialog: options.languageDialog,
      getLanguageList: options.languageList,
      getSavedDialog: options.savedDialog,
      getAdvancedFiltersDialog: options.advancedFilters,
      installApp: options.installApp,
      installAppButton: options.installAppButton(),
      installDialog: options.installDialog(),
      installedDisplayQueries: options.installedDisplayQueries,
      languageDialog: options.languageDialog(),
      languageList: options.languageList(),
      languagePicker: options.languagePicker(),
      ensureUtilityPanel: options.ensureUtilityPanel,
      navigateEmoji: options.navigateEmoji,
      onClick: options.onClick,
      onDocumentKeyDown: options.onDocumentKeyDown,
      onEmojiDialogClick: options.onEmojiDialogClick,
      onEmojiDialogClose: options.onEmojiDialogClose,
      onEmojiFocus: options.onEmojiFocus,
      onHairChange: options.onHairChange,
      onEmojiKeyDown: options.onEmojiKeyDown,
      onGenderChange: options.onGenderChange,
      onSkinToneChange: options.onSkinToneChange,
      onOrderModeChange: options.onOrderModeChange,
      onPanelClose: options.onPanelClose,
      onVersionRangeInput: options.onVersionRangeInput,
      openPanel: options.openPanel,
      orderButtons: options.orderButtons(),
      panelDialogs: options.panelDialogs,
      positionFavoriteButton: options.positionFavoriteButton,
      renderDeveloperMode: options.renderDeveloperMode,
      renderInstallAppButton: options.renderInstallAppButton,
      renderMusicToggle: options.renderMusicToggle,
      renderPixelFontToggle: options.renderPixelFontToggle,
      renderSavedEmoji: options.renderSavedEmoji,
      renderSearchLanguages: options.renderSearchLanguages,
      renderSoundEffectsToggle: options.renderSoundEffectsToggle,
      refreshElements: options.refreshElements,
      resetFilters: options.resetFilters,
      savePreference: options.savePreference,
      savedDialog: options.savedDialog(),
      savedPicker: options.savedPicker(),
      scheduleSearchDraw: options.scheduleSearchDraw,
      searchText: options.searchText(),
      selectEmojiFont: options.selectEmojiFont,
      selectTheme: options.selectTheme,
      showEmoji: options.showEmoji,
      skinToneCheckboxes: options.skinToneCheckboxes(),
      stepVersion: options.stepVersion,
      suppressedPanelCloses: options.suppressedPanelCloses(),
      syncUrlState: options.syncUrlState,
      syncVersionRange: options.syncVersionRange,
      toggleDeveloperMode: options.toggleDeveloperMode,
      toggleVersionMode: options.toggleVersionMode,
      themeChoices: options.themeChoices(),
      updateOnlineStatus: options.updateOnlineStatus,
      urlStateReady: options.urlStateReady,
      versionModeToggle: options.versionModeToggle(),
      versionNext: options.versionNext(),
      versionPrevious: options.versionPrevious(),
      versionRange: options.versionRange(),
      versionSelector: options.versionSelector(),
      emojiNext: options.emojiNext(),
      emojiPrevious: options.emojiPrevious(),
      exampleDialog: options.dialog(),
    });

    await options.finalizeStartup({
      advancedFilters: options.advancedFilters(),
      applyDialogUrlState: options.applyDialogUrlState,
      drawList: options.drawList,
      filters: options.advancedFilters(),
      finishExplorerLoading,
      loadData: options.loadData,
      loadSearchLanguages: options.loadSearchLanguages,
      loadUiTranslations: options.loadUiTranslations,
      observeToolbarHeight: options.observeToolbarHeight,
      preferences: options.preferences(),
      refreshElements: options.refreshElements,
      renderDeveloperMode: options.renderDeveloperMode,
      renderMusicToggle: options.renderMusicToggle,
      renderPixelFontToggle: options.renderPixelFontToggle,
      renderSearchLanguages: options.renderSearchLanguages,
      renderSoundEffectsToggle: options.renderSoundEffectsToggle,
      renderThemeToggle: options.renderThemeToggle,
      renderVersionModeToggle: options.renderVersionModeToggle,
      setUrlStateReady: options.setUrlStateReady,
      syncUrlState: options.syncUrlState,
      toolbar: options.toolbar(),
    });
  }

  return {
    finishExplorerLoading,
    onLoad,
    removeLegacyDialogElements,
    revealExplorer,
    upgradeEmojiDialog,
  };
}
