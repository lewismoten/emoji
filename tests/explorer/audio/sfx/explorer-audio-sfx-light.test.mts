import assert from "node:assert/strict";

import { lightExplorerSoundEffects } from "../../../../src/explorer/audio/sfx/explorer-audio-sfx-light.js";

assert.ok(lightExplorerSoundEffects["dialog-close"]);
assert.equal(lightExplorerSoundEffects["ui-click"].tones.length, 2);
