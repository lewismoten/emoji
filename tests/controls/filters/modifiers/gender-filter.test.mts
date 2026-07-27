import assert from "node:assert/strict";

import { GenderFilterControl } from "../../../../src/controls/filters/modifiers/gender-filter.js";

const markup = GenderFilterControl.toMarkup();

assert.ok(
  markup.includes(
    '<fieldset class="modifier-filter gender-filter" data-max-selectable="1" data-min-selectable="0">',
  ),
);
assert.ok(
  markup.includes('<legend id="gender-group-label" data-i18n="gender">Gender</legend>'),
);
assert.ok(markup.includes('class="gender"'));
assert.ok(markup.includes('value="male"'));
assert.ok(markup.includes('value="female"'));
assert.ok(markup.includes('value="neutral"'));
