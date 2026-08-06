import * as sharedState from "../../../../src/state.js";

function bindState(state: any) {
  Object.defineProperties(state, {
    byId: {
      get: () => sharedState.byId.get(),
      set: (value) => sharedState.byId.replace(value),
    },
    compositionMode: {
      get: () => sharedState.compositionMode.get(),
      set: (value) => sharedState.compositionMode.set(value),
    },
    currentDialogParentStack: {
      get: () => sharedState.currentDialogParentStack.get(),
      set: (value) => sharedState.currentDialogParentStack.set(value),
    },
    currentEmojiCopies: {
      get: () => sharedState.currentEmojiCopies.get(),
      set: (value) => sharedState.currentEmojiCopies.replace(value),
    },
    currentEmojiKey: {
      get: () => sharedState.currentEmojiKey.get(),
      set: (value) => sharedState.currentEmojiKey.set(value),
    },
    dialogNavigationKeys: {
      get: () => sharedState.dialogNavigationKeys.get(),
      set: (value) => sharedState.dialogNavigationKeys.set(value),
    },
    displayedKeys: {
      get: () => sharedState.displayedKeys.get(),
      set: (value) => sharedState.displayedKeys.set(value),
    },
    emojiByKey: {
      get: () => sharedState.emojiByKey.get(),
      set: (value) => sharedState.emojiByKey.replace(value),
    },
    groups: {
      get: () => sharedState.groups.get(),
      set: (value) => sharedState.groups.set(value),
    },
    items: {
      get: () => sharedState.items.get(),
      set: (value) => sharedState.items.set(value),
    },
    orderMode: {
      get: () => sharedState.orderMode.get(),
      set: (value) => sharedState.orderMode.set(value),
    },
    searchAnnotations: {
      get: () => sharedState.searchAnnotations.get(),
      set: (value) => sharedState.searchAnnotations.replace(value),
    },
    selectedGroup: {
      get: () => sharedState.selectedGroup.get(),
      set: (value) => sharedState.selectedGroup.set(value),
    },
    selectedSequenceType: {
      get: () => sharedState.selectedSequenceType.get(),
      set: (value) => sharedState.selectedSequenceType.set(value),
    },
    selectedSubGroup: {
      get: () => sharedState.selectedSubGroup.get(),
      set: (value) => sharedState.selectedSubGroup.set(value),
    },
    subGroups: {
      get: () => sharedState.subGroups.get(),
      set: (value) => sharedState.subGroups.replace(value),
    },
    versionManifests: {
      get: () => sharedState.versionManifests.get(),
      set: (value) => sharedState.versionManifests.set(value),
    },
  });
}

export function createExplorerBootstrapControllersRuntimeFixture() {
  const state: any = {
    byId: { wrappedGift: { key: "wrappedGift" } },
    compositionMode: "full",
    currentDialogParentStack: ["favorites"],
    currentEmojiCopies: { emoji: "🎁" },
    currentEmojiKey: "wrappedGift",
    dialogNavigationKeys: ["wrappedGift"],
    displayedKeys: ["wrappedGift", "sparkles"],
    emojiByKey: { wrappedGift: "🎁", sparkles: "✨" },
    explorerPreferences: { order: "grouped" },
    groups: ["Objects"],
    items: [{ key: "wrappedGift" }],
    orderMode: "grouped",
    searchAnnotations: { wrappedGift: ["gift"] },
    selectedGroup: "Objects",
    selectedSequenceType: "single",
    selectedSubGroup: "money",
    subGroups: { Objects: ["money"] },
    versionManifests: [{ version: "17.0" }],
  };

  sharedState.byId.replace(state.byId);
  sharedState.compositionMode.set(state.compositionMode);
  sharedState.currentDialogParentStack.set(state.currentDialogParentStack);
  sharedState.currentEmojiCopies.replace(state.currentEmojiCopies);
  sharedState.currentEmojiKey.set(state.currentEmojiKey);
  sharedState.dialogNavigationKeys.set(state.dialogNavigationKeys);
  sharedState.displayedKeys.set(state.displayedKeys);
  sharedState.emojiByKey.replace(state.emojiByKey);
  sharedState.groups.set(state.groups);
  sharedState.items.set(state.items);
  sharedState.orderMode.set(state.orderMode);
  sharedState.searchAnnotations.replace(state.searchAnnotations);
  sharedState.selectedGroup.set(state.selectedGroup);
  sharedState.selectedSequenceType.set(state.selectedSequenceType);
  sharedState.selectedSubGroup.set(state.selectedSubGroup);
  sharedState.subGroups.replace(state.subGroups);
  sharedState.versionManifests.set(state.versionManifests);
  bindState(state);

  const calls: string[] = [];
  const options: any = {
    activeFilterSummary: () => "summary",
    activeFilterText: () => "summary-text",
    animateCopy: () => calls.push("animateCopy"),
    applyingUrlState: () => false,
    applyPixelArtworkClass: "apply-pixel",
    compactGroupChoices: () => "compact-group-choices",
    compactGroupLabel: () => "compact-group-label",
    compactSequenceChoices: () => "compact-sequence-choices",
    compactSequenceLabel: () => "compact-sequence-label",
    compactSubGroupChoices: () => "compact-subgroup-choices",
    compactSubGroupLabel: () => "compact-subgroup-label",
    copyToClipboardValue: "copyToClipboardValue",
    developerModeEnabled: () => true,
    ensurePanelDialog: () => "ensure-panel-dialog",
    fullDeveloperModeEnabled: () => "full-developer-mode",
    dialog: () => ({ open: true }),
    displayExplorerLabel: (label: string) => `explorer:${label}`,
    drawList: () => "drawList-option",
    emojiList: () => "emoji-list",
    emojiParent: () => "emoji-parent",
    ensurePixelEditor: () => "ensure-pixel-editor",
    focusInitialEmojiDialogAction: () => "focus-initial",
    formatNumber: (value: number) => `fmt:${value}`,
    genderCheckboxes: () => ["gender"],
    genderFieldset: () => "gender-fieldset",
    getEmojiGenders: (...args: any[]) => ["genders", ...args],
    getExplorerSubGroup: () => "explorer-subgroup",
    getIntroducedVersion: () => "17.0",
    getPixelEditor: () => "pixel-editor",
    groupFilterDialog: () => "group-dialog",
    groupPickerTrigger: () => "group-trigger",
    groupSelector: () => "group-selector",
    hairCheckboxes: () => ["hair"],
    hairFieldset: () => "hair-fieldset",
    helpDialog: () => "help-dialog",
    isViteDevelopment: true,
    languageList: () => "language-list",
    loadPackageManifest: () => "loadPackageManifest",
    matchCount: () => "match-count",
    modifierFilters: () => "modifier-filters",
    navigateEmoji: (amount: number) => `navigate:${amount}`,
    nextRenderGeneration: () => 7,
    onClick: "on-click",
    openPanel: "open-panel",
    orderButtons: () => ["order-buttons"],
    panelDialogs: () => ({ help: "help-panel" }),
    recordCopiedEmoji: "record-copied-emoji",
    rebuildEmojiCodePointLookup: "rebuild-lookup",
    renderSavedEmoji: "render-saved-emoji",
    renderGeneration: () => 7,
    renderVersionModeToggle: () => "render-version-toggle",
    resetFilters: () => "reset-filters",
    revealExplorer: () => "reveal-explorer",
    savePreference: "save-preference",
    searchText: () => "search-text",
    sequenceTranslationKeys: { single: "single" },
    sequenceTypeEmoji: { single: "1️⃣" },
    sequenceTypeLabels: { single: "Single" },
    sequenceTypeOrder: ["single"],
    sequenceTypeSelector: () => "sequence-selector",
    setDialogView: (...args: any[]) => ["setDialogView", ...args],
    setSuppressDialogCloseSync: (value: unknown) => {
      calls.push(`setSuppressDialogCloseSync:${String(value)}`);
    },
    showEmoji: (...args: any[]) => ["showEmoji", ...args],
    skinToneCheckboxes: () => ["skin"],
    skinToneFieldset: () => "skin-fieldset",
    state: () => state,
    subGroupFilterDialog: () => "subgroup-dialog",
    subGroupPickerTrigger: () => "subgroup-trigger",
    subGroupSelector: () => "subgroup-selector",
    suppressedPanelCloses: () => "suppressed-panel-closes",
    syncUrlState: (...args: any[]) => ["syncUrlState", ...args],
    toggleFavorite: "toggle-favorite",
    translate: (key: string, fallback: string) => `${key}:${fallback}`,
    unassigned: "unassigned",
    unicodeGroupLabelKeys: { Objects: "objects" },
    unicodeSubgroupLabelKeys: { money: "money" },
    updateCompositionBackButton: (...args: any[]) => [
      "updateCompositionBackButton",
      ...args,
    ],
    updateDialogNavigation: () => "updateDialogNavigation",
    updateEmojiComposition: "update-emoji-composition",
    updateEmojiImportExamples: "update-emoji-import-examples",
    updateModifierArtwork: "updateModifierArtwork",
    updatePixelArtworkManifest: "updatePixelArtworkManifest",
    urlStateReady: () => true,
    versionModeSelector: () => "version-mode-selector",
    versionNext: () => "version-next",
    versionPrevious: () => "version-previous",
    versionRange: () => "version-range",
    versionRangeValue: () => "version-range-value",
    versionSelector: () => "version-selector",
  };

  return { calls, options, state };
}
