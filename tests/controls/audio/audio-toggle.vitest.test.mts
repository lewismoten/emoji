import assert from "node:assert/strict";
import { describe, it } from "vitest";

import * as audioToggle from "../../../src/controls/audio/audio-toggle.js";

describe("audio-toggle", () => {
  it("exports the audio toggle API", () => {
    assert.equal(typeof audioToggle.enableMusic, "function");
    assert.equal(typeof audioToggle.enableSoundEffects, "function");
    assert.equal(typeof audioToggle.render, "function");
    assert.equal(typeof audioToggle.renderMusic, "function");
    assert.equal(typeof audioToggle.renderSoundEffects, "function");
  });
});
