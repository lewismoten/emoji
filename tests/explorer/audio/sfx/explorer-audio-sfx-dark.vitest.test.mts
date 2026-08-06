import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { darkExplorerSoundEffects } from "../../../../src/explorer/audio/sfx/explorer-audio-sfx-dark.js";

describe("explorer-audio-sfx-dark", () => {
  it("includes dark theme sound effect definitions", () => {
    assert.ok(darkExplorerSoundEffects["dialog-open"]);
    assert.ok(darkExplorerSoundEffects["toggle-on"].tones.length > 0);
  });
});
