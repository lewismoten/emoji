// @ts-nocheck -- Transitional bootstrap wiring.
import { createCategoryController } from "./category-controller.js";
import { createVersionRuntime } from "./version-runtime.js";
import { createListOrchestration } from "./list-orchestration.js";
import { createNavigationRuntime } from "./navigation-runtime.js";
import { createDialogViewRuntime } from "./dialog-view-runtime.js";
import { createEmojiDialogClickRuntime } from "./emoji-dialog-click-runtime.js";

export function createExplorerBootstrapControllers(options: any) {
  const categoryController = createCategoryController({
    compactGroupChoices: () => options.compactGroupChoices(),
    compactGroupLabel: () => options.compactGroupLabel(),
    compactSequenceChoices: () => options.compactSequenceChoices(),
    compactSequenceLabel: () => options.compactSequenceLabel(),
    compactSubGroupChoices: () => options.compactSubGroupChoices(),
    compactSubGroupLabel: () => options.compactSubGroupLabel(),
    developerModeEnabled: options.developerModeEnabled,
    drawList: () => options.drawList(),
    getVersionKeys: () => versionController.getVersionKeys(),
    groupFilterDialog: () => options.groupFilterDialog(),
    groupPickerTrigger: () => options.groupPickerTrigger(),
    groupSelector: () => options.groupSelector(),
    orderButtons: () => options.orderButtons(),
    savePreference: options.savePreference,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeEmoji: options.sequenceTypeEmoji,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTypeOrder: options.sequenceTypeOrder,
    sequenceTypeSelector: () => options.sequenceTypeSelector(),
    state: () => options.state(),
    subGroupFilterDialog: () => options.subGroupFilterDialog(),
    subGroupPickerTrigger: () => options.subGroupPickerTrigger(),
    subGroupSelector: () => options.subGroupSelector(),
    syncVersionRange: () => versionController.syncVersionRange(),
    translate: options.translate,
    unicodeGroupLabelKeys: options.unicodeGroupLabelKeys,
    unicodeSubgroupLabelKeys: options.unicodeSubgroupLabelKeys,
  });

  const listOrchestration = createListOrchestration({
    activeFilterSummary: () => options.activeFilterSummary(),
    activeFilterText: () => options.activeFilterText(),
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    displayExplorerLabel: options.displayExplorerLabel,
    displayGroupName: categoryController.displayGroupName,
    displayUnicodeSubGroupName: categoryController.displayUnicodeSubGroupName,
    emojiList: () => options.emojiList(),
    formatNumber: options.formatNumber,
    genderCheckboxes: () => options.genderCheckboxes(),
    getIntroducedVersion: options.getIntroducedVersion,
    getVersionKeys: () => versionController.getVersionKeys(),
    hairCheckboxes: () => options.hairCheckboxes(),
    matchCount: () => options.matchCount(),
    nextRenderGeneration: () => options.nextRenderGeneration(),
    onClick: options.onClick,
    renderGeneration: () => options.renderGeneration(),
    resetFilters: () => options.resetFilters(),
    revealExplorer: () => options.revealExplorer(),
    searchText: () => options.searchText(),
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTypeOrder: options.sequenceTypeOrder,
    skinToneCheckboxes: () => options.skinToneCheckboxes(),
    state: () => options.state(),
    subGroupSelectionKey: categoryController.subGroupSelectionKey,
    syncUrlState: () => options.syncUrlState(),
    translate: options.translate,
    unassigned: options.unassigned,
    updateDialogNavigation: () => options.updateDialogNavigation(),
    versionModeSelector: () => options.versionModeSelector(),
    versionSelector: () => options.versionSelector(),
    versionSliderLabel: (...args: any[]) =>
      versionController.versionSliderLabel(...args),
  });

  let versionController = createVersionRuntime({
    applyLoadedUrlState: (...args: any[]) =>
      navigationRuntime.applyLoadedUrlState(...args),
    buildRepresentatives: categoryController.buildRepresentatives,
    developerModeEnabled: options.developerModeEnabled,
    drawList: (...args: any[]) => listOrchestration.drawList(...args),
    getEmojiGenders: (...args: any[]) => options.getEmojiGenders(...args),
    getExplorerSubGroup: options.getExplorerSubGroup,
    getIntroducedVersion: options.getIntroducedVersion,
    groupSelector: () => options.groupSelector(),
    genderCheckboxes: () => options.genderCheckboxes(),
    genderFieldset: () => options.genderFieldset(),
    hairCheckboxes: () => options.hairCheckboxes(),
    hairFieldset: () => options.hairFieldset(),
    isViteDevelopment: options.isViteDevelopment,
    modifierFilters: () => options.modifierFilters(),
    onClick: options.onClick,
    onGroupChange: categoryController.onGroupSelectorChange,
    onSequenceTypeChange: categoryController.onSequenceTypeSelectorChange,
    onSubGroupChange: categoryController.onSubGroupSelectorChange,
    rebuildCodePointLookup: options.rebuildEmojiCodePointLookup,
    renderCategoryFilters: categoryController.renderCategoryFilters,
    sequenceTypeSelector: () => options.sequenceTypeSelector(),
    setDialogView: (...args: any[]) => options.setDialogView(...args),
    skinToneCheckboxes: () => options.skinToneCheckboxes(),
    skinToneFieldset: () => options.skinToneFieldset(),
    state: () => options.state(),
    subGroupSelector: () => options.subGroupSelector(),
    translate: options.translate,
    updateModifierArtwork: options.updateModifierArtwork,
    updatePixelArtworkManifest: options.updatePixelArtworkManifest,
    versionModeSelector: () => options.versionModeSelector(),
    versionNext: () => options.versionNext(),
    versionPrevious: () => options.versionPrevious(),
    versionRange: () => options.versionRange(),
    versionRangeValue: () => options.versionRangeValue(),
    versionSelector: () => options.versionSelector(),
  });

  const navigationRuntime = createNavigationRuntime({
    allowedSequenceTypes: options.sequenceTypeOrder,
    applyingUrlState: () => options.applyingUrlState(),
    compositionMode: () => options.state().compositionMode,
    currentEmojiKey: () => options.state().currentEmojiKey,
    developerModeEnabled: options.developerModeEnabled,
    dialog: () => options.dialog(),
    displayedKeys: () => options.state().displayedKeys,
    drawList: (...args: any[]) => listOrchestration.drawList(...args),
    emojiByKey: () => options.state().emojiByKey,
    focusInitialAction: () => options.focusInitialEmojiDialogAction(),
    genderCheckboxes: () => options.genderCheckboxes(),
    getOrderMode: () => options.state().orderMode,
    getSelectedGroup: () => options.state().selectedGroup,
    getSelectedSequenceType: () => options.state().selectedSequenceType,
    getSelectedSubGroup: () => options.state().selectedSubGroup,
    groups: () => options.state().groups,
    hairCheckboxes: () => options.hairCheckboxes(),
    helpDialog: () => options.helpDialog(),
    languageList: () => options.languageList(),
    latestReleasedVersion: () =>
      options.state().versionManifests.at(-1)?.version,
    navigateEmoji: (amount: number) => options.navigateEmoji(amount),
    orderButtons: () => options.orderButtons(),
    panelDialogs: options.panelDialogs,
    preferredOrder: () => options.state().explorerPreferences.order,
    renderCategoryFilters: (...args: any[]) =>
      categoryController.renderCategoryFilters(...args),
    renderSavedEmoji: options.renderSavedEmoji,
    renderVersionModeToggle: () => options.renderVersionModeToggle(),
    searchText: () => options.searchText(),
    setCompositionMode: (value: any) =>
      (options.state().compositionMode = value),
    setDialogView: (...args: any[]) => options.setDialogView(...args),
    setOrderMode: (value: any) => (options.state().orderMode = value),
    setSelectedGroup: (value: any) => (options.state().selectedGroup = value),
    setSelectedSequenceType: (value: any) =>
      (options.state().selectedSequenceType = value),
    setSelectedSubGroup: (value: any) =>
      (options.state().selectedSubGroup = value),
    setSuppressDialogCloseSync: (value: any) =>
      options.setSuppressDialogCloseSync(value),
    showEmoji: (...args: any[]) => options.showEmoji(...args),
    skinToneCheckboxes: () => options.skinToneCheckboxes(),
    subGroupSelectionKey: categoryController.subGroupSelectionKey,
    subGroups: () => options.state().subGroups,
    suppressedPanelCloses: () => options.suppressedPanelCloses(),
    syncVersionRange: (...args: any[]) =>
      versionController.syncVersionRange(...args),
    urlStateReady: () => options.urlStateReady(),
    versionModeSelector: () => options.versionModeSelector(),
    versionRange: () => options.versionRange(),
    versionSelector: () => options.versionSelector(),
  });

  const dialogViewRuntime = createDialogViewRuntime({
    byId: () => options.state().byId,
    currentDialogParentStack: () => options.state().currentDialogParentStack,
    currentEmojiKey: () => options.state().currentEmojiKey,
    developerModeEnabled: options.developerModeEnabled,
    dialog: () => options.dialog(),
    emojiByKey: () => options.state().emojiByKey,
    emojiParent: () => options.emojiParent(),
    ensurePixelEditor: () => options.ensurePixelEditor(),
    getPixelEditor: () => options.getPixelEditor(),
    loadPackageManifest: options.loadPackageManifest,
    syncUrlState: (...args: any[]) => options.syncUrlState(...args),
    translate: options.translate,
    updateCompositionBackButton: (...args: any[]) =>
      options.updateCompositionBackButton(...args),
    updateImportExamples: options.updateEmojiImportExamples,
  });

  const onEmojiDialogClick = createEmojiDialogClickRuntime({
    animateCopy: options.animateCopy,
    byId: () => options.state().byId,
    copy: options.copyToClipboardValue,
    currentDialogParentStack: () => options.state().currentDialogParentStack,
    currentEmojiCopies: () => options.state().currentEmojiCopies,
    currentEmojiKey: () => options.state().currentEmojiKey,
    dialog: () => options.dialog(),
    emojiByKey: () => options.state().emojiByKey,
    languageList: () => options.languageList(),
    openPanel: options.openPanel,
    panelDialogs: options.panelDialogs,
    recordCopiedEmoji: options.recordCopiedEmoji,
    renderSavedEmoji: options.renderSavedEmoji,
    setSuppressDialogCloseSync: (value: any) =>
      options.setSuppressDialogCloseSync(value),
    setView: (...args: any[]) => dialogViewRuntime.setView(...args),
    showEmoji: (...args: any[]) => options.showEmoji(...args),
    syncUrlState: (...args: any[]) => options.syncUrlState(...args),
    toggleComposition: () =>
      (options.state().compositionMode =
        options.state().compositionMode === "full" ? "condensed" : "full"),
    toggleFavorite: options.toggleFavorite,
    translate: options.translate,
    updateCompositionBackButton: () => options.updateCompositionBackButton(),
    updateEmojiComposition: options.updateEmojiComposition,
    clearCurrentDialogParentStack: () => {
      /* node:coverage ignore next */
      options.state().currentDialogParentStack = [];
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
