import { beforeEach, describe, expect, it, vi } from "vitest";

const createExplorerState = vi.fn();
const createUiFormatters = vi.fn();
const createExplorerBootstrapBindings = vi.fn();
const buildExplorerBootstrapShellOptions = vi.fn((options: any) => ({
  kind: "shell-options",
  options,
}));
const buildExplorerBootstrapControllerOptions = vi.fn((options: any) => ({
  kind: "controller-options",
  options,
}));
const createExplorerBootstrapShell = vi.fn();
const createExplorerBootstrapControllers = vi.fn();
const initializeExplorerBootstrapSessionRuntime = vi.fn();
const initializeExplorerPreferences = vi.fn();
const createExplorerApp = vi.fn();
const parseExplorerModeParam = vi.fn();
const translate = vi.fn((key: string, fallback: string) =>
  key === "group.label" ? "Translated Group" : fallback,
);
const openPanelDialog = vi.fn((...args: unknown[]) => ["open-panel-dialog", args]);
const assignExplorerBootstrapElements = vi.fn((bindings: any, values: any) => {
  Object.assign(bindings, values);
});
const renderThemeToggle = vi.fn();
const getExplorerSubGroup = vi.fn((...args: unknown[]) => ["subgroup", args]);

vi.mock("../../../../src/explorer/explorer-labels.js", () => ({
  explorerLabelKeys: { group: "group.label" },
  sequenceTranslationKeys: { zwj: "joiner" },
  sequenceTypeEmoji: { zwj: "🪢" },
  sequenceTypeLabels: { zwj: "ZWJ" },
  sequenceTypeOrder: ["zwj"],
  unicodeGroupLabelKeys: { Objects: "objects.label" },
  unicodeSubgroupLabelKeys: { mail: "mail.label" },
}));
vi.mock("../../../../src/app/route.js", () => ({
  getSearch: vi.fn(() => "?mode=developer"),
}));
vi.mock("../../../../src/explorer/category/category-rules.js", () => ({
  getExplorerSubGroup,
}));
vi.mock("../../../../src/explorer/emoji/emoji-format.js", () => ({
  formatUiNumber: vi.fn((...args: unknown[]) => ["ui-number-format", args]),
  formatUiPercent: vi.fn((...args: unknown[]) => ["ui-percent-format", args]),
  normalizeCodePoints: vi.fn((...args: unknown[]) => ["normalize", args]),
}));
vi.mock("../../../../src/explorer/saved-emoji.js", () => ({
  animateCopyConfirmation: vi.fn((...args: unknown[]) => ["animate-copy", args]),
}));
vi.mock("../../../../src/explorer/pwa/pwa-panels.js", () => ({
  openPanelDialog,
}));
vi.mock("../../../../src/explorer-app.js", () => ({
  createExplorerApp,
}));
vi.mock("../../../../src/explorer/navigation/url-state.js", () => ({
  parseExplorerModeParam,
}));
vi.mock("../../../../src/explorer-state.js", () => ({
  createExplorerState,
}));
vi.mock("../../../../src/app/browser/browser-runtime.js", () => ({
  createUiFormatters,
}));
vi.mock("../../../../src/app/bootstrap/explorer-bootstrap-bindings.js", () => ({
  assignExplorerBootstrapElements,
  createExplorerBootstrapBindings,
}));
vi.mock("../../../../src/app/bootstrap/explorer-bootstrap-options.js", () => ({
  buildExplorerBootstrapControllerOptions,
  buildExplorerBootstrapShellOptions,
}));
vi.mock(
  "../../../../src/app/bootstrap/explorer-bootstrap-controllers.js",
  () => ({
    createExplorerBootstrapControllers,
  }),
);
vi.mock(
  "../../../../src/app/bootstrap/explorer-bootstrap-session-runtime.js",
  () => ({
    initializeExplorerBootstrapSessionRuntime,
  }),
);
vi.mock("../../../../src/app/bootstrap/explorer-bootstrap-shell.js", () => ({
  createExplorerBootstrapShell,
}));
vi.mock("../../../../src/app/explorer-preferences.js", () => ({
  initializeExplorerPreferences,
}));
vi.mock("../../../../src/utils/i18n.js", () => ({
  translate,
}));
vi.mock("../../../../src/render-theme-toggle.js", () => ({
  renderThemeToggle,
}));

describe("explorer bootstrap session entry", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    Object.assign(globalThis, {
      document: { body: { dataset: {} } },
      window: { location: { search: "?mode=developer" } },
    });

    const state = {
      selectedSearchLocale: "en",
      developerModeFromUrl: false,
      explorerModeFromUrl: "",
    };
    const bindings: any = {
      applyingUrlState: false,
      copyStatus: "copy-status",
      developerModeToggle: "developer-mode-toggle",
      modeChoices: ["basic", "developer"],
      advancedFilters: "advanced-filters",
      savedDialog: "saved-dialog",
      helpDialog: "help-dialog",
      languageDialog: "language-dialog",
      emojiFontChoices: ["system", "pixel"],
      genderCheckboxes: ["neutral"],
      hairCheckboxes: ["red"],
      installAppButton: "install-app-button",
      installDialog: "install-dialog",
      offlineStatus: "offline-status",
      orderButtons: ["unicode"],
      skinToneCheckboxes: ["1F3FB"],
      themeChoices: ["dark", "retro"],
      urlStateReady: true,
      versionModeSelector: "version-mode-selector",
      versionSelector: "version-selector",
      activeFilterSummary: "active-filter-summary",
      activeFilterText: "active-filter-text",
      compactGroupChoices: ["group-choice"],
      compactGroupLabel: "group-label",
      compactSequenceChoices: ["sequence-choice"],
      compactSequenceLabel: "sequence-label",
      compactSubGroupChoices: ["subgroup-choice"],
      compactSubGroupLabel: "subgroup-label",
      emojiList: "emoji-list",
      genderFieldset: "gender-fieldset",
      groupFilterDialog: "group-filter-dialog",
      groupPickerTrigger: "group-picker-trigger",
      groupSelector: "group-selector",
      hairFieldset: "hair-fieldset",
      languageList: "language-list",
      matchCount: "match-count",
      modifierFilters: "modifier-filters",
      listRenderGeneration: 4,
      searchText: "search-text",
      sequenceTypeSelector: "sequence-type-selector",
      skinToneFieldset: "skin-tone-fieldset",
      subGroupFilterDialog: "subgroup-filter-dialog",
      subGroupPickerTrigger: "subgroup-picker-trigger",
      subGroupSelector: "subgroup-selector",
      suppressDialogCloseSync: false,
      suppressedPanelCloses: new WeakSet(),
      versionNext: "version-next",
      versionPrevious: "version-previous",
      versionRange: "version-range",
      versionRangeValue: "15.1",
      drawList: vi.fn((...args: unknown[]) => ["drawList", args]),
      loadVersionData: vi.fn((...args: unknown[]) => ["loadVersionData", args]),
      renderCategoryFilters: vi.fn((...args: unknown[]) => [
        "renderCategoryFilters",
        args,
      ]),
      renderSearchLanguages: vi.fn((...args: unknown[]) => [
        "renderSearchLanguages",
        args,
      ]),
      renderVersionModeToggle: vi.fn((...args: unknown[]) => [
        "renderVersionModeToggle",
        args,
      ]),
      resetFilters: vi.fn((...args: unknown[]) => ["resetFilters", args]),
      revealExplorer: vi.fn((...args: unknown[]) => ["revealExplorer", args]),
      setEmojiDialogView: vi.fn((...args: unknown[]) => [
        "setEmojiDialogView",
        args,
      ]),
      showEmoji: vi.fn((...args: unknown[]) => ["showEmoji", args]),
      syncUrlState: vi.fn((...args: unknown[]) => ["syncUrlState", args]),
      syncVersionRange: vi.fn((...args: unknown[]) => [
        "syncVersionRange",
        args,
      ]),
      updateCompositionBackButton: vi.fn((...args: unknown[]) => [
        "updateCompositionBackButton",
        args,
      ]),
      updateDialogNavigation: vi.fn((...args: unknown[]) => [
        "updateDialogNavigation",
        args,
      ]),
      focusInitialEmojiDialogAction: vi.fn((...args: unknown[]) => [
        "focusInitialEmojiDialogAction",
        args,
      ]),
    };
    const shell = {
      applyPixelArtworkClass: "apply-pixel-artwork-class",
      copyToClipboardValue: "copy-to-clipboard-value",
      developerModeEnabled: "developer-mode-enabled",
      fullDeveloperModeEnabled: "full-developer-mode-enabled",
      getIntroducedVersion: "get-introduced-version",
      loadPackageManifest: "load-package-manifest",
      onClick: "on-click",
      recordCopiedEmoji: "record-copied-emoji",
      rebuildEmojiCodePointLookup: "rebuild-emoji-codepoint-lookup",
      renderDeveloperMode: vi.fn((...args: unknown[]) => [
        "render-developer-mode",
        args,
      ]),
      renderPixelFontToggle: vi.fn((...args: unknown[]) => [
        "render-pixel-font-toggle",
        args,
      ]),
      renderSavedEmoji: "render-saved-emoji",
      toggleFavorite: "toggle-favorite",
      updateEmojiComposition: "update-emoji-composition",
      updateEmojiImportExamples: "update-emoji-import-examples",
      updateModifierPixelArtwork: "update-modifier-pixel-artwork",
      updatePixelArtworkManifest: "update-pixel-artwork-manifest",
    };
    const controllers = {
      drawList: vi.fn((...args: unknown[]) => ["controller-drawList", args]),
      loadVersionData: vi.fn((...args: unknown[]) => [
        "controller-loadVersionData",
        args,
      ]),
      resetFilters: vi.fn((...args: unknown[]) => ["controller-resetFilters", args]),
      syncUrlState: vi.fn((...args: unknown[]) => ["controller-syncUrlState", args]),
      focusInitialAction: vi.fn((...args: unknown[]) => [
        "controller-focusInitialAction",
        args,
      ]),
      setView: vi.fn((...args: unknown[]) => ["controller-setView", args]),
    };
    const runtime = {
      onLoad: "runtime-onload",
      removeLegacyDialogElements: vi.fn(),
    };
    const app = {
      startWhenReady: vi.fn(),
    };

    createExplorerState.mockReturnValue(state);
    createUiFormatters.mockReturnValue({
      formatUiNumber: vi.fn((...args: unknown[]) => ["ui-number", args]),
      formatUiPercent: vi.fn((...args: unknown[]) => ["ui-percent", args]),
    });
    createExplorerBootstrapBindings.mockReturnValue(bindings);
    createExplorerBootstrapShell.mockReturnValue(shell);
    createExplorerBootstrapControllers.mockReturnValue(controllers);
    initializeExplorerBootstrapSessionRuntime.mockReturnValue(runtime);
    createExplorerApp.mockReturnValue(app);
    parseExplorerModeParam.mockReturnValue("developer");
  });

  it("wires shell, controllers, runtime, and startup side effects through builders", async () => {
    await import(
      "../../../../src/app/bootstrap/explorer-bootstrap-session.js"
    );

    expect(createExplorerState).toHaveBeenCalledTimes(1);
    expect(initializeExplorerPreferences).toHaveBeenCalledTimes(1);
    expect(initializeExplorerPreferences).toHaveBeenCalledWith(
      createExplorerState.mock.results[0]!.value,
    );

    expect(createUiFormatters).toHaveBeenCalledTimes(1);
    expect(createExplorerBootstrapBindings).toHaveBeenCalledTimes(1);
    expect(createExplorerBootstrapShell).toHaveBeenCalledTimes(1);
    expect(createExplorerBootstrapControllers).toHaveBeenCalledTimes(1);
    const formatterOptions = createUiFormatters.mock.calls[0]![0];
    expect(formatterOptions.document).toBe(globalThis.document);
    expect(formatterOptions.selectedSearchLocale()).toBe("en");

    const shellBuilderOptions =
      buildExplorerBootstrapShellOptions.mock.calls[0]![0];
    expect(shellBuilderOptions.translate("group.label", "fallback")).toBe(
      "Translated Group",
    );
    expect(shellBuilderOptions.translate("missing", "fallback")).toBe(
      "fallback",
    );
    expect(shellBuilderOptions.drawList("emoji")).toEqual([
      "controller-drawList",
      [],
    ]);
    expect(shellBuilderOptions.normalizeCodePoints("1F44D")).toEqual([
      "normalize",
      ["1F44D"],
    ]);

    const controllerBuilderOptions =
      buildExplorerBootstrapControllerOptions.mock.calls[0]![0];
    expect(controllerBuilderOptions.unassigned).toBe("\u0000");
    expect(controllerBuilderOptions.getExplorerSubGroup("mail")[0]).toBe(
      "subgroup",
    );
    expect(controllerBuilderOptions.formatNumber("5")).toEqual([
      "ui-number",
      ["5"],
    ]);
    expect(controllerBuilderOptions.displayExplorerLabel("group")).toBe(
      "Translated Group",
    );
    expect(controllerBuilderOptions.openPanel("help")).toEqual([
      "open-panel-dialog",
      ["help"],
    ]);

    expect(initializeExplorerBootstrapSessionRuntime).toHaveBeenCalledTimes(1);
    const runtimeOptions =
      initializeExplorerBootstrapSessionRuntime.mock.calls[0]![0];
    const bindings = createExplorerBootstrapBindings.mock.results[0]!.value;
    const shell = createExplorerBootstrapShell.mock.results[0]!.value;
    const state = createExplorerState.mock.results[0]!.value;

    expect(runtimeOptions.bindings.drawList("emoji")).toEqual([
      "controller-drawList",
      ["emoji"],
    ]);
    expect(runtimeOptions.bindings.loadVersionData("v")).toEqual([
      "controller-loadVersionData",
      ["v"],
    ]);
    expect(runtimeOptions.bindings.resetFilters()).toEqual([
      "controller-resetFilters",
      [],
    ]);
    expect(runtimeOptions.bindings.syncUrlState("replace")).toEqual([
      "controller-syncUrlState",
      ["replace"],
    ]);
    expect(runtimeOptions.bindings.focusInitialEmojiDialogAction()).toEqual([
      "controller-focusInitialAction",
      [],
    ]);
    expect(runtimeOptions.bindings.setEmojiDialogView("code")).toEqual([
      "controller-setView",
      ["code"],
    ]);
    expect(runtimeOptions.controllers.drawList()).toEqual([
      "controller-drawList",
      [],
    ]);
    expect(bindings.bootstrapRuntime).toBe(
      initializeExplorerBootstrapSessionRuntime.mock.results[0]!.value,
    );

    runtimeOptions.restoreDeveloperMode();
    expect(parseExplorerModeParam).toHaveBeenCalledWith("?mode=developer");
    expect(state.developerModeFromUrl).toBe(true);
    expect(state.explorerModeFromUrl).toBe("developer");
    expect(shell.renderDeveloperMode).toHaveBeenCalledTimes(1);

    expect(initializeExplorerBootstrapSessionRuntime.mock.calls[0]![0].shell).toBe(
      shell,
    );
    expect(runtimeOptions.translate("group.label", "fallback")).toBe(
      "Translated Group",
    );
    expect(runtimeOptions.state()).toBe(state);
    expect(runtimeOptions.panelDialogs()).toEqual({
      filters: "advanced-filters",
      favorites: "saved-dialog",
      help: "help-dialog",
      language: "language-dialog",
    });

    expect(initializeExplorerBootstrapSessionRuntime.mock.results[0]!.value.removeLegacyDialogElements).toHaveBeenCalledTimes(
      1,
    );
    expect(createExplorerApp).toHaveBeenCalledTimes(1);
    const appOptions = createExplorerApp.mock.calls[0]![0];
    expect(appOptions.window).toBe(globalThis.window);
    expect(appOptions.start).toBe("runtime-onload");
    expect(createExplorerApp.mock.results[0]!.value.startWhenReady).toHaveBeenCalledTimes(
      1,
    );
  });
});
