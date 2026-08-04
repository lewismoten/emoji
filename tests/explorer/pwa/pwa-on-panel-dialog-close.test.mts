import assert from "node:assert/strict";

import { onPanelDialogClose } from "../../../src/explorer/pwa/pwa-on-panel-dialog-close.js";

const replaceCalls: string[] = [];
const syncCalls: Array<
  [mode?: "replace" | "push", state?: Record<string, unknown>]
> = [];
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    history: {
      state: { panel: true, panelDialogEntry: true },
      replaceState(_state: unknown, _title: string, url: string) {
        replaceCalls.push(url);
      },
    },
    location: {
      hash: "#focus",
      pathname: "/demo",
      search: "?panel=help&mode=retro",
    },
    requestAnimationFrame(handler: () => void) {
      handler();
    },
  },
});

try {
  const dialog = {
    classList: {
      contains(token: string) {
        return token === "help-dialog";
      },
    },
    dataset: {},
  } as unknown as HTMLDialogElement;

  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: dialog } as unknown as Event,
    suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
    syncUrlState(mode, state) {
      syncCalls.push([mode, state]);
    },
    urlStateReady: true,
  });

  assert.deepEqual(syncCalls, [["replace", { panel: true }]]);
  assert.deepEqual(replaceCalls, ["/demo?mode=retro#focus"]);
  assert.equal(
    "panelClosing" in (dialog.dataset as Record<string, string>),
    false,
  );
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    delete (globalThis as Record<string, unknown>).window;
  }
}
