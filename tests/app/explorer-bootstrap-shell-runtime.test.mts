import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const sourcePath = path.join(
  root,
  "build/src/app/bootstrap/explorer-bootstrap-shell.js",
);
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source
  .replace(
    'import { createPixelArtworkManager } from "../../explorer/pixel-artwork.js";',
    'import { createPixelArtworkManager, pixelArtworkCalls } from "./pixel-artwork-stub.mjs";',
  )
  .replace(
    'import { createExplorerShell } from "../explorer-shell.js";',
    'import { createExplorerShell, shellCalls } from "./explorer-shell-stub.mjs";',
  )
  .replace(
    'import { createEmojiActions } from "../emoji-actions.js";',
    'import { createEmojiActions, emojiActionCalls } from "./emoji-actions-stub.mjs";',
  )
  .replace(
    'import { updateRenderingDiagnostic as updateRenderingDiagnosticHelper } from "../../explorer/dialog/dialog-render.js";',
    'import { updateRenderingDiagnostic as updateRenderingDiagnosticHelper, diagnosticCalls } from "./dialog-render-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "explorer-bootstrap-shell-runtime-"),
);

await fs.writeFile(
  path.join(tempDirectory, "pixel-artwork-stub.mjs"),
  `export const pixelArtworkCalls = [];
export function createPixelArtworkManager(options) {
  pixelArtworkCalls.push(options);
  return {
    applyPixelArtworkClass: "pixel-class",
    refreshRenderedPixelEmoji: () => "refresh-rendered-pixel-emoji",
    updateModifierPixelArtwork: () => "updateModifierPixelArtwork",
    updatePixelArtworkManifest: () => "updatePixelArtworkManifest",
    updateRenderingDiagnostic: () => "pixel-update-rendering-diagnostic",
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "explorer-shell-stub.mjs"),
  `export const shellCalls = [];
export function createExplorerShell(options) {
  shellCalls.push(options);
  return {
    developerModeEnabled: () => true,
    addFavorite: () => "addFavorite",
    bindAudioInteractions: () => "bindAudioInteractions",
    copyToClipboardValue: () => "copyToClipboardValue",
    getIntroducedVersion: () => "getIntroducedVersion",
    installApp: () => "installApp",
    loadPackageManifest: () => "loadPackageManifest",
    loadUiTranslations: () => "loadUiTranslations",
    onClick: () => "onClick",
    onEmojiDialogClose: () => "onEmojiDialogClose",
    recordCopiedEmoji: () => "recordCopiedEmoji",
    renderDeveloperMode: () => "renderDeveloperMode",
    renderInstallAppButton: () => "renderInstallAppButton",
    renderMusicToggle: () => "renderMusicToggle",
    renderPixelFontToggle: () => "renderPixelFontToggle",
    renderSavedEmoji: () => "renderSavedEmoji",
    renderSoundEffectsToggle: () => "renderSoundEffectsToggle",
    renderThemeToggle: () => "renderThemeToggle",
    selectEmojiFont: () => "selectEmojiFont",
    selectTheme: () => "selectTheme",
    syncHelpMusic: () => "syncHelpMusic",
    toggleDeveloperMode: () => "toggleDeveloperMode",
    updateFavoriteButton: () => "updateFavoriteButton",
    updateOnlineStatus: () => "updateOnlineStatus",
    applyUiTranslations: () => "applyUiTranslations",
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "emoji-actions-stub.mjs"),
  `export const emojiActionCalls = [];
export function createEmojiActions(options) {
  emojiActionCalls.push(options);
  return {
    showEmoji: (...args) => ["showEmoji", ...args],
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "dialog-render-stub.mjs"),
  `export const diagnosticCalls = [];
export function updateRenderingDiagnostic(values) {
  diagnosticCalls.push(values);
  return values;
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "explorer-bootstrap-shell.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-bootstrap-shell.mjs")).href
);
const pixelStub = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-artwork-stub.mjs")).href
);
const shellStub = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-shell-stub.mjs")).href
);
const emojiStub = await import(
  pathToFileURL(path.join(tempDirectory, "emoji-actions-stub.mjs")).href
);
const dialogStub = await import(
  pathToFileURL(path.join(tempDirectory, "dialog-render-stub.mjs")).href
);

let refreshed = 0;
const dialogState = {
  classList: {
    contains(value: string) {
      return value === "is-editor-view";
    },
  } as { contains: (value: string) => boolean },
};
const state: any = {
  byId: { wrappedGift: { key: "wrappedGift" } },
  emojiByKey: { wrappedGift: "🎁" },
  emojiKeyByCodePoints: new Map([["1F381", "wrappedGift"]]),
  explorerPreferences: { pixelFont: true },
};
const options: any = {
  applyingUrlState: () => false,
  copyStatus: () => "copy-status",
  developerModeToggle: () => "developer-mode-toggle",
  dialog: () => dialogState,
  drawList: () => "draw-list",
  emojiFontChoices: () => ["system", "pixel"],
  genderCheckboxes: () => ["neutral"],
  getPixelEditor: () => ({
    refreshFontBuild() {
      refreshed += 1;
    },
  }),
  hairCheckboxes: () => ["red"],
  installAppButton: () => "install-app-button",
  installDialog: () => "install-dialog",
  loadVersionData: () => "load-version-data",
  normalizeCodePoints: (value: string) => `norm:${value}`,
  offlineStatus: () => "offline-status",
  orderButtons: () => ["grouped"],
  renderCategoryFilters: () => "render-category-filters",
  renderSearchLanguages: () => "render-search-languages",
  renderVersionModeToggle: () => "render-version-mode-toggle",
  savePreference: "save-preference",
  savedDialog: () => "saved-dialog",
  setDialogView: (...args: any[]) => ["setDialogView", ...args],
  showEmoji: (...args: any[]) => ["showEmoji-option", ...args],
  skinToneCheckboxes: () => ["1F3FB"],
  state: () => state,
  suppressDialogCloseSync: () => "suppressed",
  syncUrlState: (...args: any[]) => ["syncUrlState", ...args],
  syncVersionRange: () => "sync-version-range",
  themeChoices: () => ["light", "dark"],
  translate: (key: string, fallback: string) => `${key}:${fallback}`,
  urlStateReady: () => true,
  versionModeSelector: () => "version-mode-selector",
  versionSelector: () => "version-selector",
};

const bootstrap = module.createExplorerBootstrapShell(options);

const pixelOptions = pixelStub.pixelArtworkCalls[0];
const shellOptions = shellStub.shellCalls[0];
const emojiOptions = emojiStub.emojiActionCalls[0];

assert.deepEqual(pixelOptions.byId(), state.byId);
assert.deepEqual(pixelOptions.emojiByKey(), state.emojiByKey);
assert.deepEqual(Array.from(pixelOptions.emojiKeyByCodePoints().entries()), [
  ["1F381", "wrappedGift"],
]);
assert.deepEqual(pixelOptions.genderCheckboxes(), ["neutral"]);
assert.deepEqual(pixelOptions.hairCheckboxes(), ["red"]);
assert.equal(pixelOptions.normalizeCodePoints("1F381"), "norm:1F381");
assert.equal(pixelOptions.pixelFontPreferred(), true);
pixelOptions.refreshEditor();
assert.equal(refreshed, 1);
assert.deepEqual(pixelOptions.skinToneCheckboxes(), ["1F3FB"]);
assert.deepEqual(pixelOptions.updateRenderingDiagnostic({ custom: true }), {
  custom: true,
  byId: state.byId,
  developerMode: true,
  detailsVisible: false,
  exampleDialog: dialogState,
  translate: options.translate,
});
assert.deepEqual(dialogStub.diagnosticCalls[0], {
  custom: true,
  byId: state.byId,
  developerMode: true,
  detailsVisible: false,
  exampleDialog: dialogState,
  translate: options.translate,
});

dialogState.classList.contains = (value: string) => value === "is-code-view";
assert.equal(pixelOptions.pixelFontPreferred(), true);
assert.deepEqual(pixelOptions.updateRenderingDiagnostic({ next: true }), {
  next: true,
  byId: state.byId,
  developerMode: true,
  detailsVisible: false,
  exampleDialog: dialogState,
  translate: options.translate,
});

dialogState.classList.contains = () => false;
state.explorerPreferences.pixelFont = false;
assert.equal(pixelOptions.pixelFontPreferred(), false);
assert.deepEqual(pixelOptions.updateRenderingDiagnostic({ final: true }), {
  final: true,
  byId: state.byId,
  developerMode: true,
  detailsVisible: true,
  exampleDialog: dialogState,
  translate: options.translate,
});

assert.equal(shellOptions.applyPixelArtworkClass(), "pixel-class");
assert.equal(shellOptions.developerModeToggle(), "developer-mode-toggle");
assert.equal(shellOptions.dialog(), dialogState);
assert.equal(shellOptions.drawList(), "draw-list");
assert.deepEqual(shellOptions.emojiFontChoices(), ["system", "pixel"]);
assert.equal(shellOptions.installAppButton(), "install-app-button");
assert.equal(shellOptions.installDialog(), "install-dialog");
assert.equal(shellOptions.loadVersionData(), "load-version-data");
assert.equal(shellOptions.offlineStatus(), "offline-status");
assert.deepEqual(shellOptions.orderButtons(), ["grouped"]);
assert.equal(
  shellOptions.pixelEditor().refreshFontBuild instanceof Function,
  true,
);
assert.equal(
  shellOptions.refreshRenderedPixelEmoji(),
  "refresh-rendered-pixel-emoji",
);
assert.equal(shellOptions.renderCategoryFilters(), "render-category-filters");
assert.equal(shellOptions.renderSearchLanguages(), "render-search-languages");
assert.equal(
  shellOptions.renderVersionModeToggle(),
  "render-version-mode-toggle",
);
assert.equal(shellOptions.savedDialog(), "saved-dialog");
assert.equal(shellOptions.savePreference, "save-preference");
assert.deepEqual(shellOptions.setDialogView("editor"), [
  "setDialogView",
  "editor",
]);
assert.equal(shellOptions.state(), state);
assert.deepEqual(shellOptions.syncUrlState(), ["syncUrlState"]);
assert.equal(shellOptions.syncVersionRange(), "sync-version-range");
assert.deepEqual(shellOptions.themeChoices(), ["light", "dark"]);
assert.equal(shellOptions.translate("k", "v"), "k:v");
assert.equal(shellOptions.versionModeSelector(), "version-mode-selector");
assert.equal(shellOptions.versionSelector(), "version-selector");

assert.equal(emojiOptions.applyingUrlState(), false);
assert.equal(emojiOptions.applyPixelArtworkClass(), "pixel-class");
assert.equal(emojiOptions.applyStandalonePixelArtwork(), "pixel-class");
assert.equal(emojiOptions.copyStatus(), "copy-status");
assert.equal(emojiOptions.developerModeEnabled(), true);
assert.equal(emojiOptions.dialog(), dialogState);
assert.equal(emojiOptions.normalizeCodePoints("1F381"), "norm:1F381");
assert.deepEqual(emojiOptions.setDialogView("code"), ["setDialogView", "code"]);
assert.deepEqual(emojiOptions.showEmoji("wrappedGift"), [
  "showEmoji-option",
  "wrappedGift",
]);
assert.equal(emojiOptions.state(), state);
assert.equal(emojiOptions.suppressDialogCloseSync(), "suppressed");
assert.deepEqual(emojiOptions.syncUrlState("replace"), [
  "syncUrlState",
  "replace",
]);
assert.equal(emojiOptions.translate("copy", "Copy"), "copy:Copy");
assert.equal(emojiOptions.urlStateReady(), true);

assert.equal(bootstrap.applyStandalonePixelArtwork, "pixel-class");
assert.equal(bootstrap.addFavorite(), "addFavorite");
assert.equal(bootstrap.bindAudioInteractions(), "bindAudioInteractions");
assert.equal(bootstrap.copyToClipboardValue(), "copyToClipboardValue");
assert.equal(bootstrap.getIntroducedVersion(), "getIntroducedVersion");
assert.equal(bootstrap.installApp(), "installApp");
assert.equal(bootstrap.loadPackageManifest(), "loadPackageManifest");
assert.equal(bootstrap.loadUiTranslations(), "loadUiTranslations");
assert.equal(bootstrap.onClick(), "onClick");
assert.equal(bootstrap.onEmojiDialogClose(), "onEmojiDialogClose");
assert.equal(bootstrap.recordCopiedEmoji(), "recordCopiedEmoji");
assert.equal(
  bootstrap.refreshRenderedPixelEmoji(),
  "refresh-rendered-pixel-emoji",
);
assert.equal(bootstrap.renderDeveloperMode(), "renderDeveloperMode");
assert.equal(bootstrap.renderInstallAppButton(), "renderInstallAppButton");
assert.equal(bootstrap.renderMusicToggle(), "renderMusicToggle");
assert.equal(bootstrap.renderPixelFontToggle(), "renderPixelFontToggle");
assert.equal(bootstrap.renderSavedEmoji(), "renderSavedEmoji");
assert.equal(bootstrap.renderSoundEffectsToggle(), "renderSoundEffectsToggle");
assert.equal(bootstrap.renderThemeToggle(), "renderThemeToggle");
assert.equal(bootstrap.selectEmojiFont(), "selectEmojiFont");
assert.equal(bootstrap.selectTheme(), "selectTheme");
assert.equal(bootstrap.syncHelpMusic(), "syncHelpMusic");
assert.equal(bootstrap.toggleDeveloperMode(), "toggleDeveloperMode");
assert.equal(bootstrap.updateFavoriteButton(), "updateFavoriteButton");
assert.equal(
  bootstrap.updateModifierPixelArtwork(),
  "updateModifierPixelArtwork",
);
assert.equal(bootstrap.updateOnlineStatus(), "updateOnlineStatus");
assert.equal(
  bootstrap.updatePixelArtworkManifest(),
  "updatePixelArtworkManifest",
);
assert.equal(
  bootstrap.updateRenderingDiagnostic(),
  "pixel-update-rendering-diagnostic",
);
assert.equal(bootstrap.applyUiTranslations(), "applyUiTranslations");
