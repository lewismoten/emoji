import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// coverage target: ../../src/app/bootstrap/explorer-bootstrap-session.js

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const sourceText = await fs.readFile(
  path.join(root, "src/app/bootstrap/explorer-bootstrap-session.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'from "../../explorer/explorer-labels.js";',
    'from "./explorer-labels-stub.mjs";',
  )
  .replace(
    'from "../../explorer/category-rules.js";',
    'from "./category-rules-stub.mjs";',
  )
  .replace(
    'from "../../explorer/emoji-format.js";',
    'from "./emoji-format-stub.mjs";',
  )
  .replace(
    'from "../../explorer/saved-emoji.js";',
    'from "./saved-emoji-stub.mjs";',
  )
  .replace(
    'from "../../explorer/pwa-panels.js";',
    'from "./pwa-panels-stub.mjs";',
  )
  .replace('from "../../explorer-app.js";', 'from "./explorer-app-stub.mjs";')
  .replace(
    'from "../../explorer-state.js";',
    'from "./explorer-state-stub.mjs";',
  )
  .replace(
    'from "../../explorer/url-state.js";',
    'from "./url-state-stub.mjs";',
  )
  .replace(
    'from "../browser-runtime.js";',
    'from "./browser-runtime-stub.mjs";',
  )
  .replace(
    'from "./explorer-bootstrap-bindings.js";',
    'from "./bindings-stub.mjs";',
  )
  .replace(
    'from "./explorer-bootstrap-options.js";',
    'from "./bootstrap-options-stub.mjs";',
  )
  .replace(
    'from "./explorer-bootstrap-controllers.js";',
    'from "./controllers-stub.mjs";',
  )
  .replace(
    'from "./explorer-bootstrap-session-runtime.js";',
    'from "./session-runtime-stub.mjs";',
  )
  .replace('from "./explorer-bootstrap-shell.js";', 'from "./shell-stub.mjs";')
  .replace(
    'from "../explorer-preferences.js";',
    'from "./preferences-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "explorer-bootstrap-session-test-"),
);

const writeStub = async (filename: string, lines: string[]) => {
  await fs.writeFile(
    path.join(tempDirectory, filename),
    `${lines.join("\n")}\n`,
  );
};

await writeStub("explorer-labels-stub.mjs", [
  "export const explorerLabelKeys = { group: 'group.label' };",
  "export const sequenceTranslationKeys = { zwj: 'joiner' };",
  "export const sequenceTypeEmoji = { zwj: '🪢' };",
  "export const sequenceTypeLabels = { zwj: 'ZWJ' };",
  "export const sequenceTypeOrder = ['zwj'];",
  "export const unicodeGroupLabelKeys = { Objects: 'objects.label' };",
  "export const unicodeSubgroupLabelKeys = { mail: 'mail.label' };",
]);

await writeStub("category-rules-stub.mjs", [
  "export const getExplorerSubGroup = (...args) => ['subgroup', args];",
]);

await writeStub("emoji-format-stub.mjs", [
  "export const formatUiNumber = (...args) => ['format-number', args];",
  "export const formatUiPercent = (...args) => ['format-percent', args];",
  "export const normalizeCodePoints = (...args) => ['normalize', args];",
]);

await writeStub("saved-emoji-stub.mjs", [
  "export const animateCopyConfirmation = (...args) => ['animate-copy', args];",
]);

await writeStub("pwa-panels-stub.mjs", [
  "export const openPanelDialogCalls = [];",
  "export function openPanelDialog(...args) {",
  "  openPanelDialogCalls.push(args);",
  "  return ['open-panel-dialog', args];",
  "}",
]);

await writeStub("explorer-app-stub.mjs", [
  "export const appCalls = [];",
  "export function createExplorerApp(options) {",
  "  const record = { options, startWhenReadyCalls: 0 };",
  "  appCalls.push(record);",
  "  return { startWhenReady() { record.startWhenReadyCalls += 1; } };",
  "}",
]);

await writeStub("explorer-state-stub.mjs", [
  "export const states = [];",
  "export function createExplorerState() {",
  "  const state = {",
  "    uiStrings: { 'group.label': 'Translated Group' },",
  "    selectedSearchLocale: 'en',",
  "    developerModeFromUrl: false,",
  "    explorerModeFromUrl: '',",
  "  };",
  "  states.push(state);",
  "  return state;",
  "}",
]);

await writeStub("url-state-stub.mjs", [
  "export function parseExplorerModeParam(search) {",
  "  const params = new URLSearchParams(search);",
  "  const value = params.get('mode') ?? '';",
  "  if (value === 'advanced') return 'advanced';",
  "  if (value === 'developer') return 'developer';",
  "  return '';",
  "}",
]);

await writeStub("browser-runtime-stub.mjs", [
  "export const formatterCalls = [];",
  "export function createUiFormatters(options) {",
  "  formatterCalls.push(options);",
  "  return {",
  "    formatUiNumber: (...args) => ['ui-number', args],",
  "    formatUiPercent: (...args) => ['ui-percent', args],",
  "  };",
  "}",
]);

await writeStub("bindings-stub.mjs", [
  "export const bindingsCreated = [];",
  "export function createExplorerBootstrapBindings() {",
  "  const bindings = {",
  "    applyingUrlState: false,",
  "    copyStatus: 'copy-status',",
  "    developerModeToggle: 'developer-toggle',",
  "    emojiFontChoices: ['system', 'pixel'],",
  "    genderCheckboxes: ['neutral'],",
  "    hairCheckboxes: ['red'],",
  "    installAppButton: 'install-button',",
  "    installDialog: 'install-dialog',",
  "    offlineStatus: 'offline-status',",
  "    orderButtons: ['unicode'],",
  "    savedDialog: 'saved-dialog',",
  "    skinToneCheckboxes: ['1F3FB'],",
  "    suppressDialogCloseSync: false,",
  "    themeChoices: ['light', 'dark', 'retro'],",
  "    urlStateReady: true,",
  "    versionModeSelector: 'version-mode-selector',",
  "    versionSelector: 'version-selector',",
  "    activeFilterSummary: 'active-summary',",
  "    activeFilterText: 'active-text',",
  "    compactGroupChoices: ['group-choice'],",
  "    compactGroupLabel: 'group-label',",
  "    compactSequenceChoices: ['sequence-choice'],",
  "    compactSequenceLabel: 'sequence-label',",
  "    compactSubGroupChoices: ['subgroup-choice'],",
  "    compactSubGroupLabel: 'subgroup-label',",
  "    emojiList: 'emoji-list',",
  "    genderFieldset: 'gender-fieldset',",
  "    groupFilterDialog: 'group-dialog',",
  "    groupPickerTrigger: 'group-trigger',",
  "    groupSelector: 'group-selector',",
  "    hairFieldset: 'hair-fieldset',",
  "    helpDialog: 'help-dialog',",
  "    languageList: 'language-list',",
  "    matchCount: 'match-count',",
  "    modifierFilters: 'modifier-filters',",
  "    listRenderGeneration: 4,",
  "    searchText: 'search-text',",
  "    sequenceTypeSelector: 'sequence-selector',",
  "    skinToneFieldset: 'skin-tone-fieldset',",
  "    subGroupFilterDialog: 'subgroup-dialog',",
  "    subGroupPickerTrigger: 'subgroup-trigger',",
  "    subGroupSelector: 'subgroup-selector',",
  "    suppressedPanelCloses: new WeakSet(),",
  "    versionNext: 'version-next',",
  "    versionPrevious: 'version-previous',",
  "    versionRange: 'version-range',",
  "    versionRangeValue: '15.0',",
  "    advancedFilters: 'advanced-filters',",
  "    advancedFiltersButton: 'advanced-filters-button',",
  "    clearFiltersButton: 'clear-filters',",
  "    languageDialog: 'language-dialog',",
  "    languagePicker: 'language-picker',",
  "    languagePickerFlag: 'language-flag',",
  "    languagePickerLabel: 'language-label',",
  "    toolbar: 'toolbar',",
  "  };",
  "  bindingsCreated.push(bindings);",
  "  return bindings;",
  "}",
]);

await writeStub("bootstrap-options-stub.mjs", [
  "export const shellOptionCalls = [];",
  "export const controllerOptionCalls = [];",
  "export function buildExplorerBootstrapShellOptions(options) {",
  "  shellOptionCalls.push(options);",
  "  return { kind: 'shell-options', options };",
  "}",
  "export function buildExplorerBootstrapControllerOptions(options) {",
  "  controllerOptionCalls.push(options);",
  "  return { kind: 'controller-options', options };",
  "}",
]);

await writeStub("controllers-stub.mjs", [
  "export const controllerCalls = [];",
  "export function createExplorerBootstrapControllers(options) {",
  "  controllerCalls.push(options);",
  "  return {",
  "    drawList: (...args) => ['drawList', args],",
  "    loadVersionData: (...args) => ['loadVersionData', args],",
  "    resetFilters: (...args) => ['resetFilters', args],",
  "    syncUrlState: (...args) => ['syncUrlState', args],",
  "    focusInitialAction: (...args) => ['focusInitialAction', args],",
  "    setView: (...args) => ['setView', args],",
  "  };",
  "}",
]);

await writeStub("session-runtime-stub.mjs", [
  "export const sessionRuntimeCalls = [];",
  "export const runtime = {",
  "  removeLegacyDialogElementsCalls: 0,",
  "  onLoad: 'runtime-onload',",
  "  getEmojiGenders: (...args) => ['runtime-genders', args],",
  "  navigateEmoji: (...args) => ['runtime-navigate', args],",
  "  removeLegacyDialogElements() { this.removeLegacyDialogElementsCalls += 1; },",
  "};",
  "export function initializeExplorerBootstrapSessionRuntime(options) {",
  "  sessionRuntimeCalls.push(options);",
  "  return runtime;",
  "}",
]);

await writeStub("shell-stub.mjs", [
  "export const shellCalls = [];",
  "export const shell = {",
  "  applyPixelArtworkClass: 'apply-pixel-class',",
  "  applyStandalonePixelArtwork: 'apply-standalone-artwork',",
  "  bindAudioInteractions: 'bind-audio',",
  "  copyToClipboardValue: 'copy-value',",
  "  developerModeEnabled: 'developer-mode-enabled',",
  "  getIntroducedVersion: 'introduced-version',",
  "  installApp: 'install-app',",
  "  loadPackageManifest: 'load-package-manifest',",
  "  loadUiTranslations: 'load-ui-translations',",
  "  onClick: 'shell-on-click',",
  "  onEmojiDialogClose: 'on-emoji-dialog-close',",
  "  recordCopiedEmoji: 'record-copied-emoji',",
  "  rebuildEmojiCodePointLookup: 'rebuild-codepoint-lookup',",
  "  renderDeveloperMode: (...args) => ['render-developer-mode', args],",
  "  renderInstallAppButton: 'render-install-app-button',",
  "  renderPixelFontToggle: 'render-pixel-font-toggle',",
  "  renderSavedEmoji: 'render-saved-emoji',",
  "  renderThemeToggle: 'render-theme-toggle',",
  "  selectEmojiFont: 'select-emoji-font',",
  "  selectTheme: 'select-theme',",
  "  toggleDeveloperMode: 'toggle-developer-mode',",
  "  updateEmojiComposition: 'update-emoji-composition',",
  "  updateEmojiImportExamples: 'update-emoji-import-examples',",
  "  updateFavoriteButton: 'update-favorite-button',",
  "  updateModifierPixelArtwork: 'update-modifier-pixel-artwork',",
  "  updateOnlineStatus: 'update-online-status',",
  "  updatePixelArtworkManifest: 'update-pixel-artwork-manifest',",
  "  updateRenderingDiagnostic: 'update-rendering-diagnostic',",
  "};",
  "export function createExplorerBootstrapShell(options) {",
  "  shellCalls.push(options);",
  "  return shell;",
  "}",
]);

await writeStub("preferences-stub.mjs", [
  "export const preferenceCalls = [];",
  "export function initializeExplorerPreferences(state) {",
  "  preferenceCalls.push(state);",
  "  return { save: (...args) => ['save-preference', args] };",
  "}",
]);

await fs.writeFile(
  path.join(tempDirectory, "explorer-bootstrap-session.mjs"),
  transformedSource,
);

const globalDocument = { body: { dataset: {} } };
const globalWindow = { location: { search: "?mode=developer" } };

Object.assign(globalThis, {
  document: globalDocument,
  window: globalWindow,
});

await import(
  pathToFileURL(path.join(tempDirectory, "explorer-bootstrap-session.mjs")).href
);

const { formatterCalls } = await import(
  pathToFileURL(path.join(tempDirectory, "browser-runtime-stub.mjs")).href
);
const { bindingsCreated } = await import(
  pathToFileURL(path.join(tempDirectory, "bindings-stub.mjs")).href
);
const { shellOptionCalls, controllerOptionCalls } = await import(
  pathToFileURL(path.join(tempDirectory, "bootstrap-options-stub.mjs")).href
);
const { shellCalls, shell } = await import(
  pathToFileURL(path.join(tempDirectory, "shell-stub.mjs")).href
);
const { controllerCalls } = await import(
  pathToFileURL(path.join(tempDirectory, "controllers-stub.mjs")).href
);
const { sessionRuntimeCalls, runtime } = await import(
  pathToFileURL(path.join(tempDirectory, "session-runtime-stub.mjs")).href
);
const { appCalls } = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-app-stub.mjs")).href
);
const { states } = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-state-stub.mjs")).href
);

assert.equal(states.length, 1);
assert.equal(bindingsCreated.length, 1);
assert.equal(formatterCalls.length, 1);
assert.equal(shellOptionCalls.length, 1);
assert.equal(shellCalls.length, 1);
assert.equal(controllerOptionCalls.length, 1);
assert.equal(controllerCalls.length, 1);
assert.equal(sessionRuntimeCalls.length, 1);
assert.equal(appCalls.length, 1);

const state = states[0];
const bindings = bindingsCreated[0];
const shellBuilderInput = shellOptionCalls[0];
const controllerBuilderInput = controllerOptionCalls[0];
const sessionRuntimeInput = sessionRuntimeCalls[0];
const appCall = appCalls[0];

assert.equal(formatterCalls[0].document, globalDocument);
assert.equal(formatterCalls[0].selectedSearchLocale(), "en");

assert.equal(shellCalls[0].kind, "shell-options");
assert.equal(controllerCalls[0].kind, "controller-options");

assert.equal(
  shellBuilderInput.translate("group.label", "fallback"),
  "Translated Group",
);
assert.equal(shellBuilderInput.translate("missing", "fallback"), "fallback");
assert.deepEqual(shellBuilderInput.drawList(), ["drawList", []]);
assert.deepEqual(shellBuilderInput.normalizeCodePoints("1F44D"), [
  "normalize",
  ["1F44D"],
]);

assert.equal(controllerBuilderInput.unassigned, "\u0000");
assert.equal(controllerBuilderInput.getExplorerSubGroup("mail")[0], "subgroup");
assert.equal(controllerBuilderInput.formatNumber("5")[0], "ui-number");
assert.equal(
  controllerBuilderInput.displayExplorerLabel("group"),
  "Translated Group",
);
assert.deepEqual(controllerBuilderInput.openPanel("help"), [
  "open-panel-dialog",
  ["help"],
]);

assert.deepEqual(bindings.drawList("emoji"), ["drawList", ["emoji"]]);
assert.deepEqual(bindings.loadVersionData("v"), ["loadVersionData", ["v"]]);
assert.deepEqual(bindings.resetFilters(), ["resetFilters", []]);
assert.deepEqual(bindings.syncUrlState("replace"), [
  "syncUrlState",
  ["replace"],
]);
assert.deepEqual(bindings.focusInitialEmojiDialogAction(), [
  "focusInitialAction",
  [],
]);
assert.deepEqual(bindings.setEmojiDialogView("code"), ["setView", ["code"]]);

assert.equal(sessionRuntimeInput.bindings, bindings);
assert.equal(sessionRuntimeInput.controllers.drawList(...[])[0], "drawList");
assert.equal(sessionRuntimeInput.shell, shell);
assert.equal(sessionRuntimeInput.state(), state);
assert.equal(
  sessionRuntimeInput.translate("group.label", "fallback"),
  "Translated Group",
);
assert.equal(bindings.bootstrapRuntime, runtime);

sessionRuntimeInput.restoreDeveloperMode();
assert.equal(state.developerModeFromUrl, true);
assert.equal(state.explorerModeFromUrl, "developer");
assert.deepEqual(shell.renderDeveloperMode(), ["render-developer-mode", []]);

assert.equal(runtime.removeLegacyDialogElementsCalls, 1);
assert.equal(appCall.options.window, globalWindow);
assert.equal(appCall.options.start, "runtime-onload");
assert.equal(appCall.startWhenReadyCalls, 1);
