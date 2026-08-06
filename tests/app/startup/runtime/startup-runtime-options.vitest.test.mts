import { describe, expect, it, vi } from "vitest";

const bindExplorerEvents = vi.fn();
const finalizeExplorerStartup = vi.fn();
const initializeExplorerControls = vi.fn();
const createFilterControlSetup = vi.fn();
const observeToolbarHeight = vi.fn();
const closePanelDialog = vi.fn();
const openPanelDialog = vi.fn();
const getInstalledDisplayQueries = vi.fn(() => "installed-display-queries");
const createStartupOrchestrator = vi.fn((options: any) => ({ kind: "startup", options }));

vi.mock("../../../../src/explorer-app.js", () => ({
  bindExplorerEvents,
  finalizeExplorerStartup,
  initializeExplorerControls,
}));
vi.mock("../../../../src/explorer/filters/filter-controls.js", () => ({
  createFilterControlSetup,
}));
vi.mock("../../../../src/explorer/toolbar/toolbar-layout.js", () => ({
  observeToolbarHeight,
}));
vi.mock("../../../../src/explorer/pwa/pwa-panels.js", () => ({
  closePanelDialog,
  openPanelDialog,
  getInstalledDisplayQueries,
}));
vi.mock("../../../../src/app/startup/startup-orchestrator.js", () => ({
  createStartupOrchestrator,
}));

describe("createStartupRuntime", () => {
  it("passes startup options through to the orchestrator with mocked imports", async () => {
    const { createStartupRuntime } = await import(
      "../../../../src/app/startup/startup-runtime.js"
    );

    createStartupRuntime({
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
      developerModeToggle: () => "developer-mode-toggle",
      modeChoices: () => "mode-choices",
      dialog: () => "dialog",
      drawList: (...args: unknown[]) => ["draw-list", args],
      emojiFontChoices: () => "emoji-font-choices",
      emojiList: () => "emoji-list",
      emojiNext: () => "emoji-next",
      emojiPrevious: () => "emoji-previous",
      ensureEmojiCompositionControl: "ensure-emoji-composition-control",
      ensureUtilityPanel: "ensure-utility-panel",
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
      refreshElements: "refresh-elements",
      renderDeveloperMode: "render-developer-mode",
      renderInstallAppButton: "render-install-app-button",
      renderPixelFontToggle: "render-pixel-font-toggle",
      renderSavedEmoji: "render-saved-emoji",
      renderSearchLanguages: "render-search-languages",
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

    expect(createStartupOrchestrator).toHaveBeenCalledTimes(1);
    const options = createStartupOrchestrator.mock.calls[0]![0];
    expect(options.bindEvents).toBe(bindExplorerEvents);
    expect(options.finalizeStartup).toBe(finalizeExplorerStartup);
    expect(options.initializeControls).toBe(initializeExplorerControls);
    expect(options.createFilterControlSetup).toBe(createFilterControlSetup);
    expect(options.observeToolbarHeight).toBe(observeToolbarHeight);
    expect(options.closePanel).toBe(closePanelDialog);
    expect(options.openPanel).toBe(openPanelDialog);
    expect(options.installedDisplayQueries).toBe("installed-display-queries");
    expect(options.navigateEmoji(3)).toEqual(["navigate-emoji", 3]);
    expect(options.onClick).toBe("on-click");
    expect(options.orderButtons()).toBe("order-buttons");
    expect(options.populateVersionModeOptions("a")).toEqual([
      "populate-version-mode-options",
      ["a"],
    ]);
    expect(options.renderVersionModeToggle()).toBe("render-version-mode-toggle");
    expect(options.resolveElements()).toBe("resolve-elements");
    expect(options.resetFilters()).toEqual(["reset-filters"]);
    expect(options.savedDialog()).toBe("saved-dialog");
    expect(options.savedPicker()).toBe("saved-picker");
    expect(options.showEmoji("wave")).toEqual(["show-emoji", ["wave"]]);
    expect(options.syncUrlState("replace")).toEqual([
      "sync-url-state",
      ["replace"],
    ]);
    expect(options.syncVersionRange("through")).toEqual([
      "sync-version-range",
      ["through"],
    ]);
    expect(options.toggleVersionMode("selected")).toEqual([
      "toggle-version-mode",
      ["selected"],
    ]);
    expect(options.urlStateReady()).toBe(true);
    expect(options.versionSelector()).toBe("version-selector");
  });
});
