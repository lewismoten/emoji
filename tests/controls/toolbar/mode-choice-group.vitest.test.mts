import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { ModeChoiceGroupControl } from "../../../src/controls/toolbar/mode-choice-group.js";

describe("mode-choice-group", () => {
  it("renders the mode choice group markup", () => {
    const markup = ModeChoiceGroupControl.toMarkup();

    assert.ok(markup.includes('class="setting-choice-group mode-choices"'));
    assert.ok(markup.includes('data-mode="standard"'));
    assert.ok(markup.includes('data-mode="advanced"'));
    assert.ok(markup.includes('data-mode="developer"'));
    assert.ok(markup.includes('data-max-selectable="1"'));
    assert.ok(markup.includes('data-min-selectable="1"'));
  });
});
