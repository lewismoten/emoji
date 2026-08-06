import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioFocusOut from "../../../../../src/explorer/audio/events/focus/audio-focus-out.js";

describe("audio-focus-out", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioFocusOut, "function");
  });
});
