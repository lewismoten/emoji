import assert from "node:assert/strict";
import { loadListOrchestrationFixture } from "./list-orchestration-runtime-fixture.mjs";

const { listOptions, runtime, summaryCalls } =
  await loadListOrchestrationFixture();

assert.deepEqual(listOptions.updateFilterSummary(), [
  "update-active-filter-summary",
  summaryCalls[0],
]);
assert.deepEqual(runtime.updateActiveFilterSummary(), [
  "update-active-filter-summary",
  summaryCalls.at(-1),
]);

assert.equal(summaryCalls[0].activeFilterSummary, "active-filter-summary");
assert.equal(summaryCalls[0].activeFilterText, "active-filter-text");
assert.equal(summaryCalls[0].displayGroupName, "display-group-name");
assert.equal(
  summaryCalls[0].displayUnicodeSubGroupName,
  "display-unicode-subgroup-name",
);
assert.deepEqual(summaryCalls[0].genderCheckboxes, ["neutral"]);
assert.deepEqual(summaryCalls[0].hairCheckboxes, ["red"]);
assert.equal(summaryCalls[0].latestReleased, "17.0");
assert.equal(summaryCalls[0].orderMode, "grouped");
assert.equal(summaryCalls[0].searchText, "smile");
assert.equal(summaryCalls[0].selectedGroup, "Objects");
assert.equal(summaryCalls[0].selectedSequenceType, "zwj");
assert.equal(summaryCalls[0].selectedSubGroup, "mail");
assert.equal(
  summaryCalls[0].sequenceTranslationKeys,
  "sequence-translation-keys",
);
assert.equal(summaryCalls[0].sequenceTypeLabels, "sequence-type-labels");
assert.deepEqual(summaryCalls[0].skinToneCheckboxes, ["1F3FB"]);
assert.equal(summaryCalls[0].translate, "translate");
assert.equal(summaryCalls[0].versionMode, "selected");
assert.equal(summaryCalls[0].versionSliderLabel, "version-slider-label");
assert.equal(summaryCalls[0].versionValue, "17.0");
