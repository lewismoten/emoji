import assert from "node:assert/strict";
import { createUiBindingRuntime } from "../../src/app/ui-binding-runtime.js";

const controlCalls: unknown[] = [];
const elementCalls: unknown[] = [];
const fieldsetCalls: unknown[] = [];

class FakeFieldset {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class FakeCheckbox {
  fieldset: FakeFieldset;

  constructor(fieldset: FakeFieldset) {
    this.fieldset = fieldset;
  }

  closest(selector: string) {
    return selector === "fieldset" ? this.fieldset : null;
  }
}

const runtime = createUiBindingRuntime({
  setControls(value: unknown) {
    controlCalls.push(value);
  },
  setElements(value: unknown) {
    elementCalls.push(value);
  },
  setFieldsets(value: unknown) {
    fieldsetCalls.push(value);
  },
  skinToneCheckboxes: () => [new FakeCheckbox(new FakeFieldset("skin"))],
  hairCheckboxes: () => [new FakeCheckbox(new FakeFieldset("hair"))],
  genderCheckboxes: () => [new FakeCheckbox(new FakeFieldset("gender"))],
});

runtime.assignControls({
  activeFilterSummary: "summary",
  activeFilterText: "summary-text",
  clearFiltersButton: "clear",
  compactGroupChoices: "group-choices",
  compactGroupLabel: "group-label",
  compactSequenceChoices: "sequence-choices",
  compactSequenceLabel: "sequence-label",
  compactSubGroupChoices: "subgroup-choices",
  compactSubGroupLabel: "subgroup-label",
  sequenceTypeSelector: "sequence-selector",
  versionModeToggle: "version-mode-toggle",
  versionRange: "version-range",
  versionRangeValue: "version-range-value",
  ignored: "ignored",
});
assert.deepEqual(controlCalls, [
  {
    activeFilterSummary: "summary",
    activeFilterText: "summary-text",
    clearFiltersButton: "clear",
    compactGroupChoices: "group-choices",
    compactGroupLabel: "group-label",
    compactSequenceChoices: "sequence-choices",
    compactSequenceLabel: "sequence-label",
    compactSubGroupChoices: "subgroup-choices",
    compactSubGroupLabel: "subgroup-label",
    sequenceTypeSelector: "sequence-selector",
    versionModeToggle: "version-mode-toggle",
    versionRange: "version-range",
    versionRangeValue: "version-range-value",
  },
]);

runtime.assignElements({
  advancedFilters: "advanced-filters",
  advancedFiltersButton: "advanced-filters-button",
  copyStatus: "copy-status",
  developerModeToggle: "developer-mode-toggle",
  emojiFontChoices: "emoji-font-choices",
  emojiList: "emoji-list",
  genderCheckboxes: "gender-checkboxes",
  groupFilterDialog: "group-filter-dialog",
  groupPickerTrigger: "group-picker-trigger",
  groupSelector: "group-selector",
  hairCheckboxes: "hair-checkboxes",
  helpDialog: "help-dialog",
  helpPicker: "help-picker",
  installAppButton: "install-app-button",
  installDialog: "install-dialog",
  languageDialog: "language-dialog",
  languageList: "language-list",
  languagePicker: "language-picker",
  languagePickerFlag: "language-picker-flag",
  languagePickerLabel: "language-picker-label",
  matchCount: "match-count",
  modifierFilters: "modifier-filters",
  offlineStatus: "offline-status",
  orderButtons: "order-buttons",
  savedDialog: "saved-dialog",
  savedPicker: "saved-picker",
  searchText: "search-text",
  skinToneCheckboxes: "skin-tone-checkboxes",
  subGroupFilterDialog: "subgroup-filter-dialog",
  subGroupPickerTrigger: "subgroup-picker-trigger",
  subGroupSelector: "subgroup-selector",
  themeChoices: "theme-choices",
  toolbar: "toolbar",
  versionModeSelector: "version-mode-selector",
  versionNext: "version-next",
  versionPrevious: "version-previous",
  versionSelector: "version-selector",
  extra: "ignored",
});
assert.deepEqual(elementCalls, [
  {
    advancedFilters: "advanced-filters",
    advancedFiltersButton: "advanced-filters-button",
    copyStatus: "copy-status",
    developerModeToggle: "developer-mode-toggle",
    emojiFontChoices: "emoji-font-choices",
    emojiList: "emoji-list",
    genderCheckboxes: "gender-checkboxes",
    groupFilterDialog: "group-filter-dialog",
    groupPickerTrigger: "group-picker-trigger",
    groupSelector: "group-selector",
    hairCheckboxes: "hair-checkboxes",
    helpDialog: "help-dialog",
    helpPicker: "help-picker",
    installAppButton: "install-app-button",
    installDialog: "install-dialog",
    languageDialog: "language-dialog",
    languageList: "language-list",
    languagePicker: "language-picker",
    languagePickerFlag: "language-picker-flag",
    languagePickerLabel: "language-picker-label",
    matchCount: "match-count",
    modifierFilters: "modifier-filters",
    offlineStatus: "offline-status",
    orderButtons: "order-buttons",
    savedDialog: "saved-dialog",
    savedPicker: "saved-picker",
    searchText: "search-text",
    skinToneCheckboxes: "skin-tone-checkboxes",
    subGroupFilterDialog: "subgroup-filter-dialog",
    subGroupPickerTrigger: "subgroup-picker-trigger",
    subGroupSelector: "subgroup-selector",
    themeChoices: "theme-choices",
    toolbar: "toolbar",
    versionModeSelector: "version-mode-selector",
    versionNext: "version-next",
    versionPrevious: "version-previous",
    versionSelector: "version-selector",
  },
]);

runtime.assignModifierFieldsets();
assert.equal(fieldsetCalls.length, 1);
assert.equal((fieldsetCalls[0] as any).skinToneFieldset.name, "skin");
assert.equal((fieldsetCalls[0] as any).hairFieldset.name, "hair");
assert.equal((fieldsetCalls[0] as any).genderFieldset.name, "gender");

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const hiddenCalls: string[] = [];
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    querySelectorAll(selector: string) {
      assert.equal(selector, ".modifier-emoji");
      return [
        {
          setAttribute(name: string, value: string) {
            hiddenCalls.push(`${name}:${value}`);
          },
        },
        {
          setAttribute(name: string, value: string) {
            hiddenCalls.push(`${name}:${value}`);
          },
        },
      ];
    },
  },
});
try {
  runtime.hideModifierEmojiAccessibility();
  assert.deepEqual(hiddenCalls, ["aria-hidden:true", "aria-hidden:true"]);
} finally {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
}
