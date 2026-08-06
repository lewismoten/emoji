import assert from "node:assert/strict";
import { describe, it } from "vitest";

import buildAudioDialog from "../../../../src/explorer/audio/events/audio-dialog.js";

describe("audio-dialog", () => {
  it("exports a builder function", () => {
    assert.equal(typeof buildAudioDialog, "function");
  });
});
