import * as state from "../../state.js";

export function createExplorerDataController(options: any) {
  const providedState = options.state?.();
  const getValue: any = (getter: any, key: any) =>
    () => providedState?.[key] ?? getter();
  function populateVersionSelector() {
    options.populateVersionSelector({
      proposed: getValue(
        state.proposedVersionManifests.get,
        "proposedVersionManifests",
      )(),
      released: getValue(state.versionManifests.get, "versionManifests")(),
      selectedLocale: getValue(
        state.selectedSearchLocale.get,
        "selectedSearchLocale",
      )(),
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
      proposedVersionManifests: getValue(
        state.proposedVersionManifests.get,
        "proposedVersionManifests",
      )(),
      skinToneCheckboxes: options.skinToneCheckboxes(),
      skinToneFieldset: options.skinToneFieldset(),
      versionKeys: getValue(state.versionKeys.get, "versionKeys")(),
      versionManifests: getValue(state.versionManifests.get, "versionManifests")(),
      versionValue: options.versionSelector().value,
    });
  }
  function syncVersionRange() {
    options.syncVersionRange({
      proposedVersionManifests: getValue(
        state.proposedVersionManifests.get,
        "proposedVersionManifests",
      )(),
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
    if (providedState) Object.assign(providedState, catalog, { added: true });
    else state.applyCatalog(catalog);
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
    if (!(providedState?.currentEmojiKey ?? state.currentEmojiKey.get())) {
      options.openEmoji("clinkingBeerMugs", false);
    }
    if (options.developerModeEnabled()) await loadVersionData();
  }
  async function loadVersionData() {
    const currentPromise =
      providedState?.versionDataPromise ?? state.versionDataPromise.get();
    if (currentPromise) return currentPromise;
    const nextPromise = (async () => {
        try {
          const versions = await options.loadVersionCatalog();
          if (providedState) {
            providedState.versionManifests = versions.released;
            providedState.proposedVersionManifests = versions.proposed;
            providedState.versionKeys = versions.versionKeys;
          } else {
            state.versionManifests.set(versions.released);
            state.proposedVersionManifests.set(versions.proposed);
            state.versionKeys.replace(versions.versionKeys);
          }
          options.rebuildCodePointLookup();
          options.updateModifierArtwork();
          options.buildRepresentatives();
          populateVersionSelector();
          options.applyLoadedUrlState();
          options.renderCategoryFilters();
          options.drawList();
          const key = providedState?.currentEmojiKey ?? state.currentEmojiKey.get();
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
    if (providedState) providedState.versionDataPromise = nextPromise;
    else state.versionDataPromise.set(nextPromise);
    return nextPromise;
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
      proposedVersionManifests: getValue(
        state.proposedVersionManifests.get,
        "proposedVersionManifests",
      )(),
      releasedIds: getValue(state.releasedIds.get, "releasedIds")(),
      versionKeys: getValue(state.versionKeys.get, "versionKeys")(),
      versionManifests: getValue(state.versionManifests.get, "versionManifests")(),
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
