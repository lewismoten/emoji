import assert from "node:assert/strict";

import type {
  ExplorerAudioAction,
  ExplorerAudioElementType,
  ExplorerAudioTheme,
  ExplorerToneShape,
} from "../../../src/explorer/audio/explorer-audio-types.js";

const theme: ExplorerAudioTheme = "retro";
const elementType: ExplorerAudioElementType = "button";
const action: ExplorerAudioAction = "click";
const tone: ExplorerToneShape = {
  duration: 0.1,
  frequency: 440,
  type: "square",
  volume: 0.2,
};

assert.equal(theme, "retro");
assert.equal(elementType, "button");
assert.equal(action, "click");
assert.equal(tone.frequency, 440);
