import assert from "node:assert/strict";
import {
  createDeveloperModeController,
  createExplorerUiController,
  renderThemeToggle,
  selectEmojiFont,
  selectTheme,
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
  assert.doesNotThrow(() =>
    createExplorerUiController({
      deferredInstallPrompt: () => null,
      installAppButton: () => null,
      installDialog: () => null,
      installWebApp: async () => ({ deferredInstallPrompt: null }),
      offlineStatus: () => null,
      renderDeveloperMode: () => undefined,
      renderInstallAppButton: () => undefined,
      renderMusicToggle: () => undefined,
      renderPixelFontToggle: () => undefined,
      renderSearchLanguages: () => undefined,
      renderSoundEffectsToggle: () => undefined,
      renderVersionModeToggle: () => undefined,
      setDeferredInstallPrompt: () => undefined,
      state: () => state,
    }).applyTranslations(),
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

  const undefinedChoicesController = createDeveloperModeController({
    dialog: () => ({ open: false, classList: { contains: () => false } }),
    disableDeveloperFeatures: () => undefined,
    loadVersionData: async () => undefined,
    savePreference(key: string, value: unknown) {
      (state.explorerPreferences as Record<string, unknown>)[key] = value;
    },
    setDialogView: () => undefined,
    state: () => state,
    syncUrlState: () => undefined,
  });
  undefinedChoicesController.render();
  await undefinedChoicesController.change({
    currentTarget: {
      checked: true,
      querySelector: () => null,
    },
    target: {},
  });
  assert.equal(state.explorerPreferences.mode, "developer");

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
      querySelector: () => null,
    },
    target: { value: "advanced" },
  });
  assert.equal(state.explorerPreferences.mode, "advanced");

  await queryModeController.change({
    currentTarget: {
      closest: () => null,
      querySelector: () => null,
    },
    target: {},
  });
  assert.equal(state.explorerPreferences.mode, "standard");

  const preferenceCalls: Array<[string, unknown]> = [];
  const noBlurEvent = {
    currentTarget: {
      blur: () => uiCalls.push("blur"),
      dataset: { emojiFont: "pixel" },
    },
    detail: 0,
  };
  selectEmojiFont(
    {
      renderPixelFontToggle: () => uiCalls.push("renderPixelFontToggleAgain"),
      savePreference(key: string, value: unknown) {
        preferenceCalls.push([key, value]);
      },
    },
    noBlurEvent,
  );
  assert.deepEqual(preferenceCalls, [["pixelFont", true]]);
  assert.equal(uiCalls.includes("blur"), false);
  selectEmojiFont(
    {
      renderPixelFontToggle: () => uiCalls.push("renderPixelFontToggleNoDetail"),
      savePreference(key: string, value: unknown) {
        preferenceCalls.push([key, value]);
      },
    },
    { currentTarget: { blur: () => uiCalls.push("blur-no-detail"), dataset: { emojiFont: "system" } } },
  );
  assert.deepEqual(preferenceCalls.at(-1), ["pixelFont", false]);
  assert.equal(uiCalls.includes("blur-no-detail"), false);

  await selectTheme(
    {
      renderThemeToggle: () => uiCalls.push("renderThemeToggle"),
      savePreference(key: string, value: unknown) {
        preferenceCalls.push([key, value]);
      },
    },
    { currentTarget: { dataset: { theme: "base" } } },
  );
  assert.deepEqual(preferenceCalls.at(-1), ["theme", "base"]);
  await selectTheme(
    {
      renderThemeToggle: () => uiCalls.push("renderThemeToggleLight"),
      savePreference(key: string, value: unknown) {
        preferenceCalls.push([key, value]);
      },
    },
    { currentTarget: { dataset: { theme: "light" } } },
  );
  assert.deepEqual(preferenceCalls.at(-1), ["theme", "light"]);

  await queryModeController.change({
    currentTarget: {
      closest: () => ({ dataset: { mode: "mystery" } }),
    },
    target: {},
  });
  assert.equal(state.explorerPreferences.mode, "standard");

  renderThemeToggle({
    choices: () => [null, "not-a-choice", { isConnected: false }],
    state: () => ({
      developerModeUrlDismissed: false,
      explorerModeFromUrl: "",
      explorerPreferences: { mode: "standard", theme: "dark" },
    }),
  });
  assert.equal(fixture.documentElement.dataset.theme, "dark");

  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
    },
  });
  assert.doesNotThrow(() =>
    renderThemeToggle({
      choices: () => [],
      state: () => state,
    }),
  );
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  }
} finally {
  fixture.restore();
}
