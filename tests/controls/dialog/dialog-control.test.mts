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

const styleBlocks = documentRef.head.children.filter(
  (child) => child instanceof FakeElement && child.tagName === "STYLE",
) as FakeElement[];

assert.equal(styleBlocks.length, 2);
assert.deepEqual(
  styleBlocks.map((item) => item.id),
  ["dialog-heading-control-style", "dialog-close-button-control-style"],
);
assert.equal(dialog.tagName, "DIALOG");
assert.equal(dialog.className, "dialog example-dialog");
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
assert.match(markup, /class="dialog plain-dialog"/);
assert.match(markup, /id="plain-dialog"/);
assert.match(markup, /class="dialog-copy"/);
assert.doesNotMatch(markup, /dialog-body/);

const emptyMarkup = DialogControl.toMarkup({
  className: "empty-dialog",
  dialogId: "empty-dialog",
  title: "Empty",
  titleId: "empty-dialog-title",
  titleKey: "empty",
});
assert.match(emptyMarkup, /class="dialog empty-dialog"/);
assert.match(emptyMarkup, /id="empty-dialog"/);
assert.doesNotMatch(emptyMarkup, /dialog-copy/);

const spec = DialogControl.toSpec({
  className: "empty-dialog",
  dialogId: "empty-dialog",
  title: "Empty",
  titleId: "empty-dialog-title",
  titleKey: "empty",
});
assert.equal(spec.tag, "dialog");
assert.equal(spec.children?.length, 1);

restore();
