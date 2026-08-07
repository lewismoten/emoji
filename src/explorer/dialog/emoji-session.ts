import { renderEmojiDialog } from "./dialog-render.js";
import * as state from "../../state.js";

export function showEmojiSession(options: any) {
  const value = state.emojiByKey.get(options.id);
  if (value === undefined) return;
  if (options.navigationKeys || options.openDialog) {
    state.dialogNavigationKeys.replace(
      [...(options.navigationKeys ?? state.displayedKeys.get())].filter(
        (key) => state.emojiByKey.get(key) !== undefined,
      ),
    );
  }
  state.currentEmojiKey.set(options.id);
  if (options.parentPanel !== undefined) {
    state.currentDialogParentStack.replace(
      options.parentPanel ? [options.parentPanel] : [],
    );
  }
  const item = state.byId.get(options.id) ?? {};
  const sourceItem = options.items.find((item: any) => item.key === options.id);
  const display = renderEmojiDialog({
    annotations: state.searchAnnotations.get(options.id) ?? [],
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    compositionMode: options.compositionMode,
    currentEmojiKey: options.id,
    developerMode: options.developerMode,
    fullDeveloperMode: options.fullDeveloperMode,
    dialogNavigationKeys: state.dialogNavigationKeys.get(),
    displayGroupName: options.displayGroupName,
    exampleDialog: options.dialog,
    getIntroducedVersion: options.getIntroducedVersion,
    group: sourceItem?.group ?? "(none)",
    id: options.id,
    item,
    locale:
      document.documentElement.lang ||
      state.selectedSearchLocale.get() ||
      undefined,
    numberingSystem: document.documentElement.lang?.startsWith("ar")
      ? "arab"
      : undefined,
    selectedSearchLocale: state.selectedSearchLocale.get(),
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeLabels: options.sequenceTypeLabels,
    statusTranslationKeys: options.statusTranslationKeys,
    subGroup: sourceItem?.unicodeSubGroup ?? "(none)",
    translate: options.translate,
    updateFavoriteButton: options.updateFavoriteButton,
    updateRenderingDiagnostic: options.updateRenderingDiagnostic,
    updateEmojiComposition: options.updateEmojiComposition,
    value,
  });
  state.currentEmojiCopies.replace(display.copyValues);
  if (options.openDialog) {
    options.openDialogAction(
      options.initialMode ?? "details",
      options.parentPanel ?? "",
    );
  }
  options.updateDialogNavigation();
  if (options.dialog.classList.contains("is-editor-view"))
    options.openEditor(options.id, value);
}
