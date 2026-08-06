import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

export async function loadStartupRuntimeFixture() {
  const sourceText = await fs.readFile(
    path.join(root, "src/app/startup/startup-runtime.ts"),
    "utf8",
  );

  const transformedSource = sourceText
    .replace('from "../../explorer-app.js";', 'from "./explorer-app-stub.mjs";')
    .replace(
      'import { createFilterControlSetup } from "../../explorer/filters/filter-controls.js";',
      'import { createFilterControlSetup } from "./filter-controls-stub.mjs";',
    )
    .replace(
      'import { observeToolbarHeight } from "../../explorer/toolbar/toolbar-layout.js";',
      'import { observeToolbarHeight } from "./toolbar-layout-stub.mjs";',
    )
    .replace(
      'from "../../explorer/pwa/pwa-panels.js";',
      'from "./pwa-panels-stub.mjs";',
    )
    .replace(
      'import { createStartupOrchestrator } from "./startup-orchestrator.js";',
      'import { createStartupOrchestrator } from "./startup-orchestrator-stub.mjs";',
    )
    .replace(
      'import * as state from "../../state.js";',
      'import * as state from "../../../src/state.js";',
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
    pathToFileURL(path.join(tempDirectory, "startup-orchestrator-stub.mjs"))
      .href
  );
  const { createStartupRuntime } =
    module as typeof import("../../../../src/app/startup/startup-runtime.js");

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
    renderDeveloperMode: "render-developer-mode",
    renderInstallAppButton: "render-install-app-button",
    renderPixelFontToggle: "render-pixel-font-toggle",
    renderSavedEmoji: "render-saved-emoji",
    renderVersionModeToggle: () => "render-version-mode-toggle",
    resolveElements: () => "resolve-elements",
    resetFilters: () => ["reset-filters"],
    savedDialog: () => "saved-dialog",
    savedPicker: () => "saved-picker",
    scheduleSearchDraw: "schedule-search-draw",
    searchText: () => "search-text",
    selectEmojiFont: "select-emoji-font",
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

  return { orchestratorStub, runtime };
}
