import assert from "node:assert/strict";
import { buildExplorerBootstrapRuntimeSourceOptions } from "../../../../src/app/bootstrap/explorer-bootstrap-options.js";
import { createBootstrapOptionsFixture } from "./explorer-bootstrap-options-fixture.js";

const { calls, options, state } = createBootstrapOptionsFixture();

const runtime = buildExplorerBootstrapRuntimeSourceOptions(options);
assert.equal(runtime.applyBasicUrlState, options.applyBasicUrlState);
assert.equal(runtime.applyDialogUrlState, options.applyDialogUrlState);
assert.equal(runtime.bindAudioInteractions, options.bindAudioInteractions);
assert.equal(runtime.applyPixelArtworkClass, options.applyPixelArtworkClass);
assert.equal(
  runtime.applyStandalonePixelArtwork,
  options.applyStandalonePixelArtwork,
);
assert.equal(
  runtime.fullDeveloperModeEnabled,
  options.fullDeveloperModeEnabled,
);
assert.equal(runtime.installApp, options.installApp);
assert.equal(runtime.loadPackageManifest, options.loadPackageManifest);
assert.equal(runtime.loadData, options.loadData);
assert.equal(runtime.loadUiTranslations, options.loadUiTranslations);
assert.equal(runtime.modeChoices(), "modeChoices-value");
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
  ["resetFilters", "resetFilters-value"],
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
assert.equal(
  runtime.focusInitialEmojiDialogAction(),
  "focusInitialEmojiDialogAction-value",
);
assert.equal(runtime.refreshLocalizedLabels(), "refreshLocalizedLabels-value");
assert.equal(runtime.renderDeveloperMode(), "renderDeveloperMode-value");
assert.equal(runtime.renderInstallAppButton(), "renderInstallAppButton-value");
assert.equal(runtime.renderPixelFontToggle(), "renderPixelFontToggle-value");
assert.equal(runtime.renderSavedEmoji(), "renderSavedEmoji-value");
assert.equal(runtime.renderSearchLanguages(), "renderSearchLanguages-value");
assert.equal(runtime.renderThemeToggle(), "renderThemeToggle-value");
assert.equal(
  runtime.renderVersionModeToggle(),
  "renderVersionModeToggle-value",
);
assert.equal(runtime.restoreDeveloperMode(), "restoreDeveloperMode-value");
assert.equal(runtime.scheduleSearchDraw(), "scheduleSearchDraw-value");
assert.equal(runtime.selectEmojiFont(), "selectEmojiFont-value");
assert.equal(runtime.selectTheme(), "selectTheme-value");
assert.equal(runtime.nextSearchLoadId(), "nextSearchLoadId-value");
assert.equal(runtime.setApplyingUrlState(), "setApplyingUrlState-value");
assert.equal(runtime.setControls(), "setControls-value");
assert.equal(runtime.setElements(), "setElements-value");
assert.equal(runtime.setFieldsets(), "setFieldsets-value");
assert.equal(runtime.setPixelEditor(), "setPixelEditor-value");
assert.equal(runtime.setPixelEditorPromise(), "setPixelEditorPromise-value");
assert.equal(runtime.setSearchLanguage(), "setSearchLanguage-value");
assert.equal(
  runtime.setSuppressDialogCloseSync(),
  "setSuppressDialogCloseSync-value",
);
assert.equal(runtime.setUrlStateReady(), "setUrlStateReady-value");
assert.equal(runtime.stepVersion(), "stepVersion-value");
assert.equal(runtime.translate("theme", "Theme"), "translate-value");
assert.equal(runtime.developerModeEnabled(), "developerModeEnabled-value");
assert.equal(
  runtime.fullDeveloperModeEnabled(),
  "fullDeveloperModeEnabled-value",
);
assert.equal(runtime.displayGroupName("Objects"), "displayGroupName-value");
assert.equal(
  runtime.displayUnicodeSubGroupName("mail"),
  "displayUnicodeSubGroupName-value",
);
assert.equal(
  runtime.getIntroducedVersion("gift"),
  "getIntroducedVersion-value",
);
assert.equal(runtime.openFilterPicker(), "openFilterPicker-value");
assert.equal(runtime.onCompactChoiceKeyDown(), "onCompactChoiceKeyDown-value");
assert.equal(runtime.onDocumentKeyDown(), "onDocumentKeyDown-value");
assert.equal(runtime.onEmojiDialogClick(), "onEmojiDialogClick-value");
assert.equal(runtime.onEmojiDialogClose(), "onEmojiDialogClose-value");
assert.equal(runtime.onEmojiFocus(), "onEmojiFocus-value");
assert.equal(runtime.onEmojiKeyDown(), "onEmojiKeyDown-value");
assert.equal(runtime.onHairChange(), "onHairChange-value");
assert.equal(runtime.onGenderChange(), "onGenderChange-value");
assert.equal(runtime.onSkinToneChange(), "onSkinToneChange-value");
assert.equal(runtime.onOrderModeChange(), "onOrderModeChange-value");
assert.equal(runtime.onVersionRangeInput(), "onVersionRangeInput-value");
runtime.setDialogView("editor");
runtime.showEmoji("wrappedGift", true);
runtime.syncUrlState("replace", { hello: "world" });
runtime.syncVersionRange("x");
assert.equal(runtime.toggleDeveloperMode(), "toggleDeveloperMode-value");
runtime.toggleVersionMode("selected");
assert.equal(runtime.updateFavoriteButton(), "updateFavoriteButton-value");
assert.equal(runtime.updateModifierArtwork(), "updateModifierArtwork-value");
assert.equal(runtime.updateOnlineStatus(), "updateOnlineStatus-value");
assert.equal(
  runtime.updatePixelArtworkManifest(),
  "updatePixelArtworkManifest-value",
);
assert.equal(
  runtime.updateRenderingDiagnostic(),
  "updateRenderingDiagnostic-value",
);
assert.equal(
  calls.some(
    (call) =>
      call[0] === "populateVersionModeOptions" &&
      JSON.stringify(call[1]) === '["b"]',
  ),
  true,
);
for (const expected of [
  ["renderCategoryFilters", ["c"]],
  ["setDialogView", ["editor"]],
  ["showEmoji", ["wrappedGift", true]],
  ["syncUrlState", ["replace", { hello: "world" }]],
  ["syncVersionRange", ["x"]],
  ["toggleDeveloperMode", []],
  ["toggleVersionMode", ["selected"]],
  ["updateFavoriteButton", []],
  ["updateModifierArtwork", []],
  ["updateOnlineStatus", []],
  ["updatePixelArtworkManifest", []],
  ["updateRenderingDiagnostic", []],
] as const) {
  assert.equal(
    calls.some(
      (call) =>
        call[0] === expected[0] &&
        JSON.stringify(call[1]) === JSON.stringify(expected[1]),
    ),
    true,
  );
}
