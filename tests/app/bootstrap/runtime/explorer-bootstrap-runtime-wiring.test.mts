import assert from "node:assert/strict";
import { createBootstrapRuntimeFixture } from "./explorer-bootstrap-runtime-fixture.mjs";

const { runtime, state, options, stubs } =
  await createBootstrapRuntimeFixture();
const {
  explorerRuntimeStub,
  uiBindingStub,
  startupRuntimeStub,
  pixelEditorRuntimeStub,
  versionModeRuntimeStub,
  browserRuntimeConfigStub,
  dialogRuntimeConfigStub,
  emojiFilterStub,
} = stubs as any;

assert.equal(explorerRuntimeStub.runtimeCalls.length, 1);
assert.equal(uiBindingStub.calls.length, 1);
assert.equal(pixelEditorRuntimeStub.calls.length, 1);
assert.equal(versionModeRuntimeStub.calls.length, 1);
assert.equal(browserRuntimeConfigStub.calls.length, 1);
assert.equal(dialogRuntimeConfigStub.calls.length, 1);
assert.equal(startupRuntimeStub.calls.length, 1);

assert.deepEqual(explorerRuntimeStub.runtimeCalls[0], {
  ensureUtilityControls: "ensure-utility-controls",
  getElements: "get-explorer-elements",
});

const uiBindingCall = uiBindingStub.calls[0];
assert.equal(uiBindingCall.setControls, options.setControls);
assert.equal(uiBindingCall.skinToneCheckboxes()[0], "1F3FB");

const pixelEditorCall = pixelEditorRuntimeStub.calls[0];
assert.equal(pixelEditorCall.currentEmojiKey(), "wave");
assert.deepEqual(pixelEditorCall.dialog(), ["runtime-get", "exampleDialog"]);
assert.equal(pixelEditorCall.emojiByKey().wave, "👋");
assert.equal(pixelEditorCall.setEditor, options.setPixelEditor);
assert.equal(pixelEditorCall.setPromise, options.setPixelEditorPromise);

const versionModeCall = versionModeRuntimeStub.calls[0];
assert.deepEqual(versionModeCall.definitions, ["all", "selected"]);
assert.deepEqual(versionModeCall.drawList("x"), ["draw-list", ["x"]]);
assert.deepEqual(versionModeCall.toggle(), "version-mode-toggle");

const browserRuntimeCall = browserRuntimeConfigStub.calls[0];
assert.equal(browserRuntimeCall.closePanelDialog, "close-panel-dialog");
assert.equal(browserRuntimeCall.languageFlags.en, "🇺🇸");
assert.deepEqual(browserRuntimeCall.dialog(), ["runtime-get", "exampleDialog"]);
assert.deepEqual(browserRuntimeCall.nextLoadId(), 6);
assert.equal(state.searchLoadId, 6);
assert.deepEqual(browserRuntimeCall.onPixelFontRevisionLoaded(), undefined);
assert.equal(browserRuntimeCall.updateModifierArtwork(), undefined);

const dialogRuntimeCall = dialogRuntimeConfigStub.calls[0];
assert.equal(dialogRuntimeCall.sequenceTranslationKeys.zwj, "joiner");
assert.deepEqual(dialogRuntimeCall.emojiNext(), ["runtime-get", "emojiNext"]);
assert.deepEqual(dialogRuntimeCall.openEditor("wave", "👋"), [
  "open-editor",
  ["wave", "👋"],
]);
dialogRuntimeCall.setCurrentDialogParentStack(["help"]);
assert.deepEqual(state.currentDialogParentStack, ["help"]);

const startupRuntimeCall = startupRuntimeStub.calls[0];
assert.equal(startupRuntimeCall.onPanelClose, "on-panel-dialog-close");
assert.equal(
  startupRuntimeCall.positionFavoriteButton,
  "position-favorite-button",
);
assert.deepEqual(startupRuntimeCall.resolveElements(), ["resolve-elements"]);
assert.deepEqual(startupRuntimeCall.assignControls("controls"), [
  "assign-controls",
  ["controls"],
]);
assert.deepEqual(startupRuntimeCall.assignModifierFieldsets(), [
  "assign-fieldsets",
  [],
]);
assert.deepEqual(startupRuntimeCall.loadSearchLanguages(), [
  "load-search-languages-option",
]);

assert.equal(runtime.explorerRuntime, explorerRuntimeStub.runtime);
assert.equal(runtime.uiBindingRuntime, uiBindingStub.runtime);
assert.equal(
  runtime.ensurePixelEditor,
  pixelEditorRuntimeStub.runtime.ensurePixelEditor,
);
assert.equal(
  runtime.populateVersionModeOptions,
  versionModeRuntimeStub.runtime.populateOptions,
);
assert.equal(
  runtime.renderVersionModeToggleController,
  versionModeRuntimeStub.runtime.render,
);
assert.equal(runtime.toggleVersionMode, versionModeRuntimeStub.runtime.toggle);
assert.equal(
  runtime.loadSearchLanguages,
  browserRuntimeConfigStub.runtime.load,
);
assert.equal(
  runtime.renderSearchLanguages,
  browserRuntimeConfigStub.runtime.render,
);
assert.equal(
  runtime.selectLanguageLink,
  browserRuntimeConfigStub.runtime.select,
);
assert.equal(runtime.setSearchLanguage, browserRuntimeConfigStub.runtime.set);
assert.equal(runtime.showEmoji, dialogRuntimeConfigStub.runtime.showEmoji);
assert.equal(
  runtime.navigateEmoji,
  dialogRuntimeConfigStub.runtime.navigateEmoji,
);
assert.equal(
  runtime.updateDialogNavigation,
  dialogRuntimeConfigStub.runtime.updateDialogNavigation,
);
assert.equal(
  runtime.updateCompositionBackButton,
  dialogRuntimeConfigStub.runtime.updateCompositionBackButton,
);
assert.equal(
  runtime.finishExplorerLoading,
  startupRuntimeStub.runtime.finishExplorerLoading,
);
assert.equal(runtime.onLoad, startupRuntimeStub.runtime.onLoad);
assert.equal(
  runtime.removeLegacyDialogElements,
  startupRuntimeStub.runtime.removeLegacyDialogElements,
);
assert.equal(runtime.revealExplorer, startupRuntimeStub.runtime.revealExplorer);
assert.deepEqual(runtime.getEmojiGenders("wave"), [
  "emoji-genders",
  "wave",
  state.emojiByKey,
]);
assert.deepEqual(emojiFilterStub.genderCalls, [["wave", state.emojiByKey]]);
