import assert from "node:assert/strict";

import darkSong from "../../../../src/explorer/audio/music/dark-song.js";

assert.equal(darkSong.voices.length > 0, true);
assert.equal(darkSong.beatLength > 0, true);
