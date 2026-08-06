import { describe, expect, it, vi } from "vitest";

const createExplorerNavigation = vi.fn((options: any) => ({ kind: "runtime", options }));

vi.mock("../../src/explorer/navigation/explorer-navigation.js", () => ({
  createExplorerNavigation,
}));

describe("createNavigationRuntime", () => {
  it("builds navigation config with shared state and runtime callbacks", async () => {
    const state = await import("../../src/state.js");
    state.currentEmojiKey.set("wave");
    state.displayedKeys.set(["wave", "sparkles"]);
    state.emojiByKey.replace({ wave: "👋" });
    state.groups.set(["Objects"]);
    state.subGroups.replace({ Objects: ["mail"] });

    const dialogCalls: string[] = [];
    const suppressCalls: boolean[] = [];
    const showEmoji = vi.fn((...args: unknown[]) => ["show-emoji", args]);
    const setters: Record<string, string[]> = {};

    const { createNavigationRuntime } = await import(
      "../../src/app/navigation-runtime.js"
    );

    const runtime = createNavigationRuntime({
      allowedSequenceTypes: "allowed-sequence-types",
      applyingUrlState: () => false,
      compositionMode: () => "condensed",
      developerModeEnabled: "developer-mode-enabled",
      fullDeveloperModeEnabled: "full-developer-mode-enabled",
      dialog: () => ({
        close() {
          dialogCalls.push("close");
        },
        showModal() {
          dialogCalls.push("showModal");
        },
      }),
      drawList: "draw-list",
      ensurePanelDialog: "ensure-panel-dialog",
      genderCheckboxes: () => ["neutral"],
      getOrderMode: () => "grouped",
      getSelectedGroup: () => "Objects",
      getSelectedSequenceType: () => "zwj",
      getSelectedSubGroup: () => "mail",
      hairCheckboxes: () => ["red"],
      helpDialog: () => "help-dialog",
      languageList: () => "language-list",
      latestReleasedVersion: () => "17.0",
      navigateEmoji: (amount: number) => ["navigate-emoji", amount],
      showEmoji,
      orderButtons: () => "order-buttons",
      panelDialogs: "panel-dialogs",
      preferredOrder: () => "unicode",
      renderCategoryFilters: () => "render-category-filters",
      renderSavedEmoji: "render-saved-emoji",
      renderVersionModeToggle: () => "render-version-mode-toggle",
      searchText: () => "search-text",
      setCompositionMode: (value: string) =>
        ((setters.composition ??= []).push(value), undefined),
      setDialogView: (...args: unknown[]) => ["set-dialog-view", args],
      setOrderMode: (value: string) =>
        ((setters.order ??= []).push(value), undefined),
      setSelectedGroup: (value: string) =>
        ((setters.group ??= []).push(value), undefined),
      setSelectedSequenceType: (value: string) =>
        ((setters.sequenceType ??= []).push(value), undefined),
      setSelectedSubGroup: (value: string) =>
        ((setters.subGroup ??= []).push(value), undefined),
      focusInitialAction: () => {
        dialogCalls.push("focus");
      },
      skinToneCheckboxes: () => ["1F3FB"],
      subGroupSelectionKey: "subgroup-selection-key",
      suppressedPanelCloses: () => "suppressed-panel-closes",
      syncVersionRange: () => "sync-version-range",
      urlStateReady: () => true,
      versionModeSelector: () => "version-mode-selector",
      versionRange: () => "version-range",
      versionSelector: () => "version-selector",
      setSuppressDialogCloseSync(value: boolean) {
        suppressCalls.push(value);
      },
    });

    expect(runtime).toEqual({
      kind: "runtime",
      options: createExplorerNavigation.mock.calls[0]![0],
    });

    const options = createExplorerNavigation.mock.calls[0]![0];
    expect(options.currentEmojiKey()).toBe("wave");
    expect(options.emojiByKey()).toEqual({ wave: "👋" });
    expect(options.groups()).toEqual(["Objects"]);
    expect(options.subGroups()).toEqual({ Objects: ["mail"] });
    expect(options.openEmoji("wave", true, ["a", "b"], "code")).toEqual([
      "show-emoji",
      ["wave", true, ["a", "b"], "code"],
    ]);
    options.openEmoji("sparkles");
    expect(showEmoji).toHaveBeenLastCalledWith(
      "sparkles",
      false,
      ["wave", "sparkles"],
      undefined,
    );

    options.closeEmojiDialog();
    expect(suppressCalls).toEqual([true, false]);
    expect(dialogCalls).toEqual(["close"]);

    options.showEmojiDialog();
    expect(dialogCalls).toEqual(["close", "showModal", "focus"]);

    options.setCompositionMode("full");
    options.setOrderMode("popular");
    options.setSelectedGroup("Smileys");
    options.setSelectedSequenceType("tag");
    options.setSelectedSubGroup("emotion");
    expect(setters).toEqual({
      composition: ["full"],
      order: ["popular"],
      group: ["Smileys"],
      sequenceType: ["tag"],
      subGroup: ["emotion"],
    });
  });
});
