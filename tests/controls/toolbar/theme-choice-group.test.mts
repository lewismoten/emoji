import assert from "node:assert/strict";

import { ThemeChoiceGroupControl } from "../../../src/controls/toolbar/theme-choice-group.js";

const markup = ThemeChoiceGroupControl.toMarkup();

assert.ok(markup.includes('class="setting-choice-group theme-choices"'));
assert.ok(markup.includes('data-theme="light"'));
assert.ok(markup.includes('data-theme="dark"'));
assert.ok(markup.includes('data-theme="retro"'));
assert.ok(markup.includes('data-max-selectable="1"'));
assert.ok(markup.includes('data-min-selectable="1"'));
