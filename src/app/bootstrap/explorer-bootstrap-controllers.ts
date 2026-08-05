// @ts-nocheck -- Transitional bootstrap wiring.
import { createCategoryController } from "../category-controller.js";
import { createVersionRuntime } from "../version/version-runtime.js";
import { createListOrchestration } from "../list-orchestration.js";
import { createNavigationRuntime } from "../navigation-runtime.js";
import { createDialogViewRuntime } from "../dialog/dialog-view-runtime.js";
import { createEmojiDialogClickRuntime } from "../emoji/emoji-dialog-click-runtime.js";
import * as preferences from "../../preferences.js";
export function createExplorerBootstrapControllers(options: any) {
  return createExplorerBootstrapControllersWithFactories(options, {});
}

export function createExplorerBootstrapControllersWithFactories(
  options: any,
  factories: any,
) {
  const createCategoryControllerFactory =
    factories.createCategoryController ?? createCategoryController;
  const createVersionRuntimeFactory =
    factories.createVersionRuntime ?? createVersionRuntime;
  const createListOrchestrationFactory =
    factories.createListOrchestration ?? createListOrchestration;
  const createNavigationRuntimeFactory =
    factories.createNavigationRuntime ?? createNavigationRuntime;
  const createDialogViewRuntimeFactory =
    factories.createDialogViewRuntime ?? createDialogViewRuntime;
  const createEmojiDialogClickRuntimeFactory =
    factories.createEmojiDialogClickRuntime ?? createEmojiDialogClickRuntime;

  const state = options.state;

  const categoryController = createCategoryControllerFactory({
    compactGroupChoices: options.compactGroupChoices,
    compactGroupLabel: options.compactGroupLabel,
    compactSequenceChoices: options.compactSequenceChoices,
    compactSequenceLabel: options.compactSequenceLabel,
    compactSubGroupChoices: options.compactSubGroupChoices,
    compactSubGroupLabel: options.compactSubGroupLabel,
    developerModeEnabled: options.developerModeEnabled,
    drawList: options.drawList,
    getVersionKeys: () => versionController.getVersionKeys(),
    groupFilterDialog: options.groupFilterDialog,
    groupPickerTrigger: options.groupPickerTrigger,
    groupSelector: options.groupSelector,
    orderButtons: options.orderButtons,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeEmoji: options.sequenceTypeEmoji,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTypeOrder: options.sequenceTypeOrder,
    sequenceTypeSelector: options.sequenceTypeSelector,
    state,
    subGroupFilterDialog: options.subGroupFilterDialog,
    subGroupPickerTrigger: options.subGroupPickerTrigger,
    subGroupSelector: options.subGroupSelector,
    syncVersionRange: () => versionController.syncVersionRange(),
    translate: options.translate,
    unicodeGroupLabelKeys: options.unicodeGroupLabelKeys,
    unicodeSubgroupLabelKeys: options.unicodeSubgroupLabelKeys,
  });

  const listOrchestration = createListOrchestrationFactory({
    activeFilterSummary: options.activeFilterSummary,
    activeFilterText: options.activeFilterText,
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    displayExplorerLabel: options.displayExplorerLabel,
    displayGroupName: categoryController.displayGroupName,
    emojiList: options.emojiList,
    formatNumber: options.formatNumber,
    genderCheckboxes: options.genderCheckboxes,
    getIntroducedVersion: options.getIntroducedVersion,
    getVersionKeys: () => versionController.getVersionKeys(),
    hairCheckboxes: options.hairCheckboxes,
    matchCount: options.matchCount,
    nextRenderGeneration: options.nextRenderGeneration,
    onClick: options.onClick,
    renderGeneration: () => options.renderGeneration(),
    resetFilters: options.resetFilters,
    revealExplorer: options.revealExplorer,
    searchText: options.searchText,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTypeOrder: options.sequenceTypeOrder,
    skinToneCheckboxes: options.skinToneCheckboxes,
    state,
    subGroupSelectionKey: categoryController.subGroupSelectionKey,
    syncUrlState: options.syncUrlState,
    translate: options.translate,
    unassigned: options.unassigned,
    updateDialogNavigation: options.updateDialogNavigation,
    versionModeSelector: options.versionModeSelector,
    versionSelector: options.versionSelector,
    versionSliderLabel: (...args: any[]) =>
      versionController.versionSliderLabel(...args),
  });

  let versionController = createVersionRuntimeFactory({
    applyLoadedUrlState: (...args: any[]) =>
      navigationRuntime.applyLoadedUrlState(...args),
    buildRepresentatives: categoryController.buildRepresentatives,
    developerModeEnabled: options.developerModeEnabled,
    drawList: listOrchestration.drawList,
    getEmojiGenders: options.getEmojiGenders,
    getExplorerSubGroup: options.getExplorerSubGroup,
    getIntroducedVersion: options.getIntroducedVersion,
    groupSelector: options.groupSelector,
    genderCheckboxes: options.genderCheckboxes,
    genderFieldset: options.genderFieldset,
    hairCheckboxes: options.hairCheckboxes,
    hairFieldset: options.hairFieldset,
    isViteDevelopment: options.isViteDevelopment,
    modifierFilters: options.modifierFilters,
    onClick: options.onClick,
    onGroupChange: categoryController.onGroupSelectorChange,
    onSequenceTypeChange: categoryController.onSequenceTypeSelectorChange,
    onSubGroupChange: categoryController.onSubGroupSelectorChange,
    rebuildCodePointLookup: options.rebuildEmojiCodePointLookup,
    renderCategoryFilters: categoryController.renderCategoryFilters,
    sequenceTypeSelector: options.sequenceTypeSelector,
    setDialogView: options.setDialogView,
    skinToneCheckboxes: options.skinToneCheckboxes,
    skinToneFieldset: options.skinToneFieldset,
    state,
    subGroupSelector: options.subGroupSelector,
    translate: options.translate,
    updateModifierArtwork: options.updateModifierArtwork,
    updatePixelArtworkManifest: options.updatePixelArtworkManifest,
    versionModeSelector: options.versionModeSelector,
    versionNext: options.versionNext,
    versionPrevious: options.versionPrevious,
    versionRange: options.versionRange,
    versionRangeValue: options.versionRangeValue,
    versionSelector: options.versionSelector,
  });

  const navigationRuntime = createNavigationRuntimeFactory({
    allowedSequenceTypes: options.sequenceTypeOrder,
    applyingUrlState: options.applyingUrlState,
    compositionMode: () => state().compositionMode,
    currentEmojiKey: () => state().currentEmojiKey,
    developerModeEnabled: options.developerModeEnabled,
    fullDeveloperModeEnabled: options.fullDeveloperModeEnabled,
    dialog: options.dialog,
    displayedKeys: () => state().displayedKeys,
    drawList: listOrchestration.drawList,
    ensurePanelDialog: options.ensurePanelDialog,
    focusInitialAction: options.focusInitialEmojiDialogAction,
    genderCheckboxes: options.genderCheckboxes,
    getOrderMode: () => state().orderMode,
    getSelectedGroup: () => state().selectedGroup,
    getSelectedSequenceType: () => state().selectedSequenceType,
    getSelectedSubGroup: () => state().selectedSubGroup,
    groups: () => state().groups,
    hairCheckboxes: options.hairCheckboxes,
    helpDialog: options.helpDialog,
    languageList: options.languageList,
    latestReleasedVersion: () => state().versionManifests.at(-1)?.version,
    navigateEmoji: options.navigateEmoji,
    orderButtons: options.orderButtons,
    panelDialogs: options.panelDialogs,
    preferredOrder: () => preferences.getString("order"),
    renderCategoryFilters: categoryController.renderCategoryFilters,
    renderSavedEmoji: options.renderSavedEmoji,
    renderVersionModeToggle: options.renderVersionModeToggle,
    searchText: options.searchText,
    setCompositionMode: (value: any) => (state().compositionMode = value),
    setDialogView: options.setDialogView,
    setOrderMode: (value: any) => (state().orderMode = value),
    setSelectedGroup: (value: any) => (state().selectedGroup = value),
    setSelectedSequenceType: (value: any) =>
      (state().selectedSequenceType = value),
    setSelectedSubGroup: (value: any) => (state().selectedSubGroup = value),
    setSuppressDialogCloseSync: options.setSuppressDialogCloseSync,
    showEmoji: options.showEmoji,
    skinToneCheckboxes: options.skinToneCheckboxes,
    subGroupSelectionKey: categoryController.subGroupSelectionKey,
    suppressedPanelCloses: options.suppressedPanelCloses,
    syncVersionRange: (...args: any[]) =>
      versionController.syncVersionRange(...args),
    urlStateReady: options.urlStateReady,
    versionModeSelector: options.versionModeSelector,
    versionRange: options.versionRange,
    versionSelector: options.versionSelector,
  });

  const dialogViewRuntime = createDialogViewRuntimeFactory({
    currentDialogParentStack: () => state().currentDialogParentStack,
    currentEmojiKey: () => state().currentEmojiKey,
    developerModeEnabled: options.developerModeEnabled,
    fullDeveloperModeEnabled: options.fullDeveloperModeEnabled,
    dialog: options.dialog,
    emojiParent: options.emojiParent,
    ensurePixelEditor: options.ensurePixelEditor,
    getPixelEditor: options.getPixelEditor,
    loadPackageManifest: options.loadPackageManifest,
    syncUrlState: options.syncUrlState,
    translate: options.translate,
    updateCompositionBackButton: options.updateCompositionBackButton,
    updateImportExamples: options.updateEmojiImportExamples,
  });

  const onEmojiDialogClick = createEmojiDialogClickRuntimeFactory({
    animateCopy: options.animateCopy,
    copy: options.copyToClipboardValue,
    currentDialogParentStack: () => state().currentDialogParentStack,
    currentEmojiCopies: () => state().currentEmojiCopies,
    currentEmojiKey: () => state().currentEmojiKey,
    dialog: options.dialog,
    languageList: options.languageList,
    openPanel: options.openPanel,
    panelDialogs: options.panelDialogs,
    recordCopiedEmoji: options.recordCopiedEmoji,
    renderSavedEmoji: options.renderSavedEmoji,
    setSuppressDialogCloseSync: options.setSuppressDialogCloseSync,
    setView: dialogViewRuntime.setView,
    showEmoji: options.showEmoji,
    syncUrlState: options.syncUrlState,
    toggleComposition: () =>
      (state().compositionMode =
        state().compositionMode === "full" ? "condensed" : "full"),
    toggleFavorite: options.toggleFavorite,
    translate: options.translate,
    updateCompositionBackButton: options.updateCompositionBackButton,
    updateEmojiComposition: options.updateEmojiComposition,
    clearCurrentDialogParentStack: () => {
      state().currentDialogParentStack = [];
    },
  });

  return {
    ...categoryController,
    ...versionController,
    ...listOrchestration,
    ...navigationRuntime,
    ...dialogViewRuntime,
    onEmojiDialogClick,
  };
}
