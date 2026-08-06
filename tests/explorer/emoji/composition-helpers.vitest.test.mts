import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  compositionReductionLabel,
  compositionTitle,
  condenseCompositionPoints,
  describeCompositionPoint,
  findCompositionArtworkKey,
  findCompositionEmojiKey,
  isCondensedSequenceControl,
} from "../../../src/explorer/emoji/composition-helpers.js";

describe("composition-helpers", () => {
  it("finds composition keys, condenses sequences, and describes code points", () => {
    const lookup = new Map([
      ["1F3F4", "blackFlag"],
      ["1F469 200D 1F52C", "womanScientist"],
      ["1F44D FE0F", "thumbsUp"],
    ]);

    assert.equal(isCondensedSequenceControl(0x200d), true);
    assert.equal(isCondensedSequenceControl(0xfe0e), true);
    assert.equal(isCondensedSequenceControl(0xfe0f), true);
    assert.equal(isCondensedSequenceControl(0x1f600), false);
    assert.equal(findCompositionArtworkKey("1f44d", lookup), "thumbsUp");
    assert.equal(findCompositionArtworkKey("1f44d fe0f", lookup), "thumbsUp");
    assert.equal(findCompositionArtworkKey("1f600", lookup), undefined);
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
      condenseCompositionPoints(
        [
          { hex: "1F44D", point: 0x1f44d },
          { hex: "FE0F", point: 0xfe0f },
        ],
        "thumbsUp",
        lookup,
      ),
      [
        { component: { hex: "1F44D", point: 0x1f44d } },
        { component: { hex: "FE0F", point: 0xfe0f } },
      ],
    );
    assert.deepEqual(
      condenseCompositionPoints(
        [{ hex: "1F680", point: 0x1f680 }],
        "rocket",
        lookup,
      ),
      [{ component: { hex: "1F680", point: 0x1f680 } }],
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
    assert.deepEqual(
      describeCompositionPoint(0x200d, (_key, fallback) => fallback),
      {
        glyph: "ZWJ",
        label: "Zero-width joiner",
        symbolic: true,
      },
    );
    assert.deepEqual(
      describeCompositionPoint(0xfe0f, (_key, fallback) => fallback),
      {
        glyph: "VS16",
        label: "Emoji presentation selector",
        symbolic: true,
      },
    );
    assert.deepEqual(
      describeCompositionPoint(0xfe0e, (_key, fallback) => fallback),
      {
        glyph: "VS15",
        label: "Text presentation selector",
        symbolic: true,
      },
    );
    assert.deepEqual(
      describeCompositionPoint(0x20e3, (_key, fallback) => fallback),
      {
        glyph: "KEY",
        label: "Combining keycap",
        symbolic: true,
      },
    );
    assert.deepEqual(
      describeCompositionPoint(0xe007f, (_key, fallback) => fallback),
      {
        glyph: "END",
        label: "Cancel tag",
        symbolic: true,
      },
    );
    assert.deepEqual(
      describeCompositionPoint(0x1f3fb, (_key, fallback) => fallback),
      {
        glyph: "🏻",
        label: "Light skin tone",
        symbolic: false,
      },
    );
    assert.deepEqual(
      describeCompositionPoint(0x1f3ff, (_key, fallback) => fallback),
      {
        glyph: "🏿",
        label: "Dark skin tone",
        symbolic: false,
      },
    );
    assert.deepEqual(
      describeCompositionPoint(0x1f1fa, (_key, fallback) => fallback),
      {
        glyph: "🇺",
        label: "Regional indicator U",
        symbolic: false,
      },
    );
    assert.deepEqual(
      describeCompositionPoint(0xe0020, (_key, fallback) => fallback),
      {
        glyph: "TAG ␠",
        label: "Tag character ␠",
        symbolic: true,
      },
    );
    assert.deepEqual(
      describeCompositionPoint(0x41, (_key, fallback) => fallback),
      {
        glyph: "A",
        label: "U+41",
        symbolic: false,
      },
    );
    assert.equal(
      compositionTitle("grinningFace", { grinningFace: ["Grinning face"] }, {}),
      "Grinning face",
    );
    assert.equal(
      compositionTitle("knownFace", {}, { knownFace: { shortName: "Known face" } }),
      "Known face",
    );
    assert.equal(compositionTitle("wrappedGift", {}, {}), "Wrapped gift");
    assert.equal(
      compositionReductionLabel(4, 1, { dir: "ltr", locale: "en" }),
      "4→1",
    );
    assert.equal(
      compositionReductionLabel(12, 3, { dir: "rtl", locale: "ar" }),
      "3←12",
    );
  });
});
