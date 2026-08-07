import { afterEach, describe, expect, it } from "vitest";

import {
  canThemeSupportAudio,
  getColor,
  getSong,
  isTheme,
  register,
} from "../../src/utils/themes.js";

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

  it("returns undefined for themes without songs and uses the default color fallback", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: {
          dataset: { theme: "base" },
        },
      },
    });

    await expect(getSong()).resolves.toBeUndefined();
    expect(getColor()).toBe("#160622");

    (globalThis.document as Document).documentElement.dataset.theme = "unknown";
    await expect(getSong()).resolves.toBeUndefined();
    expect(getColor()).toBe("#160622");
  });

  it("loads the light theme song on demand", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: {
          dataset: { theme: "light" },
        },
      },
    });

    await expect(getSong()).resolves.toBeDefined();
    expect(getColor()).toBe("#f6efe4");
  });

  it("returns undefined for registered themes without a song loader", async () => {
    register("silent-theme", { color: "#123456" });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: {
          dataset: { theme: "silent-theme" },
        },
      },
    });

    await expect(getSong()).resolves.toBeUndefined();
    expect(getColor()).toBe("#123456");
  });
});
