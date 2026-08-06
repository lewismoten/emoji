import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { retroExplorerSoundEffects } from "../../../../src/explorer/audio/sfx/explorer-audio-sfx-retro.js";

describe("explorer-audio-sfx-retro", () => {
  it("includes retro theme sound effect definitions", () => {
    assert.ok(retroExplorerSoundEffects["hover-soft"]);
    assert.equal(
      retroExplorerSoundEffects["focus-soft"].tones[0]?.type,
      "square",
    );
  });
});
