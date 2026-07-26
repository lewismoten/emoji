import { createExplorerNavigation } from '../explorer/explorer-navigation.js';

export function createNavigationRuntime(options: any) {
  return createExplorerNavigation({
    allowedSequenceTypes: options.allowedSequenceTypes,
    applyingUrlState: () => options.applyingUrlState(),
    closeEmojiDialog: () => {
      options.setSuppressDialogCloseSync(true);
      options.dialog().close();
      options.setSuppressDialogCloseSync(false);
    },
    compositionMode: () => options.compositionMode(),
    developerModeEnabled: options.developerModeEnabled,
    dialog: options.dialog,
    currentEmojiKey: () => options.currentEmojiKey(),
    drawList: options.drawList,
    emojiByKey: () => options.emojiByKey(),
    genderCheckboxes: () => options.genderCheckboxes(),
    getOrderMode: () => options.getOrderMode(),
    getSelectedGroup: () => options.getSelectedGroup(),
    getSelectedSequenceType: () => options.getSelectedSequenceType(),
    getSelectedSubGroup: () => options.getSelectedSubGroup(),
    groups: () => options.groups(),
    hairCheckboxes: () => options.hairCheckboxes(),
    helpDialog: () => options.helpDialog(),
    languageList: () => options.languageList(),
    latestReleasedVersion: () => options.latestReleasedVersion(),
    navigateEmoji: (amount: number) => options.navigateEmoji(amount),
    openEmoji: (
      key: string,
      openDialog?: boolean,
      navigationKeys?: string[],
      initialMode?: string
    ) =>
      options.showEmoji(
        key,
        openDialog ?? false,
        navigationKeys ?? options.displayedKeys(),
        initialMode
      ),
    orderButtons: () => options.orderButtons(),
    panelDialogs: options.panelDialogs,
    preferredOrder: () => options.preferredOrder(),
    renderCategoryFilters: () => options.renderCategoryFilters(),
    renderSavedEmoji: options.renderSavedEmoji,
    renderVersionModeToggle: () => options.renderVersionModeToggle(),
    searchText: () => options.searchText(),
    setCompositionMode: (value: 'condensed' | 'full') =>
      options.setCompositionMode(value),
    setDialogView: (...args: any[]) => options.setDialogView(...args),
    setOrderMode: (value: 'grouped' | 'unicode' | 'sequence') =>
      options.setOrderMode(value),
    setSelectedGroup: (value: string) => options.setSelectedGroup(value),
    setSelectedSequenceType: (value: string) =>
      options.setSelectedSequenceType(value),
    setSelectedSubGroup: (value: string) => options.setSelectedSubGroup(value),
    showEmojiDialog: () => {
      options.dialog().showModal();
      options.focusInitialAction();
    },
    skinToneCheckboxes: () => options.skinToneCheckboxes(),
    subGroupSelectionKey: options.subGroupSelectionKey,
    subGroups: () => options.subGroups(),
    suppressedPanelCloses: () => options.suppressedPanelCloses(),
    syncVersionRange: () => options.syncVersionRange(),
    urlStateReady: () => options.urlStateReady(),
    versionModeSelector: () => options.versionModeSelector(),
    versionRange: () => options.versionRange(),
    versionSelector: () => options.versionSelector()
  });
}
