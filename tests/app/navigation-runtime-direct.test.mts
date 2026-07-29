import assert from "node:assert/strict";
import {
  createNavigationConfig,
  createNavigationRuntime,
} from "../../src/app/navigation-runtime.js";

const dialogCalls: string[] = [];
const closeDialog = {
  close() {
    dialogCalls.push("close");
  },
  showModal() {
    dialogCalls.push("showModal");
  },
};
const suppressCalls: boolean[] = [];
const showEmojiCalls: unknown[][] = [];
const setters: Record<string, unknown[]> = {};

const options = {
  allowedSequenceTypes: "allowed-sequence-types",
  applyingUrlState: () => false,
  compositionMode: () => "condensed",
  developerModeEnabled: "developer-mode-enabled",
  dialog: () => closeDialog,
  currentEmojiKey: () => "wave",
  drawList: "draw-list",
  emojiByKey: () => ({ wave: "👋" }),
  genderCheckboxes: () => ["neutral"],
  getOrderMode: () => "grouped",
  getSelectedGroup: () => "Objects",
  getSelectedSequenceType: () => "zwj",
  getSelectedSubGroup: () => "mail",
  groups: () => ["Objects"],
  hairCheckboxes: () => ["red"],
  helpDialog: () => "help-dialog",
  languageList: () => "language-list",
  latestReleasedVersion: () => "17.0",
  navigateEmoji: (amount: number) => ["navigate-emoji", amount],
  showEmoji: (...args: unknown[]) => {
    showEmojiCalls.push(args);
    return ["show-emoji", args];
  },
  displayedKeys: () => ["wave", "sparkles"],
  orderButtons: () => "order-buttons",
  panelDialogs: "panel-dialogs",
  preferredOrder: () => "unicode",
  renderCategoryFilters: () => "render-category-filters",
  renderSavedEmoji: "render-saved-emoji",
  renderVersionModeToggle: () => "render-version-mode-toggle",
  searchText: () => "search-text",
  setCompositionMode: (value: string) => {
    (setters.composition ??= []).push(value);
  },
  setDialogView: (...args: unknown[]) => ["set-dialog-view", args],
  setOrderMode: (value: string) => {
    (setters.order ??= []).push(value);
  },
  setSelectedGroup: (value: string) => {
    (setters.group ??= []).push(value);
  },
  setSelectedSequenceType: (value: string) => {
    (setters.sequenceType ??= []).push(value);
  },
  setSelectedSubGroup: (value: string) => {
    (setters.subGroup ??= []).push(value);
  },
  focusInitialAction: () => {
    dialogCalls.push("focus");
  },
  skinToneCheckboxes: () => ["1F3FB"],
  subGroupSelectionKey: "subgroup-selection-key",
  subGroups: () => ["mail"],
  suppressedPanelCloses: () => "suppressed-panel-closes",
  syncVersionRange: () => "sync-version-range",
  urlStateReady: () => true,
  versionModeSelector: () => "version-mode-selector",
  versionRange: () => "version-range",
  versionSelector: () => "version-selector",
  setSuppressDialogCloseSync(value: boolean) {
    suppressCalls.push(value);
  },
};

const config = createNavigationConfig(options);

assert.equal(config.allowedSequenceTypes, "allowed-sequence-types");
assert.equal(config.applyingUrlState(), false);
assert.equal(config.compositionMode(), "condensed");
assert.equal(config.developerModeEnabled, "developer-mode-enabled");
assert.equal(config.dialog(), closeDialog);
assert.equal(config.currentEmojiKey(), "wave");
assert.equal(config.drawList, "draw-list");
assert.deepEqual(config.emojiByKey(), { wave: "👋" });
assert.deepEqual(config.genderCheckboxes(), ["neutral"]);
assert.equal(config.getOrderMode(), "grouped");
assert.equal(config.getSelectedGroup(), "Objects");
assert.equal(config.getSelectedSequenceType(), "zwj");
assert.equal(config.getSelectedSubGroup(), "mail");
assert.deepEqual(config.groups(), ["Objects"]);
assert.deepEqual(config.hairCheckboxes(), ["red"]);
assert.equal(config.helpDialog(), "help-dialog");
assert.equal(config.languageList(), "language-list");
assert.equal(config.latestReleasedVersion(), "17.0");
assert.deepEqual(config.navigateEmoji(2), ["navigate-emoji", 2]);
assert.equal(config.orderButtons(), "order-buttons");
assert.equal(config.panelDialogs, "panel-dialogs");
assert.equal(config.preferredOrder(), "unicode");
assert.equal(config.renderCategoryFilters(), "render-category-filters");
assert.equal(config.renderSavedEmoji, "render-saved-emoji");
assert.equal(config.renderVersionModeToggle(), "render-version-mode-toggle");
assert.equal(config.searchText(), "search-text");
assert.deepEqual(config.skinToneCheckboxes(), ["1F3FB"]);
assert.equal(config.subGroupSelectionKey, "subgroup-selection-key");
assert.deepEqual(config.subGroups(), ["mail"]);
assert.equal(config.suppressedPanelCloses(), "suppressed-panel-closes");
assert.equal(config.syncVersionRange(), "sync-version-range");
assert.equal(config.urlStateReady(), true);
assert.equal(config.versionModeSelector(), "version-mode-selector");
assert.equal(config.versionRange(), "version-range");
assert.equal(config.versionSelector(), "version-selector");

assert.equal(
  config.openEmoji("wave", true, ["a", "b"], "code")[0],
  "show-emoji",
);
assert.deepEqual(showEmojiCalls[0], ["wave", true, ["a", "b"], "code"]);
config.openEmoji("sparkles");
assert.deepEqual(showEmojiCalls[1], [
  "sparkles",
  false,
  ["wave", "sparkles"],
  undefined,
]);

config.closeEmojiDialog();
assert.deepEqual(suppressCalls, [true, false]);
assert.deepEqual(dialogCalls, ["close"]);

config.showEmojiDialog();
assert.deepEqual(dialogCalls, ["close", "showModal", "focus"]);

config.setCompositionMode("full");
config.setOrderMode("popular");
config.setSelectedGroup("Smileys");
config.setSelectedSequenceType("tag");
config.setSelectedSubGroup("emotion");
assert.deepEqual(setters, {
  composition: ["full"],
  order: ["popular"],
  group: ["Smileys"],
  sequenceType: ["tag"],
  subGroup: ["emotion"],
});

assert.doesNotThrow(() => createNavigationRuntime(options));
