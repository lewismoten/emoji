import assert from "node:assert/strict";
import {
  compositionReductionLabel,
  compositionTitle,
  condenseCompositionPoints,
  describeCompositionPoint,
  findCompositionArtworkKey,
  findCompositionEmojiKey,
  isCondensedSequenceControl,
} from "../../src/explorer/composition-helpers.js";

const lookup = new Map([
  ["1F3F4", "blackFlag"],
  ["1F469 200D 1F52C", "womanScientist"],
  ["1F44D FE0F", "thumbsUp"],
]);

assert.equal(isCondensedSequenceControl(0x200d), true);
assert.equal(isCondensedSequenceControl(0x1f600), false);
assert.equal(findCompositionArtworkKey("1f44d", lookup), "thumbsUp");
assert.equal(
  findCompositionEmojiKey("1F3F4", "flagWales", lookup),
  "blackFlag",
);
assert.equal(findCompositionEmojiKey("1F3F4", "blackFlag", lookup), undefined);
assert.deepEqual(
  condenseCompositionPoints(
    [
      { hex: "1F469", point: 0x1f469 },
      { hex: "200D", point: 0x200d },
      { hex: "1F52C", point: 0x1f52c },
      { hex: "1F680", point: 0x1f680 },
    ],
    "scientist",
    lookup,
  ),
  [
    {
      emojiKey: "womanScientist",
      components: [
        { hex: "1F469", point: 0x1f469 },
        { hex: "200D", point: 0x200d },
        { hex: "1F52C", point: 0x1f52c },
      ],
    },
    { component: { hex: "1F680", point: 0x1f680 } },
  ],
);
assert.deepEqual(
  describeCompositionPoint(0xe0067, (key, fallback) =>
    key === "tagAbbreviation" ? "TAG" : fallback,
  ),
  {
    glyph: "TAG g",
    label: "Tag character g",
    symbolic: true,
  },
);
assert.equal(
  compositionTitle("grinningFace", { grinningFace: ["Grinning face"] }, {}),
  "Grinning face",
);
assert.equal(
  compositionReductionLabel(4, 1, { dir: "ltr", locale: "en" }),
  "4→1",
);
