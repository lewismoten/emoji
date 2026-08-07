import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { buildExplorerUrlQuery } from "../../../../src/explorer/navigation/url-state.js";

const queryEntries = (value: string) =>
  Array.from(new URLSearchParams(value).entries()).sort(([left], [right]) =>
    left.localeCompare(right),
  );

describe("url-state-build", () => {
  it("builds explorer URL queries across dialog and panel states", () => {
    assert.deepEqual(
      queryEntries(
        buildExplorerUrlQuery({
          search: "gift",
          explorerMode: "developer",
          latestReleasedVersion: "17.0",
          version: "18.0",
          versionMode: "selected",
          order: "sequence",
          group: "Objects",
          subGroup: "Objects::mail",
          sequenceType: "zwj",
          skin: ["1F3FB"],
          hair: [],
          gender: ["female"],
          compositionMode: "full",
          currentEmojiKey: "wrappedGift",
          emojiMode: "editor",
          panel: "",
          dialogOpen: true,
        }),
      ),
      queryEntries(
        "q=gift&version=18.0&versionMode=selected&mode=developer&sequenceType=zwj&skin=1F3FB&gender=female&order=sequence&composition=full&emoji=wrappedGift&emojiMode=editor",
      ),
    );

    assert.equal(
      buildExplorerUrlQuery({
        search: "gift",
        explorerMode: "standard",
        latestReleasedVersion: "17.0",
        version: "17.0",
        versionMode: "through",
        order: "unicode",
        group: "Objects",
        subGroup: "Objects::mail",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        compositionMode: "condensed",
        currentEmojiKey: "",
        emojiMode: "details",
        panel: "favorites",
        dialogOpen: false,
      }),
      "q=gift&group=Objects&subgroup=mail&order=unicode&panel=favorites",
    );

    assert.equal(
      buildExplorerUrlQuery({
        search: "  gift  ",
        explorerMode: "developer",
        latestReleasedVersion: "17.0",
        version: "17.0",
        versionMode: "through",
        order: "grouped",
        group: "Objects",
        subGroup: "Objects::mail",
        sequenceType: "",
        skin: ["1F3FB"],
        hair: ["1F9B0"],
        gender: ["female"],
        compositionMode: "condensed",
        currentEmojiKey: "wrappedGift",
        emojiMode: "details",
        panel: "help",
        dialogOpen: true,
      }),
      "q=gift&mode=developer&group=Objects&subgroup=mail&skin=1F3FB&hair=1F9B0&gender=female&emoji=wrappedGift&panel=help",
    );

    assert.equal(
      buildExplorerUrlQuery({
        search: "",
        explorerMode: "developer",
        latestReleasedVersion: "17.0",
        version: "17.0",
        versionMode: "through",
        order: "sequence",
        group: "Objects",
        subGroup: "Objects::mail",
        sequenceType: "zwj",
        skin: [],
        hair: [],
        gender: [],
        compositionMode: "full",
        currentEmojiKey: "",
        emojiMode: "details",
        panel: "language",
        dialogOpen: false,
      }),
      "mode=developer&sequenceType=zwj&order=sequence&composition=full&panel=language",
    );

    assert.equal(
      buildExplorerUrlQuery({
        search: "",
        explorerMode: "developer",
        latestReleasedVersion: "17.0",
        version: "17.0",
        versionMode: "through",
        order: "grouped",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        compositionMode: "condensed",
        currentEmojiKey: "",
        emojiMode: "details",
        panel: "language",
        dialogOpen: false,
      }),
      "mode=developer&panel=language",
    );

    assert.equal(
      buildExplorerUrlQuery({
        search: "",
        explorerMode: "developer",
        latestReleasedVersion: "17.0",
        version: "18.0",
        versionMode: "selected",
        order: "grouped",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        compositionMode: "condensed",
        currentEmojiKey: "wrappedGift",
        emojiMode: "code",
        panel: "help",
        dialogOpen: true,
      }),
      "version=18.0&versionMode=selected&mode=developer&emoji=wrappedGift&emojiMode=code&panel=help",
    );

    assert.equal(
      buildExplorerUrlQuery({
        search: "",
        explorerMode: "standard",
        latestReleasedVersion: "17.0",
        version: "",
        versionMode: "through",
        order: "grouped",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        compositionMode: "condensed",
        currentEmojiKey: "",
        emojiMode: "details",
        panel: "",
        dialogOpen: false,
      }),
      "",
    );

    assert.equal(
      buildExplorerUrlQuery({
        search: "",
        explorerMode: "standard",
        latestReleasedVersion: "17.0",
        version: "17.0",
        versionMode: "through",
        order: "grouped",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        compositionMode: "condensed",
        currentEmojiKey: "wrappedGift",
        emojiMode: "editor",
        panel: "",
        dialogOpen: true,
      }),
      "emoji=wrappedGift&emojiMode=editor",
    );

    assert.equal(
      buildExplorerUrlQuery({
        search: "",
        explorerMode: "developer",
        latestReleasedVersion: undefined,
        version: "18.0",
        versionMode: "through",
        order: "grouped",
        group: "",
        subGroup: "",
        sequenceType: "",
        skin: [],
        hair: [],
        gender: [],
        compositionMode: "condensed",
        currentEmojiKey: "",
        emojiMode: "details",
        panel: "",
        dialogOpen: false,
      }),
      "version=18.0&mode=developer",
    );
  });
});
