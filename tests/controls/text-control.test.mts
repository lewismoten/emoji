import assert from "node:assert/strict";

import { TextControl } from "../../src/controls/text-control.js";
import { FakeElement, installFakeDocument } from "./fake-dom.mjs";

const restore = installFakeDocument();

const heading = TextControl.create({
  className: "eyebrow",
  i18nKey: "localizedSearch",
  id: "eyebrow-id",
  tag: "p",
  text: "Localized search",
}) as unknown as FakeElement;
assert.equal(heading.tagName, "P");
assert.equal(heading.className, "eyebrow");
assert.equal(heading.id, "eyebrow-id");
assert.equal(heading.dataset.i18n, "localizedSearch");
assert.equal(heading.textContent, "Localized search");

assert.equal(
  TextControl.toMarkup({
    i18nKey: "chooseLanguage",
    id: "language-title",
    tag: "h2",
    text: "Choose a search language",
  }),
  '<h2 id="language-title" data-i18n="chooseLanguage">Choose a search language</h2>',
);

assert.equal(
  TextControl.toMarkup({
    requireI18n: false,
    tag: "span",
    text: "Plain",
  }),
  "<span>Plain</span>",
);

assert.throws(
  () =>
    TextControl.toMarkup({
      requireI18n: true,
      tag: "span",
      text: "Broken",
    }),
  /Missing i18n metadata/,
);

restore();
