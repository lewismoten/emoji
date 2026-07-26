import { showEmojiSession } from '../explorer/emoji-session.js';

/** Assemble dependencies for opening an emoji-details session. */
export function createEmojiSessionController(options: any) {
  const showEmoji = (
    id: string,
    openDialog = true,
    navigationKeys?: string[],
    initialMode: 'details' | 'code' | 'editor' = 'details',
    parentPanel?: '' | 'favorites' | 'help' | 'language'
  ) =>
    showEmojiSession({
      applyPixelArtworkClass: options.applyPixelArtworkClass,
      applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
      byId: options.state().byId,
      compositionMode: options.state().compositionMode,
      currentEmojiCopies: {
        get value() {
          return options.state().currentEmojiCopies;
        },
        set value(value) {
          options.state().currentEmojiCopies = value;
        }
      },
      currentEmojiKey: {
        get value() {
          return options.state().currentEmojiKey;
        },
        set value(value) {
          options.state().currentEmojiKey = value;
        }
      },
      currentDialogParentStack: {
        get value() {
          return options.state().currentDialogParentStack;
        },
        set value(value) {
          options.state().currentDialogParentStack = value;
        }
      },
      developerMode: options.developerModeEnabled(),
      dialog: options.dialog(),
      dialogNavigationKeys: {
        get value() {
          return options.state().dialogNavigationKeys;
        },
        set value(value) {
          options.state().dialogNavigationKeys = value;
        }
      },
      displayGroupName: options.displayGroupName,
      displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
      displayedKeys: { value: options.state().displayedKeys },
      emojiByKey: options.state().emojiByKey,
      getIntroducedVersion: options.getIntroducedVersion,
      id,
      initialMode,
      items: options.state().items,
      navigationKeys,
      openDialog,
      parentPanel,
      openDialogAction: options.openDialogAction,
      openEditor: options.openEditor,
      searchAnnotations: options.state().searchAnnotations,
      selectedSearchLocale: options.state().selectedSearchLocale,
      sequenceTranslationKeys: options.sequenceTranslationKeys,
      sequenceTypeLabels: options.sequenceTypeLabels,
      statusTranslationKeys: options.statusTranslationKeys,
      translate: options.translate,
      updateDialogNavigation: options.updateDialogNavigation,
      updateEmojiComposition: options.updateEmojiComposition,
      updateFavoriteButton: options.updateFavoriteButton,
      updateRenderingDiagnostic: options.updateRenderingDiagnostic
    });

  return { showEmoji };
}
