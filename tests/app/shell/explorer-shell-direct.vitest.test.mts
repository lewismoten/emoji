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
  favoriteEmojiKeys: makeStore<string[]>(["thumbsUp"]),
  items: makeStore<any[]>([{ key: "wave" }]),
  orderMode: makeStore("sequence"),
  searchAnnotations: makeStore({ wave: ["hello"] }),
  selectedSequenceType: makeStore("zwj"),
  versionManifests: makeStore([{ version: "15.0" }, { version: "16.0" }]),
};

const setPressed = vi.fn();

vi.mock("../../../src/state.js", () => state);
vi.mock("../../../src/utils/aria.js", () => ({
  setPressed,
}));

describe("createExplorerShell direct dependency injection", () => {
  const beforeInstallHandlers: Array<(event: any) => void> = [];
  const appInstalledHandlers: Array<() => void> = [];
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  beforeEach(() => {
    vi.clearAllMocks();
    state.byId.replace({ wave: { key: "wave" } });
    state.copiedEmojiKeys.set(["wave"]);
    state.currentEmojiKey.set("wave");
    state.emojiByKey.replace({ wave: "👋" });
    state.favoriteEmojiKeys.set(["thumbsUp"]);
    state.items.set([{ key: "wave" }]);
    state.orderMode.set("sequence");
    state.searchAnnotations.replace({ wave: ["hello"] });
    state.selectedSequenceType.set("zwj");
    state.versionManifests.set([{ version: "15.0" }, { version: "16.0" }]);
    beforeInstallHandlers.length = 0;
    appInstalledHandlers.length = 0;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        addEventListener(
          type: string,
          handler: (...args: unknown[]) => unknown,
        ) {
          if (type === "beforeinstallprompt") {
            beforeInstallHandlers.push(handler as (event: any) => void);
          }
          if (type === "appinstalled") {
            appInstalledHandlers.push(handler as () => void);
          }
        },
      },
    });
  });

  afterEach(() => {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      delete (globalThis as any).window;
    }
  });

  it("uses injected dependencies for saved emoji, developer mode, audio, and install flow", async () => {
    const { createExplorerShellDependencies, createExplorerShell } =
      await import("../../../src/app/explorer-shell.js");

    const defaults = createExplorerShellDependencies();
    expect(defaults.createSavedEmojiController).toBeTypeOf("function");
    expect(defaults.createExplorerAudioController).toBeTypeOf("function");
    expect(defaults.createExplorerUiController).toBeTypeOf("function");
    expect(defaults.createDeveloperModeController).toBeTypeOf("function");

    const savedEmojiCalls: unknown[] = [];
    const audioCalls: unknown[] = [];
    const developerModeCalls: unknown[] = [];
    const explorerUiCalls: unknown[] = [];
    const renderInstallAppButtonCalls: unknown[] = [];
    const renderPixelFontToggleCalls: unknown[] = [];
    const selectEmojiFontCalls: unknown[] = [];

    const savedController = {
      copiedCount: () => 1,
      renderSavedEmoji: "saved-render",
    };
    const audioController = {
      bindAudioInteractions: "bind-audio-interactions",
      renderMusicToggleCalls: 0,
      renderSoundEffectsToggleCalls: 0,
      renderMusicToggle() {
        this.renderMusicToggleCalls += 1;
        return "render-music-toggle";
      },
      renderSoundEffectsToggle() {
        this.renderSoundEffectsToggleCalls += 1;
        return "render-sound-effects-toggle";
      },
      syncHelpMusicCalls: 0,
      syncHelpMusic() {
        this.syncHelpMusicCalls += 1;
        return ["sync-help-music"];
      },
    };
    const developerModeController = {
      enabled: "developer-enabled",
      render: "developer-render",
      change: "developer-change",
    };
    const explorerUiController = {
      installApp: "explorer-install-app",
      loadUiTranslations: "load-ui-translations",
      renderInstallAppButton: "ui-render-install-app-button",
      updateOnlineStatus: "update-online-status",
      applyTranslations: "apply-ui-translations",
    };

    const dependencies = {
      createSavedEmojiController(options: unknown) {
        savedEmojiCalls.push(options);
        return savedController;
      },
      createExplorerAudioController(options: unknown) {
        audioCalls.push(options);
        return audioController;
      },
      renderInstallAppButtonHelper(button: unknown) {
        renderInstallAppButtonCalls.push(button);
        return ["render-install-app-button", button];
      },
      createDeveloperModeController(options: unknown) {
        developerModeCalls.push(options);
        return developerModeController;
      },
      createExplorerUiController(options: unknown) {
        explorerUiCalls.push(options);
        return explorerUiController;
      },
      renderPixelFontToggleHelper(options: unknown) {
        renderPixelFontToggleCalls.push(options);
        return ["render-pixel-font-toggle", options];
      },
      selectEmojiFontHelper(options: unknown, event: unknown) {
        selectEmojiFontCalls.push([options, event]);
        return ["select-emoji-font", options, event];
      },
      installWebApp: "install-web-app",
    };

    const installButton = { hidden: false };
    const versionModeSelector = { value: "selected" };
    const versionSelector = { value: "15.0" };
    let renderCategoryFiltersCalls = 0;
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
        renderVersionModeToggle: () => ["render-version-mode-toggle"],
        renderCategoryFilters: () => {
          renderCategoryFiltersCalls += 1;
        },
        savedDialog: () => "saved-dialog",
        setDialogView: (...args: unknown[]) => ["set-dialog-view", args],
        syncUrlState: (...args: unknown[]) => ["sync-url-state", args],
        syncVersionRange: () => ["sync-version-range"],
        themeChoices: () => "theme-choices",
        translate: "translate",
        versionModeSelector: () => versionModeSelector,
        versionSelector: () => versionSelector,
      },
      dependencies,
    );

    expect(savedEmojiCalls).toHaveLength(1);
    expect(audioCalls).toHaveLength(1);
    expect(developerModeCalls).toHaveLength(1);
    expect(explorerUiCalls).toHaveLength(1);
    expect(beforeInstallHandlers).toHaveLength(1);
    expect(appInstalledHandlers).toHaveLength(1);

    expect(shell.renderSavedEmoji).toBe("saved-render");
    expect(shell.bindAudioInteractions).toBe("bind-audio-interactions");
    expect(shell.developerModeEnabled).toBe("developer-enabled");
    expect(shell.fullDeveloperModeEnabled).toBeUndefined();
    expect(shell.installApp).toBe("explorer-install-app");
    expect(shell.loadUiTranslations).toBe("load-ui-translations");
    expect(shell.renderDeveloperMode).toBe("developer-render");
    expect(shell.renderInstallAppButton).toBe("ui-render-install-app-button");
    expect(shell.syncHelpMusic).toBe(audioController.syncHelpMusic);
    expect(shell.toggleDeveloperMode).toBe("developer-change");
    expect(shell.updateOnlineStatus).toBe("update-online-status");
    expect(shell.applyUiTranslations).toBe("apply-ui-translations");
    expect((shell as any).copiedCount()).toBe(1);
    expect(audioController.renderSoundEffectsToggleCalls).toBe(0);
    expect(audioController.renderMusicToggleCalls).toBe(0);
    expect(audioController.syncHelpMusicCalls).toBe(0);

    shell.renderPixelFontToggle();
    expect(renderPixelFontToggleCalls).toHaveLength(1);

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
    beforeInstallHandlers[0]?.(installEvent);
    expect(installEvent.prevented).toBe(true);
    expect(renderInstallAppButtonCalls).toEqual([installButton]);

    appInstalledHandlers[0]?.();
    expect(installButton.hidden).toBe(true);

    const devModeOptions: any = developerModeCalls[0];
    devModeOptions.disableDeveloperFeatures();
    expect(versionModeSelector.value).toBe("through");
    expect(versionSelector.value).toBe("16.0");
    expect(state.orderMode.get()).toBe("grouped");
    expect(state.selectedSequenceType.get()).toBe("");
    expect(renderCategoryFiltersCalls).toBe(1);
    expect(orderButtonCalls.length).toBeGreaterThan(0);

    const uiOptions: any = explorerUiCalls[0];
    expect(uiOptions.deferredInstallPrompt()).toBeUndefined();
    uiOptions.setDeferredInstallPrompt("later");
    expect(uiOptions.deferredInstallPrompt()).toBe("later");
    expect(uiOptions.installWebApp).toBe("install-web-app");

    state.items.set([]);
    state.orderMode.set("grouped");
    versionSelector.value = "15.0";
    devModeOptions.disableDeveloperFeatures();
    expect(versionSelector.value).toBe("16.0");

    const savedOptions: any = savedEmojiCalls[0];
    expect(savedOptions.applyPixelArtworkClass()).toBe(
      "apply-pixel-artwork-class",
    );
    expect(savedOptions.byId()).toEqual(state.byId.get());
    expect(savedOptions.emojiByKey()).toEqual(state.emojiByKey.get());
    expect(savedOptions.searchAnnotations()).toEqual({ wave: ["hello"] });
    expect(savedOptions.translate).toBe("translate");
  });
});
