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
const styleBlocks = documentRef.head.children.filter(
  (child) => child instanceof FakeElement && child.tagName === "STYLE",
) as FakeElement[];

assert.equal(styleBlocks.length, 3);
assert.deepEqual(
  styleBlocks.map((item) => item.id),
  [
    "saved-dialog-control-style",
    "dialog-heading-control-style",
    "dialog-close-button-control-style",
  ],
);
assert.equal(dialog.tagName, "DIALOG");
assert.equal(dialog.className, "dialog saved-dialog");
assert.equal(dialog.getAttribute("id"), "saved-dialog");
assert.equal(dialog.children.length, 3);

const markup = SavedDialogControl.toMarkup();
assert.match(markup, /class="dialog saved-dialog"/);
assert.match(markup, /class="saved-emoji-list favorites-list"/);
assert.match(markup, /class="saved-emoji-list copied-list"/);
assert.match(markup, /data-i18n="savedEmoji"/);

restore();
