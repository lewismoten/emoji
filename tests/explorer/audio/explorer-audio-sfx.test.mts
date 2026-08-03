import assert from "node:assert/strict";

import {
  getExplorerSoundEffect,
  resolveExplorerSoundEffect,
} from "../../../src/explorer/audio/explorer-audio-sfx.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

try {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: { dataset: { theme: "dark" } },
    },
  });
  assert.ok(getExplorerSoundEffect("ui-click"));
  assert.equal(resolveExplorerSoundEffect("radio", "check"), "toggle-on");
  assert.equal(resolveExplorerSoundEffect("button", "click"), "ui-click");
} finally {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
}
