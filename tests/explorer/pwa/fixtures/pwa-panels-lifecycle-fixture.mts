import assert from "node:assert/strict";

import { FakeDialog, FakeElement } from "./pwa-panels-fixture.mjs";

export async function assertPanelLifecycleAndBinding(options: {
  bindPanelDialog: (options: any) => void;
  closePanelDialog: (
    dialog: HTMLDialogElement,
    suppressed: WeakSet<HTMLDialogElement>,
  ) => void;
  ensurePanelDialogLifecycleBound: (options: any) => void;
  onPanelDialogClose: (options: any) => void;
  openPanelDialog: (options: any) => void;
  dialogs: Record<string, FakeDialog>;
  historyBackCalls: string[];
  historyState: Record<string, unknown>;
  languageList: FakeElement;
  suppressedPanelCloses: WeakSet<any>;
  windowStub: any;
}) {
  const {
    bindPanelDialog,
    closePanelDialog,
    dialogs,
    ensurePanelDialogLifecycleBound,
    historyBackCalls,
    historyState,
    languageList,
    onPanelDialogClose,
    openPanelDialog,
    suppressedPanelCloses,
    windowStub,
  } = options;
  const syncCalls: any[] = [];

  assert.doesNotThrow(() =>
    openPanelDialog({
      panel: "help",
      renderSavedEmoji() {},
      syncUrlState() {},
    } as any),
  );
  openPanelDialog({
    panel: "help",
    dialogs: dialogs as any,
    languageList: languageList as any,
    renderSavedEmoji() {},
    syncUrlState: (...args: any[]) => {
      syncCalls.push(args as any);
    },
  });
  assert.equal(dialogs.help.open, true);
  assert.deepEqual(syncCalls, [["push", { ...historyState, panelDialogEntry: true }]]);
  dialogs.help.dataset.panelClosing = "true";
  openPanelDialog({
    addHistory: false,
    panel: "help",
    dialogs: dialogs as any,
    renderSavedEmoji() {},
    syncUrlState: (...args: any[]) => {
      syncCalls.push(args as any);
    },
  });
  assert.equal(syncCalls.length, 1);
  assert.equal(dialogs.help.dataset.panelClosing, undefined);
  openPanelDialog({
    panel: "help",
    dialogs: { ...dialogs, help: undefined } as any,
    renderSavedEmoji() {},
    syncUrlState() {
      syncCalls.push(["unexpected"]);
    },
  });
  assert.equal(syncCalls.some((entry) => entry[0] === "unexpected"), false);

  closePanelDialog(dialogs.help as any, suppressedPanelCloses);
  assert.equal(dialogs.help.open, false);
  assert.doesNotThrow(() =>
    closePanelDialog(new FakeDialog() as any, suppressedPanelCloses),
  );
  assert.equal(suppressedPanelCloses.has(dialogs.help as any), true);

  const lifecycleDialog = new FakeDialog();
  const lifecycleClose = new FakeElement();
  const lifecycleForm = new FakeElement();
  (lifecycleClose as any).closest = () => lifecycleForm;
  lifecycleDialog.queryMap.set(".dialog-close", lifecycleClose);
  let lifecycleAfterClose = 0;
  ensurePanelDialogLifecycleBound({
    applyingUrlState: () => false,
    dialog: lifecycleDialog as any,
    onAfterClose() {
      lifecycleAfterClose += 1;
    },
    panel: "help",
    suppressedPanelCloses: new WeakSet(),
    syncUrlState() {},
    urlStateReady: () => true,
  });
  lifecycleClose.dispatch("click");
  assert.equal(lifecycleDialog.dataset.panelClosing, "true");
  lifecycleDialog.dispatch("close");
  assert.equal(lifecycleAfterClose, 1);
  lifecycleForm.dispatch("submit");

  const originalRequestAnimationFrame = windowStub.requestAnimationFrame;
  windowStub.requestAnimationFrame = undefined;
  windowStub.location.search = "?panel=help&mode=developer";
  const immediateDialog = new FakeDialog();
  const immediateClose = new FakeElement();
  const immediateForm = new FakeElement();
  (immediateClose as any).closest = () => immediateForm;
  immediateDialog.queryMap.set(".dialog-close", immediateClose);
  ensurePanelDialogLifecycleBound({
    applyingUrlState: () => false,
    dialog: immediateDialog as any,
    panel: "help",
    suppressedPanelCloses: new WeakSet(),
    syncUrlState() {},
    urlStateReady: () => true,
  });
  immediateClose.dispatch("click");
  assert.equal(
    historyBackCalls.at(-1),
    "replace:/index.en.html?mode=developer#top",
  );
  immediateForm.dispatch("submit");

  const noRafSyncCalls: any[] = [];
  const directCloseDialog = new FakeDialog();
  (directCloseDialog as any).classList = {
    contains: (name: string) => name === "help-dialog",
  };
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: directCloseDialog } as any,
    suppressedPanelCloses: new WeakSet(),
    syncUrlState: (...args: any[]) => {
      noRafSyncCalls.push(args as any);
    },
    urlStateReady: true,
  });
  assert.deepEqual(noRafSyncCalls, [[]]);
  windowStub.requestAnimationFrame = originalRequestAnimationFrame;

  const unknownDialog = new FakeDialog();
  (unknownDialog as any).classList = { contains: () => false };
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: unknownDialog } as any,
    suppressedPanelCloses: new WeakSet(),
    syncUrlState: (...args: any[]) => {
      syncCalls.push(args as any);
    },
    urlStateReady: true,
  });
  assert.deepEqual(syncCalls.at(-1), []);

  syncCalls.length = 0;
  dialogs.help.open = true;
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: dialogs.help } as any,
    suppressedPanelCloses,
    syncUrlState: (...args: any[]) => {
      syncCalls.push(args as any);
    },
    urlStateReady: true,
  });
  assert.equal(syncCalls.length, 0);

  dialogs.help.open = true;
  windowStub.history.state = { panelDialogEntry: true };
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: dialogs.help } as any,
    suppressedPanelCloses: new WeakSet(),
    syncUrlState: (...args: any[]) => {
      syncCalls.push(args as any);
    },
    urlStateReady: true,
  });
  assert.deepEqual(syncCalls.at(-1), ["replace", {}]);
  assert.equal(
    historyBackCalls.at(-1),
    "replace:/index.en.html?mode=developer#top",
  );

  windowStub.history.state = undefined as any;
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: dialogs.help } as any,
    suppressedPanelCloses: new WeakSet(),
    syncUrlState: () => {
      syncCalls.push(["synced"]);
    },
    urlStateReady: true,
  });
  assert.deepEqual(syncCalls.at(-1), ["synced"]);

  const button = new FakeElement();
  const dialog = new FakeDialog();
  let beforeOpen = 0;
  let afterClose = 0;
  const panelOpens: any[] = [];
  bindPanelDialog({
    applyingUrlState: () => false,
    button: button as any,
    dialog: dialog as any,
    dialogs: dialogs as any,
    languageList: languageList as any,
    onBeforeOpen() {
      beforeOpen += 1;
    },
    onAfterClose() {
      afterClose += 1;
    },
    openPanel(options: any) {
      panelOpens.push(options);
    },
    panel: "language",
    renderSavedEmoji() {},
    suppressedPanelCloses: new WeakSet(),
    syncUrlState() {},
    urlStateReady: () => true,
  });
  button.dispatch("click");
  await Promise.resolve();
  assert.equal(beforeOpen, 1);
  assert.equal(panelOpens.length, 1);
  dialog.dispatch("close");
  assert.equal(afterClose, 1);
}
