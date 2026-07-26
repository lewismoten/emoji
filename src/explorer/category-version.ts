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
  style?: {
    setProperty(name: string, value: string): void;
  };
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
  const maxIndex = Math.max(0, optionsList.length - 1);
  versionRange.max = String(Math.max(0, optionsList.length - 1));
  versionRange.value = String(selectedIndex);
  versionRange.disabled = versionSelector.disabled || optionsList.length === 0;
  versionRange.style?.setProperty('--slider-progress', '0%');
  versionRange.style?.setProperty('background', '#555555');
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

import {
  renderCategoryFilterLayout,
  updateAvailableCategories
} from './category-filter-layout.js';

export { renderCategoryFilterLayout, updateAvailableCategories };
