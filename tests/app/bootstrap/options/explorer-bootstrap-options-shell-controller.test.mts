import assert from "node:assert/strict";
import {
  buildExplorerBootstrapControllerOptions,
  buildExplorerBootstrapShellOptions,
} from "../../../../src/app/bootstrap/explorer-bootstrap-options.js";
import { createBootstrapOptionsFixture } from "./explorer-bootstrap-options-fixture.js";

const { calls, options, state } = createBootstrapOptionsFixture();

const shell = buildExplorerBootstrapShellOptions(options);
assert.equal(shell.normalizeCodePoints, options.normalizeCodePoints);
assert.equal(shell.savePreference, options.savePreference);
assert.equal(shell.translate, options.translate);
assert.equal(shell.state(), state);
assert.equal(shell.modeChoices(), "modeChoices-value");
assert.equal(shell.modeChoices(), "modeChoices-value");
for (const [key, expected] of [
  ["applyingUrlState", "applyingUrlState-value"],
  ["copyStatus", "copyStatus-value"],
  ["developerModeToggle", "developerModeToggle-value"],
  ["dialog", "dialog-value"],
  ["drawList", "drawList-value"],
  ["emojiFontChoices", "emojiFontChoices-value"],
  ["genderCheckboxes", "genderCheckboxes-value"],
  ["getPixelEditor", "getPixelEditor-value"],
  ["hairCheckboxes", "hairCheckboxes-value"],
  ["installAppButton", "installAppButton-value"],
  ["installDialog", "installDialog-value"],
  ["loadVersionData", "loadVersionData-value"],
  ["offlineStatus", "offlineStatus-value"],
  ["orderButtons", "orderButtons-value"],
  ["renderCategoryFilters", "renderCategoryFilters-value"],
  ["renderSearchLanguages", "renderSearchLanguages-value"],
  ["renderVersionModeToggle", "renderVersionModeToggle-value"],
  ["savedDialog", "savedDialog-value"],
  ["skinToneCheckboxes", "skinToneCheckboxes-value"],
  ["suppressDialogCloseSync", "suppressDialogCloseSync-value"],
  ["syncVersionRange", "syncVersionRange-value"],
  ["themeChoices", "themeChoices-value"],
  ["urlStateReady", "urlStateReady-value"],
  ["versionModeSelector", "versionModeSelector-value"],
  ["versionSelector", "versionSelector-value"],
] as const) {
  assert.equal(shell[key](), expected);
}
assert.equal(
  calls.some((call) => call[0] === "state" && call[1].length === 0),
  true,
);
shell.setDialogView("code", false);
shell.showEmoji("wrappedGift", true);
shell.syncUrlState("replace", { ok: true });
assert.deepEqual(calls.slice(-3), [
  ["setDialogView", ["code", false]],
  ["showEmoji", ["wrappedGift", true]],
  ["syncUrlState", ["replace", { ok: true }]],
]);
assert.equal(shell.translate("group", "Group"), "translate-value");
assert.equal(shell.savePreference("theme", "retro"), "savePreference-value");

const controller = buildExplorerBootstrapControllerOptions(options);
assert.equal(controller.animateCopy, options.animateCopy);
assert.equal(controller.applyPixelArtworkClass, options.applyPixelArtworkClass);
assert.equal(
  controller.fullDeveloperModeEnabled(),
  "fullDeveloperModeEnabled-value",
);
assert.equal(
  controller.sequenceTranslationKeys,
  options.sequenceTranslationKeys,
);
assert.equal(controller.unassigned, "\u0000");
assert.equal(controller.state(), state);
for (const [key, expected] of [
  ["activeFilterSummary", "activeFilterSummary-value"],
  ["activeFilterText", "activeFilterText-value"],
  ["applyingUrlState", "applyingUrlState-value"],
  ["compactGroupChoices", "compactGroupChoices-value"],
  ["compactGroupLabel", "compactGroupLabel-value"],
  ["compactSequenceChoices", "compactSequenceChoices-value"],
  ["compactSequenceLabel", "compactSequenceLabel-value"],
  ["compactSubGroupChoices", "compactSubGroupChoices-value"],
  ["compactSubGroupLabel", "compactSubGroupLabel-value"],
  ["groupSelector", "groupSelector-value"],
  ["dialog", "dialog-value"],
  ["drawList", "drawList-value"],
  ["emojiList", "emojiList-value"],
  ["emojiParent", "emojiParent-value"],
  ["ensurePixelEditor", "ensurePixelEditor-value"],
  ["focusInitialEmojiDialogAction", "focusInitialEmojiDialogAction-value"],
  ["genderCheckboxes", "genderCheckboxes-value"],
  ["genderFieldset", "genderFieldset-value"],
  ["groupFilterDialog", "groupFilterDialog-value"],
  ["groupPickerTrigger", "groupPickerTrigger-value"],
  ["hairCheckboxes", "hairCheckboxes-value"],
  ["hairFieldset", "hairFieldset-value"],
  ["helpDialog", "helpDialog-value"],
  ["matchCount", "matchCount-value"],
  ["modifierFilters", "modifierFilters-value"],
  ["nextRenderGeneration", "nextRenderGeneration-value"],
  ["orderButtons", "orderButtons-value"],
  ["panelDialogs", "panelDialogs-value"],
  ["renderCategoryFilters", "renderCategoryFilters-value"],
  ["renderGeneration", "renderGeneration-value"],
  ["searchText", "searchText-value"],
  ["sequenceTypeSelector", "sequenceTypeSelector-value"],
  ["skinToneCheckboxes", "skinToneCheckboxes-value"],
  ["skinToneFieldset", "skinToneFieldset-value"],
  ["subGroupFilterDialog", "subGroupFilterDialog-value"],
  ["subGroupPickerTrigger", "subGroupPickerTrigger-value"],
  ["subGroupSelector", "subGroupSelector-value"],
  ["suppressedPanelCloses", "suppressedPanelCloses-value"],
  ["urlStateReady", "urlStateReady-value"],
  ["versionModeSelector", "versionModeSelector-value"],
  ["versionNext", "versionNext-value"],
  ["versionPrevious", "versionPrevious-value"],
  ["versionRange", "versionRange-value"],
  ["versionRangeValue", "versionRangeValue-value"],
  ["versionSelector", "versionSelector-value"],
] as const) {
  assert.equal(controller[key](), expected);
}
assert.equal(controller.getEmojiGenders("item"), "getEmojiGenders-value");
assert.equal(
  controller.getExplorerSubGroup("item"),
  "getExplorerSubGroup-value",
);
assert.equal(
  controller.getIntroducedVersion("item"),
  "getIntroducedVersion-value",
);
assert.equal(controller.loadPackageManifest(), "loadPackageManifest-value");
assert.equal(controller.recordCopiedEmoji(), "recordCopiedEmoji-value");
assert.equal(
  controller.rebuildEmojiCodePointLookup(),
  "rebuildEmojiCodePointLookup-value",
);
assert.equal(controller.renderSavedEmoji(), "renderSavedEmoji-value");
assert.equal(
  controller.updateEmojiComposition(),
  "updateEmojiComposition-value",
);
assert.equal(
  controller.updateEmojiImportExamples(),
  "updateEmojiImportExamples-value",
);
assert.equal(controller.updateModifierArtwork(), "updateModifierArtwork-value");
assert.equal(
  controller.updatePixelArtworkManifest(),
  "updatePixelArtworkManifest-value",
);
assert.equal(controller.translate("copy", "Copy"), "translate-value");
assert.equal(
  controller.savePreference("order", "popular"),
  "savePreference-value",
);
assert.equal(controller.animateCopy(), "animateCopy-value");
assert.equal(controller.copyToClipboardValue(), "copyToClipboardValue-value");
assert.equal(controller.developerModeEnabled(), "developerModeEnabled-value");
assert.equal(
  controller.displayExplorerLabel("x"),
  "displayExplorerLabel-value",
);
assert.equal(controller.formatNumber(12), "formatNumber-value");
assert.equal(controller.isViteDevelopment, true);
controller.navigateEmoji(2);
controller.openPanel("favorites");
controller.setDialogView("details");
controller.setSuppressDialogCloseSync(true);
controller.showEmoji("partyPopper", false);
controller.updateCompositionBackButton("left");
controller.updateDialogNavigation("previous", "next");
controller.syncUrlState("push", { next: true });
assert.deepEqual(calls.slice(-8), [
  ["navigateEmoji", [2]],
  ["openPanel", ["favorites"]],
  ["setDialogView", ["details"]],
  ["setSuppressDialogCloseSync", [true]],
  ["showEmoji", ["partyPopper", false]],
  ["updateCompositionBackButton", ["left"]],
  ["updateDialogNavigation", ["previous", "next"]],
  ["syncUrlState", ["push", { next: true }]],
]);
