import assert from "node:assert/strict";
import { describe, it } from "vitest";

import darkSong from "../../../../src/explorer/audio/music/dark-song.js";

describe("dark-song", () => {
  it("contains voice and beat data", () => {
    assert.equal(darkSong.voices.length > 0, true);
    assert.equal(darkSong.beatLength > 0, true);
  });
});
