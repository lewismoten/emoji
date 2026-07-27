import assert from "node:assert/strict";

import { AdvancedFiltersTriggerControl } from "../../src/controls/advanced-filters-trigger.js";
import { GenderFilterControl } from "../../src/controls/gender-filter.js";
import { ThemeChoiceGroupControl } from "../../src/controls/theme-choice-group.js";
import { ToolbarTriggerButtonControl } from "../../src/controls/toolbar-trigger-button.js";

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

assert.match(favoriteMarkup, /class="saved-picker"/);
assert.match(favoriteMarkup, /aria-controls="saved-dialog"/);
assert.match(favoriteMarkup, /data-i18n-aria-label="savedEmoji"/);
assert.match(favoriteMarkup, /class="saved-picker-label" data-i18n="favorites"/);

const helpMarkup = ToolbarTriggerButtonControl.toMarkup({
  ariaLabel: "Help and settings",
  ariaLabelKey: "helpAndSettings",
  className: "help-picker",
  controls: "help-dialog",
  icon: "\\?",
});

assert.match(helpMarkup, /class="help-picker"/);
assert.doesNotMatch(helpMarkup, /saved-picker-label/);

const advancedMarkup = AdvancedFiltersTriggerControl.toMarkup();
assert.match(advancedMarkup, /class="advanced-filters-trigger"/);
assert.match(advancedMarkup, /data-i18n="advancedFilters"/);
assert.match(advancedMarkup, /data-i18n="filters"/);

const themeMarkup = ThemeChoiceGroupControl.toMarkup();
assert.match(themeMarkup, /class="setting-choice-group theme-choices"/);
assert.match(themeMarkup, /data-theme="light"/);
assert.match(themeMarkup, /data-theme="dark"/);
assert.match(themeMarkup, /data-theme="retro"/);

const genderMarkup = GenderFilterControl.toMarkup();
assert.match(genderMarkup, /<fieldset class="gender-filter">/);
assert.match(genderMarkup, /<legend data-i18n="gender">Gender<\/legend>/);
assert.match(genderMarkup, /class="gender"/);
assert.match(genderMarkup, /value="male"/);
assert.match(genderMarkup, /value="female"/);
assert.match(genderMarkup, /value="neutral"/);
