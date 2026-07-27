import assert from "node:assert/strict";

import { DialogCloseButtonControl } from "../../../src/controls/dialog/dialog-close-button.js";
import { DialogHeadingControl } from "../../../src/controls/dialog/dialog-heading.js";
import { createDialogHeading } from "../../../src/explorer/dialog-control-helpers.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

const restore = installFakeDocument();
const documentRef = (
  globalThis as typeof globalThis & {
    document: {
      head: FakeElement & { children: FakeElement[] };
    };
  }
).document;
const heading = createDialogHeading({
  titleId: "dialog-title",
  titleKey: "example",
  title: "Example",
  eyebrowKey: "details",
  eyebrow: "Details",
}) as unknown as FakeElement;
const stylesheets = (documentRef.head.children as FakeElement[]).filter(
  (child) => child.tagName === "LINK",
);
assert.equal(stylesheets.length, 2);
assert.equal(stylesheets[0]?.id, "dialog-heading-control-stylesheet");
assert.equal(stylesheets[0]?.href, "./explorer/controls/dialog/dialog-heading.css");
assert.equal(stylesheets[1]?.id, "dialog-close-button-control-stylesheet");
assert.equal(
  stylesheets[1]?.href,
  "./explorer/controls/dialog/dialog-close-button.css",
);
assert.equal(heading.className, "dialog-heading");
assert.equal(heading.children.length, 2);
assert.equal((heading.children[0] as FakeElement).className, "dialog-title-row");
assert.equal((heading.children[1] as FakeElement).className, "dialog-controls");
assert.equal((heading.children[1] as FakeElement).children[0] instanceof FakeElement, true);
assert.equal(
  ((heading.children[1] as FakeElement).children[0] as FakeElement).tagName,
  "FORM",
);
assert.equal(
  (
    (((heading.children[1] as FakeElement).children[0] as FakeElement)
      .children[0] as FakeElement)
  ).className,
  "dialog-close",
);

const headingMarkup = DialogHeadingControl.toMarkup({
  eyebrow: "Localized search",
  eyebrowKey: "localizedSearch",
  title: "Choose a search language",
  titleId: "language-title",
  titleKey: "chooseLanguage",
});
assert.match(headingMarkup, /^<div class="dialog-heading">/);
assert.match(
  headingMarkup,
  /<p class="eyebrow" data-i18n="localizedSearch">Localized search<\/p>/,
);
assert.match(
  headingMarkup,
  /<h2 id="language-title" data-i18n="chooseLanguage">Choose a search language<\/h2>/,
);
assert.match(headingMarkup, /class="dialog-close"/);

const headingWithCustomClose = DialogHeadingControl.toMarkup({
  closeButtonClassName: "dialog-close alt-close",
  title: "Plain title",
  titleId: "plain-title",
  titleKey: "plainTitle",
});
assert.match(headingWithCustomClose, /class="dialog-close alt-close"/);
assert.match(headingWithCustomClose, /<h2 id="plain-title" data-i18n="plainTitle">Plain title<\/h2>/);
assert.doesNotMatch(headingWithCustomClose, /class="eyebrow"/);

const closeMarkup = DialogCloseButtonControl.toMarkup();
assert.match(headingMarkup, new RegExp(closeMarkup.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

DialogHeadingControl.create({
  title: "Second",
  titleId: "second-title",
  titleKey: "secondTitle",
});
const duplicateStylesheets = (documentRef.head.children as FakeElement[]).filter(
  (child) => child.tagName === "LINK",
);
assert.equal(duplicateStylesheets.length, 2);

restore();
