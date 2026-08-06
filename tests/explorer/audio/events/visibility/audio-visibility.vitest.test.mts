import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioVisibility from "../../../../../src/explorer/audio/events/visibility/audio-visibility.js";

describe("audio-visibility", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioVisibility, "function");
  });
});
