import assert from "node:assert/strict";
import { canThemeSupportAudio, isTheme } from "../../src/utils/themes.js";

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
assert.equal(await canThemeSupportAudio(), true);

(globalThis.document as Document).documentElement.dataset.theme = "base";
assert.equal(isTheme("base"), true);
assert.equal(await canThemeSupportAudio(), false);

Reflect.deleteProperty(globalThis, "document");
assert.equal(isTheme("retro"), false);
assert.equal(await canThemeSupportAudio(), true);

if (originalDocument) {
  Object.defineProperty(globalThis, "document", originalDocument);
} else {
  Reflect.deleteProperty(globalThis, "document");
}
