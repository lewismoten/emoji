import * as state from "../../state.js";

type ClassListLike = {
  add(name: string): void;
  remove(name: string): void;
  toggle(name: string, force?: boolean): void;
};
type FilterFieldLike = {
  hidden: boolean;
  classList: ClassListLike;
};

export function updateAvailableCategories(options: {
  groups: string[];
  items: Array<{
    group: string;
    key: string;
    sequenceType: string;
    unicodeSubGroup: string;
  }>;
  selectedGroup: string;
  selectedSequenceType: string;
  selectedSubGroup: string;
  sequenceTypeOrder: string[];
  subGroupSelectionKey: (group: string, subGroup: string) => string;
  versionKeys: Map<string, Set<string>>;
  includedVersionKeys: Set<string>;
}) {
  const availableCategoryKeys =
    options.includedVersionKeys.size === 0 && options.versionKeys.size === 0
      ? new Set(options.items.map((item) => item.key))
      : options.includedVersionKeys;
  const groupNames = new Set<string>();
  const subgroupNames: Record<string, Set<string>> = {};
  options.items.forEach((item) => {
    if (!availableCategoryKeys.has(item.key)) return;
    groupNames.add(item.group);
    if (!subgroupNames[item.group]) subgroupNames[item.group] = new Set();
    subgroupNames[item.group].add(item.unicodeSubGroup);
  });
  const availableGroups = options.groups.filter((group) =>
    groupNames.has(group),
  );
  const availableSubGroups = Object.fromEntries(
    availableGroups.map((group) => [
      group,
      state.subGroups.get(group).filter((subGroup) =>
        subgroupNames[group]?.has(subGroup),
      ),
    ]),
  ) as Record<string, string[]>;
  const availableSequenceTypes = options.sequenceTypeOrder.filter((type) =>
    options.items.some(
      (item) =>
        availableCategoryKeys.has(item.key) && item.sequenceType === type,
    ),
  );
  let selectedSequenceType = options.selectedSequenceType;
  if (
    selectedSequenceType &&
    !availableSequenceTypes.includes(selectedSequenceType)
  ) {
    selectedSequenceType = "";
  }

  let selectedGroup = options.selectedGroup;
  let selectedSubGroup = options.selectedSubGroup;
  if (selectedGroup && !availableGroups.includes(selectedGroup)) {
    selectedGroup = "";
    selectedSubGroup = "";
  } else if (selectedSubGroup) {
    const separatorIndex = selectedSubGroup.indexOf("::");
    const group =
      separatorIndex === -1 ? "" : selectedSubGroup.slice(0, separatorIndex);
    const subGroup =
      separatorIndex === -1 ? "" : selectedSubGroup.slice(separatorIndex + 2);
    if (
      group !== selectedGroup ||
      !availableSubGroups[group]?.includes(subGroup)
    ) {
      selectedSubGroup = "";
    }
  }

  return {
    availableCategoryKeys,
    availableGroups,
    availableSequenceTypes,
    availableSubGroups,
    selectedGroup,
    selectedSequenceType,
    selectedSubGroup,
  };
}

export function renderCategoryFilterLayout(options: {
  compactGroupChoices?: HTMLElement;
  compactSequenceChoices?: HTMLElement;
  compactSubGroupChoices?: HTMLElement;
  groupField?: FilterFieldLike | null;
  selectedGroup: string;
  sequenceField?: FilterFieldLike | null;
  sequenceMode: boolean;
  subGroupField?: FilterFieldLike | null;
}) {
  options.groupField?.classList.toggle(
    "has-choice-buttons",
    Boolean(options.compactGroupChoices),
  );
  options.subGroupField?.classList.toggle(
    "has-choice-buttons",
    Boolean(options.compactSubGroupChoices),
  );
  options.sequenceField?.classList.toggle(
    "has-choice-buttons",
    Boolean(options.compactSequenceChoices),
  );
  if (options.groupField) options.groupField.hidden = options.sequenceMode;
  if (options.subGroupField) {
    options.subGroupField.hidden =
      options.sequenceMode || !options.selectedGroup;
  }
  if (options.sequenceField)
    options.sequenceField.hidden = !options.sequenceMode;
}
