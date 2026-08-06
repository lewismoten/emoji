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
  populateVersionModeOptions: vi.fn((...args: unknown[]) => [
    "populate-version-modes",
    args,
  ]),
  renderVersionModeToggleController: vi.fn((...args: unknown[]) => [
    "render-version-toggle",
    args,
  ]),
  toggleVersionMode: vi.fn((...args: unknown[]) => ["toggle-version-mode", args]),
  loadSearchLanguages: vi.fn((...args: unknown[]) => [
    "load-search-languages",
    args,
  ]),
  renderSearchLanguages: vi.fn((...args: unknown[]) => [
    "render-search-languages",
    args,
  ]),
  showEmoji: vi.fn((...args: unknown[]) => ["show-emoji", args]),
  navigateEmoji: vi.fn((...args: unknown[]) => ["navigate-emoji", args]),
  updateDialogNavigation: vi.fn((...args: unknown[]) => [
    "update-dialog-navigation",
    args,
  ]),
  updateCompositionBackButton: vi.fn((...args: unknown[]) => [
    "update-composition-back-button",
    args,
  ]),
  revealExplorer: vi.fn((...args: unknown[]) => ["reveal-explorer", args]),
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
  () => ({
    buildExplorerBootstrapRuntimeOptions,
  }),
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

const createSelectLike = (value = "") => ({
  appendChild() {},
  disabled: false,
  options: [] as Array<{ value: string }>,
  replaceChildren() {},
  value,
});

describe("initializeExplorerBootstrapSessionRuntime", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const state = await import("../../../src/state.js");
    state.searchLoadId.set(3);
    state.selectedSearchLocale.set("en");
  });

  it("builds session runtime wiring from bindings, controllers, shell, and state", async () => {
    const { initializeExplorerBootstrapSessionRuntime } = await import(
      "../../../src/app/bootstrap/explorer-bootstrap-session-runtime.js"
    );
    const state = await import("../../../src/state.js");

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
      fullDeveloperModeEnabled: "full-developer-mode-enabled",
      getIntroducedVersion: "get-introduced-version",
      installApp: "install-app",
      loadUiTranslations: "load-ui-translations",
      onClick: "on-click",
      onEmojiDialogClose: "on-emoji-dialog-close",
      renderDeveloperMode: "render-developer-mode",
      renderInstallAppButton: "render-install-app-button",
      renderPixelFontToggle: "render-pixel-font-toggle",
      renderSavedEmoji: "render-saved-emoji",
      selectEmojiFont: "select-emoji-font",
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
      shell,
      state: () => ({ searchLoadId: 3, selectedSearchLocale: "en" }),
      translate: "translate",
    });

    expect(result).toBe(bindings.bootstrapRuntime);
    expect(result).toBe(createExplorerBootstrapRuntime.mock.results[0]!.value);
    expect(bindings.populateVersionModeOptions).toBe(
      result.populateVersionModeOptions,
    );
    expect(bindings.renderVersionModeToggle).toBe(
      result.renderVersionModeToggleController,
    );
    expect(bindings.toggleVersionMode).toBe(result.toggleVersionMode);
    expect(bindings.loadSearchLanguages).toBe(result.loadSearchLanguages);
    expect(bindings.renderSearchLanguages).toBe(result.renderSearchLanguages);
    expect(bindings.showEmoji).toBe(result.showEmoji);
    expect(bindings.navigateEmoji).toBe(result.navigateEmoji);
    expect(bindings.updateDialogNavigation).toBe(result.updateDialogNavigation);
    expect(bindings.updateCompositionBackButton).toBe(
      result.updateCompositionBackButton,
    );
    expect(bindings.revealExplorer).toBe(result.revealExplorer);

    expect(buildExplorerBootstrapRuntimeSourceOptions).toHaveBeenCalledTimes(1);
    expect(buildExplorerBootstrapRuntimeOptions).toHaveBeenCalledTimes(1);
    expect(createExplorerBootstrapRuntime).toHaveBeenCalledTimes(1);
    expect(assignExplorerBootstrapControls).not.toHaveBeenCalled();
    expect(assignExplorerBootstrapElements).not.toHaveBeenCalled();
    expect(assignExplorerBootstrapFieldsets).not.toHaveBeenCalled();

    const runtimeSourceCall =
      buildExplorerBootstrapRuntimeSourceOptions.mock.calls[0]![0];
    expect(runtimeSourceCall.applyBasicUrlState).toBe("apply-basic");
    expect(runtimeSourceCall.applyDialogUrlState).toBe("apply-dialog");
    expect(runtimeSourceCall.applyPixelArtworkClass).toBe("apply-pixel");
    expect(runtimeSourceCall.applyStandalonePixelArtwork).toBe(
      "apply-standalone-pixel",
    );
    expect(runtimeSourceCall.bindAudioInteractions).toBe("bind-audio");
    expect(runtimeSourceCall.developerModeEnabled).toBe(
      "developer-mode-enabled",
    );
    expect(runtimeSourceCall.fullDeveloperModeEnabled).toBe(
      "full-developer-mode-enabled",
    );
    expect(runtimeSourceCall.displayGroupName).toBe("display-group");
    expect(runtimeSourceCall.getIntroducedVersion).toBe(
      "get-introduced-version",
    );
    expect(runtimeSourceCall.installApp).toBe("install-app");
    expect(runtimeSourceCall.loadData).toBe("load-data");
    expect(runtimeSourceCall.loadUiTranslations).toBe("load-ui-translations");
    expect(runtimeSourceCall.onClick).toBe("on-click");
    expect(runtimeSourceCall.onCompactChoiceKeyDown).toBe("compact-keydown");
    expect(runtimeSourceCall.onDocumentKeyDown).toBe("document-keydown");
    expect(runtimeSourceCall.onEmojiDialogClick).toBe("dialog-click");
    expect(runtimeSourceCall.onEmojiDialogClose).toBe(
      "on-emoji-dialog-close",
    );
    expect(runtimeSourceCall.onEmojiFocus).toBe("emoji-focus");
    expect(runtimeSourceCall.onHairChange).toBe("hair-change");
    expect(runtimeSourceCall.onEmojiKeyDown).toBe("emoji-keydown");
    expect(runtimeSourceCall.onGenderChange).toBe("gender-change");
    expect(runtimeSourceCall.onSkinToneChange).toBe("skin-change");
    expect(runtimeSourceCall.onOrderModeChange).toBe("order-change");
    expect(runtimeSourceCall.onVersionRangeInput).toBe("version-range-input");
    expect(runtimeSourceCall.openFilterPicker).toBe("open-filter-picker");
    expect(runtimeSourceCall.panelDialogs).toBe("panel-dialogs");
    expect(runtimeSourceCall.refreshLocalizedLabels).toBe(
      "refresh-localized-labels",
    );
    expect(runtimeSourceCall.renderDeveloperMode).toBe("render-developer-mode");
    expect(runtimeSourceCall.renderInstallAppButton).toBe(
      "render-install-app-button",
    );
    expect(runtimeSourceCall.renderPixelFontToggle).toBe(
      "render-pixel-font-toggle",
    );
    expect(runtimeSourceCall.renderSavedEmoji).toBe("render-saved-emoji");
    expect(runtimeSourceCall.restoreDeveloperMode).toBe(
      "restore-developer-mode",
    );
    expect(runtimeSourceCall.scheduleSearchDraw).toBe("schedule-search-draw");
    expect(runtimeSourceCall.selectEmojiFont).toBe("select-emoji-font");
    expect(runtimeSourceCall.stepVersion).toBe("step-version");
    expect(runtimeSourceCall.toggleDeveloperMode).toBe(
      "toggle-developer-mode",
    );
    expect(runtimeSourceCall.translate).toBe("translate");
    expect(runtimeSourceCall.updateEmojiComposition).toBe(
      "update-emoji-composition",
    );
    expect(runtimeSourceCall.updateFavoriteButton).toBe(
      "update-favorite-button",
    );
    expect(runtimeSourceCall.updateModifierArtwork).toBe(
      "update-modifier-pixel-artwork",
    );
    expect(runtimeSourceCall.updateOnlineStatus).toBe("update-online-status");
    expect(runtimeSourceCall.updatePixelArtworkManifest).toBe(
      "update-pixel-artwork-manifest",
    );
    expect(runtimeSourceCall.updateRenderingDiagnostic).toBe(
      "update-rendering-diagnostic",
    );
    expect(runtimeSourceCall.advancedFilters()).toBe("advanced-filters");
    expect(runtimeSourceCall.advancedFiltersButton()).toBe(
      "advanced-filters-button",
    );
    expect(runtimeSourceCall.applyingUrlState()).toBe(false);
    expect(runtimeSourceCall.clearFiltersButton()).toBe("clear-filters");
    expect(runtimeSourceCall.copyStatus()).toBe("copy-status");
    expect(runtimeSourceCall.developerModeToggle()).toBe(
      "developer-mode-toggle",
    );
    expect(runtimeSourceCall.drawList("hello")).toEqual(["drawList", ["hello"]]);
    expect(runtimeSourceCall.emojiFontChoices()).toEqual(["pixel", "system"]);
    expect(runtimeSourceCall.emojiList()).toBe("emoji-list");
    expect(runtimeSourceCall.genderCheckboxes()).toEqual(["neutral"]);
    expect(runtimeSourceCall.focusInitialEmojiDialogAction()).toEqual([
      "focus",
      [],
    ]);
    expect(runtimeSourceCall.getPixelEditor()).toBe("pixel-editor");
    expect(runtimeSourceCall.getPixelEditorPromise()).toBe(
      "pixel-editor-promise",
    );
    expect(runtimeSourceCall.groupFilterDialog()).toBe("group-filter-dialog");
    expect(runtimeSourceCall.groupPickerTrigger()).toBe(
      "group-picker-trigger",
    );
    expect(runtimeSourceCall.groupSelector()).toBe("group-selector");
    expect(runtimeSourceCall.hairCheckboxes()).toEqual(["bald"]);
    expect(runtimeSourceCall.helpDialog()).toBe("help-dialog");
    expect(runtimeSourceCall.helpPicker()).toBe("help-picker");
    expect(runtimeSourceCall.installAppButton()).toBe("install-button");
    expect(runtimeSourceCall.installDialog()).toBe("install-dialog");
    expect(runtimeSourceCall.languageDialog()).toBe("language-dialog");
    expect(runtimeSourceCall.languageList()).toBe("language-list");
    expect(runtimeSourceCall.languagePicker()).toBe("language-picker");
    expect(runtimeSourceCall.languagePickerFlag()).toBe("language-flag");
    expect(runtimeSourceCall.languagePickerLabel()).toBe("language-label");
    expect(runtimeSourceCall.loadSearchLanguages()).toEqual([
      "load-search-languages",
      [],
    ]);
    expect(runtimeSourceCall.matchCount()).toBe("match-count");
    expect(runtimeSourceCall.navigateEmoji(2)).toEqual(["navigate-emoji", [2]]);
    expect(runtimeSourceCall.nextSearchLoadId()).toBe(4);
    expect(state.searchLoadId.get()).toBe(4);
    expect(runtimeSourceCall.orderButtons()).toBe("order-buttons");
    expect(runtimeSourceCall.savedDialog()).toBe("saved-dialog");
    expect(runtimeSourceCall.savedPicker()).toBe("saved-picker");
    expect(runtimeSourceCall.searchText()).toBe("search-text");
    expect(runtimeSourceCall.populateVersionModeOptions("a")).toEqual([
      "populate",
      ["a"],
    ]);
    expect(runtimeSourceCall.renderCategoryFilters("b")).toEqual([
      "renderCategoryFilters",
      ["b"],
    ]);
    expect(runtimeSourceCall.renderVersionModeToggle()).toEqual([
      "render-version-toggle",
      [],
    ]);
    expect(runtimeSourceCall.resetFilters()).toEqual(["resetFilters", []]);
    runtimeSourceCall.setApplyingUrlState(true);
    expect(bindings.applyingUrlState).toBe(true);
    runtimeSourceCall.setPixelEditor("next-editor");
    expect(bindings.pixelEditor).toBe("next-editor");
    runtimeSourceCall.setPixelEditorPromise("next-promise");
    expect(bindings.pixelEditorPromise).toBe("next-promise");
    runtimeSourceCall.setSearchLanguage("ar");
    expect(state.selectedSearchLocale.get()).toBe("ar");
    runtimeSourceCall.setSuppressDialogCloseSync(true);
    expect(bindings.suppressDialogCloseSync).toBe(true);
    runtimeSourceCall.setUrlStateReady(false);
    expect(bindings.urlStateReady).toBe(false);
    expect(runtimeSourceCall.showEmoji("x")).toEqual(["showEmoji", ["x"]]);
    expect(runtimeSourceCall.skinToneCheckboxes()).toEqual(["1F3FB"]);
    expect(runtimeSourceCall.subGroupFilterDialog()).toBe(
      "subgroup-filter-dialog",
    );
    expect(runtimeSourceCall.subGroupPickerTrigger()).toBe(
      "subgroup-picker-trigger",
    );
    expect(runtimeSourceCall.subGroupSelector()).toBe("subgroup-selector");
    expect(runtimeSourceCall.suppressedPanelCloses()).toBe(
      bindings.suppressedPanelCloses,
    );
    expect(runtimeSourceCall.syncUrlState("replace")).toEqual([
      "syncUrlState",
      ["replace"],
    ]);
    expect(runtimeSourceCall.syncVersionRange("through")).toEqual([
      "syncVersionRange",
      ["through"],
    ]);
    expect(runtimeSourceCall.themeChoices()).toEqual(["dark", "retro"]);
    expect(runtimeSourceCall.toolbar()).toBe("toolbar");
    expect(runtimeSourceCall.updateCompositionBackButton("up")).toEqual([
      "updateComposition",
      ["up"],
    ]);
    expect(runtimeSourceCall.updateDialogNavigation("nav")).toEqual([
      "updateDialog",
      ["nav"],
    ]);
    expect(runtimeSourceCall.urlStateReady()).toBe(false);
    expect(runtimeSourceCall.versionModeSelector()).toEqual({
      disabled: false,
      value: "through",
    });
    expect(runtimeSourceCall.versionModeToggle()).toBe("version-mode-toggle");
    expect(runtimeSourceCall.versionNext()).toBe("version-next");
    expect(runtimeSourceCall.versionPrevious()).toBe("version-previous");
    expect(runtimeSourceCall.versionRange()).toBe("version-range");
    expect(runtimeSourceCall.versionSelector().value).toBe("17.0");

    expect(buildExplorerBootstrapRuntimeOptions.mock.calls[0]![0]).toEqual({
      kind: "source-options",
      options: runtimeSourceCall,
    });
    expect(createExplorerBootstrapRuntime.mock.calls[0]![0]).toEqual({
      kind: "runtime-options",
      options: buildExplorerBootstrapRuntimeOptions.mock.calls[0]![0],
    });
  });
});
