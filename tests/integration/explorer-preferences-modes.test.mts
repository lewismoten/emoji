import assert from "node:assert/strict";

import {
  arabicDemo,
  catalogLoader,
  demoHtml,
  demoScript,
  demoStyles,
  explorerBootstrapSessionSource,
  explorerBootstrapShellSource,
  explorerPreferencesSource,
  explorerUi,
  filterPickerHelper,
  pixelArtwork,
  pixelEditorLoaderSource,
  pwaPanelsHelper,
  searchLanguageLifecycle,
  urlStateHelper,
  versionFilterControl,
} from "../shared/unit-fixtures.mjs";

assert.match(
  demoHtml,
  /class="basic-filter-grid"[\s\S]*class="filter-options"[\s\S]*class="advanced-filters-trigger"/,
  "category shortcuts must remain available outside the Advanced filters dialog trigger",
);
assert.match(
  demoHtml,
  /class="setting-choice-group mode-choices"[\s\S]*class="setting-choice mode-choice" data-mode="standard"[\s\S]*class="setting-choice mode-choice" data-mode="advanced"[\s\S]*class="setting-choice mode-choice" data-mode="developer"/,
  "Help and settings must provide Standard, Advanced, and Developer mode choices",
);
assert.match(
  demoHtml,
  /class="filter-field version-field developer-only has-version-slider"/,
  "the Emoji version filter must be visible only in Developer mode",
);
assert.match(
  versionFilterControl,
  /function ensureVersionSliderControl[\s\S]*classList\.add\((["'])developer-only\1\)/,
  "cached version filters must also become developer-only",
);
assert.match(
  explorerPreferencesSource,
  /parseExplorerModeParam[\s\S]*explorerModeFromUrl/,
  "Developer mode must read shared mode state from the URL",
);
assert.match(
  explorerUi,
  /const enabled = \(\) => mode\(\) !== "standard"[\s\S]*const fullEnabled = \(\) => mode\(\) === "developer"[\s\S]*function change[\s\S]*savePreference\((["'])mode\1,\s*(mode|nextMode)\)/,
  "Developer mode must support shared URL activation and persist explicit mode selection",
);
assert.match(
  urlStateHelper,
  /if \(options\.explorerMode !== "standard"\)[\s\S]*params\.set\((["'])mode\1,\s*options\.explorerMode\)[\s\S]*if \(options\.emojiMode === (["'])editor\2\) params\.set\((["'])emojiMode\3,\s*(["'])editor\4\)/,
  "shared advanced and developer dialog URLs must preserve explorer mode",
);
assert.match(
  `${explorerBootstrapSessionSource}\n${searchLanguageLifecycle}`,
  /restoreDeveloperMode: \(\) => \{[\s\S]*explorerModeFromUrl =[\s\S]*parseExplorerModeParam[\s\S]*renderDeveloperMode\(\)[\s\S]*const onPopState[\s\S]*options\.restoreDeveloperMode\(\)[\s\S]*options\.applyDialogUrlState\(\)/,
  "browser navigation must restore explorer mode before applying dialog URL state",
);
assert.match(
  explorerUi,
  /savePreference\((["'])mode\1,\s*(mode|nextMode)\)[\s\S]*options\.syncUrlState\(\)/,
  "changing explorer mode must clean and rewrite URL state from the controller",
);
assert.match(
  searchLanguageLifecycle,
  /const onPopState[\s\S]*options\.restoreDeveloperMode\(\)[\s\S]*options\.syncUrlState\(\)/,
  "changing explorer mode must override and clean older URL history entries",
);
assert.match(
  urlStateHelper,
  /version:\s*options\.developerMode[\s\S]*versionMode:[\s\S]*options\.developerMode[\s\S]*if \(options\.explorerMode !== "standard"\) \{[\s\S]*params\.set\((["'])version\1/,
  "version-specific URL state must remain visible through Developer mode",
);
assert.match(
  demoStyles,
  /html:not\(\[data-developer-mode\]\) \.developer-only,[\s\S]*\.advanced-only\s*\{\s*display:\s*none !important;/,
  "developer-only controls must remain hidden in the default end-user interface",
);
assert.match(
  demoStyles,
  /html:not\(\[data-developer-mode\]\) \.example-dialog\[open\][\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) 12rem;[\s\S]*width:\s*min\(44rem,/,
  "wide end-user emoji details must remain compact when developer panels are hidden",
);
assert.match(
  arabicDemo,
  /المساعدة والإعدادات[\s\S]*data-i18n="mode">الوضع<\/h4>[\s\S]*data-i18n="standard">قياسي<\/span>[\s\S]*data-i18n="advanced">متقدم<\/span>[\s\S]*data-i18n="developer">مطور<\/span>/,
  "localized pages must translate the Mode setting and its choices",
);
assert.match(
  demoStyles,
  /\.filter-picker-dialog \.compact-choices\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:/,
  "group and subgroup dialogs must use readable wrapping grids",
);
assert.doesNotMatch(
  demoHtml,
  /class="basic-filter-grid"[\s\S]*class="compact-choices compact-group-choices"[\s\S]*class="filter-options"/,
  "the sticky filter area must not contain the complete group choice grid",
);
assert.match(
  demoHtml,
  /class="advanced-filters-trigger"[\s\S]*aria-controls="advanced-filters-dialog"[\s\S]*class="advanced-filters-dialog"/,
  "advanced filters must open from a dedicated dialog trigger instead of inline disclosure content",
);
assert.match(
  demoHtml,
  /class="filter-picker-trigger group-picker-trigger"[\s\S]*id="group-filter-dialog"[\s\S]*class="compact-choices compact-group-choices"[\s\S]*id="subgroup-filter-dialog"/,
  "compact group and subgroup triggers must open dedicated picker dialogs",
);
assert.match(
  filterPickerHelper,
  /function openFilterPicker[\s\S]*showModal\(\)[\s\S]*function closeFilterPicker[\s\S]*trigger\?\.focus\(\)/,
  "category picker dialogs must focus the selected choice and return focus after selection",
);
assert.match(
  filterPickerHelper,
  /function renderFilterPickerTrigger[\s\S]*filter-picker-emoji[\s\S]*filter-picker-value[\s\S]*aria-label/,
  "compact category triggers must expose their selected emoji and readable label",
);
assert.match(
  demoStyles,
  /\.search-controls\s*\{[^}]*max-width:\s*none;/,
  "the primary search row must use available wide-screen space",
);
assert.match(
  demoStyles,
  /\.code\s*\{[\s\S]*direction:\s*ltr;[\s\S]*unicode-bidi:\s*isolate;[\s\S]*overflow-x:\s*auto;[\s\S]*white-space:\s*pre;[\s\S]*\.code-space\s*\{[\s\S]*display:\s*inline-block;[\s\S]*width:\s*0\.6ch;/,
  "developer code examples must preserve formatting with explicit spacing helpers",
);
assert.match(
  explorerUi,
  /export function selectEmojiFont[\s\S]*dataset\.emojiFont[\s\S]*options\.savePreference\((["'])pixelFont\1/,
  "the system and pixel previews must control the font preference",
);
assert.match(
  demoHtml,
  /class="pixel-comparison"[\s\S]*class="emoji-font-choice emoji-font-choice-system"[\s\S]*data-emoji-font="system"[\s\S]*class="emoji-font-choice emoji-font-choice-pixel"[\s\S]*data-emoji-font="pixel"/,
  "the font comparison must expose system and pixel choices",
);
assert.match(
  pixelEditorLoaderSource,
  /createPixelEditor[\s\S]*is-editor-view/,
  "demo must initialize the pixel-art editor only when editor mode is opened",
);
assert.doesNotMatch(
  demoScript,
  /^import .*pixel-editor\.js/m,
  "the application entry must not eagerly import the developer-only pixel editor",
);
assert.doesNotMatch(
  demoScript,
  /^import emoji from ['"]\.\/dist\/esm\/index\.js['"]/m,
  "the Explorer must not download the all-emoji package bundle in addition to emoji metadata",
);
assert.match(
  catalogLoader,
  /emojiByKey[^=]*= Object\.fromEntries\([\s\S]*item\.key, item\.emoji/,
  "the Explorer must derive its emoji lookup from the metadata it already downloads",
);
assert.match(
  `${pixelArtwork}\n${explorerBootstrapShellSource}`,
  /const refreshRenderedPixelEmoji[\s\S]*options\.refreshEditor\(\)[\s\S]*refreshEditor:\s*\(\)\s*=>\s*\{[\s\S]*is-editor-view[\s\S]*getPixelEditor\(\)\?\.refreshFontBuild/,
  "font toggles must refresh editor metadata only while the editor is open",
);
assert.match(
  urlStateHelper,
  /emojiMode:\s*(["'])details\1\s*\|\s*(["'])code\2\s*\|\s*(["'])editor\3[\s\S]*params\.set\((["'])emojiMode\4,\s*(["'])editor\5\)/,
  "pixel-editor mode must participate in URL state",
);
assert.match(
  `${explorerUi}\n${explorerBootstrapShellSource}`,
  /explorerPreferences\.pixelFont !== false/,
  "pixel font must be enabled by default",
);
assert.match(
  pixelArtwork,
  /const renderedPixelEmoji[\s\S]*privateUseByKey[\s\S]*String\.fromCodePoint\(privateUsePoint\)/,
  "the explorer must render painted sequences atomically on legacy text shapers",
);
assert.match(
  `${pwaPanelsHelper}`,
  /panelDialogEntry/,
  "utility dialogs must support direct URL panel state",
);
