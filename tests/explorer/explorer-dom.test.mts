import assert from "node:assert/strict";
import { getExplorerElements } from "../../src/explorer/explorer-dom.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

type FakeElement = { id: string };

const singletons = new Map<string, FakeElement>([
  ["advanced-filters-dialog", { id: "advanced-filters-dialog" }],
  ["advanced-filters-trigger", { id: "advanced-filters-trigger" }],
  ["copy-status", { id: "copy-status" }],
  ["developer-mode-toggle", { id: "developer-mode-toggle" }],
  ["list", { id: "list" }],
  ["emoji-next", { id: "emoji-next" }],
  ["emoji-parent", { id: "emoji-parent" }],
  ["emoji-previous", { id: "emoji-previous" }],
  ["example-dialog", { id: "example-dialog" }],
  ["group-filter-dialog", { id: "group-filter-dialog" }],
  ["group-picker-trigger", { id: "group-picker-trigger" }],
  ["select-group", { id: "select-group" }],
  ["help-dialog", { id: "help-dialog" }],
  ["help-picker", { id: "help-picker" }],
  ["install-app", { id: "install-app" }],
  ["install-dialog", { id: "install-dialog" }],
  ["language-dialog", { id: "language-dialog" }],
  ["language-list", { id: "language-list" }],
  ["language-picker", { id: "language-picker" }],
  ["language-picker-flag", { id: "language-picker-flag" }],
  ["language-picker-label", { id: "language-picker-label" }],
  ["match-count", { id: "match-count" }],
  ["modifier-filters", { id: "modifier-filters" }],
  ["offline-status", { id: "offline-status" }],
  ["saved-dialog", { id: "saved-dialog" }],
  ["saved-picker", { id: "saved-picker" }],
  ["text", { id: "text" }],
  ["subgroup-filter-dialog", { id: "subgroup-filter-dialog" }],
  ["subgroup-picker-trigger", { id: "subgroup-picker-trigger" }],
  ["select-subgroup", { id: "select-subgroup" }],
  ["toolbar", { id: "toolbar" }],
  ["select-version-mode", { id: "select-version-mode" }],
  ["version-next", { id: "version-next" }],
  ["version-previous", { id: "version-previous" }],
  ["select-version", { id: "select-version" }],
]);

const lists = new Map<string, FakeElement[]>([
  ["emoji-font-choice", [{ id: "system" }, { id: "pixel" }]],
  ["gender", [{ id: "neutral" }, { id: "female" }]],
  ["hair", [{ id: "redHair" }]],
  ["order-mode", [{ id: "unicode" }, { id: "sequence" }]],
  ["skin-tone", [{ id: "light" }, { id: "dark" }]],
  ["theme-choice", [{ id: "light" }, { id: "retro" }]],
]);

try {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      getElementsByClassName(name: string) {
        return lists.get(name) ?? (singletons.has(name) ? [singletons.get(name)] : []);
      },
    },
  });

  const elements = getExplorerElements();

  assert.equal(elements.advancedFilters?.id, "advanced-filters-dialog");
  assert.equal(elements.advancedFiltersButton?.id, "advanced-filters-trigger");
  assert.deepEqual(
    elements.emojiFontChoices.map((item: FakeElement) => item.id),
    ["system", "pixel"],
  );
  assert.deepEqual(
    elements.genderCheckboxes.map((item: FakeElement) => item.id),
    ["neutral", "female"],
  );
  assert.equal(elements.groupSelector?.id, "select-group");
  assert.equal(elements.helpPicker?.id, "help-picker");
  assert.equal(elements.languagePickerLabel?.id, "language-picker-label");
  assert.deepEqual(
    elements.orderButtons.map((item: FakeElement) => item.id),
    ["unicode", "sequence"],
  );
  assert.equal(elements.savedDialog?.id, "saved-dialog");
  assert.deepEqual(
    elements.skinToneCheckboxes.map((item: FakeElement) => item.id),
    ["light", "dark"],
  );
  assert.equal(elements.versionSelector?.id, "select-version");
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
