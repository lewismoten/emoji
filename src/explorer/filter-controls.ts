import type { ExplorerUrlState } from './url-state.js';

type SearchInputLike = {
  value: string;
};

type SelectOptionLike = {
  value: string;
};

type SelectLike = {
  value: string;
  options: ArrayLike<SelectOptionLike>;
};

type InputLike = {
  checked: boolean;
  value: string;
};

type OrderButtonLike = {
  dataset: Record<string, string | undefined>;
  classList: { toggle(name: string, force?: boolean): void };
  setAttribute(name: string, value: string): void;
};

export function applyBasicUrlStateToControls(options: {
  state: ExplorerUrlState;
  searchText: SearchInputLike;
  orderButtons: OrderButtonLike[];
}) {
  options.searchText.value = options.state.search;
  options.orderButtons.forEach(button => {
    const active = button.dataset.order === options.state.order;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  return {
    orderMode: options.state.order,
    selectedSequenceType: options.state.sequenceType,
    compositionMode: options.state.compositionMode
  };
}

export function applyLoadedUrlStateToControls(options: {
  state: ExplorerUrlState;
  versionSelector: SelectLike;
  versionModeSelector: SelectLike;
  groups: string[];
  subGroups: Record<string, string[]>;
  skinToneCheckboxes: InputLike[];
  hairCheckboxes: InputLike[];
  genderCheckboxes: InputLike[];
  subGroupSelectionKey: (group: string, subGroup: string) => string;
}) {
  if (
    options.state.version &&
    Array.from(options.versionSelector.options).some(
      option => option.value === options.state.version
    )
  ) {
    options.versionSelector.value = options.state.version;
  }
  options.versionModeSelector.value = options.state.versionMode;
  const selectedGroup = options.groups.includes(options.state.group)
    ? options.state.group
    : '';
  const selectedSubGroup =
    selectedGroup &&
    options.subGroups[selectedGroup]?.includes(options.state.subGroup)
      ? options.subGroupSelectionKey(selectedGroup, options.state.subGroup)
      : '';
  options.skinToneCheckboxes.forEach(checkbox => {
    checkbox.checked = options.state.skin.includes(checkbox.value);
  });
  options.hairCheckboxes.forEach(checkbox => {
    checkbox.checked = options.state.hair.includes(checkbox.value);
  });
  const selectedGender = options.state.gender.find(value =>
    options.genderCheckboxes.some(checkbox => checkbox.value === value)
  );
  options.genderCheckboxes.forEach(checkbox => {
    checkbox.checked = checkbox.value === selectedGender;
  });
  return {
    selectedGroup,
    selectedSubGroup
  };
}

export function resetFilterControls(options: {
  searchText: SearchInputLike;
  versionModeSelector: SelectLike;
  versionSelector: SelectLike;
  latestReleasedVersion?: string;
  skinToneCheckboxes: InputLike[];
  hairCheckboxes: InputLike[];
  genderCheckboxes: InputLike[];
}) {
  options.searchText.value = '';
  options.versionModeSelector.value = 'through';
  if (options.latestReleasedVersion) {
    options.versionSelector.value = options.latestReleasedVersion;
  }
  options.skinToneCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  options.hairCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  options.genderCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
}

export function applyExclusiveCheckboxSelection(
  checkboxes: InputLike[],
  currentTarget: InputLike
) {
  if (!currentTarget.checked) return;
  checkboxes.forEach(checkbox => {
    if (checkbox !== currentTarget) checkbox.checked = false;
  });
}

export function stepVersionIndex(
  currentIndex: number,
  optionCount: number,
  amount: number
) {
  return Math.max(0, Math.min(optionCount - 1, currentIndex + amount));
}
