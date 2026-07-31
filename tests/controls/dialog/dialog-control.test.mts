import assert from "node:assert/strict";

import { DialogControl } from "../../../src/controls/dialog/dialog-control.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

const restore = installFakeDocument();
const documentRef = (
  globalThis as typeof globalThis & {
    document: { head: FakeElement & { children: FakeElement[] } };
  }
).document;

const dialog = DialogControl.create({
  bodyClassName: "example-dialog-body",
  children: [
    {
      className: "dialog-copy",
      tag: "p",
      text: "Hello",
    },
  ],
  className: "example-dialog",
  dialogId: "example-dialog",
  eyebrow: "Developer",
  eyebrowKey: "developer",
  title: "Example",
  titleId: "example-dialog-title",
  titleKey: "example",
}) as unknown as FakeElement;

const stylesheets = documentRef.head.children.filter(
  (child) => child instanceof FakeElement && child.tagName === "LINK",
) as FakeElement[];

assert.equal(stylesheets.length, 2);
assert.deepEqual(
  stylesheets.map((item) => item.href),
  [
    "./explorer/controls/dialog/dialog-heading.css",
    "./explorer/controls/dialog/dialog-close-button.css",
  ],
);
assert.equal(dialog.tagName, "DIALOG");
assert.equal(dialog.className, "example-dialog");
assert.equal(dialog.getAttribute("id"), "example-dialog");
assert.equal(dialog.children.length, 2);
assert.equal(
  (dialog.children[1] as FakeElement | undefined)?.className,
  "example-dialog-body",
);

const markup = DialogControl.toMarkup({
  children: [
    {
      className: "dialog-copy",
      tag: "p",
      text: "Hello",
    },
  ],
  className: "plain-dialog",
  dialogId: "plain-dialog",
  title: "Plain",
  titleId: "plain-dialog-title",
  titleKey: "plain",
});
assert.match(markup, /class="plain-dialog"/);
assert.match(markup, /id="plain-dialog"/);
assert.match(markup, /class="dialog-copy"/);
assert.doesNotMatch(markup, /dialog-body/);

restore();
