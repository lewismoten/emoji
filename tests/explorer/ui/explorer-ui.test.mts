import assert from "node:assert/strict";
import {
  createDeveloperModeController,
  createExplorerUiController,
  renderPixelFontToggle,
  selectEmojiFont,
} from "../../../src/explorer-ui.js";

assert.equal(typeof createExplorerUiController, "function");
assert.equal(typeof createDeveloperModeController, "function");
assert.equal(typeof renderPixelFontToggle, "function");
assert.equal(typeof selectEmojiFont, "function");
