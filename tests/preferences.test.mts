import assert from "node:assert/strict";
import * as preferences from "../src/preferences.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalInitialPreferences = Object.getOwnPropertyDescriptor(
  globalThis,
  "initialPreferences",
);

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
  Object.defineProperty(globalThis, "initialPreferences", {
    configurable: true,
    value: { music: true, favorites: ["wave"] },
  });

  preferences.init({});
  assert.equal(preferences.getBoolean("music"), false);

  preferences.init({
    mode: "advanced",
    theme: "retro",
    recentCopied: ["sparkles"],
  });
  assert.equal(preferences.getString("mode"), "advanced");
  assert.equal(preferences.getString("theme"), "retro");
  assert.deepEqual(preferences.getStringArray("recentCopied"), ["sparkles"]);
  assert.equal(preferences.has("recentCopied"), true);

  preferences.setBoolean("music", true);
  preferences.setString("theme", "light");
  preferences.setStringArray("favorites", ["wave", "thumbsUp"]);
  assert.equal(preferences.getBoolean("music"), true);
  assert.equal(preferences.getString("theme"), "light");
  assert.deepEqual(preferences.getStringArray("favorites"), [
    "wave",
    "thumbsUp",
  ]);
  assert.equal(
    storage.get("@lewismoten/emoji:explorer-preferences"),
    '{"mode":"advanced","theme":"light","recentCopied":["sparkles"],"music":true,"favorites":["wave","thumbsUp"]}',
  );

  storage.clear();
  preferences.init({ mode: "mystery", theme: "mystery" });
  assert.equal(preferences.getString("mode"), "standard");
  assert.equal(preferences.getString("theme"), "dark");

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
  assert.equal(preferences.getString("mode"), "developer");
  assert.equal(preferences.getString("theme"), "base");
  assert.doesNotThrow(() => preferences.setArray("recentCopied", ["ok"]));
  assert.deepEqual(preferences.getArray("recentCopied"), ["ok"]);
} finally {
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
}
