import assert from "node:assert/strict";
import { describe, it } from "vitest";

import darkExplorerSong from "../../../../../../src/explorer/audio/music/dark-song.js";

describe("dark-audio-song", () => {
  it("matches the expected dark theme arrangement", () => {
    assert.equal(darkExplorerSong.voices.length, 3);
    assert.equal(darkExplorerSong.voices[0]?.instrument, "lead-mellow");
    assert.ok(darkExplorerSong.beatLength > 0);
  });
});
