import assert from "node:assert/strict";

import { bindPanelDialog } from "../../../src/explorer/pwa/pwa-bind-panel-dialog.js";

class FakeButton {
  listeners = new Map<string, Array<() => void | Promise<void>>>();

  addEventListener(type: string, listener: () => void | Promise<void>) {
    const entries = this.listeners.get(type) ?? [];
    entries.push(listener);
    this.listeners.set(type, entries);
  }

  async click() {
    for (const listener of this.listeners.get("click") ?? []) {
      await listener();
    }
  }
}

const button = new FakeButton();
const ensureCalls: string[] = [];
const openCalls: unknown[] = [];
const phaseCalls: string[] = [];
const dialog = {
  dataset: {},
  querySelector() {
    return null;
  },
  addEventListener() {},
} as unknown as HTMLDialogElement;
const dialogs = {
  favorites: undefined,
  filters: undefined,
  help: dialog,
  language: undefined,
};

bindPanelDialog({
  applyingUrlState: () => false,
  button: button as unknown as HTMLElement,
  dialog,
  dialogs,
  ensureDialog: async () => {
    ensureCalls.push("ensure");
  },
  onAfterOpen: async () => {
    phaseCalls.push("after-open");
  },
  onBeforeOpen: () => {
    phaseCalls.push("before-open");
  },
  openPanel(options) {
    openCalls.push(options);
  },
  panel: "help",
  renderSavedEmoji() {},
  suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
  syncUrlState() {},
  urlStateReady: () => true,
});

await button.click();

assert.deepEqual(ensureCalls, ["ensure"]);
assert.deepEqual(phaseCalls, ["before-open", "after-open"]);
assert.equal(openCalls.length, 1);
assert.equal(
  (openCalls[0] as { dialogs: typeof dialogs }).dialogs,
  dialogs,
);
