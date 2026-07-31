import assert from "node:assert/strict";
import { createExplorerBootstrapControllers } from "../../../src/app/bootstrap/explorer-bootstrap-controllers.js";

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
(globalThis as any).document = {
  createElement() {
    return {
      getContext() {
        return null;
      },
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
  documentElement: {
    dir: "ltr",
  },
};

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

const controllers = createExplorerBootstrapControllers(options);
const controllerApi = controllers as any;

assert.equal(typeof controllers.buildRepresentatives, "function");
assert.equal(typeof controllers.closeFilterPicker, "function");
assert.equal(typeof controllers.displayGroupName, "function");
assert.equal(typeof controllers.displayUnicodeSubGroupName, "function");
assert.equal(typeof controllers.drawList, "function");
assert.equal(typeof controllers.focusInitialAction, "function");
assert.equal(typeof controllers.focusCompactChoice, "function");
assert.equal(typeof controllers.getGroupRepresentativeEmoji, "function");
assert.equal(typeof controllers.getSubGroupRepresentativeEmoji, "function");
assert.equal(typeof controllers.getVersionKeys, "function");
assert.equal(typeof controllers.loadVersionData, "function");
assert.equal(typeof controllers.onCompactChoiceKeyDown, "function");
assert.equal(typeof controllers.onEmojiDialogClick, "function");
assert.equal(typeof controllers.onEmojiFocus, "function");
assert.equal(typeof controllers.onEmojiKeyDown, "function");
assert.equal(typeof controllers.onGroupSelectorChange, "function");
assert.equal(typeof controllers.onOrderModeChange, "function");
assert.equal(typeof controllers.onSequenceTypeSelectorChange, "function");
assert.equal(typeof controllers.onSubGroupSelectorChange, "function");
assert.equal(typeof controllers.openFilterPicker, "function");
assert.equal(typeof controllers.refreshLocalizedLabels, "function");
assert.equal(typeof controllers.renderCategoryFilters, "function");
assert.equal(typeof controllers.scheduleSearchDraw, "function");
assert.equal(typeof controllers.setView, "function");
assert.equal(typeof controllers.subGroupSelectionKey, "function");
assert.equal(typeof controllers.syncVersionRange, "function");
assert.equal(typeof controllers.updateActiveFilterSummary, "function");
assert.equal(typeof controllers.updateAvailableCategories, "function");
assert.equal(typeof controllers.versionSliderLabel, "function");
assert.doesNotThrow(() => controllerApi.buildRepresentatives("gift"));
assert.doesNotThrow(() => controllerApi.closeFilterPicker());
assert.equal(controllerApi.displayGroupName("Objects"), "Objects");
assert.equal(controllerApi.displayUnicodeSubGroupName("mail"), "Mail");
assert.doesNotThrow(() => controllerApi.getGroupRepresentativeEmoji());
assert.doesNotThrow(() => controllerApi.getSubGroupRepresentativeEmoji());
assert.doesNotThrow(() => controllerApi.getVersionKeys());
assert.doesNotThrow(() =>
  controllerApi.onEmojiDialogClick({
    target: {
      closest() {
        return null;
      },
    },
  }),
);
assert.doesNotThrow(() =>
  controllerApi.onEmojiFocus({
    target: {
      closest() {
        return null;
      },
    },
  }),
);
assert.doesNotThrow(() =>
  controllerApi.onEmojiKeyDown({
    key: "Enter",
    preventDefault() {},
    target: {
      closest() {
        return null;
      },
    },
  }),
);
assert.doesNotThrow(() => controllerApi.openFilterPicker());
assert.doesNotThrow(() => controllerApi.refreshLocalizedLabels());
assert.equal(
  controllerApi.subGroupSelectionKey("Objects", "mail"),
  "Objects::mail",
);
assert.doesNotThrow(() => controllerApi.syncVersionRange("17.0"));
assert.doesNotThrow(() => controllerApi.updateActiveFilterSummary());
assert.doesNotThrow(() => controllerApi.versionSliderLabel("17.0"));

(globalThis as any).window = {
  history: {
    state: {
      dialogParentPanel: "favorites",
      compositionParent: "wrappedGift",
    },
  },
  location: { href: "https://example.test/" },
};

let dialogClosed = false;
let suppressSync = false;
let openedPanel: any = undefined;
let syncedState: any = undefined;
state.currentDialogParentStack = ["favorites"];
const dialogElement = {
  dataset: { dialogParentPanel: "favorites" },
  close() {
    dialogClosed = true;
  },
  showModal() {},
  querySelector() {
    return null;
  },
};
const clickControllers = createExplorerBootstrapControllers({
  ...options,
  dialog: () => dialogElement,
  languageList: () => "language-list",
  openPanel: (value: unknown) => {
    openedPanel = value;
  },
  panelDialogs: () => ({ favorites: "favorites-dialog" }),
  setSuppressDialogCloseSync: (value: boolean) => {
    suppressSync = value;
  },
  syncUrlState: (...args: unknown[]) => {
    syncedState = args;
  },
});

clickControllers.onEmojiDialogClick({
  target: {
    closest(selector: string) {
      return selector === ".emoji-parent" ? {} : null;
    },
  },
} as unknown as MouseEvent);

assert.equal(dialogClosed, true);
assert.equal(suppressSync, false);
assert.deepEqual(state.currentDialogParentStack, []);
assert.equal(openedPanel.panel, "favorites");
assert.equal(openedPanel.addHistory, false);
assert.deepEqual(openedPanel.dialogs, { favorites: "favorites-dialog" });
assert.equal(openedPanel.languageList, "language-list");
assert.equal(openedPanel.renderSavedEmoji, options.renderSavedEmoji);
assert.equal(typeof openedPanel.syncUrlState, "function");
assert.deepEqual(syncedState, ["replace", {}]);

(globalThis as any).document = originalDocument;
(globalThis as any).window = originalWindow;
