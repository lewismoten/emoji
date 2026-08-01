import assert from "node:assert/strict";
import {
  renderPixelFontToggle,
  renderThemeToggle,
  selectEmojiFont,
  selectTheme,
} from "../../../src/explorer-ui.js";
import { createElement, installExplorerUiFixture } from "./explorer-ui-fixture.mjs";

const fixture = installExplorerUiFixture();

try {
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

  const state = {
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
  renderThemeToggle({
    choices: () => [lightThemeChoice, darkThemeChoice, retroThemeChoice],
    state: () => state,
  });
  assert.equal(fixture.documentElement.dataset.theme, "light");
  assert.equal(fixture.themeMeta.content, "#f6efe4");

  state.explorerPreferences.theme = "retro";
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
      explorerPreferences: { developerMode: true, theme: "mystery" },
    }),
  });
  assert.equal(fixture.documentElement.dataset.theme, "dark");

  const selectorThemeChoice = createElement({ theme: "retro" });
  selectorThemeChoice.querySelector = () => null;
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
  renderThemeToggle({
    state: () => ({
      explorerModeFromUrl: "",
      developerModeUrlDismissed: false,
      explorerPreferences: { developerMode: false, theme: "retro", mode: "advanced" },
    }),
  });
  assert.equal(selectorThemeChoice.classList.active.has("is-active"), true);
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
      explorerPreferences: { developerMode: false, theme: "light", mode: "mystery" },
    }),
  });
  assert.equal(fixture.themeMeta.content, "");

  Reflect.deleteProperty(globalThis, "document");
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
  assert.equal(fixture.documentElement.dataset.emojiFont, undefined);
  assert.equal(pixelChoice.classList.active.has("is-active"), true);
  assert.equal(pixelChoiceInput.checked, true);

  state.explorerPreferences.pixelFont = false;
  renderPixelFontToggle({
    choices: () => [pixelChoice, systemChoice],
    refreshRenderedPixelEmoji: () => calls.push("refresh-pixel-off"),
    state: () => state,
  });
  assert.equal(fixture.documentElement.dataset.emojiFont, "system");
  assert.equal(systemChoice.classList.active.has("is-active"), true);
  assert.equal(systemChoiceInput.checked, true);

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
  assert.equal(selectorPixelChoice.classList.active.has("is-active"), true);
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  }

  const preferenceCalls: Array<[string, unknown]> = [];
  await selectTheme(
    {
      renderThemeToggle: () => calls.push("rerender-theme"),
      savePreference(key: string, value: unknown) {
        preferenceCalls.push([key, value]);
      },
    },
    { currentTarget: { dataset: { theme: "retro" } } },
  );
  selectEmojiFont(
    {
      renderPixelFontToggle: () => calls.push("rerender-font"),
      savePreference(key: string, value: unknown) {
        preferenceCalls.push([key, value]);
      },
    },
    {
      currentTarget: {
        blur: () => calls.push("blur-font"),
        dataset: { emojiFont: "system" },
      },
      detail: 1,
    },
  );
  assert.deepEqual(preferenceCalls, [
    ["theme", "retro"],
    ["pixelFont", false],
  ]);

  await selectTheme(
    {
      renderThemeToggle: () => calls.push("rerender-theme-fallback"),
      savePreference(key: string, value: unknown) {
        preferenceCalls.push([key, value]);
      },
    },
    { currentTarget: { dataset: { theme: "mystery" } } },
  );
  assert.deepEqual(preferenceCalls.at(-1), ["theme", "dark"]);

  selectEmojiFont(
    {
      renderPixelFontToggle: () => calls.push("rerender-font-no-blur"),
      savePreference(key: string, value: unknown) {
        preferenceCalls.push([key, value]);
      },
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
      savePreference(key: string, value: unknown) {
        preferenceCalls.push([key, value]);
      },
    },
    {
      currentTarget: {
        blur: () => calls.push("blur-font-pixel"),
        dataset: { emojiFont: "pixel" },
      },
      detail: 2,
    },
  );
  assert.deepEqual(preferenceCalls.at(-1), ["pixelFont", true]);
  assert.equal(calls.includes("blur-font-pixel"), true);
} finally {
  fixture.restore();
}
