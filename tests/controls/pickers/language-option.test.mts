import assert from "node:assert/strict";

import { LanguageOptionControl } from "../../../src/controls/pickers/language-option.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

const restore = installFakeDocument();

const selected = LanguageOptionControl.create({
  flag: "🇸🇦",
  href: "./index.ar.html",
  label: "Arabic",
  locale: "ar",
  selected: true,
}) as unknown as FakeElement;

assert.equal(selected.className, "language-option is-selected");
assert.equal(selected.getAttribute("role"), "radio");
assert.equal(selected.getAttribute("aria-checked"), "true");
assert.equal(selected.children.length, 3);
assert.equal((selected.children[0] as FakeElement).tagName, "INPUT");
assert.equal((selected.children[1] as FakeElement).textContent, "🇸🇦");
assert.equal((selected.children[2] as FakeElement).textContent, "Arabic");
assert.equal(selected.dataset.href, "./index.ar.html");

const markup = LanguageOptionControl.toMarkup({
  flag: "🇬🇧",
  label: "English",
  locale: "en",
  selected: false,
});
assert.match(markup, /class="language-option"/);
assert.doesNotMatch(markup, /is-selected/);
assert.match(markup, /aria-checked="false"/);
assert.match(markup, /English/);

restore();
