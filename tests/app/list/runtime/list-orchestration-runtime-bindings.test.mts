import assert from "node:assert/strict";
import { loadListOrchestrationFixture } from "./list-orchestration-runtime-fixture.mjs";

const { interactionOptions, listOptions, renderOptions, runtime, state } =
  await loadListOrchestrationFixture();

assert.equal(renderOptions.applyPixelArtworkClass, "apply-pixel-artwork-class");
assert.deepEqual(renderOptions.byId(), state.byId);
assert.equal(renderOptions.displayExplorerLabel, "display-explorer-label");
assert.equal(renderOptions.displayGroupName, "display-group-name");
assert.equal(
  renderOptions.displayUnicodeSubGroupName,
  "display-unicode-subgroup-name",
);
assert.deepEqual(renderOptions.emojiByKey(), state.emojiByKey);
assert.equal(renderOptions.focusedEmojiKey(), "wave");
assert.equal(renderOptions.getIntroducedVersion, "get-introduced-version");
assert.deepEqual(renderOptions.groups(), ["Objects"]);
assert.equal(renderOptions.orderMode(), "grouped");
assert.deepEqual(renderOptions.popularKeys(), ["wave", "sparkles"]);
assert.deepEqual(renderOptions.searchAnnotations(), { wave: ["hello"] });
assert.equal(
  renderOptions.sequenceTranslationKeys,
  "sequence-translation-keys",
);
assert.equal(renderOptions.sequenceTypeLabels, "sequence-type-labels");
assert.equal(renderOptions.sequenceTypeOrder, "sequence-type-order");
assert.deepEqual(renderOptions.subGroups(), { Objects: ["mail"] });
assert.equal(renderOptions.translate, "translate");
assert.equal(renderOptions.unassigned, "unassigned");

assert.deepEqual(Array.from(listOptions.allIds()), ["wave", "sparkles"]);
assert.deepEqual(listOptions.byId(), state.byId);
assert.deepEqual(listOptions.emojiByKey(), state.emojiByKey);
assert.equal(listOptions.focusedEmojiKey(), "wave");
assert.equal(listOptions.formatNumber, "format-number");
assert.equal(listOptions.genderCheckboxes, listOptions.genderCheckboxes);
assert.equal(listOptions.getVersionKeys, "get-version-keys");
assert.deepEqual(listOptions.items(), [{ key: "wave" }]);
assert.equal(listOptions.matchCount, "match-count");
assert.equal(listOptions.nextRenderGeneration, "next-render-generation");
assert.equal(listOptions.orderMode(), "grouped");
assert.deepEqual(listOptions.popularKeys(), ["wave", "sparkles"]);
assert.deepEqual(listOptions.orderedKeys("x"), ["ordered-keys", "x"]);
assert.deepEqual(listOptions.searchAnnotations(), { wave: ["hello"] });
assert.deepEqual(listOptions.searchText(), { value: "smile" });
assert.equal(listOptions.selectedGroup(), "Objects");
assert.equal(listOptions.selectedSearchLocale(), "en");
assert.equal(listOptions.selectedSequenceType(), "zwj");
assert.equal(listOptions.selectedSubGroup(), "mail");
listOptions.setDisplayedKeys(["sparkles"]);
listOptions.setFocusedEmojiKey("sparkles");
assert.deepEqual(state.displayedKeys, ["sparkles"]);
assert.equal(state.focusedEmojiKey, "sparkles");
assert.equal(listOptions.subGroupSelectionKey, "subgroup-selection-key");
assert.equal(listOptions.syncUrlState, "sync-url-state");
assert.equal(listOptions.updateDialogNavigation, "update-dialog-navigation");
assert.deepEqual(listOptions.renderEmojiList("a", "b"), [
  "render-emoji-list",
  "a",
  "b",
]);

assert.equal(interactionOptions.asItem, "as-item");
assert.equal(interactionOptions.asSequenceItem, "as-sequence-item");
assert.deepEqual(interactionOptions.drawList("x"), ["draw-list", "x"]);
assert.equal(interactionOptions.emojiList, "emoji-list");
assert.equal(
  interactionOptions.flushEmojiCellFragment,
  "flush-emoji-cell-fragment",
);
assert.equal(interactionOptions.focusedEmojiKey(), "sparkles");
assert.deepEqual(interactionOptions.getDisplayedKeys(), ["sparkles"]);
assert.equal(interactionOptions.nextRenderGeneration, "next-render-generation");
assert.equal(interactionOptions.onClick, "on-click");
assert.equal(interactionOptions.orderMode(), "grouped");
assert.equal(interactionOptions.renderGeneration, "render-generation");
assert.equal(interactionOptions.resetFilters, "reset-filters");
assert.equal(interactionOptions.revealExplorer, "reveal-explorer");
assert.deepEqual(interactionOptions.searchText(), { value: "smile" });
interactionOptions.setFocusedEmojiKey("wave");
assert.equal(state.focusedEmojiKey, "wave");
assert.equal(interactionOptions.translate, "translate");
assert.equal(interactionOptions.unassigned, "unassigned");

assert.deepEqual(runtime.drawList("list"), ["draw-list", "list"]);
assert.deepEqual(runtime.scheduleSearchDraw("schedule"), [
  "schedule-search-draw",
  "schedule",
]);
assert.deepEqual(runtime.onEmojiFocus("focus"), ["on-emoji-focus", "focus"]);
assert.deepEqual(runtime.onEmojiKeyDown("keydown"), [
  "on-emoji-key-down",
  "keydown",
]);
