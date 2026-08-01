import assert from "node:assert/strict";
import { createVersionControllerFixture } from "./version-controller-direct-fixture.mjs";

const fixture = createVersionControllerFixture();

await fixture.controller.loadData();
assert.equal(fixture.state.added, true);
assert.equal(fixture.rebuildCodePointLookupCalls() >= 2, true);
assert.equal(fixture.updateModifierArtworkCalls() >= 2, true);
assert.equal(fixture.buildRepresentativesCalls() >= 2, true);
assert.equal(fixture.applyLoadedUrlStateCalls() >= 2, true);
assert.equal(fixture.openedEmoji.length, 0);
assert.deepEqual(fixture.groupSelector.addEventListenerCalls, ["change"]);
assert.deepEqual(fixture.subGroupSelector.addEventListenerCalls, ["change"]);
assert.deepEqual(fixture.sequenceTypeSelector.addEventListenerCalls, [
  "change",
]);
assert.equal(fixture.versionModeSelector.value, "selected");
assert.deepEqual(fixture.introducedVersions, ["16.0"]);

const firstPromise = fixture.controller.loadVersionData();
const secondPromise = fixture.controller.loadVersionData();
assert.equal(fixture.state.versionDataPromise !== null, true);
await firstPromise;
await secondPromise;
