import {
  closeFilterPicker as closeFilterPickerHelper,
  displayUnicodeSubGroupName as displayUnicodeSubGroupNameHelper,
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
    state.searchLabels.get()[options.unicodeGroupLabelKeys[name]] ?? name;

  const displayUnicodeSubGroupName = (name: string) =>
    displayUnicodeSubGroupNameHelper(name, {
      searchSubgroupLabels: state.searchSubgroupLabels.get(),
      searchLabels: state.searchLabels.get(),
      unicodeSubgroupLabelKeys: options.unicodeSubgroupLabelKeys,
    });

  const buildRepresentatives = () => {
    const representatives = buildCategoryRepresentatives({
      groups: state.groups.get(),
      items: state.items.get(),
      proposedVersions: state.proposedVersionManifests.get(),
      releasedVersions: state.versionManifests.get(),
      subGroupKey: subGroupSelectionKey,
      subGroups: state.subGroups.get(),
      versionKeys: state.versionKeys.get(),
    });
    state.groupRepresentativeEmoji.set(representatives.groups);
    state.subGroupRepresentativeEmoji.set(representatives.subGroups);
  };

  const getGroupRepresentativeEmoji = (group: string) =>
    state.groupRepresentativeEmoji.get().get(group) ?? "";

  const getSubGroupRepresentativeEmoji = (group: string, subGroup: string) =>
    state.subGroupRepresentativeEmoji
      .get()
      .get(subGroupSelectionKey(group, subGroup)) ?? "";

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
    availableGroups: state.availableGroups.get,
    availableSequenceTypes: state.availableSequenceTypes.get,
    availableSubGroups: state.availableSubGroups.get,
    compactGroupChoices: options.compactGroupChoices,
    compactGroupLabel: options.compactGroupLabel,
    compactSequenceChoices: options.compactSequenceChoices,
    compactSequenceLabel: options.compactSequenceLabel,
    compactSubGroupChoices: options.compactSubGroupChoices,
    compactSubGroupLabel: options.compactSubGroupLabel,
    displayGroupName,
    displayUnicodeSubGroupName,
    drawList: options.drawList,
    getGroupRepresentativeEmoji,
    getSubGroupRepresentativeEmoji,
    getOrderMode: state.orderMode.get,
    getVersionKeys: options.getVersionKeys,
    groupFilterDialog: options.groupFilterDialog,
    groupPickerTrigger: options.groupPickerTrigger,
    groupSelector: options.groupSelector,
    groups: state.groups.get(),
    items: state.items.get(),
    selectedGroup: state.selectedGroup.get(),
    selectedSequenceType: state.selectedSequenceType.get,
    selectedSubGroup: state.selectedSubGroup.get,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeEmoji: options.sequenceTypeEmoji,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTypeOrder: options.sequenceTypeOrder,
    sequenceTypeSelector: options.sequenceTypeSelector,
    setAvailableCategoryKeys: state.availableCategoryKeys.set,
    setAvailableGroups: state.availableGroups.set,
    setAvailableSequenceTypes: state.availableSequenceTypes.set,
    setAvailableSubGroups: state.availableSubGroups.set,
    setSelectedGroup: state.selectedGroup.set,
    setSelectedSequenceType: state.selectedSequenceType.set,
    setSelectedSubGroup: state.selectedSubGroup.set,
    subGroupFilterDialog: options.subGroupFilterDialog,
    subGroupPickerTrigger: options.subGroupPickerTrigger,
    subGroupSelectionKey,
    subGroupSelector: options.subGroupSelector,
    subGroups: state.subGroups.get,
    translate: options.translate,
    versionKeys: state.versionKeys.get,
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
    buildRepresentatives,
    closeFilterPicker: closeFilterPickerHelper,
    displayGroupName,
    displayUnicodeSubGroupName,
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
