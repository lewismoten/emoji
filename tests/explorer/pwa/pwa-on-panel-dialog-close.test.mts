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

  const suppressedPanelCloses = new WeakSet<HTMLDialogElement>([dialog]);
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: dialog } as unknown as Event,
    suppressedPanelCloses,
    syncUrlState() {
      syncCalls.push([undefined, { tag: "suppressed" }]);
    },
    urlStateReady: true,
  });
  assert.equal(
    syncCalls.some(([, state]) => (state as { tag?: string })?.tag === "suppressed"),
    false,
  );

  onPanelDialogClose({
    applyingUrlState: true,
    event: { currentTarget: dialog } as unknown as Event,
    suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
    syncUrlState() {
      syncCalls.push([undefined, { tag: "applying" }]);
    },
    urlStateReady: true,
  });
  assert.equal(
    syncCalls.some(([, state]) => (state as { tag?: string })?.tag === "applying"),
    false,
  );

  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: dialog } as unknown as Event,
    suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
    syncUrlState() {
      syncCalls.push([undefined, { tag: "not-ready" }]);
    },
    urlStateReady: false,
  });
  assert.equal(
    syncCalls.some(([, state]) => (state as { tag?: string })?.tag === "not-ready"),
    false,
  );

  const windowStub = globalThis.window as unknown as {
    history: {
      state: unknown;
      replaceState(_state: unknown, _title: string, url: string): void;
    };
    location: { hash: string; pathname: string; search: string };
    requestAnimationFrame?: (handler: () => void) => void;
  };

  const arrayHistoryState = [] as unknown[] & { panelDialogEntry?: boolean };
  arrayHistoryState.panelDialogEntry = true;
  windowStub.history.state = arrayHistoryState;
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: dialog } as unknown as Event,
    suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
    syncUrlState(mode, state) {
      syncCalls.push([mode, state]);
    },
    urlStateReady: true,
  });
  assert.deepEqual(syncCalls.at(-1), ["replace", {}]);

  windowStub.history.state = {};
  windowStub.location.search = "?panel=language&mode=retro";
  windowStub.requestAnimationFrame = undefined;
  const unknownDialog = {
    classList: {
      contains() {
        return false;
      },
    },
  } as unknown as HTMLDialogElement;
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: unknownDialog } as unknown as Event,
    suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
    syncUrlState(mode, state) {
      syncCalls.push([mode, state]);
    },
    urlStateReady: true,
  });
  assert.deepEqual(syncCalls.at(-1), [undefined, undefined]);
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    delete (globalThis as Record<string, unknown>).window;
  }
}
