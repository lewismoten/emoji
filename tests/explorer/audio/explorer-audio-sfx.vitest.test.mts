import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";

import {
  getExplorerSoundEffect,
  resolveExplorerSoundEffect,
} from "../../../src/explorer/audio/explorer-audio-sfx.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

afterEach(() => {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
});

describe("explorer-audio-sfx", () => {
  it("loads themed sound effects and resolves interactions to effect ids", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: { dataset: { theme: "dark" } },
      },
    });
    assert.ok(getExplorerSoundEffect("ui-click"));
    assert.equal(resolveExplorerSoundEffect("radio", "check"), "toggle-on");
    assert.equal(resolveExplorerSoundEffect("button", "click"), "ui-click");
  });
});
