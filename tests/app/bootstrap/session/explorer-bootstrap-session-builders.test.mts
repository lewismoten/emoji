import assert from "node:assert/strict";
import { createBootstrapSessionFixture } from "./explorer-bootstrap-session-fixture.mjs";

const fixture = await createBootstrapSessionFixture();

assert.equal(fixture.states.length, 1);
assert.equal(fixture.formatterCalls.length, 1);
assert.equal(fixture.shellCalls.length, 1);
assert.equal(fixture.controllerCalls.length, 1);

assert.equal(fixture.formatterCalls[0].document, fixture.globalDocument);
assert.equal(fixture.formatterCalls[0].selectedSearchLocale(), "en");
assert.equal(
  fixture.shellBuilderInput.translate("group.label", "fallback"),
  "Translated Group",
);
assert.equal(
  fixture.shellBuilderInput.translate("missing", "fallback"),
  "fallback",
);
assert.deepEqual(fixture.shellBuilderInput.drawList(), ["drawList", []]);
assert.deepEqual(fixture.shellBuilderInput.normalizeCodePoints("1F44D"), [
  "normalize",
  ["1F44D"],
]);

assert.equal(fixture.controllerBuilderInput.unassigned, "\u0000");
assert.equal(
  fixture.controllerBuilderInput.getExplorerSubGroup("mail")[0],
  "subgroup",
);
assert.equal(fixture.controllerBuilderInput.formatNumber("5")[0], "ui-number");
assert.equal(
  fixture.controllerBuilderInput.displayExplorerLabel("group"),
  "Translated Group",
);
assert.deepEqual(fixture.controllerBuilderInput.openPanel("help"), [
  "open-panel-dialog",
  ["help"],
]);
