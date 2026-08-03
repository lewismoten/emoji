import assert from "node:assert/strict";

import { LanguageDialogControl } from "../../../../src/controls/dialog/content/language-dialog.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

const restore = installFakeDocument();
const documentRef = (
  globalThis as typeof globalThis & {
    document: { head: FakeElement & { children: FakeElement[] } };
  }
).document;

const dialog = LanguageDialogControl.create() as unknown as FakeElement;
const styleBlocks = documentRef.head.children.filter(
  (child) => child instanceof FakeElement && child.tagName === "STYLE",
) as FakeElement[];

assert.equal(styleBlocks.length, 3);
assert.deepEqual(
  styleBlocks.map((item) => item.id),
  [
    "language-dialog-control-style",
    "dialog-heading-control-style",
    "dialog-close-button-control-style",
  ],
);
assert.equal(dialog.className, "dialog language-dialog");
assert.equal(dialog.getAttribute("id"), "language-dialog");
assert.equal(dialog.children.length, 3);

const markup = LanguageDialogControl.toMarkup();
assert.match(markup, /class="dialog language-dialog"/);
assert.match(markup, /class="dialog-description"/);
assert.match(markup, /class="language-list"/);
assert.match(markup, /data-i18n="localizedSearch"/);

restore();
