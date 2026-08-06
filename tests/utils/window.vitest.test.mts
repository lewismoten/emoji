import { afterEach, describe, expect, it } from "vitest";

import { getLocale } from "../../src/app/route.js";
import { initialPreferences } from "../../src/utils/window.js";

const originalLocation = Object.getOwnPropertyDescriptor(
  globalThis,
  "location",
);
const originalInitialPreferences = Object.getOwnPropertyDescriptor(
  globalThis,
  "initialPreferences",
);

describe("utils/window", () => {
  afterEach(() => {
    if (originalLocation) {
      Object.defineProperty(globalThis, "location", originalLocation);
    } else {
      Reflect.deleteProperty(globalThis, "location");
    }
    if (originalInitialPreferences) {
      Object.defineProperty(
        globalThis,
        "initialPreferences",
        originalInitialPreferences,
      );
    } else {
      Reflect.deleteProperty(globalThis, "initialPreferences");
    }
  });

  it("reads locale and initial preference values from globals", () => {
    Reflect.deleteProperty(globalThis, "location");
    expect(getLocale()).toBeUndefined();

    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: { pathname: "/demo/index.ar-EG.html" },
    });
    expect(getLocale()).toBe("ar-EG");

    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: { pathname: "/demo/index.html" },
    });
    expect(getLocale()).toBeUndefined();

    Reflect.deleteProperty(globalThis, "initialPreferences");
    expect(initialPreferences()).toEqual({});

    Object.defineProperty(globalThis, "initialPreferences", {
      configurable: true,
      value: { theme: "retro", soundEffects: true },
    });
    expect(initialPreferences()).toEqual({
      theme: "retro",
      soundEffects: true,
    });
  });
});
