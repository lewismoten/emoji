import assert from "node:assert/strict";

import { VersionStepButtonControl } from "../../../../src/controls/filters/version/version-step-button.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

const markup = new VersionStepButtonControl({
  ariaLabel: "Next Unicode version",
  disabled: true,
  text: "+",
}).toMarkup();

assert.match(markup, /^<button /);
assert.match(markup, /class="version-step"/);
assert.match(markup, /type="button"/);
assert.match(markup, /aria-label="Next Unicode version"/);
assert.match(markup, /disabled="disabled"/);
assert.match(markup, />\+<\/button>$/);

const restore = installFakeDocument();
const globals = globalThis as typeof globalThis & {
  document: { head: FakeElement };
};
const button = new VersionStepButtonControl({
  ariaLabel: "Previous Unicode version",
  buttonClassName: "version-step previous",
  text: "−",
}).create() as unknown as FakeElement;

assert.equal(globals.document.head.children.length, 1);
assert.equal(button.tagName, "BUTTON");
assert.equal(button.className, "version-step previous");
assert.equal(button.type, "button");
assert.equal(button.getAttribute("aria-label"), "Previous Unicode version");
assert.equal(button.textContent, "−");

restore();
