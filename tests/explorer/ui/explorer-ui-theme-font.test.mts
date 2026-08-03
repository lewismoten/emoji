import assert from "node:assert/strict";
import * as preferences from "../../../src/preferences.js";
import {
  renderPixelFontToggle, renderThemeToggle, selectEmojiFont, selectTheme,
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
  preferences.setString("mode", "developer");
  preferences.setString("theme", "base");
  preferences.setBoolean("pixelFont", true);

  const pixelChoiceInput = createElement();
  const systemChoiceInput = createElement();
  const pixelChoice = createElement({ emojiFont: "pixel" });
  const systemChoice = createElement({ emojiFont: "system" });
  pixelChoice.querySelector = () => pixelChoiceInput;
  systemChoice.querySelector = () => systemChoiceInput;
  const lightInput = createElement();
  const darkInput = createElement();
  const retroInput = createElement();
  const baseInput = createElement();
  const lightThemeChoice = createElement({ theme: "light" });
  const darkThemeChoice = createElement({ theme: "dark" });
  const retroThemeChoice = createElement({ theme: "retro" });
  const baseThemeChoice = createElement({ theme: "base" });
  (lightThemeChoice as any).isConnected = true;
  (darkThemeChoice as any).isConnected = true;
  (retroThemeChoice as any).isConnected = true;
  (baseThemeChoice as any).isConnected = true;
  lightThemeChoice.querySelector = () => lightInput;
  darkThemeChoice.querySelector = () => darkInput;
  retroThemeChoice.querySelector = () => retroInput;
  baseThemeChoice.querySelector = () => baseInput;
  (pixelChoice as any).isConnected = true;
  (systemChoice as any).isConnected = true;

  const state: any = {
    explorerPreferences: {
      mode: "developer",
      pixelFont: true,
      theme: "base",
    },
  };
  const calls: string[] = [];

  fixture.documentElement.dataset.developerMode = "1";
  fixture.documentElement.dataset.fullDeveloperMode = "1";
  renderThemeToggle({
    choices: () => [
      baseThemeChoice,
      lightThemeChoice,
      darkThemeChoice,
      retroThemeChoice,
    ],
    state: () => state,
  });
  assert.equal(fixture.documentElement.dataset.theme, "base");
  assert.equal(baseThemeChoice.classList.active.has("is-active"), true);
  assert.equal(baseInput.getAttribute("checked"), "checked");

  state.explorerPreferences.theme = "base";
  state.explorerPreferences.mode = "standard";
  preferences.setString("mode", "standard");
  preferences.setString("theme", "base");
  delete fixture.documentElement.dataset.developerMode;
  delete fixture.documentElement.dataset.fullDeveloperMode;
  renderThemeToggle({
    choices: () => [lightThemeChoice, darkThemeChoice, retroThemeChoice],
    state: () => state,
  });
  assert.equal(fixture.documentElement.dataset.theme, "dark");
  assert.equal(darkThemeChoice.classList.active.has("is-active"), true);
  assert.equal(fixture.themeMeta.content, "#160622");

  state.explorerPreferences.theme = "light";
  preferences.setString("theme", "light");
  renderThemeToggle({
    choices: () => [lightThemeChoice, darkThemeChoice, retroThemeChoice],
    state: () => state,
  });
  assert.equal(fixture.documentElement.dataset.theme, "light");
  assert.equal(fixture.themeMeta.content, "#f6efe4");

  state.explorerPreferences.theme = "retro";
  preferences.setString("theme", "retro");
  renderThemeToggle({
    choices: () => [lightThemeChoice, darkThemeChoice, retroThemeChoice],
    state: () => state,
  });
  assert.equal(fixture.documentElement.dataset.theme, "retro");
  assert.equal(fixture.themeMeta.content, "#0000aa");

  renderThemeToggle({
    choices: () => [],
    state: () => ({
      explorerModeFromUrl: "",
      developerModeUrlDismissed: false,
      developerModeFromUrl: false,
      explorerPreferences: { developerMode: true, theme: "mystery" },
    } as any),
  });
  assert.equal(fixture.documentElement.dataset.theme, "retro");

  preferences.setString("theme", "dark");
  renderThemeToggle({
    choices: () => [],
    state: () => ({
      explorerModeFromUrl: "",
      developerModeUrlDismissed: false,
      developerModeFromUrl: false,
      explorerPreferences: { developerMode: false, mode: "standard" },
    } as any),
  });
  assert.equal(fixture.documentElement.dataset.theme, "dark");
  preferences.setString("theme", "");
  renderThemeToggle({
    choices: () => [],
    state: () => ({
      explorerModeFromUrl: "",
      developerModeUrlDismissed: false,
      developerModeFromUrl: false,
      explorerPreferences: { developerMode: false, mode: "standard" },
    } as any),
  });
  assert.equal(fixture.documentElement.dataset.theme, "dark");

  const selectorThemeChoice = createElement({ theme: "retro" });
  selectorThemeChoice.querySelector = () => null;
  const mixedLightChoice = createElement({ theme: "light" });
  (mixedLightChoice as any).isConnected = true;
  mixedLightChoice.querySelector = () => null;
  const originalDocumentForSelector = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: fixture.documentElement,
      querySelector(selector: string) {
        if (selector === 'meta[name="theme-color"]') return fixture.themeMeta;
        return null;
      },
      querySelectorAll(selector: string) {
        return selector === ".theme-choice" ? [selectorThemeChoice] : [];
      },
    },
  });
  preferences.setString("theme", "retro");
  renderThemeToggle({
    choices: () => [null as any, "bad-choice" as any, mixedLightChoice],
    state: () => ({
      explorerModeFromUrl: "",
      developerModeUrlDismissed: false,
      developerModeFromUrl: false,
      explorerPreferences: {
        developerMode: false,
        theme: "retro",
        mode: "advanced",
      },
    } as any),
  });
  assert.equal(mixedLightChoice.classList.active.has("is-active"), false);
  if (originalDocumentForSelector) {
    Object.defineProperty(globalThis, "document", originalDocumentForSelector);
  }

  fixture.themeMeta.content = "";
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: fixture.documentElement,
      querySelector(selector: string) {
        if (selector === 'meta[name="theme-color"]') return null;
        return null;
      },
      querySelectorAll() {
        return [];
      },
    },
  });
  renderThemeToggle({
    choices: () => [lightThemeChoice],
    state: () => ({
      explorerModeFromUrl: "",
      developerModeUrlDismissed: false,
      developerModeFromUrl: false,
      explorerPreferences: { developerMode: false, theme: "light", mode: "mystery" },
    } as any),
  });
  assert.equal(fixture.themeMeta.content, "");

  Reflect.deleteProperty(globalThis, "document");
  assert.doesNotThrow(() =>
    renderThemeToggle({
      choices: () => [],
      state: () => state,
    }),
  );
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: null,
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

  renderPixelFontToggle({
    choices: () => [pixelChoice, systemChoice],
    refreshRenderedPixelEmoji: () => calls.push("refresh-pixel"),
    state: () => state,
  });
  assert.equal(fixture.documentElement.dataset.emojiFont, "system");
  assert.equal(systemChoice.classList.active.has("is-active"), true);
  assert.equal(systemChoiceInput.checked, true);
  assert.equal(pixelChoiceInput.checked, false);
  assert.equal(pixelChoiceInput.getAttribute("checked"), null);

  state.explorerPreferences.pixelFont = false;
  preferences.setBoolean("pixelFont", false);
  renderPixelFontToggle({
    choices: () => [pixelChoice, systemChoice],
    refreshRenderedPixelEmoji: () => calls.push("refresh-pixel-off"),
    state: () => state,
  });
  assert.equal(fixture.documentElement.dataset.emojiFont, undefined);
  assert.equal(pixelChoice.classList.active.has("is-active"), true);
  assert.equal(pixelChoiceInput.checked, true);
  assert.equal(systemChoiceInput.checked, false);
  assert.equal(systemChoiceInput.getAttribute("checked"), null);

  renderPixelFontToggle({
    choices: () => [],
    refreshRenderedPixelEmoji: () => calls.push("refresh-pixel-empty"),
    state: () => ({ explorerPreferences: { pixelFont: true } }),
  });

  const selectorPixelChoice = createElement({ emojiFont: "system" });
  selectorPixelChoice.querySelector = () => null;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: fixture.documentElement,
      querySelector() {
        return null;
      },
      querySelectorAll(selector: string) {
        return selector === ".emoji-font-choice" ? [selectorPixelChoice] : [];
      },
    },
  });
  renderPixelFontToggle({
    refreshRenderedPixelEmoji: () => calls.push("refresh-pixel-selector"),
    state: () => ({ explorerPreferences: { pixelFont: false } }),
  });
  assert.equal(selectorPixelChoice.classList.active.has("is-active"), false);
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  }

  await selectTheme(
    {
      renderThemeToggle: () => calls.push("rerender-theme"),
    },
    { currentTarget: { dataset: { theme: "retro" } } },
  );
  selectEmojiFont(
    {
      renderPixelFontToggle: () => calls.push("rerender-font"),
    },
    {
      currentTarget: {
        blur: () => calls.push("blur-font"),
        dataset: { emojiFont: "system" },
      },
      detail: 1,
    },
  );
  assert.equal(preferences.getString("theme"), "retro");
  assert.equal(preferences.getBoolean("pixelFont"), false);

  await selectTheme(
    {
      renderThemeToggle: () => calls.push("rerender-theme-fallback"),
    },
    { currentTarget: { dataset: { theme: "mystery" } } },
  );
  assert.equal(preferences.getString("theme"), "dark");

  selectEmojiFont(
    {
      renderPixelFontToggle: () => calls.push("rerender-font-no-blur"),
    },
    {
      currentTarget: {
        blur: () => calls.push("blur-font-never"),
        dataset: { emojiFont: "pixel" },
      },
      detail: 0,
    },
  );
  assert.equal(calls.includes("blur-font-never"), false);

  selectEmojiFont(
    {
      renderPixelFontToggle: () => calls.push("rerender-font-pixel"),
    },
    {
      currentTarget: {
        blur: () => calls.push("blur-font-pixel"),
        dataset: { emojiFont: "pixel" },
      },
      detail: 2,
    },
  );
  assert.equal(preferences.getBoolean("pixelFont"), true);
  assert.equal(calls.includes("blur-font-pixel"), true);
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  fixture.restore();
}
