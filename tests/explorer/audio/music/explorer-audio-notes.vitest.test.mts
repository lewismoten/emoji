import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  NOTE_LENGTHS,
  PITCHES,
} from "../../../../src/explorer/audio/music/explorer-audio-notes.js";

describe("explorer-audio-notes", () => {
  it("exports note lengths and pitches", () => {
    assert.equal(NOTE_LENGTHS.QUARTER, 1);
    assert.equal(NOTE_LENGTHS.HALF, 2);
    assert.equal(NOTE_LENGTHS.WHOLE, 4);
    assert.equal(PITCHES.A4, 440);
    assert.ok(PITCHES.C6 > PITCHES.C5);
  });
});
