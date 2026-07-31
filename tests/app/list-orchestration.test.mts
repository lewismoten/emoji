import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// coverage target: ../../../src/app/list-orchestration.js

const root = process.cwd();
const sourceText = await fs.readFile(
  path.join(root, "src/app/list-orchestration.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import { createEmojiListRenderers } from "../explorer/emoji/emoji-list-render.js";',
    'import { createEmojiListRenderers } from "./emoji-list-render-stub.mjs";',
  )
  .replace(
    'import { createEmojiListInteraction } from "../explorer/emoji/emoji-list-interaction.js";',
    'import { createEmojiListInteraction } from "./emoji-list-interaction-stub.mjs";',
  )
  .replace(
    'import { createListController } from "../explorer/emoji/list-controller.js";',
    'import { createListController } from "./list-controller-stub.mjs";',
  )
  .replace(
    'import { updateActiveFilterSummary } from "../explorer/filters/filter-summary.js";',
    'import { updateActiveFilterSummary } from "./filter-summary-stub.mjs";',
  )
  .replace(
    'import { popularKeys } from "../explorer/emoji/popular-keys.js";',
    'import { popularKeys } from "./popular-keys-stub.mjs";',
  )
  .replace(/options: any/g, "options")
  .replace(
    /let renderEmojiList: \(\.\.\.args: any\[\]\) => void;/g,
    "let renderEmojiList;",
  )
  .replace(/args: any\[\]/g, "args")
  .replace(/\.\.\.args: any\[\]/g, "...args")
  .replace(/keys: string\[\]/g, "keys")
  .replace(/key: string/g, "key");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "list-orchestration-test-"),
);

const writeStub = async (filename: string, lines: string[]) => {
  await fs.writeFile(
    path.join(tempDirectory, filename),
    `${lines.join("\n")}\n`,
  );
};

await writeStub("popular-keys-stub.mjs", [
  "export const popularKeys = ['wave', 'sparkles'];",
]);
await writeStub("emoji-list-render-stub.mjs", [
  "export const calls = [];",
  "export function createEmojiListRenderers(options) {",
  "  calls.push(options);",
  "  return {",
  "    asEmojiCell: 'as-emoji-cell',",
  "    asItem: 'as-item',",
  "    asSequenceItem: 'as-sequence-item',",
  "    flushEmojiCellFragment: 'flush-emoji-cell-fragment',",
  "    orderedKeys: 'ordered-keys',",
  "  };",
  "}",
]);
await writeStub("list-controller-stub.mjs", [
  "export const calls = [];",
  "export function createListController(options) {",
  "  calls.push(options);",
  "  return {",
  "    draw: (...args) => ['draw-list', args],",
  "    schedule: (...args) => ['schedule-search-draw', args],",
  "  };",
  "}",
]);
await writeStub("emoji-list-interaction-stub.mjs", [
  "export const calls = [];",
  "export function createEmojiListInteraction(options) {",
  "  calls.push(options);",
  "  return {",
  "    renderEmojiList: (...args) => ['render-emoji-list', args],",
  "    onEmojiFocus: (...args) => ['on-emoji-focus', args],",
  "    onEmojiKeyDown: (...args) => ['on-emoji-key-down', args],",
  "  };",
  "}",
]);
await writeStub("filter-summary-stub.mjs", [
  "export const calls = [];",
  "export function updateActiveFilterSummary(options) {",
  "  calls.push(options);",
  "  return ['update-active-filter-summary', options];",
  "}",
]);
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
const listControllerStub = await import(
  pathToFileURL(path.join(tempDirectory, "list-controller-stub.mjs")).href
);
const interactionStub = await import(
  pathToFileURL(path.join(tempDirectory, "emoji-list-interaction-stub.mjs"))
    .href
);
const summaryStub = await import(
  pathToFileURL(path.join(tempDirectory, "filter-summary-stub.mjs")).href
);
const { createListOrchestration } =
  module as typeof import("../../src/app/list-orchestration.js");

const state = {
  byId: { wave: { key: "wave" } },
  emojiByKey: { wave: "👋" },
  focusedEmojiKey: "wave",
  groups: ["Objects"],
  orderMode: "grouped",
  searchAnnotations: { wave: ["hello"] },
  subGroups: ["mail"],
  versionManifests: [{ version: "16.0" }, { version: "17.0" }],
  allIds: ["wave", "sparkles"],
  items: [{ key: "wave" }],
  displayedKeys: ["wave"],
  selectedGroup: "Objects",
  selectedSequenceType: "zwj",
  selectedSubGroup: "mail",
  selectedSearchLocale: "en",
};

const runtime = createListOrchestration({
  applyPixelArtworkClass: "apply-pixel-artwork-class",
  state: () => state,
  displayExplorerLabel: "display-explorer-label",
  displayGroupName: "display-group-name",
  displayUnicodeSubGroupName: "display-unicode-subgroup-name",
  getIntroducedVersion: "get-introduced-version",
  sequenceTranslationKeys: "sequence-translation-keys",
  sequenceTypeLabels: "sequence-type-labels",
  sequenceTypeOrder: "sequence-type-order",
  translate: "translate",
  unassigned: "unassigned",
  activeFilterSummary: () => "active-filter-summary",
  activeFilterText: () => "active-filter-text",
  genderCheckboxes: () => ["neutral"],
  hairCheckboxes: () => ["red"],
  searchText: () => ({ value: "smile" }),
  skinToneCheckboxes: () => ["1F3FB"],
  versionModeSelector: () => ({ value: "selected" }),
  versionSliderLabel: "version-slider-label",
  versionSelector: () => ({ value: "17.0" }),
  formatNumber: "format-number",
  matchCount: "match-count",
  getVersionKeys: "get-version-keys",
  nextRenderGeneration: "next-render-generation",
  subGroupSelectionKey: "subgroup-selection-key",
  syncUrlState: "sync-url-state",
  updateDialogNavigation: "update-dialog-navigation",
  emojiList: "emoji-list",
  renderGeneration: "render-generation",
  onClick: "on-click",
  resetFilters: "reset-filters",
  revealExplorer: "reveal-explorer",
});

assert.equal(renderStub.calls.length, 1);
assert.equal(listControllerStub.calls.length, 1);
assert.equal(interactionStub.calls.length, 1);

const renderCall = renderStub.calls[0];
assert.equal(renderCall.applyPixelArtworkClass, "apply-pixel-artwork-class");
assert.equal(renderCall.byId().wave.key, "wave");
assert.equal(renderCall.emojiByKey().wave, "👋");
assert.equal(renderCall.focusedEmojiKey(), "wave");
assert.deepEqual(renderCall.groups(), ["Objects"]);
assert.equal(renderCall.orderMode(), "grouped");
assert.deepEqual(renderCall.popularKeys(), ["wave", "sparkles"]);
assert.deepEqual(renderCall.searchAnnotations(), { wave: ["hello"] });
assert.deepEqual(renderCall.subGroups(), ["mail"]);

const listCall = listControllerStub.calls[0];
assert.deepEqual(listCall.allIds(), ["wave", "sparkles"]);
assert.equal(listCall.byId().wave.key, "wave");
assert.equal(listCall.emojiByKey().wave, "👋");
assert.equal(listCall.focusedEmojiKey(), "wave");
assert.equal(listCall.formatNumber, "format-number");
assert.equal(listCall.getVersionKeys, "get-version-keys");
assert.equal(listCall.matchCount, "match-count");
assert.equal(listCall.orderedKeys, "ordered-keys");
assert.equal(listCall.orderMode(), "grouped");
assert.deepEqual(listCall.popularKeys(), ["wave", "sparkles"]);
assert.deepEqual(listCall.items(), [{ key: "wave" }]);
assert.deepEqual(listCall.searchText(), { value: "smile" });
assert.equal(listCall.selectedGroup(), "Objects");
assert.equal(listCall.selectedSequenceType(), "zwj");
assert.equal(listCall.selectedSubGroup(), "mail");
assert.equal(listCall.selectedSearchLocale(), "en");
listCall.setDisplayedKeys(["sparkles"]);
listCall.setFocusedEmojiKey("sparkles");
assert.deepEqual(state.displayedKeys, ["sparkles"]);
assert.equal(state.focusedEmojiKey, "sparkles");
assert.equal(listCall.subGroupSelectionKey, "subgroup-selection-key");
assert.equal(listCall.syncUrlState, "sync-url-state");
assert.equal(listCall.updateDialogNavigation, "update-dialog-navigation");
assert.deepEqual(listCall.renderEmojiList("a"), ["render-emoji-list", ["a"]]);
assert.deepEqual(listCall.updateFilterSummary(), [
  "update-active-filter-summary",
  summaryStub.calls[0],
]);

const interactionCall = interactionStub.calls[0];
assert.equal(interactionCall.asItem, "as-item");
assert.equal(interactionCall.asSequenceItem, "as-sequence-item");
assert.equal(interactionCall.drawList, runtime.drawList);
assert.equal(interactionCall.emojiList, "emoji-list");
assert.equal(
  interactionCall.flushEmojiCellFragment,
  "flush-emoji-cell-fragment",
);
assert.equal(interactionCall.focusedEmojiKey(), "sparkles");
assert.deepEqual(interactionCall.getDisplayedKeys(), ["sparkles"]);
assert.equal(interactionCall.nextRenderGeneration, "next-render-generation");
assert.equal(interactionCall.onClick, "on-click");
assert.equal(interactionCall.orderMode(), "grouped");
assert.equal(interactionCall.renderGeneration, "render-generation");
assert.equal(interactionCall.resetFilters, "reset-filters");
assert.equal(interactionCall.revealExplorer, "reveal-explorer");
assert.deepEqual(interactionCall.searchText(), { value: "smile" });
interactionCall.setFocusedEmojiKey("wave");
assert.equal(state.focusedEmojiKey, "wave");

const runtimeApi = runtime as any;
assert.deepEqual(runtimeApi.drawList("x"), ["draw-list", ["x"]]);
assert.deepEqual(runtimeApi.scheduleSearchDraw("y"), [
  "schedule-search-draw",
  ["y"],
]);
assert.deepEqual(runtimeApi.onEmojiFocus("z"), ["on-emoji-focus", ["z"]]);
assert.deepEqual(runtimeApi.onEmojiKeyDown("k"), ["on-emoji-key-down", ["k"]]);
assert.deepEqual(runtime.updateActiveFilterSummary(), [
  "update-active-filter-summary",
  summaryStub.calls.at(-1),
]);

assert.equal(summaryStub.calls[0].activeFilterSummary, "active-filter-summary");
assert.equal(summaryStub.calls[0].activeFilterText, "active-filter-text");
assert.equal(summaryStub.calls[0].latestReleased, "17.0");
assert.equal(summaryStub.calls[0].orderMode, "grouped");
assert.equal(summaryStub.calls[0].searchText, "smile");
assert.equal(summaryStub.calls[0].selectedGroup, "Objects");
assert.equal(summaryStub.calls[0].selectedSequenceType, "zwj");
assert.equal(summaryStub.calls[0].selectedSubGroup, "mail");
assert.equal(summaryStub.calls[0].versionMode, "selected");
assert.equal(summaryStub.calls[0].versionSliderLabel, "version-slider-label");
assert.equal(summaryStub.calls[0].versionValue, "17.0");
