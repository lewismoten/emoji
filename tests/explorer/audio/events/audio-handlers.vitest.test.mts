import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioHandlers from "../../../../src/explorer/audio/events/audio-handlers.js";

describe("audio-handlers", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioHandlers, "function");
  });
});
