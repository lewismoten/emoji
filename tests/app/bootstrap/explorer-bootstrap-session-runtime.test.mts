import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const createSelectLike = (value = "") => ({
  appendChild() {},
  disabled: false,
  options: [] as Array<{ value: string }>,
  replaceChildren() {},
  value,
});

// coverage target: ../../../src/app/bootstrap/explorer-bootstrap-session-runtime.js

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const sourceText = await fs.readFile(
  path.join(root, "src/app/bootstrap/explorer-bootstrap-session-runtime.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import { buildExplorerBootstrapRuntimeOptions } from "./explorer-bootstrap-runtime-options.js";',
    'import { buildExplorerBootstrapRuntimeOptions } from "./runtime-options-stub.mjs";',
  )
  .replace(
    'import { createExplorerBootstrapRuntime } from "./explorer-bootstrap-runtime.js";',
    'import { createExplorerBootstrapRuntime } from "./runtime-stub.mjs";',
  )
  .replace(
    'import { buildExplorerBootstrapRuntimeSourceOptions } from "./explorer-bootstrap-options.js";',
    'import { buildExplorerBootstrapRuntimeSourceOptions } from "./runtime-source-options-stub.mjs";',
  )
  .replace(
    /import \{\n  assignExplorerBootstrapControls,\n  assignExplorerBootstrapElements,\n  assignExplorerBootstrapFieldsets,\n\} from "\.\/explorer-bootstrap-bindings\.js";/,
    'import {\n  assignExplorerBootstrapControls,\n  assignExplorerBootstrapElements,\n  assignExplorerBootstrapFieldsets,\n} from "./bindings-stub.mjs";',
  )
  .replace(/options: any/g, "options")
  .replace(/args: any\[\]/g, "args")
  .replace(/value: any/g, "value")
  .replace(/editor: any/g, "editor")
  .replace(/promise: any/g, "promise")
  .replace(/locale: any/g, "locale")
  .replace(/values: any/g, "values")
  .replace(/amount: number/g, "amount");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "explorer-bootstrap-session-runtime-test-"),
);

const moduleFile = path.join(
  tempDirectory,
  "explorer-bootstrap-session-runtime.mjs",
);
const runtimeOptionsStubFile = path.join(
  tempDirectory,
  "runtime-options-stub.mjs",
);
const runtimeStubFile = path.join(tempDirectory, "runtime-stub.mjs");
const runtimeSourceOptionsStubFile = path.join(
  tempDirectory,
  "runtime-source-options-stub.mjs",
);
const bindingsStubFile = path.join(tempDirectory, "bindings-stub.mjs");

await fs.writeFile(
  runtimeOptionsStubFile,
  [
    "export const runtimeOptionCalls = [];",
    "export function buildExplorerBootstrapRuntimeOptions(options) {",
    "  runtimeOptionCalls.push(options);",
    "  return { kind: 'runtime-options', options };",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(
  runtimeSourceOptionsStubFile,
  [
    "export const runtimeSourceOptionCalls = [];",
    "export function buildExplorerBootstrapRuntimeSourceOptions(options) {",
    "  runtimeSourceOptionCalls.push(options);",
    "  return { kind: 'source-options', options };",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(
  runtimeStubFile,
  [
    "export const runtimeCalls = [];",
    "export const stubRuntime = {",
    "  populateVersionModeOptions: (...args) => ['populate-version-modes', args],",
    "  renderVersionModeToggleController: (...args) => ['render-version-toggle', args],",
    "  toggleVersionMode: (...args) => ['toggle-version-mode', args],",
    "  loadSearchLanguages: (...args) => ['load-search-languages', args],",
    "  renderSearchLanguages: (...args) => ['render-search-languages', args],",
    "  showEmoji: (...args) => ['show-emoji', args],",
    "  navigateEmoji: (...args) => ['navigate-emoji', args],",
    "  updateDialogNavigation: (...args) => ['update-dialog-navigation', args],",
    "  updateCompositionBackButton: (...args) => ['update-composition-back-button', args],",
    "  revealExplorer: (...args) => ['reveal-explorer', args],",
    "};",
    "export function createExplorerBootstrapRuntime(options) {",
    "  runtimeCalls.push(options);",
    "  return stubRuntime;",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(
  bindingsStubFile,
  [
    "export const bindingCalls = [];",
    "export function assignExplorerBootstrapControls(bindings, values) {",
    "  bindingCalls.push(['controls', bindings, values]);",
    "  Object.assign(bindings, values);",
    "}",
    "export function assignExplorerBootstrapElements(bindings, values) {",
    "  bindingCalls.push(['elements', bindings, values]);",
    "  Object.assign(bindings, values);",
    "}",
    "export function assignExplorerBootstrapFieldsets(bindings, values) {",
    "  bindingCalls.push(['fieldsets', bindings, values]);",
    "  Object.assign(bindings, values);",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(moduleFile, transformedSource);

const module = await import(pathToFileURL(moduleFile).href);
const { initializeExplorerBootstrapSessionRuntime } =
  module as typeof import("../../../src/app/bootstrap/explorer-bootstrap-session-runtime.js");

const runtimeOptionsStub = await import(
  pathToFileURL(runtimeOptionsStubFile).href
);
const runtimeSourceOptionsStub = await import(
  pathToFileURL(runtimeSourceOptionsStubFile).href
);
const runtimeStub = await import(pathToFileURL(runtimeStubFile).href);
const bindingsStub = await import(pathToFileURL(bindingsStubFile).href);
const getState = () => state;

const state = {
  searchLoadId: 3,
  selectedSearchLocale: "en",
};

const bindings: any = {
  advancedFilters: "advanced-filters",
  advancedFiltersButton: "advanced-filters-button",
  applyingUrlState: false,
  clearFiltersButton: "clear-filters",
  copyStatus: "copy-status",
  developerModeToggle: "developer-mode-toggle",
  drawList: (...args: unknown[]) => ["drawList", args],
  emojiFontChoices: ["pixel", "system"],
  emojiList: "emoji-list",
  genderCheckboxes: ["neutral"],
  focusInitialEmojiDialogAction: (...args: unknown[]) => ["focus", args],
  groupFilterDialog: "group-filter-dialog",
  groupPickerTrigger: "group-picker-trigger",
  groupSelector: "group-selector",
  hairCheckboxes: ["bald"],
  helpDialog: "help-dialog",
  helpPicker: "help-picker",
  installAppButton: "install-button",
  installDialog: "install-dialog",
  languageDialog: "language-dialog",
  languageList: "language-list",
  languagePicker: "language-picker",
  languagePickerFlag: "language-flag",
  languagePickerLabel: "language-label",
  matchCount: "match-count",
  navigateEmoji: (...args: unknown[]) => ["navigate", args],
  orderButtons: "order-buttons",
  pixelEditor: "pixel-editor",
  pixelEditorPromise: "pixel-editor-promise",
  populateVersionModeOptions: (...args: unknown[]) => ["populate", args],
  renderSearchLanguages: (...args: unknown[]) => [
    "renderSearchLanguages",
    args,
  ],
  renderVersionModeToggle: (...args: unknown[]) => [
    "renderVersionModeToggle",
    args,
  ],
  resetFilters: (...args: unknown[]) => ["resetFilters", args],
  savedDialog: "saved-dialog",
  savedPicker: "saved-picker",
  searchText: "search-text",
  setEmojiDialogView: (...args: unknown[]) => ["setEmojiDialogView", args],
  showEmoji: (...args: unknown[]) => ["showEmoji", args],
  skinToneCheckboxes: ["1F3FB"],
  subGroupFilterDialog: "subgroup-filter-dialog",
  subGroupPickerTrigger: "subgroup-picker-trigger",
  subGroupSelector: "subgroup-selector",
  suppressedPanelCloses: new WeakSet(),
  syncUrlState: (...args: unknown[]) => ["syncUrlState", args],
  themeChoices: ["dark", "retro"],
  toolbar: "toolbar",
  updateCompositionBackButton: (...args: unknown[]) => [
    "updateComposition",
    args,
  ],
  updateDialogNavigation: (...args: unknown[]) => ["updateDialog", args],
  urlStateReady: true,
  versionModeSelector: { disabled: false, value: "through" },
  versionModeToggle: "version-mode-toggle",
  versionNext: "version-next",
  versionPrevious: "version-previous",
  versionRange: "version-range",
  versionSelector: createSelectLike("17.0"),
};

const controllers = {
  applyBasicUrlState: "apply-basic",
  applyDialogUrlState: "apply-dialog",
  displayGroupName: "display-group",
  displayUnicodeSubGroupName: "display-subgroup",
  loadData: "load-data",
  onCompactChoiceKeyDown: "compact-keydown",
  onDocumentKeyDown: "document-keydown",
  onEmojiDialogClick: "dialog-click",
  onEmojiFocus: "emoji-focus",
  onHairChange: "hair-change",
  onEmojiKeyDown: "emoji-keydown",
  onGenderChange: "gender-change",
  onSkinToneChange: "skin-change",
  onOrderModeChange: "order-change",
  onVersionRangeInput: "version-range-input",
  openFilterPicker: "open-filter-picker",
  refreshLocalizedLabels: "refresh-localized-labels",
  renderCategoryFilters: (...args: unknown[]) => [
    "renderCategoryFilters",
    args,
  ],
  scheduleSearchDraw: "schedule-search-draw",
  stepVersion: "step-version",
  syncVersionRange: (...args: unknown[]) => ["syncVersionRange", args],
};

const shell = {
  applyPixelArtworkClass: "apply-pixel",
  applyStandalonePixelArtwork: "apply-standalone-pixel",
  bindAudioInteractions: "bind-audio",
  developerModeEnabled: "developer-mode-enabled",
  getIntroducedVersion: "get-introduced-version",
  installApp: "install-app",
  loadUiTranslations: "load-ui-translations",
  onClick: "on-click",
  onEmojiDialogClose: "on-emoji-dialog-close",
  renderDeveloperMode: "render-developer-mode",
  renderInstallAppButton: "render-install-app-button",
  renderPixelFontToggle: "render-pixel-font-toggle",
  renderSavedEmoji: "render-saved-emoji",
  renderThemeToggle: "render-theme-toggle",
  selectEmojiFont: "select-emoji-font",
  selectTheme: "select-theme",
  toggleDeveloperMode: "toggle-developer-mode",
  updateEmojiComposition: "update-emoji-composition",
  updateFavoriteButton: "update-favorite-button",
  updateModifierPixelArtwork: "update-modifier-pixel-artwork",
  updateOnlineStatus: "update-online-status",
  updatePixelArtworkManifest: "update-pixel-artwork-manifest",
  updateRenderingDiagnostic: "update-rendering-diagnostic",
};

const result = initializeExplorerBootstrapSessionRuntime({
  bindings,
  controllers,
  panelDialogs: "panel-dialogs",
  restoreDeveloperMode: "restore-developer-mode",
  savePreference: "save-preference",
  shell,
  state: getState,
  translate: "translate",
});

assert.equal(result, runtimeStub.stubRuntime);
assert.equal(
  result.populateVersionModeOptions,
  runtimeStub.stubRuntime.populateVersionModeOptions,
);
assert.equal(
  result.renderVersionModeToggleController,
  runtimeStub.stubRuntime.renderVersionModeToggleController,
);
assert.equal(
  result.toggleVersionMode,
  runtimeStub.stubRuntime.toggleVersionMode,
);
assert.equal(
  result.loadSearchLanguages,
  runtimeStub.stubRuntime.loadSearchLanguages,
);
assert.equal(
  result.renderSearchLanguages,
  runtimeStub.stubRuntime.renderSearchLanguages,
);
assert.equal(result.showEmoji, runtimeStub.stubRuntime.showEmoji);
assert.equal(result.navigateEmoji, runtimeStub.stubRuntime.navigateEmoji);
assert.equal(
  result.updateDialogNavigation,
  runtimeStub.stubRuntime.updateDialogNavigation,
);
assert.equal(
  result.updateCompositionBackButton,
  runtimeStub.stubRuntime.updateCompositionBackButton,
);
assert.equal(result.revealExplorer, runtimeStub.stubRuntime.revealExplorer);

assert.equal(bindings.bootstrapRuntime, result);
assert.equal(
  bindings.populateVersionModeOptions,
  runtimeStub.stubRuntime.populateVersionModeOptions,
);
assert.equal(
  bindings.renderVersionModeToggle,
  runtimeStub.stubRuntime.renderVersionModeToggleController,
);
assert.equal(
  bindings.toggleVersionMode,
  runtimeStub.stubRuntime.toggleVersionMode,
);
assert.equal(
  bindings.loadSearchLanguages,
  runtimeStub.stubRuntime.loadSearchLanguages,
);
assert.equal(
  bindings.renderSearchLanguages,
  runtimeStub.stubRuntime.renderSearchLanguages,
);
assert.equal(bindings.showEmoji, runtimeStub.stubRuntime.showEmoji);
assert.equal(bindings.navigateEmoji, runtimeStub.stubRuntime.navigateEmoji);
assert.equal(
  bindings.updateDialogNavigation,
  runtimeStub.stubRuntime.updateDialogNavigation,
);
assert.equal(
  bindings.updateCompositionBackButton,
  runtimeStub.stubRuntime.updateCompositionBackButton,
);
assert.equal(bindings.revealExplorer, runtimeStub.stubRuntime.revealExplorer);

assert.equal(runtimeSourceOptionsStub.runtimeSourceOptionCalls.length, 1);
assert.equal(runtimeOptionsStub.runtimeOptionCalls.length, 1);
assert.equal(runtimeStub.runtimeCalls.length, 1);
assert.equal(bindingsStub.bindingCalls.length, 0);

const runtimeSourceCall = runtimeSourceOptionsStub.runtimeSourceOptionCalls[0];
assert.equal(runtimeSourceCall.applyBasicUrlState, "apply-basic");
assert.equal(runtimeSourceCall.applyDialogUrlState, "apply-dialog");
assert.equal(runtimeSourceCall.applyPixelArtworkClass, "apply-pixel");
assert.equal(
  runtimeSourceCall.applyStandalonePixelArtwork,
  "apply-standalone-pixel",
);
assert.equal(runtimeSourceCall.bindAudioInteractions, "bind-audio");
assert.equal(runtimeSourceCall.developerModeEnabled, "developer-mode-enabled");
assert.equal(runtimeSourceCall.displayGroupName, "display-group");
assert.equal(runtimeSourceCall.displayUnicodeSubGroupName, "display-subgroup");
assert.equal(runtimeSourceCall.getIntroducedVersion, "get-introduced-version");
assert.equal(runtimeSourceCall.installApp, "install-app");
assert.equal(runtimeSourceCall.loadData, "load-data");
assert.equal(runtimeSourceCall.loadUiTranslations, "load-ui-translations");
assert.equal(runtimeSourceCall.onClick, "on-click");
assert.equal(runtimeSourceCall.onCompactChoiceKeyDown, "compact-keydown");
assert.equal(runtimeSourceCall.onDocumentKeyDown, "document-keydown");
assert.equal(runtimeSourceCall.onEmojiDialogClick, "dialog-click");
assert.equal(runtimeSourceCall.onEmojiDialogClose, "on-emoji-dialog-close");
assert.equal(runtimeSourceCall.onEmojiFocus, "emoji-focus");
assert.equal(runtimeSourceCall.onHairChange, "hair-change");
assert.equal(runtimeSourceCall.onEmojiKeyDown, "emoji-keydown");
assert.equal(runtimeSourceCall.onGenderChange, "gender-change");
assert.equal(runtimeSourceCall.onSkinToneChange, "skin-change");
assert.equal(runtimeSourceCall.onOrderModeChange, "order-change");
assert.equal(runtimeSourceCall.onVersionRangeInput, "version-range-input");
assert.equal(runtimeSourceCall.openFilterPicker, "open-filter-picker");
assert.equal(runtimeSourceCall.panelDialogs, "panel-dialogs");
assert.equal(
  runtimeSourceCall.refreshLocalizedLabels,
  "refresh-localized-labels",
);
assert.equal(runtimeSourceCall.renderDeveloperMode, "render-developer-mode");
assert.equal(
  runtimeSourceCall.renderInstallAppButton,
  "render-install-app-button",
);
assert.equal(
  runtimeSourceCall.renderPixelFontToggle,
  "render-pixel-font-toggle",
);
assert.equal(runtimeSourceCall.renderSavedEmoji, "render-saved-emoji");
assert.equal(runtimeSourceCall.renderThemeToggle, "render-theme-toggle");
assert.equal(runtimeSourceCall.restoreDeveloperMode, "restore-developer-mode");
assert.equal(runtimeSourceCall.savePreference, "save-preference");
assert.equal(runtimeSourceCall.scheduleSearchDraw, "schedule-search-draw");
assert.equal(runtimeSourceCall.selectEmojiFont, "select-emoji-font");
assert.equal(runtimeSourceCall.selectTheme, "select-theme");
assert.equal(runtimeSourceCall.state, getState);
assert.equal(runtimeSourceCall.stepVersion, "step-version");
assert.equal(runtimeSourceCall.toggleDeveloperMode, "toggle-developer-mode");
assert.equal(runtimeSourceCall.translate, "translate");
assert.equal(
  runtimeSourceCall.updateEmojiComposition,
  "update-emoji-composition",
);
assert.equal(runtimeSourceCall.updateFavoriteButton, "update-favorite-button");
assert.equal(
  runtimeSourceCall.updateModifierArtwork,
  "update-modifier-pixel-artwork",
);
assert.equal(runtimeSourceCall.updateOnlineStatus, "update-online-status");
assert.equal(
  runtimeSourceCall.updatePixelArtworkManifest,
  "update-pixel-artwork-manifest",
);
assert.equal(
  runtimeSourceCall.updateRenderingDiagnostic,
  "update-rendering-diagnostic",
);
assert.equal(runtimeSourceCall.advancedFilters(), "advanced-filters");
assert.equal(
  runtimeSourceCall.advancedFiltersButton(),
  "advanced-filters-button",
);
assert.equal(runtimeSourceCall.applyingUrlState(), false);
assert.equal(runtimeSourceCall.clearFiltersButton(), "clear-filters");
assert.equal(runtimeSourceCall.copyStatus(), "copy-status");
assert.equal(runtimeSourceCall.developerModeToggle(), "developer-mode-toggle");
assert.deepEqual(runtimeSourceCall.drawList("hello"), ["drawList", ["hello"]]);
assert.deepEqual(runtimeSourceCall.emojiFontChoices(), ["pixel", "system"]);
assert.equal(runtimeSourceCall.emojiList(), "emoji-list");
assert.deepEqual(runtimeSourceCall.genderCheckboxes(), ["neutral"]);
assert.deepEqual(runtimeSourceCall.focusInitialEmojiDialogAction(), [
  "focus",
  [],
]);
assert.equal(runtimeSourceCall.getPixelEditor(), "pixel-editor");
assert.equal(runtimeSourceCall.getPixelEditorPromise(), "pixel-editor-promise");
assert.equal(runtimeSourceCall.groupFilterDialog(), "group-filter-dialog");
assert.equal(runtimeSourceCall.groupPickerTrigger(), "group-picker-trigger");
assert.equal(runtimeSourceCall.groupSelector(), "group-selector");
assert.deepEqual(runtimeSourceCall.hairCheckboxes(), ["bald"]);
assert.equal(runtimeSourceCall.helpDialog(), "help-dialog");
assert.equal(runtimeSourceCall.helpPicker(), "help-picker");
assert.equal(runtimeSourceCall.installAppButton(), "install-button");
assert.equal(runtimeSourceCall.installDialog(), "install-dialog");
assert.equal(runtimeSourceCall.languageDialog(), "language-dialog");
assert.equal(runtimeSourceCall.languageList(), "language-list");
assert.equal(runtimeSourceCall.languagePicker(), "language-picker");
assert.equal(runtimeSourceCall.languagePickerFlag(), "language-flag");
assert.equal(runtimeSourceCall.languagePickerLabel(), "language-label");
assert.deepEqual(runtimeSourceCall.loadSearchLanguages(), [
  "load-search-languages",
  [],
]);
assert.equal(runtimeSourceCall.matchCount(), "match-count");
assert.deepEqual(runtimeSourceCall.navigateEmoji(2), ["navigate-emoji", [2]]);
assert.equal(runtimeSourceCall.nextSearchLoadId(), 4);
assert.equal(state.searchLoadId, 4);
assert.equal(runtimeSourceCall.orderButtons(), "order-buttons");
assert.equal(runtimeSourceCall.savedDialog(), "saved-dialog");
assert.equal(runtimeSourceCall.savedPicker(), "saved-picker");
assert.equal(runtimeSourceCall.searchText(), "search-text");
assert.deepEqual(runtimeSourceCall.populateVersionModeOptions("a"), [
  "populate-version-modes",
  ["a"],
]);
assert.deepEqual(runtimeSourceCall.renderCategoryFilters("b"), [
  "renderCategoryFilters",
  ["b"],
]);
assert.deepEqual(runtimeSourceCall.renderVersionModeToggle("c"), [
  "render-version-toggle",
  [],
]);
assert.deepEqual(runtimeSourceCall.resetFilters("d"), ["resetFilters", []]);
assert.equal(runtimeSourceCall.searchText(), "search-text");
runtimeSourceCall.setApplyingUrlState(true);
assert.equal(bindings.applyingUrlState, true);
runtimeSourceCall.setPixelEditor("next-editor");
assert.equal(bindings.pixelEditor, "next-editor");
runtimeSourceCall.setPixelEditorPromise("next-promise");
assert.equal(bindings.pixelEditorPromise, "next-promise");
runtimeSourceCall.setSearchLanguage("ar");
assert.equal(state.selectedSearchLocale, "ar");
runtimeSourceCall.setSuppressDialogCloseSync(true);
assert.equal(bindings.suppressDialogCloseSync, true);
runtimeSourceCall.setUrlStateReady(false);
assert.equal(bindings.urlStateReady, false);
assert.deepEqual(runtimeSourceCall.showEmoji("x"), ["show-emoji", ["x"]]);
assert.deepEqual(runtimeSourceCall.skinToneCheckboxes(), ["1F3FB"]);
assert.equal(
  runtimeSourceCall.subGroupFilterDialog(),
  "subgroup-filter-dialog",
);
assert.equal(
  runtimeSourceCall.subGroupPickerTrigger(),
  "subgroup-picker-trigger",
);
assert.equal(runtimeSourceCall.subGroupSelector(), "subgroup-selector");
assert.equal(
  runtimeSourceCall.suppressedPanelCloses(),
  bindings.suppressedPanelCloses,
);
assert.deepEqual(runtimeSourceCall.syncUrlState("replace"), [
  "syncUrlState",
  ["replace"],
]);
assert.deepEqual(runtimeSourceCall.syncVersionRange("through"), [
  "syncVersionRange",
  ["through"],
]);
assert.deepEqual(runtimeSourceCall.themeChoices(), ["dark", "retro"]);
assert.deepEqual(runtimeSourceCall.toggleVersionMode("selected"), [
  "toggle-version-mode",
  ["selected"],
]);
assert.equal(runtimeSourceCall.toolbar(), "toolbar");
assert.deepEqual(runtimeSourceCall.updateCompositionBackButton("up"), [
  "update-composition-back-button",
  ["up"],
]);
assert.deepEqual(runtimeSourceCall.updateDialogNavigation("nav"), [
  "update-dialog-navigation",
  ["nav"],
]);
assert.equal(runtimeSourceCall.urlStateReady(), false);
assert.deepEqual(runtimeSourceCall.versionModeSelector(), {
  disabled: false,
  value: "through",
});
assert.equal(runtimeSourceCall.versionModeToggle(), "version-mode-toggle");
assert.equal(runtimeSourceCall.versionNext(), "version-next");
assert.equal(runtimeSourceCall.versionPrevious(), "version-previous");
assert.equal(runtimeSourceCall.versionRange(), "version-range");
assert.equal(runtimeSourceCall.versionSelector().value, "17.0");
