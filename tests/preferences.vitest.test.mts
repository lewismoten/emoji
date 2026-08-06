import { afterEach, describe, expect, it } from "vitest";

import * as preferences from "../src/preferences.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalInitialPreferences = Object.getOwnPropertyDescriptor(
  globalThis,
  "initialPreferences",
);

describe("preferences", () => {
  afterEach(() => {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
    if (originalInitialPreferences) {
      Object.defineProperty(
        globalThis,
        "initialPreferences",
        originalInitialPreferences,
      );
    } else {
      Reflect.deleteProperty(globalThis, "initialPreferences");
    }
  });

  it("loads, clamps, stores, and tolerates blocked storage", () => {
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
    Object.defineProperty(globalThis, "initialPreferences", {
      configurable: true,
      value: { music: true, favorites: ["wave"] },
    });

    preferences.init({});
    expect(preferences.getBoolean("music")).toBe(false);

    preferences.init({
      mode: "advanced",
      theme: "retro",
      recentCopied: ["sparkles"],
    });
    expect(preferences.getString("mode")).toBe("advanced");
    expect(preferences.getString("theme")).toBe("retro");
    expect(preferences.getStringArray("recentCopied")).toEqual(["sparkles"]);
    expect(preferences.has("recentCopied")).toBe(true);

    preferences.setBoolean("music", true);
    preferences.setString("theme", "light");
    preferences.setStringArray("favorites", ["wave", "thumbsUp"]);
    expect(preferences.getBoolean("music")).toBe(true);
    expect(preferences.getString("theme")).toBe("light");
    expect(preferences.getStringArray("favorites")).toEqual([
      "wave",
      "thumbsUp",
    ]);
    expect(storage.get("@lewismoten/emoji:explorer-preferences")).toBe(
      '{"mode":"advanced","theme":"light","recentCopied":["sparkles"],"music":true,"favorites":["wave","thumbsUp"]}',
    );

    storage.clear();
    preferences.init({ mode: "mystery", theme: "mystery" });
    expect(preferences.getString("mode")).toBe("standard");
    expect(preferences.getString("theme")).toBe("dark");

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem() {
            return "{bad json";
          },
          setItem() {
            throw new Error("blocked");
          },
        },
      },
    });
    preferences.init({ mode: "developer", theme: "base" });
    expect(preferences.getString("mode")).toBe("developer");
    expect(preferences.getString("theme")).toBe("base");
    expect(() => preferences.setArray("recentCopied", ["ok"])).not.toThrow();
    expect(preferences.getArray("recentCopied")).toEqual(["ok"]);
  });
});
