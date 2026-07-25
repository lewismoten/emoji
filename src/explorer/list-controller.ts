import { filterEmojiKeys } from './emoji-filter.js';

export function createListController(options: any) {
  let timer: number | undefined;
  const checked = (checkboxes: HTMLInputElement[]) =>
    checkboxes.filter(item => item.checked).map(item => item.value);
  const draw = () => {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
    const focusedCell = document.activeElement?.closest?.('[data-emoji-key]');
    const keys = options.orderedKeys(
      filterEmojiKeys({
        allIds: options.allIds(),
        byId: options.byId(),
        emojiByKey: options.emojiByKey(),
        hairModifiers: checked(options.hairCheckboxes()),
        includedVersionKeys: options.getVersionKeys(),
        items: options.items(),
        locale: options.selectedSearchLocale() || undefined,
        orderMode: options.orderMode(),
        searchAnnotations: options.searchAnnotations(),
        searchText: options.searchText().value,
        selectedGenders: checked(options.genderCheckboxes()),
        selectedGroup: options.items().length === 0 ? '' : options.selectedGroup(),
        selectedSequenceType: options.selectedSequenceType(),
        selectedSubGroup: options.items().length === 0 ? '' : options.selectedSubGroup(),
        skinToneModifiers: checked(options.skinToneCheckboxes()),
        subGroupSelectionKey: options.subGroupSelectionKey
      })
    );
    options.setDisplayedKeys(keys);
    if (!options.focusedEmojiKey() || !keys.includes(options.focusedEmojiKey()))
      options.setFocusedEmojiKey(keys[0] ?? '');
    options.renderEmojiList(keys, Boolean(focusedCell));
    options.matchCount().innerText = options.formatNumber(keys.length);
    options.updateFilterSummary();
    options.updateDialogNavigation();
    options.syncUrlState();
  };
  const schedule = () => {
    options.nextRenderGeneration();
    if (timer !== undefined) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = undefined;
      draw();
    }, 200);
  };
  return { draw, schedule };
}
