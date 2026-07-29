import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// coverage target: ../../src/app/startup-runtime.js

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const sourceText = await fs.readFile(
  path.join(root, "src/app/startup-runtime.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace('from "../explorer-app.js";', 'from "./explorer-app-stub.mjs";')
  .replace(
    'import { createFilterControlSetup } from "../explorer/filter-controls.js";',
    'import { createFilterControlSetup } from "./filter-controls-stub.mjs";',
  )
  .replace(
    'import { observeToolbarHeight } from "../explorer/toolbar/toolbar-layout.js";',
    'import { observeToolbarHeight } from "./toolbar-layout-stub.mjs";',
  )
  .replace('from "../explorer/pwa-panels.js";', 'from "./pwa-panels-stub.mjs";')
  .replace(
    'import { createStartupOrchestrator } from "./startup-orchestrator.js";',
    'import { createStartupOrchestrator } from "./startup-orchestrator-stub.mjs";',
  )
  .replace(/options: any/g, "options")
  .replace(/args: any\[\]/g, "args")
  .replace(/amount: number/g, "amount");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "startup-runtime-test-"),
);

const writeStub = async (filename: string, lines: string[]) => {
  await fs.writeFile(
    path.join(tempDirectory, filename),
    `${lines.join("\n")}\n`,
  );
};

await writeStub("explorer-app-stub.mjs", [
  "export const bindExplorerEvents = 'bind-explorer-events';",
  "export const finalizeExplorerStartup = 'finalize-explorer-startup';",
  "export const initializeExplorerControls = 'initialize-explorer-controls';",
]);
await writeStub("filter-controls-stub.mjs", [
  "export const createFilterControlSetup = 'create-filter-control-setup';",
]);
await writeStub("toolbar-layout-stub.mjs", [
  "export const observeToolbarHeight = 'observe-toolbar-height';",
]);
await writeStub("pwa-panels-stub.mjs", [
  "export const closePanelDialog = 'close-panel-dialog';",
  "export const openPanelDialog = 'open-panel-dialog';",
  "export function getInstalledDisplayQueries() { return 'installed-display-queries'; }",
]);
await writeStub("startup-orchestrator-stub.mjs", [
  "export const calls = [];",
  "export const result = { kind: 'startup-orchestrator' };",
  "export function createStartupOrchestrator(options) {",
  "  calls.push(options);",
  "  return result;",
  "}",
]);
await fs.writeFile(
  path.join(tempDirectory, "startup-runtime.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "startup-runtime.mjs")).href
);
const orchestratorStub = await import(
  pathToFileURL(path.join(tempDirectory, "startup-orchestrator-stub.mjs")).href
);
const { createStartupRuntime } =
  module as typeof import("../../src/app/startup-runtime.js");

let state = {
  copiedEmojiKeys: ["wave"],
  favoriteEmojiKeys: ["sparkles"],
};

const runtime = createStartupRuntime({
  advancedFilters: () => "advanced-filters",
  advancedFiltersButton: () => "advanced-filters-button",
  applyingUrlState: () => false,
  applyBasicUrlState: "apply-basic-url-state",
  applyDialogUrlState: "apply-dialog-url-state",
  applyPixelArtworkClass: "apply-pixel-artwork-class",
  bindAudioInteractions: "bind-audio-interactions",
  assignControls: "assign-controls",
  assignElements: "assign-elements",
  assignModifierFieldsets: "assign-modifier-fieldsets",
  clearFiltersButton: () => "clear-filters-button",
  copiedEmojiKeys: () => state.copiedEmojiKeys,
  developerModeToggle: () => "developer-mode-toggle",
  dialog: () => "dialog",
  drawList: (...args: unknown[]) => ["draw-list", args],
  emojiByKey: () => ({ wave: "👋" }),
  emojiFontChoices: () => "emoji-font-choices",
  emojiList: () => "emoji-list",
  emojiNext: () => "emoji-next",
  emojiPrevious: () => "emoji-previous",
  favoriteEmojiKeys: () => state.favoriteEmojiKeys,
  genderCheckboxes: () => "gender-checkboxes",
  groupFilterDialog: () => "group-filter-dialog",
  groupPickerTrigger: () => "group-picker-trigger",
  groupSelector: () => "group-selector",
  hairCheckboxes: () => "hair-checkboxes",
  helpDialog: () => "help-dialog",
  helpPicker: () => "help-picker",
  hideModifierEmojiAccessibility: "hide-modifier-emoji-accessibility",
  installApp: "install-app",
  installAppButton: () => "install-app-button",
  installDialog: () => "install-dialog",
  languageDialog: () => "language-dialog",
  languageList: () => "language-list",
  languagePicker: () => "language-picker",
  loadData: "load-data",
  loadSearchLanguages: () => "load-search-languages",
  loadUiTranslations: "load-ui-translations",
  matchCount: () => "match-count",
  navigateEmoji: (amount: number) => ["navigate-emoji", amount],
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
  onPanelClose: "on-panel-close",
  onVersionRangeInput: "on-version-range-input",
  openFilterPicker: "open-filter-picker",
  orderButtons: () => "order-buttons",
  panelDialogs: "panel-dialogs",
  populateVersionModeOptions: (...args: unknown[]) => [
    "populate-version-mode-options",
    args,
  ],
  positionFavoriteButton: "position-favorite-button",
  preferences: () => "preferences",
  renderDeveloperMode: "render-developer-mode",
  renderInstallAppButton: "render-install-app-button",
  renderPixelFontToggle: "render-pixel-font-toggle",
  renderSavedEmoji: "render-saved-emoji",
  renderThemeToggle: "render-theme-toggle",
  renderVersionModeToggle: () => "render-version-mode-toggle",
  resolveElements: () => "resolve-elements",
  resetFilters: () => ["reset-filters"],
  savePreference: "save-preference",
  savedDialog: () => "saved-dialog",
  savedPicker: () => "saved-picker",
  scheduleSearchDraw: "schedule-search-draw",
  searchText: () => "search-text",
  selectEmojiFont: "select-emoji-font",
  selectTheme: "select-theme",
  setUrlStateReady: "set-url-state-ready",
  showEmoji: (...args: unknown[]) => ["show-emoji", args],
  skinToneCheckboxes: () => "skin-tone-checkboxes",
  stepVersion: "step-version",
  subGroupFilterDialog: () => "subgroup-filter-dialog",
  subGroupPickerTrigger: () => "subgroup-picker-trigger",
  subGroupSelector: () => "subgroup-selector",
  suppressedPanelCloses: () => "suppressed-panel-closes",
  syncUrlState: (...args: unknown[]) => ["sync-url-state", args],
  syncVersionRange: (...args: unknown[]) => ["sync-version-range", args],
  themeChoices: () => "theme-choices",
  toggleDeveloperMode: "toggle-developer-mode",
  toggleVersionMode: (...args: unknown[]) => ["toggle-version-mode", args],
  toolbar: () => "toolbar",
  updateOnlineStatus: "update-online-status",
  urlStateReady: () => true,
  versionModeSelector: () => "version-mode-selector",
  versionModeToggle: () => "version-mode-toggle",
  versionNext: () => "version-next",
  versionPrevious: () => "version-previous",
  versionRange: () => "version-range",
  versionSelector: () => "version-selector",
});

assert.equal(runtime, orchestratorStub.result);
assert.equal(orchestratorStub.calls.length, 1);
const call = orchestratorStub.calls[0];

assert.equal(call.bindEvents, "bind-explorer-events");
assert.equal(call.finalizeStartup, "finalize-explorer-startup");
assert.equal(call.createFilterControlSetup, "create-filter-control-setup");
assert.equal(call.observeToolbarHeight, "observe-toolbar-height");
assert.equal(call.closePanel, "close-panel-dialog");
assert.equal(call.openPanel, "open-panel-dialog");
assert.equal(call.installedDisplayQueries, "installed-display-queries");

assert.equal(call.advancedFilters(), "advanced-filters");
assert.equal(call.advancedFiltersButton(), "advanced-filters-button");
assert.equal(call.applyingUrlState(), false);
assert.equal(call.applyBasicUrlState, "apply-basic-url-state");
assert.equal(call.applyDialogUrlState, "apply-dialog-url-state");
assert.equal(call.applyPixelArtworkClass, "apply-pixel-artwork-class");
assert.equal(call.bindAudioInteractions, "bind-audio-interactions");
assert.equal(call.assignControls, "assign-controls");
assert.equal(call.assignElements, "assign-elements");
assert.equal(call.assignModifierFieldsets, "assign-modifier-fieldsets");
assert.equal(call.clearFiltersButton(), "clear-filters-button");
assert.deepEqual(call.copiedEmojiKeys(), ["wave"]);
assert.equal(call.developerModeToggle(), "developer-mode-toggle");
assert.equal(call.dialog(), "dialog");
assert.deepEqual(call.drawList("x"), ["draw-list", ["x"]]);
assert.deepEqual(call.emojiByKey(), { wave: "👋" });
assert.equal(call.emojiFontChoices(), "emoji-font-choices");
assert.equal(call.emojiList(), "emoji-list");
assert.equal(call.emojiNext(), "emoji-next");
assert.equal(call.emojiPrevious(), "emoji-previous");
assert.deepEqual(call.favoriteEmojiKeys(), ["sparkles"]);
assert.equal(call.genderCheckboxes(), "gender-checkboxes");
assert.equal(call.groupFilterDialog(), "group-filter-dialog");
assert.equal(call.groupPickerTrigger(), "group-picker-trigger");
assert.equal(call.groupSelector(), "group-selector");
assert.equal(call.hairCheckboxes(), "hair-checkboxes");
assert.equal(call.helpDialog(), "help-dialog");
assert.equal(call.helpPicker(), "help-picker");
assert.equal(
  call.hideModifierEmojiAccessibility,
  "hide-modifier-emoji-accessibility",
);
assert.equal(call.initializeControls, "initialize-explorer-controls");
assert.equal(call.installApp, "install-app");
assert.equal(call.installAppButton(), "install-app-button");
assert.equal(call.installDialog(), "install-dialog");
assert.equal(call.languageDialog(), "language-dialog");
assert.equal(call.languageList(), "language-list");
assert.equal(call.languagePicker(), "language-picker");
assert.equal(call.loadData, "load-data");
assert.equal(call.loadSearchLanguages(), "load-search-languages");
assert.equal(call.loadUiTranslations, "load-ui-translations");
assert.equal(call.matchCount(), "match-count");
assert.deepEqual(call.navigateEmoji(3), ["navigate-emoji", 3]);
assert.equal(call.onClick, "on-click");
assert.equal(call.onCompactChoiceKeyDown, "on-compact-choice-keydown");
assert.equal(call.onDocumentKeyDown, "on-document-keydown");
assert.equal(call.onEmojiDialogClick, "on-emoji-dialog-click");
assert.equal(call.onEmojiDialogClose, "on-emoji-dialog-close");
assert.equal(call.onEmojiFocus, "on-emoji-focus");
assert.equal(call.onHairChange, "on-hair-change");
assert.equal(call.onEmojiKeyDown, "on-emoji-keydown");
assert.equal(call.onGenderChange, "on-gender-change");
assert.equal(call.onSkinToneChange, "on-skin-tone-change");
assert.equal(call.onOrderModeChange, "on-order-mode-change");
assert.equal(call.onPanelClose, "on-panel-close");
assert.equal(call.onVersionRangeInput, "on-version-range-input");
assert.equal(call.openFilterPicker, "open-filter-picker");
assert.equal(call.orderButtons(), "order-buttons");
assert.equal(call.panelDialogs, "panel-dialogs");
assert.deepEqual(call.populateVersionModeOptions("a"), [
  "populate-version-mode-options",
  ["a"],
]);
assert.equal(call.positionFavoriteButton, "position-favorite-button");
assert.equal(call.preferences(), "preferences");
assert.equal(call.renderDeveloperMode, "render-developer-mode");
assert.equal(call.renderInstallAppButton, "render-install-app-button");
assert.equal(call.renderPixelFontToggle, "render-pixel-font-toggle");
assert.equal(call.renderSavedEmoji, "render-saved-emoji");
assert.equal(call.renderThemeToggle, "render-theme-toggle");
assert.equal(call.renderVersionModeToggle(), "render-version-mode-toggle");
assert.equal(call.resolveElements(), "resolve-elements");
assert.deepEqual(call.resetFilters(), ["reset-filters"]);
assert.equal(call.savePreference, "save-preference");
assert.equal(call.savedDialog(), "saved-dialog");
assert.equal(call.savedPicker(), "saved-picker");
assert.equal(call.scheduleSearchDraw, "schedule-search-draw");
assert.equal(call.searchText(), "search-text");
assert.equal(call.selectEmojiFont, "select-emoji-font");
assert.equal(call.selectTheme, "select-theme");
assert.equal(call.setUrlStateReady, "set-url-state-ready");
assert.deepEqual(call.showEmoji("wave"), ["show-emoji", ["wave"]]);
assert.equal(call.skinToneCheckboxes(), "skin-tone-checkboxes");
assert.equal(call.stepVersion, "step-version");
assert.equal(call.subGroupFilterDialog(), "subgroup-filter-dialog");
assert.equal(call.subGroupPickerTrigger(), "subgroup-picker-trigger");
assert.equal(call.subGroupSelector(), "subgroup-selector");
assert.equal(call.suppressedPanelCloses(), "suppressed-panel-closes");
assert.deepEqual(call.syncUrlState("replace"), ["sync-url-state", ["replace"]]);
assert.deepEqual(call.syncVersionRange("through"), [
  "sync-version-range",
  ["through"],
]);
assert.equal(call.themeChoices(), "theme-choices");
assert.equal(call.toggleDeveloperMode, "toggle-developer-mode");
assert.deepEqual(call.toggleVersionMode("selected"), [
  "toggle-version-mode",
  ["selected"],
]);
assert.equal(call.toolbar(), "toolbar");
assert.equal(call.updateOnlineStatus, "update-online-status");
assert.equal(call.urlStateReady(), true);
assert.equal(call.versionModeSelector(), "version-mode-selector");
assert.equal(call.versionModeToggle(), "version-mode-toggle");
assert.equal(call.versionNext(), "version-next");
assert.equal(call.versionPrevious(), "version-previous");
assert.equal(call.versionRange(), "version-range");
assert.equal(call.versionSelector(), "version-selector");
