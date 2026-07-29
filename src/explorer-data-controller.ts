export function createExplorerDataController(options: any) {
  function populateVersionSelector() {
    options.populateVersionSelector({
      proposed: options.state().proposedVersionManifests,
      released: options.state().versionManifests,
      selectedLocale: options.state().selectedSearchLocale,
      selector: options.versionSelector(),
      syncRange: syncVersionRange,
      translate: options.translate,
    });
  }
  function updateModifierAvailability() {
    options.updateModifierAvailability({
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
  }
  function syncVersionRange() {
    options.syncVersionRange({
      proposedVersionManifests: options.state().proposedVersionManifests,
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
    Object.assign(options.state(), catalog);
    options.rebuildCodePointLookup();
    options.updateModifierArtwork();
    options.buildRepresentatives();
    options.versionModeSelector().value = "through";
    options.groupSelector().addEventListener("change", options.onGroupChange);
    options
      .subGroupSelector()
      .addEventListener("change", options.onSubGroupChange);
    options
      .sequenceTypeSelector()
      .addEventListener("change", options.onSequenceTypeChange);
    options.renderCategoryFilters();
    options.applyLoadedUrlState();
    if (!options.state().currentEmojiKey) {
      options.openEmoji("clinkingBeerMugs", false);
    }
    if (options.developerModeEnabled()) await loadVersionData();
  }
  async function loadVersionData() {
    if (options.state().versionDataPromise)
      return options.state().versionDataPromise;
    options.state().versionDataPromise = (async () => {
      try {
        const versions = await options.loadVersionCatalog();
        options.state().versionManifests = versions.released;
        options.state().proposedVersionManifests = versions.proposed;
        options.state().versionKeys = versions.versionKeys;
        options.rebuildCodePointLookup();
        options.updateModifierArtwork();
        options.buildRepresentatives();
        populateVersionSelector();
        options.applyLoadedUrlState();
        options.renderCategoryFilters();
        options.drawList();
        const key = options.state().currentEmojiKey;
        if (key)
          options.setIntroducedVersion(options.getIntroducedVersion(key));
      } catch (error) {
        console.warn("Version filters unavailable", error);
        options.versionModeSelector().disabled = true;
        options.versionSelector().disabled = true;
      }
    })();
    return options.state().versionDataPromise;
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
      proposedVersionManifests: options.state().proposedVersionManifests,
      releasedIds: options.state().releasedIds,
      versionKeys: options.state().versionKeys,
      versionManifests: options.state().versionManifests,
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
