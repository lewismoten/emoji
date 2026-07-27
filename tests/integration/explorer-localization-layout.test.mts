import assert from "node:assert/strict";

import {
  arabicDemo,
  catalogLoader,
  demoHtml,
  demoStyles,
  explorerApp,
  pixelArtwork,
  utilityControlsHelper,
} from "../shared/unit-fixtures.mjs";

assert.match(
  arabicDemo,
  /<html\b(?=[^>]*\blang="ar")(?=[^>]*\bdir="rtl")(?=[^>]*\bdata-locale="ar")[^>]*>/,
  "Arabic demo page must start in Arabic and RTL",
);
assert.match(
  arabicDemo,
  /جارٍ تحميل مستكشف الرموز التعبيرية/,
  "Arabic demo loading state must be localized before JavaScript runs",
);
assert.match(
  arabicDemo,
  /نسخ الرابط/,
  "Arabic demo must localize the copy-link action",
);
assert.match(
  arabicDemo,
  /اختصارات لوحة المفاتيح/,
  "Arabic demo must localize keyboard help",
);
assert.match(
  arabicDemo,
  /الرموز التعبيرية المحفوظة/,
  "Arabic demo must localize saved emoji",
);
assert.match(
  arabicDemo,
  /تحرير الرسم بالبكسل/,
  "Arabic demo must localize the pixel editor",
);
assert.equal(
  demoHtml.match(/data-copy="link"/g)?.length,
  2,
  "details and code views must both provide copy-link actions",
);
assert.match(
  demoHtml,
  /class="copy-action-long"/,
  "emoji copy actions must retain their full desktop labels",
);
assert.match(
  demoHtml,
  /class="copy-action-short"/,
  "emoji copy actions must provide compact mobile labels",
);
assert.match(
  demoStyles,
  /\.copy-action-long\s*\{\s*display:\s*none;\s*\}[\s\S]*\.copy-action-short\s*\{\s*display:\s*inline;\s*\}/,
  "emoji-dialog copy actions must use compact labels by default",
);
assert.match(
  demoStyles,
  /\.emoji-copy-actions \.copy-action-short::before \{[\s\S]*content: "⧉"/,
  "compact emoji copy actions must share a visible copy icon",
);
assert.match(
  demoStyles,
  /@media \(min-width: 561px\)[\s\S]*\.example-dialog \.copy-action-long\s*\{\s*display:\s*inline;\s*\}[\s\S]*\.example-dialog \.copy-action-short\s*\{\s*display:\s*none;\s*\}/,
  "wide emoji dialogs must restore the full copy labels",
);
assert.match(
  demoStyles,
  /@media \(max-width: 560px\)[\s\S]*\.example-dialog > \.dialog-heading \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) repeat\(2, 2rem\)/,
  "mobile emoji-dialog headings must use a compact two-by-two control grid beside the title",
);
assert.match(
  demoStyles,
  /\.example-dialog \.emoji-previous\s*\{[\s\S]*grid-row:\s*2;[\s\S]*\.example-dialog \.emoji-next\s*\{[\s\S]*grid-row:\s*2;/,
  "mobile emoji navigation must move below the complete title",
);
const searchControlsMarkup =
  /<div class="search-controls">([\s\S]*?)<\/div>\s*<div class="basic-filter-grid">/.exec(
    demoHtml,
  )?.[1] ?? "";
assert.doesNotMatch(
  searchControlsMarkup,
  /class="language-picker"/,
  "the language picker must not occupy the primary search row",
);
assert.match(
  demoHtml,
  /class="help-settings"[\s\S]*class="help-language-control"[\s\S]*class="language-picker"[\s\S]*class="developer-mode-toggle"/,
  "Help and settings must contain both language and Developer mode preferences",
);
assert.match(
  demoHtml,
  /aria-labelledby="language-picker-accessible-label language-picker-current-label"[\s\S]*id="language-picker-current-label"/,
  "the language setting must expose its action and current native language as its accessible name",
);
assert.match(
  explorerApp,
  /options\.languagePicker\.addEventListener\((["'])click\1[\s\S]*options\.helpDialog\?\.open[\s\S]*options\.closePanel\(options\.helpDialog[\s\S]*panel\((["'])language\2\)/,
  "opening the language picker from Help must transition between modal dialogs",
);
assert.match(
  utilityControlsHelper,
  /helpLanguageControl[\s\S]*document\.querySelector\((["'])\.language-picker\1\)[\s\S]*helpLanguageControl\.append\(languagePicker\)/,
  "cached pages must move an older toolbar language control into Help and settings",
);
assert.match(
  demoStyles,
  /\.modifier-filters fieldset label \{[\s\S]*width: 2\.65rem;[\s\S]*height: 2\.65rem;/,
  "mobile modifier buttons, including gender, must remain square",
);
assert.match(
  demoStyles,
  /\.modifier-filters fieldset label \{[\s\S]*min-height: 2\.25rem;[\s\S]*border: 1px solid var\(--border\)/,
  "modifier filters must remain button-like on wide screens",
);
assert.match(
  demoStyles,
  /\.modifier-emoji\s*\{[\s\S]*font-family:\s*var\(--system-emoji-font\);[\s\S]*font-variant-emoji:\s*emoji;/,
  "modifier buttons must display native component glyphs instead of blank font components",
);
assert.match(
  demoStyles,
  /\.emoji-composition-glyph\s*\{[\s\S]*font-family:\s*var\(--system-emoji-font\);[\s\S]*\.emoji-composition-glyph\.has-pixel-art\s*\{[\s\S]*font-family:\s*var\(--emoji-font\);/,
  "sequence parts must use native glyphs unless painted artwork is available",
);
assert.match(
  catalogLoader,
  /pixelFontManifestUrl[\s\S]*fetch\(\s*pixelFontManifestUrl[\s\S]*updatePixelArtworkManifest\(pixelFontManifest\)/,
  "the demo must discover which emoji have painted pixel-font glyphs",
);
assert.match(
  pixelArtwork,
  /const updatePixelArtworkManifest[\s\S]*proposedKeys = new Set[\s\S]*releaseStatus === (["'])proposed\1/,
  "the demo must distinguish proposed artwork from released pixel glyphs",
);
assert.match(
  demoStyles,
  /\.emoji-glyph\.has-proposed-pixel-art,[\s\S]*--pixel-emoji-proposed-family[\s\S]*var\(--emoji-font\)/,
  "painted draft emoji must bypass system fonts that claim unsupported code points",
);
assert.match(
  pixelArtwork,
  /const updateModifierPixelArtwork[\s\S]*applyPixelArtworkClass/,
  "painted modifier swatches must opt into the pixel font",
);
assert.match(
  demoStyles,
  /\.modifier-filters fieldset input \{[\s\S]*clip: rect\(0, 0, 0, 0\)/,
  "modifier checkboxes must remain accessible without being visually exposed",
);
