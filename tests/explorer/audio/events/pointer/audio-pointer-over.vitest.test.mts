import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioPointerOver from "../../../../../src/explorer/audio/events/pointer/audio-pointer-over.js";

describe("audio-pointer-over", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioPointerOver, "function");
  });
});
