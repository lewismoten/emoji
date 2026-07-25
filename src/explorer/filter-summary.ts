type CheckboxLike = {
  checked: boolean;
  value: string;
  closest: (selector: string) => HTMLElement | null;
};

export function updateActiveFilterSummary(options: {
  activeFilterSummary?: HTMLElement;
  activeFilterText?: HTMLElement;
  displayGroupName: (name: string) => string;
  displayUnicodeSubGroupName: (name: string) => string;
  genderCheckboxes: CheckboxLike[];
  hairCheckboxes: CheckboxLike[];
  latestReleased?: string;
  orderMode: string;
  searchText: string;
  selectedGroup: string;
  selectedSequenceType: string;
  selectedSubGroup: string;
  sequenceTranslationKeys: Record<string, string>;
  sequenceTypeLabels: Record<string, string>;
  skinToneCheckboxes: CheckboxLike[];
  translate: (key: string, fallback: string) => string;
  versionMode: string;
  versionSliderLabel: (version: string) => string;
  versionValue: string;
}) {
  if (!options.activeFilterSummary || !options.activeFilterText) return;
  const parts: string[] = [];
  if (options.searchText.trim()) parts.push(`“${options.searchText.trim()}”`);
  if (options.orderMode === 'sequence' && options.selectedSequenceType) {
    parts.push(
      options.translate(
        options.sequenceTranslationKeys[options.selectedSequenceType],
        options.sequenceTypeLabels[options.selectedSequenceType]
      )
    );
  } else {
    if (options.selectedGroup) {
      parts.push(options.displayGroupName(options.selectedGroup));
    }
    if (options.selectedSubGroup) {
      parts.push(
        options.displayUnicodeSubGroupName(
          options.selectedSubGroup.split('::').slice(1).join('::')
        )
      );
    }
  }
  if (
    options.versionValue &&
    (options.versionValue !== options.latestReleased ||
      options.versionMode === 'selected')
  ) {
    const mode =
      options.versionMode === 'selected'
        ? options.translate('onlyVersion', 'Only')
        : options.translate('throughVersion', 'Through');
    parts.push(`${mode} ${options.versionSliderLabel(options.versionValue)}`);
  }
  for (const checkbox of [
    ...options.skinToneCheckboxes,
    ...options.hairCheckboxes,
    ...options.genderCheckboxes
  ].filter(checkbox => checkbox.checked)) {
    parts.push(
      checkbox.closest('label')?.querySelector('.modifier-emoji')?.textContent ??
        checkbox.value
    );
  }
  options.activeFilterSummary.hidden = parts.length === 0;
  options.activeFilterText.textContent = parts.join(' · ');
}
