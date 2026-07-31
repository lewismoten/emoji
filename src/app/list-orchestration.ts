import { createEmojiListRenderers } from "../explorer/emoji/emoji-list-render.js";
import { createEmojiListInteraction } from "../explorer/emoji/emoji-list-interaction.js";
import { createListController } from "../explorer/emoji/list-controller.js";
import { updateActiveFilterSummary } from "../explorer/filters/filter-summary.js";
import { popularKeys } from "../explorer/emoji/popular-keys.js";

/** Assemble list rendering, interaction, and active-filter summary behavior. */
export function createListOrchestration(options: any) {
  const state = options.state;
  const {
    asEmojiCell,
    asItem,
    asSequenceItem,
    flushEmojiCellFragment,
    orderedKeys,
  } = createEmojiListRenderers({
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    byId: () => state().byId,
    displayExplorerLabel: options.displayExplorerLabel,
    displayGroupName: options.displayGroupName,
    displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
    emojiByKey: () => state().emojiByKey,
    focusedEmojiKey: () => state().focusedEmojiKey,
    getIntroducedVersion: options.getIntroducedVersion,
    groups: () => state().groups,
    orderMode: () => state().orderMode,
    popularKeys: () => [...popularKeys],
    searchAnnotations: () => state().searchAnnotations,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTypeOrder: options.sequenceTypeOrder,
    subGroups: () => state().subGroups,
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
      latestReleased: state().versionManifests.at(-1)?.version,
      orderMode: state().orderMode,
      searchText: options.searchText().value,
      selectedGroup: state().selectedGroup,
      selectedSequenceType: state().selectedSequenceType,
      selectedSubGroup: state().selectedSubGroup,
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
    allIds: () => state().allIds,
    byId: () => state().byId,
    emojiByKey: () => state().emojiByKey,
    focusedEmojiKey: () => state().focusedEmojiKey,
    formatNumber: options.formatNumber,
    genderCheckboxes: options.genderCheckboxes,
    getVersionKeys: options.getVersionKeys,
    hairCheckboxes: options.hairCheckboxes,
    items: () => state().items,
    matchCount: options.matchCount,
    nextRenderGeneration: options.nextRenderGeneration,
    orderMode: () => state().orderMode,
    popularKeys: () => [...popularKeys],
    orderedKeys,
    renderEmojiList: (...args: any[]) => renderEmojiList(...args),
    searchAnnotations: () => state().searchAnnotations,
    searchText: options.searchText,
    selectedGroup: () => state().selectedGroup,
    selectedSearchLocale: () => state().selectedSearchLocale,
    selectedSequenceType: () => state().selectedSequenceType,
    selectedSubGroup: () => state().selectedSubGroup,
    setDisplayedKeys: (keys: string[]) => (state().displayedKeys = keys),
    setFocusedEmojiKey: (key: string) => (state().focusedEmojiKey = key),
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
    focusedEmojiKey: () => state().focusedEmojiKey,
    getDisplayedKeys: () => state().displayedKeys,
    nextRenderGeneration: options.nextRenderGeneration,
    onClick: options.onClick,
    orderMode: () => state().orderMode,
    renderGeneration: options.renderGeneration,
    resetFilters: options.resetFilters,
    revealExplorer: options.revealExplorer,
    searchText: options.searchText,
    setFocusedEmojiKey: (key: string) => (state().focusedEmojiKey = key),
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
