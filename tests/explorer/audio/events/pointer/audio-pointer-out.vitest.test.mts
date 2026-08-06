import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioPointerOut from "../../../../../src/explorer/audio/events/pointer/audio-pointer-out.js";

describe("audio-pointer-out", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioPointerOut, "function");
  });
});
