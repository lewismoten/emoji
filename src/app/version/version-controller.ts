import {
  getVersionKeys as getVersionKeysHelper,
  syncVersionRange as syncVersionRangeHelper,
  updateModifierAvailability as updateModifierAvailabilityHelper,
  versionSliderLabel as versionSliderLabelHelper,
} from "../../explorer/category/category-version.js";
import { populateVersionSelector as populateVersionSelectorHelper } from "../../explorer/filters/version-data.js";
import { createExplorerDataController } from "../data/explorer-data-controller.js";
import * as state from "../../state.js";
import {
  getIncludedVersionKeys,
  getSelectedVersion,
  setSelectedVersion,
  syncSelectedVersionFromControl,
} from "../../version-keys.js";

/** Coordinate version controls and the catalog/version data loader. */
export function createVersionController(options: any) {
  const populateVersionSelector = () =>
    populateVersionSelectorHelper({
      proposed: state.proposedVersionManifests.get(),
      released: state.versionManifests.get(),
      selectedLocale: state.selectedSearchLocale.get(),
      selector: options.versionSelector(),
      syncRange: () => {
        syncSelectedVersionFromControl(options.versionSelector());
        return syncVersionRange();
      },
      translate: options.translate,
    });

  const versionSliderLabel = (version: string) =>
    versionSliderLabelHelper(version, state.proposedVersionManifests.get());

  const syncVersionRange = () =>
    syncVersionRangeHelper({
      proposedVersionManifests: state.proposedVersionManifests.get(),
      updateModifierAvailability,
      versionNext: options.versionNext(),
      versionPrevious: options.versionPrevious(),
      versionRange: options.versionRange(),
      versionRangeValue: options.versionRangeValue(),
      versionSelector: options.versionSelector(),
    });

  const onVersionRangeInput = () => {
    const selector = options.versionSelector();
    const range = options.versionRange();
    const option = selector.options[Number(range.value)];
    if (!option) return;
    selector.value = option.value;
    setSelectedVersion(selector.value);
    syncVersionRange();
    options.renderCategoryFilters();
    options.drawList();
  };

  const updateModifierAvailability = () =>
    updateModifierAvailabilityHelper({
      genderCheckboxes: options.genderCheckboxes(),
      genderFieldset: options.genderFieldset(),
      getEmojiGenders: options.getEmojiGenders,
      hairCheckboxes: options.hairCheckboxes(),
      hairFieldset: options.hairFieldset(),
      modifierFilters: options.modifierFilters(),
      proposedVersionManifests: state.proposedVersionManifests.get(),
      skinToneCheckboxes: options.skinToneCheckboxes(),
      skinToneFieldset: options.skinToneFieldset(),
      versionManifests: state.versionManifests.get(),
      versionValue: getSelectedVersion(),
    });

  const getVersionKeys = () => getIncludedVersionKeys();

  const data = createExplorerDataController({
    applyLoadedUrlState: options.applyLoadedUrlState,
    buildRepresentatives: options.buildRepresentatives,
    developerModeEnabled: options.developerModeEnabled,
    drawList: options.drawList,
    getEmojiGenders: options.getEmojiGenders,
    getIntroducedVersion: options.getIntroducedVersion,
    groupSelector: options.groupSelector,
    genderCheckboxes: options.genderCheckboxes,
    genderFieldset: options.genderFieldset,
    hairCheckboxes: options.hairCheckboxes,
    hairFieldset: options.hairFieldset,
    loadCatalog: options.loadCatalog,
    loadVersionCatalog: options.loadVersionCatalog,
    modifierFilters: options.modifierFilters,
    onGroupChange: options.onGroupChange,
    onSequenceTypeChange: options.onSequenceTypeChange,
    onSubGroupChange: options.onSubGroupChange,
    openEmoji: options.openEmoji,
    populateVersionSelector: populateVersionSelectorHelper,
    proposedVersionManifests: state.proposedVersionManifests.get,
    rebuildCodePointLookup: options.rebuildCodePointLookup,
    renderCategoryFilters: options.renderCategoryFilters,
    setIntroducedVersion: options.setIntroducedVersion,
    sequenceTypeSelector: options.sequenceTypeSelector,
    skinToneCheckboxes: options.skinToneCheckboxes,
    skinToneFieldset: options.skinToneFieldset,
    subGroupSelector: options.subGroupSelector,
    syncVersionRange: syncVersionRangeHelper,
    translate: options.translate,
    updateModifierArtwork: options.updateModifierArtwork,
    updateModifierAvailability: updateModifierAvailabilityHelper,
    versionModeSelector: options.versionModeSelector,
    versionNext: options.versionNext,
    versionPrevious: options.versionPrevious,
    versionRange: options.versionRange,
    versionRangeValue: options.versionRangeValue,
    versionSelector: options.versionSelector,
  });

  return {
    getVersionKeys,
    loadData: data.loadData,
    loadVersionData: data.loadVersionData,
    onVersionRangeInput,
    populateVersionSelector,
    syncVersionRange,
    updateModifierAvailability,
    versionSliderLabel,
  };
}
