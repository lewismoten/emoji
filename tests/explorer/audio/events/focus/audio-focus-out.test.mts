import assert from "node:assert/strict";

import buildAudioFocusOut from "../../../../../src/explorer/audio/events/focus/audio-focus-out.js";

assert.equal(typeof buildAudioFocusOut, "function");
