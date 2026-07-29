import assert from "node:assert/strict";

import { ModeChoiceGroupControl } from "../../../src/controls/toolbar/mode-choice-group.js";

const markup = ModeChoiceGroupControl.toMarkup();

assert.ok(markup.includes('class="setting-choice-group mode-choices"'));
assert.ok(markup.includes('data-mode="standard"'));
assert.ok(markup.includes('data-mode="advanced"'));
assert.ok(markup.includes('data-mode="developer"'));
assert.ok(markup.includes('data-max-selectable="1"'));
assert.ok(markup.includes('data-min-selectable="1"'));
