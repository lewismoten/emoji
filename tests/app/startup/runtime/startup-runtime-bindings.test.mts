import assert from "node:assert/strict";
import { loadStartupRuntimeFixture } from "./startup-runtime-fixture.mjs";

const { orchestratorStub, runtime } = await loadStartupRuntimeFixture();

assert.equal(runtime, orchestratorStub.result);
assert.equal(orchestratorStub.calls.length, 1);
const call = orchestratorStub.calls[0];

assert.equal(call.bindEvents, "bind-explorer-events");
assert.equal(call.finalizeStartup, "finalize-explorer-startup");
assert.equal(call.createFilterControlSetup, "create-filter-control-setup");
assert.equal(call.observeToolbarHeight, "observe-toolbar-height");
assert.equal(call.closePanel, "close-panel-dialog");
assert.equal(call.openPanel, "open-panel-dialog");
assert.equal(call.installedDisplayQueries, "installed-display-queries");

assert.equal(call.advancedFilters(), "advanced-filters");
assert.equal(call.advancedFiltersButton(), "advanced-filters-button");
assert.equal(call.applyingUrlState(), false);
assert.equal(call.applyBasicUrlState, "apply-basic-url-state");
assert.equal(call.applyDialogUrlState, "apply-dialog-url-state");
assert.equal(call.applyPixelArtworkClass, "apply-pixel-artwork-class");
assert.equal(call.bindAudioInteractions, "bind-audio-interactions");
assert.equal(call.assignControls, "assign-controls");
assert.equal(call.assignElements, "assign-elements");
assert.equal(call.assignModifierFieldsets, "assign-modifier-fieldsets");
assert.equal(call.clearFiltersButton(), "clear-filters-button");
assert.deepEqual(call.copiedEmojiKeys(), ["wave"]);
assert.equal(call.developerModeToggle(), "developer-mode-toggle");
assert.equal(call.dialog(), "dialog");
assert.deepEqual(call.drawList("x"), ["draw-list", ["x"]]);
assert.deepEqual(call.emojiByKey(), { wave: "👋" });
assert.equal(call.emojiFontChoices(), "emoji-font-choices");
assert.equal(call.emojiList(), "emoji-list");
assert.equal(call.emojiNext(), "emoji-next");
assert.equal(call.emojiPrevious(), "emoji-previous");
assert.deepEqual(call.favoriteEmojiKeys(), ["sparkles"]);
assert.equal(call.genderCheckboxes(), "gender-checkboxes");
assert.equal(call.groupFilterDialog(), "group-filter-dialog");
assert.equal(call.groupPickerTrigger(), "group-picker-trigger");
assert.equal(call.groupSelector(), "group-selector");
assert.equal(call.hairCheckboxes(), "hair-checkboxes");
assert.equal(call.helpDialog(), "help-dialog");
assert.equal(call.helpPicker(), "help-picker");
assert.equal(
  call.hideModifierEmojiAccessibility,
  "hide-modifier-emoji-accessibility",
);
assert.equal(call.initializeControls, "initialize-explorer-controls");
assert.equal(call.installApp, "install-app");
assert.equal(call.installAppButton(), "install-app-button");
assert.equal(call.installDialog(), "install-dialog");
assert.equal(call.languageDialog(), "language-dialog");
assert.equal(call.languageList(), "language-list");
assert.equal(call.languagePicker(), "language-picker");
assert.equal(call.loadData, "load-data");
assert.equal(call.loadSearchLanguages(), "load-search-languages");
assert.equal(call.loadUiTranslations, "load-ui-translations");
assert.equal(call.matchCount(), "match-count");
