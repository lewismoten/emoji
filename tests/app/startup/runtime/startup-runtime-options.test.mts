import assert from "node:assert/strict";
import { loadStartupRuntimeFixture } from "./startup-runtime-fixture.mjs";

const { orchestratorStub } = await loadStartupRuntimeFixture();
const call = orchestratorStub.calls[0];

assert.deepEqual(call.navigateEmoji(3), ["navigate-emoji", 3]);
assert.equal(call.onClick, "on-click");
assert.equal(call.onCompactChoiceKeyDown, "on-compact-choice-keydown");
assert.equal(call.onDocumentKeyDown, "on-document-keydown");
assert.equal(call.onEmojiDialogClick, "on-emoji-dialog-click");
assert.equal(call.onEmojiDialogClose, "on-emoji-dialog-close");
assert.equal(call.onEmojiFocus, "on-emoji-focus");
assert.equal(call.onHairChange, "on-hair-change");
assert.equal(call.onEmojiKeyDown, "on-emoji-keydown");
assert.equal(call.onGenderChange, "on-gender-change");
assert.equal(call.onSkinToneChange, "on-skin-tone-change");
assert.equal(call.onOrderModeChange, "on-order-mode-change");
assert.equal(call.onPanelClose, "on-panel-close");
assert.equal(call.onVersionRangeInput, "on-version-range-input");
assert.equal(call.openFilterPicker, "open-filter-picker");
assert.equal(call.orderButtons(), "order-buttons");
assert.equal(call.panelDialogs, "panel-dialogs");
assert.deepEqual(call.populateVersionModeOptions("a"), [
  "populate-version-mode-options",
  ["a"],
]);
assert.equal(call.positionFavoriteButton, "position-favorite-button");
assert.equal(call.preferences(), "preferences");
assert.equal(call.renderDeveloperMode, "render-developer-mode");
assert.equal(call.renderInstallAppButton, "render-install-app-button");
assert.equal(call.renderPixelFontToggle, "render-pixel-font-toggle");
assert.equal(call.renderSavedEmoji, "render-saved-emoji");
assert.equal(call.renderThemeToggle, "render-theme-toggle");
assert.equal(call.renderVersionModeToggle(), "render-version-mode-toggle");
assert.equal(call.resolveElements(), "resolve-elements");
assert.deepEqual(call.resetFilters(), ["reset-filters"]);
assert.equal(call.savePreference, "save-preference");
assert.equal(call.savedDialog(), "saved-dialog");
assert.equal(call.savedPicker(), "saved-picker");
assert.equal(call.scheduleSearchDraw, "schedule-search-draw");
assert.equal(call.searchText(), "search-text");
assert.equal(call.selectEmojiFont, "select-emoji-font");
assert.equal(call.selectTheme, "select-theme");
assert.equal(call.setUrlStateReady, "set-url-state-ready");
assert.deepEqual(call.showEmoji("wave"), ["show-emoji", ["wave"]]);
assert.equal(call.skinToneCheckboxes(), "skin-tone-checkboxes");
assert.equal(call.stepVersion, "step-version");
assert.equal(call.subGroupFilterDialog(), "subgroup-filter-dialog");
assert.equal(call.subGroupPickerTrigger(), "subgroup-picker-trigger");
assert.equal(call.subGroupSelector(), "subgroup-selector");
assert.equal(call.suppressedPanelCloses(), "suppressed-panel-closes");
assert.deepEqual(call.syncUrlState("replace"), ["sync-url-state", ["replace"]]);
assert.deepEqual(call.syncVersionRange("through"), [
  "sync-version-range",
  ["through"],
]);
assert.equal(call.themeChoices(), "theme-choices");
assert.equal(call.toggleDeveloperMode, "toggle-developer-mode");
assert.deepEqual(call.toggleVersionMode("selected"), [
  "toggle-version-mode",
  ["selected"],
]);
assert.equal(call.toolbar(), "toolbar");
assert.equal(call.updateOnlineStatus, "update-online-status");
assert.equal(call.urlStateReady(), true);
assert.equal(call.versionModeSelector(), "version-mode-selector");
assert.equal(call.versionModeToggle(), "version-mode-toggle");
assert.equal(call.versionNext(), "version-next");
assert.equal(call.versionPrevious(), "version-previous");
assert.equal(call.versionRange(), "version-range");
assert.equal(call.versionSelector(), "version-selector");
