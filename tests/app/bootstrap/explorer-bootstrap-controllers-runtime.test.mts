import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createExplorerBootstrapControllersRuntimeFixture } from "./controllers/explorer-bootstrap-controllers-runtime-fixture.js";

const root = process.cwd();
const sourcePath = path.join(
  root,
  "build/src/app/bootstrap/explorer-bootstrap-controllers.js",
);
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source
  .replace(
    'import * as preferences from "../../preferences.js";',
    'import * as preferences from "./preferences-stub.mjs";',
  )
  .replace(
    'import { createCategoryController } from "../category-controller.js";',
    'import { createCategoryController, categoryCalls } from "./category-controller-stub.mjs";',
  )
  .replace(
    'import { createVersionRuntime } from "../version/version-runtime.js";',
    'import { createVersionRuntime, versionCalls } from "./version-runtime-stub.mjs";',
  )
  .replace(
    'import { createListOrchestration } from "../list-orchestration.js";',
    'import { createListOrchestration, listCalls } from "./list-orchestration-stub.mjs";',
  )
  .replace(
    'import { createNavigationRuntime } from "../navigation-runtime.js";',
    'import { createNavigationRuntime, navigationCalls } from "./navigation-runtime-stub.mjs";',
  )
  .replace(
    'import { createDialogViewRuntime } from "../dialog/dialog-view-runtime.js";',
    'import { createDialogViewRuntime, dialogViewCalls } from "./dialog-view-runtime-stub.mjs";',
  )
  .replace(
    'import { createEmojiDialogClickRuntime } from "../emoji/emoji-dialog-click-runtime.js";',
    'import { createEmojiDialogClickRuntime, dialogClickCalls } from "./emoji-dialog-click-runtime-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "explorer-bootstrap-controllers-runtime-"),
);

await fs.writeFile(
  path.join(tempDirectory, "preferences-stub.mjs"),
  `export const preferenceCalls = [];
export const getString = (name) => {
  preferenceCalls.push(["getString", name]);
  return name === "order" ? "grouped" : "";
};`,
);

await fs.writeFile(
  path.join(tempDirectory, "category-controller-stub.mjs"),
  `export const categoryCalls = [];
export function createCategoryController(options) {
  categoryCalls.push(options);
  return {
    buildRepresentatives: (...args) => ["buildRepresentatives", ...args],
    closeFilterPicker: () => "closeFilterPicker",
    displayGroupName: (value) => "group:" + value,
    displayUnicodeSubGroupName: (value) => "sub:" + value,
    focusCompactChoice: () => "focusCompactChoice",
    getGroupRepresentativeEmoji: () => "😀",
    getSubGroupRepresentativeEmoji: () => "🎁",
    onCompactChoiceKeyDown: () => "onCompactChoiceKeyDown",
    onGroupSelectorChange: (...args) => ["onGroupSelectorChange", ...args],
    onSequenceTypeSelectorChange: (...args) => ["onSequenceTypeSelectorChange", ...args],
    onSubGroupSelectorChange: (...args) => ["onSubGroupSelectorChange", ...args],
    openFilterPicker: () => "openFilterPicker",
    renderCategoryFilters: (...args) => ["renderCategoryFilters", ...args],
    subGroupSelectionKey: (...args) => ["subGroupSelectionKey", ...args].join(":"),
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "version-runtime-stub.mjs"),
  `export const versionCalls = [];
export function createVersionRuntime(options) {
  versionCalls.push(options);
  return {
    getVersionKeys: () => "version-keys",
    loadVersionData: () => "loadVersionData",
    syncVersionRange: (...args) => ["syncVersionRange", ...args],
    updateAvailableCategories: () => "updateAvailableCategories",
    versionSliderLabel: (...args) => ["versionSliderLabel", ...args].join(":"),
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "list-orchestration-stub.mjs"),
  `export const listCalls = [];
export function createListOrchestration(options) {
  listCalls.push(options);
  return {
    drawList: (...args) => ["drawList", ...args],
    onEmojiFocus: () => "onEmojiFocus",
    onEmojiKeyDown: () => "onEmojiKeyDown",
    refreshLocalizedLabels: () => "refreshLocalizedLabels",
    scheduleSearchDraw: () => "scheduleSearchDraw",
    updateActiveFilterSummary: () => "updateActiveFilterSummary",
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "navigation-runtime-stub.mjs"),
  `export const navigationCalls = [];
export function createNavigationRuntime(options) {
  navigationCalls.push(options);
  return {
    applyLoadedUrlState: (...args) => ["applyLoadedUrlState", ...args],
    focusInitialAction: () => "focusInitialAction",
    onOrderModeChange: () => "onOrderModeChange",
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "dialog-view-runtime-stub.mjs"),
  `export const dialogViewCalls = [];
export function createDialogViewRuntime(options) {
  dialogViewCalls.push(options);
  return {
    setView: (...args) => ["setView", ...args],
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "emoji-dialog-click-runtime-stub.mjs"),
  `export const dialogClickCalls = [];
export function createEmojiDialogClickRuntime(options) {
  dialogClickCalls.push(options);
  return function onEmojiDialogClick() {
    return options;
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "explorer-bootstrap-controllers.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-bootstrap-controllers.mjs"))
    .href
);
const categoryStub = await import(
  pathToFileURL(path.join(tempDirectory, "category-controller-stub.mjs")).href
);
const versionStub = await import(
  pathToFileURL(path.join(tempDirectory, "version-runtime-stub.mjs")).href
);
const listStub = await import(
  pathToFileURL(path.join(tempDirectory, "list-orchestration-stub.mjs")).href
);
const navigationStub = await import(
  pathToFileURL(path.join(tempDirectory, "navigation-runtime-stub.mjs")).href
);
const dialogViewStub = await import(
  pathToFileURL(path.join(tempDirectory, "dialog-view-runtime-stub.mjs")).href
);
const dialogClickStub = await import(
  pathToFileURL(path.join(tempDirectory, "emoji-dialog-click-runtime-stub.mjs"))
    .href
);

const { calls, options, state } =
  createExplorerBootstrapControllersRuntimeFixture();

const controllers = module.createExplorerBootstrapControllers(options);

const categoryOptions = categoryStub.categoryCalls[0];
const listOptions = listStub.listCalls[0];
const versionOptions = versionStub.versionCalls[0];
const navigationOptions = navigationStub.navigationCalls[0];
const dialogViewOptions = dialogViewStub.dialogViewCalls[0];
const dialogClickOptions = dialogClickStub.dialogClickCalls[0];

assert.equal(categoryOptions.compactGroupChoices(), "compact-group-choices");
assert.equal(categoryOptions.compactGroupLabel(), "compact-group-label");
assert.equal(
  categoryOptions.compactSequenceChoices(),
  "compact-sequence-choices",
);
assert.equal(categoryOptions.compactSequenceLabel(), "compact-sequence-label");
assert.equal(
  categoryOptions.compactSubGroupChoices(),
  "compact-subgroup-choices",
);
assert.equal(categoryOptions.compactSubGroupLabel(), "compact-subgroup-label");
assert.equal(categoryOptions.developerModeEnabled(), true);
assert.equal(categoryOptions.drawList(), "drawList-option");
assert.equal(categoryOptions.getVersionKeys(), "version-keys");
assert.equal(categoryOptions.groupFilterDialog(), "group-dialog");
assert.equal(categoryOptions.groupPickerTrigger(), "group-trigger");
assert.equal(categoryOptions.groupSelector(), "group-selector");
assert.deepEqual(categoryOptions.orderButtons(), ["order-buttons"]);
assert.deepEqual(categoryOptions.sequenceTranslationKeys, { single: "single" });
assert.deepEqual(categoryOptions.sequenceTypeEmoji, { single: "1️⃣" });
assert.deepEqual(categoryOptions.sequenceTypeLabels, { single: "Single" });
assert.deepEqual(categoryOptions.sequenceTypeOrder, ["single"]);
assert.equal(categoryOptions.sequenceTypeSelector(), "sequence-selector");
assert.equal(categoryOptions.subGroupFilterDialog(), "subgroup-dialog");
assert.equal(categoryOptions.subGroupPickerTrigger(), "subgroup-trigger");
assert.equal(categoryOptions.subGroupSelector(), "subgroup-selector");
assert.deepEqual(categoryOptions.syncVersionRange(), ["syncVersionRange"]);
assert.equal(categoryOptions.translate("x", "y"), "x:y");
assert.deepEqual(categoryOptions.unicodeGroupLabelKeys, { Objects: "objects" });
assert.deepEqual(categoryOptions.unicodeSubgroupLabelKeys, { money: "money" });

assert.equal(listOptions.activeFilterSummary(), "summary");
assert.equal(listOptions.activeFilterText(), "summary-text");
assert.equal(listOptions.applyPixelArtworkClass, "apply-pixel");
assert.equal(listOptions.displayExplorerLabel("x"), "explorer:x");
assert.equal(listOptions.displayGroupName("Objects"), "group:Objects");
assert.equal(listOptions.displayUnicodeSubGroupName("money"), "sub:money");
assert.equal(listOptions.emojiList(), "emoji-list");
assert.equal(listOptions.formatNumber(5), "fmt:5");
assert.deepEqual(listOptions.genderCheckboxes(), ["gender"]);
assert.equal(listOptions.getIntroducedVersion(), "17.0");
assert.equal(listOptions.getVersionKeys(), "version-keys");
assert.deepEqual(listOptions.hairCheckboxes(), ["hair"]);
assert.equal(listOptions.matchCount(), "match-count");
assert.equal(listOptions.nextRenderGeneration(), 7);
assert.equal(listOptions.onClick, "on-click");
assert.equal(listOptions.renderGeneration(), 7);
assert.equal(listOptions.resetFilters(), "reset-filters");
assert.equal(listOptions.revealExplorer(), "reveal-explorer");
assert.equal(listOptions.searchText(), "search-text");
assert.deepEqual(listOptions.sequenceTranslationKeys, { single: "single" });
assert.deepEqual(listOptions.sequenceTypeLabels, { single: "Single" });
assert.deepEqual(listOptions.sequenceTypeOrder, ["single"]);
assert.deepEqual(listOptions.skinToneCheckboxes(), ["skin"]);
assert.equal(
  listOptions.subGroupSelectionKey("Objects", "money"),
  "subGroupSelectionKey:Objects:money",
);
assert.deepEqual(listOptions.syncUrlState(), ["syncUrlState"]);
assert.equal(listOptions.translate("x", "y"), "x:y");
assert.equal(listOptions.unassigned, "unassigned");
assert.equal(listOptions.updateDialogNavigation(), "updateDialogNavigation");
assert.equal(listOptions.versionModeSelector(), "version-mode-selector");
assert.equal(listOptions.versionSelector(), "version-selector");
assert.equal(
  listOptions.versionSliderLabel("a", "b"),
  "versionSliderLabel:a:b",
);

assert.deepEqual(versionOptions.applyLoadedUrlState("x"), [
  "applyLoadedUrlState",
  "x",
]);
assert.deepEqual(versionOptions.buildRepresentatives("x"), [
  "buildRepresentatives",
  "x",
]);
assert.equal(versionOptions.developerModeEnabled(), true);
assert.deepEqual(versionOptions.drawList("x"), ["drawList", "x"]);
assert.deepEqual(versionOptions.getEmojiGenders("x"), ["genders", "x"]);
assert.equal(versionOptions.getExplorerSubGroup(), "explorer-subgroup");
assert.equal(versionOptions.getIntroducedVersion(), "17.0");
assert.equal(versionOptions.groupSelector(), "group-selector");
assert.deepEqual(versionOptions.genderCheckboxes(), ["gender"]);
assert.equal(versionOptions.genderFieldset(), "gender-fieldset");
assert.deepEqual(versionOptions.hairCheckboxes(), ["hair"]);
assert.equal(versionOptions.hairFieldset(), "hair-fieldset");
assert.equal(versionOptions.isViteDevelopment, true);
assert.equal(versionOptions.modifierFilters(), "modifier-filters");
assert.equal(versionOptions.onClick, "on-click");
assert.deepEqual(versionOptions.onGroupChange("x"), [
  "onGroupSelectorChange",
  "x",
]);
assert.deepEqual(versionOptions.onSequenceTypeChange("x"), [
  "onSequenceTypeSelectorChange",
  "x",
]);
assert.deepEqual(versionOptions.onSubGroupChange("x"), [
  "onSubGroupSelectorChange",
  "x",
]);
assert.equal(versionOptions.rebuildCodePointLookup, "rebuild-lookup");
assert.deepEqual(versionOptions.renderCategoryFilters("x"), [
  "renderCategoryFilters",
  "x",
]);
assert.equal(versionOptions.sequenceTypeSelector(), "sequence-selector");
assert.deepEqual(versionOptions.setDialogView("code"), [
  "setDialogView",
  "code",
]);
assert.deepEqual(versionOptions.skinToneCheckboxes(), ["skin"]);
assert.equal(versionOptions.skinToneFieldset(), "skin-fieldset");
assert.equal(versionOptions.subGroupSelector(), "subgroup-selector");
assert.equal(versionOptions.translate("x", "y"), "x:y");
assert.equal(versionOptions.updateModifierArtwork, "updateModifierArtwork");
assert.equal(
  versionOptions.updatePixelArtworkManifest,
  "updatePixelArtworkManifest",
);
assert.equal(versionOptions.versionModeSelector(), "version-mode-selector");
assert.equal(versionOptions.versionNext(), "version-next");
assert.equal(versionOptions.versionPrevious(), "version-previous");
assert.equal(versionOptions.versionRange(), "version-range");
assert.equal(versionOptions.versionRangeValue(), "version-range-value");
assert.equal(versionOptions.versionSelector(), "version-selector");

assert.deepEqual(navigationOptions.allowedSequenceTypes, ["single"]);
assert.equal(navigationOptions.applyingUrlState(), false);
assert.equal(navigationOptions.compositionMode(), "full");
assert.equal(navigationOptions.currentEmojiKey(), "wrappedGift");
assert.equal(navigationOptions.developerModeEnabled(), true);
assert.equal(
  navigationOptions.fullDeveloperModeEnabled(),
  "full-developer-mode",
);
assert.deepEqual(navigationOptions.dialog(), { open: true });
assert.deepEqual(navigationOptions.displayedKeys(), [
  "wrappedGift",
  "sparkles",
]);
assert.deepEqual(navigationOptions.drawList("x"), ["drawList", "x"]);
assert.equal(navigationOptions.ensurePanelDialog(), "ensure-panel-dialog");
assert.deepEqual(navigationOptions.emojiByKey(), {
  wrappedGift: "🎁",
  sparkles: "✨",
});
assert.equal(navigationOptions.focusInitialAction(), "focus-initial");
assert.deepEqual(navigationOptions.genderCheckboxes(), ["gender"]);
assert.equal(navigationOptions.getOrderMode(), "grouped");
assert.equal(navigationOptions.getSelectedGroup(), "Objects");
assert.equal(navigationOptions.getSelectedSequenceType(), "single");
assert.equal(navigationOptions.getSelectedSubGroup(), "money");
assert.deepEqual(navigationOptions.groups(), ["Objects"]);
assert.deepEqual(navigationOptions.hairCheckboxes(), ["hair"]);
assert.equal(navigationOptions.helpDialog(), "help-dialog");
assert.equal(navigationOptions.languageList(), "language-list");
assert.equal(navigationOptions.latestReleasedVersion(), "17.0");
assert.equal(navigationOptions.navigateEmoji(2), "navigate:2");
assert.deepEqual(navigationOptions.orderButtons(), ["order-buttons"]);
assert.deepEqual(navigationOptions.panelDialogs(), { help: "help-panel" });
assert.equal(navigationOptions.preferredOrder(), "grouped");
assert.deepEqual(navigationOptions.renderCategoryFilters("x"), [
  "renderCategoryFilters",
  "x",
]);
assert.equal(navigationOptions.renderSavedEmoji, "render-saved-emoji");
assert.equal(
  navigationOptions.renderVersionModeToggle(),
  "render-version-toggle",
);
assert.equal(navigationOptions.searchText(), "search-text");
navigationOptions.setCompositionMode("condensed");
assert.equal(state.compositionMode, "condensed");
assert.deepEqual(navigationOptions.setDialogView("details"), [
  "setDialogView",
  "details",
]);
navigationOptions.setOrderMode("unicode");
assert.equal(state.orderMode, "unicode");
navigationOptions.setSelectedGroup("Smileys");
assert.equal(state.selectedGroup, "Smileys");
navigationOptions.setSelectedSequenceType("zwj");
assert.equal(state.selectedSequenceType, "zwj");
navigationOptions.setSelectedSubGroup("face-smiling");
assert.equal(state.selectedSubGroup, "face-smiling");
navigationOptions.setSuppressDialogCloseSync(true);
assert.equal(calls.includes("setSuppressDialogCloseSync:true"), true);
assert.deepEqual(navigationOptions.showEmoji("wrappedGift"), [
  "showEmoji",
  "wrappedGift",
]);
assert.deepEqual(navigationOptions.skinToneCheckboxes(), ["skin"]);
assert.equal(
  navigationOptions.subGroupSelectionKey("Objects", "money"),
  "subGroupSelectionKey:Objects:money",
);
assert.deepEqual(navigationOptions.subGroups(), { Objects: ["money"] });
assert.equal(
  navigationOptions.suppressedPanelCloses(),
  "suppressed-panel-closes",
);
assert.deepEqual(navigationOptions.syncVersionRange("x"), [
  "syncVersionRange",
  "x",
]);
assert.equal(navigationOptions.urlStateReady(), true);
assert.equal(navigationOptions.versionModeSelector(), "version-mode-selector");
assert.equal(navigationOptions.versionRange(), "version-range");
assert.equal(navigationOptions.versionSelector(), "version-selector");

assert.deepEqual(dialogViewOptions.byId(), {
  wrappedGift: { key: "wrappedGift" },
});
assert.deepEqual(dialogViewOptions.currentDialogParentStack(), ["favorites"]);
assert.equal(dialogViewOptions.currentEmojiKey(), "wrappedGift");
assert.equal(dialogViewOptions.developerModeEnabled(), true);
assert.equal(
  dialogViewOptions.fullDeveloperModeEnabled(),
  "full-developer-mode",
);
assert.deepEqual(dialogViewOptions.dialog(), { open: true });
assert.deepEqual(dialogViewOptions.emojiByKey(), {
  wrappedGift: "🎁",
  sparkles: "✨",
});
assert.equal(dialogViewOptions.emojiParent(), "emoji-parent");
assert.equal(dialogViewOptions.ensurePixelEditor(), "ensure-pixel-editor");
assert.equal(dialogViewOptions.getPixelEditor(), "pixel-editor");
assert.equal(dialogViewOptions.loadPackageManifest(), "loadPackageManifest");
assert.deepEqual(dialogViewOptions.syncUrlState("x"), ["syncUrlState", "x"]);
assert.equal(dialogViewOptions.translate("x", "y"), "x:y");
assert.deepEqual(dialogViewOptions.updateCompositionBackButton("x"), [
  "updateCompositionBackButton",
  "x",
]);
assert.equal(
  dialogViewOptions.updateImportExamples,
  "update-emoji-import-examples",
);

assert.equal(dialogClickOptions.animateCopy, options.animateCopy);
assert.deepEqual(dialogClickOptions.byId(), {
  wrappedGift: { key: "wrappedGift" },
});
assert.equal(dialogClickOptions.copy, "copyToClipboardValue");
assert.deepEqual(dialogClickOptions.currentDialogParentStack(), ["favorites"]);
assert.deepEqual(dialogClickOptions.currentEmojiCopies(), { emoji: "🎁" });
assert.equal(dialogClickOptions.currentEmojiKey(), "wrappedGift");
assert.deepEqual(dialogClickOptions.dialog(), { open: true });
assert.deepEqual(dialogClickOptions.emojiByKey(), {
  wrappedGift: "🎁",
  sparkles: "✨",
});
assert.equal(dialogClickOptions.languageList(), "language-list");
assert.equal(dialogClickOptions.openPanel, "open-panel");
assert.equal(dialogClickOptions.recordCopiedEmoji, "record-copied-emoji");
assert.equal(dialogClickOptions.renderSavedEmoji, "render-saved-emoji");
assert.deepEqual(dialogClickOptions.panelDialogs(), { help: "help-panel" });
dialogClickOptions.setSuppressDialogCloseSync(false);
assert.equal(calls.includes("setSuppressDialogCloseSync:false"), true);
assert.deepEqual(dialogClickOptions.setView("code"), ["setView", "code"]);
assert.deepEqual(dialogClickOptions.showEmoji("sparkles"), [
  "showEmoji",
  "sparkles",
]);
assert.deepEqual(dialogClickOptions.syncUrlState("y"), ["syncUrlState", "y"]);
assert.equal(state.compositionMode, "condensed");
dialogClickOptions.toggleComposition();
assert.equal(state.compositionMode, "full");
assert.equal(dialogClickOptions.toggleFavorite, "toggle-favorite");
assert.equal(dialogClickOptions.translate("x", "y"), "x:y");
assert.deepEqual(dialogClickOptions.updateCompositionBackButton(), [
  "updateCompositionBackButton",
]);
assert.equal(
  dialogClickOptions.updateEmojiComposition,
  "update-emoji-composition",
);
dialogClickOptions.clearCurrentDialogParentStack();
assert.deepEqual(state.currentDialogParentStack, []);

assert.equal(typeof controllers.onEmojiDialogClick, "function");
assert.deepEqual(controllers.buildRepresentatives("sparkles"), [
  "buildRepresentatives",
  "sparkles",
]);
for (const [method, expected] of [
  ["closeFilterPicker", "closeFilterPicker"],
  ["focusInitialAction", "focusInitialAction"],
  ["focusCompactChoice", "focusCompactChoice"],
  ["getGroupRepresentativeEmoji", "😀"],
  ["getSubGroupRepresentativeEmoji", "🎁"],
  ["getVersionKeys", "version-keys"],
  ["loadVersionData", "loadVersionData"],
  ["onCompactChoiceKeyDown", "onCompactChoiceKeyDown"],
  ["onEmojiFocus", "onEmojiFocus"],
  ["onEmojiKeyDown", "onEmojiKeyDown"],
  ["onOrderModeChange", "onOrderModeChange"],
  ["openFilterPicker", "openFilterPicker"],
  ["refreshLocalizedLabels", "refreshLocalizedLabels"],
  ["scheduleSearchDraw", "scheduleSearchDraw"],
  ["updateActiveFilterSummary", "updateActiveFilterSummary"],
  ["updateAvailableCategories", "updateAvailableCategories"],
] as const)
  assert.equal((controllers as any)[method](), expected);
assert.equal(controllers.displayGroupName("Objects"), "group:Objects");
assert.equal(controllers.displayUnicodeSubGroupName("money"), "sub:money");
assert.deepEqual(controllers.drawList("wrappedGift"), [
  "drawList",
  "wrappedGift",
]);
assert.deepEqual(controllers.onGroupSelectorChange("gift"), [
  "onGroupSelectorChange",
  "gift",
]);
assert.deepEqual(controllers.onSequenceTypeSelectorChange("single"), [
  "onSequenceTypeSelectorChange",
  "single",
]);
assert.deepEqual(controllers.onSubGroupSelectorChange("money"), [
  "onSubGroupSelectorChange",
  "money",
]);
assert.deepEqual(controllers.renderCategoryFilters("Objects"), [
  "renderCategoryFilters",
  "Objects",
]);
assert.deepEqual(controllers.setView("code"), ["setView", "code"]);
assert.equal(
  controllers.subGroupSelectionKey("Objects", "money"),
  "subGroupSelectionKey:Objects:money",
);
assert.deepEqual(controllers.syncVersionRange("17.0"), [
  "syncVersionRange",
  "17.0",
]);
assert.equal(
  controllers.versionSliderLabel("16.0", "17.0"),
  "versionSliderLabel:16.0:17.0",
);
