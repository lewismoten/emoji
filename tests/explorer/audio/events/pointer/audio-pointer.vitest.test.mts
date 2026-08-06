import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioPointer from "../../../../../src/explorer/audio/events/pointer/audio-pointer.js";

describe("audio-pointer", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioPointer, "function");
  });
});
