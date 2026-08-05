import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as sharedState from "../../../../src/state.js";

export async function createShellRuntimeFixture() {
  const root = process.cwd();
  const sourcePath = path.join(
    root,
    "build/src/app/bootstrap/explorer-bootstrap-shell.js",
  );
  const source = await fs.readFile(sourcePath, "utf8");
  const transformedSource = source
    .replace(
      'import { createPixelArtworkManager } from "../../explorer/pixel-artwork.js";',
      'import { createPixelArtworkManager, pixelArtworkCalls } from "./pixel-artwork-stub.mjs";',
    )
    .replace(
      'import { createExplorerShell } from "../explorer-shell.js";',
      'import { createExplorerShell, shellCalls } from "./explorer-shell-stub.mjs";',
    )
    .replace(
      'import { createEmojiActions } from "../emoji/emoji-actions.js";',
      'import { createEmojiActions, emojiActionCalls } from "./emoji-actions-stub.mjs";',
    )
    .replace(
      'import { updateRenderingDiagnostic as updateRenderingDiagnosticHelper } from "../../explorer/dialog/dialog-render.js";',
      'import { updateRenderingDiagnostic as updateRenderingDiagnosticHelper, diagnosticCalls } from "./dialog-render-stub.mjs";',
    )
    .replace(
      'import * as preferences from "../../preferences.js";',
      'import * as preferences from "./preferences-stub.mjs";',
    )
    .replace(
      'import * as state from "../../state.js";',
      'import * as state from "../../../src/state.js";',
    );

  const tempRoot = path.join(root, "build/tests/.tmp");
  await fs.mkdir(tempRoot, { recursive: true });
  const tempDirectory = await fs.mkdtemp(
    path.join(tempRoot, "explorer-bootstrap-shell-runtime-"),
  );

  await fs.writeFile(
    path.join(tempDirectory, "pixel-artwork-stub.mjs"),
    `export const pixelArtworkCalls = [];
export function createPixelArtworkManager(options) {
  pixelArtworkCalls.push(options);
  return {
    applyPixelArtworkClass: "pixel-class",
    refreshRenderedPixelEmoji: () => "refresh-rendered-pixel-emoji",
    updateModifierPixelArtwork: () => "updateModifierPixelArtwork",
    updatePixelArtworkManifest: () => "updatePixelArtworkManifest",
    updateRenderingDiagnostic: () => "pixel-update-rendering-diagnostic",
  };
}`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "explorer-shell-stub.mjs"),
    `export const shellCalls = [];
export function createExplorerShell(options) {
  shellCalls.push(options);
  return {
    developerModeEnabled: () => true,
    addFavorite: () => "addFavorite",
    bindAudioInteractions: () => "bindAudioInteractions",
    copyToClipboardValue: () => "copyToClipboardValue",
    getIntroducedVersion: () => "getIntroducedVersion",
    installApp: () => "installApp",
    loadPackageManifest: () => "loadPackageManifest",
    loadUiTranslations: () => "loadUiTranslations",
    onClick: () => "onClick",
    onEmojiDialogClose: () => "onEmojiDialogClose",
    recordCopiedEmoji: () => "recordCopiedEmoji",
    renderDeveloperMode: () => "renderDeveloperMode",
    renderInstallAppButton: () => "renderInstallAppButton",
    renderMusicToggle: () => "renderMusicToggle",
    renderPixelFontToggle: () => "renderPixelFontToggle",
    renderSavedEmoji: () => "renderSavedEmoji",
    renderSoundEffectsToggle: () => "renderSoundEffectsToggle",
    selectEmojiFont: () => "selectEmojiFont",
    syncHelpMusic: () => "syncHelpMusic",
    toggleDeveloperMode: () => "toggleDeveloperMode",
    updateFavoriteButton: () => "updateFavoriteButton",
    updateOnlineStatus: () => "updateOnlineStatus",
    applyUiTranslations: () => "applyUiTranslations",
  };
}`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "emoji-actions-stub.mjs"),
    `export const emojiActionCalls = [];
export function createEmojiActions(options) {
  emojiActionCalls.push(options);
  return { showEmoji: (...args) => ["showEmoji", ...args] };
}`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "dialog-render-stub.mjs"),
    `export const diagnosticCalls = [];
export function updateRenderingDiagnostic(values) {
  diagnosticCalls.push(values);
  return values;
}`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "preferences-stub.mjs"),
    `export function getBoolean(key) {
  if (key === "pixelFont") return false;
  return false;
}
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "explorer-bootstrap-shell.mjs"),
    transformedSource,
  );

  const module = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-bootstrap-shell.mjs")).href
  );
  const pixelStub = await import(
    pathToFileURL(path.join(tempDirectory, "pixel-artwork-stub.mjs")).href
  );
  const shellStub = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-shell-stub.mjs")).href
  );
  const emojiStub = await import(
    pathToFileURL(path.join(tempDirectory, "emoji-actions-stub.mjs")).href
  );
  const dialogStub = await import(
    pathToFileURL(path.join(tempDirectory, "dialog-render-stub.mjs")).href
  );

  let refreshed = 0;
  const dialogState = {
    classList: { contains: (value: string) => value === "is-editor-view" },
  } as { classList: { contains: (value: string) => boolean } };
  const state: any = {
    byId: { wrappedGift: { key: "wrappedGift" } },
    emojiByKey: { wrappedGift: "🎁" },
    emojiKeyByCodePoints: new Map([["1F381", "wrappedGift"]]),
    explorerPreferences: { pixelFont: true },
  };
  sharedState.byId.replace(state.byId);
  sharedState.emojiByKey.replace(state.emojiByKey);
  sharedState.emojiKeyByCodePoints.replace(state.emojiKeyByCodePoints);
  const options: any = {
    applyingUrlState: () => false,
    copyStatus: () => "copy-status",
    developerModeToggle: () => "developer-mode-toggle",
    dialog: () => dialogState,
    drawList: () => "draw-list",
    emojiFontChoices: () => ["system", "pixel"],
    modeChoices: () => ["standard", "advanced", "developer"],
    genderCheckboxes: () => ["neutral"],
    getPixelEditor: () => ({
      refreshFontBuild() {
        refreshed += 1;
      },
    }),
    hairCheckboxes: () => ["red"],
    installAppButton: () => "install-app-button",
    installDialog: () => "install-dialog",
    loadVersionData: () => "load-version-data",
    normalizeCodePoints: (value: string) => `norm:${value}`,
    offlineStatus: () => "offline-status",
    orderButtons: () => ["grouped"],
    renderCategoryFilters: () => "render-category-filters",
    renderSearchLanguages: () => "render-search-languages",
    renderVersionModeToggle: () => "render-version-mode-toggle",
    savedDialog: () => "saved-dialog",
    setDialogView: (...args: any[]) => ["setDialogView", ...args],
    showEmoji: (...args: any[]) => ["showEmoji-option", ...args],
    skinToneCheckboxes: () => ["1F3FB"],
    suppressDialogCloseSync: () => "suppressed",
    syncUrlState: (...args: any[]) => ["syncUrlState", ...args],
    syncVersionRange: () => "sync-version-range",
    themeChoices: () => ["light", "dark"],
    translate: (key: string, fallback: string) => `${key}:${fallback}`,
    urlStateReady: () => true,
    versionModeSelector: () => "version-mode-selector",
    versionSelector: () => "version-selector",
  };

  const bootstrap = module.createExplorerBootstrapShell(options);
  return {
    bootstrap,
    dialogState,
    dialogStub,
    emojiOptions: emojiStub.emojiActionCalls[0],
    options,
    pixelOptions: pixelStub.pixelArtworkCalls[0],
    refreshed: () => refreshed,
    shellOptions: shellStub.shellCalls[0],
    state,
  };
}
