import assert from "node:assert/strict";
import { describe, it } from "vitest";

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
} from "../../src/explorer/explorer-labels.js";

describe("explorer-labels", () => {
  it("exports the expected language, sequence, and label metadata", () => {
    assert.equal(languageFlags.ar, "🇸🇦");
    assert.equal(languageFlags["en-GB"], "🇬🇧");
    assert.equal(unicodeGroupLabelKeys["Food & Drink"], "food_drink");
    assert.equal(unicodeSubgroupLabelKeys["face-smiling"], "smiley");
    assert.deepEqual(sequenceTypeOrder, [
      "single",
      "modifier",
      "zwj",
      "flag",
      "keycap",
      "tag",
    ]);
    for (const type of sequenceTypeOrder) {
      assert.ok(sequenceTypeLabels[type]);
      assert.ok(sequenceTranslationKeys[type]);
      assert.ok(sequenceTypeEmoji[type]);
    }
    assert.equal(statusTranslationKeys["fully-qualified"], "fullyQualified");
    assert.equal(explorerLabelKeys["Other Flags"], "otherFlags");
    assert.deepEqual(
      versionModeDefinitions.map((mode) => mode.value),
      ["through", "selected"],
    );
  });
});
