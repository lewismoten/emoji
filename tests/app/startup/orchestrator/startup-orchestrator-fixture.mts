import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function loadStartupOrchestratorFixture() {
  const root = process.cwd();
  const sourceText = await fs.readFile(
    path.join(root, "src/app/startup/startup-orchestrator.ts"),
    "utf8",
  );

  const transformedSource = sourceText
    .replace(
      'import { ensureImportExamples as ensureImportExampleLines } from "../../explorer/emoji/import-examples.js";',
      'import { ensureImportExamples as ensureImportExampleLines } from "./import-examples-stub.mjs";',
    )
    .replace(
      'import { upgradeEmojiDialog as upgradeEmojiDialogHelper } from "../../explorer/dialog/dialog-upgrade.js";',
      'import { upgradeEmojiDialog as upgradeEmojiDialogHelper } from "./dialog-upgrade-stub.mjs";',
    )
    .replace(
      'from "../../explorer/loading-state.js";',
      'from "./loading-state-stub.mjs";',
    )
    .replace(
      'import * as route from "../route.js";',
      'import * as route from "./route-stub.mjs";',
    )
    .replace(
      'import * as state from "../../state.js";',
      'import * as state from "../../../src/state.js";',
    )
    .replace(/options: any/g, "options");

  const tempRoot = path.join(root, "build/tests/.tmp");
  await fs.mkdir(tempRoot, { recursive: true });
  const tempDirectory = await fs.mkdtemp(
    path.join(tempRoot, "startup-orchestrator-test-"),
  );

  const writeStub = async (filename: string, lines: string[]) => {
    await fs.writeFile(
      path.join(tempDirectory, filename),
      `${lines.join("\n")}\n`,
    );
  };

  await writeStub("import-examples-stub.mjs", [
    "export const ensureImportExamples = 'ensure-import-examples';",
  ]);
  await writeStub("dialog-upgrade-stub.mjs", [
    "export const calls = [];",
    "export function upgradeEmojiDialog(options) {",
    "  calls.push(options);",
    "  return ['upgrade-emoji-dialog', options];",
    "}",
  ]);
  await writeStub("loading-state-stub.mjs", [
    "export const finishCalls = [];",
    "export const revealCalls = [];",
    "export function finishExplorerLoading(options) {",
    "  finishCalls.push(options);",
    "  return ['finish-explorer-loading', options];",
    "}",
    "export function revealExplorer(emojiList, matchCount) {",
    "  revealCalls.push([emojiList, matchCount]);",
    "  return ['reveal-explorer', emojiList, matchCount];",
    "}",
  ]);
  await writeStub("route-stub.mjs", ['export const getPanel = () => "";']);

  await fs.writeFile(
    path.join(tempDirectory, "startup-orchestrator.mjs"),
    transformedSource,
  );

  const module = await import(
    pathToFileURL(path.join(tempDirectory, "startup-orchestrator.mjs")).href
  );
  const dialogUpgradeStub = await import(
    pathToFileURL(path.join(tempDirectory, "dialog-upgrade-stub.mjs")).href
  );
  const loadingStateStub = await import(
    pathToFileURL(path.join(tempDirectory, "loading-state-stub.mjs")).href
  );
  const { createStartupOrchestrator } =
    module as typeof import("../../../../src/app/startup/startup-orchestrator.js");

  const dialogRoot: any = {
    removed: [] as string[],
    querySelector(selector: string) {
      const removable = (name: string) => ({
        remove: () => {
          dialogRoot.removed.push(name);
        },
        closest: () => ({
          remove: () => {
            dialogRoot.removed.push(`${name}:closest`);
          },
        }),
      });
      switch (selector) {
        case '[data-i18n="copiedDescription"]':
          return removable("copiedDescription");
        case ".example-link":
          return removable("example-link");
        case '.emoji-copy-actions [data-copy="emoji"]':
          return removable("copy-emoji");
        case ".emoji-code-points":
          return removable("emoji-code-points");
        case '.emoji-metadata [data-i18n="codePoints"]':
          return removable("metadata-codePoints");
        default:
          return null;
      }
    },
  };

  const translate = (key: string, fallback: string) => `${key}:${fallback}`;
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector(selector: string) {
        if (selector === ".example-dialog") return dialogRoot;
        return null;
      },
    },
  });

  const calls: Record<string, any[]> = {};
  const push = (key: string, value: any) => {
    (calls[key] ??= []).push(value);
    return value;
  };

  const orchestrator = createStartupOrchestrator({
    applyPixelArtworkClass: "apply-pixel-artwork-class",
    emojiByKey: () => ({ wave: "👋" }),
    emojiList: () => "emoji-list",
    matchCount: () => "match-count",
    dialog: () => "dialog-node",
    resolveElements: () => ({ emojiList: "emoji-list-node" }),
    assignElements: (value: unknown) => push("assignElements", value),
    assignControls: (value: unknown) => push("assignControls", value),
    initializeControls: (value: unknown) => ({ initializedWith: value }),
    createFilterControlSetup: "create-filter-control-setup",
    groupFilterDialog: () => "group-filter-dialog",
    groupPickerTrigger: () => "group-picker-trigger",
    groupSelector: () => "group-selector",
    onCompactChoiceKeyDown: "on-compact-choice-keydown",
    openFilterPicker: "open-filter-picker",
    populateVersionModeOptions: "populate-version-mode-options",
    renderDeveloperMode: "render-developer-mode",
    subGroupFilterDialog: () => "subgroup-filter-dialog",
    subGroupPickerTrigger: () => "subgroup-picker-trigger",
    subGroupSelector: () => "subgroup-selector",
    versionModeSelector: () => "version-mode-selector",
    versionRange: () => "version-range-node",
    versionSelector: () => "version-selector-node",
    assignModifierFieldsets: () => push("assignModifierFieldsets", true),
    hideModifierEmojiAccessibility: () =>
      push("hideModifierEmojiAccessibility", true),
    bindAudioInteractions: () => push("bindAudioInteractions", true),
    bindEvents: (value: unknown) => push("bindEvents", value),
    advancedFilters: () => "advanced-filters",
    advancedFiltersButton: () => "advanced-filters-button",
    applyingUrlState: "applying-url-state",
    applyBasicUrlState: "apply-basic-url-state",
    clearFiltersButton: () => "clear-filters-button",
    closePanel: "close-panel",
    copiedEmojiKeys: "copied-emoji-keys",
    developerModeToggle: () => "developer-mode-toggle",
    drawList: "draw-list",
    emojiFontChoices: () => "emoji-font-choices",
    favoriteEmojiKeys: "favorite-emoji-keys",
    genderCheckboxes: () => "gender-checkboxes",
    hairCheckboxes: () => "hair-checkboxes",
    helpDialog: () => "help-dialog",
    helpPicker: () => "help-picker",
    installApp: "install-app",
    installAppButton: () => "install-app-button",
    installDialog: () => "install-dialog",
    installedDisplayQueries: "installed-display-queries",
    languageDialog: () => "language-dialog",
    languageList: () => "language-list",
    languagePicker: () => "language-picker",
    navigateEmoji: "navigate-emoji",
    onClick: "on-click",
    onDocumentKeyDown: "on-document-key-down",
    onEmojiDialogClick: "on-emoji-dialog-click",
    onEmojiDialogClose: "on-emoji-dialog-close",
    onEmojiFocus: "on-emoji-focus",
    onHairChange: "on-hair-change",
    onEmojiKeyDown: "on-emoji-key-down",
    onGenderChange: "on-gender-change",
    onSkinToneChange: "on-skin-tone-change",
    onOrderModeChange: "on-order-mode-change",
    onPanelClose: "on-panel-close",
    onVersionRangeInput: "on-version-range-input",
    openPanel: "open-panel",
    orderButtons: () => "order-buttons",
    panelDialogs: "panel-dialogs",
    positionFavoriteButton: "position-favorite-button",
    renderInstallAppButton: "render-install-app-button",
    renderSavedEmoji: "render-saved-emoji",
    resetFilters: "reset-filters",
    savePreference: "save-preference",
    savedDialog: () => "saved-dialog",
    savedPicker: () => "saved-picker",
    scheduleSearchDraw: "schedule-search-draw",
    searchText: () => "search-text",
    selectEmojiFont: "select-emoji-font",
    showEmoji: "show-emoji",
    skinToneCheckboxes: () => "skin-tone-checkboxes",
    stepVersion: "step-version",
    suppressedPanelCloses: () => "suppressed-panel-closes",
    syncUrlState: "sync-url-state",
    syncVersionRange: "sync-version-range",
    toggleDeveloperMode: "toggle-developer-mode",
    toggleVersionMode: "toggle-version-mode",
    themeChoices: () => "theme-choices",
    translate,
    updateOnlineStatus: "update-online-status",
    urlStateReady: "url-state-ready",
    versionModeToggle: () => "version-mode-toggle",
    versionNext: () => "version-next",
    versionPrevious: () => "version-previous",
    emojiNext: () => "emoji-next",
    emojiPrevious: () => "emoji-previous",
    finalizeStartup: async (value: unknown) => push("finalizeStartup", value),
    applyDialogUrlState: "apply-dialog-url-state",
    filters: () => "filters",
    loadData: "load-data",
    loadSearchLanguages: "load-search-languages",
    loadUiTranslations: "load-ui-translations",
    observeToolbarHeight: "observe-toolbar-height",
    preferences: () => "preferences",
    renderPixelFontToggle: "render-pixel-font-toggle",
    renderVersionModeToggle: "render-version-mode-toggle",
    setUrlStateReady: "set-url-state-ready",
    toolbar: () => "toolbar",
  });

  return {
    calls,
    dialogRoot,
    dialogUpgradeStub,
    loadingStateStub,
    orchestrator,
    restore() {
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      } else {
        Reflect.deleteProperty(globalThis, "document");
      }
    },
  };
}
