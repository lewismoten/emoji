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
const stylesheets = documentRef.head.children.filter(
  (child) => child instanceof FakeElement && child.tagName === "LINK",
) as FakeElement[];

assert.equal(stylesheets.length, 3);
assert.deepEqual(
  stylesheets.map((item) => item.href),
  [
    "./explorer/controls/dialog/content/language-dialog.css",
    "./explorer/controls/dialog/dialog-heading.css",
    "./explorer/controls/dialog/dialog-close-button.css",
  ],
);
assert.equal(dialog.className, "language-dialog");
assert.equal(dialog.getAttribute("id"), "language-dialog");
assert.equal(dialog.children.length, 3);

const markup = LanguageDialogControl.toMarkup();
assert.match(markup, /class="language-dialog"/);
assert.match(markup, /class="dialog-description"/);
assert.match(markup, /class="language-list"/);
assert.match(markup, /data-i18n="localizedSearch"/);

restore();
