import {
  createExplorerShell,
  createExplorerShellDependencies,
} from "../../../../src/app/explorer-shell.js";

export function createExplorerShellFixture() {
  const beforeInstallHandlers: Array<(event: any) => void> = [];
  const appInstalledHandlers: Array<() => void> = [];
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      addEventListener(type: string, handler: (...args: unknown[]) => unknown) {
        if (type === "beforeinstallprompt") {
          beforeInstallHandlers.push(handler as (event: any) => void);
        }
        if (type === "appinstalled") {
          appInstalledHandlers.push(handler as () => void);
        }
      },
    },
  });

  const dependencyDefaults = createExplorerShellDependencies();
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

  const state: any = {
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
  };
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
      setAttribute(name: string, value: string) {
        orderButtonCalls.push([name, value === "true"]);
      },
    },
    {
      dataset: { order: "sequence" },
      classList: {
        toggle(name: string, active: boolean) {
          orderButtonCalls.push([name, active]);
        },
      },
      setAttribute(name: string, value: string) {
        orderButtonCalls.push([name, value === "true"]);
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
      offlineStatus: () => "offline-status",
      orderButtons: () => orderButtons,
      pixelEditor: () => "pixel-editor",
      refreshRenderedPixelEmoji: "refresh-rendered-pixel-emoji",
      renderVersionModeToggle: () => ["render-version-mode-toggle"],
      renderCategoryFilters: () => {
        state.renderCategoryFiltersCalls =
          (state.renderCategoryFiltersCalls ?? 0) + 1;
      },
      savePreference: "save-preference",
      savedDialog: () => "saved-dialog",
      setDialogView: (...args: unknown[]) => ["set-dialog-view", args],
      state: () => state,
      syncUrlState: (...args: unknown[]) => ["sync-url-state", args],
      syncVersionRange: () => ["sync-version-range"],
      themeChoices: () => "theme-choices",
      translate: "translate",
      versionModeSelector: () => versionModeSelector,
      versionSelector: () => versionSelector,
    },
    dependencies,
  );

  return {
    appInstalledHandlers,
    audioCalls,
    audioController,
    beforeInstallHandlers,
    dependencyDefaults,
    dependencies,
    developerModeCalls,
    explorerUiCalls,
    installButton,
    orderButtonCalls,
    renderInstallAppButtonCalls,
    renderPixelFontToggleCalls,
    savedEmojiCalls,
    selectEmojiFontCalls,
    shell,
    state,
    versionModeSelector,
    versionSelector,
    restore() {
      if (originalWindow) {
        Object.defineProperty(globalThis, "window", originalWindow);
      } else {
        Reflect.deleteProperty(globalThis, "window");
      }
    },
  };
}
