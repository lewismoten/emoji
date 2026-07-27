import assert from "node:assert/strict";

import { SkinToneFilterControl } from "../../../src/controls/filters/skin-tone-filter.js";

const markup = SkinToneFilterControl.toMarkup();

assert.ok(
  markup.includes(
    '<fieldset class="modifier-filter skin-tone-filter" data-max-selectable="1" data-min-selectable="0">',
  ),
);
assert.ok(
  markup.includes(
    '<legend id="skinTone-group-label" data-i18n="skinTone">Skin tone</legend>',
  ),
);
assert.ok(markup.includes('class="skin-tone"'));
assert.ok(markup.includes('value="1F3FF"'));
assert.ok(markup.includes('value="1F3FE"'));
assert.ok(markup.includes('value="1F3FD"'));
assert.ok(markup.includes('value="1F3FC"'));
assert.ok(markup.includes('value="1F3FB"'));
