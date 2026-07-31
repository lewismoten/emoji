import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// coverage target: ../../../src/app/navigation-runtime.js

const root = process.cwd();
const sourceText = await fs.readFile(
  path.join(root, "src/app/navigation-runtime.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import { createExplorerNavigation } from "../explorer/navigation/explorer-navigation.js";',
    'import { createExplorerNavigation } from "./explorer-navigation-stub.mjs";',
  )
  .replace(/options: any/g, "options")
  .replace(/\.\.\.args: any\[\]/g, "...args")
  .replace(/amount: number/g, "amount")
  .replace(/key: string/g, "key")
  .replace(/openDialog\?: boolean/g, "openDialog")
  .replace(/navigationKeys\?: string\[\]/g, "navigationKeys")
  .replace(/initialMode\?: string/g, "initialMode")
  .replace(/value: "condensed" \| "full"/g, "value")
  .replace(/value: "grouped" \| "popular" \| "unicode" \| "sequence"/g, "value")
  .replace(/value: string/g, "value");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "navigation-runtime-test-"),
);

await fs.writeFile(
  path.join(tempDirectory, "explorer-navigation-stub.mjs"),
  [
    "export const calls = [];",
    "export const result = { kind: 'explorer-navigation' };",
    "export function createExplorerNavigation(options) {",
    "  calls.push(options);",
    "  return result;",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "navigation-runtime.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "navigation-runtime.mjs")).href
);
const stub = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-navigation-stub.mjs")).href
);
const { createNavigationRuntime } =
  module as typeof import("../../src/app/navigation-runtime.js");

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

const runtime = createNavigationRuntime({
  allowedSequenceTypes: "allowed-sequence-types",
  applyingUrlState: () => false,
  compositionMode: () => "condensed",
  developerModeEnabled: "developer-mode-enabled",
  fullDeveloperModeEnabled: "full-developer-mode-enabled",
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
});

assert.equal(runtime, stub.result);
assert.equal(stub.calls.length, 1);
const call = stub.calls[0];

assert.equal(call.allowedSequenceTypes, "allowed-sequence-types");
assert.equal(call.applyingUrlState(), false);
assert.equal(call.compositionMode(), "condensed");
assert.equal(call.developerModeEnabled, "developer-mode-enabled");
assert.equal(call.dialog(), closeDialog);
assert.equal(call.currentEmojiKey(), "wave");
assert.equal(call.drawList, "draw-list");
assert.deepEqual(call.emojiByKey(), { wave: "👋" });
assert.deepEqual(call.genderCheckboxes(), ["neutral"]);
assert.equal(call.getOrderMode(), "grouped");
assert.equal(call.getSelectedGroup(), "Objects");
assert.equal(call.getSelectedSequenceType(), "zwj");
assert.equal(call.getSelectedSubGroup(), "mail");
assert.deepEqual(call.groups(), ["Objects"]);
assert.deepEqual(call.hairCheckboxes(), ["red"]);
assert.equal(call.helpDialog(), "help-dialog");
assert.equal(call.languageList(), "language-list");
assert.equal(call.latestReleasedVersion(), "17.0");
assert.deepEqual(call.navigateEmoji(2), ["navigate-emoji", 2]);
assert.equal(call.orderButtons(), "order-buttons");
assert.equal(call.panelDialogs, "panel-dialogs");
assert.equal(call.preferredOrder(), "unicode");
assert.equal(call.renderCategoryFilters(), "render-category-filters");
assert.equal(call.renderSavedEmoji, "render-saved-emoji");
assert.equal(call.renderVersionModeToggle(), "render-version-mode-toggle");
assert.equal(call.searchText(), "search-text");
assert.deepEqual(call.skinToneCheckboxes(), ["1F3FB"]);
assert.equal(call.subGroupSelectionKey, "subgroup-selection-key");
assert.deepEqual(call.subGroups(), ["mail"]);
assert.equal(call.suppressedPanelCloses(), "suppressed-panel-closes");
assert.equal(call.syncVersionRange(), "sync-version-range");
assert.equal(call.urlStateReady(), true);
assert.equal(call.versionModeSelector(), "version-mode-selector");
assert.equal(call.versionRange(), "version-range");
assert.equal(call.versionSelector(), "version-selector");

assert.equal(call.openEmoji("wave", true, ["a", "b"], "code")[0], "show-emoji");
assert.deepEqual(showEmojiCalls[0], ["wave", true, ["a", "b"], "code"]);
call.openEmoji("sparkles");
assert.deepEqual(showEmojiCalls[1], [
  "sparkles",
  false,
  ["wave", "sparkles"],
  undefined,
]);

call.closeEmojiDialog();
assert.deepEqual(suppressCalls, [true, false]);
assert.deepEqual(dialogCalls, ["close"]);

call.showEmojiDialog();
assert.deepEqual(dialogCalls, ["close", "showModal", "focus"]);

call.setCompositionMode("full");
call.setOrderMode("popular");
call.setSelectedGroup("Smileys");
call.setSelectedSequenceType("tag");
call.setSelectedSubGroup("emotion");
assert.deepEqual(setters, {
  composition: ["full"],
  order: ["popular"],
  group: ["Smileys"],
  sequenceType: ["tag"],
  subGroup: ["emotion"],
});
