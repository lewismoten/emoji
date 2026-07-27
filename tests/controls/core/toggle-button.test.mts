import assert from "node:assert/strict";

import { ToggleButtonControl } from "../../../src/controls/core/toggle-button.js";

const markup = ToggleButtonControl.toMarkup({
  ariaLabel: "Demo",
  className: "toggle-demo",
  dataAttributes: { theme: "dark" },
  emoji: "🌙",
  emojiClassName: "toggle-emoji",
  inputClassName: "toggle-input",
  inputType: "checkbox",
  label: "Dark",
  labelClassName: "toggle-label",
  labelKey: "dark",
  pressed: true,
  value: "dark",
});

assert.match(markup, /^<label class="toggle-demo"/);
assert.match(markup, /aria-label="Demo"/);
assert.match(markup, /data-theme="dark"/);
assert.match(markup, /<input class="toggle-input" checked="checked" type="checkbox" value="dark"><\/input>/);
assert.match(markup, /class="toggle-emoji" aria-hidden="true">🌙<\/span>/);
assert.match(markup, /class="toggle-label" data-i18n="dark">Dark<\/span>/);
