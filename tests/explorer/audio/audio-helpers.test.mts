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
  assert.equal(isSoundEffectsEnabled(), false);
  assert.equal(isMusicEnabled(), false);
  assert.equal(isAudioEnabled(), false);

  preferences.setBoolean("soundEffects", true);
  assert.equal(isSoundEffectsEnabled(), true);
  assert.equal(isAudioEnabled(), true);

  preferences.setBoolean("music", true);
  assert.equal(isMusicEnabled(), true);

  (globalThis.document as any).documentElement.dataset.theme = "base";
  assert.equal(isSoundEffectsEnabled(), false);
  assert.equal(isMusicEnabled(), false);
  assert.equal(isAudioEnabled(), false);
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
