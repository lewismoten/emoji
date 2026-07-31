import { createExplorerBootstrapControllers } from "../../../../src/app/bootstrap/explorer-bootstrap-controllers.js";

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
