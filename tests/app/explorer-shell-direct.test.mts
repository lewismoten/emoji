import assert from "node:assert/strict";

import {
  createExplorerShell,
  createExplorerShellDependencies,
} from "../../src/app/explorer-shell.js";

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

try {
  const dependencyDefaults = createExplorerShellDependencies();
  assert.equal(
    typeof dependencyDefaults.createSavedEmojiController,
    "function",
  );
  assert.equal(
    typeof dependencyDefaults.createExplorerAudioController,
    "function",
  );
  assert.equal(
    typeof dependencyDefaults.createExplorerUiController,
    "function",
  );
  assert.equal(
    typeof dependencyDefaults.createDeveloperModeController,
    "function",
  );

  const savedEmojiCalls: unknown[] = [];
  const audioCalls: unknown[] = [];
  const developerModeCalls: unknown[] = [];
  const explorerUiCalls: unknown[] = [];
  const renderInstallAppButtonCalls: unknown[] = [];
  const renderPixelFontToggleCalls: unknown[] = [];
  const renderThemeToggleCalls: unknown[] = [];
  const selectEmojiFontCalls: unknown[] = [];
  const selectThemeCalls: unknown[] = [];

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
    renderThemeToggleHelper(options: unknown) {
      renderThemeToggleCalls.push(options);
      return ["render-theme-toggle", options];
    },
    selectEmojiFontHelper(options: unknown, event: unknown) {
      selectEmojiFontCalls.push([options, event]);
      return ["select-emoji-font", options, event];
    },
    selectThemeHelper(options: unknown, event: unknown) {
      selectThemeCalls.push([options, event]);
      return ["select-theme", options, event];
    },
    installWebApp: "install-web-app",
  };

  const state: Record<string, unknown> & {
    byId: Record<string, { key: string }>;
    copiedEmojiKeys: string[];
    currentEmojiKey: string;
    emojiByKey: Record<string, string>;
    favoriteEmojiKeys: string[];
    searchAnnotations: Record<string, string[]>;
    versionManifests: Array<{ version: string }>;
    orderMode: string;
    selectedSequenceType: string;
    items: Array<{ key: string }>;
  } = {
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
        state["renderCategoryFiltersCalls"] =
          ((state["renderCategoryFiltersCalls"] as number | undefined) ?? 0) +
          1;
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

  assert.equal(savedEmojiCalls.length, 1);
  assert.equal(audioCalls.length, 1);
  assert.equal(developerModeCalls.length, 1);
  assert.equal(explorerUiCalls.length, 1);
  assert.equal(beforeInstallHandlers.length, 1);
  assert.equal(appInstalledHandlers.length, 1);

  assert.equal(shell.renderSavedEmoji, "saved-render");
  assert.equal(shell.bindAudioInteractions, "bind-audio-interactions");
  assert.equal(shell.developerModeEnabled, "developer-enabled");
  assert.equal(shell.installApp, "explorer-install-app");
  assert.equal(shell.loadUiTranslations, "load-ui-translations");
  assert.equal(shell.renderMusicToggle, audioController.renderMusicToggle);
  assert.equal(shell.renderDeveloperMode, "developer-render");
  assert.equal(shell.renderInstallAppButton, "ui-render-install-app-button");
  assert.equal(
    shell.renderSoundEffectsToggle,
    audioController.renderSoundEffectsToggle,
  );
  assert.equal(shell.syncHelpMusic, audioController.syncHelpMusic);
  assert.equal(shell.toggleDeveloperMode, "developer-change");
  assert.equal(shell.updateOnlineStatus, "update-online-status");
  assert.equal(shell.applyUiTranslations, "apply-ui-translations");
  assert.equal(shell.copiedCount(), 1);

  shell.renderPixelFontToggle();
  assert.equal(renderPixelFontToggleCalls.length, 1);

  shell.renderThemeToggle();
  assert.equal(renderThemeToggleCalls.length, 1);
  assert.equal(audioController.renderSoundEffectsToggleCalls, 1);
  assert.equal(audioController.renderMusicToggleCalls, 1);
  assert.equal(audioController.syncHelpMusicCalls, 1);

  const emojiEvent = { type: "emoji-font" };
  shell.selectEmojiFont(emojiEvent as unknown as Event);
  assert.deepEqual(selectEmojiFontCalls.at(-1), [
    {
      renderPixelFontToggle: shell.renderPixelFontToggle,
      savePreference: "save-preference",
    },
    emojiEvent,
  ]);

  const themeEvent = { type: "theme" };
  shell.selectTheme(themeEvent as unknown as Event);
  assert.deepEqual(selectThemeCalls.at(-1), [
    {
      renderThemeToggle: shell.renderThemeToggle,
      savePreference: "save-preference",
    },
    themeEvent,
  ]);

  const installEvent = {
    prevented: false,
    preventDefault() {
      this.prevented = true;
    },
  };
  beforeInstallHandlers[0]?.(installEvent);
  assert.equal(installEvent.prevented, true);
  assert.deepEqual(renderInstallAppButtonCalls, [installButton]);

  appInstalledHandlers[0]?.();
  assert.equal(installButton.hidden, true);

  const devModeOptions = developerModeCalls[0] as {
    disableDeveloperFeatures: () => void;
  };
  devModeOptions.disableDeveloperFeatures();
  assert.equal(versionModeSelector.value, "through");
  assert.equal(versionSelector.value, "16.0");
  assert.equal(state.orderMode, "grouped");
  assert.equal(state.selectedSequenceType, "");
  assert.equal(state["renderCategoryFiltersCalls"], 1);
  assert.equal(orderButtonCalls.length > 0, true);

  const uiOptions = explorerUiCalls[0] as {
    deferredInstallPrompt: () => unknown;
    installWebApp: unknown;
    setDeferredInstallPrompt: (value: unknown) => void;
  };
  assert.equal(uiOptions.deferredInstallPrompt(), undefined);
  uiOptions.setDeferredInstallPrompt("later");
  assert.equal(uiOptions.deferredInstallPrompt(), "later");
  assert.equal(uiOptions.installWebApp, "install-web-app");

  state.items = [];
  state.orderMode = "grouped";
  versionSelector.value = "15.0";
  devModeOptions.disableDeveloperFeatures();
  assert.equal(versionSelector.value, "16.0");
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
}
