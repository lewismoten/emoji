import assert from "node:assert/strict";
import * as categoryVersion from "../../../src/explorer/category/category-version.js";
import * as categoryFilterLayout from "../../../src/explorer/category/category-version.js";

class FakeClassList {
  classes = new Set<string>();

  add(name: string) {
    this.classes.add(name);
  }

  remove(name: string) {
    this.classes.delete(name);
  }

  toggle(name: string, force?: boolean) {
    const shouldAdd = force === undefined ? !this.classes.has(name) : force;
    if (shouldAdd) this.classes.add(name);
    else this.classes.delete(name);
  }

  has(name: string) {
    return this.classes.has(name);
  }
}

class FakeField {
  hidden = false;
  classList = new FakeClassList();
}

class FakeOutput {
  value = "";
  classList = new FakeClassList();
}

class FakeButton {
  disabled = false;
}

class FakeRange {
  disabled = false;
  max = "";
  value = "";
  attributes = new Map<string, string>();
  styleCalls: Array<[string, string]> = [];
  style = {
    setProperty: (name: string, value: string) => {
      this.styleCalls.push([name, value]);
    },
  };

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
}

class FakeSelect {
  disabled = false;
  value = "";
  options: Array<{ value: string; text?: string }> = [];
  field = new FakeField();

  closest(selector: string) {
    return selector === ".filter-field" ? this.field : null;
  }
}

assert.equal(categoryVersion.versionSliderLabel("16.0", []), "Emoji 16.0");
assert.equal(
  categoryVersion.versionSliderLabel("18.0", [
    { version: "18.0", stage: "beta" },
  ]),
  "✨ Emoji 18.0 beta",
);
assert.equal(
  categoryVersion.versionSliderLabel("19.0", [
    { version: "19.0", status: "proposed" },
  ]),
  "✨ Emoji 19.0 proposed",
);
assert.equal(
  categoryVersion.versionSliderLabel("20.0", [{ version: "20.0" }]),
  "✨ Emoji 20.0 draft",
);

const syncSelect = new FakeSelect();
syncSelect.options = [
  { value: "15.0", text: "Emoji 15.0" },
  { value: "16.0", text: "Emoji 16.0" },
  { value: "18.0", text: "Emoji 18.0 beta" },
];
syncSelect.value = "18.0";
const syncRange = new FakeRange();
const syncOutput = new FakeOutput();
const previous = new FakeButton();
const next = new FakeButton();
let modifierUpdates = 0;
categoryVersion.syncVersionRange({
  proposedVersionManifests: [{ version: "18.0", stage: "beta" }],
  updateModifierAvailability: () => {
    modifierUpdates += 1;
  },
  versionNext: next,
  versionPrevious: previous,
  versionRange: syncRange,
  versionRangeValue: syncOutput,
  versionSelector: syncSelect as any,
});
assert.equal(syncSelect.field.classList.has("has-version-slider"), true);
assert.equal(syncRange.max, "2");
assert.equal(syncRange.value, "2");
assert.equal(syncRange.disabled, false);
assert.deepEqual(syncRange.styleCalls, [
  ["--slider-progress", "0%"],
  ["background", "#555555"],
]);
assert.equal(syncOutput.value, "✨ Emoji 18.0 beta");
assert.equal(syncOutput.classList.has("is-future"), true);
assert.equal(syncRange.getAttribute("aria-valuetext"), "Emoji 18.0 beta");
assert.equal(previous.disabled, false);
assert.equal(next.disabled, true);
assert.equal(modifierUpdates, 1);

const emptySelect = new FakeSelect();
emptySelect.disabled = true;
emptySelect.options = [];
const emptyRange = new FakeRange();
const emptyOutput = new FakeOutput();
const emptyPrevious = new FakeButton();
const emptyNext = new FakeButton();
categoryVersion.syncVersionRange({
  proposedVersionManifests: [],
  updateModifierAvailability: () => {},
  versionNext: emptyNext,
  versionPrevious: emptyPrevious,
  versionRange: emptyRange,
  versionRangeValue: emptyOutput,
  versionSelector: emptySelect as any,
});
assert.equal(emptyRange.max, "0");
assert.equal(emptyRange.value, "0");
assert.equal(emptyRange.disabled, true);
assert.equal(emptyOutput.value, "—");
assert.equal(emptyOutput.classList.has("is-future"), false);
assert.equal(emptyRange.getAttribute("aria-valuetext"), "—");
assert.equal(emptyPrevious.disabled, true);
assert.equal(emptyNext.disabled, true);

categoryVersion.syncVersionRange({
  proposedVersionManifests: [],
  updateModifierAvailability: () => {
    throw new Error("should not be called when range output is missing");
  },
  versionSelector: emptySelect as any,
});

const versionKeys = new Map<string, Set<string>>([
  ["15.0", new Set(["wave"])],
  ["16.0", new Set(["shakingFace"])],
  ["18.0", new Set(["draftFace"])],
]);
const releasedIds = new Set(["wave", "shakingFace"]);
assert.equal(
  categoryVersion.getVersionKeys({
    proposedVersionManifests: [],
    releasedIds,
    versionKeys: new Map(),
    versionManifests: [],
    versionMode: "cumulative",
    versionValue: "16.0",
  }),
  releasedIds,
);
assert.deepEqual(
  [...categoryVersion.getVersionKeys({
    proposedVersionManifests: [{ version: "18.0" }],
    releasedIds,
    versionKeys,
    versionManifests: [{ version: "15.0" }, { version: "16.0" }],
    versionMode: "selected",
    versionValue: "16.0",
  })],
  ["shakingFace"],
);
assert.deepEqual(
  [...categoryVersion.getVersionKeys({
    proposedVersionManifests: [{ version: "18.0" }],
    releasedIds,
    versionKeys,
    versionManifests: [{ version: "15.0" }, { version: "16.0" }],
    versionMode: "cumulative",
    versionValue: "18.0",
  })],
  ["wave", "shakingFace", "draftFace"],
);
assert.deepEqual(
  [...categoryVersion.getVersionKeys({
    proposedVersionManifests: [],
    releasedIds,
    versionKeys,
    versionManifests: [{ version: "15.0" }, { version: "16.0" }],
    versionMode: "cumulative",
    versionValue: "missing",
  })],
  [],
);

const byId = {
  womanRunning: { key: "womanRunning" },
  redHair: { key: "redHair" },
};
const genderCheckboxes = [{ checked: true }, { checked: false }];
const hairCheckboxes = [{ checked: true }];
const skinToneCheckboxes = [{ checked: true }];
const genderFieldset = new FakeField();
const hairFieldset = new FakeField();
const skinToneFieldset = new FakeField();
const modifierFilters = new FakeField();
categoryVersion.updateModifierAvailability({
  byId: {},
  genderCheckboxes: [],
  genderFieldset,
  getEmojiGenders: () => new Set(),
  hairCheckboxes: [],
  hairFieldset,
  modifierFilters,
  proposedVersionManifests: [],
  skinToneCheckboxes: [],
  skinToneFieldset,
  versionKeys: new Map(),
  versionManifests: [],
  versionValue: "15.0",
});
assert.equal(genderFieldset.hidden, false);
assert.equal(hairFieldset.hidden, false);
assert.equal(skinToneFieldset.hidden, false);
assert.equal(modifierFilters.hidden, false);
assert.equal(modifierFilters.classList.has("has-single"), false);

const availabilityVersionKeys = new Map<string, Set<string>>([
  ["1.0", new Set(["womanRunning"])],
  ["2.0", new Set(["waveSkinTone"] )],
  ["3.0", new Set(["redHair"])],
]);
categoryVersion.updateModifierAvailability({
  byId,
  genderCheckboxes,
  genderFieldset,
  getEmojiGenders: (item: any) =>
    item?.key === "womanRunning" ? new Set(["female"]) : new Set(),
  hairCheckboxes,
  hairFieldset,
  modifierFilters,
  proposedVersionManifests: [],
  skinToneCheckboxes,
  skinToneFieldset,
  versionKeys: availabilityVersionKeys,
  versionManifests: [
    { version: "1.0" },
    { version: "2.0" },
    { version: "3.0" },
  ],
  versionValue: "1.0",
});
assert.equal(genderFieldset.hidden, false);
assert.equal(skinToneFieldset.hidden, true);
assert.equal(hairFieldset.hidden, true);
assert.equal(skinToneCheckboxes[0].checked, false);
assert.equal(hairCheckboxes[0].checked, false);
assert.equal(modifierFilters.hidden, false);
assert.equal(modifierFilters.classList.has("has-single"), true);

skinToneCheckboxes[0].checked = true;
hairCheckboxes[0].checked = true;
genderCheckboxes[0].checked = true;
categoryVersion.updateModifierAvailability({
  byId,
  genderCheckboxes,
  genderFieldset,
  getEmojiGenders: (item: any) =>
    item?.key === "womanRunning" ? new Set(["female"]) : new Set(),
  hairCheckboxes,
  hairFieldset,
  modifierFilters,
  proposedVersionManifests: [{ version: "4.0" }],
  skinToneCheckboxes,
  skinToneFieldset,
  versionKeys: availabilityVersionKeys,
  versionManifests: [
    { version: "1.0" },
    { version: "2.0" },
    { version: "3.0" },
  ],
  versionValue: "4.0",
});
assert.equal(genderFieldset.hidden, false);
assert.equal(skinToneFieldset.hidden, false);
assert.equal(hairFieldset.hidden, false);
assert.equal(modifierFilters.hidden, false);
assert.equal(modifierFilters.classList.has("has-single"), false);

const noModifiersField = new FakeField();
const noGenderCheckboxes = [{ checked: true }];
categoryVersion.updateModifierAvailability({
  byId: {},
  genderCheckboxes: noGenderCheckboxes,
  genderFieldset: new FakeField(),
  getEmojiGenders: () => new Set(),
  hairCheckboxes: [{ checked: true }],
  hairFieldset: new FakeField(),
  modifierFilters: noModifiersField,
  proposedVersionManifests: [],
  skinToneCheckboxes: [{ checked: true }],
  skinToneFieldset: new FakeField(),
  versionKeys: new Map([["1.0", new Set(["plain"])]]),
  versionManifests: [{ version: "1.0" }],
  versionValue: "1.0",
});
assert.equal(noModifiersField.hidden, true);

assert.equal(
  categoryVersion.renderCategoryFilterLayout,
  categoryFilterLayout.renderCategoryFilterLayout,
);
assert.equal(
  categoryVersion.updateAvailableCategories,
  categoryFilterLayout.updateAvailableCategories,
);
