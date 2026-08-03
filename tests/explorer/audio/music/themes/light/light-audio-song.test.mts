import assert from "node:assert/strict";

import lightExplorerSong from "../../../../../../src/explorer/audio/music/light-song.js";

assert.equal(lightExplorerSong.voices.length, 4);
assert.equal(lightExplorerSong.voices.at(-1)?.instrument, "drum-chip");
assert.ok(lightExplorerSong.gain > 0);
