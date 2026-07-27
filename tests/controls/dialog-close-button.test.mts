import assert from "node:assert/strict";

import {
  DialogCloseButtonControl,
  dialogCloseButtonAriaKey,
  dialogCloseButtonClassName,
  dialogCloseButtonLabel,
  dialogCloseButtonText,
} from "../../src/controls/dialog-close-button.js";
import { DomFactory } from "../../src/controls/dom-factory.js";
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

const closeForm = DialogCloseButtonControl.create() as unknown as FakeElement;
assert.equal(closeForm.tagName, "FORM");
assert.equal(closeForm.method, "dialog");
assert.equal(closeForm.children.length, 1);

const closeButton = closeForm.children[0] as FakeElement;
assert.equal(closeButton.tagName, "BUTTON");
assert.equal(closeButton.className, dialogCloseButtonClassName);
assert.equal(closeButton.type, "submit");
assert.equal(closeButton.dataset.i18nAriaLabel, dialogCloseButtonAriaKey);
assert.equal(closeButton.getAttribute("aria-label"), dialogCloseButtonLabel);
assert.equal(closeButton.textContent, dialogCloseButtonText);
const closeMarkup = DialogCloseButtonControl.toMarkup();
assert.match(closeMarkup, /^<form method="dialog"><button /);
assert.match(closeMarkup, /class="dialog-close"/);
assert.match(closeMarkup, /type="submit"/);
assert.match(closeMarkup, /data-i18n-aria-label="close"/);
assert.match(closeMarkup, /aria-label="Close"/);
assert.match(closeMarkup, />×<\/button><\/form>$/);

const customMarkup = new DialogCloseButtonControl({
  buttonClassName: "dialog-close custom-close",
}).toMarkup();
assert.match(customMarkup, /class="dialog-close custom-close"/);
assert.match(customMarkup, /type="submit"/);
assert.match(customMarkup, /data-i18n-aria-label="close"/);
assert.match(customMarkup, /aria-label="Close"/);

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
  dialogCloseButtonClassName,
);

assert.throws(
  () =>
    DomFactory.toMarkup(
      DomFactory.button({
        text: "Broken",
        requireI18n: true,
      }),
    ),
  /Missing i18n metadata/,
);

assert.throws(
  () =>
    DomFactory.toMarkup({
      tag: "button",
      text: "Broken",
      requireAriaLabel: true,
    }),
  /Missing aria-label metadata/,
);

const plainButtonMarkup = DomFactory.toMarkup(
  DomFactory.button({
    attributes: { "aria-label": "Plain button", type: "button" },
    requireI18n: false,
    text: "Plain",
  }),
);
assert.match(plainButtonMarkup, /^<button /);
assert.match(plainButtonMarkup, /type="button"/);
assert.match(plainButtonMarkup, /aria-label="Plain button"/);
assert.match(plainButtonMarkup, />Plain<\/button>$/);

if (originalDocument === undefined) {
  delete (globalThis as typeof globalThis & { document?: any }).document;
} else {
  (globalThis as typeof globalThis & { document: any }).document =
    originalDocument;
}
