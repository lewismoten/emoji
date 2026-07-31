import assert from "node:assert/strict";
import { renderGroupPickerGrid } from "../../../../src/explorer/category/category-picker-grid-control.js";
import { FakeElement, installPickerGridDom } from "./category-picker-grid-fixture.mjs";

const dom = installPickerGridDom();

try {
  const groupChoices = new FakeElement("div");
  const groupLabel = new FakeElement("span");
  const groupTrigger = new FakeElement("button");
  const groupTriggerEmoji = new FakeElement("span");
  groupTriggerEmoji.className = "filter-picker-emoji";
  const groupTriggerValue = new FakeElement("span");
  groupTriggerValue.className = "filter-picker-value";
  groupTrigger.append(groupTriggerEmoji, groupTriggerValue);
  const groupDialog = new FakeElement("dialog");
  groupDialog.open = true;
  const groupCalls: Array<[string, string]> = [];
  let groupDraws = 0;
  let groupRerenders = 0;
  renderGroupPickerGrid({
    availableGroups: ["Smileys & Emotion", "Animals & Nature"],
    compactGroupChoices: groupChoices as any,
    compactGroupLabel: groupLabel as any,
    displayGroupName: (name) => `shown:${name}`,
    drawList: () => {
      groupDraws += 1;
    },
    getGroupRepresentativeEmoji: (group) => (group.startsWith("Smileys") ? "😀" : "🐻"),
    groupFilterDialog: groupDialog as any,
    groupPickerTrigger: groupTrigger as any,
    selectedGroup: "Animals & Nature",
    setSelectedGroup: (value) => {
      groupCalls.push(["group", value]);
    },
    setSelectedSubGroup: (value) => {
      groupCalls.push(["subgroup", value]);
    },
    translate: (_key, fallback) => fallback,
    rerender: () => {
      groupRerenders += 1;
    },
  });
  assert.equal(groupLabel.textContent, "shown:Animals & Nature");
  assert.equal(groupTriggerEmoji.textContent, "🐻");
  assert.equal(groupTriggerValue.textContent, "shown:Animals & Nature");
  assert.equal(groupTrigger.getAttribute("aria-label"), "Group: shown:Animals & Nature");
  assert.equal(groupChoices.children.length, 3);
  assert.equal(groupChoices.children[0].dataset.value, "");
  assert.equal(groupChoices.children[0].getAttribute("aria-checked"), "false");
  assert.equal(groupChoices.children[2].getAttribute("aria-checked"), "true");
  groupChoices.children[0].dispatch("click");
  assert.deepEqual(groupCalls.slice(0, 2), [["group", ""], ["subgroup", ""]]);
  assert.equal(groupRerenders, 1);
  assert.equal(groupDraws, 1);
  assert.equal(groupDialog.open, false);
  assert.equal(groupTrigger.focused, true);
  groupDialog.open = true;
  groupChoices.children[1].dispatch("click");
  assert.deepEqual(groupCalls.slice(2, 4), [
    ["group", "Smileys & Emotion"],
    ["subgroup", ""],
  ]);
  assert.equal(groupRerenders, 2);
  assert.equal(groupDraws, 2);

  const emptyGroupChoices = new FakeElement("div");
  const emptyGroupLabel = new FakeElement("span");
  const emptyGroupTrigger = new FakeElement("button");
  const emptyGroupTriggerEmoji = new FakeElement("span");
  emptyGroupTriggerEmoji.className = "filter-picker-emoji";
  const emptyGroupTriggerValue = new FakeElement("span");
  emptyGroupTriggerValue.className = "filter-picker-value";
  emptyGroupTrigger.append(emptyGroupTriggerEmoji, emptyGroupTriggerValue);
  renderGroupPickerGrid({
    availableGroups: [],
    compactGroupChoices: emptyGroupChoices as any,
    compactGroupLabel: emptyGroupLabel as any,
    displayGroupName: (name) => name,
    drawList: () => {},
    getGroupRepresentativeEmoji: () => "😀",
    groupFilterDialog: undefined,
    groupPickerTrigger: emptyGroupTrigger as any,
    selectedGroup: "",
    setSelectedGroup: () => {},
    setSelectedSubGroup: () => {},
    translate: (_key, fallback) => fallback,
    rerender: () => {},
  });
  assert.equal(emptyGroupLabel.textContent, "All");
  assert.equal(emptyGroupTriggerEmoji.textContent, "🌐");
  assert.equal(emptyGroupChoices.children.length, 1);
} finally {
  dom.restore();
}
