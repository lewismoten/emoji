import assert from "node:assert/strict";
import { createExplorerBootstrapControllersWithFactories } from "../../../../src/app/bootstrap/explorer-bootstrap-controllers.js";
import { createExplorerBootstrapControllersRuntimeFixture } from "./explorer-bootstrap-controllers-runtime-fixture.js";

const { calls, options, state } =
  createExplorerBootstrapControllersRuntimeFixture();

let dialogViewOptions: any;
let dialogClickOptions: any;
const controllers = createExplorerBootstrapControllersWithFactories(options, {
  createCategoryController() {
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
  createListOrchestration() {
    return { drawList: (...args: any[]) => ["drawList", ...args] };
  },
  createVersionRuntime() {
    return {
      getVersionKeys: () => "version-keys",
      syncVersionRange: (...args: any[]) => ["syncVersionRange", ...args],
      versionSliderLabel: (...args: any[]) => args.join(":"),
      updateAvailableCategories: () => "updateAvailableCategories",
      loadVersionData: () => "loadVersionData",
    };
  },
  createNavigationRuntime() {
    return {
      applyLoadedUrlState: (...args: any[]) => ["applyLoadedUrlState", ...args],
      focusInitialAction: () => "focusInitialAction",
      onOrderModeChange: () => "onOrderModeChange",
    };
  },
  createDialogViewRuntime(config: any) {
    dialogViewOptions = config;
    return { setView: (...args: any[]) => ["setView", ...args] };
  },
  createEmojiDialogClickRuntime(config: any) {
    dialogClickOptions = config;
    return () => config;
  },
});

assert.equal(dialogViewOptions.developerModeEnabled(), true);
assert.equal(
  dialogViewOptions.fullDeveloperModeEnabled(),
  "full-developer-mode",
);
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

assert.deepEqual(dialogClickOptions.currentDialogParentStack(), ["favorites"]);
assert.deepEqual(dialogClickOptions.currentEmojiCopies(), { emoji: "🎁" });
assert.equal(dialogClickOptions.animateCopy, options.animateCopy);
assert.equal(dialogClickOptions.copy, "copyToClipboardValue");
assert.deepEqual(dialogClickOptions.dialog(), { open: true });
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
assert.equal(dialogClickOptions.currentDialogParentStack()[0], "favorites");
assert.equal(controllers.onEmojiDialogClick instanceof Function, true);
assert.equal(
  (await import("../../../../src/state.js")).compositionMode.get(),
  "condensed",
);
dialogClickOptions.toggleComposition();
assert.equal((await import("../../../../src/state.js")).compositionMode.get(), "full");
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
assert.deepEqual(
  (await import("../../../../src/state.js")).currentDialogParentStack.get(),
  [],
);
