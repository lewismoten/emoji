import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  createDeveloperModeController,
  createExplorerUiController,
  renderPixelFontToggle,
  selectEmojiFont,
} from "../../../src/explorer-ui.js";

describe("explorer-ui", () => {
  it("exports the expected top-level UI helpers", () => {
    assert.equal(typeof createExplorerUiController, "function");
    assert.equal(typeof createDeveloperModeController, "function");
    assert.equal(typeof renderPixelFontToggle, "function");
    assert.equal(typeof selectEmojiFont, "function");
  });
});
