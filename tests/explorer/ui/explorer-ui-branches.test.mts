import assert from "node:assert/strict";
import * as preferences from "../../../src/preferences.js";
import {
  createDeveloperModeController,
  createExplorerUiController,
  selectEmojiFont,
} from "../../../src/explorer-ui.js";
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
  preferences.setString("mode", "mystery" as never);
  preferences.setString("theme", "base");

  const state: any = {
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
    renderDeveloperMode: () => (uiCalls as string[]).push("renderDeveloperMode"),
    renderInstallAppButton: () => undefined,
    renderMusicToggle: () => (uiCalls as string[]).push("renderMusicToggle"),
    renderPixelFontToggle: () => (uiCalls as string[]).push("renderPixelFontToggle"),
    renderSearchLanguages: () => (uiCalls as string[]).push("renderSearchLanguages"),
    renderSoundEffectsToggle: () => (uiCalls as string[]).push("renderSoundEffectsToggle"),
    renderVersionModeToggle: () => (uiCalls as string[]).push("renderVersionModeToggle"),
    setDeferredInstallPrompt: () => undefined,
    state: () => state,
  });
  controller.applyTranslations();
  assert.deepEqual(uiCalls, []);
  assert.doesNotThrow(() =>
    createExplorerUiController({
      deferredInstallPrompt: () => null,
      installAppButton: () => null,
      installDialog: () => null,
      installWebApp: async () => ({ deferredInstallPrompt: null }),
      offlineStatus: () => null,
      pixelEditor: () => null,
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
  assert.equal(toggle.attributes.get("aria-pressed"), "false");
  preferences.setString("mode", "advanced");
  state.explorerModeFromUrl = "developer";
  state.developerModeUrlDismissed = true;
  assert.equal(toggleController.mode(), "advanced");
  preferences.setString("mode", "");
  state.explorerModeFromUrl = "";
  state.developerModeUrlDismissed = false;
  assert.equal(toggleController.mode(), "standard");
  const choiceWithoutQuery = createElement({ mode: "standard" });
  (choiceWithoutQuery as any).isConnected = true;
  const querylessRenderController = createDeveloperModeController({
    choices: () => [choiceWithoutQuery],
    dialog: () => ({ open: false, classList: { contains: () => false } }),
    disableDeveloperFeatures: () => undefined,
    loadVersionData: async () => undefined,
    setDialogView: () => undefined,
    state: () => state,
    syncUrlState: () => undefined,
    toggle: () => null,
  });
  querylessRenderController.render();

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
  assert.equal(preferences.getString("mode"), "developer");

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
  assert.equal(preferences.getString("mode"), "advanced");

  await queryModeController.change({
    currentTarget: {
      closest: () => null,
      querySelector: () => null,
    },
    target: {},
  });
  assert.equal(preferences.getString("mode"), "standard");
  const querySelectorFallbackController = createDeveloperModeController({
    choices: () => [],
    dialog: () => ({ open: false, classList: { contains: () => false } }),
    disableDeveloperFeatures: () => undefined,
    loadVersionData: async () => undefined,
    setDialogView: () => undefined,
    state: () => state,
    syncUrlState: () => undefined,
    toggle: () => null,
  });
  await querySelectorFallbackController.change({
    currentTarget: {
      checked: true,
      querySelector: () => ({ value: "developer" }),
    },
    target: {},
  });
  assert.equal(preferences.getString("mode"), "developer");
  const checkedFallbackController = createDeveloperModeController({
    choices: () => [],
    dialog: () => ({ open: false, classList: { contains: () => false } }),
    disableDeveloperFeatures: () => undefined,
    loadVersionData: async () => undefined,
    setDialogView: () => undefined,
    state: () => state,
    syncUrlState: () => undefined,
    toggle: () => null,
  });
  await checkedFallbackController.change({
    currentTarget: { checked: true },
  });
  assert.equal(preferences.getString("mode"), "developer");
  await checkedFallbackController.change({
    currentTarget: { checked: false },
  });
  assert.equal(preferences.getString("mode"), "standard");
  const noRenderThemeController = createDeveloperModeController({
    choices: () => [],
    dialog: () => ({ open: false, classList: { contains: () => false } }),
    disableDeveloperFeatures: () => undefined,
    loadVersionData: async () => undefined,
    setDialogView: () => undefined,
    state: () => state,
    syncUrlState: () => undefined,
    toggle: () => null,
  });
  await noRenderThemeController.change({
    currentTarget: { checked: true },
  });
  assert.equal(preferences.getString("mode"), "developer");

  const noBlurEvent = {
    currentTarget: {
      blur: () => (uiCalls as string[]).push("blur"),
      dataset: { emojiFont: "pixel" },
    },
    detail: 0,
  };
  selectEmojiFont(
    {
      renderPixelFontToggle: () =>
        (uiCalls as string[]).push("renderPixelFontToggleAgain"),
    },
    noBlurEvent,
  );
  assert.equal(preferences.getBoolean("pixelFont"), true);
  assert.equal((uiCalls as string[]).includes("blur"), false);
  selectEmojiFont(
    {
      renderPixelFontToggle: () =>
        (uiCalls as string[]).push("renderPixelFontToggleNoDetail"),
    },
    {
      currentTarget: {
        blur: () => (uiCalls as string[]).push("blur-no-detail"),
        dataset: { emojiFont: "system" },
      },
    },
  );
  assert.equal(preferences.getBoolean("pixelFont"), false);
  assert.equal((uiCalls as string[]).includes("blur-no-detail"), false);

  assert.equal(preferences.getString("theme"), "base");
  assert.equal(preferences.getString("theme"), "light");

  await queryModeController.change({
    currentTarget: {
      closest: () => ({ dataset: { mode: "mystery" } }),
    },
    target: {},
  });
  assert.equal(preferences.getString("mode"), "standard");

  preferences.setString("theme", "dark");
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
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  }
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  fixture.restore();
}
