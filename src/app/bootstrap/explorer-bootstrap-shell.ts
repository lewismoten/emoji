// @ts-nocheck -- Transitional bootstrap wiring.
import { createPixelArtworkManager } from "../../explorer/pixel-artwork.js";
import { createExplorerShell } from "../explorer-shell.js";
import { createEmojiActions } from "../emoji-actions.js";
import { updateRenderingDiagnostic as updateRenderingDiagnosticHelper } from "../../explorer/dialog/dialog-render.js";

export function createExplorerBootstrapShell(options: any) {
  let developerModeEnabled = () => false;
  const state = options.state;

  const pixelArtwork = createPixelArtworkManager({
    byId: () => state().byId,
    emojiByKey: () => state().emojiByKey,
    emojiKeyByCodePoints: () => state().emojiKeyByCodePoints,
    genderCheckboxes: options.genderCheckboxes,
    hairCheckboxes: options.hairCheckboxes,
    normalizeCodePoints: options.normalizeCodePoints,
    pixelFontPreferred: () => state().explorerPreferences.pixelFont !== false,
    refreshEditor: () => {
      if (options.dialog()?.classList.contains("is-editor-view")) {
        options.getPixelEditor()?.refreshFontBuild();
      }
    },
    skinToneCheckboxes: options.skinToneCheckboxes,
    updateRenderingDiagnostic: (values: any) =>
      updateRenderingDiagnosticHelper({
        ...values,
        byId: state().byId,
        developerMode: developerModeEnabled(),
        detailsVisible:
          !options.dialog()?.classList.contains("is-code-view") &&
          !options.dialog()?.classList.contains("is-editor-view"),
        exampleDialog: options.dialog(),
        translate: options.translate,
      }),
  });

  const shell = createExplorerShell({
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
    savePreference: options.savePreference,
    setDialogView: options.setDialogView,
    state,
    syncUrlState: options.syncUrlState,
    syncVersionRange: options.syncVersionRange,
    themeChoices: options.themeChoices,
    translate: options.translate,
    versionModeSelector: options.versionModeSelector,
    versionSelector: options.versionSelector,
  });

  developerModeEnabled = shell.developerModeEnabled;

  const emojiActions = createEmojiActions({
    applyingUrlState: options.applyingUrlState,
    applyPixelArtworkClass: () => pixelArtwork.applyPixelArtworkClass,
    applyStandalonePixelArtwork: () => pixelArtwork.applyPixelArtworkClass,
    copyStatus: options.copyStatus,
    developerModeEnabled: shell.developerModeEnabled,
    dialog: options.dialog,
    normalizeCodePoints: options.normalizeCodePoints,
    setDialogView: options.setDialogView,
    showEmoji: options.showEmoji,
    state,
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
