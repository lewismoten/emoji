import assert from "node:assert/strict";

import buildAudioVisibilityChange from "../../../../../src/explorer/audio/events/visibility/audio-visibility-change.js";

assert.equal(typeof buildAudioVisibilityChange, "function");
