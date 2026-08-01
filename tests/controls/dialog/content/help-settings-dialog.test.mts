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
const styleBlocks = documentRef.head.children.filter(
  (child) => child instanceof FakeElement && child.tagName === "STYLE",
) as FakeElement[];

assert.ok(styleBlocks.length >= 4);
assert.equal(
  styleBlocks.some(
    (item) => item.id === "help-settings-dialog-control-style",
  ),
  true,
);
assert.equal(
  styleBlocks.some((item) => item.id === "dialog-heading-control-style"),
  true,
);
assert.equal(
  styleBlocks.some((item) => item.id === "dialog-close-button-control-style"),
  true,
);
assert.equal(
  styleBlocks.some((item) => item.id === "theme-choice-group-control-style"),
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
