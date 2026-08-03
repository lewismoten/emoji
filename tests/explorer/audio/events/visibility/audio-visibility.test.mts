import assert from "node:assert/strict";

import buildAudioVisibility from "../../../../../src/explorer/audio/events/visibility/audio-visibility.js";

assert.equal(typeof buildAudioVisibility, "function");
