import assert from "node:assert/strict";

import { HairFilterControl } from "../../../../src/controls/filters/modifiers/hair-filter.js";

const markup = HairFilterControl.toMarkup();

assert.ok(
  markup.includes(
    '<fieldset class="modifier-filter hair-filter" data-max-selectable="1" data-min-selectable="0">',
  ),
);
assert.ok(
  markup.includes('<legend id="hair-group-label" data-i18n="hair">Hair</legend>'),
);
assert.ok(markup.includes('class="hair"'));
assert.ok(markup.includes('value="1F9B0"'));
assert.ok(markup.includes('value="1F9B1"'));
assert.ok(markup.includes('value="1F9B2"'));
assert.ok(markup.includes('value="1F9B3"'));
