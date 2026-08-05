import assert from "node:assert/strict";
import * as preferences from "../../../src/preferences.js";
import { createDeveloperModeController } from "../../../src/explorer-ui.js";
import { createElement, installExplorerUiFixture } from "./explorer-ui-fixture.mjs";

const fixture = installExplorerUiFixture();
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

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
  preferences.init({});
  preferences.setString("mode", "developer");
  preferences.setString("theme", "base");

  const calls: string[] = [];
  const preferenceCalls: Array<[string, unknown]> = [];
  const state: any = {
    developerModeFromUrl: true,
    explorerModeFromUrl: "developer",
    developerModeUrlDismissed: false,
    explorerPreferences: {
      theme: "base",
    } as Record<string, unknown>,
  };

  const developerToggle = createElement();
  const standardModeInput = createElement();
  const advancedModeInput = createElement();
  const developerModeInput = createElement();
  const standardModeChoice = createElement({ mode: "standard" });
  const advancedModeChoice = createElement({ mode: "advanced" });
  const developerModeChoice = createElement({ mode: "developer" });
  (standardModeChoice as any).isConnected = true;
  (advancedModeChoice as any).isConnected = true;
  (developerModeChoice as any).isConnected = true;
  standardModeChoice.querySelector = () => standardModeInput;
  advancedModeChoice.querySelector = () => advancedModeInput;
  developerModeChoice.querySelector = () => developerModeInput;
  const developerDialog = {
    open: true,
    classList: {
      contains(name: string) {
        return name === "is-editor-view";
      },
    },
  };

  const developerController = createDeveloperModeController({
    choices: () => [
      standardModeChoice,
      advancedModeChoice,
      developerModeChoice,
    ],
    dialog: () => developerDialog,
    disableDeveloperFeatures: () => calls.push("disable-developer"),
    loadVersionData: async () => {
      calls.push("load-version-data");
    },
    savePreference(key: string, value: unknown) {
      preferenceCalls.push([key, value]);
      state.explorerPreferences[key] = value;
    },
    setDialogView: (view: string) => calls.push(`dialog:${view}`),
    state: () => state,
    syncUrlState: () => calls.push("sync-url"),
    toggle: () => developerToggle,
  });

  developerController.render();
  assert.equal(developerModeChoice.classList.active.has("is-active"), true);
  assert.equal(developerModeChoice.attributes.get("aria-checked"), "true");
  assert.equal(developerModeChoice.tabIndex, 0);
  assert.equal(developerModeInput.checked, true);
  assert.equal(standardModeChoice.tabIndex, -1);

  await developerController.change({
    currentTarget: {
      closest: () => ({ dataset: { mode: "standard" } }),
    },
  });
  assert.equal(state.developerModeFromUrl, false);
  assert.equal(state.explorerModeFromUrl, "standard");
  assert.equal(state.developerModeUrlDismissed, true);
  assert.equal(preferences.getString("theme"), "dark");
  assert.ok(calls.includes("dialog:details"));
  assert.ok(calls.includes("disable-developer"));
  assert.ok(calls.includes("sync-url"));

  const toggleOnlyController = createDeveloperModeController({
    dialog: () => developerDialog,
    disableDeveloperFeatures: () => undefined,
    loadVersionData: async () => undefined,
    savePreference: () => undefined,
    setDialogView: () => undefined,
    state: () => state,
    syncUrlState: () => undefined,
    toggle: () => developerToggle,
  });
  toggleOnlyController.render();
  assert.equal(developerToggle.checked, false);
  assert.equal(developerToggle.attributes.get("aria-pressed"), "false");

  state.explorerPreferences = { developerMode: true, theme: "dark" };
  state.explorerModeFromUrl = "";
  state.developerModeUrlDismissed = false;
  preferences.setString("mode", "developer");
  preferences.setString("theme", "dark");
  const legacyController = createDeveloperModeController({
    choices: () => [],
    dialog: () => ({ open: false, classList: { contains: () => false } }),
    disableDeveloperFeatures: () => calls.push("disable-legacy"),
    loadVersionData: async () => {
      calls.push("load-version-data-legacy");
    },
    savePreference(key: string, value: unknown) {
      preferenceCalls.push([key, value]);
      state.explorerPreferences[key] = value;
    },
    setDialogView: (view: string) => calls.push(`legacy-dialog:${view}`),
    state: () => state,
    syncUrlState: () => calls.push("legacy-sync-url"),
    toggle: () => developerToggle,
  });
  legacyController.render();
  assert.equal(legacyController.enabled(), true);
  assert.equal(legacyController.fullEnabled(), true);
  assert.equal(legacyController.mode(), "developer");

  await legacyController.change({
    currentTarget: {
      checked: true,
      querySelector: () => null,
    },
    target: { value: "advanced" },
  });
  assert.equal(preferences.getString("mode"), "advanced");
  assert.ok(calls.includes("load-version-data-legacy"));

  await legacyController.change({
    currentTarget: {
      checked: false,
      querySelector: () => null,
    },
    target: {},
  });
  assert.equal(preferences.getString("mode"), "standard");
  assert.ok(calls.includes("disable-legacy"));

  state.explorerPreferences = { theme: "dark", mode: "advanced" };
  state.explorerModeFromUrl = "";
  state.developerModeUrlDismissed = false;
  preferences.setString("mode", "advanced");
  preferences.setString("theme", "dark");
  const noChoicesDialog = {
    open: false,
    classList: { contains: () => false },
  };
  const noChoicesController = createDeveloperModeController({
    choices: () => [],
    dialog: () => noChoicesDialog,
    disableDeveloperFeatures: () => calls.push("disable-no-choices"),
    loadVersionData: async () => {
      calls.push("load-version-data-no-choices");
    },
    savePreference(key: string, value: unknown) {
      preferenceCalls.push([key, value]);
      state.explorerPreferences[key] = value;
    },
    setDialogView: (view: string) => calls.push(`no-choices-dialog:${view}`),
    state: () => state,
    syncUrlState: () => calls.push("sync-url-no-choices"),
    toggle: () => developerToggle,
  });
  await noChoicesController.change({
    currentTarget: {
      checked: true,
      querySelector: () => ({ value: "developer" }),
    },
    target: {},
  });
  assert.equal(preferences.getString("mode"), "developer");

  await noChoicesController.change({
    currentTarget: {
      checked: false,
      querySelector: () => ({ value: "mystery" }),
    },
    target: {},
  });
  assert.equal(preferences.getString("mode"), "standard");
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  fixture.restore();
}
