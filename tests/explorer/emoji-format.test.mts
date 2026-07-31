import assert from "node:assert/strict";
import {
  displayEmojiKey,
  formatCompositionReduction,
  formatUiNumber,
  formatUiPercent,
  normalizeCodePoints,
  normalizeDisplayName,
} from "../../src/explorer/emoji/emoji-format.js";

assert.equal(
  displayEmojiKey("smilingFaceWithHearts"),
  "Smiling face with hearts",
);
assert.equal(
  normalizeDisplayName("Smiling Face: Hearts!"),
  "smiling face hearts",
);
assert.equal(
  normalizeDisplayName(" Voilà — Café "),
  "voilà café",
);
assert.equal(normalizeCodePoints("1f44d   fe0f"), "1F44D FE0F");
assert.equal(normalizeCodePoints(null), "");
assert.equal(formatUiNumber(3953, "en"), "3,953");
assert.equal(formatUiNumber(12), "12");
assert.equal(formatUiNumber(12, "ar", "arab"), "١٢");
assert.equal(formatUiPercent(0.74, "en"), "74%");
assert.equal(formatUiPercent(0.125), "13%");
assert.equal(formatUiPercent(0.5, "ar", "arab"), "٥٠٪؜");
assert.equal(
  formatCompositionReduction(3, 1, {
    dir: "rtl",
    locale: "ar",
    numberingSystem: "arab",
  }),
  "١←٣",
);
assert.equal(formatCompositionReduction(3, 1), "3→1");
