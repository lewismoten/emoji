import assert from "node:assert/strict";

import retroSong from "../../../../src/explorer/audio/music/retro-song.js";

assert.equal(retroSong.voices.length > 0, true);
assert.equal(retroSong.beatLength > 0, true);
