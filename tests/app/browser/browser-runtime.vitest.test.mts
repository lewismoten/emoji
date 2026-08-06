import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createSearchLanguageLifecycle = vi.fn((options: any) => ({
  kind: "search-language-lifecycle",
  onPopState: vi.fn(),
  options,
}));
const openPanelDialog = vi.fn();
const installPixelFontHotReload = vi.fn();
const refreshExplorerPixelFont = vi.fn(() => Promise.resolve());
const refreshPixelFontStylesheet = vi.fn(
  (
    options: { onStylesheetLoaded: (revision: string) => void },
    revision: string,
  ) => {
    options.onStylesheetLoaded(`${revision}-done`);
    return Promise.resolve();
  },
);

vi.mock("../../../src/explorer/language/search-language-lifecycle.js", () => ({
  createSearchLanguageLifecycle,
}));
vi.mock("../../../src/explorer/pwa/pwa-panels.js", () => ({
  openPanelDialog,
}));
vi.mock("../../../src/pixel-font-hot-reload.js", () => ({
  installPixelFontHotReload,
  refreshExplorerPixelFont,
  refreshPixelFontStylesheet,
}));

describe("browser runtime", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    "navigator",
  );
  const originalCaches = Object.getOwnPropertyDescriptor(globalThis, "caches");

  beforeEach(async () => {
    vi.clearAllMocks();
    const state = await import("../../../src/state.js");
    state.currentEmojiKey.set("rocket");
    state.searchLoadId.set(1);
    state.searchLocales.set([{ code: "en" }] as any);
    state.selectedSearchLocale.set("en");
    Reflect.set(globalThis, "__TEST_VITE_DEV__", true);
  });

  afterEach(() => {
    if (originalWindow)
      Object.defineProperty(globalThis, "window", originalWindow);
    else delete (globalThis as any).window;
    if (originalNavigator)
      Object.defineProperty(globalThis, "navigator", originalNavigator);
    else delete (globalThis as any).navigator;
    if (originalCaches)
      Object.defineProperty(globalThis, "caches", originalCaches);
    else delete (globalThis as any).caches;
    delete (globalThis as any).__TEST_VITE_DEV__;
  });

  it("creates pixel font refresh behavior from shared state", async () => {
    const { createPixelFontRefreshOptions } =
      await import("../../../src/app/browser/browser-runtime.js");

    let onPixelFontRevisionLoadedCalls = 0;
    const refreshOptions = createPixelFontRefreshOptions({
      applyPixelArtworkClass() {},
      applyStandalonePixelArtwork() {},
      dialog: () => ({ id: "dialog" }),
      onPixelFontRevisionLoaded() {
        onPixelFontRevisionLoadedCalls += 1;
      },
      updateModifierArtwork() {},
      updatePixelArtworkManifest() {},
    });

    await refreshOptions.refreshStylesheet("rev-direct");
    expect(onPixelFontRevisionLoadedCalls).toBe(1);
    expect(refreshPixelFontStylesheet).toHaveBeenCalledTimes(1);
    expect(refreshExplorerPixelFont).toHaveBeenCalledWith(
      expect.objectContaining({
        currentEmojiKey: expect.any(Function),
        dialog: expect.any(Function),
      }),
      "rev-direct-done",
    );
    const refreshRuntimeOptions: any = (
      refreshExplorerPixelFont.mock.calls as any
    )[0][0];
    expect(refreshRuntimeOptions.currentEmojiKey()).toBe("rocket");
  });

  it("initializes lifecycle wiring, service worker runtime, and panel restoration", async () => {
    const popstateHandlers: Array<(...args: unknown[]) => void> = [];
    const loadHandlers: Array<(...args: unknown[]) => void> = [];
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        isSecureContext: true,
        location: {
          origin: "https://emoji.example",
          hostname: "emoji.example",
        },
        addEventListener(type: string, handler: (...args: unknown[]) => void) {
          if (type === "popstate") popstateHandlers.push(handler);
          if (type === "load") loadHandlers.push(handler);
        },
      },
    });
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { serviceWorker: { getRegistrations: async () => [] } },
    });
    Object.defineProperty(globalThis, "caches", {
      configurable: true,
      value: { keys: async () => [], delete: async () => true },
    });

    const helpDialog = { id: "help-dialog" };
    const savedDialog = { id: "saved-dialog" };
    const ownerDocument = {
      querySelector(selector: string) {
        if (selector === "#help-dialog") return helpDialog;
        if (selector === "#saved-dialog") return savedDialog;
        return null;
      },
    };
    const languageDialog = { dataset: { returnPanel: "help" }, ownerDocument };
    const syncUrlCalls: unknown[][] = [];

    const { initializeBrowserRuntime } =
      await import("../../../src/app/browser/browser-runtime.js");

    const runtime: any = initializeBrowserRuntime({
      applyDialogUrlState() {},
      applyPixelArtworkClass() {},
      applyStandalonePixelArtwork() {},
      closePanelDialog() {},
      dialog: () => undefined,
      languageDialog: () => languageDialog,
      languageFlags: { en: "🇺🇸" },
      languageList: () => [{ code: "en" }],
      languagePicker: () => ({ disabled: false }),
      languagePickerFlag: () => undefined,
      languagePickerLabel: () => undefined,
      loadUiTranslations: async () => ({}),
      nextLoadId: () => 2,
      onPixelFontRevisionLoaded() {},
      refreshLocalizedLabels() {},
      restoreDeveloperMode() {},
      setApplyingUrlState() {},
      setSearchLabels() {},
      setSearchLocales() {},
      setSearchSubgroupLabels() {},
      setSelectedLocale() {},
      suppressedPanelCloses: () => new WeakSet(),
      syncUrlState: (...args: unknown[]) => {
        syncUrlCalls.push(args);
      },
      translate: (key: string) => key,
      updateModifierArtwork() {},
      updatePixelArtworkManifest() {},
      updateWebAppManifest() {},
    });

    expect(runtime.kind).toBe("search-language-lifecycle");
    expect(createSearchLanguageLifecycle).toHaveBeenCalledTimes(1);
    const lifecycleOptions = createSearchLanguageLifecycle.mock.calls[0]![0];
    expect(lifecycleOptions.currentLoadId()).toBe(1);
    expect(lifecycleOptions.searchLocales()).toEqual([{ code: "en" }]);
    expect(lifecycleOptions.selectedSearchLocale()).toBe("en");
    expect(popstateHandlers).toHaveLength(1);
    expect(installPixelFontHotReload).toHaveBeenCalledTimes(1);

    lifecycleOptions.restoreLanguageParentPanel();
    expect(languageDialog.dataset.returnPanel).toBeUndefined();
    expect(openPanelDialog).toHaveBeenCalledTimes(1);
    expect(syncUrlCalls).toEqual([[]]);
    expect(loadHandlers).toHaveLength(1);
  });
});
