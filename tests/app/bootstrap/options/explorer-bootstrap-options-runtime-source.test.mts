import assert from "node:assert/strict";
import { buildExplorerBootstrapRuntimeSourceOptions } from "../../../../src/app/bootstrap/explorer-bootstrap-options.js";
import { createBootstrapOptionsFixture } from "./explorer-bootstrap-options-fixture.js";

const { calls, options, state } = createBootstrapOptionsFixture();

const runtime = buildExplorerBootstrapRuntimeSourceOptions(options);
assert.equal(runtime.applyBasicUrlState, options.applyBasicUrlState);
assert.equal(runtime.applyDialogUrlState, options.applyDialogUrlState);
assert.equal(runtime.bindAudioInteractions, options.bindAudioInteractions);
assert.equal(runtime.installApp, options.installApp);
assert.equal(runtime.panelDialogs, options.panelDialogs);
assert.equal(runtime.translate, options.translate);
assert.equal(runtime.state(), state);
for (const [key, expected] of [
  ["advancedFilters", "advancedFilters-value"],
  ["advancedFiltersButton", "advancedFiltersButton-value"],
  ["applyingUrlState", "applyingUrlState-value"],
  ["clearFiltersButton", "clearFiltersButton-value"],
  ["copyStatus", "copyStatus-value"],
  ["developerModeToggle", "developerModeToggle-value"],
  ["drawList", "drawList-value"],
  ["emojiFontChoices", "emojiFontChoices-value"],
  ["emojiList", "emojiList-value"],
  ["genderCheckboxes", "genderCheckboxes-value"],
  ["getPixelEditor", "getPixelEditor-value"],
  ["getPixelEditorPromise", "getPixelEditorPromise-value"],
  ["groupFilterDialog", "groupFilterDialog-value"],
  ["groupPickerTrigger", "groupPickerTrigger-value"],
  ["groupSelector", "groupSelector-value"],
  ["hairCheckboxes", "hairCheckboxes-value"],
  ["helpDialog", "helpDialog-value"],
  ["helpPicker", "helpPicker-value"],
  ["installAppButton", "installAppButton-value"],
  ["installDialog", "installDialog-value"],
  ["languageDialog", "languageDialog-value"],
  ["languageList", "languageList-value"],
  ["languagePicker", "languagePicker-value"],
  ["languagePickerFlag", "languagePickerFlag-value"],
  ["languagePickerLabel", "languagePickerLabel-value"],
  ["loadSearchLanguages", "loadSearchLanguages-value"],
  ["matchCount", "matchCount-value"],
  ["navigateEmoji", "navigateEmoji-value"],
  ["orderButtons", "orderButtons-value"],
  ["savedDialog", "savedDialog-value"],
  ["savedPicker", "savedPicker-value"],
  ["searchText", "searchText-value"],
  ["skinToneCheckboxes", "skinToneCheckboxes-value"],
  ["subGroupFilterDialog", "subGroupFilterDialog-value"],
  ["subGroupPickerTrigger", "subGroupPickerTrigger-value"],
  ["subGroupSelector", "subGroupSelector-value"],
  ["suppressedPanelCloses", "suppressedPanelCloses-value"],
  ["toolbar", "toolbar-value"],
  ["themeChoices", "themeChoices-value"],
  ["urlStateReady", "urlStateReady-value"],
  ["versionModeSelector", "versionModeSelector-value"],
  ["versionModeToggle", "versionModeToggle-value"],
  ["versionNext", "versionNext-value"],
  ["versionPrevious", "versionPrevious-value"],
  ["versionRange", "versionRange-value"],
  ["versionSelector", "versionSelector-value"],
] as const) {
  const value =
    key === "drawList"
      ? runtime[key]("warm")
      : key === "navigateEmoji"
        ? runtime[key](3)
        : runtime[key]();
  assert.equal(value, expected);
}
runtime.populateVersionModeOptions("b");
runtime.renderCategoryFilters("c");
runtime.setDialogView("editor");
runtime.showEmoji("wrappedGift", true);
runtime.syncUrlState("replace", { hello: "world" });
runtime.syncVersionRange("x");
runtime.toggleVersionMode("selected");
const recentCalls = calls.slice(-7);
assert.equal(
  recentCalls.some(
    (call) =>
      call[0] === "populateVersionModeOptions" &&
      JSON.stringify(call[1]) === '["b"]',
  ),
  true,
);
assert.deepEqual(recentCalls.slice(-6), [
  ["renderCategoryFilters", ["c"]],
  ["setDialogView", ["editor"]],
  ["showEmoji", ["wrappedGift", true]],
  ["syncUrlState", ["replace", { hello: "world" }]],
  ["syncVersionRange", ["x"]],
  ["toggleVersionMode", ["selected"]],
]);
