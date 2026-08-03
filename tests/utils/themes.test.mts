import assert from "node:assert/strict";
import {
  canThemeSupportAudio,
  isBaseTheme,
  isRetroTheme,
  isTheme,
} from "../../src/utils/themes.js";

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);

Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    documentElement: {
      dataset: { theme: "retro" },
    },
  },
});

assert.equal(isTheme("retro"), true);
assert.equal(isRetroTheme(), true);
assert.equal(isBaseTheme(), false);
assert.equal(canThemeSupportAudio(), true);

(globalThis.document as Document).documentElement.dataset.theme = "base";
assert.equal(isBaseTheme(), true);
assert.equal(canThemeSupportAudio(), false);

Reflect.deleteProperty(globalThis, "document");
assert.equal(isTheme("retro"), false);
assert.equal(isRetroTheme(), false);
assert.equal(isBaseTheme(), false);
assert.equal(canThemeSupportAudio(), true);

if (originalDocument) {
  Object.defineProperty(globalThis, "document", originalDocument);
} else {
  Reflect.deleteProperty(globalThis, "document");
}
