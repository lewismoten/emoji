import assert from "node:assert/strict";

import { ModifierFilterControl } from "../../../src/controls/filters/modifier-filter-control.js";

class ExampleModifierFilterControl extends ModifierFilterControl {
  constructor() {
    super({
      className: "example-filter",
      inputClassName: "example-input",
      items: [
        {
          emoji: "🧪",
          label: "Example",
          labelKey: "example",
          value: "alpha",
        },
      ],
      legend: "Example legend",
      legendKey: "exampleLegend",
    });
  }
}

const markup = ExampleModifierFilterControl.toMarkup();

assert.match(
  markup,
  /<fieldset class="modifier-filter example-filter" data-max-selectable="1" data-min-selectable="0">/,
);
assert.match(markup, /data-max-selectable="1"/);
assert.match(markup, /data-min-selectable="0"/);
assert.match(
  markup,
  /<legend id="exampleLegend-group-label" data-i18n="exampleLegend">Example legend<\/legend>/,
);
assert.match(markup, /class="example-input"/);
assert.match(markup, /value="alpha"/);
assert.match(markup, /class="modifier-emoji" aria-hidden="true">🧪<\/span>/);
assert.match(markup, /class="modifier-label" data-i18n="example">Example<\/span>/);
