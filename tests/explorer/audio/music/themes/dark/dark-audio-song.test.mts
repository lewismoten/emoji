import assert from "node:assert/strict";

import { darkExplorerSong } from "../../../../../../src/explorer/audio/music/themes/dark/dark-audio-song.js";

assert.equal(darkExplorerSong.voices.length, 3);
assert.equal(darkExplorerSong.voices[0]?.instrument, "lead-mellow");
assert.ok(darkExplorerSong.beatLength > 0);
