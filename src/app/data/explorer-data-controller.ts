import * as state from "../../state.js";

export function createExplorerDataController(options: any) {
  function populateVersionSelector() {
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
      byId: state.byId.get(),
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
    state.versionDataPromise.set(
      (async () => {
        try {
          const versions = await options.loadVersionCatalog();
          state.versionManifests.set(versions.released);
          state.proposedVersionManifests.set(versions.proposed);
          state.versionKeys.set(versions.versionKeys);
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
      })(),
    );
    return state.versionDataPromise.get();
  }
  function onVersionRangeInput() {
    const selector = options.versionSelector();
    const option = selector.options[Number(options.versionRange().value)];
    if (!option) return;
    selector.value = option.value;
    syncVersionRange();
    options.renderCategoryFilters();
    options.drawList();
  }
  function getVersionKeys() {
    return options.getVersionKeys({
      proposedVersionManifests: state.proposedVersionManifests.get(),
      releasedIds: state.releasedIds.get(),
      versionKeys: state.versionKeys.get(),
      versionManifests: state.versionManifests.get(),
      versionMode: options.versionModeSelector().value,
      versionValue: options.versionSelector().value,
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
