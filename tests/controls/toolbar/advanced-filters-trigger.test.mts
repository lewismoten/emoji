import assert from "node:assert/strict";

import { AdvancedFiltersTriggerControl } from "../../../src/controls/filters/pickers/advanced-filters-trigger.js";

const markup = AdvancedFiltersTriggerControl.toMarkup();

assert.ok(markup.includes('class="advanced-filters-trigger"'));
assert.ok(markup.includes('data-i18n="advancedFilters"'));
assert.ok(markup.includes('data-i18n="filters"'));
