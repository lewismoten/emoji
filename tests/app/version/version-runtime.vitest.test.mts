import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loadExplorerCatalog = vi.fn((options: any) => [
  "catalog-result",
  options,
]);
const loadVersionCatalog = vi.fn((options: any) => [
  "version-catalog-result",
  options,
]);
const createVersionController = vi.fn((options: any) => ({
  kind: "version-controller",
  options,
}));

vi.mock("../../../src/explorer/catalog-loader.js", () => ({
  loadExplorerCatalog,
}));
vi.mock("../../../src/explorer/filters/version-data.js", () => ({
  loadVersionCatalog,
}));
vi.mock("../../../src/app/version/version-controller.js", () => ({
  createVersionController,
}));

describe("version runtime", () => {
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );

  beforeEach(async () => {
    vi.clearAllMocks();
    const state = await import("../../../src/state.js");
    state.allIds.set(["wave"]);
    state.byId.replace({ wave: { key: "wave" } } as any);
    state.emojiByKey.replace({ wave: "👋" });
    state.items.set([{ key: "wave" }] as any);
  });

  afterEach(() => {
    if (originalDocument)
      Object.defineProperty(globalThis, "document", originalDocument);
    else delete (globalThis as any).document;
  });

  it("builds version config from options and shared state", async () => {
    const { createVersionConfig, createVersionRuntime } =
      await import("../../../src/app/version/version-runtime.js");
    const state = await import("../../../src/state.js");

    const clickCalls: unknown[][] = [];
    const dialogViewCalls: unknown[][] = [];
    const options = {
      applyLoadedUrlState: () => "apply-loaded-url-state",
      buildRepresentatives: () => "build-representatives",
      developerModeEnabled: () => false,
      drawList: () => "draw-list",
      getEmojiGenders: (item: unknown) => ["emoji-genders", item],
      getExplorerSubGroup: () => "hands",
      getIntroducedVersion: (key: string) => `introduced:${key}`,
      groupSelector: () => "group-selector",
      genderCheckboxes: () => ["neutral"],
      genderFieldset: () => "gender-fieldset",
      hairCheckboxes: () => ["red"],
      hairFieldset: () => "hair-fieldset",
      isViteDevelopment: true,
      modifierFilters: () => "modifier-filters",
      onClick: (...args: unknown[]) => {
        clickCalls.push(args);
      },
      onGroupChange: () => "on-group-change",
      onSequenceTypeChange: () => "on-sequence-type-change",
      onSubGroupChange: () => "on-subgroup-change",
      rebuildCodePointLookup: () => "rebuild-codepoint-lookup",
      renderCategoryFilters: () => "render-category-filters",
      sequenceTypeSelector: () => "sequence-type-selector",
      setDialogView: (...args: unknown[]) => {
        dialogViewCalls.push(args);
      },
      skinToneCheckboxes: () => ["1F3FB"],
      skinToneFieldset: () => "skin-tone-fieldset",
      subGroupSelector: () => "subgroup-selector",
      translate: (key: string, fallback: string) => `${key}:${fallback}`,
      updateModifierArtwork: () => "update-modifier-artwork",
      updatePixelArtworkManifest: () => "update-pixel-artwork-manifest",
      versionModeSelector: () => ({ value: "selected" }),
      versionNext: () => "version-next",
      versionPrevious: () => "version-previous",
      versionRange: () => "version-range",
      versionRangeValue: () => "version-range-value",
      versionSelector: () => "version-selector",
    };

    const config = createVersionConfig(options);

    expect(config.applyLoadedUrlState()).toBe("apply-loaded-url-state");
    expect(config.buildRepresentatives()).toBe("build-representatives");
    expect(config.developerModeEnabled()).toBe(false);
    expect(config.drawList()).toBe("draw-list");
    expect(config.getEmojiGenders("wave")).toEqual(["emoji-genders", "wave"]);
    expect(config.getIntroducedVersion("wave")).toBe("introduced:wave");
    expect(config.groupSelector()).toBe("group-selector");
    expect(config.genderCheckboxes()).toEqual(["neutral"]);
    expect(config.genderFieldset()).toBe("gender-fieldset");
    expect(config.hairCheckboxes()).toEqual(["red"]);
    expect(config.hairFieldset()).toBe("hair-fieldset");
    expect(config.modifierFilters()).toBe("modifier-filters");
    expect(config.onGroupChange()).toBe("on-group-change");
    expect(config.onSequenceTypeChange()).toBe("on-sequence-type-change");
    expect(config.onSubGroupChange()).toBe("on-subgroup-change");
    expect(config.rebuildCodePointLookup()).toBe("rebuild-codepoint-lookup");
    expect(config.renderCategoryFilters()).toBe("render-category-filters");
    expect(config.sequenceTypeSelector()).toBe("sequence-type-selector");
    expect(config.skinToneCheckboxes()).toEqual(["1F3FB"]);
    expect(config.skinToneFieldset()).toBe("skin-tone-fieldset");
    expect(config.subGroupSelector()).toBe("subgroup-selector");
    expect(config.translate("released", "released")).toBe("released:released");
    expect(config.updateModifierArtwork()).toBe("update-modifier-artwork");
    expect(config.versionModeSelector().value).toBe("selected");
    expect(config.versionNext()).toBe("version-next");
    expect(config.versionPrevious()).toBe("version-previous");
    expect(config.versionRange()).toBe("version-range");
    expect(config.versionRangeValue()).toBe("version-range-value");
    expect(config.versionSelector()).toBe("version-selector");

    expect(config.loadCatalog()).toEqual([
      "catalog-result",
      loadExplorerCatalog.mock.calls[0]![0],
    ]);
    expect(loadExplorerCatalog.mock.calls[0]![0]).toEqual({
      getExplorerSubGroup: options.getExplorerSubGroup,
      isViteDevelopment: options.isViteDevelopment,
      updatePixelArtworkManifest: options.updatePixelArtworkManifest,
    });

    expect(config.loadVersionCatalog()).toEqual([
      "version-catalog-result",
      loadVersionCatalog.mock.calls[0]![0],
    ]);
    expect(loadVersionCatalog.mock.calls[0]![0].allIds()).toEqual(["wave"]);
    expect(loadVersionCatalog.mock.calls[0]![0].items()).toEqual([
      { key: "wave" },
    ]);
    expect(loadVersionCatalog.mock.calls[0]![0].getExplorerSubGroup).toBe(
      options.getExplorerSubGroup,
    );

    config.openEmoji("wave", true, undefined, "code");
    expect(clickCalls.at(-1)).toEqual([{ target: { id: "wave" } }, true]);
    expect(dialogViewCalls.at(-1)).toEqual(["code", false]);

    config.openEmoji("wave", false, undefined, "editor");
    expect(clickCalls.at(-1)).toEqual([{ target: { id: "wave" } }, false]);
    expect(dialogViewCalls).toEqual([["code", false]]);

    config.openEmoji("wave", true, undefined, "details");
    expect(clickCalls.at(-1)).toEqual([{ target: { id: "wave" } }, true]);
    expect(dialogViewCalls).toEqual([["code", false]]);

    config.openEmoji("wave", true, undefined, undefined);
    expect(clickCalls.at(-1)).toEqual([{ target: { id: "wave" } }, true]);
    expect(dialogViewCalls).toEqual([["code", false]]);

    const target = { innerText: "" };
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        getElementsByClassName(name: string) {
          expect(name).toBe("emoji-version");
          return [target];
        },
      },
    });
    config.setIntroducedVersion("Emoji 16.0");
    expect(target.innerText).toBe("Emoji 16.0");

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        getElementsByClassName() {
          return [];
        },
      },
    });
    expect(() => config.setIntroducedVersion("Emoji 17.0")).not.toThrow();

    const runtime = createVersionRuntime(options);
    expect(runtime).toEqual({
      kind: "version-controller",
      options: createVersionController.mock.calls[0]![0],
    });
    expect(createVersionController.mock.calls[0]![0].loadCatalog()).toEqual([
      "catalog-result",
      loadExplorerCatalog.mock.calls.at(-1)![0],
    ]);
    expect(
      createVersionController.mock.calls[0]![0].loadVersionCatalog(),
    ).toEqual([
      "version-catalog-result",
      loadVersionCatalog.mock.calls.at(-1)![0],
    ]);
    expect(createVersionController.mock.calls[0]![0].groupSelector()).toBe(
      "group-selector",
    );
    expect(
      createVersionController.mock.calls[0]![0].skinToneCheckboxes(),
    ).toEqual(["1F3FB"]);
    expect(state.byId.get()).toEqual({ wave: { key: "wave" } });
  });
});
