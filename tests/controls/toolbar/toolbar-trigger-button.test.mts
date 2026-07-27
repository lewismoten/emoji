import assert from "node:assert/strict";

import { ToolbarTriggerButtonControl } from "../../../src/controls/toolbar/toolbar-trigger-button.js";

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
