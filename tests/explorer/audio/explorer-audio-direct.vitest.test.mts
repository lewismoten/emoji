import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createExplorerAudioController } from "../../../src/explorer-audio.js";

describe("explorer-audio-direct", () => {
  it("exports the direct controller factory", () => {
    assert.equal(typeof createExplorerAudioController, "function");
  });
});
