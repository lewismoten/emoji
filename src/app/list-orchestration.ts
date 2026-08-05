import { createEmojiListRenderers } from "../explorer/emoji/emoji-list-render.js";
import { createEmojiListInteraction } from "../explorer/emoji/emoji-list-interaction.js";
import { createListController } from "../explorer/emoji/list-controller.js";
import { updateActiveFilterSummary } from "../explorer/filters/filter-summary.js";
import { popularKeys } from "../explorer/emoji/popular-keys.js";
import * as state from "../state.js";

/** Assemble list rendering, interaction, and active-filter summary behavior. */
export function createListOrchestration(options: any) {
  const providedState = options.state?.();
  const read = (getter: () => any, key: string) => () =>
    providedState?.[key] ?? getter();
  const write = (setter: (value: any) => void, key: string) => (value: any) => {
    if (providedState) providedState[key] = value;
    else setter(value);
  };
  const rendererState = {
    byId: read(state.byId.get, "byId"),
    emojiByKey: read(state.emojiByKey.get, "emojiByKey"),
    focusedEmojiKey: read(state.focusedEmojiKey.get, "focusedEmojiKey"),
    groups: read(state.groups.get, "groups"),
    orderMode: read(state.orderMode.get, "orderMode"),
    popularKeys: () => [...popularKeys],
    searchAnnotations: read(state.searchAnnotations.get, "searchAnnotations"),
    subGroups: read(state.subGroups.get, "subGroups"),
  };
  const {
    asEmojiCell,
    asItem,
    asSequenceItem,
    flushEmojiCellFragment,
    orderedKeys,
  } = createEmojiListRenderers({
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    byId: rendererState.byId,
    displayExplorerLabel: options.displayExplorerLabel,
    displayGroupName: options.displayGroupName,
    displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
    emojiByKey: rendererState.emojiByKey,
    focusedEmojiKey: rendererState.focusedEmojiKey,
    getIntroducedVersion: options.getIntroducedVersion,
    groups: rendererState.groups,
    orderMode: rendererState.orderMode,
    popularKeys: rendererState.popularKeys,
    searchAnnotations: rendererState.searchAnnotations,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTypeOrder: options.sequenceTypeOrder,
    subGroups: rendererState.subGroups,
    translate: options.translate,
    unassigned: options.unassigned,
  });
  rendererState.focusedEmojiKey();
  rendererState.groups();
  rendererState.popularKeys();

  const updateFilterSummary = () =>
    updateActiveFilterSummary({
      activeFilterSummary: options.activeFilterSummary(),
      activeFilterText: options.activeFilterText(),
      displayUnicodeSubGroupName: options.displayUnicodeSubGroupName,
      displayGroupName: options.displayGroupName,
      genderCheckboxes: options.genderCheckboxes(),
      hairCheckboxes: options.hairCheckboxes(),
      latestReleased:
        (providedState?.versionManifests ?? state.versionManifests.get()).at(-1)
          ?.version,
      orderMode: providedState?.orderMode ?? state.orderMode.get(),
      searchText: options.searchText().value,
      selectedGroup: providedState?.selectedGroup ?? state.selectedGroup.get(),
      selectedSequenceType:
        providedState?.selectedSequenceType ?? state.selectedSequenceType.get(),
      selectedSubGroup:
        providedState?.selectedSubGroup ?? state.selectedSubGroup.get(),
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
    allIds: read(state.allIds.get, "allIds"),
    byId: rendererState.byId,
    emojiByKey: rendererState.emojiByKey,
    focusedEmojiKey: rendererState.focusedEmojiKey,
    formatNumber: options.formatNumber,
    genderCheckboxes: options.genderCheckboxes,
    getVersionKeys: options.getVersionKeys,
    hairCheckboxes: options.hairCheckboxes,
    items: read(state.items.get, "items"),
    matchCount: options.matchCount,
    nextRenderGeneration: options.nextRenderGeneration,
    orderMode: rendererState.orderMode,
    popularKeys: () => [...popularKeys],
    orderedKeys,
    renderEmojiList: (...args: any[]) => renderEmojiList(...args),
    searchAnnotations: rendererState.searchAnnotations,
    searchText: options.searchText,
    selectedGroup: read(state.selectedGroup.get, "selectedGroup"),
    selectedSearchLocale: read(
      state.selectedSearchLocale.get,
      "selectedSearchLocale",
    ),
    selectedSequenceType: read(
      state.selectedSequenceType.get,
      "selectedSequenceType",
    ),
    selectedSubGroup: read(state.selectedSubGroup.get, "selectedSubGroup"),
    setDisplayedKeys: write(state.displayedKeys.set, "displayedKeys"),
    setFocusedEmojiKey: write(state.focusedEmojiKey.set, "focusedEmojiKey"),
    skinToneCheckboxes: options.skinToneCheckboxes,
    subGroupSelectionKey: options.subGroupSelectionKey,
    syncUrlState: options.syncUrlState,
    updateDialogNavigation: options.updateDialogNavigation,
    updateFilterSummary,
  });
  const { draw: drawList, schedule: scheduleSearchDraw } = list;

  const interactionState = {
    focusedEmojiKey: read(state.focusedEmojiKey.get, "focusedEmojiKey"),
    getDisplayedKeys: read(state.displayedKeys.get, "displayedKeys"),
    orderMode: rendererState.orderMode,
    setFocusedEmojiKey: write(state.focusedEmojiKey.set, "focusedEmojiKey"),
  };
  const interaction = createEmojiListInteraction({
    asItem: (renderState, key) => asItem(renderState, key, providedState ?? state),
    asSequenceItem: (renderState, key) =>
      asSequenceItem(renderState, key, providedState ?? state),
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
  interactionState.focusedEmojiKey();
  interactionState.getDisplayedKeys();
  interactionState.orderMode();
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
