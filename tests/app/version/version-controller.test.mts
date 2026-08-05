import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// coverage target: ../../../src/app/version/version-controller.js

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const sourceText = await fs.readFile(
  path.join(root, "src/app/version/version-controller.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import {\n  getVersionKeys as getVersionKeysHelper,\n  syncVersionRange as syncVersionRangeHelper,\n  updateModifierAvailability as updateModifierAvailabilityHelper,\n  versionSliderLabel as versionSliderLabelHelper,\n} from "../../explorer/category/category-version.js";',
    'import {\n  getVersionKeys as getVersionKeysHelper,\n  syncVersionRange as syncVersionRangeHelper,\n  updateModifierAvailability as updateModifierAvailabilityHelper,\n  versionSliderLabel as versionSliderLabelHelper,\n} from "./category-version-stub.mjs";',
  )
  .replace(
    'import { populateVersionSelector as populateVersionSelectorHelper } from "../../explorer/filters/version-data.js";',
    'import { populateVersionSelector as populateVersionSelectorHelper } from "./version-data-stub.mjs";',
  )
  .replace(
    'import { createExplorerDataController } from "../data/explorer-data-controller.js";',
    'import { createExplorerDataController } from "./explorer-data-controller-stub.mjs";',
  )
  .replace(
    'import * as state from "../../state.js";',
    'import * as state from "../../../src/state.js";',
  )
  .replace(/options: any/g, "options")
  .replace(/version: string/g, "version");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "version-controller-test-"),
);

await fs.writeFile(
  path.join(tempDirectory, "category-version-stub.mjs"),
  [
    "export const getVersionKeysCalls = [];",
    "export const syncVersionRangeCalls = [];",
    "export const updateModifierAvailabilityCalls = [];",
    "export const versionSliderLabelCalls = [];",
    "export function getVersionKeys(options) {",
    "  getVersionKeysCalls.push(options);",
    "  return ['version-keys-result', options];",
    "}",
    "export function syncVersionRange(options) {",
    "  syncVersionRangeCalls.push(options);",
    "  return ['sync-version-range-result', options];",
    "}",
    "export function updateModifierAvailability(options) {",
    "  updateModifierAvailabilityCalls.push(options);",
    "  return ['update-modifier-availability-result', options];",
    "}",
    "export function versionSliderLabel(version, manifests) {",
    "  versionSliderLabelCalls.push([version, manifests]);",
    "  return `label:${version}:${manifests.length}`;",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "version-data-stub.mjs"),
  [
    "export const populateVersionSelectorCalls = [];",
    "export function populateVersionSelector(options) {",
    "  populateVersionSelectorCalls.push(options);",
    "  return ['populate-version-selector-result', options];",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "explorer-data-controller-stub.mjs"),
  [
    "export const dataControllerCalls = [];",
    "export const dataControllerResult = {",
    "  loadData: (...args) => ['load-data', args],",
    "  loadVersionData: (...args) => ['load-version-data', args],",
    "};",
    "export function createExplorerDataController(options) {",
    "  dataControllerCalls.push(options);",
    "  return dataControllerResult;",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "version-controller.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "version-controller.mjs")).href
);
const categoryStub = await import(
  pathToFileURL(path.join(tempDirectory, "category-version-stub.mjs")).href
);
const versionDataStub = await import(
  pathToFileURL(path.join(tempDirectory, "version-data-stub.mjs")).href
);
const dataControllerStub = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-data-controller-stub.mjs"))
    .href
);

const selector = {
  value: "16.0",
  options: [{ value: "15.0" }, { value: "16.0" }],
};
const range = { value: "1" };
const state = {
  proposedVersionManifests: [{ version: "18.0" }],
  versionManifests: [{ version: "15.0" }, { version: "16.0" }],
  selectedSearchLocale: "en",
  byId: { wave: { key: "wave" } },
  versionKeys: new Map([["16.0", new Set(["wave"])]]),
  releasedIds: new Set(["wave"]),
};
let renderCategoryFiltersCalls = 0;
let drawListCalls = 0;

const controller = module.createVersionController({
  state: () => state,
  translate: "translate",
  versionSelector: () => selector,
  versionModeSelector: () => ({ value: "selected" }),
  versionNext: () => "version-next",
  versionPrevious: () => "version-previous",
  versionRange: () => range,
  versionRangeValue: () => "version-range-value",
  renderCategoryFilters: () => {
    renderCategoryFiltersCalls += 1;
  },
  drawList: () => {
    drawListCalls += 1;
  },
  genderCheckboxes: () => ["neutral"],
  genderFieldset: () => "gender-fieldset",
  getEmojiGenders: "get-emoji-genders",
  hairCheckboxes: () => ["red"],
  hairFieldset: () => "hair-fieldset",
  modifierFilters: () => "modifier-filters",
  skinToneCheckboxes: () => ["1F3FB"],
  skinToneFieldset: () => "skin-tone-fieldset",
  applyLoadedUrlState: "apply-loaded-url-state",
  buildRepresentatives: "build-representatives",
  developerModeEnabled: "developer-mode-enabled",
  getIntroducedVersion: "get-introduced-version",
  groupSelector: () => "group-selector",
  loadCatalog: "load-catalog",
  loadVersionCatalog: "load-version-catalog",
  onGroupChange: "on-group-change",
  onSequenceTypeChange: "on-sequence-type-change",
  onSubGroupChange: "on-subgroup-change",
  openEmoji: "open-emoji",
  rebuildCodePointLookup: "rebuild-code-point-lookup",
  sequenceTypeSelector: () => "sequence-type-selector",
  setIntroducedVersion: "set-introduced-version",
  updateModifierArtwork: "update-modifier-artwork",
});

assert.equal(
  controller.loadData,
  dataControllerStub.dataControllerResult.loadData,
);
assert.equal(
  controller.loadVersionData,
  dataControllerStub.dataControllerResult.loadVersionData,
);

assert.equal(controller.versionSliderLabel("18.0"), "label:18.0:1");
assert.deepEqual(categoryStub.versionSliderLabelCalls, [
  ["18.0", state.proposedVersionManifests],
]);

assert.deepEqual(controller.populateVersionSelector(), [
  "populate-version-selector-result",
  versionDataStub.populateVersionSelectorCalls[0],
]);
assert.equal(
  versionDataStub.populateVersionSelectorCalls[0].proposed,
  state.proposedVersionManifests,
);
assert.equal(
  versionDataStub.populateVersionSelectorCalls[0].released,
  state.versionManifests,
);
assert.equal(
  versionDataStub.populateVersionSelectorCalls[0].selectedLocale,
  "en",
);
assert.equal(
  versionDataStub.populateVersionSelectorCalls[0].selector,
  selector,
);
assert.equal(
  versionDataStub.populateVersionSelectorCalls[0].translate,
  "translate",
);
assert.deepEqual(versionDataStub.populateVersionSelectorCalls[0].syncRange(), [
  "sync-version-range-result",
  categoryStub.syncVersionRangeCalls[0],
]);

assert.deepEqual(controller.syncVersionRange(), [
  "sync-version-range-result",
  categoryStub.syncVersionRangeCalls.at(-1),
]);
assert.equal(
  categoryStub.syncVersionRangeCalls.at(-1).proposedVersionManifests,
  state.proposedVersionManifests,
);
assert.equal(
  categoryStub.syncVersionRangeCalls.at(-1).versionSelector,
  selector,
);

assert.deepEqual(controller.updateModifierAvailability(), [
  "update-modifier-availability-result",
  categoryStub.updateModifierAvailabilityCalls[0],
]);
assert.equal(categoryStub.updateModifierAvailabilityCalls[0].byId, state.byId);
assert.equal(
  categoryStub.updateModifierAvailabilityCalls[0].versionValue,
  "16.0",
);

assert.deepEqual(controller.getVersionKeys(), [
  "version-keys-result",
  categoryStub.getVersionKeysCalls[0],
]);
assert.equal(categoryStub.getVersionKeysCalls[0].versionMode, "selected");
assert.equal(categoryStub.getVersionKeysCalls[0].versionValue, "16.0");

controller.onVersionRangeInput();
assert.equal(selector.value, "16.0");
assert.equal(renderCategoryFiltersCalls, 1);
assert.equal(drawListCalls, 1);

range.value = "99";
controller.onVersionRangeInput();
assert.equal(renderCategoryFiltersCalls, 1);
assert.equal(drawListCalls, 1);

assert.equal(dataControllerStub.dataControllerCalls.length, 1);
const dataCall = dataControllerStub.dataControllerCalls[0];
assert.equal(dataCall.applyLoadedUrlState, "apply-loaded-url-state");
assert.equal(dataCall.buildRepresentatives, "build-representatives");
assert.equal(dataCall.developerModeEnabled, "developer-mode-enabled");
assert.equal(typeof dataCall.drawList, "function");
assert.equal(dataCall.getEmojiGenders, "get-emoji-genders");
assert.equal(dataCall.getVersionKeys, categoryStub.getVersionKeys);
assert.equal(dataCall.loadCatalog, "load-catalog");
assert.equal(dataCall.loadVersionCatalog, "load-version-catalog");
assert.equal(
  dataCall.populateVersionSelector,
  versionDataStub.populateVersionSelector,
);
assert.equal(
  dataCall.proposedVersionManifests(),
  state.proposedVersionManifests,
);
assert.equal(dataCall.syncVersionRange, categoryStub.syncVersionRange);
assert.equal(
  dataCall.updateModifierAvailability,
  categoryStub.updateModifierAvailability,
);
