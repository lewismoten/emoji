import assert from "node:assert/strict";

import { ChoiceGroupControl } from "../../../src/controls/groups/choice-group.js";

const markup = ChoiceGroupControl.toMarkup({
  buttonClassName: "choice-button",
  className: "choice-group",
  inputClassName: "choice-input",
  inputType: "checkbox",
  items: [
    {
      ariaLabel: "One",
      emoji: "1️⃣",
      label: "One",
      labelKey: "one",
      selected: true,
      value: "one",
    },
    {
      ariaLabel: "Two",
      emoji: "2️⃣",
      label: "Two",
      labelKey: "two",
      selected: false,
      value: "two",
    },
  ],
  label: "Numbers",
  labelKey: "numbers",
  maxSelectable: 1,
  minSelectable: 1,
  wrapperTag: "fieldset",
});

assert.match(markup, /<fieldset class="choice-group" data-max-selectable="1" data-min-selectable="1">/);
assert.match(markup, /<legend id="numbers-group-label" data-i18n="numbers">Numbers<\/legend>/);
assert.match(markup, /class="choice-button"/);
assert.match(markup, /data-disabled="true"/);
assert.match(markup, /data-disabled="false"/);
