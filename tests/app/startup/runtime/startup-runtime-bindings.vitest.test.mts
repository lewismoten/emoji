import { describe, expect, it, vi } from "vitest";

const bindExplorerEvents = vi.fn();
const finalizeExplorerStartup = vi.fn();
const initializeExplorerControls = vi.fn();
const createFilterControlSetup = vi.fn();
const observeToolbarHeight = vi.fn();
const closePanelDialog = vi.fn();
const openPanelDialog = vi.fn();
const getInstalledDisplayQueries = vi.fn(() => "installed-display-queries");
const createStartupOrchestrator = vi.fn((options: any) => ({
  kind: "startup-orchestrator",
  options,
}));

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

describe("createStartupRuntime bindings", () => {
  it("forwards binding-heavy options into the startup orchestrator", async () => {
    const { createStartupRuntime } =
      await import("../../../../src/app/startup/startup-runtime.js");

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
      developerModeToggle: () => "developer-mode-toggle",
      modeChoices: () => ["standard", "developer"],
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

    expect(runtime).toEqual({
      kind: "startup-orchestrator",
      options: createStartupOrchestrator.mock.calls[0]![0],
    });

    const call = createStartupOrchestrator.mock.calls[0]![0];
    expect(call.bindEvents).toBe(bindExplorerEvents);
    expect(call.finalizeStartup).toBe(finalizeExplorerStartup);
    expect(call.createFilterControlSetup).toBe(createFilterControlSetup);
    expect(call.observeToolbarHeight).toBe(observeToolbarHeight);
    expect(call.closePanel).toBe(closePanelDialog);
    expect(call.openPanel).toBe(openPanelDialog);
    expect(call.installedDisplayQueries).toBe("installed-display-queries");
    expect(call.advancedFilters()).toBe("advanced-filters");
    expect(call.advancedFiltersButton()).toBe("advanced-filters-button");
    expect(call.applyingUrlState()).toBe(false);
    expect(call.applyBasicUrlState).toBe("apply-basic-url-state");
    expect(call.applyDialogUrlState).toBe("apply-dialog-url-state");
    expect(call.applyPixelArtworkClass).toBe("apply-pixel-artwork-class");
    expect(call.bindAudioInteractions).toBe("bind-audio-interactions");
    expect(call.assignControls).toBe("assign-controls");
    expect(call.assignElements).toBe("assign-elements");
    expect(call.assignModifierFieldsets).toBe("assign-modifier-fieldsets");
    expect(call.clearFiltersButton()).toBe("clear-filters-button");
    expect(call.developerModeToggle()).toBe("developer-mode-toggle");
    expect(call.dialog()).toBe("dialog");
    expect(call.drawList("x")).toEqual(["draw-list", ["x"]]);
    expect(call.emojiFontChoices()).toBe("emoji-font-choices");
    expect(call.emojiList()).toBe("emoji-list");
    expect(call.emojiNext()).toBe("emoji-next");
    expect(call.emojiPrevious()).toBe("emoji-previous");
    expect(call.groupFilterDialog()).toBe("group-filter-dialog");
    expect(call.groupPickerTrigger()).toBe("group-picker-trigger");
    expect(call.groupSelector()).toBe("group-selector");
    expect(call.helpDialog()).toBe("help-dialog");
    expect(call.helpPicker()).toBe("help-picker");
    expect(call.installApp).toBe("install-app");
    expect(call.installAppButton()).toBe("install-app-button");
    expect(call.languageDialog()).toBe("language-dialog");
    expect(call.languageList()).toBe("language-list");
    expect(call.languagePicker()).toBe("language-picker");
    expect(call.loadSearchLanguages()).toBe("load-search-languages");
    expect(call.navigateEmoji(3)).toEqual(["navigate-emoji", 3]);
    expect(call.orderButtons()).toBe("order-buttons");
    expect(call.populateVersionModeOptions("a")).toEqual([
      "populate-version-mode-options",
      ["a"],
    ]);
    expect(call.renderVersionModeToggle()).toBe("render-version-mode-toggle");
    expect(call.resolveElements()).toBe("resolve-elements");
    expect(call.resetFilters()).toEqual(["reset-filters"]);
    expect(call.savedDialog()).toBe("saved-dialog");
    expect(call.savedPicker()).toBe("saved-picker");
    expect(call.showEmoji("wave")).toEqual(["show-emoji", ["wave"]]);
    expect(call.syncUrlState("replace")).toEqual([
      "sync-url-state",
      ["replace"],
    ]);
    expect(call.syncVersionRange("through")).toEqual([
      "sync-version-range",
      ["through"],
    ]);
    expect(call.toggleVersionMode("selected")).toEqual([
      "toggle-version-mode",
      ["selected"],
    ]);
    expect(call.urlStateReady()).toBe(true);
  });
});
