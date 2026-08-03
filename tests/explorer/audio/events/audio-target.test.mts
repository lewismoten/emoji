import assert from "node:assert/strict";

import getInteractiveTarget from "../../../../src/explorer/audio/events/audio-target.js";

assert.equal(typeof getInteractiveTarget, "function");
