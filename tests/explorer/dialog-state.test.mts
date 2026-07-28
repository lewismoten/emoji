import assert from "node:assert/strict";
import {
  buildDialogCopyValues,
  buildEscapeSequence,
  formatEmojiCodePoints,
  resolveCompositionParentLabel,
  resolveEmojiDialogDisplay,
  resolveDialogNavigationState,
  resolveDialogTitle,
  shouldHideEnglishName,
} from "../../src/explorer/dialog/dialog-state.js";

assert.equal(buildEscapeSequence("A😀"), "\\u41\\u{1f600}");
assert.equal(buildEscapeSequence("AB"), "\\u41\\u42");

assert.deepEqual(
  buildDialogCopyValues({
    emoji: "🎁",
    key: "wrappedGift",
    codePoints: "U+1F381",
  }),
  {
    emoji: "🎁",
    key: "wrappedGift",
    escape: "\\u{1f381}",
    codePoints: "U+1F381",
  },
);

assert.equal(
  formatEmojiCodePoints("1F469 200D 1F52C"),
  "U+1F469 U+200D U+1F52C",
);
assert.equal(formatEmojiCodePoints(""), "");

assert.deepEqual(
  resolveDialogTitle({
    emojiKey: "wrappedGift",
    selectedSearchLocale: "ar",
    annotations: ["هدية ملفوفة", "احتفال", "مناسبة"],
  }),
  {
    title: "هدية ملفوفة",
    showLocalized: true,
    localizedKeywords: "احتفال · مناسبة",
  },
);

assert.deepEqual(
  resolveDialogTitle({
    emojiKey: "wrappedGift",
    selectedSearchLocale: "",
    annotations: [],
  }),
  {
    title: "Wrapped gift",
    showLocalized: false,
    localizedKeywords: "",
  },
);

assert.equal(shouldHideEnglishName("Wrapped gift", "wrapped gift"), true);
assert.equal(shouldHideEnglishName("هدية ملفوفة", "Wrapped gift"), false);

assert.deepEqual(
  resolveDialogNavigationState(["wave", "gift", "rocket"], "gift"),
  {
    index: 1,
    previousDisabled: false,
    nextDisabled: false,
    previousKey: "wave",
    nextKey: "rocket",
  },
);
assert.deepEqual(
  resolveDialogNavigationState(["wave", "gift", "rocket"], "wave"),
  {
    index: 0,
    previousDisabled: true,
    nextDisabled: false,
    previousKey: "",
    nextKey: "gift",
  },
);
assert.deepEqual(
  resolveDialogNavigationState(["wave", "gift", "rocket"], "missing"),
  {
    index: -1,
    previousDisabled: true,
    nextDisabled: true,
    previousKey: "",
    nextKey: "",
  },
);

assert.equal(
  resolveCompositionParentLabel({
    parentKey: "blackFlag",
    searchAnnotations: { blackFlag: ["Black flag"] },
    byId: {},
    translate: (key: string, fallback: string) =>
      key === "backToEmoji" ? "Back to emoji" : fallback,
  }),
  "Back to emoji: Black flag",
);
assert.equal(
  resolveCompositionParentLabel({
    parentKey: "rocketShip",
    searchAnnotations: {},
    byId: { rocketShip: { shortName: "Rocket ship" } },
    translate: (_key: string, fallback: string) => fallback,
  }),
  "Back to emoji: Rocket ship",
);
assert.equal(
  resolveCompositionParentLabel({
    parentKey: "wrappedGift",
    searchAnnotations: {},
    byId: {},
    translate: (_key: string, fallback: string) => fallback,
  }),
  "Back to emoji: Wrapped gift",
);
assert.equal(
  resolveCompositionParentLabel({
    parentKey: "",
    searchAnnotations: {},
    byId: {},
    translate: (_key: string, fallback: string) => fallback,
  }),
  "",
);

assert.deepEqual(
  resolveEmojiDialogDisplay({
    emojiKey: "wrappedGift",
    emojiValue: "🎁",
    item: {
      shortName: "Wrapped gift",
      codePoints: "1F381",
      sequenceType: "single",
      status: "fully-qualified",
    },
    groupText: "Objects",
    subGroupText: "Celebration",
    introducedVersion: "6.0",
    selectedSearchLocale: "",
    annotations: [],
    sequenceTypeLabels: { single: "Single" },
    sequenceTranslationKeys: { single: "single" },
    statusTranslationKeys: { "fully-qualified": "fullyQualified" },
    translate: (key: string, fallback: string) => `${key}:${fallback}`,
  }),
  {
    groupText: "Objects",
    subGroupText: "Celebration",
    keyText: "wrappedGift",
    valueText: "🎁",
    encodedText: "\\u{1f381}",
    englishName: "Wrapped gift",
    versionText: "6.0",
    sequenceTypeText: "single:Single",
    statusText: "fullyQualified:fully-qualified",
    dialogTitle: {
      title: "Wrapped gift",
      showLocalized: false,
      localizedKeywords: "",
    },
    hideEnglishName: true,
    copyValues: {
      emoji: "🎁",
      key: "wrappedGift",
      escape: "\\u{1f381}",
      codePoints: "U+1F381",
    },
  },
);

assert.deepEqual(
  resolveEmojiDialogDisplay({
    emojiKey: "wrappedGift",
    emojiValue: "🎁",
    item: {},
    groupText: "",
    subGroupText: "",
    introducedVersion: "",
    selectedSearchLocale: "ar",
    annotations: ["هدية ملفوفة", "احتفال"],
    sequenceTypeLabels: {},
    sequenceTranslationKeys: {},
    statusTranslationKeys: {},
    translate: (key: string, fallback: string) => `${key}:${fallback}`,
  }),
  {
    groupText: "",
    subGroupText: "",
    keyText: "wrappedGift",
    valueText: "🎁",
    encodedText: "\\u{1f381}",
    englishName: "Wrapped gift",
    versionText: "",
    sequenceTypeText: "undefined:—",
    statusText: "undefined:—",
    dialogTitle: {
      title: "هدية ملفوفة",
      showLocalized: true,
      localizedKeywords: "احتفال",
    },
    hideEnglishName: false,
    copyValues: {
      emoji: "🎁",
      key: "wrappedGift",
      escape: "\\u{1f381}",
      codePoints: "",
    },
  },
);
