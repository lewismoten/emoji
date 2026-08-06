import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  buildSkinToneOwnership,
  remapSkinTonePixels,
  skinToneCycle,
} from "../../../src/pixel-editor/palette/pixel-editor-skin-tone.js";

describe("pixel-editor-skin-tone", () => {
  it("exports the public skin tone helpers", () => {
    assert.equal(typeof skinToneCycle, "function");
    assert.equal(typeof remapSkinTonePixels, "function");
    assert.equal(typeof buildSkinToneOwnership, "function");
  });
});
