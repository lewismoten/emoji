import assert from "node:assert/strict";
import * as sourceModule from "../../src/app/explorer-app-events.js";
import {
  createExplorerAppEventsFixture,
  sourceModuleSpecifier,
} from "./explorer-app-events.fixture.mjs";

// Pairing source: ../../src/app/explorer-app-events.js

assert.equal(typeof sourceModule.bindExplorerEvents, "function");
assert.equal(
  typeof sourceModule.createExplorerAppEventDependencies,
  "function",
);

const fixture = await createExplorerAppEventsFixture();

try {
  sourceModule.bindExplorerEvents(fixture.bindsOptions, fixture.dependencies);

  assert.deepEqual(fixture.accessibilityStub.bindModifierGroupCalls, [
    [["light"], fixture.bindsOptions.onSkinToneChange],
    [["red"], fixture.bindsOptions.onHairChange],
    [["neutral"], fixture.bindsOptions.onGenderChange],
  ]);
  assert.deepEqual(fixture.accessibilityStub.themeChoiceKeyDownCalls, []);
  assert.equal(
    fixture.accessibilityStub.bindSavedDialogInteractionsCalls.length,
    1,
  );
  assert.equal(fixture.panelStub.bindPanelDialogCalls.length, 4);
  assert.deepEqual(fixture.lifecycleCalls.slice(0, 3), [
    "update-online",
    "render-install-button",
    "apply-basic-url-state",
  ]);
  for (const eventName of ["online", "offline"]) {
    assert.equal(fixture.onlineOfflineListeners.get(eventName)?.length, 1);
  }
  assert.equal(fixture.mediaListeners.length, 1);
  assert.equal(
    fixture.bindsOptions.searchText.listeners.get("input")?.[0],
    fixture.bindsOptions.scheduleSearchDraw,
  );
  assert.equal(
    fixture.bindsOptions.emojiFontChoices[0].listeners.get("click")?.[0],
    fixture.bindsOptions.selectEmojiFont,
  );
  assert.equal(
    fixture.bindsOptions.themeChoices[0].listeners.get("click")?.[0],
    undefined,
  );
  assert.equal(
    fixture.bindsOptions.themeChoices[0].listeners.get("keydown")?.[0],
    undefined,
  );
  assert.equal(
    fixture.bindsOptions.versionModeToggle.listeners.get("click")?.[0],
    fixture.bindsOptions.toggleVersionMode,
  );

  fixture.versionPrevious.listeners.get("click")?.[0]?.();
  fixture.versionNext.listeners.get("click")?.[0]?.();
  fixture.bindsOptions.emojiPrevious.listeners.get("click")?.[0]?.();
  fixture.bindsOptions.emojiNext.listeners.get("click")?.[0]?.();
  assert.deepEqual(fixture.stepCalls, [-1, 1]);
  assert.deepEqual(fixture.navigateCalls, [-1, 1]);

  fixture.bindsOptions.versionSelector.listeners.get("change")?.[0]?.();
  assert.ok(fixture.lifecycleCalls.includes("sync-version-range"));
  assert.equal(fixture.lifecycleCalls.includes("render-saved"), false);

  fixture.installDialogClose.listeners.get("click")?.[0]?.();
  assert.equal(fixture.installDialog.closeCalled, 1);
  fixture.documentListeners.get("keydown")?.[0]?.();
  assert.ok(fixture.lifecycleCalls.includes("doc-keydown"));

  fixture.panelStub.bindPanelDialogCalls[1].onBeforeOpen();
  assert.equal(fixture.languageDialog.dataset.returnPanel, "help");
  assert.equal(fixture.panelCloses.length, 1);
  fixture.panelStub.bindPanelDialogCalls[3].onAfterClose();
  assert.equal(fixture.bindsOptions.advancedFiltersButton.focusCalled, 1);
  assert.equal(sourceModuleSpecifier, "build/src/app/explorer-app-events.js");
} finally {
  fixture.restore();
}
