import assert from "node:assert/strict";
import {
  createDeveloperModeController,
  createExplorerUiController,
  renderPixelFontToggle,
  renderThemeToggle,
  selectEmojiFont,
  selectTheme,
} from "../src/explorer-ui.js";

assert.equal(typeof createExplorerUiController, "function");
assert.equal(typeof createDeveloperModeController, "function");
assert.equal(typeof renderPixelFontToggle, "function");
assert.equal(typeof renderThemeToggle, "function");
assert.equal(typeof selectEmojiFont, "function");
assert.equal(typeof selectTheme, "function");
