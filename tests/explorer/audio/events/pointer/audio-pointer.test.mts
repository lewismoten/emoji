import assert from "node:assert/strict";

import buildAudioPointer from "../../../../../src/explorer/audio/events/pointer/audio-pointer.js";

assert.equal(typeof buildAudioPointer, "function");
