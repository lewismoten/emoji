import {
  buildExplorerUrlQuery,
  parseExplorerUrlState,
  type ExplorerUrlState
} from './url-state.js';
import {
  applyBasicUrlStateToControls,
  applyExclusiveCheckboxSelection,
  applyLoadedUrlStateToControls,
  resetFilterControls,
  stepVersionIndex
} from './filter-controls.js';
import {
  closePanelDialog,
  getOpenPanel,
  getPanelDialog,
  openPanelDialog
} from './pwa-panels.js';

type Checkbox = { checked: boolean; value: string };

export function createExplorerNavigation(options: {
  allowedSequenceTypes: string[];
  applyingUrlState: () => boolean;
  closeEmojiDialog: () => void;
  compositionMode: () => 'condensed' | 'full';
  developerModeEnabled: () => boolean;
  dialog: () => HTMLDialogElement;
  currentEmojiKey: () => string;
  drawList: () => void;
  emojiByKey: () => Record<string, string>;
  genderCheckboxes: () => Checkbox[];
  getOrderMode: () => 'grouped' | 'unicode' | 'sequence';
  groups: () => string[];
  getSelectedGroup: () => string;
  getSelectedSequenceType: () => string;
  getSelectedSubGroup: () => string;
  hairCheckboxes: () => Checkbox[];
  helpDialog: () => HTMLDialogElement | undefined;
  latestReleasedVersion: () => string | undefined;
  navigateEmoji: (amount: number) => void;
  openEmoji: (
    key: string,
    openDialog?: boolean,
    navigationKeys?: string[],
    initialMode?: ExplorerUrlState['emojiMode']
  ) => void;
  orderButtons: () => any[];
  panelDialogs: () => any;
  languageList: () => HTMLElement | undefined;
  preferredOrder: () => string;
  renderCategoryFilters: () => void;
  renderSavedEmoji: () => void;
  renderVersionModeToggle: () => void;
  searchText: () => HTMLInputElement;
  setCompositionMode: (mode: 'condensed' | 'full') => void;
  setDialogView: (mode: ExplorerUrlState['emojiMode'], updateUrl: boolean) => void;
  setOrderMode: (mode: 'grouped' | 'unicode' | 'sequence') => void;
  setSelectedGroup: (value: string) => void;
  setSelectedSequenceType: (value: string) => void;
  setSelectedSubGroup: (value: string) => void;
  showEmojiDialog: () => void;
  skinToneCheckboxes: () => Checkbox[];
  subGroupSelectionKey: (group: string, subGroup: string) => string;
  subGroups: () => Record<string, string[]>;
  suppressedPanelCloses: () => WeakSet<HTMLDialogElement>;
  syncVersionRange: () => void;
  urlStateReady: () => boolean;
  versionModeSelector: () => HTMLSelectElement;
  versionRange: () => HTMLInputElement;
  versionSelector: () => HTMLSelectElement;
}) {
  const getUrlState = () =>
    parseExplorerUrlState({
      search: window.location.search,
      developerMode: options.developerModeEnabled(),
      preferredOrder: options.preferredOrder(),
      allowedSequenceTypes: options.allowedSequenceTypes
    });

  const applyBasicUrlState = () => {
    const nextState = applyBasicUrlStateToControls({
      state: getUrlState(),
      searchText: options.searchText(),
      orderButtons: options.orderButtons()
    });
    options.setOrderMode(nextState.orderMode);
    options.setSelectedSequenceType(nextState.selectedSequenceType);
    options.setCompositionMode(nextState.compositionMode);
  };

  const applyLoadedUrlState = () => {
    const selections = applyLoadedUrlStateToControls({
      state: getUrlState(),
      versionSelector: options.versionSelector(),
      versionModeSelector: options.versionModeSelector(),
      groups: options.groups(),
      subGroups: options.subGroups(),
      skinToneCheckboxes: options.skinToneCheckboxes(),
      hairCheckboxes: options.hairCheckboxes(),
      genderCheckboxes: options.genderCheckboxes(),
      subGroupSelectionKey: options.subGroupSelectionKey
    });
    options.setSelectedGroup(selections.selectedGroup);
    options.setSelectedSubGroup(selections.selectedSubGroup);
    options.renderVersionModeToggle();
    options.syncVersionRange();
  };

  const applyDialogUrlState = () => {
    const state = getUrlState();
    options.setCompositionMode(state.compositionMode);
    const dialogs = options.panelDialogs();
    if (state.emoji && options.emojiByKey()[state.emoji] !== undefined) {
      [dialogs.favorites, dialogs.help, dialogs.language].forEach(dialog =>
        closePanelDialog(dialog, options.suppressedPanelCloses())
      );
      options.openEmoji(state.emoji, true, undefined, state.emojiMode);
      if (!options.dialog().open) options.showEmojiDialog();
      return;
    }
    if (options.dialog().open) options.closeEmojiDialog();
    const desiredPanelDialog = getPanelDialog(state.panel, dialogs);
    [dialogs.favorites, dialogs.help, dialogs.language].forEach(dialog => {
      if (dialog !== desiredPanelDialog)
        closePanelDialog(dialog, options.suppressedPanelCloses());
    });
    if (desiredPanelDialog && !desiredPanelDialog.open) {
      openPanelDialog({
        panel: state.panel as 'favorites' | 'help' | 'language',
        addHistory: false,
        dialogs,
        languageList: options.languageList(),
        renderSavedEmoji: options.renderSavedEmoji,
        syncUrlState
      });
    }
  };

  const syncUrlState = (
    method: 'replace' | 'push' = 'replace',
    historyState = window.history.state
  ) => {
    if (!options.urlStateReady() || options.applyingUrlState()) return;
    const checkedValues = (checkboxes: Checkbox[]) =>
      checkboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
    const dialog = options.dialog();
    const query = buildExplorerUrlQuery({
      search: options.searchText().value,
      developerMode: options.developerModeEnabled(),
      latestReleasedVersion: options.latestReleasedVersion(),
      version: options.versionSelector().value,
      versionMode: options.versionModeSelector().value as 'through' | 'selected',
      order: options.getOrderMode(),
      group: options.getSelectedGroup(),
      subGroup: options.getSelectedSubGroup(),
      sequenceType: options.getSelectedSequenceType(),
      skin: checkedValues(options.skinToneCheckboxes()),
      hair: checkedValues(options.hairCheckboxes()),
      gender: checkedValues(options.genderCheckboxes()),
      compositionMode: options.compositionMode(),
      currentEmojiKey: options.currentEmojiKey(),
      emojiMode: dialog.classList.contains('is-editor-view')
        ? 'editor'
        : dialog.classList.contains('is-code-view')
          ? 'code'
          : 'details',
      panel: getOpenPanel(options.panelDialogs()),
      dialogOpen: dialog.open
    });
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history[`${method}State`](historyState, '', url);
  };

  const resetFilters = () => {
    resetFilterControls({
      searchText: options.searchText(),
      versionModeSelector: options.versionModeSelector(),
      versionSelector: options.versionSelector(),
      latestReleasedVersion: options.latestReleasedVersion(),
      skinToneCheckboxes: options.skinToneCheckboxes(),
      hairCheckboxes: options.hairCheckboxes(),
      genderCheckboxes: options.genderCheckboxes()
    });
    options.setSelectedGroup('');
    options.setSelectedSubGroup('');
    options.setSelectedSequenceType('');
    options.renderVersionModeToggle();
    options.syncVersionRange();
    options.renderCategoryFilters();
    options.drawList();
    options.searchText().focus();
  };

  const onGenderChange = (event: Event) => {
    applyExclusiveCheckboxSelection(
      options.genderCheckboxes(),
      event.currentTarget as unknown as Checkbox
    );
    options.drawList();
  };

  const stepVersion = (amount: number) => {
    const range = options.versionRange();
    const nextIndex = stepVersionIndex(
      Number(range.value),
      options.versionSelector().options.length,
      amount
    );
    if (nextIndex === Number(range.value)) return;
    range.value = String(nextIndex);
    range.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const onDocumentKeyDown = (event: KeyboardEvent) => {
    const activeTag = document.activeElement?.tagName;
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag ?? '');
    const hasOpenDialog = Boolean(document.querySelector('dialog[open]'));
    if (event.key === '?' && !isTyping && !hasOpenDialog && options.helpDialog()) {
      event.preventDefault();
      openPanelDialog({
        panel: 'help',
        dialogs: options.panelDialogs(),
        languageList: options.languageList(),
        renderSavedEmoji: options.renderSavedEmoji,
        syncUrlState
      });
      return;
    }
    if (event.key === '/' && !isTyping && !hasOpenDialog) {
      event.preventDefault();
      options.searchText().focus();
      return;
    }
    if (event.key === 'Escape' && !hasOpenDialog && options.searchText().value) {
      options.searchText().value = '';
      options.drawList();
      options.searchText().focus();
      return;
    }
    if (!options.dialog().open || isTyping) return;
    const rtl = document.documentElement.dir === 'rtl';
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const previous = event.key === 'ArrowLeft';
      options.navigateEmoji((previous ? -1 : 1) * (rtl ? -1 : 1));
    }
  };

  return {
    applyBasicUrlState,
    applyDialogUrlState,
    applyLoadedUrlState,
    onDocumentKeyDown,
    onGenderChange,
    resetFilters,
    stepVersion,
    syncUrlState
  };
}
