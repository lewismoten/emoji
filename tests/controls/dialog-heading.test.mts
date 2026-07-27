import assert from "node:assert/strict";

import { DialogCloseButtonControl } from "../../src/controls/dialog-close-button.js";
import { DialogHeadingControl } from "../../src/controls/dialog-heading.js";
import { createDialogHeading } from "../../src/explorer/dialog-control-helpers.js";

type FakeNode = FakeElement | string;

class FakeElement {
  tagName: string;
  children: FakeNode[] = [];
  dataset: Record<string, string | undefined> = {};
  attributes = new Map<string, string>();
  className = "";
  textContent = "";
  type = "";
  method = "";
  id = "";

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  append(...nodes: FakeNode[]) {
    this.children.push(...nodes);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "method") this.method = value;
    if (name === "type") this.type = value;
    if (name === "id") this.id = value;
    if (name === "class") this.className = value;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
}

const originalDocument = (globalThis as typeof globalThis & { document?: any })
  .document;
(globalThis as typeof globalThis & { document: any }).document = {
  createElement(tagName: string) {
    return new FakeElement(tagName);
  },
};

const heading = createDialogHeading({
  titleId: "dialog-title",
  titleKey: "example",
  title: "Example",
  eyebrowKey: "details",
  eyebrow: "Details",
}) as unknown as FakeElement;
assert.equal(heading.className, "dialog-heading");
assert.equal(heading.children.length, 2);
assert.equal((heading.children[1] as FakeElement).tagName, "FORM");
assert.equal(
  ((heading.children[1] as FakeElement).children[0] as FakeElement).className,
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

const closeMarkup = DialogCloseButtonControl.toMarkup();
assert.match(headingMarkup, new RegExp(closeMarkup.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

if (originalDocument === undefined) {
  delete (globalThis as typeof globalThis & { document?: any }).document;
} else {
  (globalThis as typeof globalThis & { document: any }).document =
    originalDocument;
}
