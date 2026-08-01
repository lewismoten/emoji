import assert from "node:assert/strict";

import { AdvancedFiltersTriggerControl } from "../../../../src/controls/filters/pickers/advanced-filters-trigger.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

const markup = AdvancedFiltersTriggerControl.toMarkup();

assert.ok(markup.includes('class="advanced-filters-trigger"'));
assert.ok(markup.includes('data-i18n="advancedFilters"'));
assert.ok(markup.includes('data-i18n="filters"'));

const customMarkup = AdvancedFiltersTriggerControl.toMarkup({
  controls: "filters-panel",
  filtersText: "Short",
  filtersTextKey: "shortFilters",
  longText: "Long",
  longTextKey: "longFilters",
});
assert.ok(customMarkup.includes('aria-controls="filters-panel"'));
assert.ok(customMarkup.includes('data-i18n="shortFilters"'));
assert.ok(customMarkup.includes('data-i18n="longFilters"'));

const restore = installFakeDocument();
const globals = globalThis as typeof globalThis & {
  document: { head: FakeElement };
};
AdvancedFiltersTriggerControl.create();
assert.equal(globals.document.head.children.length, 1);
assert.equal(
  (globals.document.head.children[0] as FakeElement).id,
  "advanced-filters-trigger-control-style",
);
restore();
