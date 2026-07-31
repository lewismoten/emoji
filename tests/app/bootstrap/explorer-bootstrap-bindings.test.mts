import assert from "node:assert/strict";
import {
  assignExplorerBootstrapControls,
  assignExplorerBootstrapElements,
  assignExplorerBootstrapFieldsets,
  createExplorerBootstrapBindings,
} from "../../../src/app/bootstrap/explorer-bootstrap-bindings.js";

const bindings = createExplorerBootstrapBindings();

assert.equal(bindings.searchText, undefined);
assert.equal(bindings.languageDialog, undefined);
assert.deepEqual(bindings.emojiFontChoices, []);
assert.deepEqual(bindings.themeChoices, []);
assert.equal(bindings.listRenderGeneration, 0);
assert.equal(bindings.urlStateReady, false);
assert.equal(bindings.applyingUrlState, false);
assert.equal(bindings.suppressDialogCloseSync, false);
assert.ok(bindings.suppressedPanelCloses instanceof WeakSet);

assert.equal(typeof bindings.drawList, "function");
assert.equal(typeof bindings.loadVersionData, "function");
assert.equal(typeof bindings.loadSearchLanguages, "function");
assert.equal(typeof bindings.renderSearchLanguages, "function");
assert.equal(typeof bindings.renderCategoryFilters, "function");
assert.equal(typeof bindings.renderVersionModeToggle, "function");
assert.equal(typeof bindings.setEmojiDialogView, "function");
assert.equal(typeof bindings.syncUrlState, "function");
assert.equal(typeof bindings.syncVersionRange, "function");
assert.equal(typeof bindings.showEmoji, "function");
assert.equal(typeof bindings.navigateEmoji, "function");
assert.equal(typeof bindings.updateDialogNavigation, "function");
assert.equal(typeof bindings.updateCompositionBackButton, "function");
assert.equal(typeof bindings.focusInitialEmojiDialogAction, "function");
assert.equal(typeof bindings.populateVersionModeOptions, "function");
assert.equal(typeof bindings.toggleVersionMode, "function");
assert.equal(typeof bindings.revealExplorer, "function");
assert.equal(typeof bindings.resetFilters, "function");
assert.doesNotThrow(() => bindings.drawList());
assert.doesNotThrow(() => bindings.loadVersionData());
assert.doesNotThrow(() => bindings.loadSearchLanguages());
assert.doesNotThrow(() => bindings.renderSearchLanguages());
assert.doesNotThrow(() => bindings.renderCategoryFilters());
assert.doesNotThrow(() => bindings.renderVersionModeToggle());
assert.doesNotThrow(() => bindings.setEmojiDialogView());
assert.doesNotThrow(() => bindings.syncUrlState());
assert.doesNotThrow(() => bindings.syncVersionRange());
assert.doesNotThrow(() => bindings.showEmoji());
assert.doesNotThrow(() => bindings.navigateEmoji());
assert.doesNotThrow(() => bindings.updateDialogNavigation());
assert.doesNotThrow(() => bindings.updateCompositionBackButton());
assert.doesNotThrow(() => bindings.focusInitialEmojiDialogAction());
assert.doesNotThrow(() => bindings.populateVersionModeOptions());
assert.doesNotThrow(() => bindings.toggleVersionMode());
assert.doesNotThrow(() => bindings.revealExplorer());
assert.doesNotThrow(() => bindings.resetFilters());

const controlValues = {
  searchText: { id: "search" },
  drawList: () => "drawn",
};
assignExplorerBootstrapControls(bindings, controlValues);
assert.equal(bindings.searchText, controlValues.searchText);
assert.equal(bindings.drawList(), "drawn");

const elementValues = {
  helpDialog: { id: "help" },
  savedDialog: { id: "saved" },
};
assignExplorerBootstrapElements(bindings, elementValues);
assert.equal(bindings.helpDialog, elementValues.helpDialog);
assert.equal(bindings.savedDialog, elementValues.savedDialog);

const fieldsetValues = {
  skinToneFieldset: { id: "skin" },
  hairFieldset: { id: "hair" },
  genderFieldset: { id: "gender" },
};
assignExplorerBootstrapFieldsets(bindings, fieldsetValues);
assert.equal(bindings.skinToneFieldset, fieldsetValues.skinToneFieldset);
assert.equal(bindings.hairFieldset, fieldsetValues.hairFieldset);
assert.equal(bindings.genderFieldset, fieldsetValues.genderFieldset);
