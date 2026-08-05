import assert from "node:assert/strict";
import { createBootstrapSessionFixture } from "./explorer-bootstrap-session-fixture.mjs";

const fixture = await createBootstrapSessionFixture();

assert.deepEqual(fixture.bindings.drawList("emoji"), ["drawList", ["emoji"]]);
assert.deepEqual(fixture.bindings.loadVersionData("v"), [
  "loadVersionData",
  ["v"],
]);
assert.deepEqual(fixture.bindings.resetFilters(), ["resetFilters", []]);
assert.deepEqual(fixture.bindings.syncUrlState("replace"), [
  "syncUrlState",
  ["replace"],
]);
assert.deepEqual(fixture.bindings.focusInitialEmojiDialogAction(), [
  "focusInitialAction",
  [],
]);
assert.deepEqual(fixture.bindings.setEmojiDialogView("code"), [
  "setView",
  ["code"],
]);

assert.equal(fixture.sessionRuntimeInput.bindings, fixture.bindings);
assert.equal(
  fixture.sessionRuntimeInput.controllers.drawList(...[])[0],
  "drawList",
);
assert.equal(fixture.sessionRuntimeInput.shell, fixture.shell);
assert.equal(
  fixture.sessionRuntimeInput.translate("group.label", "fallback"),
  "Translated Group",
);
assert.equal(fixture.bindings.bootstrapRuntime, fixture.runtime);

fixture.sessionRuntimeInput.restoreDeveloperMode();
assert.equal(fixture.state.developerModeFromUrl, true);
assert.equal(fixture.state.explorerModeFromUrl, "developer");
assert.deepEqual(fixture.shell.renderDeveloperMode(), [
  "render-developer-mode",
  [],
]);

assert.equal(fixture.runtime.removeLegacyDialogElementsCalls, 1);
assert.equal(fixture.appCalls[0].options.window, fixture.globalWindow);
assert.equal(fixture.appCalls[0].options.start, "runtime-onload");
assert.equal(fixture.appCalls[0].startWhenReadyCalls, 1);
