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

/** Own category selection, localized labels, and category filter rendering. */
export function createCategoryController(options: any) {
  const subGroupSelectionKey = (group: string, subGroup: string) =>
    `${group}::${subGroup}`;

  const displayGroupName = (name: string) =>
    options.state().searchLabels[options.unicodeGroupLabelKeys[name]] ?? name;

  const displayUnicodeSubGroupName = (name: string) =>
    displayUnicodeSubGroupNameHelper(name, {
      searchSubgroupLabels: options.state().searchSubgroupLabels,
      searchLabels: options.state().searchLabels,
      unicodeSubgroupLabelKeys: options.unicodeSubgroupLabelKeys,
    });

  const buildRepresentatives = () => {
    const state = options.state();
    const representatives = buildCategoryRepresentatives({
      groups: state.groups,
      items: state.items,
      proposedVersions: state.proposedVersionManifests,
      releasedVersions: state.versionManifests,
      subGroupKey: subGroupSelectionKey,
      subGroups: state.subGroups,
      versionKeys: state.versionKeys,
    });
    state.groupRepresentativeEmoji = representatives.groups;
    state.subGroupRepresentativeEmoji = representatives.subGroups;
  };

  const getGroupRepresentativeEmoji = (group: string) =>
    options.state().groupRepresentativeEmoji.get(group) ?? "";

  const getSubGroupRepresentativeEmoji = (group: string, subGroup: string) =>
    options
      .state()
      .subGroupRepresentativeEmoji.get(subGroupSelectionKey(group, subGroup)) ??
    "";

  const onGroupSelectorChange = () => {
    const state = options.state();
    state.selectedGroup = options.groupSelector().value;
    state.selectedSubGroup = "";
    renderCategoryFilters();
    options.drawList();
  };

  const onSubGroupSelectorChange = () => {
    options.state().selectedSubGroup = options.subGroupSelector().value;
    renderCategoryFilters();
    options.drawList();
  };

  const onSequenceTypeSelectorChange = () => {
    options.state().selectedSequenceType = options.sequenceTypeSelector().value;
    renderCategoryFilters();
    options.drawList();
  };

  const onOrderModeChange = (event: any) => {
    if (
      event.currentTarget.dataset.order === "sequence" &&
      !options.developerModeEnabled()
    )
      return;
    const state = options.state();
    state.orderMode = event.currentTarget.dataset.order;
    preferences.setString("order", state.orderMode);
    options.orderButtons().forEach((button: HTMLButtonElement) => {
      const active = button.dataset.order === state.orderMode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderCategoryFilters();
    options.drawList();
  };

  const categoryFilterRenderer = createCategoryFilterRenderer({
    availableGroups: () => options.state().availableGroups,
    availableSequenceTypes: () => options.state().availableSequenceTypes,
    availableSubGroups: () => options.state().availableSubGroups,
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
    getOrderMode: () => options.state().orderMode,
    getVersionKeys: options.getVersionKeys,
    groupFilterDialog: options.groupFilterDialog,
    groupPickerTrigger: options.groupPickerTrigger,
    groupSelector: options.groupSelector,
    groups: () => options.state().groups,
    items: () => options.state().items,
    selectedGroup: () => options.state().selectedGroup,
    selectedSequenceType: () => options.state().selectedSequenceType,
    selectedSubGroup: () => options.state().selectedSubGroup,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeEmoji: options.sequenceTypeEmoji,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTypeOrder: options.sequenceTypeOrder,
    sequenceTypeSelector: options.sequenceTypeSelector,
    setAvailableCategoryKeys: (value: string[]) =>
      (options.state().availableCategoryKeys = value),
    setAvailableGroups: (value: string[]) =>
      (options.state().availableGroups = value),
    setAvailableSequenceTypes: (value: string[]) =>
      (options.state().availableSequenceTypes = value),
    setAvailableSubGroups: (value: string[]) =>
      (options.state().availableSubGroups = value),
    setSelectedGroup: (value: string) =>
      (options.state().selectedGroup = value),
    setSelectedSequenceType: (value: string) =>
      (options.state().selectedSequenceType = value),
    setSelectedSubGroup: (value: string) =>
      (options.state().selectedSubGroup = value),
    subGroupFilterDialog: options.subGroupFilterDialog,
    subGroupPickerTrigger: options.subGroupPickerTrigger,
    subGroupSelectionKey,
    subGroupSelector: options.subGroupSelector,
    subGroups: () => options.state().subGroups,
    translate: options.translate,
    versionKeys: () => options.state().versionKeys,
  });
  const { renderCategoryFilters, updateAvailableCategories } =
    categoryFilterRenderer;

  const refreshLocalizedLabels = () => {
    if (options.state().groups.length === 0) return;
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
