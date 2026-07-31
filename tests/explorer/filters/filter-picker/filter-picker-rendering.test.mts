import assert from "node:assert/strict";
import {
  closeFilterPicker,
  focusCompactChoice,
  makeCompactChoice,
  openFilterPicker,
  renderFilterPickerTrigger,
} from "../../../../src/explorer/filters/filter-picker.js";
import {
  FakeElement,
  installDocumentWindow,
} from "./filter-picker-fixture.mjs";

const { restore } = installDocumentWindow();

try {
  let selected = 0;
  const choice = makeCompactChoice({
    value: "people",
    emoji: "🧑",
    label: "People",
    selected: true,
    onSelect: () => {
      selected += 1;
    },
  }) as any;
  assert.equal(choice.getAttribute("aria-pressed"), "true");
  assert.equal(choice.getAttribute("aria-checked"), "true");
  assert.equal(choice.dataset.value, "people");
  assert.equal(choice.children[0].textContent, "🧑");
  choice.dispatch("click");
  assert.equal(selected, 1);

  const trigger = new FakeElement("button");
  const triggerEmoji = new FakeElement("span");
  triggerEmoji.className = "filter-picker-emoji";
  const triggerValue = new FakeElement("span");
  triggerValue.className = "filter-picker-value";
  trigger.append(triggerEmoji, triggerValue);
  renderFilterPickerTrigger(trigger as any, "Group", "😀", "Smileys");
  assert.equal(triggerEmoji.textContent, "😀");
  assert.equal(triggerValue.textContent, "Smileys");
  assert.equal(trigger.getAttribute("aria-label"), "Group: Smileys");
  assert.equal(trigger.title, "Group: Smileys");
  renderFilterPickerTrigger(trigger as any, "Group", "", "All");
  assert.equal(triggerEmoji.textContent, "•");
  renderFilterPickerTrigger(undefined, "Group", "😀", "Smileys");

  const dialog = new FakeElement("dialog");
  const choices = new FakeElement("div");
  const firstRadio = new FakeElement("button");
  firstRadio.setAttribute("role", "radio");
  const selectedRadio = new FakeElement("button");
  selectedRadio.setAttribute("role", "radio");
  selectedRadio.setAttribute("aria-checked", "true");
  choices.append(firstRadio, selectedRadio);
  openFilterPicker(dialog as any, choices as any);
  assert.equal(dialog.open, true);
  assert.equal(selectedRadio.focused, true);

  const fallbackDialog = new FakeElement("dialog");
  const fallbackChoices = new FakeElement("div");
  const fallbackRadio = new FakeElement("button");
  fallbackRadio.setAttribute("role", "radio");
  fallbackChoices.append(fallbackRadio);
  openFilterPicker(fallbackDialog as any, fallbackChoices as any);
  assert.equal(fallbackDialog.open, true);
  assert.equal(fallbackRadio.focused, true);
  openFilterPicker(undefined, choices as any);
  openFilterPicker(dialog as any, undefined);

  const closeTrigger = new FakeElement("button");
  closeFilterPicker(dialog as any, closeTrigger as any);
  assert.equal(dialog.open, false);
  assert.equal(closeTrigger.focused, true);
  dialog.open = false;
  closeFilterPicker(dialog as any, closeTrigger as any);
  closeFilterPicker(undefined, undefined);

  const focusContainer = new FakeElement("div");
  const focusA = new FakeElement("button");
  focusA.setAttribute("role", "radio");
  focusA.dataset.value = "a";
  const focusB = new FakeElement("button");
  focusB.setAttribute("role", "radio");
  focusB.dataset.value = "b";
  focusB.setAttribute("aria-checked", "true");
  focusContainer.append(focusA, focusB);
  focusCompactChoice(focusContainer as any, "a");
  assert.equal(focusA.focused, true);
  focusCompactChoice(focusContainer as any, "missing");
  assert.equal(focusB.focused, true);
  const emptyFocusContainer = new FakeElement("div");
  focusCompactChoice(emptyFocusContainer as any, "missing");
} finally {
  restore();
}
