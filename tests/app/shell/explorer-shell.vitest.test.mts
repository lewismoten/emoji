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
  items: makeStore<any[]>([]),
  orderMode: makeStore("grouped"),
  searchAnnotations: makeStore({ wave: ["hello"] }),
  selectedSequenceType: makeStore(""),
  versionManifests: makeStore([{ version: "17.0" }]),
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

describe("createExplorerShell", () => {
  const beforeInstallHandlers: Array<(event: Event) => void> = [];
  const appInstalledHandlers: Array<() => void> = [];
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  beforeEach(() => {
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

  it("uses mocked module dependencies without temp source rewriting", async () => {
    const { createExplorerShellDependencies, createExplorerShell } =
      await import("../../../src/app/explorer-shell.js");

    const dependencies = createExplorerShellDependencies();
    expect(dependencies.createSavedEmojiController).toBe(
      createSavedEmojiController,
    );
    expect(dependencies.createExplorerAudioController).toBe(
      createExplorerAudioController,
    );
    expect(dependencies.createDeveloperModeController).toBe(
      createDeveloperModeController,
    );
    expect(dependencies.createExplorerUiController).toBe(
      createExplorerUiController,
    );
    expect(dependencies.installWebApp).toBe(installWebApp);

    const installAppButton = { hidden: false };
    const event = {
      preventDefault: vi.fn(),
    } as unknown as Event;
    const shell = createExplorerShell({
      applyPixelArtworkClass: vi.fn(),
      developerModeToggle: vi.fn(),
      dialog: vi.fn(() => ({ classList: { contains: () => false } })),
      drawList: vi.fn(),
      emojiFontChoices: vi.fn(() => ["system", "pixel"]),
      installAppButton: vi.fn(() => installAppButton),
      installDialog: vi.fn(),
      loadVersionData: vi.fn(),
      modeChoices: vi.fn(() => ["standard", "developer"]),
      offlineStatus: vi.fn(),
      orderButtons: vi.fn(() => []),
      pixelEditor: vi.fn(),
      refreshRenderedPixelEmoji: vi.fn(),
      renderCategoryFilters: vi.fn(),
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
      versionModeSelector: vi.fn(),
      versionSelector: vi.fn(),
    });

    expect(createSavedEmojiController).toHaveBeenCalledTimes(1);
    expect(createExplorerAudioController).toHaveBeenCalledTimes(1);
    expect(createDeveloperModeController).toHaveBeenCalledTimes(1);
    expect(createExplorerUiController).toHaveBeenCalledTimes(1);
    expect(beforeInstallHandlers).toHaveLength(1);
    expect(appInstalledHandlers).toHaveLength(1);

    beforeInstallHandlers[0](event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(renderInstallAppButtonHelper).toHaveBeenCalledWith(installAppButton);

    appInstalledHandlers[0]();
    expect(installAppButton.hidden).toBe(true);

    shell.renderPixelFontToggle();
    expect(renderPixelFontToggleHelper).toHaveBeenCalledWith({
      choices: expect.any(Function),
      refreshRenderedPixelEmoji: expect.any(Function),
    });

    const selectEvent = new Event("click");
    shell.selectEmojiFont(selectEvent);
    expect(selectEmojiFontHelper).toHaveBeenCalledWith(
      { renderPixelFontToggle: shell.renderPixelFontToggle },
      selectEvent,
    );

    expect(shell.renderSavedEmoji).toBe(savedEmojiController.renderSavedEmoji);
    expect(shell.bindAudioInteractions).toBe(
      audioController.bindAudioInteractions,
    );
    expect(shell.syncHelpMusic).toBe(audioController.syncHelpMusic);
    expect(shell.developerModeEnabled).toBe(developerModeController.enabled);
    expect(shell.fullDeveloperModeEnabled).toBe(
      developerModeController.fullEnabled,
    );
    expect(shell.installApp).toBe(explorerUiController.installApp);
    expect(shell.loadUiTranslations).toBe(
      explorerUiController.loadUiTranslations,
    );
    expect(shell.renderInstallAppButton).toBe(
      explorerUiController.renderInstallAppButton,
    );
    expect(shell.updateOnlineStatus).toBe(
      explorerUiController.updateOnlineStatus,
    );
    expect(shell.applyUiTranslations).toBe(
      explorerUiController.applyTranslations,
    );
  });
});
