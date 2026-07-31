import assert from "node:assert/strict";
import {
  renderCategoryFilterLayout,
  updateAvailableCategories,
} from "../../src/explorer/category/category-filter-layout.js";

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

const items = [
  {
    group: "Smileys & Emotion",
    key: "smile",
    sequenceType: "single",
    unicodeSubGroup: "face-smiling",
  },
  {
    group: "People & Body",
    key: "runner",
    sequenceType: "zwj",
    unicodeSubGroup: "person-activity",
  },
  {
    group: "People & Body",
    key: "walker",
    sequenceType: "single",
    unicodeSubGroup: "person-activity",
  },
];

const groups = ["Smileys & Emotion", "People & Body", "Flags"];
const subGroups = {
  "Smileys & Emotion": ["face-smiling", "face-affection"],
  "People & Body": ["person-activity", "person-role"],
  Flags: ["country-flag"],
};

const allResult = updateAvailableCategories({
  groups,
  items,
  selectedGroup: "",
  selectedSequenceType: "",
  selectedSubGroup: "",
  sequenceTypeOrder: ["single", "zwj", "tag"],
  subGroupSelectionKey: (group, subGroup) => `${group}::${subGroup}`,
  subGroups,
  versionKeys: new Map(),
  includedVersionKeys: new Set(),
});
assert.deepEqual([...allResult.availableCategoryKeys], [
  "smile",
  "runner",
  "walker",
]);
assert.deepEqual(allResult.availableGroups, [
  "Smileys & Emotion",
  "People & Body",
]);
assert.deepEqual(allResult.availableSubGroups, {
  "Smileys & Emotion": ["face-smiling"],
  "People & Body": ["person-activity"],
});
assert.deepEqual(allResult.availableSequenceTypes, ["single", "zwj"]);
assert.equal(allResult.selectedGroup, "");
assert.equal(allResult.selectedSequenceType, "");
assert.equal(allResult.selectedSubGroup, "");

const filteredResult = updateAvailableCategories({
  groups,
  items,
  selectedGroup: "People & Body",
  selectedSequenceType: "tag",
  selectedSubGroup: "People & Body::person-role",
  sequenceTypeOrder: ["single", "zwj", "tag"],
  subGroupSelectionKey: (group, subGroup) => `${group}::${subGroup}`,
  subGroups,
  versionKeys: new Map([["15.0", new Set(["runner"])]]) as any,
  includedVersionKeys: new Set(["runner"]),
});
assert.deepEqual([...filteredResult.availableCategoryKeys], ["runner"]);
assert.deepEqual(filteredResult.availableGroups, ["People & Body"]);
assert.deepEqual(filteredResult.availableSubGroups, {
  "People & Body": ["person-activity"],
});
assert.deepEqual(filteredResult.availableSequenceTypes, ["zwj"]);
assert.equal(filteredResult.selectedGroup, "People & Body");
assert.equal(filteredResult.selectedSequenceType, "");
assert.equal(filteredResult.selectedSubGroup, "");

const invalidGroupResult = updateAvailableCategories({
  groups,
  items,
  selectedGroup: "Flags",
  selectedSequenceType: "single",
  selectedSubGroup: "Flags::country-flag",
  sequenceTypeOrder: ["single", "zwj"],
  subGroupSelectionKey: (group, subGroup) => `${group}::${subGroup}`,
  subGroups,
  versionKeys: new Map(),
  includedVersionKeys: new Set(["smile"]),
});
assert.equal(invalidGroupResult.selectedGroup, "");
assert.equal(invalidGroupResult.selectedSubGroup, "");
assert.equal(invalidGroupResult.selectedSequenceType, "single");

const validSubGroupResult = updateAvailableCategories({
  groups,
  items,
  selectedGroup: "People & Body",
  selectedSequenceType: "zwj",
  selectedSubGroup: "People & Body::person-activity",
  sequenceTypeOrder: ["single", "zwj"],
  subGroupSelectionKey: (group, subGroup) => `${group}::${subGroup}`,
  subGroups,
  versionKeys: new Map(),
  includedVersionKeys: new Set(["runner", "walker"]),
});
assert.equal(validSubGroupResult.selectedGroup, "People & Body");
assert.equal(validSubGroupResult.selectedSubGroup, "People & Body::person-activity");
assert.equal(validSubGroupResult.selectedSequenceType, "zwj");

const groupField = new FakeField();
const subGroupField = new FakeField();
const sequenceField = new FakeField();
renderCategoryFilterLayout({
  compactGroupChoices: {} as any,
  compactSubGroupChoices: {} as any,
  compactSequenceChoices: {} as any,
  groupField,
  selectedGroup: "People & Body",
  sequenceField,
  sequenceMode: false,
  subGroupField,
});
assert.equal(groupField.classList.has("has-choice-buttons"), true);
assert.equal(subGroupField.classList.has("has-choice-buttons"), true);
assert.equal(sequenceField.classList.has("has-choice-buttons"), true);
assert.equal(groupField.hidden, false);
assert.equal(subGroupField.hidden, false);
assert.equal(sequenceField.hidden, true);

renderCategoryFilterLayout({
  compactGroupChoices: undefined,
  compactSubGroupChoices: undefined,
  compactSequenceChoices: undefined,
  groupField,
  selectedGroup: "",
  sequenceField,
  sequenceMode: true,
  subGroupField,
});
assert.equal(groupField.classList.has("has-choice-buttons"), false);
assert.equal(subGroupField.classList.has("has-choice-buttons"), false);
assert.equal(sequenceField.classList.has("has-choice-buttons"), false);
assert.equal(groupField.hidden, true);
assert.equal(subGroupField.hidden, true);
assert.equal(sequenceField.hidden, false);

renderCategoryFilterLayout({
  selectedGroup: "",
  sequenceMode: false,
});
