import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  displayUnicodeSubGroupName,
  populateGroupFilter,
  populateSequenceTypeFilter,
  populateSubGroupFilter,
} from "../../../../src/explorer/filters/filter-picker.js";
import {
  FakeElement,
  installDocumentWindow,
} from "./filter-picker-fixture.mjs";

describe("filter-picker-options", () => {
  it("populates filter options and subgroup labels", () => {
    const { restore } = installDocumentWindow();

    try {
      const groupSelector = new FakeElement("select");
      populateGroupFilter({
        availableGroups: ["Smileys & Emotion", "Animals & Nature"],
        displayGroupName: (name) => `shown:${name}`,
        getGroupRepresentativeEmoji: (group) =>
          group.startsWith("Smileys") ? "😀" : "🐻",
        groupSelector: groupSelector as any,
        selectedGroup: "Animals & Nature",
        translate: (_key, fallback) => fallback,
      });
      assert.equal(groupSelector.children.length, 3);
      assert.equal(groupSelector.children[0].textContent, "🌐 All");
      assert.equal(
        groupSelector.children[1].textContent,
        "😀 shown:Smileys & Emotion",
      );
      assert.equal(groupSelector.value, "Animals & Nature");

      const subGroupSelector = new FakeElement("select");
      populateSubGroupFilter({
        availableSubGroupParents: ["Food & Drink"],
        availableSubGroups: { "Food & Drink": ["food-asian", "food-fruit"] },
        displayGroupName: (name) => `group:${name}`,
        displayUnicodeSubGroupName: (name) => `sub:${name}`,
        getSubGroupRepresentativeEmoji: (_group, subGroup) =>
          subGroup === "food-asian" ? "🍜" : "🍎",
        selectedSubGroup: "Food & Drink::food-fruit",
        subGroupSelectionKey: (group, subGroup) => `${group}::${subGroup}`,
        subGroupSelector: subGroupSelector as any,
        translate: (_key, fallback) => fallback,
      });
      assert.equal(subGroupSelector.children.length, 2);
      const optGroup = subGroupSelector.children[1];
      assert.equal(optGroup.label, "group:Food & Drink");
      assert.equal(optGroup.children[0].value, "Food & Drink::food-asian");
      assert.equal(optGroup.children[0].dataset.group, "Food & Drink");
      assert.equal(optGroup.children[0].dataset.subgroup, "food-asian");
      assert.equal(optGroup.children[1].textContent, "🍎 sub:food-fruit");
      assert.equal(subGroupSelector.value, "Food & Drink::food-fruit");
      assert.equal(subGroupSelector.disabled, false);

      const sequenceSelector = new FakeElement("select");
      populateSequenceTypeFilter({
        availableSequenceTypes: ["single", "zwj"],
        selectedSequenceType: "zwj",
        sequenceTranslationKeys: { single: "single", zwj: "zwj" },
        sequenceTypeEmoji: { single: "1️⃣", zwj: "🔗" },
        sequenceTypeLabels: { single: "Single", zwj: "ZWJ" },
        sequenceTypeSelector: sequenceSelector as any,
        translate: (key, fallback) => `${key}:${fallback}`,
      });
      assert.equal(sequenceSelector.children[0].textContent, "🌐 all:All");
      assert.equal(sequenceSelector.children[2].textContent, "🔗 zwj:ZWJ");
      assert.equal(sequenceSelector.value, "zwj");

      assert.equal(
        displayUnicodeSubGroupName("animal-bird", {
          searchSubgroupLabels: { "animal-bird": "Localized birds" },
          searchLabels: {},
          unicodeSubgroupLabelKeys: {},
        }),
        "Localized birds",
      );
      assert.equal(
        displayUnicodeSubGroupName("book-paper", {
          searchSubgroupLabels: {},
          searchLabels: { books: "Localized books" },
          unicodeSubgroupLabelKeys: { "book-paper": "books" },
        }),
        "Localized books",
      );
      assert.equal(
        displayUnicodeSubGroupName("food-asian", {
          searchSubgroupLabels: {},
          searchLabels: {},
          unicodeSubgroupLabelKeys: {},
        }),
        "Asian",
      );
      assert.equal(
        displayUnicodeSubGroupName("food-fruit", {
          searchSubgroupLabels: {},
          searchLabels: {},
          unicodeSubgroupLabelKeys: {},
        }),
        "Fruit",
      );
      assert.equal(
        displayUnicodeSubGroupName("plant-other", {
          searchSubgroupLabels: {},
          searchLabels: {},
          unicodeSubgroupLabelKeys: {},
        }),
        "Other Plants",
      );
      assert.equal(
        displayUnicodeSubGroupName("travel-place", {
          searchSubgroupLabels: {},
          searchLabels: {},
          unicodeSubgroupLabelKeys: {},
        }),
        "Travel Place",
      );
    } finally {
      restore();
    }
  });
});
