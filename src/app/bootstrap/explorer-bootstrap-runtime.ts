// @ts-nocheck -- Transitional bootstrap wiring.
import { createExplorerRuntime } from "../../explorer-runtime.js";
import { getExplorerElements } from "../../explorer/explorer-dom.js";
import {
  ensureEmojiCompositionControl,
  ensureUtilityPanel,
  ensureUtilityControls,
  positionFavoriteButton,
} from "../../explorer/utility/utility-controls.js";
import { createUiBindingRuntime } from "../ui-binding-runtime.js";
import { createStartupRuntime } from "../startup/startup-runtime.js";
import { createPixelEditorRuntime } from "../pixel-editor-loader-runtime.js";
import { createVersionModeRuntime } from "../version/version-mode-runtime.js";
import { createBrowserRuntimeConfig } from "../browser/browser-runtime-config.js";
import { createDialogRuntimeConfig } from "../dialog/dialog-runtime-config.js";
import {
  languageFlags,
  sequenceTranslationKeys,
  sequenceTypeLabels,
  statusTranslationKeys,
  versionModeDefinitions,
} from "../../explorer/explorer-labels.js";
import {
  closePanelDialog,
  onPanelDialogClose,
  openPanelDialog,
  updateWebAppManifest,
} from "../../explorer/pwa/pwa-panels.js";
import { getEmojiGenders } from "../../explorer/emoji/emoji-filter.js";
import * as state from "../../state.js";

export function createExplorerBootstrapRuntime(options: any) {
  const explorerRuntime = createExplorerRuntime({
    ensureUtilityControls,
    getElements: getExplorerElements,
  });

  const uiBindingRuntime = createUiBindingRuntime({
    setControls: options.setControls,
    setElements: options.setElements,
    setFieldsets: options.setFieldsets,
    skinToneCheckboxes: () => options.skinToneCheckboxes(),
    hairCheckboxes: () => options.hairCheckboxes(),
    genderCheckboxes: () => options.genderCheckboxes(),
  });

  const refreshElements = () => {
    const elements = explorerRuntime.resolveElements();
    options.setElements(elements);
    return elements;
  };

  const pixelEditorRuntime = createPixelEditorRuntime({
    currentEmojiKey: state.currentEmojiKey.get,
    dialog: () => explorerRuntime.get("exampleDialog"),
    formatNumber: options.formatNumber,
    formatPercent: options.formatPercent,
    getEditor: () => options.getPixelEditor(),
    getPromise: () => options.getPixelEditorPromise(),
    setEditor: options.setPixelEditor,
    setPromise: options.setPixelEditorPromise,
    translate: options.translate,
  });

  const versionModeRuntime = createVersionModeRuntime({
    definitions: versionModeDefinitions,
    drawList: options.drawList,
    renderCategoryFilters: options.renderCategoryFilters,
    selector: () => options.versionModeSelector(),
    syncUrlState: options.syncUrlState,
    toggle: () => options.versionModeToggle(),
    translate: options.translate,
  });

  const searchLanguageLifecycle = createBrowserRuntimeConfig({
    applyDialogUrlState: options.applyDialogUrlState,
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    closePanelDialog,
    currentEmojiKey: state.currentEmojiKey.get,
    currentLoadId: state.searchLoadId.get,
    dialog: () => explorerRuntime.get("exampleDialog"),
    languageDialog: () => options.languageDialog(),
    languageFlags,
    languageList: () => options.languageList(),
    languagePicker: () => options.languagePicker(),
    languagePickerFlag: () => options.languagePickerFlag(),
    languagePickerLabel: () => options.languagePickerLabel(),
    loadUiTranslations: options.loadUiTranslations,
    nextLoadId: () => options.nextSearchLoadId(),
    onPixelFontRevisionLoaded: () => {
      options.getPixelEditor()?.refreshFontBuild();
    },
    refreshLocalizedLabels: options.refreshLocalizedLabels,
    restoreDeveloperMode: options.restoreDeveloperMode,
    searchLocales: state.searchLocales.get,
    selectedSearchLocale: state.selectedSearchLocale.get,
    setApplyingUrlState: options.setApplyingUrlState,
    setSearchLabels: state.searchLabels.set,
    setSearchLocales: state.searchLocales.set,
    setSearchSubgroupLabels: state.searchSubgroupLabels.set,
    setSelectedLocale: state.selectedSearchLocale.set,
    suppressedPanelCloses: () => options.suppressedPanelCloses(),
    syncUrlState: options.syncUrlState,
    translate: options.translate,
    updateModifierArtwork: () => {
      if (options.skinToneCheckboxes() && options.hairCheckboxes()) {
        options.updateModifierArtwork();
      }
    },
    updatePixelArtworkManifest: options.updatePixelArtworkManifest,
    updateWebAppManifest,
  });

  const dialogRuntime = createDialogRuntimeConfig({
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    copyStatus: () => options.copyStatus(),
    currentDialogParentStack: state.currentDialogParentStack.get,
    currentEmojiKey: state.currentEmojiKey.get,
    developerModeEnabled: options.developerModeEnabled,
    dialog: () => explorerRuntime.get("exampleDialog"),
    dialogNavigationKeys: state.dialogNavigationKeys.get,
    displayedKeys: state.displayedKeys.get,
    displayGroupName: options.displayGroupName,
    emojiNext: () => explorerRuntime.get("emojiNext"),
    emojiParent: () => explorerRuntime.get("emojiParent"),
    emojiPrevious: () => explorerRuntime.get("emojiPrevious"),
    focusInitialAction: options.focusInitialEmojiDialogAction,
    getIntroducedVersion: options.getIntroducedVersion,
    openEditor: (key: string, value: string) =>
      options.getPixelEditor()?.open(key, value),
    sequenceTranslationKeys,
    sequenceTypeLabels,
    setCurrentDialogParentStack: state.currentDialogParentStack.set,
    setDialogView: options.setDialogView,
    statusTranslationKeys,
    syncUrlState: options.syncUrlState,
    translate: options.translate,
    updateCompositionBackButton: () => options.updateCompositionBackButton(),
    updateDialogNavigation: () => options.updateDialogNavigation(),
    updateEmojiComposition: options.updateEmojiComposition,
    updateFavoriteButton: options.updateFavoriteButton,
    updateRenderingDiagnostic: options.updateRenderingDiagnostic,
  });

  const startupRuntime = createStartupRuntime({
    advancedFilters: () => options.advancedFilters(),
    advancedFiltersButton: () => options.advancedFiltersButton(),
    applyingUrlState: () => options.applyingUrlState(),
    applyBasicUrlState: options.applyBasicUrlState,
    applyDialogUrlState: options.applyDialogUrlState,
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    bindAudioInteractions: options.bindAudioInteractions,
    assignControls: (controls) => uiBindingRuntime.assignControls(controls),
    assignElements: (elements) => uiBindingRuntime.assignElements(elements),
    assignModifierFieldsets: () => uiBindingRuntime.assignModifierFieldsets(),
    clearFiltersButton: () => options.clearFiltersButton(),
    copiedEmojiKeys: state.copiedEmojiKeys.get,
    developerModeToggle: () => options.developerModeToggle(),
    modeChoices: () => options.modeChoices(),
    dialog: () => explorerRuntime.get("exampleDialog"),
    drawList: options.drawList,
    emojiFontChoices: () => options.emojiFontChoices(),
    emojiList: () => options.emojiList(),
    emojiNext: () => explorerRuntime.get("emojiNext"),
    emojiPrevious: () => explorerRuntime.get("emojiPrevious"),
    ensureEmojiCompositionControl,
    favoriteEmojiKeys: state.favoriteEmojiKeys.get,
    ensureUtilityPanel: async (panel) => {
      await ensureUtilityPanel(panel);
      refreshElements();
    },
    genderCheckboxes: () => options.genderCheckboxes(),
    groupFilterDialog: () => options.groupFilterDialog(),
    groupPickerTrigger: () => options.groupPickerTrigger(),
    groupSelector: () => options.groupSelector(),
    hairCheckboxes: () => options.hairCheckboxes(),
    helpDialog: () => options.helpDialog(),
    helpPicker: () => options.helpPicker(),
    hideModifierEmojiAccessibility: () =>
      uiBindingRuntime.hideModifierEmojiAccessibility(),
    installApp: options.installApp,
    installAppButton: () => options.installAppButton(),
    installDialog: () => options.installDialog(),
    languageDialog: () => options.languageDialog(),
    languageList: () => options.languageList(),
    languagePicker: () => options.languagePicker(),
    loadData: options.loadData,
    loadSearchLanguages: () => options.loadSearchLanguages(),
    loadUiTranslations: options.loadUiTranslations,
    matchCount: () => options.matchCount(),
    navigateEmoji: (amount: number) => options.navigateEmoji(amount),
    onClick: options.onClick,
    onCompactChoiceKeyDown: options.onCompactChoiceKeyDown,
    onDocumentKeyDown: options.onDocumentKeyDown,
    onEmojiDialogClick: options.onEmojiDialogClick,
    onEmojiDialogClose: options.onEmojiDialogClose,
    onEmojiFocus: options.onEmojiFocus,
    onHairChange: options.onHairChange,
    onEmojiKeyDown: options.onEmojiKeyDown,
    onGenderChange: options.onGenderChange,
    onSkinToneChange: options.onSkinToneChange,
    onOrderModeChange: options.onOrderModeChange,
    onPanelClose: onPanelDialogClose,
    onVersionRangeInput: options.onVersionRangeInput,
    openFilterPicker: options.openFilterPicker,
    orderButtons: () => options.orderButtons(),
    panelDialogs: options.panelDialogs,
    populateVersionModeOptions: options.populateVersionModeOptions,
    positionFavoriteButton,
    refreshElements,
    renderDeveloperMode: options.renderDeveloperMode,
    renderInstallAppButton: options.renderInstallAppButton,
    renderPixelFontToggle: options.renderPixelFontToggle,
    renderSavedEmoji: options.renderSavedEmoji,
    renderSearchLanguages: () => options.renderSearchLanguages(),
    renderVersionModeToggle: () => options.renderVersionModeToggle(),
    resolveElements: () => explorerRuntime.resolveElements(),
    resetFilters: () => options.resetFilters(),
    savedDialog: () => options.savedDialog(),
    savedPicker: () => options.savedPicker(),
    scheduleSearchDraw: options.scheduleSearchDraw,
    searchText: () => options.searchText(),
    selectEmojiFont: options.selectEmojiFont,
    setUrlStateReady: options.setUrlStateReady,
    showEmoji: options.showEmoji,
    skinToneCheckboxes: () => options.skinToneCheckboxes(),
    stepVersion: options.stepVersion,
    subGroupFilterDialog: () => options.subGroupFilterDialog(),
    subGroupPickerTrigger: () => options.subGroupPickerTrigger(),
    subGroupSelector: () => options.subGroupSelector(),
    suppressedPanelCloses: () => options.suppressedPanelCloses(),
    syncUrlState: options.syncUrlState,
    syncVersionRange: options.syncVersionRange,
    themeChoices: () => options.themeChoices(),
    toggleDeveloperMode: options.toggleDeveloperMode,
    toggleVersionMode: options.toggleVersionMode,
    toolbar: () => options.toolbar(),
    updateOnlineStatus: options.updateOnlineStatus,
    urlStateReady: () => options.urlStateReady(),
    versionModeSelector: () => options.versionModeSelector(),
    versionModeToggle: () => options.versionModeToggle(),
    versionNext: () => options.versionNext(),
    versionPrevious: () => options.versionPrevious(),
    versionRange: () => options.versionRange(),
    versionSelector: () => options.versionSelector(),
  });

  return {
    explorerRuntime,
    uiBindingRuntime,
    ensureEmojiCompositionControl,
    ensurePixelEditor: pixelEditorRuntime.ensurePixelEditor,
    populateVersionModeOptions: versionModeRuntime.populateOptions,
    renderVersionModeToggleController: versionModeRuntime.render,
    toggleVersionMode: versionModeRuntime.toggle,
    loadSearchLanguages: searchLanguageLifecycle.load,
    renderSearchLanguages: searchLanguageLifecycle.render,
    selectLanguageLink: searchLanguageLifecycle.select,
    setSearchLanguage: searchLanguageLifecycle.set,
    getEmojiGenders: (item) => getEmojiGenders(item, state.emojiByKey.get()),
    showEmoji: dialogRuntime.showEmoji,
    navigateEmoji: dialogRuntime.navigateEmoji,
    updateDialogNavigation: dialogRuntime.updateDialogNavigation,
    updateCompositionBackButton: dialogRuntime.updateCompositionBackButton,
    finishExplorerLoading: startupRuntime.finishExplorerLoading,
    onLoad: startupRuntime.onLoad,
    removeLegacyDialogElements: startupRuntime.removeLegacyDialogElements,
    revealExplorer: startupRuntime.revealExplorer,
  };
}
