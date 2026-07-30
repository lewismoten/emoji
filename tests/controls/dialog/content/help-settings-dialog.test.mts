import assert from "node:assert/strict";

import { HelpSettingsDialogControl } from "../../../../src/controls/dialog/content/help-settings-dialog.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

const restore = installFakeDocument();
const documentRef = (
  globalThis as typeof globalThis & {
    document: { head: FakeElement & { children: FakeElement[] } };
  }
).document;

const dialog = HelpSettingsDialogControl.create() as unknown as FakeElement;
const stylesheets = documentRef.head.children.filter(
  (child) => child instanceof FakeElement && child.tagName === "LINK",
) as FakeElement[];

assert.ok(stylesheets.length >= 4);
assert.equal(
  stylesheets.some(
    (item) =>
      item.href === "./explorer/controls/dialog/content/help-settings-dialog.css",
  ),
  true,
);
assert.equal(
  stylesheets.some(
    (item) => item.href === "./explorer/controls/dialog/dialog-heading.css",
  ),
  true,
);
assert.equal(
  stylesheets.some(
    (item) => item.href === "./explorer/controls/dialog/dialog-close-button.css",
  ),
  true,
);
assert.equal(
  stylesheets.some(
    (item) => item.href === "./explorer/controls/toolbar/theme-choice-group.css",
  ),
  true,
);
assert.equal(dialog.className, "help-dialog");
assert.equal(dialog.getAttribute("id"), "help-dialog");
assert.equal(dialog.children.length, 5);

const markup = HelpSettingsDialogControl.toMarkup();
assert.match(markup, /class="help-dialog"/);
assert.match(markup, /class="help-pixel"/);
assert.match(markup, /class="help-settings"/);
assert.match(markup, /class="setting-choice-group mode-choices"/);
assert.match(markup, /class="setting-choice-group audio-choices"/);

restore();
