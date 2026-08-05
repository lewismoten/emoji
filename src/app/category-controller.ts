import {
  closeFilterPicker as closeFilterPickerHelper,
  focusCompactChoice as focusCompactChoiceHelper,
  onCompactChoiceKeyDown as onCompactChoiceKeyDownHelper,
  openFilterPicker as openFilterPickerHelper,
} from "../explorer/filters/filter-picker.js";
import { createCategoryFilterRenderer } from "../explorer/category/category-filter-render.js";
import { buildCategoryRepresentatives } from "../explorer/category/category-representatives.js";
import * as preferences from "../preferences.js";
import * as state from "../state.js";
import * as aria from "../utils/aria.js";

/** Own category selection, localized labels, and category filter rendering. */
export function createCategoryController(options: any) {
  const subGroupSelectionKey = (group: string, subGroup: string) =>
    `${group}::${subGroup}`;

  const displayGroupName = (name: string) =>
    state.searchLabels.get(options.unicodeGroupLabelKeys[name]) ?? name;

  const getGroupRepresentativeEmoji = (group: string) =>
    state.groupRepresentativeEmoji.get(group) ?? "";

  const getSubGroupRepresentativeEmoji = (group: string, subGroup: string) =>
    state.subGroupRepresentativeEmoji.get(
      subGroupSelectionKey(group, subGroup),
    ) ?? "";

  const onGroupSelectorChange = () => {
    state.selectedGroup.set(options.groupSelector().value);
    state.selectedSubGroup.set("");
    renderCategoryFilters();
    options.drawList();
  };

  const onSubGroupSelectorChange = () => {
    state.selectedSubGroup.set(options.subGroupSelector().value);
    renderCategoryFilters();
    options.drawList();
  };

  const onSequenceTypeSelectorChange = () => {
    state.selectedSequenceType.set(options.sequenceTypeSelector().value);
    renderCategoryFilters();
    options.drawList();
  };

  const onOrderModeChange = (event: any) => {
    if (
      event.currentTarget.dataset.order === "sequence" &&
      !options.developerModeEnabled()
    )
      return;
    state.orderMode.set(event.currentTarget.dataset.order);
    preferences.setString("order", state.orderMode.get());
    options.orderButtons().forEach((button: HTMLButtonElement) => {
      const active = button.dataset.order === state.orderMode.get();
      button.classList.toggle("is-active", active);
      aria.setPressed(button, active);
    });
    renderCategoryFilters();
    options.drawList();
  };

  const categoryFilterRenderer = createCategoryFilterRenderer({
    compactGroupChoices: options.compactGroupChoices,
    compactGroupLabel: options.compactGroupLabel,
    compactSequenceChoices: options.compactSequenceChoices,
    compactSequenceLabel: options.compactSequenceLabel,
    compactSubGroupChoices: options.compactSubGroupChoices,
    compactSubGroupLabel: options.compactSubGroupLabel,
    displayGroupName,
    drawList: options.drawList,
    getGroupRepresentativeEmoji,
    getSubGroupRepresentativeEmoji,
    getVersionKeys: options.getVersionKeys,
    groupFilterDialog: options.groupFilterDialog,
    groupPickerTrigger: options.groupPickerTrigger,
    groupSelector: options.groupSelector,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeEmoji: options.sequenceTypeEmoji,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTypeOrder: options.sequenceTypeOrder,
    sequenceTypeSelector: options.sequenceTypeSelector,
    subGroupFilterDialog: options.subGroupFilterDialog,
    subGroupPickerTrigger: options.subGroupPickerTrigger,
    subGroupSelectionKey,
    subGroupSelector: options.subGroupSelector,
    translate: options.translate,
  });
  const { renderCategoryFilters, updateAvailableCategories } =
    categoryFilterRenderer;

  const refreshLocalizedLabels = () => {
    if (state.groups.get().length === 0) return;
    renderCategoryFilters();
    options.syncVersionRange();
    options.drawList();
  };

  return {
    buildRepresentatives: buildCategoryRepresentatives,
    closeFilterPicker: closeFilterPickerHelper,
    displayGroupName,
    focusCompactChoice: focusCompactChoiceHelper,
    getGroupRepresentativeEmoji,
    getSubGroupRepresentativeEmoji,
    onCompactChoiceKeyDown: onCompactChoiceKeyDownHelper,
    onGroupSelectorChange,
    onOrderModeChange,
    onSequenceTypeSelectorChange,
    onSubGroupSelectorChange,
    openFilterPicker: openFilterPickerHelper,
    refreshLocalizedLabels,
    renderCategoryFilters,
    subGroupSelectionKey,
    updateAvailableCategories,
  };
}
