import assert from "node:assert/strict";

import {
  NOTE_LENGTHS,
  PITCHES,
} from "../../../../src/explorer/audio/music/explorer-audio-notes.js";

assert.equal(NOTE_LENGTHS.QUARTER, 1);
assert.equal(NOTE_LENGTHS.HALF, 2);
assert.equal(NOTE_LENGTHS.WHOLE, 4);
assert.equal(PITCHES.A4, 440);
assert.ok(PITCHES.C6 > PITCHES.C5);
