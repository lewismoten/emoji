import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import {
  compositionHelpers,
  demoHtml,
  demoScript,
  demoStyles,
  dialogRenderHelper,
  dialogViewHelper,
  emojiCompositionHelper,
  emojiDialogEvents,
  emojiFilterHelper,
  emojiFormatHelper,
  explorerDataController,
  root,
  pixelArtwork,
  versionData,
  urlStateHelper,
  categoryVersionHelper,
} from "../shared/unit-fixtures.mjs";

assert.match(
  dialogRenderHelper,
  /options\.updateEmojiComposition\(options\.item, options\.value\)/,
  "emoji details must render multi-code-point compositions",
);
assert.match(
  emojiCompositionHelper,
  /detailsVisible[\s\S]*section\.hidden =[\s\S]*!options\.developerMode[\s\S]*points\.length <= 1[\s\S]*!options\.detailsVisible/,
  "sequence composition must remain hidden while navigating in the pixel editor",
);
assert.match(
  compositionHelpers,
  /0x200D[\s\S]*zeroWidthJoiner/i,
  "emoji compositions must identify zero-width joiners",
);
assert.match(
  demoStyles,
  /\.emoji-composition-equation[\s\S]*flex-wrap: wrap/,
  "long emoji compositions must wrap",
);
assert.match(
  emojiCompositionHelper,
  /createCompositionTerm\((["'])\+\1,\s*part\)/,
  "composition operators must wrap with their following component",
);
assert.doesNotMatch(
  demoScript,
  /glyph: `TAG |glyph: 'END'|glyph: 'SPACE'/,
  "tag-sequence labels must not display hard-coded English",
);
assert.match(
  compositionHelpers,
  /translate\((["'])tagAbbreviation\1,\s*(["'])TAG\2\)/,
  "tag characters must use compact localized labels",
);
assert.match(
  compositionHelpers,
  /cancelTagAbbreviation[\s\S]*(["'])END\1/,
  "tag endings must use compact localized labels",
);
assert.match(
  emojiDialogEvents,
  /dataset\.compositionEmoji/,
  "composition parts must navigate to matching library emoji",
);
assert.match(
  compositionHelpers,
  /function findCompositionArtworkKey[\s\S]*emojiKeyByCodePoints\.get\(`\$\{normalized\} FE0F`\)[\s\S]*function findCompositionEmojiKey[\s\S]*findCompositionArtworkKey\(hex, emojiKeyByCodePoints\)[\s\S]*emojiKey !== excludedEmojiKey/,
  "composition links must recognize presentation variants without linking to the current emoji",
);
assert.match(
  demoStyles,
  /button\.emoji-composition-part:hover/,
  "linked composition parts must appear interactive",
);
assert.match(
  demoHtml,
  /class="dialog-navigate emoji-parent"/,
  "emoji details must provide parent-sequence navigation",
);
assert.match(
  await fs.readFile(
    path.join(root, "src/app/emoji-dialog-click-runtime.ts"),
    "utf8",
  ),
  /compositionParent: parentEmojiKey/,
  "component navigation must retain its parent in browser history",
);
assert.match(
  emojiDialogEvents,
  /target\.closest\((["'])\.emoji-parent\1\)[\s\S]*window\.history\.back/,
  "parent navigation must use browser history",
);
assert.match(
  dialogRenderHelper,
  /delete nextState\.compositionParent/,
  "ordinary dialog navigation must clear stale component history",
);
assert.match(
  await fs.readFile(path.join(root, "src/app/dialog-runtime.ts"), "utf8"),
  /showModal\(\);[\s\S]*options\.focusInitialAction\(\)/,
  "newly opened emoji dialogs must focus their primary copy action",
);
assert.match(
  dialogViewHelper,
  /querySelector\((["'])\.emoji-preview\1\)[\s\S]*focus\(\{ preventScroll: true \}\)/,
  "emoji details must initially focus the large copy button",
);
assert.match(
  demoStyles,
  /\.emoji-preview:focus-visible\s*\{\s*outline:\s*2px solid var\(--accent\);\s*outline-offset:\s*-3px;\s*\}/,
  "the initial copy focus ring must remain inside the sticky dialog header boundary",
);
assert.match(
  demoHtml,
  /class="emoji-composition-mode"/,
  "foldable compositions must provide a display-mode toggle",
);
assert.match(
  demoHtml,
  /class="filter-field sequence-filter-field has-choice-buttons"/,
  "sequence browsing must provide an initially enhanced sequence-type filter",
);
assert.match(
  categoryVersionHelper,
  /updateModifierAvailability/,
  "version helpers must continue to expose modifier-availability coordination",
);
assert.match(
  await fs.readFile(
    path.join(root, "src/explorer/category-filter-layout.ts"),
    "utf8",
  ),
  /if \(options\.groupField\)\s*options\.groupField\.hidden = options\.sequenceMode;[\s\S]*if \(options\.sequenceField\)\s*options\.sequenceField\.hidden = !options\.sequenceMode;/,
  "sequence browsing must replace group filters with sequence types",
);
assert.match(
  emojiFilterHelper,
  /options\.orderMode === (["'])sequence\1 && options\.selectedSequenceType[\s\S]*sequenceType === options\.selectedSequenceType/,
  "sequence-type selections must filter the emoji list",
);
assert.match(
  urlStateHelper,
  /params\.set\((["'])sequenceType\1,\s*options\.sequenceType\)/,
  "sequence-type filters must persist in the URL",
);
assert.match(
  demoStyles,
  /\.sequence-type > \.name\s*\{[\s\S]*position:\s*sticky;[\s\S]*top:\s*var\(--toolbar-height\);/,
  "sequence-type headings must remain sticky below the toolbar",
);
assert.match(
  compositionHelpers,
  /function condenseCompositionPoints/,
  "emoji compositions must detect known nested sequences",
);
assert.match(
  emojiCompositionHelper,
  /hasHiddenSequenceControl[\s\S]*isCondensedSequenceControl[\s\S]*condensedParts\.filter/,
  "condensed compositions must hide structural controls until full mode",
);
assert.match(
  compositionHelpers,
  /return point === 0x200d \|\| point === 0xfe0e \|\| point === 0xfe0f/i,
  "condensed compositions must hide ZWJ and presentation selectors",
);
assert.match(
  emojiCompositionHelper,
  /function createCompositionPart[\s\S]*findCompositionArtworkKey\([\s\S]*applyStandalonePixelArtwork\(glyph, artworkEmojiKey\)/,
  "composition components must use painted artwork even when linking to themselves is suppressed",
);
assert.match(
  `${versionData}\n${explorerDataController}`,
  /versionKeys: new Map\(\[\.\.\.releasedKeys, \.\.\.proposedKeys\]\)[\s\S]*options\.state\(\)\.versionKeys = versions\.versionKeys;[\s\S]*options\.rebuildCodePointLookup\(\);/,
  "proposed emoji must be added to the sequence artwork lookup",
);
assert.match(
  await fs.readFile(
    path.join(root, "src/app/explorer-bootstrap-shell.ts"),
    "utf8",
  ),
  /applyStandalonePixelArtwork:\s*\(\)\s*=>\s*pixelArtwork\.applyPixelArtworkClass[\s\S]*applyStandalonePixelArtwork:\s*pixelArtwork\.applyPixelArtworkClass/,
  "standalone sequence components must use their painted font glyphs",
);
assert.match(
  pixelArtwork,
  /const updateModifierPixelArtwork[\s\S]*applyPixelArtworkClass/,
  "modifier filter swatches must use standalone generated artwork",
);
assert.match(
  compositionHelpers,
  /for \(let end = points\.length; end >= start \+ 2; end--\)/,
  "composition folding must prefer the longest known sequence",
);
assert.match(
  urlStateHelper,
  /params\.get\((["'])composition\1\) === (["'])full\2/,
  "composition mode must load from the URL",
);
assert.match(
  urlStateHelper,
  /params\.set\((["'])composition\1,\s*(["'])full\2\)/,
  "full composition mode must persist in the URL",
);
assert.match(
  emojiCompositionHelper,
  /compositionReductionLabel\(partData\.components\.length, 1,/,
  "condensed composition counts must use localized direction",
);
assert.match(
  await fs.readFile(
    path.join(root, "src/explorer/dialog/emoji-session.ts"),
    "utf8",
  ),
  /startsWith\((["'])ar\1\)[\s\S]*\?\s*(["'])arab\2\s*:\s*undefined/,
  "Arabic UI numbers must use Arabic-Indic digits",
);
assert.match(
  emojiFormatHelper,
  /options\.dir === (["'])rtl\1[\s\S]*\? `\$\{toLabel\}\\u2190\$\{fromLabel\}`/,
  "RTL composition reductions must begin at the right and point left",
);
assert.match(
  demoStyles,
  /\[dir="rtl"\] \.emoji-composition-equation \{[\s\S]*direction: rtl;[\s\S]*justify-content: flex-start;/,
  "RTL compositions must begin at the right and progress leftward",
);
assert.match(
  demoStyles,
  /\.emoji-composition-code-point\s*\{\s*direction:\s*ltr;\s*unicode-bidi:\s*isolate;\s*\}/,
  "individual code-point labels must retain LTR ordering",
);
assert.match(
  demoStyles,
  /\.emoji-preview-glyph\.has-pixel-art\s*\{[\s\S]*font-size:\s*6rem;[\s\S]*\.emoji-composition-glyph\.has-pixel-art[\s\S]*font-size:\s*1\.5rem;[\s\S]*@media \(max-width: 560px\)[\s\S]*\.emoji-preview-glyph\.has-pixel-art[\s\S]*font-size:\s*3\.75rem;/,
  "dialog pixel-font previews must use crisp multiples of the 12-pixel grid",
);
assert.match(
  demoHtml,
  /class="rendering-diagnostic developer-only"[\s\S]*system-render-glyph[\s\S]*pixel-render-glyph/,
  "emoji details must compare system and Pixel Emoji rendering",
);
assert.match(
  demoHtml,
  /class="pixel-design-invitation developer-only"[\s\S]*createPixelDesign/,
  "unfinished glyphs must invite visitors into the pixel editor",
);
