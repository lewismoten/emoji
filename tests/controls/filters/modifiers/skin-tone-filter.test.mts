import assert from "node:assert/strict";

import { SkinToneFilterControl } from "../../../../src/controls/filters/modifiers/skin-tone-filter.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

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

const restore = installFakeDocument();
const globals = globalThis as typeof globalThis & {
  document: { head: FakeElement };
};
SkinToneFilterControl.create();
assert.equal(globals.document.head.children.length, 1);
assert.equal(
  (globals.document.head.children[0] as FakeElement).id,
  "skin-tone-filter-control-stylesheet",
);
restore();
