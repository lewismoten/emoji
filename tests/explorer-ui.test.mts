import assert from "node:assert/strict";
import {
  createDeveloperModeController,
  createExplorerUiController,
  renderPixelFontToggle,
  renderThemeToggle,
  selectEmojiFont,
  selectTheme,
} from "../src/explorer-ui.js";

type FakeElement = {
  attributes: Map<string, string>;
  checked?: boolean;
  classList: {
    active: Set<string>;
    toggle: (name: string, force?: boolean) => void;
  };
  content?: string;
  dataset: Record<string, string>;
  dir?: string;
  getAttribute: (name: string) => string | null;
  hidden?: boolean;
  lang?: string;
  placeholder?: string;
  querySelector?: (selector: string) => FakeElement | null;
  setAttribute: (name: string, value: string) => void;
  tabIndex?: number;
  textContent?: string;
};

const createElement = (
  dataset: Record<string, string> = {},
  textContent = "",
): FakeElement => {
  const attributes = new Map<string, string>();
  const active = new Set<string>();
  return {
    attributes,
    checked: false,
    classList: {
      active,
      toggle(name: string, force?: boolean) {
        if (force === false) active.delete(name);
        else if (force === true || !active.has(name)) active.add(name);
        else active.delete(name);
      },
    },
    dataset,
    getAttribute(name: string) {
      return attributes.get(name) ?? null;
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    tabIndex: -1,
    textContent,
  };
};

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
const originalNavigator = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator",
);

try {
  const i18nText = createElement({ i18n: "title" }, "Original title");
  const i18nPlaceholder = createElement(
    { i18nPlaceholder: "searchPlaceholder" },
    "",
  );
  i18nPlaceholder.placeholder = "Search";
  const i18nAria = createElement({ i18nAriaLabel: "theme" }, "");
  i18nAria.setAttribute("aria-label", "Theme");
  const offlineStatus = createElement({}, "");
  offlineStatus.hidden = true;

  const appMeta = { content: "" };
  const appleMeta = { content: "" };
  const themeMeta = { content: "" };

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
  lightThemeChoice.querySelector = () => lightInput;
  darkThemeChoice.querySelector = () => darkInput;
  retroThemeChoice.querySelector = () => retroInput;
  baseThemeChoice.querySelector = () => baseInput;

  const documentElement = {
    dataset: {} as Record<string, string>,
    dir: "ltr",
    hasAttribute(name: string) {
      return name === "data-developer-mode"
        ? Boolean(documentElement.dataset.developerMode)
        : false;
    },
    lang: "en",
    toggleAttribute(name: string, force?: boolean) {
      const key = name
        .replace(/^data-/, "")
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (force === false) delete documentElement.dataset[key];
      else documentElement.dataset[key] = "";
    },
  };

  const queryAllMap = new Map<string, FakeElement[]>([
    ["[data-i18n]", [i18nText]],
    ["[data-i18n-placeholder]", [i18nPlaceholder]],
    ["[data-i18n-aria-label]", [i18nAria]],
  ]);

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: false },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement,
      querySelector(selector: string) {
        if (selector === 'meta[name="application-name"]') return appMeta;
        if (selector === 'meta[name="apple-mobile-web-app-title"]')
          return appleMeta;
        if (selector === 'meta[name="theme-color"]') return themeMeta;
        return null;
      },
      querySelectorAll(selector: string) {
        return queryAllMap.get(selector) ?? [];
      },
      title: "",
    },
  });

  const fetchCalls: string[] = [];
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string) => {
      fetchCalls.push(url);
      if (url === "demo-locales/ui.en.json") {
        return {
          ok: false,
          async json() {
            return {};
          },
        };
      }
      if (url === "src/demo-locales/ui.en.json") {
        return {
          ok: true,
          async json() {
            return {
              title: "Emoji Explorer",
              offlineStatus: "Offline",
              searchPlaceholder: "Find emoji",
              theme: "Theme label",
            };
          },
        };
      }
      if (url === "demo-locales/ui.en-US.json") {
        return {
          ok: false,
          async json() {
            return {};
          },
        };
      }
      if (url === "src/demo-locales/ui.en-US.json") {
        return {
          ok: true,
          async json() {
            return {};
          },
        };
      }
      if (url === "demo-locales/ui.ar.json") {
        return {
          ok: true,
          async json() {
            return { title: "مستكشف الإيموجي", offlineStatus: "غير متصل" };
          },
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    },
  });

  const state = {
    developerModeFromUrl: true,
    developerModeUrlDismissed: false,
    explorerPreferences: {
      developerMode: false,
      music: true,
      pixelFont: true,
      soundEffects: false,
      theme: "base",
    },
    uiStrings: {} as Record<string, string>,
  };

  const calls: string[] = [];
  const installButton = createElement();
  const installDialog = createElement();
  const pixelEditor = {
    refreshTranslations: () => calls.push("refresh-translations"),
  };
  let deferredInstallPrompt: unknown = { prompt: true };

  const controller = createExplorerUiController({
    deferredInstallPrompt: () => deferredInstallPrompt,
    installAppButton: () => installButton,
    installDialog: () => installDialog,
    installWebApp: async (payload: Record<string, unknown>) => {
      calls.push(
        `install:${String(payload.renderInstallAppButton !== undefined)}`,
      );
      return { deferredInstallPrompt: { accepted: true } };
    },
    offlineStatus: () => offlineStatus,
    pixelEditor: () => pixelEditor,
    renderDeveloperMode: () => calls.push("render-developer-mode"),
    renderInstallAppButton: (button: FakeElement) => {
      assert.equal(button, installButton);
      calls.push("render-install");
    },
    renderMusicToggle: () => calls.push("render-music"),
    renderPixelFontToggle: () => calls.push("render-pixel"),
    renderSearchLanguages: () => calls.push("render-search-languages"),
    renderSoundEffectsToggle: () => calls.push("render-sfx"),
    renderVersionModeToggle: () => calls.push("render-version"),
    setDeferredInstallPrompt: (value: unknown) => {
      deferredInstallPrompt = value;
      calls.push("set-install-prompt");
    },
    state: () => state,
  });

  controller.updateOnlineStatus();
  assert.equal(offlineStatus.textContent, "Offline — showing saved data");
  assert.equal(offlineStatus.hidden, false);

  controller.renderInstallAppButton();
  assert.ok(calls.includes("render-install"));

  controller.applyTranslations();
  assert.ok(calls.includes("refresh-translations"));

  await controller.loadUiTranslations("en-US");
  assert.deepEqual(fetchCalls, [
    "demo-locales/ui.en.json",
    "demo-locales/ui.en-US.json",
    "src/demo-locales/ui.en.json",
    "src/demo-locales/ui.en-US.json",
  ]);
  assert.equal(state.uiStrings.title, "Emoji Explorer");
  assert.equal(i18nText.textContent, "Emoji Explorer");
  assert.equal(i18nPlaceholder.placeholder, "Find emoji");
  assert.equal(i18nAria.attributes.get("aria-label"), "Theme label");
  assert.equal(documentElement.lang, "en-US");
  assert.equal(documentElement.dir, "ltr");
  assert.equal(
    (globalThis.document as any).title,
    "Emoji Explorer – Unicode Emoji",
  );
  assert.equal(appMeta.content, "Emoji Explorer");
  assert.equal(appleMeta.content, "Emoji Explorer");
  assert.ok(calls.includes("render-version"));
  assert.ok(calls.includes("render-search-languages"));

  await controller.installApp(new Event("click"));
  assert.deepEqual(deferredInstallPrompt, { accepted: true });
  assert.ok(calls.includes("set-install-prompt"));

  fetchCalls.length = 0;
  await controller.loadUiTranslations("ar", true);
  assert.deepEqual(fetchCalls, ["demo-locales/ui.ar.json"]);
  assert.equal(documentElement.lang, "ar");
  assert.equal(documentElement.dir, "rtl");
  assert.equal(
    (globalThis.document as any).title,
    "مستكشف الإيموجي – Unicode Emoji",
  );

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => ({
      ok: false,
      async json() {
        return {};
      },
    }),
  });
  await controller.loadUiTranslations("zz-ZZ");
  assert.deepEqual(state.uiStrings, {});
  assert.equal(documentElement.lang, "en");
  assert.equal(documentElement.dir, "ltr");
  assert.equal(
    (globalThis.document as any).title,
    "Emoji Explorer – Unicode Emoji",
  );

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string) => {
      fetchCalls.push(url);
      if (url === "demo-locales/ui.en.json") {
        return {
          ok: false,
          async json() {
            return {};
          },
        };
      }
      if (url === "src/demo-locales/ui.en.json") {
        return {
          ok: true,
          async json() {
            return {
              title: "Emoji Explorer",
              offlineStatus: "Offline",
              searchPlaceholder: "Find emoji",
              theme: "Theme label",
            };
          },
        };
      }
      if (url === "demo-locales/ui.en-US.json") {
        return {
          ok: false,
          async json() {
            return {};
          },
        };
      }
      if (url === "src/demo-locales/ui.en-US.json") {
        return {
          ok: true,
          async json() {
            return {};
          },
        };
      }
      if (url === "demo-locales/ui.ar.json") {
        return {
          ok: true,
          async json() {
            return { title: "مستكشف الإيموجي", offlineStatus: "غير متصل" };
          },
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    },
  });

  documentElement.dataset.developerMode = "1";
  renderThemeToggle({
    choices: () => [
      baseThemeChoice,
      lightThemeChoice,
      darkThemeChoice,
      retroThemeChoice,
    ],
    state: () => state,
  });
  assert.equal(documentElement.dataset.theme, "base");
  assert.equal(baseThemeChoice.classList.active.has("is-active"), true);
  assert.equal(baseInput.checked, true);

  state.explorerPreferences.theme = "base";
  delete documentElement.dataset.developerMode;
  renderThemeToggle({
    choices: () => [lightThemeChoice, darkThemeChoice, retroThemeChoice],
    state: () => state,
  });
  assert.equal(documentElement.dataset.theme, "dark");
  assert.equal(themeMeta.content, "#160622");

  state.explorerPreferences.theme = "light";
  renderThemeToggle({
    choices: () => [lightThemeChoice, darkThemeChoice, retroThemeChoice],
    state: () => state,
  });
  assert.equal(documentElement.dataset.theme, "light");
  assert.equal(themeMeta.content, "#f6efe4");

  state.explorerPreferences.theme = "retro";
  renderThemeToggle({
    choices: () => [lightThemeChoice, darkThemeChoice, retroThemeChoice],
    state: () => state,
  });
  assert.equal(documentElement.dataset.theme, "retro");
  assert.equal(themeMeta.content, "#0000aa");

  renderPixelFontToggle({
    choices: () => [pixelChoice, systemChoice],
    refreshRenderedPixelEmoji: () => calls.push("refresh-pixel"),
    state: () => state,
  });
  assert.equal(documentElement.dataset.emojiFont, undefined);
  assert.equal(pixelChoice.classList.active.has("is-active"), true);
  assert.equal(pixelChoiceInput.checked, true);

  state.explorerPreferences.pixelFont = false;
  renderPixelFontToggle({
    choices: () => [pixelChoice, systemChoice],
    refreshRenderedPixelEmoji: () => calls.push("refresh-pixel-off"),
    state: () => state,
  });
  assert.equal(documentElement.dataset.emojiFont, "system");
  assert.equal(systemChoice.classList.active.has("is-active"), true);
  assert.equal(systemChoiceInput.checked, true);

  const preferenceCalls: Array<[string, unknown]> = [];
  selectTheme(
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

  selectTheme(
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

  const developerToggle = createElement();
  const developerDialog = { open: true };
  const developerController = createDeveloperModeController({
    dialog: () => developerDialog,
    disableDeveloperFeatures: () => calls.push("disable-developer"),
    loadVersionData: async () => {
      calls.push("load-version-data");
    },
    renderThemeToggle: () => calls.push("rerender-dev-theme"),
    savePreference(key: string, value: unknown) {
      preferenceCalls.push([key, value]);
      (state.explorerPreferences as Record<string, unknown>)[key] = value;
    },
    setDialogView: (view: string) => calls.push(`dialog:${view}`),
    state: () => state,
    syncUrlState: () => calls.push("sync-url"),
    toggle: () => developerToggle,
  });

  developerController.render();
  assert.equal(developerToggle.checked, true);
  assert.equal(developerToggle.attributes.get("aria-checked"), "true");

  state.explorerPreferences.theme = "base";
  await developerController.change({ currentTarget: { checked: false } });
  assert.equal(state.developerModeFromUrl, false);
  assert.equal(state.developerModeUrlDismissed, true);
  assert.equal(state.explorerPreferences.theme, "dark");
  assert.ok(calls.includes("dialog:details"));
  assert.ok(calls.includes("disable-developer"));
  assert.ok(calls.includes("sync-url"));
} finally {
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalFetch) Object.defineProperty(globalThis, "fetch", originalFetch);
  else Reflect.deleteProperty(globalThis, "fetch");
  if (originalNavigator)
    Object.defineProperty(globalThis, "navigator", originalNavigator);
  else Reflect.deleteProperty(globalThis, "navigator");
}
