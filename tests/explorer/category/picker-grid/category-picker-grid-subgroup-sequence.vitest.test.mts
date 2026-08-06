import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  renderSequencePickerGrid,
  renderSubGroupPickerGrid,
} from "../../../../src/explorer/category/category-picker-grid-control.js";
import { FakeElement, installPickerGridDom } from "./category-picker-grid-fixture.mjs";

describe("category-picker-grid-subgroup-sequence", () => {
  it("renders subgroup and sequence choices and updates selections", () => {
    const dom = installPickerGridDom();

    try {
      const subGroupChoices = new FakeElement("div");
      const subGroupLabel = new FakeElement("span");
      const subGroupTrigger = new FakeElement("button");
      const subGroupTriggerEmoji = new FakeElement("span");
      subGroupTriggerEmoji.className = "filter-picker-emoji";
      const subGroupTriggerValue = new FakeElement("span");
      subGroupTriggerValue.className = "filter-picker-value";
      subGroupTrigger.append(subGroupTriggerEmoji, subGroupTriggerValue);
      const subGroupDialog = new FakeElement("dialog");
      subGroupDialog.open = true;
      const subGroupCalls: string[] = [];
      let subGroupDraws = 0;
      let subGroupRerenders = 0;
      renderSubGroupPickerGrid({
        availableSubGroupParents: ["Food & Drink", "Travel & Places"],
        availableSubGroups: {
          "Food & Drink": ["food-asian"],
          "Travel & Places": ["transport-ground"],
        },
        compactSubGroupChoices: subGroupChoices as any,
        compactSubGroupLabel: subGroupLabel as any,
        displayUnicodeSubGroupName: (name) => `shown:${name}`,
        drawList: () => {
          subGroupDraws += 1;
        },
        getSubGroupRepresentativeEmoji: (_group, subGroup) =>
          subGroup === "food-asian" ? "🍜" : "🚗",
        selectedGroup: "Food & Drink",
        selectedSubGroup: "Food & Drink::food-asian",
        setSelectedSubGroup: (value) => {
          subGroupCalls.push(value);
        },
        subGroupFilterDialog: subGroupDialog as any,
        subGroupPickerTrigger: subGroupTrigger as any,
        subGroupSelectionKey: (group, subGroup) => `${group}::${subGroup}`,
        translate: (_key, fallback) => fallback,
        rerender: () => {
          subGroupRerenders += 1;
        },
      });
      assert.equal(subGroupLabel.textContent, "shown:food-asian");
      assert.equal(subGroupTriggerEmoji.textContent, "🍜");
      assert.equal(subGroupTriggerValue.textContent, "shown:food-asian");
      assert.equal(subGroupChoices.children.length, 3);
      assert.equal(
        subGroupChoices.children[1].dataset.value,
        "Food & Drink::food-asian",
      );
      assert.equal(subGroupChoices.children[1].getAttribute("aria-checked"), "true");
      subGroupChoices.children[0].dispatch("click");
      assert.deepEqual(subGroupCalls.slice(0, 1), [""]);
      assert.equal(subGroupRerenders, 1);
      assert.equal(subGroupDraws, 1);
      assert.equal(subGroupDialog.open, false);
      subGroupDialog.open = true;
      subGroupChoices.children[2].dispatch("click");
      assert.deepEqual(subGroupCalls.slice(1), ["Travel & Places::transport-ground"]);
      assert.equal(subGroupRerenders, 2);
      assert.equal(subGroupDraws, 2);

      const blankSubGroupChoices = new FakeElement("div");
      const blankSubGroupLabel = new FakeElement("span");
      const blankSubGroupTrigger = new FakeElement("button");
      const blankSubGroupTriggerEmoji = new FakeElement("span");
      blankSubGroupTriggerEmoji.className = "filter-picker-emoji";
      const blankSubGroupTriggerValue = new FakeElement("span");
      blankSubGroupTriggerValue.className = "filter-picker-value";
      blankSubGroupTrigger.append(blankSubGroupTriggerEmoji, blankSubGroupTriggerValue);
      renderSubGroupPickerGrid({
        availableSubGroupParents: [],
        availableSubGroups: {},
        compactSubGroupChoices: blankSubGroupChoices as any,
        compactSubGroupLabel: blankSubGroupLabel as any,
        displayUnicodeSubGroupName: (name) => name,
        drawList: () => {},
        getSubGroupRepresentativeEmoji: () => "🍜",
        selectedGroup: "",
        selectedSubGroup: "",
        setSelectedSubGroup: () => {},
        subGroupFilterDialog: undefined,
        subGroupPickerTrigger: blankSubGroupTrigger as any,
        subGroupSelectionKey: (group, subGroup) => `${group}::${subGroup}`,
        translate: (_key, fallback) => fallback,
        rerender: () => {},
      });
      assert.equal(blankSubGroupLabel.textContent, "All");
      assert.equal(blankSubGroupTriggerEmoji.textContent, "🌐");
      assert.equal(blankSubGroupChoices.children.length, 1);

      const sequenceChoices = new FakeElement("div");
      const sequenceLabel = new FakeElement("span");
      const sequenceCalls: string[] = [];
      let sequenceDraws = 0;
      let sequenceRerenders = 0;
      renderSequencePickerGrid({
        availableSequenceTypes: ["single", "zwj"],
        compactSequenceChoices: sequenceChoices as any,
        compactSequenceLabel: sequenceLabel as any,
        drawList: () => {
          sequenceDraws += 1;
        },
        rerender: () => {
          sequenceRerenders += 1;
        },
        selectedSequenceType: "single",
        sequenceTranslationKeys: { single: "single", zwj: "zwj" },
        sequenceTypeEmoji: { single: "1️⃣", zwj: "🔗" },
        sequenceTypeLabels: { single: "Single", zwj: "ZWJ" },
        setSelectedSequenceType: (value) => {
          sequenceCalls.push(value);
        },
        translate: (key, fallback) => `${key}:${fallback}`,
      });
      assert.equal(sequenceLabel.textContent, "single:Single");
      assert.equal(sequenceChoices.children.length, 3);
      assert.equal(sequenceChoices.children[1].getAttribute("aria-checked"), "true");
      sequenceChoices.children[0].dispatch("click");
      assert.deepEqual(sequenceCalls.slice(0, 1), [""]);
      assert.equal(sequenceRerenders, 1);
      assert.equal(sequenceDraws, 1);
      assert.equal(sequenceChoices.children[0].focused, true);
      sequenceChoices.children[2].dispatch("click");
      assert.deepEqual(sequenceCalls.slice(1), ["zwj"]);
      assert.equal(sequenceRerenders, 2);
      assert.equal(sequenceDraws, 2);
      assert.equal(sequenceChoices.children[2].focused, true);

      renderSequencePickerGrid({
        availableSequenceTypes: [],
        compactSequenceChoices: undefined,
        compactSequenceLabel: undefined,
        drawList: () => {},
        rerender: () => {},
        selectedSequenceType: "",
        sequenceTranslationKeys: {},
        sequenceTypeEmoji: {},
        sequenceTypeLabels: {},
        setSelectedSequenceType: () => {},
        translate: (_key, fallback) => fallback,
      });
    } finally {
      dom.restore();
    }
  });
});
