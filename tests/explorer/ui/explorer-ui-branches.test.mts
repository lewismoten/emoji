import assert from "node:assert/strict";
import {
  createDeveloperModeController,
  createExplorerUiController,
  renderThemeToggle,
} from "../../../src/explorer-ui.js";
import { createElement, installExplorerUiFixture } from "./explorer-ui-fixture.mjs";

const fixture = installExplorerUiFixture();

try {
  const state = {
    developerModeFromUrl: false,
    explorerModeFromUrl: "advanced",
    developerModeUrlDismissed: true,
    explorerPreferences: {
      developerMode: false,
      mode: "mystery",
      music: false,
      pixelFont: true,
      soundEffects: false,
      theme: "base",
    },
    uiStrings: {},
  };

  const uiCalls: string[] = [];
  const controller = createExplorerUiController({
    deferredInstallPrompt: () => null,
    installAppButton: () => null,
    installDialog: () => null,
    installWebApp: async () => ({ deferredInstallPrompt: null }),
    offlineStatus: () => null,
    pixelEditor: () => null,
    renderDeveloperMode: () => uiCalls.push("renderDeveloperMode"),
    renderInstallAppButton: () => undefined,
    renderMusicToggle: () => uiCalls.push("renderMusicToggle"),
    renderPixelFontToggle: () => uiCalls.push("renderPixelFontToggle"),
    renderSearchLanguages: () => uiCalls.push("renderSearchLanguages"),
    renderSoundEffectsToggle: () => uiCalls.push("renderSoundEffectsToggle"),
    renderVersionModeToggle: () => uiCalls.push("renderVersionModeToggle"),
    setDeferredInstallPrompt: () => undefined,
    state: () => state,
  });
  controller.applyTranslations();
  assert.deepEqual(
    uiCalls.slice(0, 4),
    [
      "renderPixelFontToggle",
      "renderSoundEffectsToggle",
      "renderMusicToggle",
      "renderDeveloperMode",
    ],
  );

  const toggle = createElement();
  const noToggleController = createDeveloperModeController({
    choices: () => [],
    dialog: () => ({ open: false, classList: { contains: () => false } }),
    disableDeveloperFeatures: () => undefined,
    loadVersionData: async () => undefined,
    savePreference: () => undefined,
    setDialogView: () => undefined,
    state: () => state,
    syncUrlState: () => undefined,
    toggle: () => null,
  });
  assert.equal(noToggleController.mode(), "standard");
  noToggleController.render();

  const toggleController = createDeveloperModeController({
    choices: () => [],
    dialog: () => ({ open: false, classList: { contains: () => false } }),
    disableDeveloperFeatures: () => undefined,
    loadVersionData: async () => undefined,
    savePreference: () => undefined,
    setDialogView: () => undefined,
    state: () => state,
    syncUrlState: () => undefined,
    toggle: () => toggle,
  });
  toggleController.render();
  assert.equal(toggle.attributes.get("aria-checked"), "false");

  const choiceA = createElement({ mode: "standard" });
  const choiceB = createElement({ mode: "advanced" });
  (choiceA as any).isConnected = true;
  (choiceB as any).isConnected = true;
  const queryModeController = createDeveloperModeController({
    choices: () => [choiceA, choiceB],
    dialog: () => ({ open: false, classList: { contains: () => false } }),
    disableDeveloperFeatures: () => undefined,
    loadVersionData: async () => undefined,
    savePreference(key: string, value: unknown) {
      (state.explorerPreferences as Record<string, unknown>)[key] = value;
    },
    setDialogView: () => undefined,
    state: () => state,
    syncUrlState: () => undefined,
    toggle: () => null,
  });
  await queryModeController.change({
    currentTarget: {
      closest: () => null,
      querySelector: () => ({ value: "advanced" }),
    },
    target: {},
  });
  assert.equal(state.explorerPreferences.mode, "advanced");

  renderThemeToggle({
    choices: () => [null, "not-a-choice", { isConnected: false }],
    state: () => ({
      developerModeUrlDismissed: false,
      explorerModeFromUrl: "",
      explorerPreferences: { mode: "standard", theme: "dark" },
    }),
  });
  assert.equal(fixture.documentElement.dataset.theme, "dark");
} finally {
  fixture.restore();
}
