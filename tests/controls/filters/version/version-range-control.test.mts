import assert from "node:assert/strict";

import { VersionRangeControl } from "../../../../src/controls/filters/version/version-range-control.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

const defaultMarkup = VersionRangeControl.toMarkup();
assert.match(defaultMarkup, /id="version-range"/);
assert.match(defaultMarkup, /id="version-range-value"/);
assert.match(defaultMarkup, /aria-labelledby="version-filter-label"/);

const markup = VersionRangeControl.toMarkup({
  labelId: "custom-version-label",
  outputId: "custom-version-output",
  rangeId: "custom-version-range",
});

assert.match(markup, /^<div class="compact-version">/);
assert.match(markup, /class="version-range"/);
assert.match(markup, /type="range"/);
assert.match(markup, /id="custom-version-range"/);
assert.match(markup, /aria-labelledby="custom-version-label"/);
assert.match(markup, /aria-describedby="custom-version-output"/);
assert.match(markup, /class="version-range-value"/);
assert.match(markup, /id="custom-version-output"/);
assert.match(markup, /for="custom-version-range"/);
assert.match(markup, />—<\/output>/);

const restore = installFakeDocument();
const instance = new VersionRangeControl();
assert.match(instance.toMarkup(), /class="compact-version"/);
const wrapper = VersionRangeControl.create({
  labelId: "version-filter-label",
}) as unknown as FakeElement;

assert.equal(wrapper.tagName, "DIV");
assert.equal(wrapper.className, "compact-version");
assert.equal(wrapper.children.length, 2);
assert.equal((wrapper.children[0] as FakeElement).className, "version-range");
assert.equal(
  (wrapper.children[0] as FakeElement).getAttribute("type"),
  "range",
);
assert.equal(
  (wrapper.children[1] as FakeElement).className,
  "version-range-value",
);
assert.equal((wrapper.children[1] as FakeElement).textContent, "—");

restore();
