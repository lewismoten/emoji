import { renderEmojiDialog } from "./dialog-render.js";

export function showEmojiSession(options: any) {
  const value = options.emojiByKey[options.id];
  if (value === undefined) return;
  if (options.navigationKeys || options.openDialog) {
    options.dialogNavigationKeys.value = [
      ...(options.navigationKeys ?? options.displayedKeys.value),
    ].filter((key) => options.emojiByKey[key] !== undefined);
  }
  options.currentEmojiKey.value = options.id;
  if (options.parentPanel !== undefined) {
    options.currentDialogParentStack.value = options.parentPanel
      ? [options.parentPanel]
      : [];
  }
  const item = options.byId[options.id] ?? {};
  const sourceItem = options.items.find((item: any) => item.key === options.id);
  const display = renderEmojiDialog({
    annotations: options.searchAnnotations[options.id] ?? [],
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    byId: options.byId,
    compositionMode: options.compositionMode,
    currentEmojiKey: options.id,
    developerMode: options.developerMode,
    fullDeveloperMode: options.fullDeveloperMode,
    dialogNavigationKeys: options.dialogNavigationKeys.value,
    displayGroupName: options.displayGroupName,
    displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
    emojiByKey: options.emojiByKey,
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
    searchAnnotations: options.searchAnnotations,
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
