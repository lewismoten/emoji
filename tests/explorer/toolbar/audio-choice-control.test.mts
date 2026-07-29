import assert from "node:assert/strict";

import { createAudioChoiceGroupControl } from "../../../src/explorer/toolbar/audio-choice-control.js";

const control = createAudioChoiceGroupControl();

assert.ok(control);
assert.equal(typeof control.render, "function");
