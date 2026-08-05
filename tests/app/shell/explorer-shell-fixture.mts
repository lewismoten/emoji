import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function loadExplorerShellFixture() {
  const root = process.cwd();
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
    .replace(
      'import * as audioToggle from "../controls/audio/audio-toggle.js";',
      'import * as audioToggle from "./audio-toggle-stub.mjs";',
    )
    .replace(
      'from "../explorer/pwa/pwa-panels.js";',
      'from "./pwa-panels-stub.mjs";',
    )
    .replace('from "../explorer-ui.js";', 'from "./explorer-ui-stub.mjs";')
    .replace('from "../state.js";', 'from "../../../src/state.js";')
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
    "export function createSavedEmojiController(options) { calls.push(options); return controller; }",
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
    "export function createExplorerAudioController(options) { calls.push(options); return controller; }",
  ]);
  await writeStub("audio-toggle-stub.mjs", [
    "export const renderCalls = [];",
    "export function render(...args) { renderCalls.push(args); return ['render-audio-toggle', args]; }",
  ]);
  await writeStub("pwa-panels-stub.mjs", [
    "export const installApp = 'install-web-app';",
    "export const renderInstallAppButtonCalls = [];",
    "export function renderInstallAppButton(button) { renderInstallAppButtonCalls.push(button); return ['render-install-app-button', button]; }",
  ]);
  await writeStub("explorer-ui-stub.mjs", [
    "export const developerModeCalls = [];",
    "export const explorerUiCalls = [];",
    "export const renderPixelFontToggleCalls = [];",
    "export const selectEmojiFontCalls = [];",
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
    "export function createDeveloperModeController(options) { developerModeCalls.push(options); return developerModeController; }",
    "export function createExplorerUiController(options) { explorerUiCalls.push(options); return explorerUiController; }",
    "export function renderPixelFontToggle(options) { renderPixelFontToggleCalls.push(options); return ['render-pixel-font-toggle', options]; }",
    "export function selectEmojiFont(options, event) { selectEmojiFontCalls.push([options, event]); return ['select-emoji-font', options, event]; }",
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

  const module = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-shell.mjs")).href
  );
  const { createExplorerShell, createExplorerShellDependencies } =
    module as typeof import("../../../src/app/explorer-shell.js");
  const savedEmojiStub = await import(
    pathToFileURL(path.join(tempDirectory, "saved-emoji-stub.mjs")).href
  );
  const audioStub = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-audio-stub.mjs")).href
  );
  const audioToggleStub = await import(
    pathToFileURL(path.join(tempDirectory, "audio-toggle-stub.mjs")).href
  );
  const pwaStub = await import(
    pathToFileURL(path.join(tempDirectory, "pwa-panels-stub.mjs")).href
  );
  const uiStub = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-ui-stub.mjs")).href
  );

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

  return {
    appInstalledHandlers,
    audioStub,
    audioToggleStub,
    beforeInstallHandlers,
    createExplorerShell,
    createExplorerShellDependencies,
    installButton,
    originalWindow,
    pwaStub,
    savedEmojiStub,
    shell,
    state,
    uiStub,
    versionModeSelector,
    versionSelector,
    restore() {
      if (originalWindow)
        Object.defineProperty(globalThis, "window", originalWindow);
      else Reflect.deleteProperty(globalThis, "window");
    },
  };
}
