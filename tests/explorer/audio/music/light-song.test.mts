import assert from "node:assert/strict";

import lightSong from "../../../../src/explorer/audio/music/light-song.js";

assert.equal(lightSong.voices.length > 0, true);
assert.equal(lightSong.beatLength > 0, true);
