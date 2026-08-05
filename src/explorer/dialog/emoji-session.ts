import { renderEmojiDialog } from "./dialog-render.js";
import * as state from "../../state.js";

export function showEmojiSession(options: any) {
  const value = state.emojiByKey.get(options.id);
  if (value === undefined) return;
  if (options.navigationKeys || options.openDialog) {
    options.dialogNavigationKeys.value = [
      ...(options.navigationKeys ?? options.displayedKeys.value),
    ].filter((key) => state.emojiByKey.get(key) !== undefined);
  }
  options.currentEmojiKey.value = options.id;
  if (options.parentPanel !== undefined) {
    options.currentDialogParentStack.value = options.parentPanel
      ? [options.parentPanel]
      : [];
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
    dialogNavigationKeys: options.dialogNavigationKeys.value,
    displayGroupName: options.displayGroupName,
    exampleDialog: options.dialog,
    getIntroducedVersion: options.getIntroducedVersion,
    group: sourceItem?.group ?? "(none)",
    id: options.id,
    item,
    locale:
      document.documentElement.lang ||
      options.selectedSearchLocale ||
      undefined,
    numberingSystem: document.documentElement.lang?.startsWith("ar")
      ? "arab"
      : undefined,
    selectedSearchLocale: options.selectedSearchLocale,
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
  options.currentEmojiCopies.value = display.copyValues;
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
