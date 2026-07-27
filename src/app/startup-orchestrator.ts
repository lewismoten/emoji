import { ensureImportExamples as ensureImportExampleLines } from "../explorer/import-examples.js";
import { upgradeEmojiDialog as upgradeEmojiDialogHelper } from "../explorer/dialog-upgrade.js";
import {
  finishExplorerLoading as finishExplorerLoadingHelper,
  revealExplorer as revealExplorerHelper,
} from "../explorer/loading-state.js";

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
      ensureImportExamples: ensureImportExampleLines,
      exampleDialog: options.dialog(),
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
      drawList: options.drawList,
      emojiFontChoices: options.emojiFontChoices(),
      emojiList: options.emojiList(),
      favoriteEmojiKeys: options.favoriteEmojiKeys,
      genderCheckboxes: options.genderCheckboxes(),
      hairCheckboxes: options.hairCheckboxes(),
      helpDialog: options.helpDialog(),
      helpPicker: options.helpPicker(),
      installApp: options.installApp,
      installAppButton: options.installAppButton(),
      installDialog: options.installDialog(),
      installedDisplayQueries: options.installedDisplayQueries,
      languageDialog: options.languageDialog(),
      languageList: options.languageList(),
      languagePicker: options.languagePicker(),
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
      renderInstallAppButton: options.renderInstallAppButton,
      renderSavedEmoji: options.renderSavedEmoji,
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
      renderPixelFontToggle: options.renderPixelFontToggle,
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
