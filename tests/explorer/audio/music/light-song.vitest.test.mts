import assert from "node:assert/strict";
import { describe, it } from "vitest";

import lightSong from "../../../../src/explorer/audio/music/light-song.js";

describe("light-song", () => {
  it("contains voice and beat data", () => {
    assert.equal(lightSong.voices.length > 0, true);
    assert.equal(lightSong.beatLength > 0, true);
  });
});
