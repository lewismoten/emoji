import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";

import resolveChoiceElements from "../../../../src/resolve-connected-elements.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

afterEach(() => {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
});

describe("resolve-choice-elements", () => {
  it("prefers connected resolved elements and falls back to document queries", () => {
    const connectedChoice = { isConnected: true, id: "connected" };
    const detachedChoice = { isConnected: false, id: "detached" };

    assert.deepEqual(
      resolveChoiceElements(
        () => [connectedChoice as any, detachedChoice as any],
        ".x",
      ),
      [connectedChoice],
    );

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelectorAll(selector: string) {
          return selector === ".theme-choice" ? [{ id: "fallback" }] : [];
        },
      },
    });

    assert.deepEqual(
      resolveChoiceElements(() => [null as any, "bad" as any], ".theme-choice"),
      [{ id: "fallback" }],
    );

    Reflect.deleteProperty(globalThis, "document");
    assert.deepEqual(resolveChoiceElements(() => undefined, ".missing"), []);
  });
});
