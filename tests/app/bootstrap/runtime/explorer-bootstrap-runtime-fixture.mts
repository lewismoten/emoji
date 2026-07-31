import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sourceReplacements = [
  ['from "../explorer-runtime.js";', 'from "./explorer-runtime-stub.mjs";'],
  ['from "../../explorer/explorer-dom.js";', 'from "./explorer-dom-stub.mjs";'],
  [
    'from "../../explorer/utility/utility-controls.js";',
    'from "./utility-controls-stub.mjs";',
  ],
  ['from "../ui-binding-runtime.js";', 'from "./ui-binding-runtime-stub.mjs";'],
  [
    'from "../startup/startup-runtime.js";',
    'from "./startup-runtime-stub.mjs";',
  ],
  [
    'from "../pixel-editor-loader-runtime.js";',
    'from "./pixel-editor-runtime-stub.mjs";',
  ],
  [
    'from "../version/version-mode-runtime.js";',
    'from "./version-mode-runtime-stub.mjs";',
  ],
  [
    'from "../browser/browser-runtime-config.js";',
    'from "./browser-runtime-config-stub.mjs";',
  ],
  [
    'from "../dialog/dialog-runtime-config.js";',
    'from "./dialog-runtime-config-stub.mjs";',
  ],
  [
    'from "../../explorer/explorer-labels.js";',
    'from "./explorer-labels-stub.mjs";',
  ],
  ['from "../../explorer/pwa-panels.js";', 'from "./pwa-panels-stub.mjs";'],
  [
    'from "../../explorer/emoji/emoji-filter.js";',
    'from "./emoji-filter-stub.mjs";',
  ],
] as const;

const stubFiles = {
  "explorer-runtime-stub.mjs": `export const runtimeCalls=[];export const runtime={get:(id)=>['runtime-get',id],resolveElements:()=>['resolve-elements']};export function createExplorerRuntime(options){runtimeCalls.push(options);return runtime;}`,
  "explorer-dom-stub.mjs": `export const getExplorerElements='get-explorer-elements';`,
  "utility-controls-stub.mjs": `export const ensureUtilityControls='ensure-utility-controls';export const positionFavoriteButton='position-favorite-button';`,
  "ui-binding-runtime-stub.mjs": `export const calls=[];export const runtime={assignControls:(...args)=>['assign-controls',args],assignElements:(...args)=>['assign-elements',args],assignModifierFieldsets:(...args)=>['assign-fieldsets',args],hideModifierEmojiAccessibility:(...args)=>['hide-modifier-a11y',args]};export function createUiBindingRuntime(options){calls.push(options);return runtime;}`,
  "startup-runtime-stub.mjs": `export const calls=[];export const runtime={finishExplorerLoading:(...args)=>['finish-explorer-loading',args],onLoad:(...args)=>['on-load',args],removeLegacyDialogElements:(...args)=>['remove-legacy-dialog-elements',args],revealExplorer:(...args)=>['reveal-explorer',args]};export function createStartupRuntime(options){calls.push(options);return runtime;}`,
  "pixel-editor-runtime-stub.mjs": `export const calls=[];export const runtime={ensurePixelEditor:(...args)=>['ensure-pixel-editor',args]};export function createPixelEditorRuntime(options){calls.push(options);return runtime;}`,
  "version-mode-runtime-stub.mjs": `export const calls=[];export const runtime={populateOptions:(...args)=>['populate-options',args],render:(...args)=>['render-version-mode',args],toggle:(...args)=>['toggle-version-mode',args]};export function createVersionModeRuntime(options){calls.push(options);return runtime;}`,
  "browser-runtime-config-stub.mjs": `export const calls=[];export const runtime={load:(...args)=>['load-search-languages',args],render:(...args)=>['render-search-languages',args],select:(...args)=>['select-language-link',args],set:(...args)=>['set-search-language',args]};export function createBrowserRuntimeConfig(options){calls.push(options);return runtime;}`,
  "dialog-runtime-config-stub.mjs": `export const calls=[];export const runtime={showEmoji:(...args)=>['show-emoji',args],navigateEmoji:(...args)=>['navigate-emoji',args],updateDialogNavigation:(...args)=>['update-dialog-navigation',args],updateCompositionBackButton:(...args)=>['update-composition-back-button',args]};export function createDialogRuntimeConfig(options){calls.push(options);return runtime;}`,
  "explorer-labels-stub.mjs": `export const languageFlags={en:'🇺🇸'};export const sequenceTranslationKeys={zwj:'joiner'};export const sequenceTypeLabels={zwj:'ZWJ'};export const statusTranslationKeys={fullyQualified:'fq'};export const versionModeDefinitions=['all','selected'];`,
  "pwa-panels-stub.mjs": `export const closePanelDialog='close-panel-dialog';export const onPanelDialogClose='on-panel-dialog-close';export const openPanelDialog='open-panel-dialog';export const updateWebAppManifest='update-webapp-manifest';`,
  "emoji-filter-stub.mjs": `export const genderCalls=[];export function getEmojiGenders(item,emojiByKey){genderCalls.push([item,emojiByKey]);return ['emoji-genders',item,emojiByKey];}`,
} as const;

export async function createBootstrapRuntimeFixture() {
  const root = process.cwd();
  const sourcePath = path.join(
    root,
    "src/app/bootstrap/explorer-bootstrap-runtime.ts",
  );
  let sourceText = await fs.readFile(sourcePath, "utf8");
  for (const [from, to] of sourceReplacements)
    sourceText = sourceText.replace(from, to);
  sourceText = sourceText
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
  for (const [filename, content] of Object.entries(stubFiles)) {
    await fs.writeFile(path.join(tempDirectory, filename), `${content}\n`);
  }
  await fs.writeFile(
    path.join(tempDirectory, "explorer-bootstrap-runtime.mjs"),
    sourceText,
  );

  const module = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-bootstrap-runtime.mjs"))
      .href
  );
  const stubs = {
    explorerRuntimeStub: await import(
      pathToFileURL(path.join(tempDirectory, "explorer-runtime-stub.mjs")).href
    ),
    uiBindingStub: await import(
      pathToFileURL(path.join(tempDirectory, "ui-binding-runtime-stub.mjs"))
        .href
    ),
    startupRuntimeStub: await import(
      pathToFileURL(path.join(tempDirectory, "startup-runtime-stub.mjs")).href
    ),
    pixelEditorRuntimeStub: await import(
      pathToFileURL(path.join(tempDirectory, "pixel-editor-runtime-stub.mjs"))
        .href
    ),
    versionModeRuntimeStub: await import(
      pathToFileURL(path.join(tempDirectory, "version-mode-runtime-stub.mjs"))
        .href
    ),
    browserRuntimeConfigStub: await import(
      pathToFileURL(path.join(tempDirectory, "browser-runtime-config-stub.mjs"))
        .href
    ),
    dialogRuntimeConfigStub: await import(
      pathToFileURL(path.join(tempDirectory, "dialog-runtime-config-stub.mjs"))
        .href
    ),
    emojiFilterStub: await import(
      pathToFileURL(path.join(tempDirectory, "emoji-filter-stub.mjs")).href
    ),
  };

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
  const options: any = {
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
  const runtime = module.createExplorerBootstrapRuntime(options);
  return { runtime, state, options, stubs };
}
