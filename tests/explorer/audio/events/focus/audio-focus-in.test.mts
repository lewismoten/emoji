import assert from "node:assert/strict";

import buildAudioFocusIn from "../../../../../src/explorer/audio/events/focus/audio-focus-in.js";

assert.equal(typeof buildAudioFocusIn, "function");
