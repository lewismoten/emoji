import assert from "node:assert/strict";
import { describe, it } from "vitest";

import retroExplorerSong from "../../../../../../src/explorer/audio/music/retro-song.js";

describe("retro-audio-song", () => {
  it("matches the expected retro theme arrangement", () => {
    assert.equal(retroExplorerSong.voices.length, 2);
    assert.equal(retroExplorerSong.voices[0]?.instrument, "lead-chip");
    assert.ok(retroExplorerSong.beatLength > 0);
  });
});
