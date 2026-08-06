import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ensureImportExamples = vi.fn();
const upgradeEmojiDialog = vi.fn();
const finishExplorerLoading = vi.fn();
const revealExplorer = vi.fn();
const getPanel = vi.fn(() => "");

vi.mock("../../../../src/explorer/emoji/import-examples.js", () => ({
  ensureImportExamples,
}));
vi.mock("../../../../src/explorer/dialog/dialog-upgrade.js", () => ({
  upgradeEmojiDialog,
}));
vi.mock("../../../../src/explorer/loading-state.js", () => ({
  finishExplorerLoading,
  revealExplorer,
}));
vi.mock("../../../../src/app/route.js", () => ({
  getPanel,
}));

describe("createStartupOrchestrator", () => {
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalDocument)
      Object.defineProperty(globalThis, "document", originalDocument);
    else delete (globalThis as any).document;
  });

  it("handles legacy dialog cleanup and upgrade helpers", async () => {
    const removed: string[] = [];
    const removable = (name: string) => ({
      remove: () => removed.push(name),
      closest: () => ({
        remove: () => removed.push(`${name}:closest`),
      }),
    });

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector(selector: string) {
          if (selector !== ".example-dialog") return null;
          return {
            querySelector(inner: string) {
              switch (inner) {
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
        },
      },
    });

    const { createStartupOrchestrator } = await import(
      "../../../../src/app/startup/startup-orchestrator.js"
    );

    const orchestrator = createStartupOrchestrator({
      applyPixelArtworkClass: "apply-pixel-artwork-class",
      dialog: () => "dialog-node",
      emojiList: () => "emoji-list",
      matchCount: () => "match-count",
      translate: (key: string, fallback: string) => `${key}:${fallback}`,
    });

    orchestrator.finishExplorerLoading();
    expect(finishExplorerLoading).toHaveBeenCalledWith({
      applyPixelArtworkClass: "apply-pixel-artwork-class",
      emojiList: "emoji-list",
      matchCount: "match-count",
      revealExplorer: expect.any(Function),
    });

    orchestrator.revealExplorer();
    expect(revealExplorer).toHaveBeenCalledWith("emoji-list", "match-count");

    orchestrator.upgradeEmojiDialog();
    expect(upgradeEmojiDialog).toHaveBeenCalledWith({
      ensureImportExamples,
      exampleDialog: "dialog-node",
      translate: expect.any(Function),
    });

    orchestrator.removeLegacyDialogElements();
    expect(removed).toEqual([
      "copiedDescription",
      "example-link",
      "copy-emoji",
      "emoji-code-points:closest",
      "metadata-codePoints:closest",
    ]);
  });

  it("wires onLoad through initialize, bind, and finalize callbacks", async () => {
    getPanel.mockReturnValue("help");
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { querySelector: () => null },
    });

    const { createStartupOrchestrator } = await import(
      "../../../../src/app/startup/startup-orchestrator.js"
    );

    const assignElements = vi.fn();
    const assignControls = vi.fn();
    const assignModifierFieldsets = vi.fn();
    const hideModifierEmojiAccessibility = vi.fn();
    const bindAudioInteractions = vi.fn();
    const bindEvents = vi.fn();
    const finalizeStartup = vi.fn();
    const ensureUtilityPanel = vi.fn();
    const ensureEmojiCompositionControl = vi.fn();
    const initializeControls = vi.fn((options) => ({ initializedWith: options }));

    const orchestrator = createStartupOrchestrator({
      advancedFilters: () => "advanced-filters",
      advancedFiltersButton: () => "advanced-filters-button",
      applyingUrlState: () => false,
      applyBasicUrlState: "apply-basic-url-state",
      applyDialogUrlState: "apply-dialog-url-state",
      applyPixelArtworkClass: "apply-pixel-artwork-class",
      bindAudioInteractions,
      assignControls,
      assignElements,
      assignModifierFieldsets,
      bindEvents,
      clearFiltersButton: () => "clear-filters-button",
      closePanel: "close-panel",
      createFilterControlSetup: "create-filter-control-setup",
      developerModeToggle: () => "developer-mode-toggle",
      modeChoices: () => "mode-choices",
      dialog: () => "dialog-node",
      drawList: vi.fn(),
      emojiFontChoices: () => "emoji-font-choices",
      emojiList: () => "emoji-list-node",
      emojiNext: () => "emoji-next",
      emojiPrevious: () => "emoji-previous",
      ensureEmojiCompositionControl,
      ensureUtilityPanel,
      finalizeStartup,
      genderCheckboxes: () => "gender-checkboxes",
      groupFilterDialog: () => "group-filter-dialog",
      groupPickerTrigger: () => "group-picker-trigger",
      groupSelector: () => "group-selector",
      hairCheckboxes: () => "hair-checkboxes",
      helpDialog: () => "help-dialog",
      helpPicker: () => "help-picker",
      hideModifierEmojiAccessibility,
      initializeControls,
      installApp: "install-app",
      installAppButton: () => "install-app-button",
      installDialog: () => "install-dialog",
      installedDisplayQueries: "installed-display-queries",
      languageDialog: () => "language-dialog",
      languageList: () => "language-list",
      languagePicker: () => "language-picker",
      loadData: "load-data",
      loadSearchLanguages: vi.fn(),
      loadUiTranslations: "load-ui-translations",
      matchCount: () => "match-count",
      navigateEmoji: vi.fn(),
      observeToolbarHeight: "observe-toolbar-height",
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
      openPanel: "open-panel",
      orderButtons: () => "order-buttons",
      panelDialogs: "panel-dialogs",
      populateVersionModeOptions: "populate-version-mode-options",
      positionFavoriteButton: "position-favorite-button",
      refreshElements: vi.fn(),
      renderDeveloperMode: "render-developer-mode",
      renderInstallAppButton: "render-install-app-button",
      renderPixelFontToggle: "render-pixel-font-toggle",
      renderSavedEmoji: "render-saved-emoji",
      renderSearchLanguages: "render-search-languages",
      renderVersionModeToggle: "render-version-mode-toggle",
      resolveElements: () => ({ emojiList: "emoji-list-node" }),
      resetFilters: vi.fn(),
      savedDialog: () => "saved-dialog",
      savedPicker: () => "saved-picker",
      scheduleSearchDraw: "schedule-search-draw",
      searchText: () => "search-text",
      selectEmojiFont: "select-emoji-font",
      setUrlStateReady: "set-url-state-ready",
      showEmoji: "show-emoji",
      skinToneCheckboxes: () => "skin-tone-checkboxes",
      stepVersion: "step-version",
      subGroupFilterDialog: () => "subgroup-filter-dialog",
      subGroupPickerTrigger: () => "subgroup-picker-trigger",
      subGroupSelector: () => "subgroup-selector",
      suppressedPanelCloses: () => "suppressed-panel-closes",
      syncUrlState: "sync-url-state",
      syncVersionRange: "sync-version-range",
      themeChoices: () => "theme-choices",
      toggleDeveloperMode: "toggle-developer-mode",
      toggleVersionMode: "toggle-version-mode",
      toolbar: () => "toolbar",
      translate: vi.fn(),
      updateOnlineStatus: "update-online-status",
      urlStateReady: () => true,
      versionModeToggle: () => "version-mode-toggle",
      versionModeSelector: () => "version-mode-selector",
      versionNext: () => "version-next",
      versionPrevious: () => "version-previous",
      versionRange: () => "version-range",
      versionSelector: () => "version-selector-node",
    });

    await orchestrator.onLoad();

    expect(ensureUtilityPanel).toHaveBeenCalledWith("help");
    expect(ensureEmojiCompositionControl).toHaveBeenCalledTimes(1);
    expect(assignElements).toHaveBeenCalledWith({ emojiList: "emoji-list-node" });
    expect(initializeControls).toHaveBeenCalledTimes(1);
    expect(assignControls).toHaveBeenCalledWith({
      initializedWith: expect.objectContaining({
        createFilterControlSetup: "create-filter-control-setup",
        groupFilterDialog: "group-filter-dialog",
        groupPickerTrigger: "group-picker-trigger",
        groupSelector: "group-selector",
        subGroupFilterDialog: "subgroup-filter-dialog",
        subGroupPickerTrigger: "subgroup-picker-trigger",
        subGroupSelector: "subgroup-selector",
        versionModeSelector: "version-mode-selector",
        versionSelector: "version-selector-node",
      }),
    });
    expect(assignModifierFieldsets).toHaveBeenCalledTimes(1);
    expect(hideModifierEmojiAccessibility).toHaveBeenCalledTimes(1);
    expect(bindAudioInteractions).toHaveBeenCalledTimes(1);
    expect(bindEvents).toHaveBeenCalledTimes(1);
    expect(finalizeStartup).toHaveBeenCalledTimes(1);
    expect(finalizeStartup.mock.calls[0]![0]).toEqual(
      expect.objectContaining({
        finishExplorerLoading: orchestrator.finishExplorerLoading,
        toolbar: "toolbar",
        renderVersionModeToggle: "render-version-mode-toggle",
      }),
    );
  });
});
