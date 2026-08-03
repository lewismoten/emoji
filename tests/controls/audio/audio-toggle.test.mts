import assert from "node:assert/strict";

import * as audioToggle from "../../../src/controls/audio/audio-toggle.js";

assert.equal(typeof audioToggle.enableMusic, "function");
assert.equal(typeof audioToggle.enableSoundEffects, "function");
assert.equal(typeof audioToggle.render, "function");
assert.equal(typeof audioToggle.renderMusic, "function");
assert.equal(typeof audioToggle.renderSoundEffects, "function");
