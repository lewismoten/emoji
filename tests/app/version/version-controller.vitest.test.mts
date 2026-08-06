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

  it("handles direct selector layout and load behavior", async () => {
    const { createVersionController } =
      await import("../../../src/app/version/version-controller.js");
    const state = await import("../../../src/state.js");

    state.proposedVersionManifests.set([
      {
        version: "18.0",
        stage: "beta",
        expectedRelease: "2026-09",
        file: "proposed/18.0.json",
      },
    ] as any);
    state.versionManifests.set([
      { version: "15.0", released: "2022-09-13", file: "15.0.json" },
      { version: "16.0", released: "2024-09-10", file: "16.0.json" },
    ] as any);
    state.versionKeys.replace(
      new Map<string, Set<string>>([
        ["15.0", new Set(["wave"])],
        ["16.0", new Set(["adult", "wave"])],
        ["18.0", new Set(["adult", "wave"])],
      ]),
    );
    state.releasedIds.replace(new Set(["wave"]));
    state.byId.replace({ adult: { genders: ["neutral"] }, wave: { key: "wave" } } as any);

    const createdOptions: Array<{ value: string; text?: string }> = [];
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        createElement(tagName: string) {
          expect(tagName).toBe("option");
          const option = { value: "", text: "" };
          createdOptions.push(option);
          return option;
        },
      },
    });

    const selector = {
      disabled: false,
      value: "16.0",
      options: [
        { value: "15.0", text: "Emoji 15.0" },
        { value: "16.0", text: "Emoji 16.0" },
        { value: "18.0", text: "Emoji 18.0" },
      ],
      appended: [] as Array<{ value: string; text?: string }>,
      replaceChildren() {
        this.appended = [];
      },
      appendChild(option: { value: string; text?: string }) {
        this.appended.push(option);
      },
      closest() {
        return { classList: { add() {} } };
      },
    };
    const sliderStyles = new Map<string, string>();
    const versionRange = {
      disabled: false,
      max: "",
      value: "2",
      setAttribute(name: string, value: string) {
        (this as any)[`${name}Value`] = value;
      },
      style: {
        setProperty(name: string, value: string) {
          sliderStyles.set(name, value);
        },
      },
    };
    const versionRangeValue = {
      value: "",
      classList: { toggle() {} },
    };
    const previousButton = { disabled: false };
    const nextButton = { disabled: false };
    const genderCheckboxes = [{ checked: true }];
    const hairCheckboxes = [{ checked: true }];
    const skinToneCheckboxes = [{ checked: true }];
    const modifierClassOperations: string[] = [];
    const modifierFilters = {
      hidden: false,
      classList: {
        add(name: string) {
          modifierClassOperations.push(`add:${name}`);
        },
        remove(name: string) {
          modifierClassOperations.push(`remove:${name}`);
        },
        toggle(name: string, force?: boolean) {
          modifierClassOperations.push(`toggle:${name}:${String(force)}`);
        },
      },
    };
    const groupSelector = { addEventListener: vi.fn() };
    const subGroupSelector = { addEventListener: vi.fn() };
    const sequenceTypeSelector = { addEventListener: vi.fn() };
    const versionModeSelector = { value: "selected", disabled: false };

    let renderCategoryFiltersCalls = 0;
    let drawListCalls = 0;
    let rebuildCodePointLookupCalls = 0;
    let updateModifierArtworkCalls = 0;
    let buildRepresentativesCalls = 0;
    let applyLoadedUrlStateCalls = 0;
    const openedEmoji: Array<[string, boolean]> = [];
    const introducedVersions: string[] = [];

    const loadData = vi.fn(async () => {
      (state as any).added = true;
      rebuildCodePointLookupCalls += 2;
      updateModifierArtworkCalls += 2;
      buildRepresentativesCalls += 2;
      applyLoadedUrlStateCalls += 2;
      groupSelector.addEventListener("change");
      subGroupSelector.addEventListener("change");
      sequenceTypeSelector.addEventListener("change");
    });
    const loadVersionData = vi.fn(async () => {
      if (!(state as any).versionDataPromise) {
        (state as any).versionDataPromise = Promise.resolve("loaded");
        introducedVersions.push("16.0");
      }
      await (state as any).versionDataPromise;
    });
    createExplorerDataController.mockReturnValueOnce({
      loadData,
      loadVersionData,
    } as any);

    updateModifierAvailabilityHelper.mockImplementationOnce((options: any) => {
      options.hairCheckboxes.forEach((checkbox: any) => {
        checkbox.checked = false;
      });
      options.skinToneCheckboxes.forEach((checkbox: any) => {
        checkbox.checked = false;
      });
      options.modifierFilters.hidden = false;
      options.modifierFilters.classList.toggle("has-single", true);
      return ["update-modifier-availability-result", options];
    });
    getVersionKeysHelper.mockImplementation((options: any) => {
      const keys = options.versionKeys.get(options.versionValue) ?? new Set<string>();
      if (options.versionMode === "selected") return new Set(keys);
      const versions = [...options.versionKeys.keys()].filter(
        (version) => version <= options.versionValue,
      );
      return versions.reduce((all, version) => {
        for (const key of options.versionKeys.get(version) ?? []) all.add(key);
        return all;
      }, new Set<string>());
    });
    versionSliderLabelHelper.mockImplementation(
      (version: string, manifests: Array<any>) => {
        const proposed = manifests.find((item) => item.version === version);
        return proposed ? `✨ Emoji ${version} beta` : `Emoji ${version}`;
      },
    );
    populateVersionSelectorHelper.mockImplementation((options: any) => {
      options.selector.replaceChildren();
      for (const item of options.released) {
        const option = document.createElement("option");
        option.value = item.version;
        option.text = `Emoji ${item.version} (released:released ${item.released})`;
        options.selector.appendChild(option);
      }
      for (const item of options.proposed) {
        const option = document.createElement("option");
        option.value = item.version;
        option.text = `Emoji ${item.version} (${item.stage} · expected:expected ${item.expectedRelease})`;
        options.selector.appendChild(option);
      }
      options.selector.value = "16.0";
      options.syncRange();
      return ["populate-version-selector-result", options];
    });
    syncVersionRangeHelper.mockImplementation((options: any) => {
      const selectedIndex = options.versionSelector.options.findIndex(
        (option: any) => option.value === options.versionSelector.value,
      );
      if (selectedIndex < 0) return ["sync-version-range-result", options];
      options.versionRange.max = String(options.versionSelector.options.length - 1);
      options.versionRange.value = String(selectedIndex);
      const label = options.versionSelector.options[selectedIndex]?.value === "18.0"
        ? "Emoji 18.0"
        : `Emoji ${options.versionSelector.options[selectedIndex]?.value}`;
      options.versionRangeValue.value = label;
      options.versionRange.setAttribute("aria-valuetext", label);
      options.versionPrevious.disabled = false;
      options.versionNext.disabled = false;
      options.versionRange.style.setProperty("--slider-progress", "0%");
      options.versionRange.style.setProperty("background", "#555555");
      options.updateModifierAvailability();
      return ["sync-version-range-result", options];
    });

    const controller = createVersionController({
      applyLoadedUrlState() {
        applyLoadedUrlStateCalls += 1;
      },
      buildRepresentatives() {
        buildRepresentativesCalls += 1;
      },
      developerModeEnabled() {
        return true;
      },
      drawList() {
        drawListCalls += 1;
      },
      genderCheckboxes: () => genderCheckboxes,
      genderFieldset: () => ({ hidden: false }),
      getEmojiGenders(item: { genders?: string[] }) {
        return new Set(item.genders ?? []);
      },
      getIntroducedVersion() {
        return "16.0";
      },
      groupSelector: () => groupSelector,
      hairCheckboxes: () => hairCheckboxes,
      hairFieldset: () => ({ hidden: false }),
      loadCatalog: async () => ({ added: true }),
      loadVersionCatalog: async () => ({}),
      modifierFilters: () => modifierFilters,
      onGroupChange() {},
      onSequenceTypeChange() {},
      onSubGroupChange() {},
      openEmoji(key: string, copy: boolean) {
        openedEmoji.push([key, copy]);
      },
      rebuildCodePointLookup() {
        rebuildCodePointLookupCalls += 1;
      },
      renderCategoryFilters() {
        renderCategoryFiltersCalls += 1;
      },
      sequenceTypeSelector: () => sequenceTypeSelector,
      setIntroducedVersion(value: string) {
        introducedVersions.push(value);
      },
      skinToneCheckboxes: () => skinToneCheckboxes,
      skinToneFieldset: () => ({ hidden: false }),
      subGroupSelector: () => subGroupSelector,
      translate(key: string, fallback: string) {
        return `${key}:${fallback}`;
      },
      updateModifierArtwork() {
        updateModifierArtworkCalls += 1;
      },
      versionModeSelector: () => versionModeSelector,
      versionNext: () => nextButton,
      versionPrevious: () => previousButton,
      versionRange: () => versionRange as any,
      versionRangeValue: () => versionRangeValue as any,
      versionSelector: () => selector as any,
    });

    try {
      const selectedKeys = controller.getVersionKeys();
      expect(controller.versionSliderLabel("16.0")).toBe("Emoji 16.0");
      expect(controller.versionSliderLabel("18.0")).toBe("✨ Emoji 18.0 beta");

      controller.populateVersionSelector();
      expect(selector.appended).toHaveLength(3);
      expect(selector.appended[0]?.text).toBe(
        "Emoji 15.0 (released:released 2022-09-13)",
      );
      expect(selector.appended[2]?.text).toBe(
        "Emoji 18.0 (beta · expected:expected 2026-09)",
      );
      expect(selector.value).toBe("16.0");
      expect(versionRange.max).toBe("2");
      expect(versionRange.value).toBe("1");
      expect(versionRangeValue.value).toBe("Emoji 16.0");
      expect((versionRange as any)["aria-valuetextValue"]).toBe("Emoji 16.0");
      expect(previousButton.disabled).toBe(false);
      expect(nextButton.disabled).toBe(false);
      expect(sliderStyles.get("--slider-progress")).toBe("0%");
      expect(sliderStyles.get("background")).toBe("#555555");
      expect([...selectedKeys]).toEqual(["adult", "wave"]);

      versionModeSelector.value = "through";
      selector.value = "18.0";
      expect([...controller.getVersionKeys()]).toEqual(["wave", "adult"]);

      controller.updateModifierAvailability();
      expect(hairCheckboxes[0]?.checked).toBe(false);
      expect(skinToneCheckboxes[0]?.checked).toBe(false);
      expect(modifierFilters.hidden).toBe(false);
      expect(modifierClassOperations).toContain("toggle:has-single:true");

      selector.value = "15.0";
      versionRange.value = "2";
      controller.onVersionRangeInput();
      expect(selector.value).toBe("18.0");
      expect(renderCategoryFiltersCalls).toBeGreaterThanOrEqual(1);
      expect(drawListCalls).toBeGreaterThanOrEqual(1);

      versionRange.value = "99";
      controller.onVersionRangeInput();
      expect(selector.value).toBe("18.0");

      await controller.loadData();
      expect((state as any).added).toBe(true);
      expect(rebuildCodePointLookupCalls).toBeGreaterThanOrEqual(2);
      expect(updateModifierArtworkCalls).toBeGreaterThanOrEqual(2);
      expect(buildRepresentativesCalls).toBeGreaterThanOrEqual(2);
      expect(applyLoadedUrlStateCalls).toBeGreaterThanOrEqual(2);
      expect(openedEmoji).toEqual([]);
      expect(groupSelector.addEventListener).toHaveBeenCalledWith("change");
      expect(subGroupSelector.addEventListener).toHaveBeenCalledWith("change");
      expect(sequenceTypeSelector.addEventListener).toHaveBeenCalledWith("change");
      expect(versionModeSelector.value).toBe("through");

      const firstPromise = controller.loadVersionData();
      const secondPromise = controller.loadVersionData();
      expect((state as any).versionDataPromise).not.toBeNull();
      await firstPromise;
      await secondPromise;
    } finally {
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      } else {
        delete (globalThis as any).document;
      }
    }
  });
});
