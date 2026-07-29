import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// coverage target: ../../src/app/explorer-bootstrap-runtime.js

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const sourceText = await fs.readFile(
  path.join(root, "src/app/explorer-bootstrap-runtime.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'from "../explorer-runtime.js";',
    'from "./explorer-runtime-stub.mjs";',
  )
  .replace(
    'from "../explorer/explorer-dom.js";',
    'from "./explorer-dom-stub.mjs";',
  )
  .replace(
    'from "../explorer/utility-controls.js";',
    'from "./utility-controls-stub.mjs";',
  )
  .replace(
    'from "./ui-binding-runtime.js";',
    'from "./ui-binding-runtime-stub.mjs";',
  )
  .replace('from "./startup-runtime.js";', 'from "./startup-runtime-stub.mjs";')
  .replace(
    'from "./pixel-editor-loader-runtime.js";',
    'from "./pixel-editor-runtime-stub.mjs";',
  )
  .replace(
    'from "./version-mode-runtime.js";',
    'from "./version-mode-runtime-stub.mjs";',
  )
  .replace(
    'from "./browser-runtime-config.js";',
    'from "./browser-runtime-config-stub.mjs";',
  )
  .replace(
    'from "./dialog-runtime-config.js";',
    'from "./dialog-runtime-config-stub.mjs";',
  )
  .replace(
    'from "../explorer/explorer-labels.js";',
    'from "./explorer-labels-stub.mjs";',
  )
  .replace('from "../explorer/pwa-panels.js";', 'from "./pwa-panels-stub.mjs";')
  .replace(
    'from "../explorer/emoji-filter.js";',
    'from "./emoji-filter-stub.mjs";',
  )
  .replace(/value: string\[\]/g, "value")
  .replace(/options: any/g, "options")
  .replace(/args: any\[\]/g, "args")
  .replace(/amount: number/g, "amount")
  .replace(/item: any/g, "item")
  .replace(/key: string/g, "key")
  .replace(/value: string/g, "value");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "explorer-bootstrap-runtime-test-"),
);

const writeStub = async (filename: string, lines: string[]) => {
  await fs.writeFile(
    path.join(tempDirectory, filename),
    `${lines.join("\n")}\n`,
  );
};

await writeStub("explorer-runtime-stub.mjs", [
  "export const runtimeCalls = [];",
  "export const runtime = {",
  "  get: (id) => ['runtime-get', id],",
  "  resolveElements: () => ['resolve-elements'],",
  "};",
  "export function createExplorerRuntime(options) {",
  "  runtimeCalls.push(options);",
  "  return runtime;",
  "}",
]);

await writeStub("explorer-dom-stub.mjs", [
  "export const getExplorerElements = 'get-explorer-elements';",
]);

await writeStub("utility-controls-stub.mjs", [
  "export const ensureUtilityControls = 'ensure-utility-controls';",
  "export const positionFavoriteButton = 'position-favorite-button';",
]);

await writeStub("ui-binding-runtime-stub.mjs", [
  "export const calls = [];",
  "export const runtime = {",
  "  assignControls: (...args) => ['assign-controls', args],",
  "  assignElements: (...args) => ['assign-elements', args],",
  "  assignModifierFieldsets: (...args) => ['assign-fieldsets', args],",
  "  hideModifierEmojiAccessibility: (...args) => ['hide-modifier-a11y', args],",
  "};",
  "export function createUiBindingRuntime(options) {",
  "  calls.push(options);",
  "  return runtime;",
  "}",
]);

await writeStub("startup-runtime-stub.mjs", [
  "export const calls = [];",
  "export const runtime = {",
  "  finishExplorerLoading: (...args) => ['finish-explorer-loading', args],",
  "  onLoad: (...args) => ['on-load', args],",
  "  removeLegacyDialogElements: (...args) => ['remove-legacy-dialog-elements', args],",
  "  revealExplorer: (...args) => ['reveal-explorer', args],",
  "};",
  "export function createStartupRuntime(options) {",
  "  calls.push(options);",
  "  return runtime;",
  "}",
]);

await writeStub("pixel-editor-runtime-stub.mjs", [
  "export const calls = [];",
  "export const runtime = {",
  "  ensurePixelEditor: (...args) => ['ensure-pixel-editor', args],",
  "};",
  "export function createPixelEditorRuntime(options) {",
  "  calls.push(options);",
  "  return runtime;",
  "}",
]);

await writeStub("version-mode-runtime-stub.mjs", [
  "export const calls = [];",
  "export const runtime = {",
  "  populateOptions: (...args) => ['populate-options', args],",
  "  render: (...args) => ['render-version-mode', args],",
  "  toggle: (...args) => ['toggle-version-mode', args],",
  "};",
  "export function createVersionModeRuntime(options) {",
  "  calls.push(options);",
  "  return runtime;",
  "}",
]);

await writeStub("browser-runtime-config-stub.mjs", [
  "export const calls = [];",
  "export const runtime = {",
  "  load: (...args) => ['load-search-languages', args],",
  "  render: (...args) => ['render-search-languages', args],",
  "  select: (...args) => ['select-language-link', args],",
  "  set: (...args) => ['set-search-language', args],",
  "};",
  "export function createBrowserRuntimeConfig(options) {",
  "  calls.push(options);",
  "  return runtime;",
  "}",
]);

await writeStub("dialog-runtime-config-stub.mjs", [
  "export const calls = [];",
  "export const runtime = {",
  "  showEmoji: (...args) => ['show-emoji', args],",
  "  navigateEmoji: (...args) => ['navigate-emoji', args],",
  "  updateDialogNavigation: (...args) => ['update-dialog-navigation', args],",
  "  updateCompositionBackButton: (...args) => ['update-composition-back-button', args],",
  "};",
  "export function createDialogRuntimeConfig(options) {",
  "  calls.push(options);",
  "  return runtime;",
  "}",
]);

await writeStub("explorer-labels-stub.mjs", [
  "export const languageFlags = { en: '🇺🇸' };",
  "export const sequenceTranslationKeys = { zwj: 'joiner' };",
  "export const sequenceTypeLabels = { zwj: 'ZWJ' };",
  "export const statusTranslationKeys = { fullyQualified: 'fq' };",
  "export const versionModeDefinitions = ['all', 'selected'];",
]);

await writeStub("pwa-panels-stub.mjs", [
  "export const closePanelDialog = 'close-panel-dialog';",
  "export const onPanelDialogClose = 'on-panel-dialog-close';",
  "export const openPanelDialog = 'open-panel-dialog';",
  "export const updateWebAppManifest = 'update-webapp-manifest';",
]);

await writeStub("emoji-filter-stub.mjs", [
  "export const genderCalls = [];",
  "export function getEmojiGenders(item, emojiByKey) {",
  "  genderCalls.push([item, emojiByKey]);",
  "  return ['emoji-genders', item, emojiByKey];",
  "}",
]);

await fs.writeFile(
  path.join(tempDirectory, "explorer-bootstrap-runtime.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-bootstrap-runtime.mjs")).href
);
const { createExplorerBootstrapRuntime } =
  module as typeof import("../../src/app/explorer-bootstrap-runtime.js");

const state = {
  currentEmojiKey: "wave",
  emojiByKey: { wave: "👋" },
  searchLoadId: 5,
  searchLocales: ["en"],
  selectedSearchLocale: "en",
  searchAnnotations: null,
  searchLabels: null,
  searchSubgroupLabels: null,
  byId: { wave: { id: "wave" } },
  currentDialogParentStack: ["favorites"],
  dialogNavigationKeys: ["wave", "thumbsUp"],
  displayedKeys: ["wave"],
  copiedEmojiKeys: ["wave"],
  favoriteEmojiKeys: ["thumbsUp"],
  explorerPreferences: { theme: "retro" },
};

let pixelEditorValue = {
  refreshFontBuild: () => ["refresh-font-build"],
  open: (...args: unknown[]) => ["open-editor", args],
};
let pixelEditorPromiseValue = "pixel-editor-promise";

const options = {
  setControls: (...args: unknown[]) => ["set-controls", args],
  setElements: (...args: unknown[]) => ["set-elements", args],
  setFieldsets: (...args: unknown[]) => ["set-fieldsets", args],
  skinToneCheckboxes: () => ["1F3FB"],
  hairCheckboxes: () => ["red"],
  genderCheckboxes: () => ["neutral"],
  state: () => state,
  formatNumber: "format-number",
  formatPercent: "format-percent",
  getPixelEditor: () => pixelEditorValue,
  getPixelEditorPromise: () => pixelEditorPromiseValue,
  setPixelEditor: (value: unknown) => {
    pixelEditorValue = value as typeof pixelEditorValue;
  },
  setPixelEditorPromise: (value: unknown) => {
    pixelEditorPromiseValue = value as string;
  },
  translate: "translate",
  drawList: (...args: unknown[]) => ["draw-list", args],
  renderCategoryFilters: (...args: unknown[]) => [
    "render-category-filters",
    args,
  ],
  versionModeSelector: () => "version-mode-selector",
  versionModeToggle: () => "version-mode-toggle",
  applyDialogUrlState: "apply-dialog-url-state",
  applyPixelArtworkClass: "apply-pixel-artwork-class",
  applyStandalonePixelArtwork: "apply-standalone-pixel-artwork",
  languageDialog: () => "language-dialog",
  languageList: () => "language-list",
  languagePicker: () => "language-picker",
  languagePickerFlag: () => "language-picker-flag",
  languagePickerLabel: () => "language-picker-label",
  loadUiTranslations: "load-ui-translations",
  nextSearchLoadId: () => ++state.searchLoadId,
  refreshLocalizedLabels: "refresh-localized-labels",
  restoreDeveloperMode: "restore-developer-mode",
  savePreference: "save-preference",
  setApplyingUrlState: "set-applying-url-state",
  suppressedPanelCloses: () => "suppressed-panel-closes",
  syncUrlState: (...args: unknown[]) => ["sync-url-state", args],
  updateModifierArtwork: () => ["update-modifier-artwork"],
  updatePixelArtworkManifest: "update-pixel-artwork-manifest",
  copyStatus: () => "copy-status",
  developerModeEnabled: "developer-mode-enabled",
  displayGroupName: "display-group-name",
  displayUnicodeSubGroupName: "display-unicode-subgroup-name",
  focusInitialEmojiDialogAction: "focus-initial-action",
  getIntroducedVersion: "get-introduced-version",
  setDialogView: (...args: unknown[]) => ["set-dialog-view", args],
  updateEmojiComposition: "update-emoji-composition",
  updateFavoriteButton: "update-favorite-button",
  updateRenderingDiagnostic: "update-rendering-diagnostic",
  advancedFilters: () => "advanced-filters",
  advancedFiltersButton: () => "advanced-filters-button",
  applyingUrlState: () => false,
  applyBasicUrlState: "apply-basic-url-state",
  bindAudioInteractions: "bind-audio-interactions",
  clearFiltersButton: () => "clear-filters-button",
  developerModeToggle: () => "developer-mode-toggle",
  emojiFontChoices: () => ["system", "pixel"],
  emojiList: () => "emoji-list",
  groupFilterDialog: () => "group-filter-dialog",
  groupPickerTrigger: () => "group-picker-trigger",
  groupSelector: () => "group-selector",
  helpDialog: () => "help-dialog",
  helpPicker: () => "help-picker",
  installApp: "install-app",
  installAppButton: () => "install-app-button",
  installDialog: () => "install-dialog",
  loadData: "load-data",
  loadSearchLanguages: () => ["load-search-languages-option"],
  matchCount: () => "match-count",
  navigateEmoji: (...args: unknown[]) => ["navigate-emoji-option", args],
  onClick: "on-click",
  onCompactChoiceKeyDown: "on-compact-choice-keydown",
  onDocumentKeyDown: "on-document-keydown",
  onEmojiDialogClick: "on-emoji-dialog-click",
  onEmojiDialogClose: "on-emoji-dialog-close",
  onEmojiFocus: "on-emoji-focus",
  onHairChange: "on-hair-change",
  onEmojiKeyDown: "on-emoji-keydown",
  onGenderChange: "on-gender-change",
  onSkinToneChange: "on-skin-tone-change",
  onOrderModeChange: "on-order-mode-change",
  onVersionRangeInput: "on-version-range-input",
  openFilterPicker: "open-filter-picker",
  orderButtons: () => "order-buttons",
  panelDialogs: "panel-dialogs",
  populateVersionModeOptions: (...args: unknown[]) => [
    "populate-version-mode-options",
    args,
  ],
  renderDeveloperMode: "render-developer-mode",
  renderInstallAppButton: "render-install-app-button",
  renderPixelFontToggle: "render-pixel-font-toggle",
  renderSavedEmoji: "render-saved-emoji",
  renderThemeToggle: "render-theme-toggle",
  renderVersionModeToggle: () => ["render-version-mode-toggle"],
  resetFilters: () => ["reset-filters"],
  savedDialog: () => "saved-dialog",
  savedPicker: () => "saved-picker",
  scheduleSearchDraw: "schedule-search-draw",
  searchText: () => "search-text",
  selectEmojiFont: "select-emoji-font",
  selectTheme: "select-theme",
  setUrlStateReady: "set-url-state-ready",
  showEmoji: (...args: unknown[]) => ["show-emoji-option", args],
  stepVersion: "step-version",
  subGroupFilterDialog: () => "subgroup-filter-dialog",
  subGroupPickerTrigger: () => "subgroup-picker-trigger",
  subGroupSelector: () => "subgroup-selector",
  themeChoices: () => ["light", "dark", "retro"],
  toggleDeveloperMode: "toggle-developer-mode",
  toggleVersionMode: (...args: unknown[]) => [
    "toggle-version-mode-option",
    args,
  ],
  toolbar: () => "toolbar",
  updateOnlineStatus: "update-online-status",
  urlStateReady: () => true,
  versionNext: () => "version-next",
  versionPrevious: () => "version-previous",
  versionRange: () => "version-range",
  versionSelector: () => "version-selector",
};

const runtime = createExplorerBootstrapRuntime(options);

const explorerRuntimeStub = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-runtime-stub.mjs")).href
);
const uiBindingStub = await import(
  pathToFileURL(path.join(tempDirectory, "ui-binding-runtime-stub.mjs")).href
);
const startupRuntimeStub = await import(
  pathToFileURL(path.join(tempDirectory, "startup-runtime-stub.mjs")).href
);
const pixelEditorRuntimeStub = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-runtime-stub.mjs")).href
);
const versionModeRuntimeStub = await import(
  pathToFileURL(path.join(tempDirectory, "version-mode-runtime-stub.mjs")).href
);
const browserRuntimeConfigStub = await import(
  pathToFileURL(path.join(tempDirectory, "browser-runtime-config-stub.mjs"))
    .href
);
const dialogRuntimeConfigStub = await import(
  pathToFileURL(path.join(tempDirectory, "dialog-runtime-config-stub.mjs")).href
);
const emojiFilterStub = await import(
  pathToFileURL(path.join(tempDirectory, "emoji-filter-stub.mjs")).href
);

assert.equal(explorerRuntimeStub.runtimeCalls.length, 1);
assert.equal(uiBindingStub.calls.length, 1);
assert.equal(pixelEditorRuntimeStub.calls.length, 1);
assert.equal(versionModeRuntimeStub.calls.length, 1);
assert.equal(browserRuntimeConfigStub.calls.length, 1);
assert.equal(dialogRuntimeConfigStub.calls.length, 1);
assert.equal(startupRuntimeStub.calls.length, 1);

assert.deepEqual(explorerRuntimeStub.runtimeCalls[0], {
  ensureUtilityControls: "ensure-utility-controls",
  getElements: "get-explorer-elements",
});

const uiBindingCall = uiBindingStub.calls[0];
assert.equal(uiBindingCall.setControls, options.setControls);
assert.equal(uiBindingCall.skinToneCheckboxes()[0], "1F3FB");

const pixelEditorCall = pixelEditorRuntimeStub.calls[0];
assert.equal(pixelEditorCall.currentEmojiKey(), "wave");
assert.deepEqual(pixelEditorCall.dialog(), ["runtime-get", "exampleDialog"]);
assert.equal(pixelEditorCall.emojiByKey().wave, "👋");
assert.equal(pixelEditorCall.setEditor, options.setPixelEditor);
assert.equal(pixelEditorCall.setPromise, options.setPixelEditorPromise);

const versionModeCall = versionModeRuntimeStub.calls[0];
assert.deepEqual(versionModeCall.definitions, ["all", "selected"]);
assert.deepEqual(versionModeCall.drawList("x"), ["draw-list", ["x"]]);
assert.deepEqual(versionModeCall.toggle(), "version-mode-toggle");

const browserRuntimeCall = browserRuntimeConfigStub.calls[0];
assert.equal(browserRuntimeCall.closePanelDialog, "close-panel-dialog");
assert.equal(browserRuntimeCall.languageFlags.en, "🇺🇸");
assert.deepEqual(browserRuntimeCall.dialog(), ["runtime-get", "exampleDialog"]);
assert.deepEqual(browserRuntimeCall.nextLoadId(), 6);
assert.equal(state.searchLoadId, 6);
assert.deepEqual(browserRuntimeCall.onPixelFontRevisionLoaded(), undefined);
assert.equal(browserRuntimeCall.updateModifierArtwork(), undefined);

const dialogRuntimeCall = dialogRuntimeConfigStub.calls[0];
assert.equal(dialogRuntimeCall.sequenceTranslationKeys.zwj, "joiner");
assert.deepEqual(dialogRuntimeCall.emojiNext(), ["runtime-get", "emojiNext"]);
assert.deepEqual(dialogRuntimeCall.openEditor("wave", "👋"), [
  "open-editor",
  ["wave", "👋"],
]);
dialogRuntimeCall.setCurrentDialogParentStack(["help"]);
assert.deepEqual(state.currentDialogParentStack, ["help"]);

const startupRuntimeCall = startupRuntimeStub.calls[0];
assert.equal(startupRuntimeCall.onPanelClose, "on-panel-dialog-close");
assert.equal(
  startupRuntimeCall.positionFavoriteButton,
  "position-favorite-button",
);
assert.deepEqual(startupRuntimeCall.resolveElements(), ["resolve-elements"]);
assert.deepEqual(startupRuntimeCall.assignControls("controls"), [
  "assign-controls",
  ["controls"],
]);
assert.deepEqual(startupRuntimeCall.assignModifierFieldsets(), [
  "assign-fieldsets",
  [],
]);
assert.deepEqual(startupRuntimeCall.loadSearchLanguages(), [
  "load-search-languages-option",
]);

assert.equal(runtime.explorerRuntime, explorerRuntimeStub.runtime);
assert.equal(runtime.uiBindingRuntime, uiBindingStub.runtime);
assert.equal(
  runtime.ensurePixelEditor,
  pixelEditorRuntimeStub.runtime.ensurePixelEditor,
);
assert.equal(
  runtime.populateVersionModeOptions,
  versionModeRuntimeStub.runtime.populateOptions,
);
assert.equal(
  runtime.renderVersionModeToggleController,
  versionModeRuntimeStub.runtime.render,
);
assert.equal(runtime.toggleVersionMode, versionModeRuntimeStub.runtime.toggle);
assert.equal(
  runtime.loadSearchLanguages,
  browserRuntimeConfigStub.runtime.load,
);
assert.equal(
  runtime.renderSearchLanguages,
  browserRuntimeConfigStub.runtime.render,
);
assert.equal(
  runtime.selectLanguageLink,
  browserRuntimeConfigStub.runtime.select,
);
assert.equal(runtime.setSearchLanguage, browserRuntimeConfigStub.runtime.set);
assert.equal(runtime.showEmoji, dialogRuntimeConfigStub.runtime.showEmoji);
assert.equal(
  runtime.navigateEmoji,
  dialogRuntimeConfigStub.runtime.navigateEmoji,
);
assert.equal(
  runtime.updateDialogNavigation,
  dialogRuntimeConfigStub.runtime.updateDialogNavigation,
);
assert.equal(
  runtime.updateCompositionBackButton,
  dialogRuntimeConfigStub.runtime.updateCompositionBackButton,
);
assert.equal(
  runtime.finishExplorerLoading,
  startupRuntimeStub.runtime.finishExplorerLoading,
);
assert.equal(runtime.onLoad, startupRuntimeStub.runtime.onLoad);
assert.equal(
  runtime.removeLegacyDialogElements,
  startupRuntimeStub.runtime.removeLegacyDialogElements,
);
assert.equal(runtime.revealExplorer, startupRuntimeStub.runtime.revealExplorer);
assert.deepEqual(runtime.getEmojiGenders("wave"), [
  "emoji-genders",
  "wave",
  state.emojiByKey,
]);
assert.deepEqual(emojiFilterStub.genderCalls, [["wave", state.emojiByKey]]);
