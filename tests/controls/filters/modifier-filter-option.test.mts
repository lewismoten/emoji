import assert from "node:assert/strict";

import { ModifierFilterOptionControl } from "../../../src/controls/filters/modifier-filter-option.js";

const markup = ModifierFilterOptionControl.toMarkup({
  emoji: "🧪",
  inputClassName: "example-input",
  label: "Example",
  labelKey: "example",
  value: "alpha",
});

assert.match(markup, /^<label class="modifier-filter-option">/);
assert.match(markup, /<input[^>]*class="example-input"[^>]*type="checkbox"[^>]*value="alpha"[^>]*><\/input>/);
assert.match(markup, /class="modifier-emoji">🧪<\/span>/);
assert.match(markup, /class="modifier-label" data-i18n="example">Example<\/span>/);
