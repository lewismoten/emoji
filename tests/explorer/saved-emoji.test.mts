import assert from "node:assert/strict";
import {
  nextCopiedEmojiKeys,
  nextFavoriteEmojiKeys,
  savedEmojiLabel,
} from "../../src/explorer/saved-emoji.js";

assert.deepEqual(nextFavoriteEmojiKeys(["wave"], "grinningFace"), [
  "grinningFace",
  "wave",
]);
assert.deepEqual(nextFavoriteEmojiKeys(["wave", "grinningFace"], "wave"), [
  "grinningFace",
]);
assert.deepEqual(nextFavoriteEmojiKeys(["wave"], ""), ["wave"]);

assert.deepEqual(nextCopiedEmojiKeys(["wave", "grinningFace"], "wave"), [
  "wave",
  "grinningFace",
]);
assert.equal(
  nextCopiedEmojiKeys(
    Array.from({ length: 30 }, (_, i) => `${i}`),
    "new",
  ).length,
  24,
);

assert.equal(
  savedEmojiLabel(
    "grinningFace",
    { grinningFace: ["Grinning face"] },
    { grinningFace: { shortName: "should not win" } },
  ),
  "Grinning face",
);
assert.equal(savedEmojiLabel("wrappedGift", {}, {}), "Wrapped gift");
