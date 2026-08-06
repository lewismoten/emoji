import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioPointerDown from "../../../../../src/explorer/audio/events/pointer/audio-pointer-down.js";

describe("audio-pointer-down", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioPointerDown, "function");
  });
});
