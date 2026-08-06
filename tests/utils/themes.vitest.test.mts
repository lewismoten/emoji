import { afterEach, describe, expect, it } from "vitest";

import { canThemeSupportAudio, isTheme } from "../../src/utils/themes.js";

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);

describe("utils/themes", () => {
  afterEach(() => {
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  });

  it("detects the active theme and whether it supports audio", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: {
          dataset: { theme: "retro" },
        },
      },
    });

    expect(isTheme("retro")).toBe(true);
    await expect(canThemeSupportAudio()).resolves.toBe(true);

    (globalThis.document as Document).documentElement.dataset.theme = "base";
    expect(isTheme("base")).toBe(true);
    await expect(canThemeSupportAudio()).resolves.toBe(false);

    Reflect.deleteProperty(globalThis, "document");
    expect(isTheme("retro")).toBe(false);
    await expect(canThemeSupportAudio()).resolves.toBe(true);
  });
});
