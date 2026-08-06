import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioFocusIn from "../../../../../src/explorer/audio/events/focus/audio-focus-in.js";

describe("audio-focus-in", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioFocusIn, "function");
  });
});
