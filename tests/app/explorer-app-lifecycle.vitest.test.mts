import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createExplorerApp } from "../../src/app/explorer-app-lifecycle.js";

describe("explorer-app-lifecycle", () => {
  it("starts only once and starts immediately when the document is ready", async () => {
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
  });

  it("waits for load when the document is still loading", () => {
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
  });
});
