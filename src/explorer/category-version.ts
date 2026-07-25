type VersionManifest = {
  version: string;
  stage?: string;
  status?: string;
};
type CheckboxLike = {
  checked: boolean;
};
type ClassListLike = {
  add(name: string): void;
  remove(name: string): void;
  toggle(name: string, force?: boolean): void;
};
type FilterFieldLike = {
  hidden: boolean;
  classList: ClassListLike;
};
type OutputLike = {
  value: string;
  classList: ClassListLike;
};
type ButtonLike = {
  disabled: boolean;
};
type SelectOptionLike = {
  value: string;
  text?: string;
};
type SelectLike = {
  disabled: boolean;
  value: string;
  options: ArrayLike<SelectOptionLike>;
  closest(selector: string): FilterFieldLike | null;
};
type RangeLike = {
  disabled: boolean;
  max: string;
  value: string;
  setAttribute(name: string, value: string): void;
};

export function versionSliderLabel(
  version: string,
  proposedVersionManifests: VersionManifest[]
) {
  const proposed = proposedVersionManifests.find(item => item.version === version);
  if (!proposed) return `Emoji ${version}`;
  return `✨ Emoji ${version} ${proposed.stage ?? proposed.status ?? 'draft'}`;
}

export function syncVersionRange(options: {
  proposedVersionManifests: VersionManifest[];
  updateModifierAvailability: () => void;
  versionNext?: ButtonLike;
  versionPrevious?: ButtonLike;
  versionRange?: RangeLike;
  versionRangeValue?: OutputLike;
  versionSelector: SelectLike;
}) {
  const {
    proposedVersionManifests,
    updateModifierAvailability,
    versionNext,
    versionPrevious,
    versionRange,
    versionRangeValue,
    versionSelector
  } = options;
  if (!versionRange || !versionRangeValue) return;
  versionSelector.closest('.filter-field')?.classList.add('has-version-slider');
  const optionsList = Array.from(versionSelector.options);
  const selectedIndex = Math.max(
    0,
    optionsList.findIndex(option => option.value === versionSelector.value)
  );
  versionRange.max = String(Math.max(0, optionsList.length - 1));
  versionRange.value = String(selectedIndex);
  versionRange.disabled = versionSelector.disabled || optionsList.length === 0;
  const selectedVersion = optionsList[selectedIndex]?.value ?? '';
  versionRangeValue.value = selectedVersion
    ? versionSliderLabel(selectedVersion, proposedVersionManifests)
    : '—';
  versionRangeValue.classList.toggle(
    'is-future',
    proposedVersionManifests.some(version => version.version === selectedVersion)
  );
  versionRange.setAttribute(
    'aria-valuetext',
    optionsList[selectedIndex]?.text ?? '—'
  );
  if (versionPrevious)
    versionPrevious.disabled = versionRange.disabled || selectedIndex === 0;
  if (versionNext)
    versionNext.disabled =
      versionRange.disabled || selectedIndex === optionsList.length - 1;
  updateModifierAvailability();
}

export function getVersionKeys(options: {
  proposedVersionManifests: VersionManifest[];
  releasedIds: Set<string>;
  versionKeys: Map<string, Set<string>>;
  versionManifests: VersionManifest[];
  versionMode: string;
  versionValue: string;
}) {
  if (options.versionKeys.size === 0) return options.releasedIds;
  if (options.versionMode === 'selected') {
    return options.versionKeys.get(options.versionValue) ?? new Set<string>();
  }

  const manifests = [
    ...options.versionManifests,
    ...options.proposedVersionManifests
  ];
  const selectedIndex = manifests.findIndex(
    version => version.version === options.versionValue
  );
  return new Set(
    manifests
      .slice(0, selectedIndex + 1)
      .flatMap(version => [...(options.versionKeys.get(version.version) ?? [])])
  );
}

export function updateModifierAvailability(options: {
  byId: Record<string, unknown>;
  genderCheckboxes: CheckboxLike[];
  genderFieldset?: { hidden: boolean };
  getEmojiGenders: (item: unknown) => Set<string>;
  hairCheckboxes: CheckboxLike[];
  hairFieldset?: { hidden: boolean };
  modifierFilters?: { hidden: boolean; classList: ClassListLike };
  proposedVersionManifests: VersionManifest[];
  skinToneCheckboxes: CheckboxLike[];
  skinToneFieldset?: { hidden: boolean };
  versionKeys: Map<string, Set<string>>;
  versionManifests: VersionManifest[];
  versionValue: string;
}) {
  if (options.versionKeys.size === 0) {
    if (options.skinToneFieldset) options.skinToneFieldset.hidden = false;
    if (options.hairFieldset) options.hairFieldset.hidden = false;
    if (options.genderFieldset) options.genderFieldset.hidden = false;
    if (options.modifierFilters) {
      options.modifierFilters.hidden = false;
      options.modifierFilters.classList.remove('has-single');
    }
    return;
  }
  const manifests = [
    ...options.versionManifests,
    ...options.proposedVersionManifests
  ];
  const selectedIndex = manifests.findIndex(
    version => version.version === options.versionValue
  );
  const skinToneIndex = manifests.findIndex(version =>
    [...(options.versionKeys.get(version.version) ?? [])].some(key =>
      key.endsWith('SkinTone')
    )
  );
  const hairKeys = new Set(['redHair', 'curlyHair', 'bald', 'whiteHair']);
  const hairIndex = manifests.findIndex(version =>
    [...(options.versionKeys.get(version.version) ?? [])].some(key =>
      hairKeys.has(key)
    )
  );
  const genderIndex = manifests.findIndex(version =>
    [...(options.versionKeys.get(version.version) ?? [])].some(
      key => options.getEmojiGenders(options.byId[key] ?? {}).size > 0
    )
  );
  const skinToneAvailable =
    selectedIndex >= skinToneIndex && skinToneIndex !== -1;
  const hairAvailable = selectedIndex >= hairIndex && hairIndex !== -1;
  const genderAvailable = selectedIndex >= genderIndex && genderIndex !== -1;

  if (options.skinToneFieldset) options.skinToneFieldset.hidden = !skinToneAvailable;
  if (options.hairFieldset) options.hairFieldset.hidden = !hairAvailable;
  if (options.genderFieldset) options.genderFieldset.hidden = !genderAvailable;
  if (!skinToneAvailable) options.skinToneCheckboxes.forEach(checkbox => (checkbox.checked = false));
  if (!hairAvailable) options.hairCheckboxes.forEach(checkbox => (checkbox.checked = false));
  if (!genderAvailable) options.genderCheckboxes.forEach(checkbox => (checkbox.checked = false));
  if (options.modifierFilters) {
    const availableCount = [
      skinToneAvailable,
      hairAvailable,
      genderAvailable
    ].filter(Boolean).length;
    options.modifierFilters.hidden = availableCount === 0;
    options.modifierFilters.classList.toggle('has-single', availableCount === 1);
  }
}

export function updateAvailableCategories(options: {
  groups: string[];
  items: Array<{ group: string; key: string; sequenceType: string; unicodeSubGroup: string }>;
  selectedGroup: string;
  selectedSequenceType: string;
  selectedSubGroup: string;
  sequenceTypeOrder: string[];
  subGroupSelectionKey: (group: string, subGroup: string) => string;
  subGroups: Record<string, string[]>;
  versionKeys: Map<string, Set<string>>;
  includedVersionKeys: Set<string>;
}) {
  const availableCategoryKeys =
    options.includedVersionKeys.size === 0 && options.versionKeys.size === 0
      ? new Set(options.items.map(item => item.key))
      : options.includedVersionKeys;
  const groupNames = new Set<string>();
  const subgroupNames: Record<string, Set<string>> = {};
  options.items.forEach(item => {
    if (!availableCategoryKeys.has(item.key)) return;
    groupNames.add(item.group);
    if (!subgroupNames[item.group]) subgroupNames[item.group] = new Set();
    subgroupNames[item.group].add(item.unicodeSubGroup);
  });
  const availableGroups = options.groups.filter(group => groupNames.has(group));
  const availableSubGroups = Object.fromEntries(
    availableGroups.map(group => [
      group,
      options.subGroups[group].filter(subGroup => subgroupNames[group]?.has(subGroup))
    ])
  ) as Record<string, string[]>;
  const availableSequenceTypes = options.sequenceTypeOrder.filter(type =>
    options.items.some(
      item => availableCategoryKeys.has(item.key) && item.sequenceType === type
    )
  );
  let selectedSequenceType = options.selectedSequenceType;
  if (
    selectedSequenceType &&
    !availableSequenceTypes.includes(selectedSequenceType)
  ) {
    selectedSequenceType = '';
  }

  let selectedGroup = options.selectedGroup;
  let selectedSubGroup = options.selectedSubGroup;
  if (selectedGroup && !availableGroups.includes(selectedGroup)) {
    selectedGroup = '';
    selectedSubGroup = '';
  } else if (selectedSubGroup) {
    const separatorIndex = selectedSubGroup.indexOf('::');
    const group =
      separatorIndex === -1 ? '' : selectedSubGroup.slice(0, separatorIndex);
    const subGroup =
      separatorIndex === -1 ? '' : selectedSubGroup.slice(separatorIndex + 2);
    if (
      group !== selectedGroup ||
      !availableSubGroups[group]?.includes(subGroup)
    ) {
      selectedSubGroup = '';
    }
  }

  return {
    availableCategoryKeys,
    availableGroups,
    availableSequenceTypes,
    availableSubGroups,
    selectedGroup,
    selectedSequenceType,
    selectedSubGroup
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
    'has-choice-buttons',
    Boolean(options.compactGroupChoices)
  );
  options.subGroupField?.classList.toggle(
    'has-choice-buttons',
    Boolean(options.compactSubGroupChoices)
  );
  options.sequenceField?.classList.toggle(
    'has-choice-buttons',
    Boolean(options.compactSequenceChoices)
  );
  if (options.groupField) options.groupField.hidden = options.sequenceMode;
  if (options.subGroupField)
    options.subGroupField.hidden =
      options.sequenceMode || !options.selectedGroup;
  if (options.sequenceField) options.sequenceField.hidden = !options.sequenceMode;
}
