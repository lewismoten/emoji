import { beforeEach, describe, expect, it, vi } from "vitest";

const createEmojiListRenderers = vi.fn((options: any) => {
  const asItem = vi.fn((renderState: unknown, key: string, stateRef: unknown) => [
    "as-item",
    renderState,
    key,
    stateRef,
  ]);
  const asSequenceItem = vi.fn(
    (renderState: unknown, key: string, stateRef: unknown) => [
      "as-sequence-item",
      renderState,
      key,
      stateRef,
    ],
  );
  return {
    asItem,
    asSequenceItem,
    flushEmojiCellFragment: "flush-emoji-cell-fragment",
    orderedKeys: (...args: unknown[]) => ["ordered-keys", ...args],
  };
});
const createEmojiListInteraction = vi.fn((options: any) => ({
  renderEmojiList: (...args: unknown[]) => ["render-emoji-list", ...args, options],
  onEmojiFocus: (...args: unknown[]) => ["on-emoji-focus", ...args],
  onEmojiKeyDown: (...args: unknown[]) => ["on-emoji-key-down", ...args],
}));
const createListController = vi.fn((options: any) => ({
  draw: (...args: unknown[]) => ["draw-list", ...args],
  schedule: (...args: unknown[]) => ["schedule-search-draw", ...args],
}));
const updateActiveFilterSummary = vi.fn((options: any) => [
  "update-active-filter-summary",
  options,
]);

vi.mock("../../../src/explorer/emoji/emoji-list-render.js", () => ({
  createEmojiListRenderers,
}));
vi.mock("../../../src/explorer/emoji/emoji-list-interaction.js", () => ({
  createEmojiListInteraction,
}));
vi.mock("../../../src/explorer/emoji/list-controller.js", () => ({
  createListController,
}));
vi.mock("../../../src/explorer/filters/filter-summary.js", () => ({
  updateActiveFilterSummary,
}));
vi.mock("../../../src/explorer/emoji/popular-keys.js", () => ({
  popularKeys: ["wave", "sparkles"],
}));

describe("createListOrchestration", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const state = await import("../../../src/state.js");
    state.allIds.set(["wave", "sparkles"]);
    state.byId.replace({ wave: { key: "wave" } } as any);
    state.displayedKeys.set(["wave"]);
    state.emojiByKey.replace({ wave: "👋", sparkles: "✨" });
    state.focusedEmojiKey.set("wave");
    state.groups.set(["Objects"]);
    state.items.set([{ key: "wave" }] as any);
    state.orderMode.set("grouped");
    state.searchAnnotations.replace({ wave: ["hello"] });
    state.selectedGroup.set("Objects");
    state.selectedSearchLocale.set("en");
    state.selectedSequenceType.set("zwj");
    state.selectedSubGroup.set("mail");
    state.subGroups.replace({ Objects: ["mail"] });
    state.versionManifests.set([{ version: "16.0" }, { version: "17.0" }]);
  });

  it("assembles render, controller, interaction, and summary behavior from shared state", async () => {
    const { createListOrchestration } = await import(
      "../../../src/app/list-orchestration.js"
    );
    const state = await import("../../../src/state.js");

    const runtime = createListOrchestration({
      activeFilterSummary: () => "active-filter-summary",
      activeFilterText: () => "active-filter-text",
      applyPixelArtworkClass: "apply-pixel-artwork-class",
      displayExplorerLabel: "display-explorer-label",
      displayGroupName: "display-group-name",
      displayUnicodeSubGroupName: "display-unicode-subgroup-name",
      formatNumber: "format-number",
      genderCheckboxes: () => ["neutral"],
      getIntroducedVersion: "get-introduced-version",
      getVersionKeys: "get-version-keys",
      hairCheckboxes: () => ["red"],
      matchCount: "match-count",
      nextRenderGeneration: "next-render-generation",
      onClick: "on-click",
      emojiList: "emoji-list",
      renderGeneration: "render-generation",
      resetFilters: "reset-filters",
      revealExplorer: "reveal-explorer",
      searchText: () => ({ value: "smile" }),
      sequenceTranslationKeys: "sequence-translation-keys",
      sequenceTypeLabels: "sequence-type-labels",
      sequenceTypeOrder: "sequence-type-order",
      skinToneCheckboxes: () => ["1F3FB"],
      subGroupSelectionKey: "subgroup-selection-key",
      syncUrlState: "sync-url-state",
      translate: "translate",
      unassigned: "unassigned",
      updateDialogNavigation: "update-dialog-navigation",
      versionModeSelector: () => ({ value: "selected" }),
      versionSelector: () => ({ value: "17.0" }),
      versionSliderLabel: "version-slider-label",
    });

    const renderOptions = createEmojiListRenderers.mock.calls[0]![0];
    expect(renderOptions.applyPixelArtworkClass).toBe("apply-pixel-artwork-class");
    expect(renderOptions.byId()).toEqual(state.byId.get());
    expect(renderOptions.displayExplorerLabel).toBe("display-explorer-label");
    expect(renderOptions.displayGroupName).toBe("display-group-name");
    expect(renderOptions.displayUnicodeSubGroupName).toBe(
      "display-unicode-subgroup-name",
    );
    expect(renderOptions.emojiByKey()).toEqual(state.emojiByKey.get());
    expect(renderOptions.focusedEmojiKey()).toBe("wave");
    expect(renderOptions.getIntroducedVersion).toBe("get-introduced-version");
    expect(renderOptions.groups()).toEqual(["Objects"]);
    expect(renderOptions.orderMode()).toBe("grouped");
    expect(renderOptions.popularKeys()).toEqual(["wave", "sparkles"]);
    expect(renderOptions.searchAnnotations()).toEqual({ wave: ["hello"] });
    expect(renderOptions.subGroups()).toEqual({ Objects: ["mail"] });

    const listOptions = createListController.mock.calls[0]![0];
    expect(listOptions.allIds()).toEqual(["wave", "sparkles"]);
    expect(listOptions.byId()).toEqual(state.byId.get());
    expect(listOptions.emojiByKey()).toEqual(state.emojiByKey.get());
    expect(listOptions.focusedEmojiKey()).toBe("wave");
    expect(listOptions.items()).toEqual([{ key: "wave" }]);
    expect(listOptions.orderMode()).toBe("grouped");
    expect(listOptions.popularKeys()).toEqual(["wave", "sparkles"]);
    expect(listOptions.orderedKeys("x")).toEqual(["ordered-keys", "x"]);
    expect(listOptions.searchAnnotations()).toEqual({ wave: ["hello"] });
    expect(listOptions.selectedGroup()).toBe("Objects");
    expect(listOptions.selectedSearchLocale()).toBe("en");
    expect(listOptions.selectedSequenceType()).toBe("zwj");
    expect(listOptions.selectedSubGroup()).toBe("mail");
    listOptions.setDisplayedKeys(["sparkles"]);
    listOptions.setFocusedEmojiKey("sparkles");
    expect(state.displayedKeys.get()).toEqual(["sparkles"]);
    expect(state.focusedEmojiKey.get()).toBe("sparkles");
    expect(listOptions.renderEmojiList("a", "b")).toEqual([
      "render-emoji-list",
      "a",
      "b",
      createEmojiListInteraction.mock.calls[0]![0],
    ]);

    const interactionOptions = createEmojiListInteraction.mock.calls[0]![0];
    expect(interactionOptions.asItem("r", "wave")).toEqual([
      "as-item",
      "r",
      "wave",
      state,
    ]);
    expect(interactionOptions.asSequenceItem("r", "wave")).toEqual([
      "as-sequence-item",
      "r",
      "wave",
      state,
    ]);
    expect(interactionOptions.drawList("x")).toEqual(["draw-list", "x"]);
    expect(interactionOptions.emojiList).toBe("emoji-list");
    expect(interactionOptions.flushEmojiCellFragment).toBe(
      "flush-emoji-cell-fragment",
    );
    expect(interactionOptions.focusedEmojiKey()).toBe("sparkles");
    expect(interactionOptions.getDisplayedKeys()).toEqual(["sparkles"]);
    expect(interactionOptions.onClick).toBe("on-click");
    expect(interactionOptions.orderMode()).toBe("grouped");
    expect(interactionOptions.resetFilters).toBe("reset-filters");
    expect(interactionOptions.revealExplorer).toBe("reveal-explorer");
    interactionOptions.setFocusedEmojiKey("wave");
    expect(state.focusedEmojiKey.get()).toBe("wave");

    expect(listOptions.updateFilterSummary()).toEqual([
      "update-active-filter-summary",
      updateActiveFilterSummary.mock.calls[0]![0],
    ]);
    expect(runtime.updateActiveFilterSummary()).toEqual([
      "update-active-filter-summary",
      updateActiveFilterSummary.mock.calls.at(-1)![0],
    ]);
    const summaryOptions = updateActiveFilterSummary.mock.calls[0]![0];
    expect(summaryOptions.activeFilterSummary).toBe("active-filter-summary");
    expect(summaryOptions.activeFilterText).toBe("active-filter-text");
    expect(summaryOptions.latestReleased).toBe("17.0");
    expect(summaryOptions.orderMode).toBe("grouped");
    expect(summaryOptions.searchText).toBe("smile");
    expect(summaryOptions.selectedGroup).toBe("Objects");
    expect(summaryOptions.selectedSequenceType).toBe("zwj");
    expect(summaryOptions.selectedSubGroup).toBe("mail");
    expect(summaryOptions.versionMode).toBe("selected");
    expect(summaryOptions.versionSliderLabel).toBe("version-slider-label");
    expect(summaryOptions.versionValue).toBe("17.0");

    expect(runtime.drawList("list")).toEqual(["draw-list", "list"]);
    expect(runtime.scheduleSearchDraw("schedule")).toEqual([
      "schedule-search-draw",
      "schedule",
    ]);
    expect(runtime.onEmojiFocus("focus")).toEqual(["on-emoji-focus", "focus"]);
    expect(runtime.onEmojiKeyDown("keydown")).toEqual([
      "on-emoji-key-down",
      "keydown",
    ]);
  });
});
