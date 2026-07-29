import assert from "node:assert/strict";

import { darkExplorerSoundEffects } from "../../../../src/explorer/audio/sfx/explorer-audio-sfx-dark.js";

assert.ok(darkExplorerSoundEffects["dialog-open"]);
assert.ok(darkExplorerSoundEffects["toggle-on"].tones.length > 0);
