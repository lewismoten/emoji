import assert from "node:assert/strict";

import buildAudioFocus from "../../../../../src/explorer/audio/events/focus/audio-focus.js";

assert.equal(typeof buildAudioFocus, "function");
