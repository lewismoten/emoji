import assert from "node:assert/strict";

import {
  getExplorerSoundEffect,
  resolveExplorerSoundEffect,
} from "../../../src/explorer/audio/explorer-audio-sfx.js";

assert.ok(getExplorerSoundEffect("ui-click", "dark"));
assert.equal(resolveExplorerSoundEffect("radio", "check"), "toggle-on");
assert.equal(resolveExplorerSoundEffect("button", "click"), "ui-click");
