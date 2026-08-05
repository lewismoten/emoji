// @ts-nocheck -- Transitional bootstrap wiring.
import { createPixelArtworkManager } from "../../explorer/pixel-artwork.js";
import { createExplorerShell } from "../explorer-shell.js";
import { createEmojiActions } from "../emoji/emoji-actions.js";
import { updateRenderingDiagnostic as updateRenderingDiagnosticHelper } from "../../explorer/dialog/dialog-render.js";
import * as preferences from "../../preferences.js";
import * as state from "../../state.js";

export function createExplorerBootstrapShell(options: any) {
  return createExplorerBootstrapShellWithFactories(options, {});
}

export function createExplorerBootstrapShellWithFactories(
  options: any,
  factories: any,
) {
  const createPixelArtworkManagerFactory =
    factories.createPixelArtworkManager ?? createPixelArtworkManager;
  const createExplorerShellFactory =
    factories.createExplorerShell ?? createExplorerShell;
  const createEmojiActionsFactory =
    factories.createEmojiActions ?? createEmojiActions;
  const updateRenderingDiagnosticFactory =
    factories.updateRenderingDiagnostic ?? updateRenderingDiagnosticHelper;

  let developerModeEnabled = () => false;

  const pixelArtwork = createPixelArtworkManagerFactory({
    byId: state.byId.get,
    emojiByKey: state.emojiByKey.get,
    emojiKeyByCodePoints: state.emojiKeyByCodePoints.get,
    genderCheckboxes: options.genderCheckboxes,
    hairCheckboxes: options.hairCheckboxes,
    normalizeCodePoints: options.normalizeCodePoints,
    pixelFontPreferred: () => !preferences.getBoolean("pixelFont"),
    refreshEditor: () => {
      if (options.dialog()?.classList.contains("is-editor-view")) {
        options.getPixelEditor()?.refreshFontBuild();
      }
    },
    skinToneCheckboxes: options.skinToneCheckboxes,
    updateRenderingDiagnostic: (values: any) =>
      updateRenderingDiagnosticFactory({
        ...values,
        byId: state.byId.get(),
        developerMode: developerModeEnabled(),
        detailsVisible:
          !options.dialog()?.classList.contains("is-code-view") &&
          !options.dialog()?.classList.contains("is-editor-view"),
        exampleDialog: options.dialog(),
        translate: options.translate,
      }),
  });

  const shell = createExplorerShellFactory({
    applyPixelArtworkClass: () => pixelArtwork.applyPixelArtworkClass,
    developerModeToggle: options.developerModeToggle,
    modeChoices: options.modeChoices,
    dialog: options.dialog,
    drawList: options.drawList,
    emojiFontChoices: options.emojiFontChoices,
    installAppButton: options.installAppButton,
    installDialog: options.installDialog,
    loadVersionData: options.loadVersionData,
    offlineStatus: options.offlineStatus,
    orderButtons: options.orderButtons,
    pixelEditor: () => options.getPixelEditor(),
    refreshRenderedPixelEmoji: pixelArtwork.refreshRenderedPixelEmoji,
    renderCategoryFilters: options.renderCategoryFilters,
    renderSearchLanguages: options.renderSearchLanguages,
    renderVersionModeToggle: options.renderVersionModeToggle,
    savedDialog: options.savedDialog,
    setDialogView: options.setDialogView,
    syncUrlState: options.syncUrlState,
    syncVersionRange: options.syncVersionRange,
    themeChoices: options.themeChoices,
    translate: options.translate,
    versionModeSelector: options.versionModeSelector,
    versionSelector: options.versionSelector,
  });

  developerModeEnabled = shell.developerModeEnabled;

  const emojiActions = createEmojiActionsFactory({
    applyingUrlState: options.applyingUrlState,
    applyPixelArtworkClass: () => pixelArtwork.applyPixelArtworkClass,
    applyStandalonePixelArtwork: () => pixelArtwork.applyPixelArtworkClass,
    copyStatus: options.copyStatus,
    developerModeEnabled: shell.developerModeEnabled,
    dialog: options.dialog,
    normalizeCodePoints: options.normalizeCodePoints,
    setDialogView: options.setDialogView,
    showEmoji: options.showEmoji,
    suppressDialogCloseSync: options.suppressDialogCloseSync,
    syncUrlState: options.syncUrlState,
    translate: options.translate,
    urlStateReady: options.urlStateReady,
  });

  return {
    ...pixelArtwork,
    applyStandalonePixelArtwork: pixelArtwork.applyPixelArtworkClass,
    ...shell,
    ...emojiActions,
  };
}
