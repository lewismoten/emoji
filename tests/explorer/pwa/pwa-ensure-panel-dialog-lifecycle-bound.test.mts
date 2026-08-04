import assert from "node:assert/strict";

import { ensurePanelDialogLifecycleBound } from "../../../src/explorer/pwa/pwa-ensure-panel-dialog-lifecycle-bound.js";

class FakeNode {
  dataset: Record<string, string | undefined> = {};
  listeners = new Map<string, Array<(event?: Event) => void>>();
  formListenerCount = 0;

  addEventListener(type: string, listener: (event?: Event) => void) {
    const entries = this.listeners.get(type) ?? [];
    entries.push(listener);
    this.listeners.set(type, entries);
  }

  closest() {
    return {
      addEventListener: () => {
        this.formListenerCount += 1;
      },
    };
  }
}

class FakeDialog {
  dataset: Record<string, string | undefined> = {};
  listeners = new Map<string, Array<(event: Event) => void>>();
  closeButton = new FakeNode();

  querySelector(selector: string) {
    return selector === ".dialog-close" ? this.closeButton : null;
  }

  addEventListener(type: string, listener: (event: Event) => void) {
    const entries = this.listeners.get(type) ?? [];
    entries.push(listener);
    this.listeners.set(type, entries);
  }
}

const replaceCalls: string[] = [];
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    history: {
      state: {},
      replaceState(_state: unknown, _title: string, url: string) {
        replaceCalls.push(url);
      },
    },
    location: {
      hash: "#now",
      pathname: "/demo",
      search: "?panel=help&mode=retro",
    },
    requestAnimationFrame(handler: () => void) {
      handler();
    },
  },
});

try {
  const dialog = new FakeDialog();
  const syncCalls: string[] = [];
  const afterCloseCalls: string[] = [];

  ensurePanelDialogLifecycleBound({
    applyingUrlState: () => false,
    dialog: dialog as unknown as HTMLDialogElement,
    onAfterClose: () => {
      afterCloseCalls.push("after-close");
    },
    panel: "help",
    suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
    syncUrlState() {
      syncCalls.push("sync");
    },
    urlStateReady: () => true,
  });

  assert.equal(dialog.closeButton.dataset.panelDismissBound, "true");
  assert.equal(dialog.dataset.panelCloseBound, "true");
  assert.equal(dialog.closeButton.formListenerCount, 1);

  dialog.closeButton.listeners.get("click")?.[0]?.();
  assert.deepEqual(replaceCalls, ["/demo?mode=retro#now", "/demo?mode=retro#now"]);

  dialog.listeners.get("close")?.[0]?.({
    currentTarget: dialog,
  } as unknown as Event);
  assert.deepEqual(syncCalls, ["sync"]);
  assert.deepEqual(afterCloseCalls, ["after-close"]);
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    delete (globalThis as Record<string, unknown>).window;
  }
}
