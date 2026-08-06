import { beforeEach, describe, expect, it, vi } from "vitest";

const createExplorerRuntime = vi.fn(() => ({
  get: vi.fn((id: string) => ["runtime-get", id]),
  resolveElements: vi.fn(() => ["resolve-elements"]),
}));
const createUiBindingRuntime = vi.fn(() => ({
  assignControls: vi.fn((...args: unknown[]) => ["assign-controls", args]),
  assignElements: vi.fn((...args: unknown[]) => ["assign-elements", args]),
  assignModifierFieldsets: vi.fn((...args: unknown[]) => [
    "assign-fieldsets",
    args,
  ]),
  hideModifierEmojiAccessibility: vi.fn(() => ["hide-modifier-a11y"]),
}));
const createStartupRuntime = vi.fn(() => ({
  finishExplorerLoading: "finish-explorer-loading",
  onLoad: "on-load",
  removeLegacyDialogElements: "remove-legacy-dialog-elements",
  revealExplorer: "reveal-explorer",
}));
const createPixelEditorRuntime = vi.fn(() => ({
  ensurePixelEditor: "ensure-pixel-editor",
}));
const createVersionModeRuntime = vi.fn(() => ({
  populateOptions: "populate-options",
  render: "render-version-mode",
  toggle: "toggle-version-mode",
}));
const createBrowserRuntimeConfig = vi.fn(() => ({
  load: "load-search-languages",
  render: "render-search-languages",
  select: "select-language-link",
  set: "set-search-language",
}));
const createDialogRuntimeConfig = vi.fn(() => ({
  showEmoji: "show-emoji",
  navigateEmoji: "navigate-emoji",
  updateDialogNavigation: "update-dialog-navigation",
  updateCompositionBackButton: "update-composition-back-button",
}));
const getEmojiGenders = vi.fn((item: unknown, emojiByKey: unknown) => [
  "emoji-genders",
  item,
  emojiByKey,
]);
const ensureUtilityPanel = vi.fn(async () => undefined);

vi.mock("../../../src/explorer-runtime.js", () => ({
  createExplorerRuntime,
}));
vi.mock("../../../src/explorer/explorer-dom.js", () => ({
  getExplorerElements: "get-explorer-elements",
}));
vi.mock("../../../src/explorer/utility/utility-controls.js", () => ({
  ensureEmojiCompositionControl: "ensure-emoji-composition-control",
  ensureUtilityPanel,
  ensureUtilityControls: "ensure-utility-controls",
  positionFavoriteButton: "position-favorite-button",
}));
vi.mock("../../../src/app/ui-binding-runtime.js", () => ({
  createUiBindingRuntime,
}));
vi.mock("../../../src/app/startup/startup-runtime.js", () => ({
  createStartupRuntime,
}));
vi.mock("../../../src/app/pixel-editor-loader-runtime.js", () => ({
  createPixelEditorRuntime,
}));
vi.mock("../../../src/app/version/version-mode-runtime.js", () => ({
  createVersionModeRuntime,
}));
vi.mock("../../../src/app/browser/browser-runtime-config.js", () => ({
  createBrowserRuntimeConfig,
}));
vi.mock("../../../src/app/dialog/dialog-runtime-config.js", () => ({
  createDialogRuntimeConfig,
}));
vi.mock("../../../src/explorer/explorer-labels.js", () => ({
  languageFlags: { en: "🇺🇸" },
  sequenceTranslationKeys: { zwj: "joiner" },
  sequenceTypeLabels: { zwj: "ZWJ" },
  statusTranslationKeys: { fullyQualified: "fq" },
  versionModeDefinitions: ["all", "selected"],
}));
vi.mock("../../../src/explorer/pwa/pwa-panels.js", () => ({
  closePanelDialog: "close-panel-dialog",
  onPanelDialogClose: "on-panel-dialog-close",
  openPanelDialog: "open-panel-dialog",
  updateWebAppManifest: "update-webapp-manifest",
}));
vi.mock("../../../src/explorer/emoji/emoji-filter.js", () => ({
  getEmojiGenders,
}));

describe("createExplorerBootstrapRuntime", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const state = await import("../../../src/state.js");
    state.currentDialogParentStack.set(["favorites"]);
    state.copiedEmojiKeys.set(["wave"]);
    state.favoriteEmojiKeys.set(["thumbsUp"]);
    state.emojiByKey.replace({ wave: "👋" });
  });

  it("wires the bootstrap runtime from mocked sub-runtimes and shared state", async () => {
    const { createExplorerBootstrapRuntime } =
      await import("../../../src/app/bootstrap/explorer-bootstrap-runtime.js");
    const state = await import("../../../src/state.js");

    let pixelEditorValue: any = {
      refreshFontBuild: vi.fn(),
      open: vi.fn((...args: unknown[]) => ["open-editor", args]),
    };
    let pixelEditorPromiseValue: unknown = "pixel-editor-promise";

    const runtime = createExplorerBootstrapRuntime({
      setControls: "set-controls",
      setElements: vi.fn(),
      setFieldsets: "set-fieldsets",
      skinToneCheckboxes: () => ["1F3FB"],
      hairCheckboxes: () => ["red"],
      genderCheckboxes: () => ["neutral"],
      formatNumber: "format-number",
      formatPercent: "format-percent",
      getPixelEditor: () => pixelEditorValue,
      getPixelEditorPromise: () => pixelEditorPromiseValue,
      setPixelEditor: vi.fn((value: unknown) => {
        pixelEditorValue = value;
      }),
      setPixelEditorPromise: vi.fn((value: unknown) => {
        pixelEditorPromiseValue = value;
      }),
      translate: "translate",
      drawList: "draw-list",
      renderCategoryFilters: "render-category-filters",
      versionModeSelector: () => "version-mode-selector",
      versionModeToggle: () => "version-mode-toggle",
      syncUrlState: "sync-url-state",
      applyDialogUrlState: "apply-dialog-url-state",
      applyPixelArtworkClass: "apply-pixel-artwork-class",
      applyStandalonePixelArtwork: "apply-standalone-pixel-artwork",
      languageDialog: () => "language-dialog",
      languageList: () => "language-list",
      languagePicker: () => "language-picker",
      languagePickerFlag: () => "language-picker-flag",
      languagePickerLabel: () => "language-picker-label",
      loadUiTranslations: "load-ui-translations",
      nextSearchLoadId: () => 6,
      refreshLocalizedLabels: "refresh-localized-labels",
      restoreDeveloperMode: "restore-developer-mode",
      setApplyingUrlState: "set-applying-url-state",
      suppressedPanelCloses: () => "suppressed-panel-closes",
      updateModifierArtwork: vi.fn(),
      updatePixelArtworkManifest: "update-pixel-artwork-manifest",
      copyStatus: () => "copy-status",
      developerModeEnabled: "developer-mode-enabled",
      displayGroupName: "display-group-name",
      displayUnicodeSubGroupName: "display-unicode-subgroup-name",
      focusInitialEmojiDialogAction: "focus-initial-action",
      getIntroducedVersion: "get-introduced-version",
      setDialogView: "set-dialog-view",
      updateCompositionBackButton: vi.fn(
        () => "update-composition-back-button",
      ),
      updateDialogNavigation: vi.fn(() => "update-dialog-navigation"),
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
      modeChoices: () => "mode-choices",
      emojiFontChoices: () => "emoji-font-choices",
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
      loadSearchLanguages: () => "load-search-languages-option",
      matchCount: () => "match-count",
      navigateEmoji: (amount: number) => ["navigate-emoji-option", amount],
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
      populateVersionModeOptions: "populate-version-mode-options",
      renderDeveloperMode: "render-developer-mode",
      renderInstallAppButton: "render-install-app-button",
      renderPixelFontToggle: "render-pixel-font-toggle",
      renderSavedEmoji: "render-saved-emoji",
      renderSearchLanguages: () => "render-search-languages",
      renderVersionModeToggle: () => "render-version-mode-toggle",
      resetFilters: () => "reset-filters",
      savedDialog: () => "saved-dialog",
      savedPicker: () => "saved-picker",
      scheduleSearchDraw: "schedule-search-draw",
      searchText: () => "search-text",
      selectEmojiFont: "select-emoji-font",
      setUrlStateReady: "set-url-state-ready",
      showEmoji: "show-emoji-option",
      stepVersion: "step-version",
      subGroupFilterDialog: () => "subgroup-filter-dialog",
      subGroupPickerTrigger: () => "subgroup-picker-trigger",
      subGroupSelector: () => "subgroup-selector",
      themeChoices: () => "theme-choices",
      toggleDeveloperMode: "toggle-developer-mode",
      toggleVersionMode: "toggle-version-mode",
      toolbar: () => "toolbar",
      updateOnlineStatus: "update-online-status",
      urlStateReady: () => true,
      versionNext: () => "version-next",
      versionPrevious: () => "version-previous",
      versionRange: () => "version-range",
      versionSelector: () => "version-selector",
    });

    expect(createExplorerRuntime).toHaveBeenCalledWith({
      ensureUtilityControls: "ensure-utility-controls",
      getElements: "get-explorer-elements",
    });
    expect(createUiBindingRuntime).toHaveBeenCalledWith({
      setControls: "set-controls",
      setElements: expect.any(Function),
      setFieldsets: "set-fieldsets",
      skinToneCheckboxes: expect.any(Function),
      hairCheckboxes: expect.any(Function),
      genderCheckboxes: expect.any(Function),
    });
    const uiBindingOptions: any = (
      createUiBindingRuntime.mock.calls as any
    )[0][0];
    expect(uiBindingOptions.skinToneCheckboxes()).toEqual(["1F3FB"]);
    expect(uiBindingOptions.hairCheckboxes()).toEqual(["red"]);
    expect(uiBindingOptions.genderCheckboxes()).toEqual(["neutral"]);
    expect(createPixelEditorRuntime).toHaveBeenCalledWith({
      dialog: expect.any(Function),
      formatNumber: "format-number",
      formatPercent: "format-percent",
      getEditor: expect.any(Function),
      getPromise: expect.any(Function),
      setEditor: expect.any(Function),
      setPromise: expect.any(Function),
      translate: "translate",
    });
    const pixelEditorOptions: any = (
      createPixelEditorRuntime.mock.calls as any
    )[0][0];
    expect(pixelEditorOptions.dialog()).toEqual([
      "runtime-get",
      "exampleDialog",
    ]);
    expect(pixelEditorOptions.getEditor()).toBe(pixelEditorValue);
    expect(pixelEditorOptions.getPromise()).toBe(pixelEditorPromiseValue);
    expect(createVersionModeRuntime).toHaveBeenCalledWith({
      definitions: ["all", "selected"],
      drawList: "draw-list",
      renderCategoryFilters: "render-category-filters",
      selector: expect.any(Function),
      syncUrlState: "sync-url-state",
      toggle: expect.any(Function),
      translate: "translate",
    });
    const versionModeOptions: any = (
      createVersionModeRuntime.mock.calls as any
    )[0][0];
    expect(versionModeOptions.selector()).toBe("version-mode-selector");
    expect(versionModeOptions.toggle()).toBe("version-mode-toggle");

    const browserOptions: any = (
      createBrowserRuntimeConfig.mock.calls as any
    )[0][0];
    expect(browserOptions.closePanelDialog).toBe("close-panel-dialog");
    expect(browserOptions.dialog()).toEqual(["runtime-get", "exampleDialog"]);
    expect(browserOptions.languageDialog()).toBe("language-dialog");
    expect(browserOptions.languageFlags.en).toBe("🇺🇸");
    expect(browserOptions.languageList()).toBe("language-list");
    expect(browserOptions.languagePicker()).toBe("language-picker");
    expect(browserOptions.languagePickerFlag()).toBe("language-picker-flag");
    expect(browserOptions.languagePickerLabel()).toBe("language-picker-label");
    expect(browserOptions.nextLoadId()).toBe(6);
    expect(browserOptions.onPixelFontRevisionLoaded()).toBeUndefined();
    browserOptions.onPixelFontRevisionLoaded();
    expect(pixelEditorValue.refreshFontBuild).toHaveBeenCalledTimes(2);
    expect(browserOptions.updateModifierArtwork()).toBeUndefined();
    browserOptions.updateModifierArtwork();
    expect(browserOptions.suppressedPanelCloses()).toBe(
      "suppressed-panel-closes",
    );
    expect(createBrowserRuntimeConfig).toHaveBeenCalledTimes(1);

    const dialogOptions: any = (
      createDialogRuntimeConfig.mock.calls as any
    )[0][0];
    expect(dialogOptions.sequenceTranslationKeys).toEqual({ zwj: "joiner" });
    expect(dialogOptions.sequenceTypeLabels).toEqual({ zwj: "ZWJ" });
    expect(dialogOptions.statusTranslationKeys).toEqual({
      fullyQualified: "fq",
    });
    expect(dialogOptions.copyStatus()).toBe("copy-status");
    expect(dialogOptions.dialog()).toEqual(["runtime-get", "exampleDialog"]);
    expect(dialogOptions.emojiParent()).toEqual(["runtime-get", "emojiParent"]);
    expect(dialogOptions.dialog()).toEqual(["runtime-get", "exampleDialog"]);
    expect(dialogOptions.emojiNext()).toEqual(["runtime-get", "emojiNext"]);
    expect(dialogOptions.emojiPrevious()).toEqual([
      "runtime-get",
      "emojiPrevious",
    ]);
    expect(dialogOptions.openEditor("wave", "👋")).toEqual([
      "open-editor",
      ["wave", "👋"],
    ]);
    expect(dialogOptions.updateCompositionBackButton()).toBe(
      "update-composition-back-button",
    );
    expect(dialogOptions.updateDialogNavigation()).toBe(
      "update-dialog-navigation",
    );
    dialogOptions.setCurrentDialogParentStack(["help"]);
    expect(state.currentDialogParentStack.get()).toEqual(["help"]);

    const startupOptions: any = (createStartupRuntime.mock.calls as any)[0][0];
    expect(startupOptions.onPanelClose).toBe("on-panel-dialog-close");
    expect(startupOptions.positionFavoriteButton).toBe(
      "position-favorite-button",
    );
    expect(startupOptions.resolveElements()).toEqual(["resolve-elements"]);
    expect(startupOptions.assignControls("controls")).toEqual([
      "assign-controls",
      ["controls"],
    ]);
    expect(startupOptions.assignElements("elements")).toEqual([
      "assign-elements",
      ["elements"],
    ]);
    expect(startupOptions.assignModifierFieldsets()).toEqual([
      "assign-fieldsets",
      [],
    ]);
    expect(startupOptions.advancedFilters()).toBe("advanced-filters");
    expect(startupOptions.advancedFiltersButton()).toBe(
      "advanced-filters-button",
    );
    expect(startupOptions.applyingUrlState()).toBe(false);
    expect(startupOptions.clearFiltersButton()).toBe("clear-filters-button");
    expect(startupOptions.developerModeToggle()).toBe("developer-mode-toggle");
    expect(startupOptions.modeChoices()).toBe("mode-choices");
    expect(startupOptions.dialog()).toEqual(["runtime-get", "exampleDialog"]);
    expect(startupOptions.emojiFontChoices()).toBe("emoji-font-choices");
    expect(startupOptions.emojiList()).toBe("emoji-list");
    expect(startupOptions.emojiNext()).toEqual(["runtime-get", "emojiNext"]);
    expect(startupOptions.emojiPrevious()).toEqual([
      "runtime-get",
      "emojiPrevious",
    ]);
    expect(startupOptions.loadSearchLanguages()).toBe(
      "load-search-languages-option",
    );
    expect(startupOptions.copiedEmojiKeys()).toEqual(["wave"]);
    expect(startupOptions.favoriteEmojiKeys()).toEqual(["thumbsUp"]);
    expect(startupOptions.emojiByKey()).toEqual({ wave: "👋" });
    expect(startupOptions.genderCheckboxes()).toEqual(["neutral"]);
    expect(startupOptions.groupFilterDialog()).toBe("group-filter-dialog");
    expect(startupOptions.groupPickerTrigger()).toBe("group-picker-trigger");
    expect(startupOptions.groupSelector()).toBe("group-selector");
    expect(startupOptions.hairCheckboxes()).toEqual(["red"]);
    expect(startupOptions.helpDialog()).toBe("help-dialog");
    expect(startupOptions.helpPicker()).toBe("help-picker");
    expect(startupOptions.hideModifierEmojiAccessibility()).toEqual([
      "hide-modifier-a11y",
    ]);
    expect(startupOptions.installAppButton()).toBe("install-app-button");
    expect(startupOptions.installDialog()).toBe("install-dialog");
    expect(startupOptions.languageDialog()).toBe("language-dialog");
    expect(startupOptions.languageList()).toBe("language-list");
    expect(startupOptions.languagePicker()).toBe("language-picker");
    expect(startupOptions.matchCount()).toBe("match-count");
    expect(startupOptions.navigateEmoji(2)).toEqual([
      "navigate-emoji-option",
      2,
    ]);
    expect(startupOptions.orderButtons()).toBe("order-buttons");
    await startupOptions.ensureUtilityPanel("help");
    expect(ensureUtilityPanel).toHaveBeenCalledWith("help");
    expect(startupOptions.renderSearchLanguages()).toBe(
      "render-search-languages",
    );
    expect(startupOptions.renderVersionModeToggle()).toBe(
      "render-version-mode-toggle",
    );
    expect(startupOptions.resetFilters()).toBe("reset-filters");
    expect(startupOptions.savedDialog()).toBe("saved-dialog");
    expect(startupOptions.savedPicker()).toBe("saved-picker");
    expect(startupOptions.searchText()).toBe("search-text");
    expect(startupOptions.skinToneCheckboxes()).toEqual(["1F3FB"]);
    expect(startupOptions.subGroupFilterDialog()).toBe(
      "subgroup-filter-dialog",
    );
    expect(startupOptions.subGroupPickerTrigger()).toBe(
      "subgroup-picker-trigger",
    );
    expect(startupOptions.subGroupSelector()).toBe("subgroup-selector");
    expect(startupOptions.suppressedPanelCloses()).toBe(
      "suppressed-panel-closes",
    );
    expect(startupOptions.themeChoices()).toBe("theme-choices");
    expect(startupOptions.toolbar()).toBe("toolbar");
    expect(startupOptions.urlStateReady()).toBe(true);
    expect(startupOptions.versionModeSelector()).toBe("version-mode-selector");
    expect(startupOptions.versionModeToggle()).toBe("version-mode-toggle");
    expect(startupOptions.versionNext()).toBe("version-next");
    expect(startupOptions.versionPrevious()).toBe("version-previous");
    expect(startupOptions.versionRange()).toBe("version-range");
    expect(startupOptions.versionSelector()).toBe("version-selector");

    expect(runtime.explorerRuntime.get("exampleDialog")).toEqual([
      "runtime-get",
      "exampleDialog",
    ]);
    expect(runtime.uiBindingRuntime.assignControls("x")).toEqual([
      "assign-controls",
      ["x"],
    ]);
    expect(runtime.ensureEmojiCompositionControl).toBe(
      "ensure-emoji-composition-control",
    );
    expect(runtime.ensurePixelEditor).toBe("ensure-pixel-editor");
    expect(runtime.populateVersionModeOptions).toBe("populate-options");
    expect(runtime.renderVersionModeToggleController).toBe(
      "render-version-mode",
    );
    expect(runtime.toggleVersionMode).toBe("toggle-version-mode");
    expect(runtime.loadSearchLanguages).toBe("load-search-languages");
    expect(runtime.renderSearchLanguages).toBe("render-search-languages");
    expect(runtime.selectLanguageLink).toBe("select-language-link");
    expect(runtime.setSearchLanguage).toBe("set-search-language");
    expect(runtime.showEmoji).toBe("show-emoji");
    expect(runtime.navigateEmoji).toBe("navigate-emoji");
    expect(runtime.updateDialogNavigation).toBe("update-dialog-navigation");
    expect(runtime.updateCompositionBackButton).toBe(
      "update-composition-back-button",
    );
    expect(runtime.finishExplorerLoading).toBe("finish-explorer-loading");
    expect(runtime.onLoad).toBe("on-load");
    expect(runtime.removeLegacyDialogElements).toBe(
      "remove-legacy-dialog-elements",
    );
    expect(runtime.revealExplorer).toBe("reveal-explorer");
    expect(runtime.getEmojiGenders("wave")).toEqual([
      "emoji-genders",
      "wave",
      { wave: "👋" },
    ]);
    expect(getEmojiGenders).toHaveBeenCalledWith("wave", { wave: "👋" });
  });
});
