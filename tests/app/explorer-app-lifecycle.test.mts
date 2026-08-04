import assert from "node:assert/strict";
import { createExplorerApp } from "../../src/app/explorer-app-lifecycle.js";
// Pairing source: ../../src/app/explorer-app-lifecycle.js

const immediateWindowListeners = new Map<string, Function[]>();
const immediateWindow = {
  addEventListener(type: string, listener: () => void) {
    const list = immediateWindowListeners.get(type) ?? [];
    list.push(listener);
    immediateWindowListeners.set(type, list);
  },
  document: { readyState: "complete" },
};
const startCalls: string[] = [];
const app = createExplorerApp({
  start: async () => {
    startCalls.push("start");
  },
  window: immediateWindow,
});
await app.start();
await app.start();
assert.deepEqual(startCalls, ["start"]);

app.startWhenReady();
assert.deepEqual(startCalls, ["start"]);

const delayedWindowListeners = new Map<string, Function[]>();
const delayedWindow = {
  addEventListener(type: string, listener: () => void) {
    const list = delayedWindowListeners.get(type) ?? [];
    list.push(listener);
    delayedWindowListeners.set(type, list);
  },
  document: { readyState: "loading" },
};
const delayedCalls: string[] = [];
const delayedApp = createExplorerApp({
  start: () => {
    delayedCalls.push("start");
  },
  window: delayedWindow,
});
delayedApp.startWhenReady();
assert.equal(delayedCalls.length, 0);
delayedWindowListeners.get("load")?.[0]?.();
delayedWindowListeners.get("load")?.[0]?.();
assert.deepEqual(delayedCalls, ["start"]);
