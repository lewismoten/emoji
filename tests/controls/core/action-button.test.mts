import assert from "node:assert/strict";

import { ActionButtonControl } from "../../../src/controls/core/action-button.js";

const markup = ActionButtonControl.toMarkup({
  ariaLabel: "Example action",
  className: "example-action",
  emoji: "⭐",
  emojiClassName: "example-emoji",
  i18nAriaLabel: "exampleAction",
  label: "Do it",
  labelClassName: "example-label",
  labelKey: "doIt",
});

assert.match(markup, /^<button /);
assert.match(markup, /class="example-action"/);
assert.match(markup, /aria-label="Example action"/);
assert.match(markup, /data-i18n-aria-label="exampleAction"/);
assert.match(markup, /class="example-emoji"[^>]*>⭐<\/span>/);
assert.match(markup, /class="example-label" data-i18n="doIt">Do it<\/span>/);
