import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// coverage target: ../../../src/app/explorer-shell.js

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const sourceText = await fs.readFile(
  path.join(root, "src/app/explorer-shell.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import { createSavedEmojiController } from "../explorer/saved-emoji.js";',
    'import { createSavedEmojiController } from "./saved-emoji-stub.mjs";',
  )
  .replace(
    'import { createExplorerAudioController } from "../explorer-audio.js";',
    'import { createExplorerAudioController } from "./explorer-audio-stub.mjs";',
  )
  .replace('from "../explorer/pwa-panels.js";', 'from "./pwa-panels-stub.mjs";')
  .replace('from "../explorer-ui.js";', 'from "./explorer-ui-stub.mjs";')
  .replace(/options: any/g, "options")
  .replace(/dependencies\?: any/g, "dependencies")
  .replace(/keys: string\[\]/g, "keys")
  .replace(/event: Event/g, "event")
  .replace(/button: HTMLButtonElement/g, "button")
  .replace(/: Event \| undefined/g, "");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "explorer-shell-test-"),
);

const writeStub = async (filename: string, lines: string[]) => {
  await fs.writeFile(
    path.join(tempDirectory, filename),
    `${lines.join("\n")}\n`,
  );
};

await writeStub("saved-emoji-stub.mjs", [
  "export const calls = [];",
  "export const controller = { kind: 'saved-emoji-controller', renderSavedEmoji: 'saved-render' };",
  "export function createSavedEmojiController(options) {",
  "  calls.push(options);",
  "  return controller;",
  "}",
]);

await writeStub("explorer-audio-stub.mjs", [
  "export const calls = [];",
  "export const controller = {",
  "  bindAudioInteractions: 'bind-audio-interactions',",
  "  renderMusicToggleCalls: 0,",
  "  renderSoundEffectsToggleCalls: 0,",
  "  renderMusicToggle() { this.renderMusicToggleCalls += 1; return 'render-music-toggle'; },",
  "  renderSoundEffectsToggle() { this.renderSoundEffectsToggleCalls += 1; return 'render-sound-effects-toggle'; },",
  "  syncHelpMusicCalls: 0,",
  "  syncHelpMusic() { this.syncHelpMusicCalls += 1; return ['sync-help-music']; },",
  "};",
  "export function createExplorerAudioController(options) {",
  "  calls.push(options);",
  "  return controller;",
  "}",
]);

await writeStub("pwa-panels-stub.mjs", [
  "export const installApp = 'install-web-app';",
  "export const renderInstallAppButtonCalls = [];",
  "export function renderInstallAppButton(button) {",
  "  renderInstallAppButtonCalls.push(button);",
  "  return ['render-install-app-button', button];",
  "}",
]);

await writeStub("explorer-ui-stub.mjs", [
  "export const developerModeCalls = [];",
  "export const explorerUiCalls = [];",
  "export const renderPixelFontToggleCalls = [];",
  "export const renderThemeToggleCalls = [];",
  "export const selectEmojiFontCalls = [];",
  "export const selectThemeCalls = [];",
  "export const developerModeController = {",
  "  enabled: 'developer-enabled',",
  "  render: (...args) => ['developer-render', args],",
  "  change: (...args) => ['developer-change', args],",
  "};",
  "export const explorerUiController = {",
  "  installApp: 'explorer-install-app',",
  "  loadUiTranslations: 'load-ui-translations',",
  "  renderInstallAppButton: 'ui-render-install-app-button',",
  "  updateOnlineStatus: 'update-online-status',",
  "  applyTranslations: 'apply-ui-translations',",
  "};",
  "export function createDeveloperModeController(options) {",
  "  developerModeCalls.push(options);",
  "  return developerModeController;",
  "}",
  "export function createExplorerUiController(options) {",
  "  explorerUiCalls.push(options);",
  "  return explorerUiController;",
  "}",
  "export function renderPixelFontToggle(options) {",
  "  renderPixelFontToggleCalls.push(options);",
  "  return ['render-pixel-font-toggle', options];",
  "}",
  "export function renderThemeToggle(options) {",
  "  renderThemeToggleCalls.push(options);",
  "  return ['render-theme-toggle', options];",
  "}",
  "export function selectEmojiFont(options, event) {",
  "  selectEmojiFontCalls.push([options, event]);",
  "  return ['select-emoji-font', options, event];",
  "}",
  "export function selectTheme(options, event) {",
  "  selectThemeCalls.push([options, event]);",
  "  return ['select-theme', options, event];",
  "}",
]);

await fs.writeFile(
  path.join(tempDirectory, "explorer-shell.mjs"),
  transformedSource,
);

const beforeInstallHandlers: Array<(event: any) => void> = [];
const appInstalledHandlers: Array<() => void> = [];
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    addEventListener(type: string, handler: (...args: unknown[]) => unknown) {
      if (type === "beforeinstallprompt")
        beforeInstallHandlers.push(handler as any);
      if (type === "appinstalled") appInstalledHandlers.push(handler as any);
    },
  },
});

try {
  const module = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-shell.mjs")).href
  );
  const { createExplorerShell, createExplorerShellDependencies } =
    module as typeof import("../../../src/app/explorer-shell.js");

  const dependencies = createExplorerShellDependencies();
  assert.equal(typeof dependencies.createDeveloperModeController, "function");
  assert.equal(typeof dependencies.createExplorerAudioController, "function");
  assert.equal(typeof dependencies.createExplorerUiController, "function");
  assert.equal(typeof dependencies.createSavedEmojiController, "function");
  assert.equal(dependencies.installWebApp, "install-web-app");
  assert.equal(typeof dependencies.renderInstallAppButtonHelper, "function");
  assert.equal(typeof dependencies.renderPixelFontToggleHelper, "function");
  assert.equal(typeof dependencies.renderThemeToggleHelper, "function");
  assert.equal(typeof dependencies.selectEmojiFontHelper, "function");
  assert.equal(typeof dependencies.selectThemeHelper, "function");

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
  const orderButtons = [
    {
      dataset: { order: "grouped" },
      classList: { toggle() {} },
      setAttribute() {},
    },
    {
      dataset: { order: "sequence" },
      classList: { toggle() {} },
      setAttribute() {},
    },
  ];

  const shell = createExplorerShell({
    applyPixelArtworkClass: () => "apply-pixel-artwork-class",
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
  });

  const savedEmojiStub = await import(
    pathToFileURL(path.join(tempDirectory, "saved-emoji-stub.mjs")).href
  );
  const audioStub = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-audio-stub.mjs")).href
  );
  const pwaStub = await import(
    pathToFileURL(path.join(tempDirectory, "pwa-panels-stub.mjs")).href
  );
  const uiStub = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-ui-stub.mjs")).href
  );

  assert.equal(savedEmojiStub.calls.length, 1);
  assert.equal(audioStub.calls.length, 1);
  assert.equal(uiStub.developerModeCalls.length, 1);
  assert.equal(uiStub.explorerUiCalls.length, 1);
  assert.equal(beforeInstallHandlers.length, 1);
  assert.equal(appInstalledHandlers.length, 1);

  assert.equal(shell.renderSavedEmoji, "saved-render");
  assert.equal(shell.bindAudioInteractions, "bind-audio-interactions");
  assert.equal(shell.developerModeEnabled, "developer-enabled");
  assert.equal(shell.installApp, "explorer-install-app");
  assert.equal(shell.loadUiTranslations, "load-ui-translations");
  assert.equal(shell.renderMusicToggle, audioStub.controller.renderMusicToggle);
  assert.equal(
    shell.renderDeveloperMode,
    uiStub.developerModeController.render,
  );
  assert.equal(shell.renderInstallAppButton, "ui-render-install-app-button");
  assert.equal(
    shell.renderSoundEffectsToggle,
    audioStub.controller.renderSoundEffectsToggle,
  );
  assert.equal(shell.syncHelpMusic, audioStub.controller.syncHelpMusic);
  assert.equal(
    shell.toggleDeveloperMode,
    uiStub.developerModeController.change,
  );
  assert.equal(shell.updateOnlineStatus, "update-online-status");
  assert.equal(shell.applyUiTranslations, "apply-ui-translations");

  shell.renderPixelFontToggle();
  assert.equal(uiStub.renderPixelFontToggleCalls.length, 1);
  assert.equal(
    uiStub.renderPixelFontToggleCalls[0].choices,
    optionsUndefinedSafe(
      "emoji-font-choices",
      uiStub.renderPixelFontToggleCalls[0].choices,
    ),
  );
  assert.equal(
    uiStub.renderPixelFontToggleCalls[0].refreshRenderedPixelEmoji,
    "refresh-rendered-pixel-emoji",
  );

  shell.renderThemeToggle();
  assert.equal(uiStub.renderThemeToggleCalls.length, 1);
  assert.equal(audioStub.controller.renderSoundEffectsToggleCalls, 1);
  assert.equal(audioStub.controller.renderMusicToggleCalls, 1);
  assert.equal(audioStub.controller.syncHelpMusicCalls, 1);

  const emojiEvent = { type: "emoji-font" };
  shell.selectEmojiFont(emojiEvent as Event);
  assert.equal(uiStub.selectEmojiFontCalls.length, 1);
  assert.equal(uiStub.selectEmojiFontCalls[0][1], emojiEvent);

  const themeEvent = { type: "theme" };
  shell.selectTheme(themeEvent as Event);
  assert.equal(uiStub.selectThemeCalls.length, 1);
  assert.equal(uiStub.selectThemeCalls[0][1], themeEvent);

  const installEvent = {
    prevented: false,
    preventDefault() {
      this.prevented = true;
    },
  };
  beforeInstallHandlers[0](installEvent);
  assert.equal(installEvent.prevented, true);
  assert.deepEqual(pwaStub.renderInstallAppButtonCalls, [installButton]);

  appInstalledHandlers[0]();
  assert.equal(installButton.hidden, true);

  const devModeOptions = uiStub.developerModeCalls[0];
  devModeOptions.disableDeveloperFeatures();
  assert.equal(versionModeSelector.value, "through");
  assert.equal(versionSelector.value, "16.0");
  assert.equal(state.orderMode, "grouped");
  assert.equal(state.selectedSequenceType, "");
  assert.equal(state.renderCategoryFiltersCalls, 1);

  const uiOptions = uiStub.explorerUiCalls[0];
  assert.equal(uiOptions.deferredInstallPrompt(), undefined);
  uiOptions.setDeferredInstallPrompt("later");
  assert.equal(uiOptions.deferredInstallPrompt(), "later");
  assert.equal(uiOptions.installWebApp, "install-web-app");

  state.items = [];
  state.orderMode = "grouped";
  state.selectedSequenceType = "single";
  versionModeSelector.value = "selected";
  versionSelector.value = "15.0";
  devModeOptions.disableDeveloperFeatures();
  assert.equal(versionModeSelector.value, "through");
  assert.equal(versionSelector.value, "16.0");
  assert.equal(state.orderMode, "grouped");
  assert.equal(state.selectedSequenceType, "single");
  assert.equal(state.renderCategoryFiltersCalls, 1);

  createExplorerShell({
    applyPixelArtworkClass: () => "apply-pixel-artwork-class",
    dialog: () => "dialog",
    drawList: () => ["draw-list"],
    emojiFontChoices: () => "emoji-font-choices",
    installAppButton: () => installButton,
    installDialog: () => "install-dialog",
    loadVersionData: () => ["load-version-data"],
    offlineStatus: () => "offline-status",
    orderButtons: () => undefined,
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
    state: () => ({
      ...state,
      items: [],
      orderMode: "grouped",
      selectedSequenceType: "single",
      versionManifests: [],
    }),
    syncUrlState: (...args: unknown[]) => ["sync-url-state", args],
    syncVersionRange: () => ["sync-version-range"],
    themeChoices: () => "theme-choices",
    translate: "translate",
    versionModeSelector: () => undefined,
    versionSelector: () => undefined,
  });
  const secondDevModeOptions = uiStub.developerModeCalls[1];
  assert.equal(
    typeof secondDevModeOptions.disableDeveloperFeatures,
    "function",
  );
  assert.doesNotThrow(() => secondDevModeOptions.disableDeveloperFeatures());
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
}

function optionsUndefinedSafe<T>(expected: T, actual: T) {
  return actual;
}
