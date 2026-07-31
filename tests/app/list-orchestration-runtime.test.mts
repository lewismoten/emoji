import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const sourcePath = path.join(root, "build/src/app/list-orchestration.js");
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source
  .replace(
    'import { createEmojiListRenderers } from "../explorer/emoji/emoji-list-render.js";',
    'import { createEmojiListRenderers, renderCalls } from "./emoji-list-render-stub.mjs";',
  )
  .replace(
    'import { createEmojiListInteraction } from "../explorer/emoji/emoji-list-interaction.js";',
    'import { createEmojiListInteraction, interactionCalls } from "./emoji-list-interaction-stub.mjs";',
  )
  .replace(
    'import { createListController } from "../explorer/emoji/list-controller.js";',
    'import { createListController, listCalls } from "./list-controller-stub.mjs";',
  )
  .replace(
    'import { updateActiveFilterSummary } from "../explorer/filters/filter-summary.js";',
    'import { updateActiveFilterSummary, summaryCalls } from "./filter-summary-stub.mjs";',
  )
  .replace(
    'import { popularKeys } from "../explorer/emoji/popular-keys.js";',
    'import { popularKeys } from "./popular-keys-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "list-orchestration-runtime-"),
);

await fs.writeFile(
  path.join(tempDirectory, "popular-keys-stub.mjs"),
  `export const popularKeys = ["wave", "sparkles"];`,
);

await fs.writeFile(
  path.join(tempDirectory, "emoji-list-render-stub.mjs"),
  `export const renderCalls = [];
export function createEmojiListRenderers(options) {
  renderCalls.push(options);
  return {
    asEmojiCell: "as-emoji-cell",
    asItem: "as-item",
    asSequenceItem: "as-sequence-item",
    flushEmojiCellFragment: "flush-emoji-cell-fragment",
    orderedKeys: (...args) => ["ordered-keys", ...args],
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "list-controller-stub.mjs"),
  `export const listCalls = [];
export function createListController(options) {
  listCalls.push(options);
  return {
    draw: (...args) => ["draw-list", ...args],
    schedule: (...args) => ["schedule-search-draw", ...args],
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "emoji-list-interaction-stub.mjs"),
  `export const interactionCalls = [];
export function createEmojiListInteraction(options) {
  interactionCalls.push(options);
  return {
    renderEmojiList: (...args) => ["render-emoji-list", ...args],
    onEmojiFocus: (...args) => ["on-emoji-focus", ...args],
    onEmojiKeyDown: (...args) => ["on-emoji-key-down", ...args],
  };
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "filter-summary-stub.mjs"),
  `export const summaryCalls = [];
export function updateActiveFilterSummary(options) {
  summaryCalls.push(options);
  return ["update-active-filter-summary", options];
}`,
);

await fs.writeFile(
  path.join(tempDirectory, "list-orchestration.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "list-orchestration.mjs")).href
);
const renderStub = await import(
  pathToFileURL(path.join(tempDirectory, "emoji-list-render-stub.mjs")).href
);
const listStub = await import(
  pathToFileURL(path.join(tempDirectory, "list-controller-stub.mjs")).href
);
const interactionStub = await import(
  pathToFileURL(path.join(tempDirectory, "emoji-list-interaction-stub.mjs"))
    .href
);
const summaryStub = await import(
  pathToFileURL(path.join(tempDirectory, "filter-summary-stub.mjs")).href
);

const state: any = {
  allIds: new Set(["wave", "sparkles"]),
  byId: { wave: { key: "wave" } },
  displayedKeys: ["wave"],
  emojiByKey: { wave: "👋", sparkles: "✨" },
  focusedEmojiKey: "wave",
  groups: ["Objects"],
  items: [{ key: "wave" }],
  orderMode: "grouped",
  searchAnnotations: { wave: ["hello"] },
  selectedGroup: "Objects",
  selectedSearchLocale: "en",
  selectedSequenceType: "zwj",
  selectedSubGroup: "mail",
  subGroups: { Objects: ["mail"] },
  versionManifests: [{ version: "16.0" }, { version: "17.0" }],
};

const options: any = {
  activeFilterSummary: () => "active-filter-summary",
  activeFilterText: () => "active-filter-text",
  applyPixelArtworkClass: "apply-pixel-artwork-class",
  displayExplorerLabel: "display-explorer-label",
  displayGroupName: "display-group-name",
  displayUnicodeSubGroupName: "display-unicode-subgroup-name",
  formatNumber: "format-number",
  genderCheckboxes: () => ["neutral"],
  getIntroducedVersion: "get-introduced-version",
  getVersionKeys: "get-version-keys",
  hairCheckboxes: () => ["red"],
  matchCount: "match-count",
  nextRenderGeneration: "next-render-generation",
  onClick: "on-click",
  emojiList: "emoji-list",
  renderGeneration: "render-generation",
  resetFilters: "reset-filters",
  revealExplorer: "reveal-explorer",
  searchText: () => ({ value: "smile" }),
  sequenceTranslationKeys: "sequence-translation-keys",
  sequenceTypeLabels: "sequence-type-labels",
  sequenceTypeOrder: "sequence-type-order",
  skinToneCheckboxes: () => ["1F3FB"],
  state: () => state,
  subGroupSelectionKey: "subgroup-selection-key",
  syncUrlState: "sync-url-state",
  translate: "translate",
  unassigned: "unassigned",
  updateDialogNavigation: "update-dialog-navigation",
  versionModeSelector: () => ({ value: "selected" }),
  versionSelector: () => ({ value: "17.0" }),
  versionSliderLabel: "version-slider-label",
};

const runtime = module.createListOrchestration(options);

const renderOptions = renderStub.renderCalls[0];
const listOptions = listStub.listCalls[0];
const interactionOptions = interactionStub.interactionCalls[0];

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
assert.equal(listOptions.genderCheckboxes, options.genderCheckboxes);
assert.equal(listOptions.getVersionKeys, "get-version-keys");
assert.equal(listOptions.hairCheckboxes, options.hairCheckboxes);
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
assert.equal(listOptions.skinToneCheckboxes, options.skinToneCheckboxes);
assert.equal(listOptions.subGroupSelectionKey, "subgroup-selection-key");
assert.equal(listOptions.syncUrlState, "sync-url-state");
assert.equal(listOptions.updateDialogNavigation, "update-dialog-navigation");
assert.deepEqual(listOptions.renderEmojiList("a", "b"), [
  "render-emoji-list",
  "a",
  "b",
]);
assert.deepEqual(listOptions.updateFilterSummary(), [
  "update-active-filter-summary",
  summaryStub.summaryCalls[0],
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
assert.deepEqual(runtime.updateActiveFilterSummary(), [
  "update-active-filter-summary",
  summaryStub.summaryCalls.at(-1),
]);

assert.equal(
  summaryStub.summaryCalls[0].activeFilterSummary,
  "active-filter-summary",
);
assert.equal(
  summaryStub.summaryCalls[0].activeFilterText,
  "active-filter-text",
);
assert.equal(
  summaryStub.summaryCalls[0].displayGroupName,
  "display-group-name",
);
assert.equal(
  summaryStub.summaryCalls[0].displayUnicodeSubGroupName,
  "display-unicode-subgroup-name",
);
assert.deepEqual(summaryStub.summaryCalls[0].genderCheckboxes, ["neutral"]);
assert.deepEqual(summaryStub.summaryCalls[0].hairCheckboxes, ["red"]);
assert.equal(summaryStub.summaryCalls[0].latestReleased, "17.0");
assert.equal(summaryStub.summaryCalls[0].orderMode, "grouped");
assert.equal(summaryStub.summaryCalls[0].searchText, "smile");
assert.equal(summaryStub.summaryCalls[0].selectedGroup, "Objects");
assert.equal(summaryStub.summaryCalls[0].selectedSequenceType, "zwj");
assert.equal(summaryStub.summaryCalls[0].selectedSubGroup, "mail");
assert.equal(
  summaryStub.summaryCalls[0].sequenceTranslationKeys,
  "sequence-translation-keys",
);
assert.equal(
  summaryStub.summaryCalls[0].sequenceTypeLabels,
  "sequence-type-labels",
);
assert.deepEqual(summaryStub.summaryCalls[0].skinToneCheckboxes, ["1F3FB"]);
assert.equal(summaryStub.summaryCalls[0].translate, "translate");
assert.equal(summaryStub.summaryCalls[0].versionMode, "selected");
assert.equal(
  summaryStub.summaryCalls[0].versionSliderLabel,
  "version-slider-label",
);
assert.equal(summaryStub.summaryCalls[0].versionValue, "17.0");
