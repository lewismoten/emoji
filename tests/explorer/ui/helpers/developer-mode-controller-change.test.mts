import assert from "node:assert/strict";
import * as preferences from "../../../../src/preferences.js";
import buildHandler from "../../../../src/developer-mode-controller-change.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

try {
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
      },
    },
  });
  preferences.init({});

  const state = {
    developerModeUrlDismissed: false,
    developerModeFromUrl: true,
    explorerModeFromUrl: "" as "" | "standard" | "advanced" | "developer",
  };
  const calls: string[] = [];
  const handler = buildHandler(
    {
      choices: () => [{ dataset: { mode: "advanced" } }],
      dialog: () => ({
        classList: { contains: (name: string) => name === "is-editor-view" },
        open: true,
      }),
      disableDeveloperFeatures: () => {
        calls.push("disable");
      },
      loadVersionData: () => {
        calls.push("load");
      },
      setDialogView: (name: string) => {
        calls.push(`view:${name}`);
      },
      state: () => state,
      syncUrlState: () => {
        calls.push("sync");
      },
    },
    () => {
      calls.push("render");
    },
  );

  handler({ currentTarget: { dataset: { mode: "advanced" } } });
  assert.equal(state.explorerModeFromUrl, "advanced");
  assert.equal(state.developerModeFromUrl, false);
  assert.equal(preferences.getString("mode"), "advanced");
  assert.deepEqual(calls, ["render", "theme", "load", "view:details", "sync"]);

  calls.length = 0;
  preferences.setString("theme", "base");
  handler({ currentTarget: { checked: false } });
  assert.equal(state.explorerModeFromUrl, "standard");
  assert.equal(state.developerModeUrlDismissed, true);
  assert.equal(preferences.getString("theme"), "dark");
  assert.deepEqual(calls, [
    "render",
    "theme",
    "view:details",
    "view:details",
    "disable",
    "sync",
  ]);
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
}
