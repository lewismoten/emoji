import assert from "node:assert/strict";

import { retroExplorerSoundEffects } from "../../../../src/explorer/audio/sfx/explorer-audio-sfx-retro.js";

assert.ok(retroExplorerSoundEffects["hover-soft"]);
assert.equal(retroExplorerSoundEffects["focus-soft"].tones[0]?.type, "square");
