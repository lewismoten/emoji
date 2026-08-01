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

assert.equal(listOptions.getVersionKeys(), "version-keys");
assert.equal(listOptions.renderGeneration(), 7);
assert.equal(listOptions.versionSliderLabel("16.0", "17.0"), "16.0:17.0");

assert.deepEqual(versionOptions.applyLoadedUrlState("replace"), [
  "applyLoadedUrlState",
  "replace",
]);
assert.deepEqual(versionOptions.drawList("wrappedGift"), [
  "drawList",
  "wrappedGift",
]);

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
assert.equal(navigationOptions.latestReleasedVersion(), "17.0");
assert.equal(navigationOptions.preferredOrder(), "grouped");
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
assert.deepEqual(navigationOptions.syncVersionRange("18.0"), [
  "syncVersionRange",
  "18.0",
]);

assert.deepEqual(dialogViewOptions.byId(), state.byId);
assert.deepEqual(dialogViewOptions.currentDialogParentStack(), ["favorites"]);
assert.equal(dialogViewOptions.currentEmojiKey(), "wrappedGift");
assert.equal(
  dialogViewOptions.fullDeveloperModeEnabled(),
  "full-developer-mode",
);
assert.deepEqual(dialogViewOptions.emojiByKey(), state.emojiByKey);

assert.deepEqual(dialogClickOptions.byId(), state.byId);
assert.deepEqual(dialogClickOptions.currentDialogParentStack(), ["favorites"]);
assert.deepEqual(dialogClickOptions.currentEmojiCopies(), { emoji: "🎁" });
assert.equal(dialogClickOptions.currentEmojiKey(), "wrappedGift");
dialogClickOptions.setSuppressDialogCloseSync(false);
assert.equal(calls.includes("setSuppressDialogCloseSync:false"), true);
dialogClickOptions.toggleComposition();
assert.equal(state.compositionMode, "full");
dialogClickOptions.clearCurrentDialogParentStack();
assert.deepEqual(state.currentDialogParentStack, []);

assert.equal(typeof controllers.onEmojiDialogClick, "function");
