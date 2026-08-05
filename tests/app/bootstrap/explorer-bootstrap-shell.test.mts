import assert from "node:assert/strict";
import { createExplorerBootstrapShell } from "../../../src/app/bootstrap/explorer-bootstrap-shell.js";
const originalWindow = globalThis.window,
  originalDocument = globalThis.document,
  originalMutationObserver = (globalThis as any).MutationObserver;
const registeredEvents = new Map<string, EventListener>();
const documentListeners = new Map<string, EventListener[]>();
const themeChoices = [
  {
    dataset: { theme: "dark" },
    classList: { toggle() {} },
    setAttribute() {},
    tabIndex: -1,
    querySelector() {
      return null;
    },
  },
  {
    dataset: { theme: "light" },
    classList: { toggle() {} },
    setAttribute() {},
    tabIndex: -1,
    querySelector() {
      return null;
    },
  },
] as any[];
const emojiFontChoices = [
  {
    dataset: { emojiFont: "pixel" },
    classList: { toggle() {} },
    setAttribute() {},
    tabIndex: -1,
    querySelector() {
      return null;
    },
  },
  {
    dataset: { emojiFont: "system" },
    classList: { toggle() {} },
    setAttribute() {},
    tabIndex: -1,
    querySelector() {
      return null;
    },
  },
] as any[];
(globalThis as any).window = {
  addEventListener(type: string, listener: EventListener) {
    registeredEvents.set(type, listener);
  },
  AudioContext: undefined,
};
(globalThis as any).MutationObserver = class {
  observe() {}
  disconnect() {}
};

(globalThis as any).document = {
  createElement() {
    return {
      getContext() {
        return null;
      },
    };
  },
  documentElement: {
    dataset: {},
    hasAttribute() {
      return false;
    },
    setAttribute() {},
    toggleAttribute() {},
  },
  addEventListener(type: string, listener: EventListener) {
    documentListeners.set(type, [
      ...(documentListeners.get(type) ?? []),
      listener,
    ]);
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
};
const state = {
  byId: {},
  copiedEmojiKeys: [] as string[],
  currentEmojiKey: "",
  emojiByKey: {},
  emojiKeyByCodePoints: new Map<string, string>(),
  explorerPreferences: {
    developerMode: false,
    music: false,
    pixelFont: true,
    soundEffects: false,
    theme: "dark",
  },
  favoriteEmojiKeys: [] as string[],
  proposedVersionManifests: [] as Array<{ version: string }>,
  searchAnnotations: {},
  versionKeys: new Map<string, Set<string>>(),
  versionManifests: [{ version: "17.0" }],
};
const saveCalls: Array<[string, unknown]> = [];
const shell = createExplorerBootstrapShell({
  applyingUrlState: () => false,
  copyStatus: () => undefined,
  developerModeToggle: () => undefined,
  dialog: () => undefined,
  drawList: () => {},
  emojiFontChoices: () => emojiFontChoices,
  genderCheckboxes: () => [],
  getPixelEditor: () => undefined,
  hairCheckboxes: () => [],
  installAppButton: () => undefined,
  installDialog: () => undefined,
  loadVersionData: async () => undefined,
  normalizeCodePoints: (value: string) => value,
  offlineStatus: () => undefined,
  orderButtons: () => [],
  renderCategoryFilters: () => {},
  renderSearchLanguages: () => {},
  renderVersionModeToggle: () => {},
  savePreference: (key: string, value: unknown) => {
    saveCalls.push([key, value]);
  },
  savedDialog: () => undefined,
  setDialogView: () => {},
  showEmoji: () => {},
  skinToneCheckboxes: () => [],
  state: () => state,
  suppressDialogCloseSync: () => false,
  syncUrlState: () => {},
  syncVersionRange: () => {},
  themeChoices: () => themeChoices,
  translate: (_key: string, fallback: string) => fallback,
  urlStateReady: () => true,
  versionModeSelector: () => undefined,
  versionSelector: () => undefined,
});

assert.equal(typeof shell.addFavorite, "function");
assert.equal(typeof shell.applyPixelArtworkClass, "function");
assert.equal(typeof shell.applyStandalonePixelArtwork, "function");
assert.equal(typeof shell.bindAudioInteractions, "function");
assert.equal(typeof shell.copyToClipboardValue, "function");
assert.equal(typeof shell.developerModeEnabled, "function");
assert.equal(typeof shell.getIntroducedVersion, "function");
assert.equal(typeof shell.installApp, "function");
assert.equal(typeof shell.loadPackageManifest, "function");
assert.equal(typeof shell.loadUiTranslations, "function");
assert.equal(typeof shell.onClick, "function");
assert.equal(typeof shell.onEmojiDialogClose, "function");
assert.equal(typeof shell.recordCopiedEmoji, "function");
assert.equal(typeof shell.refreshRenderedPixelEmoji, "function");
assert.equal(typeof shell.renderDeveloperMode, "function");
assert.equal(typeof shell.renderInstallAppButton, "function");
assert.equal(typeof shell.renderPixelFontToggle, "function");
assert.equal(typeof shell.renderSavedEmoji, "function");
assert.equal(typeof shell.selectEmojiFont, "function");
assert.equal(typeof shell.syncHelpMusic, "function");
assert.equal(typeof shell.toggleDeveloperMode, "function");
assert.equal(typeof shell.updateFavoriteButton, "function");
assert.equal(typeof shell.updateModifierPixelArtwork, "function");
assert.equal(typeof shell.updateOnlineStatus, "function");
assert.equal(typeof shell.updatePixelArtworkManifest, "function");
assert.equal(typeof shell.updateRenderingDiagnostic, "function");
assert.equal(typeof shell.applyUiTranslations, "function");
assert.equal(typeof shell.fullDeveloperModeEnabled, "function");

assert.equal(shell.developerModeEnabled(), false);
assert.equal(shell.getIntroducedVersion("missing"), "—");
assert.equal(registeredEvents.has("beforeinstallprompt"), true);
assert.equal(registeredEvents.has("appinstalled"), true);
assert.doesNotThrow(() => shell.bindAudioInteractions());
assert.doesNotThrow(() => shell.copyToClipboardValue());
assert.doesNotThrow(() => shell.renderDeveloperMode());
assert.doesNotThrow(() => shell.renderSavedEmoji());
assert.doesNotThrow(() => shell.syncHelpMusic());
assert.doesNotThrow(() => shell.updateFavoriteButton());
assert.doesNotThrow(() => shell.updateModifierPixelArtwork());
assert.doesNotThrow(() => shell.updateOnlineStatus());
assert.doesNotThrow(() => shell.applyUiTranslations());
assert.equal(shell.fullDeveloperModeEnabled(), false);

shell.recordCopiedEmoji("wrappedGift");
assert.deepEqual(state.copiedEmojiKeys, ["wrappedGift"]);

shell.addFavorite("wrappedGift");
assert.deepEqual(state.favoriteEmojiKeys, ["wrappedGift"]);
for (const action of [
  () => shell.renderPixelFontToggle(),
  () => shell.renderInstallAppButton(),
])
  assert.doesNotThrow(action);
assert.doesNotThrow(() =>
  shell.selectEmojiFont({
    currentTarget: { dataset: { emojiFont: "system" }, blur() {} },
    detail: 1,
  } as any),
);
assert.doesNotThrow(() =>
  shell.toggleDeveloperMode({ currentTarget: { checked: true } } as any),
);
assert.doesNotThrow(() =>
  shell.onClick({
    target: {
      closest() {
        return null;
      },
    },
  } as any),
);
assert.doesNotThrow(() => shell.getIntroducedVersion("wrappedGift"));

let refreshed = 0;
const diagnosticDialog = {
  classList: {
    contains(value: string) {
      return value === "is-editor-view";
    },
  },
  querySelector() {
    return null;
  },
};
const exercisedShell = createExplorerBootstrapShell({
  ...{
    applyingUrlState: () => false,
    copyStatus: () => undefined,
    developerModeToggle: () => undefined,
    drawList: () => {},
    emojiFontChoices: () => [],
    genderCheckboxes: () => [],
    hairCheckboxes: () => [],
    installAppButton: () => undefined,
    installDialog: () => undefined,
    loadVersionData: async () => undefined,
    normalizeCodePoints: (value: string) => value,
    offlineStatus: () => undefined,
    orderButtons: () => [],
    renderCategoryFilters: () => {},
    renderSearchLanguages: () => {},
    renderVersionModeToggle: () => {},
    savePreference: () => {},
    savedDialog: () => undefined,
    setDialogView: () => {},
    showEmoji: () => {},
    skinToneCheckboxes: () => [],
    suppressDialogCloseSync: () => false,
    syncUrlState: () => {},
    syncVersionRange: () => {},
    themeChoices: () => [],
    translate: (_key: string, fallback: string) => fallback,
    urlStateReady: () => true,
    versionModeSelector: () => undefined,
    versionSelector: () => undefined,
  },
  dialog: () => diagnosticDialog,
  getPixelEditor: () => ({
    refreshFontBuild() {
      refreshed += 1;
    },
  }),
  state: () => state,
});

exercisedShell.refreshRenderedPixelEmoji();
assert.equal(refreshed, 1);
assert.doesNotThrow(() =>
  exercisedShell.updateRenderingDiagnostic("wrappedGift", "🎁"),
);
for (const action of [() => exercisedShell.renderPixelFontToggle()])
  assert.doesNotThrow(action);

(globalThis as any).window = originalWindow;
(globalThis as any).document = originalDocument;
(globalThis as any).MutationObserver = originalMutationObserver;
