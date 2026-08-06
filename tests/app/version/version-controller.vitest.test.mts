import { beforeEach, describe, expect, it, vi } from "vitest";

const getVersionKeysHelper = vi.fn((options: any) => [
  "version-keys-result",
  options,
]);
const syncVersionRangeHelper = vi.fn((options: any) => [
  "sync-version-range-result",
  options,
]);
const updateModifierAvailabilityHelper = vi.fn((options: any) => [
  "update-modifier-availability-result",
  options,
]);
const versionSliderLabelHelper = vi.fn(
  (version: string, manifests: Array<{ version: string }>) =>
    `label:${version}:${manifests.length}`,
);
const populateVersionSelectorHelper = vi.fn((options: any) => [
  "populate-version-selector-result",
  options,
]);
const createExplorerDataController = vi.fn((options: any) => ({
  loadData: (...args: unknown[]) => ["load-data", args, options],
  loadVersionData: (...args: unknown[]) => ["load-version-data", args, options],
}));

vi.mock("../../../src/explorer/category/category-version.js", () => ({
  getVersionKeys: getVersionKeysHelper,
  syncVersionRange: syncVersionRangeHelper,
  updateModifierAvailability: updateModifierAvailabilityHelper,
  versionSliderLabel: versionSliderLabelHelper,
}));
vi.mock("../../../src/explorer/filters/version-data.js", () => ({
  populateVersionSelector: populateVersionSelectorHelper,
}));
vi.mock("../../../src/app/data/explorer-data-controller.js", () => ({
  createExplorerDataController,
}));

describe("createVersionController", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const state = await import("../../../src/state.js");
    state.proposedVersionManifests.set([{ version: "18.0" }] as any);
    state.versionManifests.set([
      { version: "15.0" },
      { version: "16.0" },
    ] as any);
    state.selectedSearchLocale.set("en");
    state.byId.replace({ wave: { key: "wave" } } as any);
    state.versionKeys.replace(new Map([["16.0", new Set(["wave"])]]));
    state.releasedIds.replace(new Set(["wave"]));
  });

  it("coordinates version helper wiring through shared state", async () => {
    const { createVersionController } =
      await import("../../../src/app/version/version-controller.js");

    const selector = {
      value: "16.0",
      options: [{ value: "15.0" }, { value: "16.0" }],
    };
    const range = { value: "1" };
    let renderCategoryFiltersCalls = 0;
    let drawListCalls = 0;

    const controller = createVersionController({
      translate: "translate",
      versionSelector: () => selector,
      versionModeSelector: () => ({ value: "selected" }),
      versionNext: () => "version-next",
      versionPrevious: () => "version-previous",
      versionRange: () => range,
      versionRangeValue: () => "version-range-value",
      renderCategoryFilters: () => {
        renderCategoryFiltersCalls += 1;
      },
      drawList: () => {
        drawListCalls += 1;
      },
      genderCheckboxes: () => ["neutral"],
      genderFieldset: () => "gender-fieldset",
      getEmojiGenders: "get-emoji-genders",
      hairCheckboxes: () => ["red"],
      hairFieldset: () => "hair-fieldset",
      modifierFilters: () => "modifier-filters",
      skinToneCheckboxes: () => ["1F3FB"],
      skinToneFieldset: () => "skin-tone-fieldset",
      applyLoadedUrlState: "apply-loaded-url-state",
      buildRepresentatives: "build-representatives",
      developerModeEnabled: "developer-mode-enabled",
      getIntroducedVersion: "get-introduced-version",
      groupSelector: () => "group-selector",
      loadCatalog: "load-catalog",
      loadVersionCatalog: "load-version-catalog",
      onGroupChange: "on-group-change",
      onSequenceTypeChange: "on-sequence-type-change",
      onSubGroupChange: "on-subgroup-change",
      openEmoji: "open-emoji",
      rebuildCodePointLookup: "rebuild-code-point-lookup",
      sequenceTypeSelector: () => "sequence-type-selector",
      setIntroducedVersion: "set-introduced-version",
      updateModifierArtwork: "update-modifier-artwork",
    });

    expect(controller.loadData).toBeTypeOf("function");
    expect(controller.loadVersionData).toBeTypeOf("function");

    expect(controller.versionSliderLabel("18.0")).toBe("label:18.0:1");
    expect(versionSliderLabelHelper).toHaveBeenCalledWith("18.0", [
      { version: "18.0" },
    ]);

    expect(controller.populateVersionSelector()).toEqual([
      "populate-version-selector-result",
      populateVersionSelectorHelper.mock.calls[0]![0],
    ]);
    expect(populateVersionSelectorHelper.mock.calls[0]![0].proposed).toEqual([
      { version: "18.0" },
    ]);
    expect(populateVersionSelectorHelper.mock.calls[0]![0].released).toEqual([
      { version: "15.0" },
      { version: "16.0" },
    ]);
    expect(populateVersionSelectorHelper.mock.calls[0]![0].selectedLocale).toBe(
      "en",
    );
    expect(populateVersionSelectorHelper.mock.calls[0]![0].selector).toBe(
      selector,
    );
    expect(populateVersionSelectorHelper.mock.calls[0]![0].translate).toBe(
      "translate",
    );
    expect(populateVersionSelectorHelper.mock.calls[0]![0].syncRange()).toEqual(
      ["sync-version-range-result", syncVersionRangeHelper.mock.calls[0]![0]],
    );

    expect(controller.syncVersionRange()).toEqual([
      "sync-version-range-result",
      syncVersionRangeHelper.mock.calls.at(-1)![0],
    ]);
    expect(syncVersionRangeHelper.mock.calls.at(-1)![0]).toEqual(
      expect.objectContaining({
        proposedVersionManifests: [{ version: "18.0" }],
        versionSelector: selector,
      }),
    );

    expect(controller.updateModifierAvailability()).toEqual([
      "update-modifier-availability-result",
      updateModifierAvailabilityHelper.mock.calls[0]![0],
    ]);
    expect(updateModifierAvailabilityHelper.mock.calls[0]![0]).toEqual(
      expect.objectContaining({
        versionValue: "16.0",
        genderFieldset: "gender-fieldset",
        hairFieldset: "hair-fieldset",
        skinToneFieldset: "skin-tone-fieldset",
      }),
    );

    expect(controller.getVersionKeys()).toEqual([
      "version-keys-result",
      getVersionKeysHelper.mock.calls[0]![0],
    ]);
    expect(getVersionKeysHelper.mock.calls[0]![0]).toEqual(
      expect.objectContaining({
        versionMode: "selected",
        versionValue: "16.0",
      }),
    );

    range.value = "1";
    controller.onVersionRangeInput();
    expect(selector.value).toBe("16.0");
    expect(renderCategoryFiltersCalls).toBe(1);
    expect(drawListCalls).toBe(1);

    range.value = "99";
    controller.onVersionRangeInput();
    expect(renderCategoryFiltersCalls).toBe(1);
    expect(drawListCalls).toBe(1);

    expect(createExplorerDataController).toHaveBeenCalledTimes(1);
    const dataOptions = createExplorerDataController.mock.calls[0]![0];
    expect(dataOptions.applyLoadedUrlState).toBe("apply-loaded-url-state");
    expect(dataOptions.buildRepresentatives).toBe("build-representatives");
    expect(dataOptions.developerModeEnabled).toBe("developer-mode-enabled");
    expect(dataOptions.drawList).toBeTypeOf("function");
    expect(dataOptions.getEmojiGenders).toBe("get-emoji-genders");
    expect(dataOptions.getVersionKeys).toBe(getVersionKeysHelper);
    expect(dataOptions.loadCatalog).toBe("load-catalog");
    expect(dataOptions.loadVersionCatalog).toBe("load-version-catalog");
    expect(dataOptions.openEmoji).toBe("open-emoji");
    expect(dataOptions.populateVersionSelector).toBe(
      populateVersionSelectorHelper,
    );
    expect(dataOptions.proposedVersionManifests()).toEqual([
      { version: "18.0" },
    ]);
    expect(dataOptions.syncVersionRange).toBe(syncVersionRangeHelper);
    expect(dataOptions.updateModifierAvailability).toBe(
      updateModifierAvailabilityHelper,
    );

    expect(controller.loadData()).toEqual(["load-data", [], dataOptions]);
    expect(controller.loadVersionData()).toEqual([
      "load-version-data",
      [],
      dataOptions,
    ]);
  });
});
