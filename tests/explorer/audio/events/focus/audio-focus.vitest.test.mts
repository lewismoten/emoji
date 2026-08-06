import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioFocus from "../../../../../src/explorer/audio/events/focus/audio-focus.js";

describe("audio-focus", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioFocus, "function");
  });
});
