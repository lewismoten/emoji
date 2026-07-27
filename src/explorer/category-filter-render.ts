import {
  renderCategoryFilterLayout,
  updateAvailableCategories as updateAvailableCategoriesHelper,
} from "./category-version.js";
import {
  closeFilterPicker,
  focusCompactChoice,
  makeCompactChoice,
  populateGroupFilter,
  populateSequenceTypeFilter,
  populateSubGroupFilter,
  renderFilterPickerTrigger,
} from "./filter-picker.js";

export function createCategoryFilterRenderer(options: any) {
  const availableSubGroupParents = () =>
    options.selectedGroup() &&
    options.availableGroups().includes(options.selectedGroup())
      ? [options.selectedGroup()]
      : [];

  const updateAvailableCategories = () => {
    const next = updateAvailableCategoriesHelper({
      groups: options.groups(),
      includedVersionKeys: options.getVersionKeys(),
      items: options.items(),
      selectedGroup: options.selectedGroup(),
      selectedSequenceType: options.selectedSequenceType(),
      selectedSubGroup: options.selectedSubGroup(),
      sequenceTypeOrder: options.sequenceTypeOrder,
      subGroupSelectionKey: options.subGroupSelectionKey,
      subGroups: options.subGroups(),
      versionKeys: options.versionKeys(),
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
      displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
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
    const container = options.compactGroupChoices();
    if (!container) return;
    const selectedGroup = options.selectedGroup();
    options.compactGroupLabel() &&
      (options.compactGroupLabel().textContent = selectedGroup
        ? options.displayGroupName(selectedGroup)
        : options.translate("all", "All"));
    const choices = [
      { name: "", emoji: "🌐", label: options.translate("all", "All") },
      ...options.availableGroups().map((name: string) => ({
        name,
        emoji: options.getGroupRepresentativeEmoji(name),
        label: options.displayGroupName(name),
      })),
    ];
    const selectedLabel = selectedGroup
      ? options.displayGroupName(selectedGroup)
      : options.translate("all", "All");
    renderFilterPickerTrigger(
      options.groupPickerTrigger(),
      options.translate("group", "Group"),
      selectedGroup ? options.getGroupRepresentativeEmoji(selectedGroup) : "🌐",
      selectedLabel,
    );
    container.replaceChildren(
      ...choices.map(({ name, emoji, label }) =>
        makeCompactChoice({
          value: name,
          emoji,
          label,
          selected: selectedGroup === name,
          onSelect() {
            options.setSelectedGroup(name);
            options.setSelectedSubGroup("");
            renderCategoryFilters();
            options.drawList();
            closeFilterPicker(
              options.groupFilterDialog(),
              options.groupPickerTrigger(),
            );
          },
        }),
      ),
    );
  };

  const renderCompactSubGroupChoices = () => {
    const container = options.compactSubGroupChoices();
    if (!container) return;
    const selectedSubGroup = options.selectedSubGroup();
    const separatorIndex = selectedSubGroup.indexOf("::");
    const selectedName =
      separatorIndex === -1 ? "" : selectedSubGroup.slice(separatorIndex + 2);
    if (options.compactSubGroupLabel()) {
      options.compactSubGroupLabel().textContent = selectedName
        ? options.displayUnicodeSubGroupName(selectedName)
        : options.translate("all", "All");
    }
    const choices = availableSubGroupParents().flatMap((group: string) =>
      options
        .availableSubGroups()
        [group].map((name: string) => ({ group, name })),
    );
    renderFilterPickerTrigger(
      options.subGroupPickerTrigger(),
      options.translate("subgroup", "Sub-group"),
      selectedName
        ? options.getSubGroupRepresentativeEmoji(
            options.selectedGroup(),
            selectedName,
          )
        : "🌐",
      selectedName
        ? options.displayUnicodeSubGroupName(selectedName)
        : options.translate("all", "All"),
    );
    const allChoice = makeCompactChoice({
      value: "",
      emoji: "🌐",
      label: options.translate("all", "All"),
      selected: selectedSubGroup === "",
      onSelect() {
        options.setSelectedSubGroup("");
        renderCategoryFilters();
        options.drawList();
        closeFilterPicker(
          options.subGroupFilterDialog(),
          options.subGroupPickerTrigger(),
        );
      },
    });
    container.replaceChildren(
      allChoice,
      ...choices.map(({ group, name }: any) =>
        makeCompactChoice({
          value: options.subGroupSelectionKey(group, name),
          emoji: options.getSubGroupRepresentativeEmoji(group, name),
          label: options.displayUnicodeSubGroupName(name),
          selected:
            selectedSubGroup === options.subGroupSelectionKey(group, name),
          onSelect() {
            options.setSelectedSubGroup(
              options.subGroupSelectionKey(group, name),
            );
            renderCategoryFilters();
            options.drawList();
            closeFilterPicker(
              options.subGroupFilterDialog(),
              options.subGroupPickerTrigger(),
            );
          },
        }),
      ),
    );
  };

  const renderCompactSequenceChoices = () => {
    const container = options.compactSequenceChoices();
    if (!container) return;
    const selectedType = options.selectedSequenceType();
    const labelFor = (type: string) =>
      type
        ? options.translate(
            options.sequenceTranslationKeys[type],
            options.sequenceTypeLabels[type],
          )
        : options.translate("all", "All");
    options.compactSequenceLabel() &&
      (options.compactSequenceLabel().textContent = labelFor(selectedType));
    const choices = [
      { type: "", emoji: "🌐", label: labelFor("") },
      ...options.availableSequenceTypes().map((type: string) => ({
        type,
        emoji: options.sequenceTypeEmoji[type],
        label: labelFor(type),
      })),
    ];
    container.replaceChildren(
      ...choices.map(({ type, emoji, label }) =>
        makeCompactChoice({
          value: type,
          emoji,
          label,
          selected: selectedType === type,
          onSelect() {
            options.setSelectedSequenceType(type);
            renderCategoryFilters();
            options.drawList();
            focusCompactChoice(container, type);
          },
        }),
      ),
    );
  };

  const renderCategoryFilters = () => {
    const activeChoice = document.activeElement?.closest?.(
      '[role="radio"]',
    ) as HTMLElement | null;
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
