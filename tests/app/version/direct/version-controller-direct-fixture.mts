import assert from "node:assert/strict";
import { createVersionController } from "../../../../src/app/version/version-controller.js";

type OptionLike = { value: string; text?: string };

export function createVersionControllerFixture() {
  const createdOptions: Array<OptionLike> = [];
  globalThis.document = {
    createElement(tagName: string) {
      assert.equal(tagName, "option");
      const option: OptionLike = { value: "", text: "" };
      createdOptions.push(option);
      return option;
    },
  } as unknown as Document;

  const selector = {
    disabled: false,
    value: "16.0",
    options: [
      { value: "15.0", text: "Emoji 15.0" },
      { value: "16.0", text: "Emoji 16.0" },
      { value: "18.0", text: "Emoji 18.0" },
    ],
    appended: [] as OptionLike[],
    replaceChildren() {
      this.appended = [];
    },
    appendChild(option: OptionLike) {
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
      this[`${name}Value` as "aria-valuetextValue"] = value;
    },
    style: {
      setProperty(name: string, value: string) {
        sliderStyles.set(name, value);
      },
    },
  } as {
    disabled: boolean;
    max: string;
    value: string;
    "aria-valuetextValue"?: string;
    setAttribute(name: string, value: string): void;
    style: { setProperty(name: string, value: string): void };
  };

  const versionRangeValue = {
    value: "",
    toggled: [] as Array<[string, boolean]>,
    classList: {
      toggle(name: string, force?: boolean) {
        versionRangeValue.toggled.push([name, Boolean(force)]);
      },
    },
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

  const genderFieldset = { hidden: false };
  const hairFieldset = { hidden: false };
  const skinToneFieldset = { hidden: false };
  const groupSelector = {
    addEventListenerCalls: [] as string[],
    addEventListener(name: string) {
      this.addEventListenerCalls.push(name);
    },
  };
  const subGroupSelector = {
    addEventListenerCalls: [] as string[],
    addEventListener(name: string) {
      this.addEventListenerCalls.push(name);
    },
  };
  const sequenceTypeSelector = {
    addEventListenerCalls: [] as string[],
    addEventListener(name: string) {
      this.addEventListenerCalls.push(name);
    },
  };
  const versionModeSelector = { value: "selected", disabled: false };

  const state: any = {
    allIds: ["wave"],
    byId: { adult: { genders: ["neutral"] }, wave: { key: "wave" } },
    currentEmojiKey: "wave",
    emojiByKey: { wave: "👋" },
    items: [],
    proposedVersionManifests: [
      {
        version: "18.0",
        stage: "beta",
        expectedRelease: "2026-09",
        file: "proposed/18.0.json",
      },
    ],
    releasedIds: new Set(["wave"]),
    selectedSearchLocale: "en",
    versionDataPromise: null as Promise<unknown> | null,
    versionKeys: new Map<string, Set<string>>([
      ["15.0", new Set(["wave"])],
      ["16.0", new Set(["adult", "wave"])],
      ["18.0", new Set(["adult", "wave"])],
    ]),
    versionManifests: [
      { version: "15.0", released: "2022-09-13", file: "15.0.json" },
      { version: "16.0", released: "2024-09-10", file: "16.0.json" },
    ],
  };

  let renderCategoryFiltersCalls = 0;
  let drawListCalls = 0;
  let rebuildCodePointLookupCalls = 0;
  let updateModifierArtworkCalls = 0;
  let buildRepresentativesCalls = 0;
  let applyLoadedUrlStateCalls = 0;
  const openedEmoji: Array<[string, boolean]> = [];
  const introducedVersions: string[] = [];

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
    genderCheckboxes() {
      return genderCheckboxes;
    },
    genderFieldset() {
      return genderFieldset;
    },
    getEmojiGenders(item: { genders?: string[] }) {
      return new Set(item.genders ?? []);
    },
    getIntroducedVersion() {
      return "16.0";
    },
    groupSelector() {
      return groupSelector;
    },
    hairCheckboxes() {
      return hairCheckboxes;
    },
    hairFieldset() {
      return hairFieldset;
    },
    loadCatalog: async () => ({ added: true }),
    loadVersionCatalog: async () => ({
      proposed: [
        {
          version: "18.0",
          stage: "beta",
          expectedRelease: "2026-09",
          file: "proposed/18.0.json",
        },
      ],
      released: [
        { version: "15.0", released: "2022-09-13", file: "15.0.json" },
        { version: "16.0", released: "2024-09-10", file: "16.0.json" },
      ],
      versionKeys: new Map<string, Set<string>>([
        ["15.0", new Set(["wave"])],
        ["16.0", new Set(["adult", "wave"])],
        ["18.0", new Set(["adult", "wave"])],
      ]),
    }),
    modifierFilters() {
      return modifierFilters;
    },
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
    sequenceTypeSelector() {
      return sequenceTypeSelector;
    },
    setIntroducedVersion(value: string) {
      introducedVersions.push(value);
    },
    skinToneCheckboxes() {
      return skinToneCheckboxes;
    },
    skinToneFieldset() {
      return skinToneFieldset;
    },
    state() {
      return state;
    },
    subGroupSelector() {
      return subGroupSelector;
    },
    translate(key: string, fallback: string) {
      return `${key}:${fallback}`;
    },
    updateModifierArtwork() {
      updateModifierArtworkCalls += 1;
    },
    versionModeSelector() {
      return versionModeSelector;
    },
    versionNext() {
      return nextButton;
    },
    versionPrevious() {
      return previousButton;
    },
    versionRange() {
      return versionRange;
    },
    versionRangeValue() {
      return versionRangeValue;
    },
    versionSelector() {
      return selector;
    },
  });

  return {
    applyLoadedUrlStateCalls: () => applyLoadedUrlStateCalls,
    buildRepresentativesCalls: () => buildRepresentativesCalls,
    controller,
    createdOptions,
    drawListCalls: () => drawListCalls,
    genderCheckboxes,
    groupSelector,
    hairCheckboxes,
    introducedVersions,
    modifierClassOperations,
    modifierFilters,
    nextButton,
    openedEmoji,
    previousButton,
    rebuildCodePointLookupCalls: () => rebuildCodePointLookupCalls,
    renderCategoryFiltersCalls: () => renderCategoryFiltersCalls,
    selector,
    sequenceTypeSelector,
    skinToneCheckboxes,
    sliderStyles,
    state,
    subGroupSelector,
    updateModifierArtworkCalls: () => updateModifierArtworkCalls,
    versionModeSelector,
    versionRange,
    versionRangeValue,
  };
}
