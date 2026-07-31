import assert from "node:assert/strict";
import { createExplorerDataController } from "../../../src/app/data/explorer-data-controller.js";

const warnings: any[][] = [];
const originalWarn = console.warn;
console.warn = (...args: any[]) => warnings.push(args);

try {
  const state: any = {
    byId: {},
    currentEmojiKey: "",
    proposedVersionManifests: [],
    releasedIds: new Set<string>(),
    selectedSearchLocale: "en",
    versionDataPromise: undefined as Promise<unknown> | undefined,
    versionKeys: new Map<string, Set<string>>(),
    versionManifests: [],
  };
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
    getVersionKeys(options: any) {
      calls.push(`getVersionKeys:${options.versionValue}`);
      return ["alpha"];
    },
    groupSelector: () => groupSelector as any,
    hairCheckboxes: () => ["hair"],
    hairFieldset: () => "hairFieldset",
    loadCatalog: async () => ({ allIds: ["alpha"], byId: { alpha: {} } }),
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
    state: () => state,
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
  assert.equal(calls[0], "populateVersionSelector:en");

  controller.updateModifierAvailability();
  assert.equal(calls[1], "updateModifierAvailability:15.0");

  controller.syncVersionRange();
  assert.equal(calls[2], "syncVersionRange:15.0");
  assert.equal(calls[3], "updateModifierAvailability:15.0");
  assert.equal(versionRangeValue.value, "15.0");

  await controller.loadData();
  assert.deepEqual(state.allIds, ["alpha"]);
  assert.equal(versionModeSelector.value, "through");
  assert.deepEqual(groupSelector.listeners[0], ["change", "onGroupChange"]);
  assert.deepEqual(subGroupSelector.listeners[0], [
    "change",
    "onSubGroupChange",
  ]);
  assert.deepEqual(sequenceTypeSelector.listeners[0], [
    "change",
    "onSequenceTypeChange",
  ]);
  assert.equal(calls.includes("openEmoji:clinkingBeerMugs:false"), true);
  assert.equal(calls.includes("drawList"), true);

  const samePromise = controller.loadVersionData();
  assert.equal(Boolean(state.versionDataPromise), true);
  await samePromise;
  assert.deepEqual(state.versionManifests, [{ version: "16.0" }]);
  assert.deepEqual(state.proposedVersionManifests, [{ version: "18.0" }]);
  assert.equal(calls.includes("setIntroducedVersion:introduced:alpha"), false);

  versionRange.value = "1";
  versionSelector.value = "15.0";
  controller.onVersionRangeInput();
  assert.equal(versionSelector.value, "16.0");
  assert.equal(calls.includes("drawList"), true);

  assert.deepEqual(controller.getVersionKeys(), ["alpha"]);

  const failingState: any = {
    byId: {},
    currentEmojiKey: "",
    proposedVersionManifests: [],
    releasedIds: new Set<string>(),
    selectedSearchLocale: "",
    versionDataPromise: undefined as Promise<unknown> | undefined,
    versionKeys: new Map<string, Set<string>>(),
    versionManifests: [],
  };
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
    getVersionKeys: () => [],
    groupSelector: () => ({ addEventListener() {} }) as any,
    hairCheckboxes: () => [],
    hairFieldset: () => null,
    loadCatalog: async () => ({ allIds: [] }),
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
    state: () => failingState,
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
  assert.equal(failingVersionModeSelector.disabled, true);
  assert.equal(failingVersionSelector.disabled, true);
  assert.equal(warnings.at(-1)?.[0], "Version filters unavailable");
} finally {
  console.warn = originalWarn;
}
