// @ts-nocheck -- Transitional bootstrap wiring.
import { createPixelArtworkManager } from '../explorer/pixel-artwork.js';
import { createExplorerShell } from './explorer-shell.js';
import { createEmojiActions } from './emoji-actions.js';
import { updateRenderingDiagnostic as updateRenderingDiagnosticHelper } from '../explorer/dialog-render.js';

export function createExplorerBootstrapShell(options: any) {
  let developerModeEnabled = () => false;

  const pixelArtwork = createPixelArtworkManager({
    byId: () => options.state().byId,
    emojiByKey: () => options.state().emojiByKey,
    emojiKeyByCodePoints: () => options.state().emojiKeyByCodePoints,
    genderCheckboxes: () => options.genderCheckboxes(),
    hairCheckboxes: () => options.hairCheckboxes(),
    normalizeCodePoints: options.normalizeCodePoints,
    pixelFontPreferred: () => options.state().explorerPreferences.pixelFont !== false,
    refreshEditor: () => {
      if (options.dialog()?.classList.contains('is-editor-view')) {
        options.getPixelEditor()?.refreshFontBuild();
      }
    },
    skinToneCheckboxes: () => options.skinToneCheckboxes(),
    updateRenderingDiagnostic: (values: any) =>
      updateRenderingDiagnosticHelper({
        ...values,
        byId: options.state().byId,
        developerMode: developerModeEnabled(),
        detailsVisible:
          !options.dialog()?.classList.contains('is-code-view') &&
          !options.dialog()?.classList.contains('is-editor-view'),
        exampleDialog: options.dialog(),
        translate: options.translate
      })
  });

  const shell = createExplorerShell({
    applyPixelArtworkClass: () => pixelArtwork.applyPixelArtworkClass,
    developerModeToggle: () => options.developerModeToggle(),
    dialog: () => options.dialog(),
    drawList: () => options.drawList(),
    emojiFontChoices: () => options.emojiFontChoices(),
    installAppButton: () => options.installAppButton(),
    installDialog: () => options.installDialog(),
    loadVersionData: () => options.loadVersionData(),
    offlineStatus: () => options.offlineStatus(),
    orderButtons: () => options.orderButtons(),
    pixelEditor: () => options.getPixelEditor(),
    refreshRenderedPixelEmoji: pixelArtwork.refreshRenderedPixelEmoji,
    renderCategoryFilters: () => options.renderCategoryFilters(),
    renderSearchLanguages: () => options.renderSearchLanguages(),
    renderVersionModeToggle: () => options.renderVersionModeToggle(),
    savedDialog: () => options.savedDialog(),
    savePreference: options.savePreference,
    setDialogView: (...args: any[]) => options.setDialogView(...args),
    state: () => options.state(),
    syncUrlState: () => options.syncUrlState(),
    syncVersionRange: () => options.syncVersionRange(),
    themeChoices: () => options.themeChoices(),
    translate: options.translate,
    versionModeSelector: () => options.versionModeSelector(),
    versionSelector: () => options.versionSelector()
  });

  developerModeEnabled = shell.developerModeEnabled;

  const emojiActions = createEmojiActions({
    applyingUrlState: () => options.applyingUrlState(),
    applyPixelArtworkClass: () => pixelArtwork.applyPixelArtworkClass,
    applyStandalonePixelArtwork: () => pixelArtwork.applyPixelArtworkClass,
    copyStatus: () => options.copyStatus(),
    developerModeEnabled: shell.developerModeEnabled,
    dialog: () => options.dialog(),
    normalizeCodePoints: options.normalizeCodePoints,
    setDialogView: (...args: any[]) => options.setDialogView(...args),
    showEmoji: (...args: any[]) => options.showEmoji(...args),
    state: () => options.state(),
    suppressDialogCloseSync: () => options.suppressDialogCloseSync(),
    syncUrlState: (...args: any[]) => options.syncUrlState(...args),
    translate: options.translate,
    urlStateReady: () => options.urlStateReady()
  });

  return {
    ...pixelArtwork,
    applyStandalonePixelArtwork: pixelArtwork.applyPixelArtworkClass,
    ...shell,
    ...emojiActions
  };
}
