import assert from "node:assert/strict";
import { bindExplorerEventsWithEnvironment } from "../../../src/app/emoji/explorer-app-events-runtime.js";

assert.equal(typeof bindExplorerEventsWithEnvironment, "function");

const bindPanelDialogCalls: any[] = [];
const bindSavedDialogInteractionsCalls: any[] = [];
const lifecycleCalls: string[] = [];

const createEventTarget = () => ({
  listeners: new Map<string, Function[]>(),
  addEventListener(type: string, handler: Function) {
    const list = this.listeners.get(type) ?? [];
    list.push(handler);
    this.listeners.set(type, list);
  },
});

const savedDialog = "late-saved-dialog" as any;
const searchText = createEventTarget();
const emojiList = createEventTarget();
const exampleDialog = createEventTarget();
const versionSelector = createEventTarget();

bindExplorerEventsWithEnvironment(
  {
    applyBasicUrlState() {
      lifecycleCalls.push("apply-basic-url-state");
    },
    applyingUrlState: false,
    closePanel() {
      lifecycleCalls.push("close-panel");
    },
    emojiFontChoices: [],
    emojiList,
    exampleDialog,
    genderCheckboxes: [],
    getSavedDialog() {
      return savedDialog;
    },
    hairCheckboxes: [],
    installedDisplayQueries: [{}],
    onClick() {},
    onDocumentKeyDown() {},
    onEmojiDialogClick() {},
    onEmojiDialogClose() {},
    onEmojiFocus() {},
    onEmojiKeyDown() {},
    onGenderChange() {},
    onHairChange() {},
    onOrderModeChange() {},
    onSkinToneChange() {},
    openPanel() {},
    orderButtons: [],
    panelDialogs: () => [],
    renderInstallAppButton() {
      lifecycleCalls.push("render-install-button");
    },
    renderSavedEmoji() {},
    savedPicker: {},
    scheduleSearchDraw() {},
    searchText,
    skinToneCheckboxes: [],
    suppressedPanelCloses: new Set<string>(),
    syncUrlState() {},
    toggleDeveloperMode() {},
    updateOnlineStatus() {
      lifecycleCalls.push("update-online");
    },
    urlStateReady: true,
    versionSelector,
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
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  } as any,
  {
    addEventListener() {},
    matchMedia() {
      return {} as MediaQueryList;
    },
    requestAnimationFrame(callback: FrameRequestCallback) {
      callback(0);
      return 0;
    },
    setTimeout,
  } as any,
);

assert.equal(bindPanelDialogCalls.length, 3);
assert.deepEqual(lifecycleCalls.slice(0, 3), [
  "update-online",
  "render-install-button",
  "apply-basic-url-state",
]);
assert.equal(searchText.listeners.get("input")?.length, 1);
assert.equal(emojiList.listeners.get("click")?.length, 1);
assert.equal(exampleDialog.listeners.get("close")?.length, 1);
assert.equal(versionSelector.listeners.get("change")?.length, 1);
assert.equal(bindSavedDialogInteractionsCalls.length, 1);

await bindPanelDialogCalls[0].ensureDialog();
assert.equal(bindSavedDialogInteractionsCalls.length, 2);
