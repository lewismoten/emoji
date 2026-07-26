export function createUiBindingRuntime(options: any) {
  return {
    assignControls(controls: any) {
      options.setControls({
        activeFilterSummary: controls.activeFilterSummary,
        activeFilterText: controls.activeFilterText,
        clearFiltersButton: controls.clearFiltersButton,
        compactGroupChoices: controls.compactGroupChoices,
        compactGroupLabel: controls.compactGroupLabel,
        compactSequenceChoices: controls.compactSequenceChoices,
        compactSequenceLabel: controls.compactSequenceLabel,
        compactSubGroupChoices: controls.compactSubGroupChoices,
        compactSubGroupLabel: controls.compactSubGroupLabel,
        sequenceTypeSelector: controls.sequenceTypeSelector,
        versionModeToggle: controls.versionModeToggle,
        versionRange: controls.versionRange,
        versionRangeValue: controls.versionRangeValue
      });
    },
    assignElements(elements: any) {
      options.setElements({
        advancedFilters: elements.advancedFilters,
        copyStatus: elements.copyStatus,
        developerModeToggle: elements.developerModeToggle,
        emojiFontChoices: elements.emojiFontChoices,
        emojiList: elements.emojiList,
        genderCheckboxes: elements.genderCheckboxes,
        groupFilterDialog: elements.groupFilterDialog,
        groupPickerTrigger: elements.groupPickerTrigger,
        groupSelector: elements.groupSelector,
        hairCheckboxes: elements.hairCheckboxes,
        helpDialog: elements.helpDialog,
        helpPicker: elements.helpPicker,
        installAppButton: elements.installAppButton,
        installDialog: elements.installDialog,
        languageDialog: elements.languageDialog,
        languageList: elements.languageList,
        languagePicker: elements.languagePicker,
        languagePickerFlag: elements.languagePickerFlag,
        languagePickerLabel: elements.languagePickerLabel,
        matchCount: elements.matchCount,
        modifierFilters: elements.modifierFilters,
        offlineStatus: elements.offlineStatus,
        orderButtons: elements.orderButtons,
        savedDialog: elements.savedDialog,
        savedPicker: elements.savedPicker,
        searchText: elements.searchText,
        skinToneCheckboxes: elements.skinToneCheckboxes,
        subGroupFilterDialog: elements.subGroupFilterDialog,
        subGroupPickerTrigger: elements.subGroupPickerTrigger,
        subGroupSelector: elements.subGroupSelector,
        themeChoices: elements.themeChoices,
        toolbar: elements.toolbar,
        versionModeSelector: elements.versionModeSelector,
        versionNext: elements.versionNext,
        versionPrevious: elements.versionPrevious,
        versionSelector: elements.versionSelector
      });
    },
    assignModifierFieldsets() {
      options.setFieldsets({
        skinToneFieldset: options.skinToneCheckboxes()?.[0]?.closest('fieldset'),
        hairFieldset: options.hairCheckboxes()?.[0]?.closest('fieldset'),
        genderFieldset: options.genderCheckboxes()?.[0]?.closest('fieldset')
      });
    },
    hideModifierEmojiAccessibility() {
      document
        .querySelectorAll('.modifier-emoji')
        .forEach(emoji => emoji.setAttribute('aria-hidden', 'true'));
    }
  };
}
