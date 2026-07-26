export function syncSavedListFocus(list: HTMLElement | null, active?: HTMLElement | null) {
  if (!list) return;
  const buttons = Array.from(list.querySelectorAll<HTMLElement>('button[data-saved-emoji]'));
  if (buttons.length === 0) return;
  const nextActive =
    active && buttons.includes(active)
      ? active
      : buttons.find(button => button.tabIndex === 0) ?? buttons[0];
  buttons.forEach(button => {
    button.tabIndex = button === nextActive ? 0 : -1;
  });
}

export function closestVerticalSavedEmoji(
  current: HTMLElement,
  buttons: HTMLElement[],
  direction: number
) {
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
        score: Math.abs(centerY - currentY) * 1000 + Math.abs(centerX - currentX)
      };
    })
    .sort((left, right) => left.score - right.score)[0]?.button;
}

export function createThemeChoiceKeyDownHandler(choices: any[]) {
  return (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
      return;
    const currentIndex = choices.indexOf(event.currentTarget);
    if (currentIndex === -1 || choices.length === 0) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = choices.length - 1;
    else {
      const rtl = document.documentElement.dir === 'rtl';
      const backwards =
        event.key === 'ArrowUp' || event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
      nextIndex = (currentIndex + (backwards ? -1 : 1) + choices.length) % choices.length;
    }
    const nextChoice = choices[nextIndex];
    if (!nextChoice) return;
    nextChoice.focus();
    nextChoice.click();
  };
}

function getModifierGroupCheckboxes(checkbox: HTMLElement | null) {
  const fieldset = checkbox?.closest('fieldset');
  if (!fieldset) return [] as HTMLInputElement[];
  return Array.from(
    fieldset.querySelectorAll<HTMLInputElement>('input.skin-tone, input.hair, input.gender')
  );
}

function syncModifierGroupFocus(
  checkboxes: HTMLInputElement[],
  active?: HTMLInputElement | null
) {
  if (checkboxes.length === 0) return;
  const nextActive =
    active && checkboxes.includes(active)
      ? active
      : checkboxes.find(checkbox => checkbox.checked) ?? checkboxes[0];
  checkboxes.forEach(checkbox => {
    checkbox.tabIndex = checkbox === nextActive ? 0 : -1;
  });
}

function onModifierFocus(event: FocusEvent) {
  const checkbox = event.target as HTMLInputElement | null;
  if (!checkbox?.matches?.('input.skin-tone, input.hair, input.gender')) return;
  syncModifierGroupFocus(getModifierGroupCheckboxes(checkbox), checkbox);
}

function onModifierKeyDown(event: KeyboardEvent) {
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
      return { checkbox: item, index, centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2 };
    });
    const rows: typeof positioned[] = [];
    positioned.forEach(item => {
      const row = rows.find(candidate => Math.abs(candidate[0].centerY - item.centerY) <= rowTolerance);
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
      nextIndex = row[(columnIndex + offset + row.length) % row.length]?.index ?? currentIndex;
    } else {
      const targetRow = rows[rowIndex + (event.key === 'ArrowUp' ? -1 : 1)];
      if (!targetRow) return;
      const currentItem = rows[rowIndex][columnIndex];
      nextIndex =
        targetRow
          .map(item => ({ index: item.index, score: Math.abs(item.centerX - currentItem.centerX) }))
          .sort((left, right) => left.score - right.score)[0]?.index ?? currentIndex;
    }
  }
  const nextCheckbox = checkboxes[nextIndex];
  if (!nextCheckbox) return;
  syncModifierGroupFocus(checkboxes, nextCheckbox);
  nextCheckbox.focus();
}

export function bindModifierGroup(
  checkboxes: HTMLInputElement[],
  onChange: (event: Event) => void
) {
  syncModifierGroupFocus(checkboxes);
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', event => {
      onChange(event);
      syncModifierGroupFocus(checkboxes, event.currentTarget as HTMLInputElement);
    });
    checkbox.addEventListener('focus', onModifierFocus);
    checkbox.addEventListener('keydown', onModifierKeyDown);
  });
}

export function bindSavedDialogInteractions(options: any) {
  options.savedDialog?.addEventListener('click', (event: any) => {
    const button = event.target.closest('[data-saved-emoji]');
    if (!button) return;
    const navigationKeys =
      button.dataset.savedSource === 'favorites'
        ? options.favoriteEmojiKeys()
        : options.copiedEmojiKeys();
    options.closePanel(options.savedDialog, options.suppressedPanelCloses);
    options.showEmoji(button.dataset.savedEmoji, true, navigationKeys, 'details', 'favorites');
  });
  options.savedDialog?.addEventListener('focusin', (event: any) => {
    const button = event.target?.closest?.('[data-saved-emoji]');
    const list = button?.closest?.('.saved-emoji-list') as HTMLElement | null;
    if (!button || !list) return;
    syncSavedListFocus(list, button);
  });
  options.savedDialog?.addEventListener('keydown', (event: KeyboardEvent) => {
    const button = (event.target as HTMLElement | null)?.closest?.<HTMLElement>('[data-saved-emoji]');
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
    const buttons = Array.from(list.querySelectorAll<HTMLElement>('button[data-saved-emoji]'));
    if (buttons.length === 0) return;
    event.preventDefault();
    let target: HTMLElement | undefined;
    if (event.key === 'Home') target = buttons[0];
    else if (event.key === 'End') target = buttons.at(-1);
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const allButtons = Array.from(
        options.savedDialog.querySelectorAll('button[data-saved-emoji]')
      ) as HTMLElement[];
      target = closestVerticalSavedEmoji(button, allButtons, event.key === 'ArrowDown' ? 1 : -1);
    } else {
      const rtl = document.documentElement.dir === 'rtl';
      const direction = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? 1 : -1;
      target = buttons[buttons.indexOf(button) + direction];
    }
    if (!target) return;
    syncSavedListFocus(list, target);
    target.focus();
  });
}
