import { createEmojiListRenderers } from "../explorer/emoji/emoji-list-render.js";
import { createEmojiListInteraction } from "../explorer/emoji/emoji-list-interaction.js";
import { createListController } from "../explorer/emoji/list-controller.js";
import { updateActiveFilterSummary } from "../explorer/filters/filter-summary.js";
import { popularKeys } from "../explorer/emoji/popular-keys.js";
import * as state from "../state.js";

/** Assemble list rendering, interaction, and active-filter summary behavior. */
export function createListOrchestration(options: any) {
  const { asItem, asSequenceItem, flushEmojiCellFragment, orderedKeys } =
    createEmojiListRenderers({
      applyPixelArtworkClass: options.applyPixelArtworkClass,
      byId: state.byId.get,
      displayExplorerLabel: options.displayExplorerLabel,
      displayGroupName: options.displayGroupName,
      displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
      emojiByKey: state.emojiByKey.get,
      focusedEmojiKey: state.focusedEmojiKey.get,
      getIntroducedVersion: options.getIntroducedVersion,
      groups: state.groups.get,
      orderMode: state.orderMode.get,
      popularKeys: () => [...popularKeys],
      searchAnnotations: state.searchAnnotations.get,
      sequenceTranslationKeys: options.sequenceTranslationKeys,
      sequenceTypeLabels: options.sequenceTypeLabels,
      sequenceTypeOrder: options.sequenceTypeOrder,
      subGroups: state.subGroups.get,
      translate: options.translate,
      unassigned: options.unassigned,
    });

  const updateFilterSummary = () =>
    updateActiveFilterSummary({
      activeFilterSummary: options.activeFilterSummary(),
      activeFilterText: options.activeFilterText(),
      displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
      displayGroupName: options.displayGroupName,
      genderCheckboxes: options.genderCheckboxes(),
      hairCheckboxes: options.hairCheckboxes(),
      latestReleased: state.versionManifests.get().at(-1)?.version,
      orderMode: state.orderMode.get(),
      searchText: options.searchText().value,
      selectedGroup: state.selectedGroup.get(),
      selectedSequenceType: state.selectedSequenceType.get(),
      selectedSubGroup: state.selectedSubGroup.get(),
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
    allIds: state.allIds.get,
    byId: state.byId.get,
    emojiByKey: state.emojiByKey.get,
    focusedEmojiKey: state.focusedEmojiKey.get,
    formatNumber: options.formatNumber,
    genderCheckboxes: options.genderCheckboxes,
    getVersionKeys: options.getVersionKeys,
    hairCheckboxes: options.hairCheckboxes,
    items: state.items.get,
    matchCount: options.matchCount,
    nextRenderGeneration: options.nextRenderGeneration,
    orderMode: state.orderMode.get,
    popularKeys: () => [...popularKeys],
    orderedKeys,
    renderEmojiList: (...args: any[]) => renderEmojiList(...args),
    searchAnnotations: state.searchAnnotations.get,
    searchText: options.searchText,
    selectedGroup: state.selectedGroup.get,
    selectedSearchLocale: state.selectedSearchLocale.get,
    selectedSequenceType: state.selectedSequenceType.get,
    selectedSubGroup: state.selectedSubGroup.get,
    setDisplayedKeys: state.displayedKeys.set,
    setFocusedEmojiKey: state.focusedEmojiKey.set,
    skinToneCheckboxes: options.skinToneCheckboxes,
    subGroupSelectionKey: options.subGroupSelectionKey,
    syncUrlState: options.syncUrlState,
    updateDialogNavigation: options.updateDialogNavigation,
    updateFilterSummary,
  });
  const { draw: drawList, schedule: scheduleSearchDraw } = list;

  const interactionState = {
    focusedEmojiKey: state.focusedEmojiKey.get,
    getDisplayedKeys: state.displayedKeys.get,
    orderMode: state.orderMode.get,
    setFocusedEmojiKey: state.focusedEmojiKey.set,
  };
  const interaction = createEmojiListInteraction({
    asItem: (renderState, key) => asItem(renderState, key, state),
    asSequenceItem: (renderState, key) =>
      asSequenceItem(renderState, key, state),
    drawList,
    emojiList: options.emojiList,
    flushEmojiCellFragment,
    focusedEmojiKey: interactionState.focusedEmojiKey,
    getDisplayedKeys: interactionState.getDisplayedKeys,
    nextRenderGeneration: options.nextRenderGeneration,
    onClick: options.onClick,
    orderMode: interactionState.orderMode,
    renderGeneration: options.renderGeneration,
    resetFilters: options.resetFilters,
    revealExplorer: options.revealExplorer,
    searchText: options.searchText,
    setFocusedEmojiKey: interactionState.setFocusedEmojiKey,
    translate: options.translate,
    unassigned: options.unassigned,
  });
  interactionState.setFocusedEmojiKey(state.focusedEmojiKey.get());
  renderEmojiList = interaction.renderEmojiList;

  return {
    drawList,
    onEmojiFocus: interaction.onEmojiFocus,
    onEmojiKeyDown: interaction.onEmojiKeyDown,
    scheduleSearchDraw,
    updateActiveFilterSummary: updateFilterSummary,
  };
}
