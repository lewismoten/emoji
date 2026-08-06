import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { getExplorerInstrument } from "../../../../src/explorer/audio/instruments/explorer-audio-instruments.js";

describe("explorer-audio-instruments", () => {
  it("returns known instrument definitions", () => {
    assert.equal(getExplorerInstrument("lead-chip").type, "square");
    assert.equal(getExplorerInstrument("pad-soft").waveform, "pad-soft");
  });
});
