import {
  getVersionKeys as getVersionKeysHelper,
  syncVersionRange as syncVersionRangeHelper,
  updateModifierAvailability as updateModifierAvailabilityHelper,
  versionSliderLabel as versionSliderLabelHelper,
} from "../../explorer/category/category-version.js";
import { populateVersionSelector as populateVersionSelectorHelper } from "../../explorer/filters/version-data.js";
import { createExplorerDataController } from "../data/explorer-data-controller.js";

/** Coordinate version controls and the catalog/version data loader. */
export function createVersionController(options: any) {
  const populateVersionSelector = () =>
    populateVersionSelectorHelper({
      proposed: options.state().proposedVersionManifests,
      released: options.state().versionManifests,
      selectedLocale: options.state().selectedSearchLocale,
      selector: options.versionSelector(),
      syncRange: syncVersionRange,
      translate: options.translate,
    });

  const versionSliderLabel = (version: string) =>
    versionSliderLabelHelper(version, options.state().proposedVersionManifests);

  const syncVersionRange = () =>
    syncVersionRangeHelper({
      proposedVersionManifests: options.state().proposedVersionManifests,
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
    syncVersionRange();
    options.renderCategoryFilters();
    options.drawList();
  };

  const updateModifierAvailability = () =>
    updateModifierAvailabilityHelper({
      byId: options.state().byId,
      genderCheckboxes: options.genderCheckboxes(),
      genderFieldset: options.genderFieldset(),
      getEmojiGenders: options.getEmojiGenders,
      hairCheckboxes: options.hairCheckboxes(),
      hairFieldset: options.hairFieldset(),
      modifierFilters: options.modifierFilters(),
      proposedVersionManifests: options.state().proposedVersionManifests,
      skinToneCheckboxes: options.skinToneCheckboxes(),
      skinToneFieldset: options.skinToneFieldset(),
      versionKeys: options.state().versionKeys,
      versionManifests: options.state().versionManifests,
      versionValue: options.versionSelector().value,
    });

  const getVersionKeys = () =>
    getVersionKeysHelper({
      proposedVersionManifests: options.state().proposedVersionManifests,
      releasedIds: options.state().releasedIds,
      versionKeys: options.state().versionKeys,
      versionManifests: options.state().versionManifests,
      versionMode: options.versionModeSelector().value,
      versionValue: options.versionSelector().value,
    });

  const data = createExplorerDataController({
    applyLoadedUrlState: options.applyLoadedUrlState,
    buildRepresentatives: options.buildRepresentatives,
    developerModeEnabled: options.developerModeEnabled,
    drawList: options.drawList,
    getEmojiGenders: options.getEmojiGenders,
    getIntroducedVersion: options.getIntroducedVersion,
    getVersionKeys: getVersionKeysHelper,
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
    proposedVersionManifests: () => options.state().proposedVersionManifests,
    rebuildCodePointLookup: options.rebuildCodePointLookup,
    renderCategoryFilters: options.renderCategoryFilters,
    setIntroducedVersion: options.setIntroducedVersion,
    sequenceTypeSelector: options.sequenceTypeSelector,
    skinToneCheckboxes: options.skinToneCheckboxes,
    skinToneFieldset: options.skinToneFieldset,
    state: options.state,
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
