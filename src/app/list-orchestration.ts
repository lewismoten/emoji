import { createEmojiListRenderers } from "../explorer/emoji-list-render.js";
import { createEmojiListInteraction } from "../explorer/emoji-list-interaction.js";
import { createListController } from "../explorer/list-controller.js";
import { updateActiveFilterSummary } from "../explorer/filter-summary.js";
import { popularKeys } from "../explorer/popular-keys.js";

/** Assemble list rendering, interaction, and active-filter summary behavior. */
export function createListOrchestration(options: any) {
  const {
    asEmojiCell,
    asItem,
    asSequenceItem,
    flushEmojiCellFragment,
    orderedKeys,
  } = createEmojiListRenderers({
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    byId: () => options.state().byId,
    displayExplorerLabel: options.displayExplorerLabel,
    displayGroupName: options.displayGroupName,
    displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
    emojiByKey: () => options.state().emojiByKey,
    focusedEmojiKey: () => options.state().focusedEmojiKey,
    getIntroducedVersion: options.getIntroducedVersion,
    groups: () => options.state().groups,
    orderMode: () => options.state().orderMode,
    popularKeys: () => [...popularKeys],
    searchAnnotations: () => options.state().searchAnnotations,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTypeOrder: options.sequenceTypeOrder,
    subGroups: () => options.state().subGroups,
    translate: options.translate,
    unassigned: options.unassigned,
  });

  const updateFilterSummary = () =>
    updateActiveFilterSummary({
      activeFilterSummary: options.activeFilterSummary(),
      activeFilterText: options.activeFilterText(),
      displayGroupName: options.displayGroupName,
      displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
      genderCheckboxes: options.genderCheckboxes(),
      hairCheckboxes: options.hairCheckboxes(),
      latestReleased: options.state().versionManifests.at(-1)?.version,
      orderMode: options.state().orderMode,
      searchText: options.searchText().value,
      selectedGroup: options.state().selectedGroup,
      selectedSequenceType: options.state().selectedSequenceType,
      selectedSubGroup: options.state().selectedSubGroup,
      sequenceTranslationKeys: options.sequenceTranslationKeys,
      sequenceTypeLabels: options.sequenceTypeLabels,
      skinToneCheckboxes: options.skinToneCheckboxes(),
      translate: options.translate,
      versionMode: options.versionModeSelector().value,
      versionSliderLabel: options.versionSliderLabel,
      versionValue: options.versionSelector().value,
    });

  let renderEmojiList: (...args: any[]) => void;
  const list = createListController({
    allIds: () => options.state().allIds,
    byId: () => options.state().byId,
    emojiByKey: () => options.state().emojiByKey,
    focusedEmojiKey: () => options.state().focusedEmojiKey,
    formatNumber: options.formatNumber,
    genderCheckboxes: options.genderCheckboxes,
    getVersionKeys: options.getVersionKeys,
    hairCheckboxes: options.hairCheckboxes,
    items: () => options.state().items,
    matchCount: options.matchCount,
    nextRenderGeneration: options.nextRenderGeneration,
    orderMode: () => options.state().orderMode,
    popularKeys: () => [...popularKeys],
    orderedKeys,
    renderEmojiList: (...args: any[]) => renderEmojiList(...args),
    searchAnnotations: () => options.state().searchAnnotations,
    searchText: options.searchText,
    selectedGroup: () => options.state().selectedGroup,
    selectedSearchLocale: () => options.state().selectedSearchLocale,
    selectedSequenceType: () => options.state().selectedSequenceType,
    selectedSubGroup: () => options.state().selectedSubGroup,
    setDisplayedKeys: (keys: string[]) =>
      (options.state().displayedKeys = keys),
    setFocusedEmojiKey: (key: string) =>
      (options.state().focusedEmojiKey = key),
    skinToneCheckboxes: options.skinToneCheckboxes,
    subGroupSelectionKey: options.subGroupSelectionKey,
    syncUrlState: options.syncUrlState,
    updateDialogNavigation: options.updateDialogNavigation,
    updateFilterSummary,
  });
  const { draw: drawList, schedule: scheduleSearchDraw } = list;

  const interaction = createEmojiListInteraction({
    asItem,
    asSequenceItem,
    drawList,
    emojiList: options.emojiList,
    flushEmojiCellFragment,
    focusedEmojiKey: () => options.state().focusedEmojiKey,
    getDisplayedKeys: () => options.state().displayedKeys,
    nextRenderGeneration: options.nextRenderGeneration,
    onClick: options.onClick,
    orderMode: () => options.state().orderMode,
    renderGeneration: options.renderGeneration,
    resetFilters: options.resetFilters,
    revealExplorer: options.revealExplorer,
    searchText: options.searchText,
    setFocusedEmojiKey: (key: string) =>
      (options.state().focusedEmojiKey = key),
    translate: options.translate,
    unassigned: options.unassigned,
  });
  renderEmojiList = interaction.renderEmojiList;

  return {
    drawList,
    onEmojiFocus: interaction.onEmojiFocus,
    onEmojiKeyDown: interaction.onEmojiKeyDown,
    scheduleSearchDraw,
    updateActiveFilterSummary: updateFilterSummary,
  };
}
