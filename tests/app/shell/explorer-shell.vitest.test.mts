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

  it("supports custom injected dependencies and preserves custom controller members", async () => {
    const { createExplorerShell, createExplorerShellDependencies } =
      await import("../../../src/app/explorer-shell.js");

    const originalDefaults = createExplorerShellDependencies();
    expect(originalDefaults.createSavedEmojiController).toBe(
      createSavedEmojiController,
    );

    const beforeInstallHandlersLocal: Array<(event: any) => void> = [];
    const appInstalledHandlersLocal: Array<() => void> = [];
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        addEventListener(type: string, handler: (...args: unknown[]) => void) {
          if (type === "beforeinstallprompt") {
            beforeInstallHandlersLocal.push(handler as (event: any) => void);
          }
          if (type === "appinstalled") {
            appInstalledHandlersLocal.push(handler as () => void);
          }
        },
      },
    });

    const savedEmojiCalls: unknown[] = [];
    const audioCalls: unknown[] = [];
    const developerModeCalls: Array<{ disableDeveloperFeatures: () => void }> =
      [];
    const explorerUiCalls: Array<{
      deferredInstallPrompt: () => unknown;
      installWebApp: unknown;
      setDeferredInstallPrompt: (value: unknown) => void;
    }> = [];
    const renderInstallAppButtonCalls: unknown[] = [];
    const renderPixelFontToggleCalls: unknown[] = [];
    const selectEmojiFontCalls: unknown[] = [];

    const customSavedController = {
      copiedCount: () => 1,
      renderSavedEmoji: "saved-render",
    };
    const customAudioController = {
      bindAudioInteractions: "bind-audio-interactions",
      syncHelpMusicCalls: 0,
      syncHelpMusic() {
        this.syncHelpMusicCalls += 1;
        return ["sync-help-music"];
      },
    };
    const customDependencies = {
      createSavedEmojiController(options: unknown) {
        savedEmojiCalls.push(options);
        return customSavedController;
      },
      createExplorerAudioController(options: unknown) {
        audioCalls.push(options);
        return customAudioController;
      },
      renderInstallAppButtonHelper(button: unknown) {
        renderInstallAppButtonCalls.push(button);
        return ["render-install-app-button", button];
      },
      createDeveloperModeController(options: any) {
        developerModeCalls.push(options);
        return {
          enabled: "developer-enabled",
          render: "developer-render",
          change: "developer-change",
        };
      },
      createExplorerUiController(options: any) {
        explorerUiCalls.push(options);
        return {
          installApp: "explorer-install-app",
          loadUiTranslations: "load-ui-translations",
          renderInstallAppButton: "ui-render-install-app-button",
          updateOnlineStatus: "update-online-status",
          applyTranslations: "apply-ui-translations",
        };
      },
      renderPixelFontToggleHelper(options: unknown) {
        renderPixelFontToggleCalls.push(options);
      },
      selectEmojiFontHelper(options: unknown, event: unknown) {
        selectEmojiFontCalls.push([options, event]);
      },
      installWebApp: "install-web-app",
    };

    const customState = {
      byId: { wave: { key: "wave" } },
      copiedEmojiKeys: ["wave"],
      currentEmojiKey: "wave",
      emojiByKey: { wave: "👋" },
      favoriteEmojiKeys: ["thumbsUp"],
      searchAnnotations: { wave: ["hello"] },
      versionManifests: [{ version: "15.0" }, { version: "16.0" }],
      orderMode: "sequence",
      selectedSequenceType: "zwj",
      items: [{ key: "wave" }],
      renderCategoryFiltersCalls: 0,
    };
    state.byId.get.mockReturnValue(customState.byId);
    state.copiedEmojiKeys.get.mockReturnValue(customState.copiedEmojiKeys);
    state.currentEmojiKey.get.mockReturnValue(customState.currentEmojiKey);
    state.emojiByKey.get.mockReturnValue(customState.emojiByKey);
    state.favoriteEmojiKeys.get.mockReturnValue(customState.favoriteEmojiKeys);
    state.searchAnnotations.get.mockReturnValue(customState.searchAnnotations);
    state.versionManifests.get.mockReturnValue(
      customState.versionManifests as any,
    );
    state.orderMode.get.mockImplementation(() => customState.orderMode as any);
    state.orderMode.set.mockImplementation((next: string) => {
      customState.orderMode = next;
    });
    state.selectedSequenceType.get.mockImplementation(
      () => customState.selectedSequenceType,
    );
    state.selectedSequenceType.set.mockImplementation((next: string) => {
      customState.selectedSequenceType = next;
    });
    state.items.get.mockImplementation(() => customState.items as any);

    const installButton = { hidden: false };
    const versionModeSelector = { value: "selected" };
    const versionSelector = { value: "15.0" };
    const orderButtonCalls: Array<[string, boolean]> = [];
    const orderButtons = [
      {
        dataset: { order: "grouped" },
        classList: {
          toggle(name: string, active: boolean) {
            orderButtonCalls.push([name, active]);
          },
        },
      },
      {
        dataset: { order: "sequence" },
        classList: {
          toggle(name: string, active: boolean) {
            orderButtonCalls.push([name, active]);
          },
        },
      },
    ];

    const shell = createExplorerShell(
      {
        applyPixelArtworkClass: () => "apply-pixel-artwork-class",
        developerModeToggle: () => "developer-mode-toggle",
        dialog: () => "dialog",
        drawList: () => ["draw-list"],
        emojiFontChoices: () => "emoji-font-choices",
        installAppButton: () => installButton,
        installDialog: () => "install-dialog",
        loadVersionData: () => ["load-version-data"],
        modeChoices: () => ["standard", "developer"],
        offlineStatus: () => "offline-status",
        orderButtons: () => orderButtons,
        pixelEditor: () => "pixel-editor",
        refreshRenderedPixelEmoji: "refresh-rendered-pixel-emoji",
        renderCategoryFilters: () => {
          customState.renderCategoryFiltersCalls += 1;
        },
        renderSearchLanguages: () => undefined,
        renderVersionModeToggle: () => ["render-version-mode-toggle"],
        savedDialog: () => "saved-dialog",
        setDialogView: (...args: unknown[]) => ["set-dialog-view", args],
        showEmoji: () => undefined,
        syncUrlState: (...args: unknown[]) => ["sync-url-state", args],
        syncVersionRange: () => ["sync-version-range"],
        themeChoices: () => "theme-choices",
        translate: "translate",
        versionModeSelector: () => versionModeSelector,
        versionSelector: () => versionSelector,
      } as any,
      customDependencies as any,
    );

    expect(savedEmojiCalls).toHaveLength(1);
    expect(audioCalls).toHaveLength(1);
    expect(developerModeCalls).toHaveLength(1);
    expect(explorerUiCalls).toHaveLength(1);
    expect(beforeInstallHandlersLocal).toHaveLength(1);
    expect(appInstalledHandlersLocal).toHaveLength(1);

    expect(shell.renderSavedEmoji).toBe("saved-render");
    expect((shell as any).copiedCount()).toBe(1);
    expect(shell.bindAudioInteractions).toBe("bind-audio-interactions");
    expect(shell.developerModeEnabled).toBe("developer-enabled");
    expect(shell.fullDeveloperModeEnabled).toBeUndefined();
    expect(shell.installApp).toBe("explorer-install-app");
    expect(shell.loadUiTranslations).toBe("load-ui-translations");
    expect(shell.renderDeveloperMode).toBe("developer-render");
    expect(shell.renderInstallAppButton).toBe("ui-render-install-app-button");
    expect(shell.toggleDeveloperMode).toBe("developer-change");
    expect(shell.updateOnlineStatus).toBe("update-online-status");
    expect(shell.applyUiTranslations).toBe("apply-ui-translations");

    const savedOptions = savedEmojiCalls[0] as any;
    expect(savedOptions.applyPixelArtworkClass()).toBe(
      "apply-pixel-artwork-class",
    );
    expect(savedOptions.byId()).toEqual(customState.byId);
    expect(savedOptions.copiedEmojiKeys()).toEqual(["wave"]);
    expect(savedOptions.currentEmojiKey()).toBe("wave");
    expect(savedOptions.emojiByKey()).toEqual(customState.emojiByKey);
    expect(savedOptions.favoriteEmojiKeys()).toEqual(["thumbsUp"]);
    expect(savedOptions.searchAnnotations()).toEqual({ wave: ["hello"] });
    savedOptions.setCopiedEmojiKeys(["sparkles"]);
    savedOptions.setFavoriteEmojiKeys(["wave"]);
    expect(state.copiedEmojiKeys.set).toHaveBeenCalledWith(["sparkles"]);
    expect(state.favoriteEmojiKeys.set).toHaveBeenCalledWith(["wave"]);
    expect(savedOptions.translate).toBe("translate");

    shell.renderPixelFontToggle();
    expect(renderPixelFontToggleCalls).toHaveLength(1);
    expect(customAudioController.syncHelpMusicCalls).toBe(0);
    expect(selectEmojiFontCalls).toHaveLength(0);

    const emojiEvent = { type: "emoji-font" };
    shell.selectEmojiFont(emojiEvent as unknown as Event);
    expect(selectEmojiFontCalls.at(-1)).toEqual([
      { renderPixelFontToggle: shell.renderPixelFontToggle },
      emojiEvent,
    ]);

    const installEvent: any = {
      prevented: false,
      preventDefault() {
        this.prevented = true;
      },
    };
    beforeInstallHandlersLocal[0](installEvent);
    expect(installEvent.prevented).toBe(true);
    expect(renderInstallAppButtonCalls).toEqual([installButton]);

    appInstalledHandlersLocal[0]();
    expect(installButton.hidden).toBe(true);

    developerModeCalls[0]!.disableDeveloperFeatures();
    expect(versionModeSelector.value).toBe("through");
    expect(versionSelector.value).toBe("16.0");
    expect(customState.orderMode).toBe("grouped");
    expect(customState.selectedSequenceType).toBe("");
    expect(customState.renderCategoryFiltersCalls).toBe(1);
    expect(orderButtonCalls.length).toBeGreaterThan(0);

    const uiOptions = explorerUiCalls[0]!;
    expect(uiOptions.deferredInstallPrompt()).toBeUndefined();
    uiOptions.setDeferredInstallPrompt("later");
    expect(uiOptions.deferredInstallPrompt()).toBe("later");
    expect(uiOptions.installWebApp).toBe("install-web-app");

    customState.items = [];
    customState.orderMode = "grouped";
    versionSelector.value = "15.0";
    developerModeCalls[0]!.disableDeveloperFeatures();
    expect(versionSelector.value).toBe("16.0");
  });
});
