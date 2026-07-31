import assert from "node:assert/strict";
import {
  buildSkinToneOwnership,
  remapSkinTonePixels,
  skinToneCycle,
} from "../../../src/pixel-editor/palette/pixel-editor-skin-tone.js";

assert.equal(typeof skinToneCycle, "function");
assert.equal(typeof remapSkinTonePixels, "function");
assert.equal(typeof buildSkinToneOwnership, "function");
