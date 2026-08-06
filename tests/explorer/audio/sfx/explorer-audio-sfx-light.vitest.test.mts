import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { lightExplorerSoundEffects } from "../../../../src/explorer/audio/sfx/explorer-audio-sfx-light.js";

describe("explorer-audio-sfx-light", () => {
  it("includes light theme sound effect definitions", () => {
    assert.ok(lightExplorerSoundEffects["dialog-close"]);
    assert.equal(lightExplorerSoundEffects["ui-click"].tones.length, 2);
  });
});
