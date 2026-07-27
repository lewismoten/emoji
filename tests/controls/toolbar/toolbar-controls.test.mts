import assert from "node:assert/strict";

import { AdvancedFiltersTriggerControl } from "../../../src/controls/filters/advanced-filters-trigger.js";
import { GenderFilterControl } from "../../../src/controls/filters/gender-filter.js";
import { HairFilterControl } from "../../../src/controls/filters/hair-filter.js";
import { SkinToneFilterControl } from "../../../src/controls/filters/skin-tone-filter.js";
import { ThemeChoiceGroupControl } from "../../../src/controls/toolbar/theme-choice-group.js";
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
assert.match(genderMarkup, /<fieldset class="modifier-filter gender-filter">/);
assert.match(genderMarkup, /<legend data-i18n="gender">Gender<\/legend>/);
assert.match(genderMarkup, /class="gender"/);
assert.match(genderMarkup, /value="male"/);
assert.match(genderMarkup, /value="female"/);
assert.match(genderMarkup, /value="neutral"/);

const skinToneMarkup = SkinToneFilterControl.toMarkup();
assert.match(skinToneMarkup, /<fieldset class="modifier-filter skin-tone-filter">/);
assert.match(skinToneMarkup, /<legend data-i18n="skinTone">Skin tone<\/legend>/);
assert.match(skinToneMarkup, /class="skin-tone"/);
assert.match(skinToneMarkup, /value="1F3FF"/);
assert.match(skinToneMarkup, /value="1F3FE"/);
assert.match(skinToneMarkup, /value="1F3FD"/);
assert.match(skinToneMarkup, /value="1F3FC"/);
assert.match(skinToneMarkup, /value="1F3FB"/);

const hairMarkup = HairFilterControl.toMarkup();
assert.match(hairMarkup, /<fieldset class="modifier-filter hair-filter">/);
assert.match(hairMarkup, /<legend data-i18n="hair">Hair<\/legend>/);
assert.match(hairMarkup, /class="hair"/);
assert.match(hairMarkup, /value="1F9B0"/);
assert.match(hairMarkup, /value="1F9B1"/);
assert.match(hairMarkup, /value="1F9B2"/);
assert.match(hairMarkup, /value="1F9B3"/);
