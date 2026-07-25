type ApplicationWindow = {
  addEventListener(type: 'load', listener: () => void): void;
  document: { readyState: string };
};

/**
 * The Explorer composition root. Feature modules remain independent; this
 * controller owns only application lifecycle and will gradually take over the
 * orchestration currently living in the legacy entry point.
 */
export function createExplorerApp(options: {
  window: ApplicationWindow;
  start: () => Promise<void> | void;
}) {
  let started = false;

  const start = async () => {
    if (started) return;
    started = true;
    await options.start();
  };

  return {
    start,
    startWhenReady() {
      if (options.window.document.readyState === 'complete') {
        void start();
        return;
      }
      options.window.addEventListener('load', () => void start());
    }
  };
}

/** Bind browser events after the Explorer has resolved its DOM references. */
export function bindExplorerEvents(options: any) {
  const panel = (name: string) =>
    options.openPanel({
      panel: name,
      dialogs: options.panelDialogs(),
      languageList: options.languageList,
      renderSavedEmoji: options.renderSavedEmoji,
      syncUrlState: options.syncUrlState
    });
  const onPanelClose = (event: Event) =>
    options.onPanelClose({
      event,
      suppressedPanelCloses: options.suppressedPanelCloses,
      urlStateReady: options.urlStateReady(),
      applyingUrlState: options.applyingUrlState(),
      syncUrlState: options.syncUrlState
    });

  window.addEventListener('online', options.updateOnlineStatus);
  window.addEventListener('offline', options.updateOnlineStatus);
  window
    .matchMedia('(max-width: 560px)')
    .addEventListener('change', options.positionFavoriteButton);
  options.updateOnlineStatus();
  options.renderInstallAppButton();
  options.applyBasicUrlState();

  options.skinToneCheckboxes.forEach((checkbox: any) =>
    checkbox.addEventListener('change', options.drawList)
  );
  options.hairCheckboxes.forEach((checkbox: any) =>
    checkbox.addEventListener('change', options.drawList)
  );
  options.genderCheckboxes.forEach((checkbox: any) =>
    checkbox.addEventListener('change', options.onGenderChange)
  );
  options.searchText.addEventListener('input', options.scheduleSearchDraw);
  options.languagePicker.addEventListener('click', () => {
    if (options.helpDialog?.open)
      options.closePanel(options.helpDialog, options.suppressedPanelCloses);
    panel('language');
  });
  options.emojiFontChoices.forEach((choice: any) =>
    choice.addEventListener('click', options.selectEmojiFont)
  );
  options.installAppButton?.addEventListener('click', options.installApp);
  options.installedDisplayQueries.forEach((query: any) =>
    query.addEventListener?.('change', options.renderInstallAppButton)
  );
  options.installDialog
    ?.querySelector('.install-dialog-close')
    ?.addEventListener('click', () => options.installDialog.close());
  options.savedPicker?.addEventListener('click', () => panel('favorites'));
  options.helpPicker?.addEventListener('click', () => panel('help'));
  options.developerModeToggle?.addEventListener('change', options.toggleDeveloperMode);
  options.languageDialog.addEventListener('close', onPanelClose);
  options.savedDialog?.addEventListener('close', onPanelClose);
  options.helpDialog?.addEventListener('close', onPanelClose);
  options.savedDialog?.addEventListener('click', (event: any) => {
    const button = event.target.closest('[data-saved-emoji]');
    if (!button) return;
    const navigationKeys =
      button.dataset.savedSource === 'favorites'
        ? options.favoriteEmojiKeys()
        : options.copiedEmojiKeys();
    options.closePanel(options.savedDialog, options.suppressedPanelCloses);
    options.showEmoji(button.dataset.savedEmoji, true, navigationKeys);
  });
  options.emojiList.addEventListener('click', options.onClick);
  options.emojiList.addEventListener('focusin', options.onEmojiFocus);
  options.emojiList.addEventListener('keydown', options.onEmojiKeyDown);
  options.exampleDialog.addEventListener('click', options.onEmojiDialogClick);
  options.exampleDialog.addEventListener('close', options.onEmojiDialogClose);
  options.versionModeToggle?.addEventListener('click', options.toggleVersionMode);
  options.versionPrevious?.addEventListener('click', () => options.stepVersion(-1));
  options.versionNext?.addEventListener('click', () => options.stepVersion(1));
  options.clearFiltersButton?.addEventListener('click', options.resetFilters);
  options.emojiPrevious?.addEventListener('click', () => options.navigateEmoji(-1));
  options.emojiNext?.addEventListener('click', () => options.navigateEmoji(1));
  options.versionSelector.addEventListener('change', () => {
    options.syncVersionRange();
    options.drawList();
  });
  options.versionRange?.addEventListener('input', options.onVersionRangeInput);
  options.orderButtons.forEach((button: any) =>
    button.addEventListener('click', options.onOrderModeChange)
  );
  options.advancedFilters.addEventListener('toggle', () =>
    options.savePreference('filtersOpen', options.advancedFilters.open)
  );
  document.addEventListener('keydown', options.onDocumentKeyDown);
}
