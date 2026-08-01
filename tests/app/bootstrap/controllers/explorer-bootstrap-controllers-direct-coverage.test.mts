import assert from "node:assert/strict";
import { createExplorerBootstrapControllersWithFactories } from "../../../../src/app/bootstrap/explorer-bootstrap-controllers.js";
import { createExplorerBootstrapControllersRuntimeFixture } from "./explorer-bootstrap-controllers-runtime-fixture.js";

const { calls, options, state } =
  createExplorerBootstrapControllersRuntimeFixture();

let categoryOptions: any;
let listOptions: any;
let versionOptions: any;
let navigationOptions: any;
let dialogViewOptions: any;
let dialogClickOptions: any;

const controllers = createExplorerBootstrapControllersWithFactories(options, {
  createCategoryController(config: any) {
    categoryOptions = config;
    return {
      buildRepresentatives: (...args: any[]) => [
        "buildRepresentatives",
        ...args,
      ],
      displayGroupName: (value: string) => `group:${value}`,
      displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
      onGroupSelectorChange: (...args: any[]) => ["groupChange", ...args],
      onSequenceTypeSelectorChange: (...args: any[]) => [
        "sequenceChange",
        ...args,
      ],
      onSubGroupSelectorChange: (...args: any[]) => ["subGroupChange", ...args],
      renderCategoryFilters: (...args: any[]) => [
        "renderCategoryFilters",
        ...args,
      ],
      subGroupSelectionKey: (...args: any[]) => args.join(":"),
    };
  },
  createListOrchestration(config: any) {
    listOptions = config;
    return {
      drawList: (...args: any[]) => ["drawList", ...args],
    };
  },
  createVersionRuntime(config: any) {
    versionOptions = config;
    return {
      getVersionKeys: () => "version-keys",
      syncVersionRange: (...args: any[]) => ["syncVersionRange", ...args],
      versionSliderLabel: (...args: any[]) => args.join(":"),
    };
  },
  createNavigationRuntime(config: any) {
    navigationOptions = config;
    return {
      applyLoadedUrlState: (...args: any[]) => ["applyLoadedUrlState", ...args],
    };
  },
  createDialogViewRuntime(config: any) {
    dialogViewOptions = config;
    return {
      setView: (...args: any[]) => ["setView", ...args],
    };
  },
  createEmojiDialogClickRuntime(config: any) {
    dialogClickOptions = config;
    return () => config;
  },
});

assert.equal(categoryOptions.getVersionKeys(), "version-keys");
assert.deepEqual(categoryOptions.syncVersionRange("17.0"), [
  "syncVersionRange",
]);
for (const [key, expected] of [
  ["compactGroupChoices", "compact-group-choices"],
  ["compactGroupLabel", "compact-group-label"],
  ["compactSequenceChoices", "compact-sequence-choices"],
  ["compactSequenceLabel", "compact-sequence-label"],
  ["compactSubGroupChoices", "compact-subgroup-choices"],
  ["compactSubGroupLabel", "compact-subgroup-label"],
  ["drawList", "drawList-option"],
  ["groupFilterDialog", "group-dialog"],
  ["groupPickerTrigger", "group-trigger"],
  ["groupSelector", "group-selector"],
  ["sequenceTypeSelector", "sequence-selector"],
  ["state", state],
  ["subGroupFilterDialog", "subgroup-dialog"],
  ["subGroupPickerTrigger", "subgroup-trigger"],
  ["subGroupSelector", "subgroup-selector"],
] as const) {
  assert.deepEqual(categoryOptions[key](), expected);
}
assert.equal(categoryOptions.developerModeEnabled(), true);
assert.deepEqual(categoryOptions.orderButtons(), ["order-buttons"]);
assert.equal(categoryOptions.translate("a", "b"), "a:b");

assert.equal(listOptions.getVersionKeys(), "version-keys");
assert.equal(listOptions.renderGeneration(), 7);
assert.equal(listOptions.versionSliderLabel("16.0", "17.0"), "16.0:17.0");
for (const [key, expected] of [
  ["activeFilterSummary", "summary"],
  ["activeFilterText", "summary-text"],
  ["emojiList", "emoji-list"],
  ["getIntroducedVersion", "17.0"],
  ["matchCount", "match-count"],
  ["nextRenderGeneration", 7],
  ["resetFilters", "reset-filters"],
  ["revealExplorer", "reveal-explorer"],
  ["searchText", "search-text"],
  ["state", state],
  ["versionModeSelector", "version-mode-selector"],
  ["versionSelector", "version-selector"],
] as const) {
  assert.deepEqual(listOptions[key](), expected);
}
assert.equal(listOptions.applyPixelArtworkClass, "apply-pixel");
assert.equal(listOptions.displayExplorerLabel("x"), "explorer:x");
assert.equal(listOptions.displayGroupName("Objects"), "group:Objects");
assert.equal(listOptions.displayUnicodeSubGroupName("money"), "sub:money");
assert.equal(listOptions.formatNumber(5), "fmt:5");
assert.deepEqual(listOptions.genderCheckboxes(), ["gender"]);
assert.deepEqual(listOptions.hairCheckboxes(), ["hair"]);
assert.equal(listOptions.onClick, "on-click");
assert.deepEqual(listOptions.skinToneCheckboxes(), ["skin"]);
assert.equal(
  listOptions.subGroupSelectionKey("Objects", "money"),
  "Objects:money",
);
assert.deepEqual(listOptions.syncUrlState("replace"), [
  "syncUrlState",
  "replace",
]);
assert.equal(listOptions.translate("copy", "Copy"), "copy:Copy");
assert.equal(listOptions.unassigned, "unassigned");
assert.equal(listOptions.updateDialogNavigation(), "updateDialogNavigation");

assert.deepEqual(versionOptions.applyLoadedUrlState("replace"), [
  "applyLoadedUrlState",
  "replace",
]);
assert.deepEqual(versionOptions.drawList("wrappedGift"), [
  "drawList",
  "wrappedGift",
]);
for (const [key, expected] of [
  ["developerModeEnabled", true],
  ["getExplorerSubGroup", "explorer-subgroup"],
  ["getIntroducedVersion", "17.0"],
  ["groupSelector", "group-selector"],
  ["genderFieldset", "gender-fieldset"],
  ["hairFieldset", "hair-fieldset"],
  ["modifierFilters", "modifier-filters"],
  ["sequenceTypeSelector", "sequence-selector"],
  ["skinToneFieldset", "skin-fieldset"],
  ["state", state],
  ["subGroupSelector", "subgroup-selector"],
  ["versionModeSelector", "version-mode-selector"],
  ["versionNext", "version-next"],
  ["versionPrevious", "version-previous"],
  ["versionRange", "version-range"],
  ["versionRangeValue", "version-range-value"],
  ["versionSelector", "version-selector"],
] as const) {
  assert.deepEqual(versionOptions[key](), expected);
}
assert.deepEqual(versionOptions.getEmojiGenders("x"), ["genders", "x"]);
assert.deepEqual(versionOptions.genderCheckboxes(), ["gender"]);
assert.deepEqual(versionOptions.hairCheckboxes(), ["hair"]);
assert.equal(versionOptions.isViteDevelopment, true);
assert.equal(versionOptions.onClick, "on-click");
assert.deepEqual(versionOptions.onGroupChange("gift"), ["groupChange", "gift"]);
assert.deepEqual(versionOptions.onSequenceTypeChange("single"), [
  "sequenceChange",
  "single",
]);
assert.deepEqual(versionOptions.onSubGroupChange("money"), [
  "subGroupChange",
  "money",
]);
assert.equal(versionOptions.rebuildCodePointLookup, "rebuild-lookup");
assert.deepEqual(versionOptions.renderCategoryFilters("Objects"), [
  "renderCategoryFilters",
  "Objects",
]);
assert.deepEqual(versionOptions.setDialogView("code"), [
  "setDialogView",
  "code",
]);
assert.deepEqual(versionOptions.skinToneCheckboxes(), ["skin"]);
assert.equal(versionOptions.translate("copy", "Copy"), "copy:Copy");
assert.equal(versionOptions.updateModifierArtwork, "updateModifierArtwork");
assert.equal(
  versionOptions.updatePixelArtworkManifest,
  "updatePixelArtworkManifest",
);

assert.equal(navigationOptions.compositionMode(), "full");
assert.equal(navigationOptions.currentEmojiKey(), "wrappedGift");
assert.equal(
  navigationOptions.fullDeveloperModeEnabled(),
  "full-developer-mode",
);
assert.equal(navigationOptions.ensurePanelDialog(), "ensure-panel-dialog");
assert.equal(navigationOptions.getOrderMode(), "grouped");
assert.equal(navigationOptions.getSelectedGroup(), "Objects");
assert.equal(navigationOptions.getSelectedSequenceType(), "single");
assert.equal(navigationOptions.getSelectedSubGroup(), "money");
assert.deepEqual(navigationOptions.groups(), ["Objects"]);
assert.deepEqual(navigationOptions.displayedKeys(), [
  "wrappedGift",
  "sparkles",
]);
assert.equal(navigationOptions.developerModeEnabled(), true);
assert.deepEqual(navigationOptions.dialog(), { open: true });
assert.deepEqual(navigationOptions.drawList("wrappedGift"), [
  "drawList",
  "wrappedGift",
]);
assert.deepEqual(navigationOptions.emojiByKey(), state.emojiByKey);
assert.equal(navigationOptions.focusInitialAction(), "focus-initial");
assert.deepEqual(navigationOptions.genderCheckboxes(), ["gender"]);
assert.deepEqual(navigationOptions.hairCheckboxes(), ["hair"]);
assert.equal(navigationOptions.helpDialog(), "help-dialog");
assert.equal(navigationOptions.languageList(), "language-list");
assert.equal(navigationOptions.latestReleasedVersion(), "17.0");
assert.equal(navigationOptions.navigateEmoji(2), "navigate:2");
assert.deepEqual(navigationOptions.orderButtons(), ["order-buttons"]);
assert.deepEqual(navigationOptions.panelDialogs(), { help: "help-panel" });
assert.equal(navigationOptions.preferredOrder(), "grouped");
assert.deepEqual(navigationOptions.renderCategoryFilters("Objects"), [
  "renderCategoryFilters",
  "Objects",
]);
assert.equal(navigationOptions.renderSavedEmoji, "render-saved-emoji");
assert.equal(
  navigationOptions.renderVersionModeToggle(),
  "render-version-toggle",
);
assert.equal(navigationOptions.searchText(), "search-text");
navigationOptions.setCompositionMode("condensed");
navigationOptions.setOrderMode("unicode");
navigationOptions.setSelectedGroup("Smileys");
navigationOptions.setSelectedSequenceType("zwj");
navigationOptions.setSelectedSubGroup("face-smiling");
assert.equal(state.compositionMode, "condensed");
assert.equal(state.orderMode, "unicode");
assert.equal(state.selectedGroup, "Smileys");
assert.equal(state.selectedSequenceType, "zwj");
assert.equal(state.selectedSubGroup, "face-smiling");
assert.deepEqual(navigationOptions.setDialogView("details"), [
  "setDialogView",
  "details",
]);
navigationOptions.setSuppressDialogCloseSync(true);
assert.equal(calls.includes("setSuppressDialogCloseSync:true"), true);
assert.deepEqual(navigationOptions.showEmoji("wrappedGift"), [
  "showEmoji",
  "wrappedGift",
]);
assert.deepEqual(navigationOptions.skinToneCheckboxes(), ["skin"]);
assert.equal(
  navigationOptions.subGroupSelectionKey("Objects", "money"),
  "Objects:money",
);
assert.deepEqual(navigationOptions.subGroups(), { Objects: ["money"] });
assert.equal(
  navigationOptions.suppressedPanelCloses(),
  "suppressed-panel-closes",
);
assert.deepEqual(navigationOptions.syncVersionRange("18.0"), [
  "syncVersionRange",
  "18.0",
]);
assert.equal(navigationOptions.urlStateReady(), true);
assert.equal(navigationOptions.versionModeSelector(), "version-mode-selector");
assert.equal(navigationOptions.versionRange(), "version-range");
assert.equal(navigationOptions.versionSelector(), "version-selector");

assert.deepEqual(dialogViewOptions.byId(), state.byId);
assert.deepEqual(dialogViewOptions.currentDialogParentStack(), ["favorites"]);
assert.equal(dialogViewOptions.currentEmojiKey(), "wrappedGift");
assert.equal(dialogViewOptions.developerModeEnabled(), true);
assert.equal(
  dialogViewOptions.fullDeveloperModeEnabled(),
  "full-developer-mode",
);
assert.deepEqual(dialogViewOptions.emojiByKey(), state.emojiByKey);
assert.deepEqual(dialogViewOptions.dialog(), { open: true });
assert.equal(dialogViewOptions.emojiParent(), "emoji-parent");
assert.equal(dialogViewOptions.ensurePixelEditor(), "ensure-pixel-editor");
assert.equal(dialogViewOptions.getPixelEditor(), "pixel-editor");
assert.equal(dialogViewOptions.loadPackageManifest(), "loadPackageManifest");
assert.deepEqual(dialogViewOptions.syncUrlState("push"), [
  "syncUrlState",
  "push",
]);
assert.equal(dialogViewOptions.translate("copy", "Copy"), "copy:Copy");
assert.deepEqual(dialogViewOptions.updateCompositionBackButton("left"), [
  "updateCompositionBackButton",
  "left",
]);
assert.equal(
  dialogViewOptions.updateImportExamples,
  "update-emoji-import-examples",
);

assert.deepEqual(dialogClickOptions.byId(), state.byId);
assert.deepEqual(dialogClickOptions.currentDialogParentStack(), ["favorites"]);
assert.deepEqual(dialogClickOptions.currentEmojiCopies(), { emoji: "🎁" });
assert.equal(dialogClickOptions.currentEmojiKey(), "wrappedGift");
assert.equal(dialogClickOptions.animateCopy, options.animateCopy);
assert.equal(dialogClickOptions.copy, "copyToClipboardValue");
assert.deepEqual(dialogClickOptions.dialog(), { open: true });
assert.deepEqual(dialogClickOptions.emojiByKey(), state.emojiByKey);
assert.equal(dialogClickOptions.languageList(), "language-list");
assert.equal(dialogClickOptions.openPanel, "open-panel");
assert.deepEqual(dialogClickOptions.panelDialogs(), { help: "help-panel" });
assert.equal(dialogClickOptions.recordCopiedEmoji, "record-copied-emoji");
assert.equal(dialogClickOptions.renderSavedEmoji, "render-saved-emoji");
dialogClickOptions.setSuppressDialogCloseSync(false);
assert.equal(calls.includes("setSuppressDialogCloseSync:false"), true);
assert.deepEqual(dialogClickOptions.setView("code"), ["setView", "code"]);
assert.deepEqual(dialogClickOptions.showEmoji("sparkles"), [
  "showEmoji",
  "sparkles",
]);
assert.deepEqual(dialogClickOptions.syncUrlState("replace"), [
  "syncUrlState",
  "replace",
]);
dialogClickOptions.toggleComposition();
assert.equal(state.compositionMode, "full");
assert.equal(dialogClickOptions.toggleFavorite, "toggle-favorite");
assert.equal(dialogClickOptions.translate("copy", "Copy"), "copy:Copy");
assert.deepEqual(dialogClickOptions.updateCompositionBackButton("left"), [
  "updateCompositionBackButton",
  "left",
]);
assert.equal(
  dialogClickOptions.updateEmojiComposition,
  "update-emoji-composition",
);
dialogClickOptions.clearCurrentDialogParentStack();
assert.deepEqual(state.currentDialogParentStack, []);

assert.equal(typeof controllers.onEmojiDialogClick, "function");
