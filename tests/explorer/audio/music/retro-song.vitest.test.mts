import assert from "node:assert/strict";
import { describe, it } from "vitest";

import retroSong from "../../../../src/explorer/audio/music/retro-song.js";

describe("retro-song", () => {
  it("contains voice and beat data", () => {
    assert.equal(retroSong.voices.length > 0, true);
    assert.equal(retroSong.beatLength > 0, true);
  });
});
