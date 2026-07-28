import assert from "node:assert/strict";

import { ToolbarTriggerButtonControl } from "../../../src/controls/toolbar/toolbar-trigger-button.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

const favoriteMarkup = ToolbarTriggerButtonControl.toMarkup({
  ariaLabel: "Saved emoji",
  ariaLabelKey: "savedEmoji",
  className: "saved-picker",
  controls: "saved-dialog",
  icon: "⭐",
  iconClassName: "modifier-emoji favorite-glyph",
  label: "Favorites",
  labelClassName: "saved-picker-label",
  labelKey: "favorites",
});

assert.ok(favoriteMarkup.includes('class="saved-picker"'));
assert.ok(favoriteMarkup.includes('aria-controls="saved-dialog"'));
assert.ok(favoriteMarkup.includes('data-i18n-aria-label="savedEmoji"'));
assert.ok(
  favoriteMarkup.includes(
    'class="saved-picker-label" data-i18n="favorites"',
  ),
);

const helpMarkup = ToolbarTriggerButtonControl.toMarkup({
  ariaLabel: "Help and settings",
  ariaLabelKey: "helpAndSettings",
  className: "help-picker",
  controls: "help-dialog",
  icon: "\\?",
});

assert.ok(helpMarkup.includes('class="help-picker"'));
assert.ok(!helpMarkup.includes("saved-picker-label"));

const restore = installFakeDocument();
const globals = globalThis as typeof globalThis & { document: { head: FakeElement } };
ToolbarTriggerButtonControl.create({
  ariaLabel: "Plain",
  ariaLabelKey: "plain",
  className: "plain-picker",
  controls: "plain-dialog",
  icon: "!",
});
assert.equal(globals.document.head.children.length, 1);
assert.equal(
  (globals.document.head.children[0] as FakeElement).id,
  "toolbar-trigger-button-control-stylesheet",
);
restore();
