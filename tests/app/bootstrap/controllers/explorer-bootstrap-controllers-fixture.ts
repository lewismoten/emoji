import { createExplorerBootstrapControllers } from "../../../../src/app/bootstrap/explorer-bootstrap-controllers.js";
import * as sharedState from "../../../../src/state.js";

function bindState(state: any) {
  Object.defineProperties(state, {
    allIds: {
      get: () => sharedState.allIds.get(),
      set: (value) => sharedState.allIds.set(Array.from(value)),
    },
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
    focusedEmojiKey: {
      get: () => sharedState.focusedEmojiKey.get(),
      set: (value) => sharedState.focusedEmojiKey.set(value),
    },
    groups: {
      get: () => sharedState.groups.get(),
      set: (value) => sharedState.groups.set(value),
    },
    items: {
      get: () => sharedState.items.get(),
      set: (value) => sharedState.items.set(value as any),
    },
    orderMode: {
      get: () => sharedState.orderMode.get(),
      set: (value) => sharedState.orderMode.set(value),
    },
    proposedVersionManifests: {
      get: () => sharedState.proposedVersionManifests.get(),
      set: (value) => sharedState.proposedVersionManifests.set(value),
    },
    searchAnnotations: {
      get: () => sharedState.searchAnnotations.get(),
      set: (value) => sharedState.searchAnnotations.replace(value),
    },
    searchLabels: {
      get: () => sharedState.searchLabels.get(),
      set: (value) => sharedState.searchLabels.replace(value),
    },
    searchSubgroupLabels: {
      get: () => sharedState.searchSubgroupLabels.get(),
      set: (value) => sharedState.searchSubgroupLabels.replace(value),
    },
    selectedGroup: {
      get: () => sharedState.selectedGroup.get(),
      set: (value) => sharedState.selectedGroup.set(value),
    },
    selectedSearchLocale: {
      get: () => sharedState.selectedSearchLocale.get(),
      set: (value) => sharedState.selectedSearchLocale.set(value),
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
    versionKeys: {
      get: () => sharedState.versionKeys.get(),
      set: (value) => sharedState.versionKeys.replace(value),
    },
    versionManifests: {
      get: () => sharedState.versionManifests.get(),
      set: (value) => sharedState.versionManifests.set(value),
    },
  });
}

export function installBootstrapControllerDom() {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  (globalThis as any).document = {
    createDocumentFragment() {
      return {
        append() {},
        appendChild() {},
        childNodes: [],
      };
    },
    createElement() {
      return {
        append() {},
        appendChild() {},
        classList: {
          add() {},
          remove() {},
          toggle() {},
          contains() {
            return false;
          },
        },
        dataset: {},
        getContext() {
          return null;
        },
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
        setAttribute() {},
        textContent: "",
      };
    },
    getElementsByClassName() {
      return [];
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    documentElement: { dir: "ltr" },
  };

  return {
    restore() {
      (globalThis as any).document = originalDocument;
      (globalThis as any).window = originalWindow;
    },
  };
}

export function createBootstrapControllersFixture() {
  const state = {
    allIds: new Set<string>(),
    byId: {},
    compositionMode: "full",
    currentDialogParentStack: [] as string[],
    currentEmojiCopies: {} as Record<string, string>,
    currentEmojiKey: "",
    dialogNavigationKeys: [] as string[],
    displayedKeys: [] as string[],
    emojiByKey: {} as Record<string, string>,
    explorerPreferences: { order: "grouped" },
    focusedEmojiKey: "",
    groups: [] as string[],
    items: [] as Array<Record<string, unknown>>,
    orderMode: "grouped",
    proposedVersionManifests: [] as Array<{ version: string }>,
    searchAnnotations: {} as Record<string, string[]>,
    searchLabels: {} as Record<string, string>,
    searchSubgroupLabels: {} as Record<string, string>,
    selectedGroup: "",
    selectedSearchLocale: "en",
    selectedSequenceType: "",
    selectedSubGroup: "",
    subGroups: {} as Record<string, string[]>,
    versionKeys: new Map<string, Set<string>>(),
    versionManifests: [] as Array<{ version: string }>,
  };

  sharedState.allIds.set([]);
  sharedState.byId.replace(state.byId);
  sharedState.compositionMode.set(state.compositionMode as "condensed");
  sharedState.currentDialogParentStack.set(state.currentDialogParentStack);
  sharedState.currentEmojiCopies.replace(state.currentEmojiCopies);
  sharedState.currentEmojiKey.set(state.currentEmojiKey);
  sharedState.dialogNavigationKeys.set(state.dialogNavigationKeys);
  sharedState.displayedKeys.set(state.displayedKeys);
  sharedState.emojiByKey.replace(state.emojiByKey);
  sharedState.focusedEmojiKey.set(state.focusedEmojiKey);
  sharedState.groups.set(state.groups);
  sharedState.items.set(state.items as any);
  sharedState.orderMode.set(state.orderMode as "grouped" | "sequence");
  sharedState.proposedVersionManifests.set(state.proposedVersionManifests);
  sharedState.searchAnnotations.replace(state.searchAnnotations);
  sharedState.searchLabels.replace(state.searchLabels);
  sharedState.searchSubgroupLabels.replace(state.searchSubgroupLabels);
  sharedState.selectedGroup.set(state.selectedGroup);
  sharedState.selectedSearchLocale.set(state.selectedSearchLocale);
  sharedState.selectedSequenceType.set(state.selectedSequenceType);
  sharedState.selectedSubGroup.set(state.selectedSubGroup);
  sharedState.subGroups.replace(state.subGroups);
  sharedState.versionKeys.replace(state.versionKeys);
  sharedState.versionManifests.set(state.versionManifests);
  bindState(state);

  const options: any = {
    activeFilterSummary: () => undefined,
    activeFilterText: () => undefined,
    animateCopy: () => {},
    applyingUrlState: () => false,
    applyPixelArtworkClass: () => {},
    compactGroupChoices: () => undefined,
    compactGroupLabel: () => undefined,
    compactSequenceChoices: () => undefined,
    compactSequenceLabel: () => undefined,
    compactSubGroupChoices: () => undefined,
    compactSubGroupLabel: () => undefined,
    copyToClipboardValue: async () => true,
    developerModeEnabled: () => false,
    dialog: () => ({
      close() {},
      showModal() {},
      querySelector() {
        return null;
      },
    }),
    displayExplorerLabel: (label: string) => label,
    drawList: () => {},
    emojiList: () => undefined,
    emojiParent: () => undefined,
    ensurePixelEditor: async () => undefined,
    focusInitialEmojiDialogAction: () => {},
    formatNumber: (value: number) => String(value),
    genderCheckboxes: () => [],
    genderFieldset: () => undefined,
    getEmojiGenders: () => new Set<string>(),
    getExplorerSubGroup: () => "",
    getIntroducedVersion: () => "—",
    getPixelEditor: () => undefined,
    groupFilterDialog: () => undefined,
    groupPickerTrigger: () => undefined,
    groupSelector: () => ({
      value: "",
      replaceChildren() {},
      closest() {
        return null;
      },
    }),
    hairCheckboxes: () => [],
    hairFieldset: () => undefined,
    helpDialog: () => undefined,
    isViteDevelopment: false,
    languageList: () => undefined,
    loadPackageManifest: async () => ({}),
    matchCount: () => undefined,
    modifierFilters: () => undefined,
    navigateEmoji: () => {},
    nextRenderGeneration: () => 1,
    onClick: () => {},
    openPanel: () => {},
    orderButtons: () => [],
    panelDialogs: () => ({}),
    recordCopiedEmoji: () => {},
    rebuildEmojiCodePointLookup: () => {},
    renderCategoryFilters: () => {},
    renderGeneration: () => 1,
    renderSavedEmoji: () => {},
    renderVersionModeToggle: () => {},
    resetFilters: () => {},
    revealExplorer: () => {},
    savePreference: () => {},
    searchText: () => ({ value: "" }),
    sequenceTranslationKeys: {},
    sequenceTypeEmoji: {},
    sequenceTypeLabels: {},
    sequenceTypeOrder: [],
    sequenceTypeSelector: () => ({
      value: "",
      replaceChildren() {},
      closest() {
        return null;
      },
    }),
    setDialogView: () => {},
    setSuppressDialogCloseSync: () => {},
    showEmoji: () => {},
    skinToneCheckboxes: () => [],
    skinToneFieldset: () => undefined,
    state: () => state,
    subGroupFilterDialog: () => undefined,
    subGroupPickerTrigger: () => undefined,
    subGroupSelector: () => ({
      value: "",
      replaceChildren() {},
      closest() {
        return null;
      },
    }),
    suppressedPanelCloses: () => new WeakSet(),
    syncUrlState: () => {},
    translate: (_key: string, fallback: string) => fallback,
    unassigned: "\u0000",
    unicodeGroupLabelKeys: {},
    unicodeSubgroupLabelKeys: {},
    updateCompositionBackButton: () => {},
    updateDialogNavigation: () => {},
    updateEmojiComposition: () => {},
    updateEmojiImportExamples: () => {},
    updateModifierArtwork: () => {},
    updatePixelArtworkManifest: () => {},
    urlStateReady: () => true,
    versionModeSelector: () => ({ value: "through" }),
    versionNext: () => undefined,
    versionPrevious: () => undefined,
    versionRange: () => undefined,
    versionRangeValue: () => undefined,
    versionSelector: () => ({ value: "" }),
  };

  return {
    controllerApi: createExplorerBootstrapControllers(options) as any,
    createControllers(overrides: Record<string, unknown>) {
      return createExplorerBootstrapControllers({ ...options, ...overrides });
    },
    options,
    state,
  };
}
