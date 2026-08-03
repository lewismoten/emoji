import assert from "node:assert/strict";
import * as preferences from "../../../src/preferences.js";
import {
  isAudioEnabled,
  isMusicEnabled,
  isSoundEffectsEnabled,
} from "../../../src/explorer/audio/audio-helpers.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

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
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: { dataset: { theme: "retro" } },
    },
  });

  preferences.init({});
  assert.equal(await isSoundEffectsEnabled(), false);
  assert.equal(await isMusicEnabled(), false);
  assert.equal(await isAudioEnabled(), false);

  preferences.setBoolean("soundEffects", true);
  assert.equal(await isSoundEffectsEnabled(), true);
  assert.equal(await isAudioEnabled(), true);

  preferences.setBoolean("music", true);
  assert.equal(await isMusicEnabled(), true);

  (globalThis.document as any).documentElement.dataset.theme = "base";
  assert.equal(await isSoundEffectsEnabled(), false);
  assert.equal(await isMusicEnabled(), false);
  assert.equal(await isAudioEnabled(), false);
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
}
