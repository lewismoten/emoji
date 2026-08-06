import { describe, expect, it, vi } from "vitest";

const createExplorerNavigation = vi.fn((options: any) => ({
  kind: "runtime",
  options,
}));

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

    const { createNavigationRuntime } =
      await import("../../src/app/navigation-runtime.js");

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
      setCompositionMode: (value: string) => (
        (setters.composition ??= []).push(value),
        undefined
      ),
      setDialogView: (...args: unknown[]) => ["set-dialog-view", args],
      setOrderMode: (value: string) => (
        (setters.order ??= []).push(value),
        undefined
      ),
      setSelectedGroup: (value: string) => (
        (setters.group ??= []).push(value),
        undefined
      ),
      setSelectedSequenceType: (value: string) => (
        (setters.sequenceType ??= []).push(value),
        undefined
      ),
      setSelectedSubGroup: (value: string) => (
        (setters.subGroup ??= []).push(value),
        undefined
      ),
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
    expect(options.allowedSequenceTypes).toBe("allowed-sequence-types");
    expect(options.applyingUrlState()).toBe(false);
    expect(options.compositionMode()).toBe("condensed");
    expect(options.developerModeEnabled).toBe("developer-mode-enabled");
    expect(options.fullDeveloperModeEnabled).toBe(
      "full-developer-mode-enabled",
    );
    expect(options.dialog().close).toBeTypeOf("function");
    expect(options.currentEmojiKey()).toBe("wave");
    expect(options.drawList).toBe("draw-list");
    expect(options.emojiByKey()).toEqual({ wave: "👋" });
    expect(options.ensurePanelDialog).toBe("ensure-panel-dialog");
    expect(options.genderCheckboxes()).toEqual(["neutral"]);
    expect(options.getOrderMode()).toBe("grouped");
    expect(options.getSelectedGroup()).toBe("Objects");
    expect(options.getSelectedSequenceType()).toBe("zwj");
    expect(options.getSelectedSubGroup()).toBe("mail");
    expect(options.groups()).toEqual(["Objects"]);
    expect(options.hairCheckboxes()).toEqual(["red"]);
    expect(options.helpDialog()).toBe("help-dialog");
    expect(options.languageList()).toBe("language-list");
    expect(options.latestReleasedVersion()).toBe("17.0");
    expect(options.navigateEmoji(2)).toEqual(["navigate-emoji", 2]);
    expect(options.orderButtons()).toBe("order-buttons");
    expect(options.panelDialogs).toBe("panel-dialogs");
    expect(options.preferredOrder()).toBe("unicode");
    expect(options.renderCategoryFilters()).toBe("render-category-filters");
    expect(options.renderSavedEmoji).toBe("render-saved-emoji");
    expect(options.renderVersionModeToggle()).toBe(
      "render-version-mode-toggle",
    );
    expect(options.searchText()).toBe("search-text");
    expect(options.subGroups()).toEqual({ Objects: ["mail"] });
    expect(options.setDialogView("details")).toEqual([
      "set-dialog-view",
      ["details"],
    ]);
    expect(options.skinToneCheckboxes()).toEqual(["1F3FB"]);
    expect(options.subGroupSelectionKey).toBe("subgroup-selection-key");
    expect(options.suppressedPanelCloses()).toBe("suppressed-panel-closes");
    expect(options.syncVersionRange()).toBe("sync-version-range");
    expect(options.urlStateReady()).toBe(true);
    expect(options.versionModeSelector()).toBe("version-mode-selector");
    expect(options.versionRange()).toBe("version-range");
    expect(options.versionSelector()).toBe("version-selector");
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
