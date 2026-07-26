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
  const syncSavedListFocus = (list: HTMLElement | null, active?: HTMLElement | null) => {
    if (!list) return;
    const buttons = Array.from(
      list.querySelectorAll<HTMLElement>('button[data-saved-emoji]')
    );
    if (buttons.length === 0) return;
    const nextActive =
      active && buttons.includes(active)
        ? active
        : buttons.find(button => button.tabIndex === 0) ?? buttons[0];
    buttons.forEach(button => {
      button.tabIndex = button === nextActive ? 0 : -1;
    });
  };
  const closestVerticalSavedEmoji = (
    current: HTMLElement,
    buttons: HTMLElement[],
    direction: number
  ) => {
    const currentRect = current.getBoundingClientRect();
    const currentX = currentRect.left + currentRect.width / 2;
    const currentY = currentRect.top + currentRect.height / 2;
    return buttons
      .filter(button => {
        if (button === current) return false;
        const rect = button.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        return direction > 0 ? centerY > currentY + 1 : centerY < currentY - 1;
      })
      .map(button => {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        return {
          button,
          score:
            Math.abs(centerY - currentY) * 1000 + Math.abs(centerX - currentX)
        };
      })
      .sort((left, right) => left.score - right.score)[0]?.button;
  };
  const onThemeChoiceKeyDown = (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
      return;
    const choices = options.themeChoices ?? [];
    const currentIndex = choices.indexOf(event.currentTarget);
    if (currentIndex === -1 || choices.length === 0) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = choices.length - 1;
    else {
      const rtl = document.documentElement.dir === 'rtl';
      const backwards =
        event.key === 'ArrowUp' ||
        event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
      nextIndex =
        (currentIndex + (backwards ? -1 : 1) + choices.length) % choices.length;
    }
    const nextChoice = choices[nextIndex];
    if (!nextChoice) return;
    nextChoice.focus();
    nextChoice.click();
  };
  const getModifierGroupCheckboxes = (checkbox: HTMLElement | null) => {
    const fieldset = checkbox?.closest('fieldset');
    if (!fieldset) return [] as HTMLInputElement[];
    return Array.from(
      fieldset.querySelectorAll<HTMLInputElement>('input.skin-tone, input.hair, input.gender')
    );
  };
  const syncModifierGroupFocus = (
    checkboxes: HTMLInputElement[],
    active?: HTMLInputElement | null
  ) => {
    if (checkboxes.length === 0) return;
    const nextActive =
      active && checkboxes.includes(active)
        ? active
        : checkboxes.find(checkbox => checkbox.checked) ?? checkboxes[0];
    checkboxes.forEach(checkbox => {
      checkbox.tabIndex = checkbox === nextActive ? 0 : -1;
    });
  };
  const onModifierFocus = (event: FocusEvent) => {
    const checkbox = event.target as HTMLInputElement | null;
    if (!checkbox?.matches?.('input.skin-tone, input.hair, input.gender')) return;
    syncModifierGroupFocus(getModifierGroupCheckboxes(checkbox), checkbox);
  };
  const onModifierKeyDown = (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
      return;
    const checkbox = event.currentTarget as HTMLInputElement | null;
    const checkboxes = getModifierGroupCheckboxes(checkbox);
    const currentIndex = checkbox ? checkboxes.indexOf(checkbox) : -1;
    if (currentIndex === -1 || checkboxes.length === 0) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = checkboxes.length - 1;
    else {
      const rtl = document.documentElement.dir === 'rtl';
      const current = checkboxes[currentIndex];
      const currentRect = current.getBoundingClientRect();
      const rowTolerance = Math.max(8, currentRect.height / 2);
      const positioned = checkboxes.map((item, index) => {
        const label = item.closest('label') ?? item;
        const rect = label.getBoundingClientRect();
        return {
          checkbox: item,
          index,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        };
      });
      const rows: typeof positioned[] = [];
      positioned.forEach(item => {
        const row = rows.find(
          candidate => Math.abs(candidate[0].centerY - item.centerY) <= rowTolerance
        );
        if (row) row.push(item);
        else rows.push([item]);
      });
      rows.forEach(row => row.sort((left, right) => left.centerX - right.centerX));
      rows.sort((top, bottom) => top[0].centerY - bottom[0].centerY);
      const rowIndex = rows.findIndex(row => row.some(item => item.index === currentIndex));
      const columnIndex = rows[rowIndex]?.findIndex(item => item.index === currentIndex) ?? -1;
      if (rowIndex === -1 || columnIndex === -1) return;
      const movePrevious = rtl ? event.key === 'ArrowRight' : event.key === 'ArrowLeft';
      const moveNext = rtl ? event.key === 'ArrowLeft' : event.key === 'ArrowRight';
      if (movePrevious || moveNext) {
        const row = rows[rowIndex];
        const offset = movePrevious ? -1 : 1;
        nextIndex =
          row[(columnIndex + offset + row.length) % row.length]?.index ?? currentIndex;
      } else {
        const targetRow = rows[rowIndex + (event.key === 'ArrowUp' ? -1 : 1)];
        if (!targetRow) return;
        const currentItem = rows[rowIndex][columnIndex];
        nextIndex =
          targetRow
            .map(item => ({
              index: item.index,
              score: Math.abs(item.centerX - currentItem.centerX)
            }))
            .sort((left, right) => left.score - right.score)[0]?.index ?? currentIndex;
      }
    }
    const nextCheckbox = checkboxes[nextIndex];
    if (!nextCheckbox) return;
    syncModifierGroupFocus(checkboxes, nextCheckbox);
    nextCheckbox.focus();
  };
  const bindModifierGroup = (
    checkboxes: HTMLInputElement[],
    onChange: (event: Event) => void
  ) => {
    syncModifierGroupFocus(checkboxes);
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', event => {
        onChange(event);
        syncModifierGroupFocus(checkboxes, event.currentTarget as HTMLInputElement);
      });
      checkbox.addEventListener('focus', onModifierFocus);
      checkbox.addEventListener('keydown', onModifierKeyDown);
    });
  };

  window.addEventListener('online', options.updateOnlineStatus);
  window.addEventListener('offline', options.updateOnlineStatus);
  window
    .matchMedia('(max-width: 560px)')
    .addEventListener('change', options.positionFavoriteButton);
  options.updateOnlineStatus();
  options.renderInstallAppButton();
  options.applyBasicUrlState();

  bindModifierGroup(options.skinToneCheckboxes, () => options.drawList());
  bindModifierGroup(options.hairCheckboxes, () => options.drawList());
  bindModifierGroup(options.genderCheckboxes, options.onGenderChange);
  options.searchText.addEventListener('input', options.scheduleSearchDraw);
  options.languagePicker.addEventListener('click', () => {
    if (options.helpDialog?.open)
      options.closePanel(options.helpDialog, options.suppressedPanelCloses);
    panel('language');
  });
  options.emojiFontChoices.forEach((choice: any) =>
    choice.addEventListener('click', options.selectEmojiFont)
  );
  options.themeChoices?.forEach((choice: any) =>
    choice.addEventListener('click', options.selectTheme)
  );
  options.themeChoices?.forEach((choice: any) =>
    choice.addEventListener('keydown', onThemeChoiceKeyDown)
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
    options.showEmoji(
      button.dataset.savedEmoji,
      true,
      navigationKeys,
      'details',
      'favorites'
    );
  });
  options.savedDialog?.addEventListener('focusin', (event: any) => {
    const button = event.target?.closest?.('[data-saved-emoji]');
    const list = button?.closest?.('.saved-emoji-list') as HTMLElement | null;
    if (!button || !list) return;
    syncSavedListFocus(list, button);
  });
  options.savedDialog?.addEventListener('keydown', (event: KeyboardEvent) => {
    const button = (event.target as HTMLElement | null)?.closest?.<HTMLElement>(
      '[data-saved-emoji]'
    );
    if (!button) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      button.click();
      return;
    }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
      return;
    const list = button.closest('.saved-emoji-list') as HTMLElement | null;
    if (!list) return;
    const buttons = Array.from(
      list.querySelectorAll<HTMLElement>('button[data-saved-emoji]')
    );
    if (buttons.length === 0) return;
    event.preventDefault();
    let target: HTMLElement | undefined;
    if (event.key === 'Home') target = buttons[0];
    else if (event.key === 'End') target = buttons.at(-1);
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const allButtons = Array.from(
        options.savedDialog.querySelectorAll('button[data-saved-emoji]')
      ) as HTMLElement[];
      target = closestVerticalSavedEmoji(
        button,
        allButtons,
        event.key === 'ArrowDown' ? 1 : -1
      );
    } else {
      const rtl = document.documentElement.dir === 'rtl';
      const direction = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? 1 : -1;
      target = buttons[buttons.indexOf(button) + direction];
    }
    if (!target) return;
    syncSavedListFocus(list, target);
    target.focus();
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

/** Create the dynamic filter controls after the static page has loaded. */
export function initializeExplorerControls(options: any) {
  const controls = options.createFilterControlSetup({
    document,
    versionModeSelector: options.versionModeSelector,
    versionRange: options.versionRange,
    versionSelector: options.versionSelector
  });
  options.renderDeveloperMode();
  const compactGroupChoices = controls.ensureChoiceContainer(
    options.groupSelector,
    'compact-group-choices',
    'group-filter-label'
  );
  const compactSubGroupChoices = controls.ensureChoiceContainer(
    options.subGroupSelector,
    'compact-subgroup-choices',
    'subgroup-filter-label'
  );
  const sequenceTypeSelector = controls.ensureSequenceTypeFilter();
  const compactSequenceChoices = controls.ensureChoiceContainer(
    sequenceTypeSelector,
    'compact-sequence-choices',
    'sequence-filter-label'
  );
  [compactGroupChoices, compactSubGroupChoices, compactSequenceChoices].forEach(
    choice => choice.addEventListener('keydown', options.onCompactChoiceKeyDown)
  );
  options.groupPickerTrigger?.addEventListener('click', () =>
    options.openFilterPicker(options.groupFilterDialog, compactGroupChoices)
  );
  options.subGroupPickerTrigger?.addEventListener('click', () =>
    options.openFilterPicker(options.subGroupFilterDialog, compactSubGroupChoices)
  );
  const compactGroupLabel = controls.ensureSelectionLabel(
    options.groupSelector,
    'compact-group-label',
    'group-filter-label'
  );
  const compactSubGroupLabel = controls.ensureSelectionLabel(
    options.subGroupSelector,
    'compact-subgroup-label',
    'subgroup-filter-label'
  );
  const compactSequenceLabel = controls.ensureSelectionLabel(
    sequenceTypeSelector,
    'compact-sequence-label',
    'sequence-filter-label'
  );
  const { range: versionRange, output: versionRangeValue } =
    controls.ensureVersionSlider();
  options.populateVersionModeOptions();
  const versionModeToggle = controls.ensureVersionModeToggle();
  options.versionSelector
    .closest('.filter-field')
    ?.classList.toggle('has-version-slider', Boolean(versionRange && versionRangeValue));
  const { summary, text, clear } = controls.ensureActiveFilterSummary();
  return {
    activeFilterSummary: summary,
    activeFilterText: text,
    clearFiltersButton: clear,
    compactGroupChoices,
    compactGroupLabel,
    compactSequenceChoices,
    compactSequenceLabel,
    compactSubGroupChoices,
    compactSubGroupLabel,
    sequenceTypeSelector,
    versionModeToggle,
    versionRange,
    versionRangeValue
  };
}

/** Complete the asynchronous page startup once controls and events exist. */
export async function finalizeExplorerStartup(options: any) {
  options.renderVersionModeToggle();
  options.renderThemeToggle();
  options.renderPixelFontToggle();
  options.observeToolbarHeight(options.toolbar);
  if (typeof options.preferences.filtersOpen === 'boolean') {
    options.advancedFilters.open = options.preferences.filtersOpen;
  } else if (window.matchMedia('(max-width: 560px)').matches) {
    options.advancedFilters.open = false;
  }
  const routeLocale = window.location.pathname.match(
    /index\.([a-z]{2,3}(?:-[A-Z]{2})?)\.html$/
  )?.[1];
  const initialUiLocale =
    routeLocale ?? document.documentElement.dataset.locale ?? 'en';
  const initialSearchLocale =
    routeLocale ??
    (Object.hasOwn(options.preferences, 'locale')
      ? options.preferences.locale
      : initialUiLocale);
  await options.loadUiTranslations(
    initialUiLocale,
    document.documentElement.dir === 'rtl'
  );
  await options.loadSearchLanguages(initialSearchLocale);
  await options.loadData();
  options.drawList();
  options.finishExplorerLoading();
  options.applyDialogUrlState();
  options.setUrlStateReady(true);
  options.syncUrlState();
}
