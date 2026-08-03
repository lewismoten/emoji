import assert from "node:assert/strict";
import { initialPreferences, routeLocale } from "../../src/utils/window.js";

const originalLocation = Object.getOwnPropertyDescriptor(
  globalThis,
  "location",
);
const originalInitialPreferences = Object.getOwnPropertyDescriptor(
  globalThis,
  "initialPreferences",
);

try {
  Reflect.deleteProperty(globalThis, "location");
  assert.equal(routeLocale(), undefined);

  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: { pathname: "/demo/index.ar-EG.html" },
  });
  assert.equal(routeLocale(), "ar-EG");

  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: { pathname: "/demo/index.html" },
  });
  assert.equal(routeLocale(), undefined);

  Reflect.deleteProperty(globalThis, "initialPreferences");
  assert.deepEqual(initialPreferences(), {});

  Object.defineProperty(globalThis, "initialPreferences", {
    configurable: true,
    value: { theme: "retro", soundEffects: true },
  });
  assert.deepEqual(initialPreferences(), {
    theme: "retro",
    soundEffects: true,
  });
} finally {
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
}
