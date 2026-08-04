import assert from "node:assert/strict";
import * as sourceModule from "../../src/app/explorer-app-events.js";
import {
  createExplorerAppEventsFixture,
  sourceModuleSpecifier,
} from "./emoji/explorer-app-events.fixture.mjs";

// Pairing source: ../../src/app/explorer-app-events.js

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
    fixture.accessibilityStub.themeChoiceKeyDownCalls.length >= 2,
    true,
  );
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
    fixture.themeChoices[0].listeners.get("click")?.[0],
    fixture.bindsOptions.selectTheme,
  );
  assert.equal(
    fixture.themeChoices[0].listeners.get("keydown")?.[0],
    "theme-keydown-handler",
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
  await fixture.panelStub.bindPanelDialogCalls[2].onAfterOpen();
  fixture.panelStub.bindPanelDialogCalls[1].onBeforeOpen();
  assert.equal(fixture.languageDialog.dataset.returnPanel, "help");
  fixture.bindsOptions.helpDialog.open = false;
  fixture.languageDialog.dataset.returnPanel = "help";
  fixture.panelStub.bindPanelDialogCalls[1].onBeforeOpen();
  assert.equal("returnPanel" in fixture.languageDialog.dataset, false);
  assert.equal(fixture.themeChoices[0].attributes.get("aria-checked"), "true");
  assert.equal(fixture.modeChoices[0].attributes.get("aria-checked"), "true");
  assert.equal(fixture.panelCloses.length, 1);
  fixture.panelStub.bindPanelDialogCalls[3].onAfterClose();
  assert.equal(fixture.bindsOptions.advancedFiltersButton.focusCalled, 1);
  assert.equal(sourceModuleSpecifier, "build/src/app/explorer-app-events.js");
} finally {
  fixture.restore();
}

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);

try {
  const bindSavedDialogInteractionsCalls: any[] = [];
  const bindPanelDialogCalls: any[] = [];
  const createEventTarget = () => ({
    addEventListener() {},
  });
  const buttonListeners = new Map<string, Function[]>();
  const customButton = {
    addEventListener(type: string, handler: Function) {
      const list = buttonListeners.get(type) ?? [];
      list.push(handler);
      buttonListeners.set(type, list);
    },
  } as any;
  const savedDialog = {} as any;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      addEventListener() {},
      matchMedia: () => ({ addEventListener() {} }),
      setTimeout,
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: { dataset: { explorerMode: "standard" } },
      addEventListener() {},
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
    },
  });

  sourceModule.bindExplorerEvents(
    {
      advancedFiltersButton: { focus() {} },
      applyBasicUrlState() {},
      applyingUrlState: false,
      closePanel() {},
      clearFiltersButton: createEventTarget(),
      developerModeToggle: createEventTarget(),
      emojiList: createEventTarget(),
      emojiNext: createEventTarget(),
      emojiPrevious: createEventTarget(),
      exampleDialog: createEventTarget(),
      emojiFontChoices: [],
      helpDialog: {},
      genderCheckboxes: [],
      hairCheckboxes: [],
      helpPicker: {},
      installApp() {},
      installAppButton: createEventTarget(),
      installDialog: { close() {}, querySelector: () => createEventTarget() },
      installedDisplayQueries: [],
      languageDialog: {},
      languagePicker: () => customButton,
      languageList: [],
      navigateEmoji() {},
      onClick() {},
      onDocumentKeyDown() {},
      onEmojiDialogClick() {},
      onEmojiDialogClose() {},
      onEmojiFocus() {},
      onEmojiKeyDown() {},
      orderButtons: [],
      onGenderChange() {},
      onOrderModeChange() {},
      onHairChange() {},
      onSkinToneChange() {},
      onVersionRangeInput() {},
      openPanel() {},
      panelDialogs: () => [],
      renderInstallAppButton() {},
      renderSavedEmoji() {},
      resetFilters() {},
      savedDialog,
      savedPicker: {},
      scheduleSearchDraw() {},
      searchText: { addEventListener() {} },
      selectEmojiFont() {},
      skinToneCheckboxes: [],
      stepVersion() {},
      suppressedPanelCloses: new Set(),
      syncUrlState() {},
      syncVersionRange() {},
      toggleDeveloperMode() {},
      toggleVersionMode() {},
      updateOnlineStatus() {},
      urlStateReady: true,
      versionNext: createEventTarget(),
      versionPrevious: createEventTarget(),
      versionRange: { addEventListener() {} },
      versionSelector: { addEventListener() {} },
      versionModeToggle: { addEventListener() {} },
    } as any,
    {
      audioToggle: { render() {} },
      bindModifierGroup() {},
      bindPanelDialog(options: unknown) {
        bindPanelDialogCalls.push(options);
      },
      bindSavedDialogInteractions(options: unknown) {
        bindSavedDialogInteractionsCalls.push(options);
      },
      createThemeChoiceKeyDownHandler() {
        return () => {};
      },
      themes: { getTheme: () => "dark" },
    },
  );

  assert.equal(typeof customButton.dataset, "object");
  await bindPanelDialogCalls[0].ensureDialog();
  assert.equal(savedDialog.dataset.savedDialogBound, "true");
  assert.equal(bindSavedDialogInteractionsCalls.length, 1);
} finally {
  if (originalWindow)
    Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
