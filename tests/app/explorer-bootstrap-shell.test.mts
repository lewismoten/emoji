import assert from "node:assert/strict";
import { createExplorerBootstrapShell } from "../../src/app/explorer-bootstrap-shell.js";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;

const registeredEvents = new Map<string, EventListener>();

(globalThis as any).window = {
  addEventListener(type: string, listener: EventListener) {
    registeredEvents.set(type, listener);
  },
  AudioContext: undefined,
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
    toggleAttribute() {},
  },
  querySelector() {
    return null;
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
  emojiFontChoices: () => [],
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
  themeChoices: () => [],
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
assert.equal(typeof shell.renderMusicToggle, "function");
assert.equal(typeof shell.renderPixelFontToggle, "function");
assert.equal(typeof shell.renderSavedEmoji, "function");
assert.equal(typeof shell.renderSoundEffectsToggle, "function");
assert.equal(typeof shell.renderThemeToggle, "function");
assert.equal(typeof shell.selectEmojiFont, "function");
assert.equal(typeof shell.selectTheme, "function");
assert.equal(typeof shell.syncHelpMusic, "function");
assert.equal(typeof shell.toggleDeveloperMode, "function");
assert.equal(typeof shell.updateFavoriteButton, "function");
assert.equal(typeof shell.updateModifierPixelArtwork, "function");
assert.equal(typeof shell.updateOnlineStatus, "function");
assert.equal(typeof shell.updatePixelArtworkManifest, "function");
assert.equal(typeof shell.updateRenderingDiagnostic, "function");
assert.equal(typeof shell.applyUiTranslations, "function");

assert.equal(shell.developerModeEnabled(), false);
assert.equal(shell.getIntroducedVersion("missing"), "—");
assert.equal(registeredEvents.has("beforeinstallprompt"), true);
assert.equal(registeredEvents.has("appinstalled"), true);

shell.recordCopiedEmoji("wrappedGift");
assert.deepEqual(state.copiedEmojiKeys, ["wrappedGift"]);
assert.deepEqual(saveCalls, [["recentCopied", ["wrappedGift"]]]);

shell.addFavorite("wrappedGift");
assert.deepEqual(state.favoriteEmojiKeys, ["wrappedGift"]);
assert.deepEqual(saveCalls.at(-1), ["favorites", ["wrappedGift"]]);

(globalThis as any).window = originalWindow;
(globalThis as any).document = originalDocument;
