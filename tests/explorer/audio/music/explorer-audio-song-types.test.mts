import assert from "node:assert/strict";

import type { ExplorerMusicSong } from "../../../../src/explorer/audio/music/explorer-audio-song-types.js";

const song: ExplorerMusicSong = {
  beatLength: 0.25,
  gain: 0.1,
  voices: [{ instrument: "lead-chip", events: [[440, 1]] }],
};

assert.equal(song.voices[0].events[0][0], 440);
assert.equal(song.voices[0].events[0][1], 1);
