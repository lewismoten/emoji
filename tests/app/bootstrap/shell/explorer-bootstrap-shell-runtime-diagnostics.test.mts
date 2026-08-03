import assert from "node:assert/strict";
import { createShellRuntimeFixture } from "./explorer-bootstrap-shell-runtime-fixture.mjs";

const fixture = await createShellRuntimeFixture();
const { dialogState, dialogStub, options, pixelOptions, state } = fixture;

assert.deepEqual(pixelOptions.byId(), state.byId);
assert.deepEqual(pixelOptions.emojiByKey(), state.emojiByKey);
assert.deepEqual(Array.from(pixelOptions.emojiKeyByCodePoints().entries()), [
  ["1F381", "wrappedGift"],
]);
assert.deepEqual(pixelOptions.genderCheckboxes(), ["neutral"]);
assert.deepEqual(pixelOptions.hairCheckboxes(), ["red"]);
assert.equal(pixelOptions.normalizeCodePoints("1F381"), "norm:1F381");
assert.equal(pixelOptions.pixelFontPreferred(), true);
pixelOptions.refreshEditor();
assert.equal(fixture.refreshed(), 1);
assert.deepEqual(pixelOptions.skinToneCheckboxes(), ["1F3FB"]);
assert.deepEqual(pixelOptions.updateRenderingDiagnostic({ custom: true }), {
  custom: true,
  byId: state.byId,
  developerMode: true,
  detailsVisible: false,
  exampleDialog: dialogState,
  translate: options.translate,
});
assert.deepEqual(dialogStub.diagnosticCalls[0], {
  custom: true,
  byId: state.byId,
  developerMode: true,
  detailsVisible: false,
  exampleDialog: dialogState,
  translate: options.translate,
});

dialogState.classList.contains = (value: string) => value === "is-code-view";
assert.equal(pixelOptions.pixelFontPreferred(), true);
assert.deepEqual(pixelOptions.updateRenderingDiagnostic({ next: true }), {
  next: true,
  byId: state.byId,
  developerMode: true,
  detailsVisible: false,
  exampleDialog: dialogState,
  translate: options.translate,
});

dialogState.classList.contains = () => false;
state.explorerPreferences.pixelFont = false;
assert.equal(pixelOptions.pixelFontPreferred(), true);
assert.deepEqual(pixelOptions.updateRenderingDiagnostic({ final: true }), {
  final: true,
  byId: state.byId,
  developerMode: true,
  detailsVisible: true,
  exampleDialog: dialogState,
  translate: options.translate,
});
