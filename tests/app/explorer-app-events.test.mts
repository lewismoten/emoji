import assert from "node:assert/strict";
import * as sourceModule from "../../src/app/explorer-app-events.js";
import {
  createExplorerAppEventsFixture,
  sourceModuleSpecifier,
} from "./emoji/explorer-app-events.fixture.mjs";
assert.equal(typeof sourceModule.bindExplorerEvents, "function");
assert.equal(
  typeof sourceModule.createExplorerAppEventDependencies,
  "function",
);
assert.equal(
  typeof sourceModule.createExplorerAppEventDependencies().bindPanelDialog,
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
    fixture.themeChoices[0].listeners.get("keydown")?.[0],
    fixture.themeChoices[1].listeners.get("keydown")?.[0],
  );
  assert.equal(
    fixture.bindsOptions.versionModeToggle.listeners.get("click")?.[0],
    fixture.bindsOptions.toggleVersionMode,
  );
  assert.equal(
    fixture.modeChoices[0].listeners.get("click")?.[0],
    fixture.bindsOptions.toggleDeveloperMode,
  );
  assert.equal(
    fixture.modeChoices[0]
      .querySelector('input[type="radio"]')
      ?.listeners.get("change")?.[0],
    fixture.bindsOptions.toggleDeveloperMode,
  );
  assert.equal(
    fixture.modeChoices[0].listeners.get("keydown")?.[0],
    fixture.modeChoices[1].listeners.get("keydown")?.[0],
  );
  assert.deepEqual(fixture.panelStub.bindPanelDialogCalls[0].getDialogs(), [
    { id: "saved" },
    { id: "help" },
  ]);
  assert.equal(
    fixture.panelStub.bindPanelDialogCalls[0].getDialog(),
    fixture.bindsOptions.savedDialog,
  );
  assert.deepEqual(fixture.panelStub.bindPanelDialogCalls[1].getDialogs(), [
    { id: "saved" },
    { id: "help" },
  ]);
  assert.equal(
    fixture.panelStub.bindPanelDialogCalls[1].getDialog(),
    fixture.bindsOptions.languageDialog,
  );
  assert.deepEqual(
    fixture.panelStub.bindPanelDialogCalls[1].getLanguageList(),
    ["en", "ar"],
  );
  assert.deepEqual(fixture.panelStub.bindPanelDialogCalls[2].getDialogs(), [
    { id: "saved" },
    { id: "help" },
  ]);
  assert.equal(
    fixture.panelStub.bindPanelDialogCalls[2].getDialog(),
    fixture.bindsOptions.helpDialog,
  );
  assert.deepEqual(fixture.panelStub.bindPanelDialogCalls[3].getDialogs(), [
    { id: "saved" },
    { id: "help" },
  ]);
  assert.equal(
    fixture.panelStub.bindPanelDialogCalls[3].getDialog(),
    fixture.bindsOptions.advancedFilters,
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

  await fixture.panelStub.bindPanelDialogCalls[0].ensureDialog();
  await fixture.panelStub.bindPanelDialogCalls[1].ensureDialog();
  await fixture.panelStub.bindPanelDialogCalls[2].onAfterOpen();
  await fixture.panelStub.bindPanelDialogCalls[2].ensureDialog();
  fixture.panelStub.bindPanelDialogCalls[1].onBeforeOpen();
  assert.equal(fixture.languageDialog.dataset.returnPanel, "help");
  fixture.bindsOptions.helpDialog.open = false;
  fixture.languageDialog.dataset.returnPanel = "help";
  fixture.panelStub.bindPanelDialogCalls[1].onBeforeOpen();
  assert.equal("returnPanel" in fixture.languageDialog.dataset, false);
  await fixture.panelStub.bindPanelDialogCalls[3].ensureDialog();
  assert.equal(fixture.themeChoices[0].attributes.get("aria-checked"), "true");
  assert.equal(fixture.modeChoices[0].attributes.get("aria-checked"), "true");
  assert.equal(fixture.panelCloses.length, 1);
  fixture.panelStub.bindPanelDialogCalls[3].onAfterClose();
  assert.equal(fixture.bindsOptions.advancedFiltersButton.focusCalled, 1);
  assert.equal(fixture.lifecycleCalls.includes("refresh-elements"), true);
  assert.equal(fixture.lifecycleCalls.includes("render-developer-mode"), true);
  assert.equal(fixture.lifecycleCalls.includes("render-theme-toggle"), true);
  assert.equal(
    fixture.lifecycleCalls.includes("render-pixel-font-toggle"),
    true,
  );
  assert.equal(
    fixture.lifecycleCalls.includes("render-search-languages"),
    true,
  );
  assert.equal(fixture.lifecycleCalls.includes("ensure-panel:favorites"), true);
  assert.equal(fixture.lifecycleCalls.includes("ensure-panel:language"), true);
  assert.equal(fixture.lifecycleCalls.includes("ensure-panel:help"), true);
  assert.equal(fixture.lifecycleCalls.includes("ensure-panel:filters"), true);
  assert.equal(sourceModuleSpecifier, "build/src/app/explorer-app-events.js");
} finally {
  fixture.restore();
}
