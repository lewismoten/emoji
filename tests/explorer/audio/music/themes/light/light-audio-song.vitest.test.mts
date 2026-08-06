import assert from "node:assert/strict";
import { describe, it } from "vitest";

import lightExplorerSong from "../../../../../../src/explorer/audio/music/light-song.js";

describe("light-audio-song", () => {
  it("matches the expected light theme arrangement", () => {
    assert.equal(lightExplorerSong.voices.length, 4);
    assert.equal(lightExplorerSong.voices.at(-1)?.instrument, "drum-chip");
    assert.ok(lightExplorerSong.gain > 0);
  });
});
