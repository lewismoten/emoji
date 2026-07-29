import assert from "node:assert/strict";

import type { ExplorerSoundEffectDefinition } from "../../../../src/explorer/audio/sfx/explorer-audio-sfx-types.js";

const effect: ExplorerSoundEffectDefinition = {
  tones: [{ duration: 0.1, frequency: 440, type: "sine", volume: 0.2 }],
};

assert.equal(effect.tones.length, 1);
assert.equal(effect.tones[0]?.frequency, 440);
