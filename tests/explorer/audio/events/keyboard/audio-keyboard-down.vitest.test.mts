import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioKeyboardDown from "../../../../../src/explorer/audio/events/keyboard/audio-keyboard-down.js";

describe("audio-keyboard-down", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioKeyboardDown, "function");
  });
});
