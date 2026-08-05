import assert from "node:assert/strict";
import { bindExplorerEventsWithEnvironment } from "../../../src/app/emoji/explorer-app-events-runtime.js";
import { createExplorerAppEventsFixture } from "./explorer-app-events.fixture.mjs";

assert.equal(typeof bindExplorerEventsWithEnvironment, "function");

{
  const fixture = await createExplorerAppEventsFixture();
  try {
    bindExplorerEventsWithEnvironment(
      fixture.bindsOptions,
      fixture.dependencies,
      globalThis.document as any,
      globalThis.window as any,
    );

    assert.equal(fixture.panelStub.bindPanelDialogCalls.length, 4);
    assert.equal(
      fixture.accessibilityStub.bindSavedDialogInteractionsCalls.length,
      1,
    );
    fixture.panelStub.bindPanelDialogCalls[1].onBeforeOpen();
    assert.equal(fixture.languageDialog.dataset.returnPanel, "help");
    await fixture.panelStub.bindPanelDialogCalls[0].ensureDialog();
    assert.equal(
      fixture.accessibilityStub.bindSavedDialogInteractionsCalls.length,
      1,
    );
    (fixture.bindsOptions.savedDialog as any).dataset.savedDialogBound =
      "false";
    await fixture.panelStub.bindPanelDialogCalls[0].ensureDialog();
    assert.equal(
      fixture.accessibilityStub.bindSavedDialogInteractionsCalls.length,
      2,
    );
    fixture.panelStub.bindPanelDialogCalls[3].onAfterClose();
    assert.equal(fixture.bindsOptions.advancedFiltersButton.focusCalled, 1);
    fixture.versionPrevious.listeners.get("click")?.[0]?.();
    fixture.versionNext.listeners.get("click")?.[0]?.();
    fixture.bindsOptions.emojiPrevious.listeners.get("click")?.[0]?.();
    fixture.bindsOptions.emojiNext.listeners.get("click")?.[0]?.();
    fixture.bindsOptions.versionSelector.listeners.get("change")?.[0]?.();
    assert.deepEqual(fixture.stepCalls, [-1, 1]);
    assert.deepEqual(fixture.navigateCalls, [-1, 1]);
  } finally {
    fixture.restore();
  }
}

{
  const listeners = new Map<string, Function[]>();
  const removals: string[] = [];
  const bindPanelDialogCalls: any[] = [];
  const bindSavedDialogInteractionsCalls: any[] = [];
  const createTarget = () => ({
    listeners: new Map<string, Function[]>(),
    addEventListener(type: string, handler: Function) {
      const list = this.listeners.get(type) ?? [];
      list.push(handler);
      this.listeners.set(type, list);
      const all = listeners.get(type) ?? [];
      listeners.set(type, all.concat(handler));
    },
    removeEventListener(type: string) {
      removals.push(type);
    },
  });
  const installDialogClose = createTarget();
  const developerModeToggle = createTarget();
  const cleanup = bindExplorerEventsWithEnvironment(
    {
      advancedFiltersButton: undefined,
      applyBasicUrlState() {},
      applyingUrlState: false,
      clearFiltersButton: createTarget(),
      closePanel() {},
      developerModeToggle,
      emojiFontChoices: [],
      emojiList: createTarget(),
      emojiNext: createTarget(),
      emojiPrevious: createTarget(),
      exampleDialog: createTarget(),
      genderCheckboxes: [],
      getSavedDialog() {
        return "saved-dialog";
      },
      hairCheckboxes: [],
      helpPicker: {},
      modeChoices: [{}],
      installDialog: { querySelector: () => installDialogClose },
      installedDisplayQueries: [],
      openPanel() {},
      orderButtons: [],
      panelDialogs: () => [],
      renderInstallAppButton() {},
      renderSavedEmoji() {},
      savedPicker: {},
      scheduleSearchDraw() {},
      searchText: createTarget(),
      skinToneCheckboxes: [],
      suppressedPanelCloses: new Set(),
      syncUrlState() {},
      toggleDeveloperMode() {},
      updateOnlineStatus() {},
      urlStateReady: true,
      versionModeToggle: createTarget(),
      versionNext: createTarget(),
      versionPrevious: createTarget(),
      versionRange: createTarget(),
      versionSelector: createTarget(),
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
    {
      documentElement: { dataset: {} },
      addEventListener() {},
      removeEventListener() {},
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
    } as any,
    undefined,
  );

  assert.equal(listeners.get("change")?.length, 1);
  await bindPanelDialogCalls[0].ensureDialog();
  await bindPanelDialogCalls[1].ensureDialog();
  bindPanelDialogCalls[2].onAfterClose();
  installDialogClose.listeners.get("click")?.[0]?.();
  assert.equal(bindSavedDialogInteractionsCalls.length, 2);
  cleanup();
  assert.ok(removals.includes("change"));
}

{
  const bindPanelDialogCalls: any[] = [];
  const bindSavedDialogInteractionsCalls: any[] = [];
  let currentSavedDialog: any;
  bindExplorerEventsWithEnvironment(
    {
      advancedFiltersButton: { focus() {} },
      applyBasicUrlState() {},
      applyingUrlState: false,
      clearFiltersButton: { addEventListener() {}, removeEventListener() {} },
      closePanel() {},
      developerModeToggle: { addEventListener() {}, removeEventListener() {} },
      emojiFontChoices: [],
      emojiList: { addEventListener() {}, removeEventListener() {} },
      emojiNext: { addEventListener() {}, removeEventListener() {} },
      emojiPrevious: { addEventListener() {}, removeEventListener() {} },
      exampleDialog: { addEventListener() {}, removeEventListener() {} },
      genderCheckboxes: [],
      getSavedDialog() {
        return currentSavedDialog;
      },
      hairCheckboxes: [],
      helpPicker: {},
      installedDisplayQueries: [],
      openPanel() {},
      orderButtons: [],
      panelDialogs: () => [],
      renderInstallAppButton() {},
      renderSavedEmoji() {},
      savedPicker: {},
      scheduleSearchDraw() {},
      searchText: { addEventListener() {}, removeEventListener() {} },
      skinToneCheckboxes: [],
      suppressedPanelCloses: new Set(),
      syncUrlState() {},
      updateOnlineStatus() {},
      urlStateReady: true,
      versionModeToggle: { addEventListener() {}, removeEventListener() {} },
      versionNext: { addEventListener() {}, removeEventListener() {} },
      versionPrevious: { addEventListener() {}, removeEventListener() {} },
      versionRange: { addEventListener() {}, removeEventListener() {} },
      versionSelector: { addEventListener() {}, removeEventListener() {} },
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
    {
      documentElement: { dataset: {} },
      addEventListener() {},
      removeEventListener() {},
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
    } as any,
    undefined,
  );
  currentSavedDialog = {};
  await bindPanelDialogCalls[0].ensureDialog();
  assert.equal(currentSavedDialog.dataset.savedDialogBound, "true");
  assert.equal(bindSavedDialogInteractionsCalls.length, 1);
}
