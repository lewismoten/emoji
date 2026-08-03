import assert from "node:assert/strict";

import buildAudioKeyboardDown from "../../../../../src/explorer/audio/events/keyboard/audio-keyboard-down.js";

assert.equal(typeof buildAudioKeyboardDown, "function");
