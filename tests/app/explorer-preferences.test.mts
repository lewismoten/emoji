import assert from "node:assert/strict";
import { initializeExplorerPreferences } from "../../src/app/explorer-preferences.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

const installWindow = (windowValue: unknown) => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: windowValue,
  });
};

try {
  const storage = new Map<string, string>();
  installWindow({
    localStorage: {
      getItem(key: string) {
        return storage.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        storage.set(key, value);
      },
    },
    location: { search: "?developer=1" },
  });

  storage.set(
    "@lewismoten/emoji:explorer-preferences",
    JSON.stringify({
      favorites: ["wave", "thumbsUp"],
      recentCopied: ["sparkles"],
      theme: "retro",
    }),
  );

  const state: Record<string, unknown> = {};
  const preferences = initializeExplorerPreferences(state);

  assert.deepEqual(state.explorerPreferences, {
    favorites: ["wave", "thumbsUp"],
    mode: "standard",
    recentCopied: ["sparkles"],
    theme: "retro",
  });
  assert.equal(state.developerModeFromUrl, true);
  assert.deepEqual(state.favoriteEmojiKeys, ["wave", "thumbsUp"]);
  assert.deepEqual(state.copiedEmojiKeys, ["sparkles"]);

  preferences.save("theme", "dark");
  assert.equal(
    storage.get("@lewismoten/emoji:explorer-preferences"),
    '{"favorites":["wave","thumbsUp"],"recentCopied":["sparkles"],"theme":"dark","mode":"standard"}',
  );

  storage.set("@lewismoten/emoji:explorer-preferences", "{bad json");
  installWindow({
    localStorage: {
      getItem() {
        return "{bad json";
      },
      setItem() {
        throw new Error("blocked");
      },
    },
    location: { search: "" },
  });

  const fallbackState: Record<string, unknown> = {};
  const fallbackPreferences = initializeExplorerPreferences(fallbackState);
  assert.deepEqual(fallbackState.explorerPreferences, { mode: "standard" });
  assert.equal(fallbackState.developerModeFromUrl, false);
  assert.deepEqual(fallbackState.favoriteEmojiKeys, []);
  assert.deepEqual(fallbackState.copiedEmojiKeys, []);

  assert.doesNotThrow(() => fallbackPreferences.save("theme", "light"));

  installWindow({
    localStorage: {
      getItem() {
        return JSON.stringify({
          favorites: "not-an-array",
          recentCopied: { nope: true },
        });
      },
      setItem() {},
    },
    location: { search: "" },
  });

  const arrayFallbackState: Record<string, unknown> = {};
  initializeExplorerPreferences(arrayFallbackState);
  assert.equal(
    (arrayFallbackState.explorerPreferences as Record<string, unknown>).mode,
    "standard",
  );
  assert.deepEqual(arrayFallbackState.favoriteEmojiKeys, []);
  assert.deepEqual(arrayFallbackState.copiedEmojiKeys, []);
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
}
