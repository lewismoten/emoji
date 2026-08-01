import assert from "node:assert/strict";
import { createDeveloperModeController } from "../../../src/explorer-ui.js";
import { createElement, installExplorerUiFixture } from "./explorer-ui-fixture.mjs";

const fixture = installExplorerUiFixture();

try {
  const calls: string[] = [];
  const preferenceCalls: Array<[string, unknown]> = [];
  const state = {
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
    renderThemeToggle: () => calls.push("rerender-dev-theme"),
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
  assert.equal(state.explorerModeFromUrl, "");
  assert.equal(state.developerModeUrlDismissed, true);
  assert.equal(state.explorerPreferences.theme, "dark");
  assert.ok(calls.includes("dialog:details"));
  assert.ok(calls.includes("disable-developer"));
  assert.ok(calls.includes("sync-url"));

  const toggleOnlyController = createDeveloperModeController({
    dialog: () => developerDialog,
    disableDeveloperFeatures: () => undefined,
    loadVersionData: async () => undefined,
    renderThemeToggle: () => undefined,
    savePreference: () => undefined,
    setDialogView: () => undefined,
    state: () => state,
    syncUrlState: () => undefined,
    toggle: () => developerToggle,
  });
  toggleOnlyController.render();
  assert.equal(developerToggle.checked, false);
  assert.equal(developerToggle.attributes.get("aria-checked"), "false");

  state.explorerPreferences = { developerMode: true, theme: "dark" };
  state.explorerModeFromUrl = "";
  state.developerModeUrlDismissed = false;
  const legacyController = createDeveloperModeController({
    choices: () => [],
    dialog: () => ({ open: false, classList: { contains: () => false } }),
    disableDeveloperFeatures: () => calls.push("disable-legacy"),
    loadVersionData: async () => {
      calls.push("load-version-data-legacy");
    },
    renderThemeToggle: () => calls.push("rerender-legacy-theme"),
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
  assert.equal(state.explorerPreferences.mode, "advanced");
  assert.ok(calls.includes("load-version-data-legacy"));

  await legacyController.change({
    currentTarget: {
      checked: false,
      querySelector: () => null,
    },
    target: {},
  });
  assert.equal(state.explorerPreferences.mode, "standard");
  assert.ok(calls.includes("disable-legacy"));

  state.explorerPreferences = { theme: "dark", mode: "advanced" };
  state.explorerModeFromUrl = "";
  state.developerModeUrlDismissed = false;
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
    renderThemeToggle: () => calls.push("rerender-no-choices-theme"),
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
  assert.equal(state.explorerPreferences.mode, "developer");

  await noChoicesController.change({
    currentTarget: {
      checked: false,
      querySelector: () => ({ value: "mystery" }),
    },
    target: {},
  });
  assert.equal(state.explorerPreferences.mode, "standard");
} finally {
  fixture.restore();
}
