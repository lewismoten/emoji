import assert from "node:assert/strict";

import { CompactChoiceButtonControl } from "../../../../src/controls/filters/pickers/compact-choice-button.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

const markup = CompactChoiceButtonControl.toMarkup({
  ariaLabel: "Smileys and Emotion",
  emoji: "😀",
  label: "Smileys",
  selected: true,
  value: "smileys",
});

assert.match(markup, /^<button /);
assert.match(markup, /class="compact-choice"/);
assert.match(markup, /role="radio"/);
assert.match(markup, /aria-checked="true"/);
assert.match(markup, /tabindex="0"/);
assert.match(markup, /data-value="smileys"/);
assert.match(markup, /title="Smileys"/);
assert.match(markup, /class="compact-choice-emoji"[^>]*>😀<\/span>/);
assert.match(markup, /class="compact-choice-label">Smileys<\/span>/);

const spec = CompactChoiceButtonControl.toSpec({
  ariaLabel: "Travel and Places",
  emoji: "✈️",
  label: "Travel",
  selected: false,
  value: "travel",
});

assert.equal(spec.tag, "button");
assert.equal(spec.attributes?.["aria-label"], "Travel and Places");
assert.equal(spec.attributes?.tabindex, "-1");
assert.equal(spec.dataset?.value, "travel");

const restore = installFakeDocument();
const globals = globalThis as typeof globalThis & {
  document: { head: FakeElement };
};
const button = new CompactChoiceButtonControl({
  ariaLabel: "Objects",
  emoji: "📦",
  label: "Objects",
  selected: false,
  value: "objects",
}).create() as unknown as FakeElement;

assert.equal(globals.document.head.children.length, 1);
assert.equal(
  (globals.document.head.children[0] as FakeElement).id,
  "compact-choice-button-control-style",
);
assert.equal(button.tagName, "BUTTON");
assert.equal(button.className, "compact-choice");
assert.equal(button.getAttribute("aria-checked"), "false");
assert.equal(button.getAttribute("tabindex"), "-1");
assert.equal(button.dataset.value, "objects");

restore();
