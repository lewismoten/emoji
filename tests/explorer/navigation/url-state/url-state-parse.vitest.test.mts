import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { parseExplorerUrlState } from "../../../../src/explorer/navigation/url-state.js";

describe("url-state-parse", () => {
  it("parses explorer URL state across supported combinations", () => {
    assert.deepEqual(
      parseExplorerUrlState({
        search:
          "?q=gift&version=17.0&versionMode=selected&mode=developer&order=sequence&sequenceType=zwj&skin=1F3FB&hair=1F9B0&gender=female&composition=full&emoji=wrappedGift&emojiMode=code&panel=help",
        developerMode: true,
        preferredOrder: "unicode",
        allowedSequenceTypes: ["single", "zwj"],
      }),
      {
        search: "gift",
        version: "17.0",
        versionMode: "selected",
        group: "",
        subGroup: "",
        sequenceType: "zwj",
        skin: ["1F3FB"],
        hair: ["1F9B0"],
        gender: ["female"],
        order: "sequence",
        compositionMode: "full",
        emoji: "wrappedGift",
        emojiMode: "code",
        panel: "help",
      },
    );

    assert.deepEqual(
      parseExplorerUrlState({
        search: "?emoji=wrappedGift&emojiMode=editor&panel=favorites",
        developerMode: true,
        preferredOrder: "",
        allowedSequenceTypes: [],
      }),
      {
        search: "",
        version: "",
        versionMode: "through",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        order: "grouped",
        compositionMode: "condensed",
        emoji: "wrappedGift",
        emojiMode: "editor",
        panel: "favorites",
      },
    );

    assert.deepEqual(
      parseExplorerUrlState({
        search: "",
        developerMode: false,
        preferredOrder: "bogus",
        allowedSequenceTypes: [],
      }),
      {
        search: "",
        version: "",
        versionMode: "through",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        order: "grouped",
        compositionMode: "condensed",
        emoji: "",
        emojiMode: "details",
        panel: "",
      },
    );

    assert.deepEqual(
      parseExplorerUrlState({
        search: "?order=popular&panel=bogus",
        developerMode: true,
        preferredOrder: "grouped",
        allowedSequenceTypes: [],
      }),
      {
        search: "",
        version: "",
        versionMode: "through",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        order: "popular",
        compositionMode: "condensed",
        emoji: "",
        emojiMode: "details",
        panel: "",
      },
    );

    assert.deepEqual(
      parseExplorerUrlState({
        search:
          "?version=18.0&versionMode=selected&mode=developer&emoji=wrappedGift&emojiMode=editor&panel=filters",
        developerMode: false,
        preferredOrder: "",
        allowedSequenceTypes: ["single"],
      }),
      {
        search: "",
        version: "",
        versionMode: "through",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        order: "grouped",
        compositionMode: "condensed",
        emoji: "wrappedGift",
        emojiMode: "details",
        panel: "filters",
      },
    );

    assert.deepEqual(
      parseExplorerUrlState({
        search: "?order=bogus&sequenceType=bogus&group=Objects&subgroup=mail",
        developerMode: true,
        preferredOrder: "popular",
        allowedSequenceTypes: ["single", "zwj"],
      }),
      {
        search: "",
        version: "",
        versionMode: "through",
        group: "Objects",
        subGroup: "mail",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        order: "popular",
        compositionMode: "condensed",
        emoji: "",
        emojiMode: "details",
        panel: "",
      },
    );

    assert.deepEqual(
      parseExplorerUrlState({
        search: "?order=sequence&emojiMode=editor&panel=language",
        developerMode: false,
        preferredOrder: "unicode",
        allowedSequenceTypes: ["single", "zwj"],
      }),
      {
        search: "",
        version: "",
        versionMode: "through",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        order: "unicode",
        compositionMode: "condensed",
        emoji: "",
        emojiMode: "details",
        panel: "language",
      },
    );

    assert.deepEqual(
      parseExplorerUrlState({
        search: "?panel=language",
        developerMode: true,
        preferredOrder: "grouped",
        allowedSequenceTypes: ["single", "zwj"],
      }),
      {
        search: "",
        version: "",
        versionMode: "through",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        order: "grouped",
        compositionMode: "condensed",
        emoji: "",
        emojiMode: "details",
        panel: "language",
      },
    );
  });
});
