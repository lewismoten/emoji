import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioPointerClick from "../../../../../src/explorer/audio/events/pointer/audio-pointer-click.js";

describe("audio-pointer-click", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioPointerClick, "function");
  });
});
