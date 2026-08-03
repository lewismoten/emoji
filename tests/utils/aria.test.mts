import assert from "node:assert/strict";
import {
  hasPopupListbox,
  isChecked,
  isDisabled,
  isPressed,
  label,
  setChecked,
  setDisabled,
  setLabel,
  setPressed,
} from "../../src/utils/aria.js";

const attributes = new Map<string, string>();
const element = {
  getAttribute(name: string) {
    return attributes.get(name) ?? null;
  },
  setAttribute(name: string, value: string) {
    attributes.set(name, value);
  },
};

setDisabled(element as Element, true);
setChecked(element as Element, true);
setPressed(element as Element, false);
setLabel(element as Element, "Theme");
element.setAttribute("aria-haspopup", "listbox");

assert.equal(isDisabled(element as Element), true);
assert.equal(isChecked(element as Element), true);
assert.equal(isPressed(element as Element), false);
assert.equal(label(element as Element), "Theme");
assert.equal(hasPopupListbox(element as Element), true);
assert.equal(isDisabled(null), false);
assert.equal(isChecked(null), false);
assert.equal(isPressed(null), false);
assert.equal(hasPopupListbox(null), false);
assert.equal(label(null), "");
assert.doesNotThrow(() => setDisabled(null, true));
assert.doesNotThrow(() => setChecked(null, true));
assert.doesNotThrow(() => setPressed(null, true));
assert.doesNotThrow(() => setLabel(null, "ignored"));
