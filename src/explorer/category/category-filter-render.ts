import {
  renderCategoryFilterLayout,
  updateAvailableCategories as updateAvailableCategoriesHelper,
} from "./category-version.js";
import {
  focusCompactChoice,
  populateGroupFilter,
  populateSequenceTypeFilter,
  populateSubGroupFilter,
} from "../filters/filter-picker.js";
import {
  renderGroupPickerGrid,
  renderSequencePickerGrid,
  renderSubGroupPickerGrid,
} from "./category-picker-grid-control.js";

export function createCategoryFilterRenderer(options: any) {
  const getActiveChoice = () =>
    typeof document === "undefined"
      ? null
      : (document.activeElement?.closest?.('[role="radio"]') as
          | HTMLElement
          | null);

  const availableSubGroupParents = () =>
    options.selectedGroup() &&
    options.availableGroups().includes(options.selectedGroup())
      ? [options.selectedGroup()]
      : [];

  const updateAvailableCategories = () => {
    const next = updateAvailableCategoriesHelper({
      groups: options.groups(),
      items: options.items(),
      selectedGroup: options.selectedGroup(),
      selectedSequenceType: options.selectedSequenceType(),
      selectedSubGroup: options.selectedSubGroup(),
      sequenceTypeOrder: options.sequenceTypeOrder,
      subGroupSelectionKey: options.subGroupSelectionKey,
    });
    options.setAvailableCategoryKeys(next.availableCategoryKeys);
    options.setAvailableGroups(next.availableGroups);
    options.setAvailableSubGroups(next.availableSubGroups);
    options.setAvailableSequenceTypes(next.availableSequenceTypes);
    options.setSelectedGroup(next.selectedGroup);
    options.setSelectedSequenceType(next.selectedSequenceType);
    options.setSelectedSubGroup(next.selectedSubGroup);
  };

  const populateGroup = () =>
    populateGroupFilter({
      availableGroups: options.availableGroups(),
      displayGroupName: options.displayGroupName,
      getGroupRepresentativeEmoji: options.getGroupRepresentativeEmoji,
      groupSelector: options.groupSelector(),
      selectedGroup: options.selectedGroup(),
      translate: options.translate,
    });

  const populateSubGroup = () =>
    populateSubGroupFilter({
      availableSubGroupParents: availableSubGroupParents(),
      availableSubGroups: options.availableSubGroups(),
      displayGroupName: options.displayGroupName,
      getSubGroupRepresentativeEmoji: options.getSubGroupRepresentativeEmoji,
      selectedSubGroup: options.selectedSubGroup(),
      subGroupSelectionKey: options.subGroupSelectionKey,
      subGroupSelector: options.subGroupSelector(),
      translate: options.translate,
    });

  const populateSequenceType = () =>
    populateSequenceTypeFilter({
      availableSequenceTypes: options.availableSequenceTypes(),
      selectedSequenceType: options.selectedSequenceType(),
      sequenceTranslationKeys: options.sequenceTranslationKeys,
      sequenceTypeEmoji: options.sequenceTypeEmoji,
      sequenceTypeLabels: options.sequenceTypeLabels,
      sequenceTypeSelector: options.sequenceTypeSelector(),
      translate: options.translate,
    });

  const renderCompactGroupChoices = () => {
    renderGroupPickerGrid({
      availableGroups: options.availableGroups(),
      compactGroupChoices: options.compactGroupChoices(),
      compactGroupLabel: options.compactGroupLabel(),
      displayGroupName: options.displayGroupName,
      drawList: options.drawList,
      getGroupRepresentativeEmoji: options.getGroupRepresentativeEmoji,
      groupFilterDialog: options.groupFilterDialog(),
      groupPickerTrigger: options.groupPickerTrigger(),
      rerender: renderCategoryFilters,
      selectedGroup: options.selectedGroup(),
      setSelectedGroup: options.setSelectedGroup,
      setSelectedSubGroup: options.setSelectedSubGroup,
      translate: options.translate,
    });
  };

  const renderCompactSubGroupChoices = () => {
    renderSubGroupPickerGrid({
      availableSubGroupParents: availableSubGroupParents(),
      availableSubGroups: options.availableSubGroups(),
      compactSubGroupChoices: options.compactSubGroupChoices(),
      compactSubGroupLabel: options.compactSubGroupLabel(),
      drawList: options.drawList,
      getSubGroupRepresentativeEmoji: options.getSubGroupRepresentativeEmoji,
      rerender: renderCategoryFilters,
      selectedGroup: options.selectedGroup(),
      selectedSubGroup: options.selectedSubGroup(),
      setSelectedSubGroup: options.setSelectedSubGroup,
      subGroupFilterDialog: options.subGroupFilterDialog(),
      subGroupPickerTrigger: options.subGroupPickerTrigger(),
      subGroupSelectionKey: options.subGroupSelectionKey,
      translate: options.translate,
    });
  };

  const renderCompactSequenceChoices = () => {
    renderSequencePickerGrid({
      availableSequenceTypes: options.availableSequenceTypes(),
      compactSequenceChoices: options.compactSequenceChoices(),
      compactSequenceLabel: options.compactSequenceLabel(),
      drawList: options.drawList,
      rerender: renderCategoryFilters,
      selectedSequenceType: options.selectedSequenceType(),
      sequenceTranslationKeys: options.sequenceTranslationKeys,
      sequenceTypeEmoji: options.sequenceTypeEmoji,
      sequenceTypeLabels: options.sequenceTypeLabels,
      setSelectedSequenceType: options.setSelectedSequenceType,
      translate: options.translate,
    });
  };

  const renderCategoryFilters = () => {
    const activeChoice = getActiveChoice();
    const focusedChoices = activeChoice?.closest(".compact-group-choices")
      ? "group"
      : activeChoice?.closest(".compact-subgroup-choices")
        ? "subgroup"
        : activeChoice?.closest(".compact-sequence-choices")
          ? "sequence"
          : "";
    const focusedValue = activeChoice?.dataset.value;
    updateAvailableCategories();
    renderCategoryFilterLayout({
      compactGroupChoices: options.compactGroupChoices(),
      compactSequenceChoices: options.compactSequenceChoices(),
      compactSubGroupChoices: options.compactSubGroupChoices(),
      groupField: options.groupSelector().closest(".filter-field"),
      selectedGroup: options.selectedGroup(),
      sequenceField: options.sequenceTypeSelector().closest(".filter-field"),
      sequenceMode: options.getOrderMode() === "sequence",
      subGroupField: options.subGroupSelector().closest(".filter-field"),
    });
    populateGroup();
    populateSubGroup();
    populateSequenceType();
    renderCompactGroupChoices();
    renderCompactSubGroupChoices();
    renderCompactSequenceChoices();
    const containers: Record<string, HTMLElement | undefined> = {
      group: options.compactGroupChoices(),
      subgroup: options.compactSubGroupChoices(),
      sequence: options.compactSequenceChoices(),
    };
    if (focusedChoices && focusedValue)
      focusCompactChoice(
        containers[focusedChoices] as HTMLElement,
        focusedValue,
      );
  };

  return { renderCategoryFilters, updateAvailableCategories };
}
