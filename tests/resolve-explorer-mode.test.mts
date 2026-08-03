import assert from "node:assert/strict";
import * as preferences from "../src/preferences.js";
import resolveExplorerMode from "../src/resolve-explorer-mode.js";

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
  preferences.setString("mode", "developer");
  assert.equal(
    resolveExplorerMode({
      developerModeUrlDismissed: false,
      explorerModeFromUrl: "advanced",
    }),
    "advanced",
  );
  assert.equal(
    resolveExplorerMode({
      developerModeUrlDismissed: true,
      explorerModeFromUrl: "advanced",
    }),
    "developer",
  );

  preferences.setString("mode", "mystery");
  assert.equal(
    resolveExplorerMode({
      developerModeUrlDismissed: true,
      explorerModeFromUrl: "",
    }),
    "standard",
  );
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
}
