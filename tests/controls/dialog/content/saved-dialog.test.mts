import assert from "node:assert/strict";

import { SavedDialogControl } from "../../../../src/controls/dialog/content/saved-dialog.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

const restore = installFakeDocument();
const documentRef = (
  globalThis as typeof globalThis & {
    document: { head: FakeElement & { children: FakeElement[] } };
  }
).document;

const dialog = SavedDialogControl.create() as unknown as FakeElement;
const stylesheets = documentRef.head.children.filter(
  (child) => child instanceof FakeElement && child.tagName === "LINK",
) as FakeElement[];

assert.equal(stylesheets.length, 3);
assert.deepEqual(
  stylesheets.map((item) => item.href),
  [
    "./explorer/controls/dialog/content/saved-dialog.css",
    "./explorer/controls/dialog/dialog-heading.css",
    "./explorer/controls/dialog/dialog-close-button.css",
  ],
);
assert.equal(dialog.tagName, "DIALOG");
assert.equal(dialog.className, "saved-dialog");
assert.equal(dialog.getAttribute("id"), "saved-dialog");
assert.equal(dialog.children.length, 3);

const markup = SavedDialogControl.toMarkup();
assert.match(markup, /class="saved-dialog"/);
assert.match(markup, /class="saved-emoji-list favorites-list"/);
assert.match(markup, /class="saved-emoji-list copied-list"/);
assert.match(markup, /data-i18n="savedEmoji"/);

restore();
