import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function loadListOrchestrationFixture() {
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
    )
    .replace(
      'import * as state from "../state.js";',
      'import * as state from "../../../src/state.js";',
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
  return {
    interactionOptions: interactionStub.interactionCalls[0],
    listOptions: listStub.listCalls[0],
    renderOptions: renderStub.renderCalls[0],
    runtime,
    state,
    summaryCalls: summaryStub.summaryCalls,
  };
}
