import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioVisibilityChange from "../../../../../src/explorer/audio/events/visibility/audio-visibility-change.js";

describe("audio-visibility-change", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioVisibilityChange, "function");
  });
});
