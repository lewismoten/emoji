import assert from "node:assert/strict";

import buildAudioHandlers from "../../../../src/explorer/audio/events/audio-handlers.js";

assert.equal(typeof buildAudioHandlers, "function");
