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
assert.match(
  markup,
  /<input class="toggle-input" checked="checked" tabindex="-1" type="checkbox" value="dark"><\/input>/,
);
assert.match(markup, /class="toggle-emoji" aria-hidden="true">🌙<\/span>/);
assert.match(markup, /class="toggle-label" data-i18n="dark">Dark<\/span>/);

const radioMarkup = ToggleButtonControl.toMarkup({
  ariaLabel: "Pick light theme",
  className: "radio-demo",
  inputName: "theme",
  inputType: "radio",
  pressed: false,
  role: "radio",
  tabIndex: 2,
  title: "Light theme",
  value: "light",
});

assert.match(radioMarkup, /^<label class="radio-demo"/);
assert.match(radioMarkup, /aria-checked="false"/);
assert.doesNotMatch(radioMarkup, /aria-pressed=/);
assert.match(radioMarkup, /role="radio"/);
assert.match(radioMarkup, /tabindex="2"/);
assert.match(radioMarkup, /title="Light theme"/);
assert.match(radioMarkup, /name="theme"/);

const minimalMarkup = ToggleButtonControl.toMarkup({
  ariaLabel: "Plain",
  className: "plain-toggle",
  value: "plain",
});

assert.match(minimalMarkup, /^<label class="plain-toggle"/);
assert.match(
  minimalMarkup,
  /<input tabindex="-1" type="checkbox" value="plain"><\/input>/,
);
assert.doesNotMatch(minimalMarkup, /aria-checked=/);
assert.doesNotMatch(minimalMarkup, /aria-pressed=/);
assert.doesNotMatch(minimalMarkup, /<label[^>]*tabindex=/);

const i18nAriaMarkup = ToggleButtonControl.toMarkup({
  ariaLabel: "Localized",
  className: "localized-toggle",
  i18nAriaLabel: "localized",
  value: "localized",
});

assert.match(i18nAriaMarkup, /data-i18n-aria-label="localized"/);

const checkedRadioMarkup = ToggleButtonControl.toMarkup({
  ariaLabel: "Checked radio",
  className: "checked-radio",
  inputType: "radio",
  pressed: true,
  role: "radio",
  value: "checked",
});

assert.match(checkedRadioMarkup, /aria-checked="true"/);

const nonInputMarkup = ToggleButtonControl.toMarkup({
  ariaLabel: "Visual only",
  className: "visual-toggle",
  inputType: "button" as "checkbox",
  label: "Visual",
  value: "visual",
});

assert.doesNotMatch(nonInputMarkup, /<input /);
