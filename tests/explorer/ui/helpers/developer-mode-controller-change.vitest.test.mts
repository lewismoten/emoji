import { afterEach, describe, expect, it } from "vitest";

import * as preferences from "../../../../src/preferences.js";
import * as state from "../../../../src/state.js";
import buildHandler from "../../../../src/developer-mode-controller-change.js";

describe("developer-mode-controller-change", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  afterEach(() => {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
    state.developerModeUrlDismissed.set(false);
    state.explorerModeFromUrl.set(undefined);
    state.developerModeFromUrl.set(false);
  });

  it("updates state, preferences, and dialog behavior when explorer mode changes", () => {
    const originalDocument = Object.getOwnPropertyDescriptor(
      globalThis,
      "document",
    );
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
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelectorAll(selector: string) {
          return selector === ".mode-choice" ? [{ dataset: { mode: "advanced" } }] : [];
        },
      },
    });

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
        loadVersionData: async () => {
          calls.push("load");
        },
        setDialogView: (name: string) => {
          calls.push(`view:${name}`);
        },
        syncUrlState: () => {
          calls.push("sync");
        },
      } as any,
      () => {
        calls.push("render");
      },
    );

    handler({ currentTarget: { dataset: { mode: "advanced" } } });
    expect(state.explorerModeFromUrl.get()).toBe("advanced");
    expect(state.developerModeFromUrl.get()).toBe(false);
    expect(preferences.getString("mode")).toBe("advanced");
    expect(calls).toEqual(["render", "load", "view:details", "sync"]);

    calls.length = 0;
    preferences.setString("theme", "base");
    handler({ currentTarget: { checked: false } });

    expect(state.explorerModeFromUrl.get()).toBe("standard");
    expect(state.developerModeUrlDismissed.get()).toBe(true);
    expect(preferences.getString("theme")).toBe("dark");
    expect(calls).toEqual([
      "render",
      "view:details",
      "view:details",
      "disable",
      "sync",
    ]);
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  });
});
