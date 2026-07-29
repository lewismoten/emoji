import assert from "node:assert/strict";

import { getExplorerInstrument } from "../../../../src/explorer/audio/instruments/explorer-audio-instruments.js";

assert.equal(getExplorerInstrument("lead-chip").type, "square");
assert.equal(getExplorerInstrument("pad-soft").waveform, "pad-soft");
