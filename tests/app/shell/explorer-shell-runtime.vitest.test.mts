import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const makeStore = <T,>(initial: T) => {
  let value = initial;
  return {
    get: vi.fn(() => value),
    set: vi.fn((next: T) => {
      value = next;
    }),
    replace: vi.fn((next: T) => {
      value = next;
    }),
  };
};

const state = {
  byId: makeStore({ wave: { key: "wave" } }),
  copiedEmojiKeys: makeStore<string[]>(["wave"]),
  currentEmojiKey: makeStore("wave"),
  emojiByKey: makeStore({ wave: "👋" }),
  favoriteEmojiKeys: makeStore<string[]>(["sparkles"]),
  items: makeStore<any[]>([{ key: "wave" }]),
  orderMode: makeStore("sequence"),
  searchAnnotations: makeStore({ wave: ["hello"] }),
  selectedSequenceType: makeStore("single"),
  versionManifests: makeStore([{ version: "16.0" }]),
};

const savedEmojiController = {
  addFavorite: vi.fn(),
  recordCopiedEmoji: vi.fn(),
  renderSavedEmoji: vi.fn(),
  updateFavoriteButton: vi.fn(),
};
const createSavedEmojiController = vi.fn(() => savedEmojiController);

const audioController = {
  bindAudioInteractions: vi.fn(),
  syncHelpMusic: vi.fn(),
};
const createExplorerAudioController = vi.fn(() => audioController);

const renderInstallAppButtonHelper = vi.fn();
const installWebApp = vi.fn();

const developerModeController = {
  enabled: vi.fn(() => true),
  fullEnabled: vi.fn(() => false),
  render: vi.fn(),
  change: vi.fn(),
};
const explorerUiController = {
  installApp: vi.fn(),
  loadUiTranslations: vi.fn(),
  renderInstallAppButton: vi.fn(),
  updateOnlineStatus: vi.fn(),
  applyTranslations: vi.fn(),
};
const createDeveloperModeController = vi.fn(() => developerModeController);
const createExplorerUiController = vi.fn(() => explorerUiController);
const renderPixelFontToggleHelper = vi.fn();
const selectEmojiFontHelper = vi.fn();
const setPressed = vi.fn();

vi.mock("../../../src/explorer/saved-emoji.js", () => ({
  createSavedEmojiController,
}));
vi.mock("../../../src/explorer-audio.js", () => ({
  createExplorerAudioController,
}));
vi.mock("../../../src/explorer/pwa/pwa-panels.js", () => ({
  installApp: installWebApp,
  renderInstallAppButton: renderInstallAppButtonHelper,
}));
vi.mock("../../../src/explorer-ui.js", () => ({
  createDeveloperModeController,
  createExplorerUiController,
  renderPixelFontToggle: renderPixelFontToggleHelper,
  selectEmojiFont: selectEmojiFontHelper,
}));
vi.mock("../../../src/state.js", () => state);
vi.mock("../../../src/utils/aria.js", () => ({
  setPressed,
}));

describe("createExplorerShell runtime behavior", () => {
  const beforeInstallHandlers: Array<(event: Event) => void> = [];
  const appInstalledHandlers: Array<() => void> = [];
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  beforeEach(() => {
    vi.clearAllMocks();
    state.items.set([{ key: "wave" }]);
    state.orderMode.set("sequence");
    state.selectedSequenceType.set("single");
    state.versionManifests.set([{ version: "16.0" }]);
    beforeInstallHandlers.length = 0;
    appInstalledHandlers.length = 0;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        addEventListener(type: string, handler: (...args: unknown[]) => void) {
          if (type === "beforeinstallprompt")
            beforeInstallHandlers.push(handler as (event: Event) => void);
          if (type === "appinstalled")
            appInstalledHandlers.push(handler as () => void);
        },
      },
    });
  });

  afterEach(() => {
    if (originalWindow)
      Object.defineProperty(globalThis, "window", originalWindow);
    else delete (globalThis as any).window;
  });

  it("handles runtime interactions without fixture source rewriting", async () => {
    const { createExplorerShell } =
      await import("../../../src/app/explorer-shell.js");

    const versionModeSelector = { value: "selected" };
    const versionSelector = { value: "15.0" };
    const renderCategoryFilters = vi.fn();
    const drawList = vi.fn();
    const groupedButton = {
      dataset: { order: "grouped" },
      classList: { toggle: vi.fn() },
    };
    const sequenceButton = {
      dataset: { order: "sequence" },
      classList: { toggle: vi.fn() },
    };
    const installButton = { hidden: false };

    const shell = createExplorerShell({
      applyPixelArtworkClass: vi.fn(),
      developerModeToggle: vi.fn(),
      dialog: vi.fn(() => ({ classList: { contains: () => false } })),
      drawList,
      emojiFontChoices: vi.fn(() => ["system", "pixel"]),
      installAppButton: vi.fn(() => installButton),
      installDialog: vi.fn(),
      loadVersionData: vi.fn(),
      modeChoices: vi.fn(() => ["standard", "developer"]),
      offlineStatus: vi.fn(),
      orderButtons: vi.fn(() => [groupedButton, sequenceButton]),
      pixelEditor: vi.fn(),
      refreshRenderedPixelEmoji: vi.fn(),
      renderCategoryFilters,
      renderSearchLanguages: vi.fn(),
      renderVersionModeToggle: vi.fn(),
      savedDialog: vi.fn(),
      setDialogView: vi.fn(),
      showEmoji: vi.fn(),
      syncUrlState: vi.fn(),
      syncVersionRange: vi.fn(),
      suppressDialogCloseSync: vi.fn(),
      themeChoices: vi.fn(() => ["dark", "light"]),
      translate: vi.fn(),
      urlStateReady: vi.fn(() => true),
      versionModeSelector: vi.fn(() => versionModeSelector),
      versionSelector: vi.fn(() => versionSelector),
    });

    shell.renderPixelFontToggle();
    expect(renderPixelFontToggleHelper).toHaveBeenCalledWith({
      choices: expect.any(Function),
      refreshRenderedPixelEmoji: expect.any(Function),
    });

    const fontEvent = new Event("click");
    shell.selectEmojiFont(fontEvent);
    expect(selectEmojiFontHelper).toHaveBeenCalledWith(
      { renderPixelFontToggle: shell.renderPixelFontToggle },
      fontEvent,
    );

    const beforeInstall: any = {
      prevented: false,
      preventDefault() {
        this.prevented = true;
      },
    };
    beforeInstallHandlers[0](beforeInstall);
    expect(beforeInstall.prevented).toBe(true);
    expect(renderInstallAppButtonHelper).toHaveBeenCalledWith(installButton);

    appInstalledHandlers[0]();
    expect(installButton.hidden).toBe(true);

    const devModeOptions: any = (
      createDeveloperModeController.mock.calls as any
    )[0][0];
    devModeOptions.disableDeveloperFeatures();
    expect(versionModeSelector.value).toBe("through");
    expect(versionSelector.value).toBe("16.0");
    expect(state.orderMode.get()).toBe("grouped");
    expect(state.selectedSequenceType.get()).toBe("");
    expect(renderCategoryFilters).toHaveBeenCalledTimes(1);
    expect(drawList).toHaveBeenCalledTimes(1);
    expect(setPressed).toHaveBeenCalledTimes(2);

    state.items.set([]);
    state.orderMode.set("grouped");
    state.selectedSequenceType.set("single");
    devModeOptions.disableDeveloperFeatures();
    expect(versionModeSelector.value).toBe("through");
    expect(versionSelector.value).toBe("16.0");
    expect(state.orderMode.get()).toBe("grouped");
    expect(state.selectedSequenceType.get()).toBe("single");
    expect(renderCategoryFilters).toHaveBeenCalledTimes(1);
    expect(drawList).toHaveBeenCalledTimes(1);
  });
});
