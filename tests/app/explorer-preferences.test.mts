import assert from "node:assert/strict";
import { initializeExplorerPreferences } from "../../src/app/explorer-preferences.js";
import * as preferences from "../../src/preferences.js";

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
    location: { search: "?mode=developer" },
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
  initializeExplorerPreferences(state);

  assert.equal(state.explorerModeFromUrl, "developer");
  assert.equal(state.developerModeFromUrl, true);
  assert.deepEqual(state.favoriteEmojiKeys, ["wave", "thumbsUp"]);
  assert.deepEqual(state.copiedEmojiKeys, ["sparkles"]);

  preferences.setString("theme", "dark");
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
  initializeExplorerPreferences(fallbackState);
  assert.equal(fallbackState.explorerModeFromUrl, "");
  assert.equal(fallbackState.developerModeFromUrl, false);
  assert.deepEqual(fallbackState.favoriteEmojiKeys, []);
  assert.deepEqual(fallbackState.copiedEmojiKeys, []);

  assert.doesNotThrow(() => preferences.setString("theme", "light"));

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
  assert.deepEqual(arrayFallbackState.favoriteEmojiKeys, []);
  assert.deepEqual(arrayFallbackState.copiedEmojiKeys, []);

  installWindow({
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    location: { search: "" },
  });
  const missingStorageState: Record<string, unknown> = {};
  initializeExplorerPreferences(missingStorageState);
  assert.deepEqual(missingStorageState.favoriteEmojiKeys, []);
  assert.deepEqual(missingStorageState.copiedEmojiKeys, []);

  installWindow({
    localStorage: {
      getItem() {
        return JSON.stringify({
          developerMode: true,
          favorites: [],
          recentCopied: [],
        });
      },
      setItem() {},
    },
    location: { search: "" },
  });
  const legacyDeveloperState: Record<string, unknown> = {};
  initializeExplorerPreferences(legacyDeveloperState);
  assert.deepEqual(legacyDeveloperState.favoriteEmojiKeys, []);
  assert.deepEqual(legacyDeveloperState.copiedEmojiKeys, []);
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
}
