import assert from "node:assert/strict";

import retroExplorerSong from "../../../../../../src/explorer/audio/music/retro-song.js";

assert.equal(retroExplorerSong.voices.length, 2);
assert.equal(retroExplorerSong.voices[0]?.instrument, "lead-chip");
assert.ok(retroExplorerSong.beatLength > 0);
