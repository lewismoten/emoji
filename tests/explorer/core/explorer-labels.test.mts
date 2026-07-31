import assert from "node:assert/strict";
import {
  explorerLabelKeys,
  languageFlags,
  sequenceTranslationKeys,
  sequenceTypeEmoji,
  sequenceTypeLabels,
  sequenceTypeOrder,
  statusTranslationKeys,
  unicodeGroupLabelKeys,
  unicodeSubgroupLabelKeys,
  versionModeDefinitions,
} from "../../../src/explorer/explorer-labels.js";

assert.equal(languageFlags.en, "🇺🇸");
assert.equal(languageFlags["en-GB"], "🇬🇧");
assert.equal(languageFlags.ar, "🇸🇦");

assert.equal(unicodeGroupLabelKeys.Objects, "objects");
assert.equal(unicodeGroupLabelKeys["People & Body"], "person");

assert.equal(unicodeSubgroupLabelKeys["country-flag"], "flags");
assert.equal(unicodeSubgroupLabelKeys["food-asian"], "food_drink");
assert.equal(unicodeSubgroupLabelKeys["skin-tone"], "modifier");

assert.deepEqual(sequenceTypeOrder, Object.keys(sequenceTypeLabels));
assert.equal(sequenceTypeLabels.single, "Single emoji");
assert.equal(sequenceTypeLabels.tag, "Tag sequences");
assert.equal(sequenceTranslationKeys.zwj, "sequenceZwj");
assert.equal(sequenceTypeEmoji.flag, "🏳️");

assert.equal(statusTranslationKeys["fully-qualified"], "fullyQualified");
assert.equal(statusTranslationKeys.unqualified, "unqualified");

assert.equal(explorerLabelKeys.Africa, "africa");
assert.equal(explorerLabelKeys["Hats & Headwear"], "hatsHeadwear");

assert.deepEqual(versionModeDefinitions, [
  {
    value: "through",
    key: "throughSelectedVersion",
    fallback: "All up to selected version",
  },
  {
    value: "selected",
    key: "selectedVersionOnly",
    fallback: "Selected version only",
  },
]);
