import * as state from "../../state.js";
import { getVersionKeys as getVersionKeysHelper } from "../../explorer/category/category-version.js";
import {
  setSelectedVersion,
  setSelectedVersionMode,
  setVersionCatalog,
  syncSelectedVersionFromControl,
  syncSelectedVersionModeFromControl,
} from "../../version-keys.js";

export function createExplorerDataController(options: any) {
  function populateVersionSelector() {
    syncSelectedVersionFromControl(options.versionSelector());
    options.populateVersionSelector({
      proposed: state.proposedVersionManifests.get(),
      released: state.versionManifests.get(),
      selectedLocale: state.selectedSearchLocale.get(),
      selector: options.versionSelector(),
      syncRange: syncVersionRange,
      translate: options.translate,
    });
  }
  function updateModifierAvailability() {
    options.updateModifierAvailability({
      genderCheckboxes: options.genderCheckboxes(),
      genderFieldset: options.genderFieldset(),
      getEmojiGenders: options.getEmojiGenders,
      hairCheckboxes: options.hairCheckboxes(),
      hairFieldset: options.hairFieldset(),
      modifierFilters: options.modifierFilters(),
      proposedVersionManifests: state.proposedVersionManifests.get(),
      skinToneCheckboxes: options.skinToneCheckboxes(),
      skinToneFieldset: options.skinToneFieldset(),
      versionKeys: state.versionKeys.get(),
      versionManifests: state.versionManifests.get(),
      versionValue: options.versionSelector().value,
    });
  }
  function syncVersionRange() {
    syncSelectedVersionFromControl(options.versionSelector());
    options.syncVersionRange({
      proposedVersionManifests: state.proposedVersionManifests.get(),
      updateModifierAvailability,
      versionNext: options.versionNext(),
      versionPrevious: options.versionPrevious(),
      versionRange: options.versionRange(),
      versionRangeValue: options.versionRangeValue(),
      versionSelector: options.versionSelector(),
    });
  }
  async function loadData() {
    const catalog = await options.loadCatalog();
    state.applyCatalog(catalog);
    options.rebuildCodePointLookup();
    options.updateModifierArtwork();
    options.buildRepresentatives();
    options.groupSelector().addEventListener("change", options.onGroupChange);
    options
      .subGroupSelector()
      .addEventListener("change", options.onSubGroupChange);
    options
      .sequenceTypeSelector()
      .addEventListener("change", options.onSequenceTypeChange);
    options.renderCategoryFilters();
    options.applyLoadedUrlState();
    if (!state.currentEmojiKey.get()) {
      options.openEmoji("clinkingBeerMugs", false);
    }
    if (options.developerModeEnabled()) await loadVersionData();
  }
  async function loadVersionData() {
    if (state.versionDataPromise.get()) return state.versionDataPromise.get();
    const nextPromise = (async () => {
      try {
        const versions = await options.loadVersionCatalog();
        setVersionCatalog(versions);
        options.rebuildCodePointLookup();
        options.updateModifierArtwork();
        options.buildRepresentatives();
        populateVersionSelector();
        options.applyLoadedUrlState();
        options.renderCategoryFilters();
        options.drawList();
        const key = state.currentEmojiKey.get();
        if (key)
          options.setIntroducedVersion(options.getIntroducedVersion(key));
      } catch (error) {
        console.warn("Version filters unavailable", error);
        const versionModeSelector = options.versionModeSelector?.();
        const versionSelector = options.versionSelector?.();
        if (versionModeSelector) versionModeSelector.disabled = true;
        if (versionSelector) versionSelector.disabled = true;
      }
    })();
    state.versionDataPromise.set(nextPromise);
    return nextPromise;
  }
  function onVersionRangeInput() {
    const selector = options.versionSelector();
    const option = selector.options[Number(options.versionRange().value)];
    if (!option) return;
    selector.value = option.value;
    setSelectedVersion(selector.value);
    syncVersionRange();
    options.renderCategoryFilters();
    options.drawList();
  }
  function getVersionKeys() {
    syncSelectedVersionModeFromControl(options.versionModeSelector());
    syncSelectedVersionFromControl(options.versionSelector());
    return getVersionKeysHelper({
      proposedVersionManifests: state.proposedVersionManifests.get(),
      releasedIds: state.releasedIds.get(),
      versionKeys: state.versionKeys.get(),
      versionManifests: state.versionManifests.get(),
      versionMode: state.selectedVersionMode.get(),
      versionValue: state.selectedVersion.get(),
    });
  }
  return {
    getVersionKeys,
    loadData,
    loadVersionData,
    onVersionRangeInput,
    populateVersionSelector,
    syncVersionRange,
    updateModifierAvailability,
  };
}
