import { beforeEach, describe, expect, it, vi } from "vitest";

const buildExplorerBootstrapRuntimeOptions = vi.fn((options: any) => ({
  kind: "runtime-options",
  options,
}));
const buildExplorerBootstrapRuntimeSourceOptions = vi.fn((options: any) => ({
  kind: "source-options",
  options,
}));
const createExplorerBootstrapRuntime = vi.fn(() => ({
  loadSearchLanguages: vi.fn((...args: unknown[]) => [
    "load-search-languages",
    args,
  ]),
  navigateEmoji: vi.fn((...args: unknown[]) => ["navigate-emoji", args]),
  populateVersionModeOptions: vi.fn((...args: unknown[]) => [
    "populate-version-modes",
    args,
  ]),
  renderSearchLanguages: vi.fn((...args: unknown[]) => [
    "render-search-languages",
    args,
  ]),
  renderVersionModeToggleController: vi.fn((...args: unknown[]) => [
    "render-version-toggle",
    args,
  ]),
  revealExplorer: vi.fn((...args: unknown[]) => ["reveal-explorer", args]),
  showEmoji: vi.fn((...args: unknown[]) => ["show-emoji", args]),
  toggleVersionMode: vi.fn((...args: unknown[]) => [
    "toggle-version-mode",
    args,
  ]),
  updateCompositionBackButton: vi.fn((...args: unknown[]) => [
    "update-composition-back-button",
    args,
  ]),
  updateDialogNavigation: vi.fn((...args: unknown[]) => [
    "update-dialog-navigation",
    args,
  ]),
}));
const assignExplorerBootstrapControls = vi.fn((bindings: any, values: any) => {
  Object.assign(bindings, values);
});
const assignExplorerBootstrapElements = vi.fn((bindings: any, values: any) => {
  Object.assign(bindings, values);
});
const assignExplorerBootstrapFieldsets = vi.fn((bindings: any, values: any) => {
  Object.assign(bindings, values);
});

vi.mock(
  "../../../src/app/bootstrap/explorer-bootstrap-runtime-options.js",
  () => ({ buildExplorerBootstrapRuntimeOptions }),
);
vi.mock("../../../src/app/bootstrap/explorer-bootstrap-runtime.js", () => ({
  createExplorerBootstrapRuntime,
}));
vi.mock("../../../src/app/bootstrap/explorer-bootstrap-options.js", () => ({
  buildExplorerBootstrapRuntimeSourceOptions,
}));
vi.mock("../../../src/app/bootstrap/explorer-bootstrap-bindings.js", () => ({
  assignExplorerBootstrapControls,
  assignExplorerBootstrapElements,
  assignExplorerBootstrapFieldsets,
}));

describe("initializeExplorerBootstrapSessionRuntime closures", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const state = await import("../../../src/state.js");
    state.searchLoadId.set(0);
    state.selectedSearchLocale.set("en");
  });

  it("invokes deferred binding closures that were previously uncovered", async () => {
    const { initializeExplorerBootstrapSessionRuntime } =
      await import("../../../src/app/bootstrap/explorer-bootstrap-session-runtime.js");

    const bindings: any = {
      advancedFilters: "advanced-filters",
      advancedFiltersButton: "advanced-filters-button",
      applyingUrlState: false,
      clearFiltersButton: "clear-filters",
      copyStatus: "copy-status",
      developerModeToggle: "developer-mode-toggle",
      drawList: vi.fn(),
      emojiFontChoices: ["pixel"],
      emojiList: "emoji-list",
      genderCheckboxes: [],
      focusInitialEmojiDialogAction: vi.fn(),
      groupFilterDialog: "group-filter-dialog",
      groupPickerTrigger: "group-picker-trigger",
      groupSelector: "group-selector",
      hairCheckboxes: [],
      helpDialog: "help-dialog",
      helpPicker: "help-picker",
      installAppButton: "install-button",
      installDialog: "install-dialog",
      languageDialog: "language-dialog",
      languageList: "language-list",
      languagePicker: "language-picker",
      languagePickerFlag: "language-flag",
      languagePickerLabel: "language-label",
      loadSearchLanguages: vi.fn(() => ["binding-load-search-languages"]),
      matchCount: "match-count",
      modeChoices: ["standard", "advanced", "developer"],
      navigateEmoji: vi.fn(),
      orderButtons: [],
      pixelEditor: "pixel-editor",
      pixelEditorPromise: "pixel-editor-promise",
      populateVersionModeOptions: vi.fn(),
      renderSearchLanguages: vi.fn(() => ["binding-render-search-languages"]),
      renderVersionModeToggle: vi.fn(() => ["binding-render-version-toggle"]),
      resetFilters: vi.fn(() => ["resetFilters", []]),
      savedDialog: "saved-dialog",
      savedPicker: "saved-picker",
      searchText: "search-text",
      setEmojiDialogView: vi.fn(),
      showEmoji: vi.fn(),
      skinToneCheckboxes: [],
      subGroupFilterDialog: "subgroup-filter-dialog",
      subGroupPickerTrigger: "subgroup-picker-trigger",
      subGroupSelector: "subgroup-selector",
      suppressedPanelCloses: new WeakSet(),
      syncUrlState: vi.fn(),
      themeChoices: ["dark"],
      toolbar: "toolbar",
      updateCompositionBackButton: vi.fn(),
      updateDialogNavigation: vi.fn(),
      urlStateReady: false,
      versionModeSelector: { disabled: false, value: "through" },
      versionModeToggle: "version-mode-toggle",
      versionNext: "version-next",
      versionPrevious: "version-previous",
      versionRange: "version-range",
      versionSelector: { value: "17.0" },
    };

    initializeExplorerBootstrapSessionRuntime({
      bindings,
      controllers: {
        applyBasicUrlState: vi.fn(),
        applyDialogUrlState: vi.fn(),
        displayGroupName: vi.fn(),
        loadData: vi.fn(),
        onCompactChoiceKeyDown: vi.fn(),
        onDocumentKeyDown: vi.fn(),
        onEmojiDialogClick: vi.fn(),
        onEmojiFocus: vi.fn(),
        onHairChange: vi.fn(),
        onEmojiKeyDown: vi.fn(),
        onGenderChange: vi.fn(),
        onSkinToneChange: vi.fn(),
        onOrderModeChange: vi.fn(),
        onVersionRangeInput: vi.fn(),
        openFilterPicker: vi.fn(),
        refreshLocalizedLabels: vi.fn(),
        renderCategoryFilters: vi.fn(() => ["renderCategoryFilters", ["b"]]),
        scheduleSearchDraw: vi.fn(),
        stepVersion: vi.fn(),
        syncVersionRange: vi.fn(() => ["syncVersionRange", ["through"]]),
      },
      panelDialogs: vi.fn(),
      restoreDeveloperMode: vi.fn(),
      shell: {
        applyPixelArtworkClass: vi.fn(),
        applyStandalonePixelArtwork: vi.fn(),
        bindAudioInteractions: vi.fn(),
        developerModeEnabled: vi.fn(),
        fullDeveloperModeEnabled: vi.fn(),
        getIntroducedVersion: vi.fn(),
        installApp: vi.fn(),
        loadUiTranslations: vi.fn(),
        onClick: vi.fn(),
        onEmojiDialogClose: vi.fn(),
        renderDeveloperMode: vi.fn(),
        renderInstallAppButton: vi.fn(),
        renderPixelFontToggle: vi.fn(),
        renderSavedEmoji: vi.fn(),
        selectEmojiFont: vi.fn(),
        toggleDeveloperMode: vi.fn(),
        updateEmojiComposition: vi.fn(),
        updateFavoriteButton: vi.fn(),
        updateModifierPixelArtwork: vi.fn(),
        updateOnlineStatus: vi.fn(),
        updatePixelArtworkManifest: vi.fn(),
        updateRenderingDiagnostic: vi.fn(),
      },
      translate: vi.fn(),
    });

    const runtimeSourceCall =
      buildExplorerBootstrapRuntimeSourceOptions.mock.calls[0]![0];

    expect(runtimeSourceCall.modeChoices()).toEqual([
      "standard",
      "advanced",
      "developer",
    ]);
    expect(runtimeSourceCall.renderSearchLanguages()).toEqual([
      "render-search-languages",
      [],
    ]);

    runtimeSourceCall.setControls({ clearFiltersButton: "next-clear-filters" });
    expect(assignExplorerBootstrapControls).toHaveBeenCalledWith(bindings, {
      clearFiltersButton: "next-clear-filters",
    });
    runtimeSourceCall.setElements({ emojiList: "next-emoji-list" });
    expect(assignExplorerBootstrapElements).toHaveBeenCalledWith(bindings, {
      emojiList: "next-emoji-list",
    });
    runtimeSourceCall.setFieldsets({
      advancedFilters: "next-advanced-filters",
    });
    expect(assignExplorerBootstrapFieldsets).toHaveBeenCalledWith(bindings, {
      advancedFilters: "next-advanced-filters",
    });

    const firstToggle = vi.fn(() => ["first-toggle"]);
    const secondToggle = vi.fn((value?: unknown) => ["second-toggle", value]);
    bindings.toggleVersionMode = firstToggle;
    expect(runtimeSourceCall.toggleVersionMode()).toEqual(["first-toggle"]);
    bindings.toggleVersionMode = secondToggle;
    expect(runtimeSourceCall.toggleVersionMode("selected")).toEqual([
      "second-toggle",
      "selected",
    ]);
    expect(firstToggle).toHaveBeenCalledTimes(1);
    expect(secondToggle).toHaveBeenCalledTimes(1);
  });
});
