import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioKeyboard from "../../../../../src/explorer/audio/events/keyboard/audio-keyboard.js";

describe("audio-keyboard", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioKeyboard, "function");
  });
});
