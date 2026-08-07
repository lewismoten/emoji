import { afterEach, describe, expect, it, vi } from "vitest";

import { createExplorerDataController } from "../../../src/app/data/explorer-data-controller.js";

describe("createExplorerDataController", () => {
  afterEach(async () => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    const state = await import("../../../src/state.js");
    state.byId.replace({} as any);
    state.currentEmojiKey.set("");
    state.proposedVersionManifests.set([] as any);
    state.releasedIds.replace(new Set());
    state.selectedSearchLocale.set("");
    state.versionDataPromise.set(undefined);
    state.versionKeys.replace(new Map());
    state.versionManifests.set([] as any);
    state.allIds.set([]);
    state.items.set([] as any);
  });

  it("coordinates catalog load, version load, and range updates through shared state", async () => {
    const state = await import("../../../src/state.js");
    state.byId.replace({} as any);
    state.currentEmojiKey.set("");
    state.proposedVersionManifests.set([] as any);
    state.releasedIds.replace(new Set<string>());
    state.selectedSearchLocale.set("en");
    state.versionDataPromise.set(undefined);
    state.versionKeys.replace(new Map<string, Set<string>>());
    state.versionManifests.set([] as any);
    state.allIds.set([]);
    state.items.set([] as any);

    const groupSelector = {
      listeners: [] as Array<[string, unknown]>,
      addEventListener(type: string, handler: unknown) {
        this.listeners.push([type, handler]);
      },
    };
    const subGroupSelector = {
      listeners: [] as Array<[string, unknown]>,
      addEventListener(type: string, handler: unknown) {
        this.listeners.push([type, handler]);
      },
    };
    const sequenceTypeSelector = {
      listeners: [] as Array<[string, unknown]>,
      addEventListener(type: string, handler: unknown) {
        this.listeners.push([type, handler]);
      },
    };
    const versionSelector = {
      disabled: false,
      options: [{ value: "15.0" }, { value: "16.0" }],
      value: "15.0",
    };
    const versionModeSelector = {
      disabled: false,
      value: "",
    };
    const versionRange = { value: "1" };
    const versionRangeValue = { value: "" };
    const versionNext = { disabled: false };
    const versionPrevious = { disabled: false };
    const calls: string[] = [];

    const controller = createExplorerDataController({
      applyLoadedUrlState() {
        calls.push("applyLoadedUrlState");
      },
      buildRepresentatives() {
        calls.push("buildRepresentatives");
      },
      developerModeEnabled: () => true,
      drawList() {
        calls.push("drawList");
      },
      genderCheckboxes: () => ["gender"],
      genderFieldset: () => "genderFieldset",
      getEmojiGenders: "getEmojiGenders",
      getIntroducedVersion(key: string) {
        return `introduced:${key}`;
      },
      groupSelector: () => groupSelector as any,
      hairCheckboxes: () => ["hair"],
      hairFieldset: () => "hairFieldset",
      loadCatalog: async () => ({
        allIds: ["alpha"],
        byId: { alpha: {} },
        emojiByKey: {},
        groupedKeys: {},
        groups: [],
        items: [],
        releasedIds: new Set(),
        subGroups: {},
      }),
      loadVersionCatalog: async () => ({
        proposed: [{ version: "18.0" }],
        released: [{ version: "16.0" }],
        versionKeys: new Map([["16.0", new Set(["alpha"])]]),
      }),
      modifierFilters: () => "modifierFilters",
      onGroupChange: "onGroupChange",
      onSequenceTypeChange: "onSequenceTypeChange",
      onSubGroupChange: "onSubGroupChange",
      openEmoji(key: string, open: boolean) {
        calls.push(`openEmoji:${key}:${open}`);
      },
      populateVersionSelector(options: any) {
        calls.push(`populateVersionSelector:${options.selectedLocale}`);
      },
      rebuildCodePointLookup() {
        calls.push("rebuildCodePointLookup");
      },
      renderCategoryFilters() {
        calls.push("renderCategoryFilters");
      },
      setIntroducedVersion(value: string) {
        calls.push(`setIntroducedVersion:${value}`);
      },
      sequenceTypeSelector: () => sequenceTypeSelector as any,
      skinToneCheckboxes: () => ["skin"],
      skinToneFieldset: () => "skinToneFieldset",
      subGroupSelector: () => subGroupSelector as any,
      syncVersionRange(options: any) {
        calls.push(`syncVersionRange:${options.versionSelector.value}`);
        options.versionRangeValue.value = options.versionSelector.value;
        options.updateModifierAvailability();
      },
      translate: (_key: string, fallback: string) => fallback,
      updateModifierArtwork() {
        calls.push("updateModifierArtwork");
      },
      updateModifierAvailability(options: any) {
        calls.push(`updateModifierAvailability:${options.versionValue}`);
      },
      versionModeSelector: () => versionModeSelector as any,
      versionNext: () => versionNext as any,
      versionPrevious: () => versionPrevious as any,
      versionRange: () => versionRange as any,
      versionRangeValue: () => versionRangeValue as any,
      versionSelector: () => versionSelector as any,
    });

    controller.populateVersionSelector();
    expect(calls[0]).toBe("populateVersionSelector:en");

    controller.updateModifierAvailability();
    expect(calls[1]).toBe("updateModifierAvailability:15.0");

    controller.syncVersionRange();
    expect(calls[2]).toBe("syncVersionRange:15.0");
    expect(calls[3]).toBe("updateModifierAvailability:15.0");
    expect(versionRangeValue.value).toBe("15.0");

    await controller.loadData();
    expect(state.allIds.get()).toEqual(["alpha"]);
    expect(versionModeSelector.value).toBe("");
    expect(groupSelector.listeners[0]).toEqual(["change", "onGroupChange"]);
    expect(subGroupSelector.listeners[0]).toEqual([
      "change",
      "onSubGroupChange",
    ]);
    expect(sequenceTypeSelector.listeners[0]).toEqual([
      "change",
      "onSequenceTypeChange",
    ]);
    expect(calls).toContain("openEmoji:clinkingBeerMugs:false");
    expect(calls).toContain("drawList");

    const samePromise = controller.loadVersionData();
    expect(Boolean(state.versionDataPromise.get())).toBe(true);
    await samePromise;
    expect(state.versionManifests.get()).toEqual([{ version: "16.0" }]);
    expect(state.proposedVersionManifests.get()).toEqual([{ version: "18.0" }]);
    expect(calls.includes("setIntroducedVersion:introduced:alpha")).toBe(false);

    state.currentEmojiKey.set("alpha");
    state.versionDataPromise.set(undefined);
    await controller.loadVersionData();
    expect(calls.includes("setIntroducedVersion:introduced:alpha")).toBe(true);

    versionRange.value = "1";
    versionSelector.value = "15.0";
    controller.onVersionRangeInput();
    expect(versionSelector.value).toBe("16.0");
    expect(calls).toContain("drawList");

    versionRange.value = "9";
    versionSelector.value = "16.0";
    const callCountBeforeMissingOption = calls.length;
    controller.onVersionRangeInput();
    expect(versionSelector.value).toBe("16.0");
    expect(calls.length).toBe(callCountBeforeMissingOption);

    expect([...controller.getVersionKeys()]).toEqual(["alpha"]);
  });

  it("disables version controls and warns when version loading fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const state = await import("../../../src/state.js");
    state.byId.replace({} as any);
    state.currentEmojiKey.set("");
    state.proposedVersionManifests.set([] as any);
    state.releasedIds.replace(new Set<string>());
    state.selectedSearchLocale.set("");
    state.versionDataPromise.set(undefined);
    state.versionKeys.replace(new Map<string, Set<string>>());
    state.versionManifests.set([] as any);

    const failingVersionModeSelector = { disabled: false, value: "" };
    const failingVersionSelector = { disabled: false, options: [], value: "" };

    const failingController = createExplorerDataController({
      applyLoadedUrlState() {},
      buildRepresentatives() {},
      developerModeEnabled: () => false,
      drawList() {},
      genderCheckboxes: () => [],
      genderFieldset: () => null,
      getEmojiGenders: null,
      getIntroducedVersion: () => "—",
      groupSelector: () => ({ addEventListener() {} }) as any,
      hairCheckboxes: () => [],
      hairFieldset: () => null,
      loadCatalog: async () => ({
        allIds: [],
        byId: {},
        emojiByKey: {},
        groupedKeys: {},
        groups: [],
        items: [],
        releasedIds: new Set(),
        subGroups: {},
      }),
      loadVersionCatalog: async () => {
        throw new Error("boom");
      },
      modifierFilters: () => null,
      onGroupChange: null,
      onSequenceTypeChange: null,
      onSubGroupChange: null,
      openEmoji() {},
      populateVersionSelector() {},
      rebuildCodePointLookup() {},
      renderCategoryFilters() {},
      setIntroducedVersion() {},
      sequenceTypeSelector: () => ({ addEventListener() {} }) as any,
      skinToneCheckboxes: () => [],
      skinToneFieldset: () => null,
      subGroupSelector: () => ({ addEventListener() {} }) as any,
      syncVersionRange() {},
      translate: (_key: string, fallback: string) => fallback,
      updateModifierArtwork() {},
      updateModifierAvailability() {},
      versionModeSelector: () => failingVersionModeSelector as any,
      versionNext: () => ({}) as any,
      versionPrevious: () => ({}) as any,
      versionRange: () => ({ value: "0" }) as any,
      versionRangeValue: () => ({ value: "" }) as any,
      versionSelector: () => failingVersionSelector as any,
    });

    await failingController.loadVersionData();
    expect(failingVersionModeSelector.disabled).toBe(true);
    expect(failingVersionSelector.disabled).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      "Version filters unavailable",
      expect.any(Error),
    );
  });
});
