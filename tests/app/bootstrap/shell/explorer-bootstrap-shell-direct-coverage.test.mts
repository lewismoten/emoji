import assert from "node:assert/strict";
import { createExplorerBootstrapShellWithFactories } from "../../../../src/app/bootstrap/explorer-bootstrap-shell.js";
import * as sharedState from "../../../../src/state.js";

const dialogState = {
  classList: {
    contains(value: string) {
      return value === "is-editor-view";
    },
  },
};

const state: any = {
  byId: { wrappedGift: { key: "wrappedGift" } },
  emojiByKey: { wrappedGift: "🎁" },
  emojiKeyByCodePoints: new Map([["1F381", "wrappedGift"]]),
  explorerPreferences: { pixelFont: true },
};
sharedState.byId.replace(state.byId as any);
sharedState.emojiByKey.replace(state.emojiByKey);
sharedState.emojiKeyByCodePoints.replace(state.emojiKeyByCodePoints);
Object.defineProperties(state, {
  byId: {
    configurable: true,
    get: () => sharedState.byId.get(),
    set: (value) => sharedState.byId.replace(value as any),
  },
  emojiByKey: {
    configurable: true,
    get: () => sharedState.emojiByKey.get(),
    set: (value) => sharedState.emojiByKey.replace(value),
  },
  emojiKeyByCodePoints: {
    configurable: true,
    get: () => sharedState.emojiKeyByCodePoints.get(),
    set: (value) => sharedState.emojiKeyByCodePoints.replace(value),
  },
});

let pixelOptions: any;
let shellOptions: any;
let emojiOptions: any;
let refreshed = 0;
let initialDiagnostic: any;
const shell = createExplorerBootstrapShellWithFactories(
  {
    applyingUrlState: () => false,
    copyStatus: () => "copy-status",
    developerModeToggle: () => "developer-toggle",
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
    installAppButton: () => "install-app",
    installDialog: () => "install-dialog",
    loadVersionData: () => "load-version-data",
    modeChoices: () => ["standard", "advanced", "developer"],
    normalizeCodePoints: (value: string) => `norm:${value}`,
    offlineStatus: () => "offline-status",
    orderButtons: () => ["grouped"],
    renderCategoryFilters: () => "render-categories",
    renderSearchLanguages: () => "render-languages",
    renderVersionModeToggle: () => "render-version-toggle",
    savedDialog: () => "saved-dialog",
    setDialogView: (...args: any[]) => ["setDialogView", ...args],
    showEmoji: (...args: any[]) => ["showEmoji", ...args],
    skinToneCheckboxes: () => ["1F3FB"],
    state: () => state,
    suppressDialogCloseSync: () => "suppressed",
    syncUrlState: (...args: any[]) => ["syncUrlState", ...args],
    syncVersionRange: () => "sync-version-range",
    themeChoices: () => ["dark", "light"],
    translate: (key: string, fallback: string) => `${key}:${fallback}`,
    urlStateReady: () => true,
    versionModeSelector: () => "version-mode-selector",
    versionSelector: () => "version-selector",
  },
  {
    createPixelArtworkManager(options: any) {
      pixelOptions = options;
      initialDiagnostic = options.updateRenderingDiagnostic({ boot: true });
      return {
        applyPixelArtworkClass: "pixel-class",
        refreshRenderedPixelEmoji: () => "refresh-rendered",
      };
    },
    createExplorerShell(options: any) {
      shellOptions = options;
      return {
        developerModeEnabled: () => true,
      };
    },
    createEmojiActions(options: any) {
      emojiOptions = options;
      return {
        onEmojiDialogClose: () => "close",
      };
    },
    updateRenderingDiagnostic(values: any) {
      return values;
    },
  },
);

assert.equal(initialDiagnostic.boot, true);
assert.equal(initialDiagnostic.developerMode, false);
assert.equal(pixelOptions.byId().wrappedGift.key, "wrappedGift");
assert.equal(pixelOptions.emojiByKey().wrappedGift, "🎁");
assert.equal(pixelOptions.emojiKeyByCodePoints().get("1F381"), "wrappedGift");
assert.deepEqual(pixelOptions.genderCheckboxes(), ["neutral"]);
assert.deepEqual(pixelOptions.hairCheckboxes(), ["red"]);
assert.equal(pixelOptions.normalizeCodePoints("1F381"), "norm:1F381");
assert.equal(pixelOptions.pixelFontPreferred(), true);
pixelOptions.refreshEditor();
assert.equal(refreshed, 1);
assert.deepEqual(pixelOptions.skinToneCheckboxes(), ["1F3FB"]);
const diagnostic = pixelOptions.updateRenderingDiagnostic({ ok: true });
assert.equal(diagnostic.ok, true);
assert.equal(diagnostic.byId, state.byId);
assert.equal(diagnostic.developerMode, true);
assert.equal(diagnostic.detailsVisible, false);
assert.equal(diagnostic.exampleDialog, dialogState);
assert.equal(diagnostic.translate("copy", "Copy"), "copy:Copy");

assert.equal(shellOptions.applyPixelArtworkClass(), "pixel-class");
assert.equal(shellOptions.developerModeToggle(), "developer-toggle");
assert.deepEqual(shellOptions.modeChoices(), [
  "standard",
  "advanced",
  "developer",
]);
assert.equal(shellOptions.dialog(), dialogState);
assert.equal(shellOptions.drawList(), "draw-list");
assert.deepEqual(shellOptions.emojiFontChoices(), ["system", "pixel"]);
assert.equal(shellOptions.installAppButton(), "install-app");
assert.equal(shellOptions.installDialog(), "install-dialog");
assert.equal(shellOptions.loadVersionData(), "load-version-data");
assert.equal(shellOptions.offlineStatus(), "offline-status");
assert.deepEqual(shellOptions.orderButtons(), ["grouped"]);
assert.equal(
  shellOptions.pixelEditor().refreshFontBuild instanceof Function,
  true,
);
assert.equal(shellOptions.refreshRenderedPixelEmoji(), "refresh-rendered");
assert.equal(shellOptions.renderCategoryFilters(), "render-categories");
assert.equal(shellOptions.renderSearchLanguages(), "render-languages");
assert.equal(shellOptions.renderVersionModeToggle(), "render-version-toggle");
assert.equal(shellOptions.savedDialog(), "saved-dialog");
assert.deepEqual(shellOptions.setDialogView("code"), ["setDialogView", "code"]);
assert.deepEqual(shellOptions.syncUrlState("replace"), [
  "syncUrlState",
  "replace",
]);
assert.equal(shellOptions.syncVersionRange(), "sync-version-range");
assert.deepEqual(shellOptions.themeChoices(), ["dark", "light"]);
assert.equal(shellOptions.translate("copy", "Copy"), "copy:Copy");
assert.equal(shellOptions.versionModeSelector(), "version-mode-selector");
assert.equal(shellOptions.versionSelector(), "version-selector");

assert.equal(emojiOptions.applyingUrlState(), false);
assert.equal(emojiOptions.applyPixelArtworkClass(), "pixel-class");
assert.equal(emojiOptions.applyStandalonePixelArtwork(), "pixel-class");
assert.equal(emojiOptions.copyStatus(), "copy-status");
assert.equal(emojiOptions.developerModeEnabled(), true);
assert.equal(emojiOptions.dialog(), dialogState);
assert.equal(emojiOptions.normalizeCodePoints("1F381"), "norm:1F381");
assert.deepEqual(emojiOptions.setDialogView("details"), [
  "setDialogView",
  "details",
]);
assert.deepEqual(emojiOptions.showEmoji("wrappedGift"), [
  "showEmoji",
  "wrappedGift",
]);
assert.equal(emojiOptions.suppressDialogCloseSync(), "suppressed");
assert.deepEqual(emojiOptions.syncUrlState("push"), ["syncUrlState", "push"]);
assert.equal(emojiOptions.translate("copy", "Copy"), "copy:Copy");
assert.equal(emojiOptions.urlStateReady(), true);
assert.equal(shell.onEmojiDialogClose(), "close");
