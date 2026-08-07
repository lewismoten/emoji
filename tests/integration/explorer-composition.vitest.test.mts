import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  categoryVersionHelper,
  compositionHelpers,
  demoHtml,
  demoScript,
  demoStyles,
  dialogRenderHelper,
  dialogRuntimeHelper,
  dialogUpgradeHelper,
  dialogViewHelper,
  emojiCompositionHelper,
  emojiCompositionSectionControlSource,
  emojiDialogEvents,
  emojiFilterHelper,
  emojiFormatHelper,
  explorerDataController,
  pixelArtwork,
  root,
  urlStateHelper,
  versionData,
} from "../shared/unit-fixtures.mjs";

describe("explorer composition integration", () => {
  it("preserves composition behavior and related source guarantees", async () => {
    expect(dialogRenderHelper).toMatch(
      /options\.updateEmojiComposition\(options\.item, options\.value\)/,
    );
    expect(emojiCompositionHelper).toMatch(
      /detailsVisible[\s\S]*section\.hidden =[\s\S]*!options\.developerMode[\s\S]*points\.length <= 1[\s\S]*!options\.detailsVisible/,
    );
    expect(compositionHelpers).toMatch(/0x200D[\s\S]*zeroWidthJoiner/i);
    expect(emojiCompositionSectionControlSource).toMatch(
      /\.emoji-composition-equation[\s\S]*flex-wrap: wrap/,
    );
    expect(emojiCompositionHelper).toMatch(
      /createCompositionTerm\((["'])\+\1,\s*part\)|createCompositionOperator\(operator\)/,
    );
    expect(demoScript).not.toMatch(/glyph: `TAG |glyph: 'END'|glyph: 'SPACE'/);
    expect(compositionHelpers).toMatch(
      /translate\((["'])tagAbbreviation\1,\s*(["'])TAG\2\)/,
    );
    expect(compositionHelpers).toMatch(
      /cancelTagAbbreviation[\s\S]*(["'])END\1/,
    );
    expect(emojiDialogEvents).toMatch(/dataset\.compositionEmoji/);
    expect(compositionHelpers).toMatch(
      /function findCompositionArtworkKey[\s\S]*emojiKeyByCodePoints\.get\(`\$\{normalized\} FE0F`\)[\s\S]*function findCompositionEmojiKey[\s\S]*findCompositionArtworkKey\(hex, emojiKeyByCodePoints\)[\s\S]*emojiKey !== excludedEmojiKey/,
    );
    expect(emojiCompositionSectionControlSource).toMatch(
      /button\.emoji-composition-part:hover/,
    );
    expect(demoHtml).toMatch(/class="dialog-navigate emoji-parent"/);
    expect(
      await fs.readFile(
        path.join(root, "src/app/emoji/emoji-dialog-click-runtime.ts"),
        "utf8",
      ),
    ).toMatch(/compositionParent: parentEmojiKey/);
    expect(emojiDialogEvents).toMatch(
      /target\.closest\((["'])\.emoji-parent\1\)[\s\S]*window\.history\.back/,
    );
    expect(dialogRuntimeHelper).toMatch(/delete nextState\.compositionParent/);
    expect(
      await fs.readFile(
        path.join(root, "src/app/dialog/dialog-runtime.ts"),
        "utf8",
      ),
    ).toMatch(/showModal\(\);[\s\S]*options\.focusInitialAction\(\)/);
    expect(dialogViewHelper).toMatch(
      /querySelector\((["'])\.emoji-preview\1\)[\s\S]*focus\(\{ preventScroll: true \}\)/,
    );
    expect(demoStyles).toMatch(
      /\.emoji-preview:focus-visible\s*\{\s*outline:\s*2px solid var\(--accent\);\s*outline-offset:\s*-3px;\s*\}/,
    );
    expect(emojiCompositionSectionControlSource).toMatch(
      /className:\s*"emoji-composition-mode"|text:\s*"Show full sequence"/,
    );
    expect(demoHtml).toMatch(
      /class="filter-field sequence-filter-field has-choice-buttons"/,
    );
    expect(categoryVersionHelper).toMatch(/updateModifierAvailability/);
    expect(
      await fs.readFile(
        path.join(root, "src/explorer/category/category-filter-layout.ts"),
        "utf8",
      ),
    ).toMatch(
      /if \(options\.groupField\)\s*options\.groupField\.hidden = options\.sequenceMode;[\s\S]*if \(options\.sequenceField\)\s*options\.sequenceField\.hidden = !options\.sequenceMode;/,
    );
    expect(emojiFilterHelper).toMatch(
      /options\.orderMode === (["'])sequence\1 && options\.selectedSequenceType[\s\S]*sequenceType === options\.selectedSequenceType/,
    );
    expect(urlStateHelper).toMatch(
      /params\.set\((["'])sequenceType\1,\s*options\.sequenceType\)/,
    );
    expect(demoStyles).toMatch(
      /\.sequence-type > \.name\s*\{[\s\S]*position:\s*sticky;[\s\S]*top:\s*var\(--toolbar-height\);/,
    );
    expect(compositionHelpers).toMatch(/function condenseCompositionPoints/);
    expect(emojiCompositionHelper).toMatch(
      /hasHiddenSequenceControl[\s\S]*isCondensedSequenceControl[\s\S]*condensedParts\.filter/,
    );
    expect(compositionHelpers).toMatch(
      /return point === 0x200d \|\| point === 0xfe0e \|\| point === 0xfe0f/i,
    );
    expect(emojiCompositionHelper).toMatch(
      /function createCompositionPart[\s\S]*findCompositionArtworkKey\([\s\S]*applyStandalonePixelArtwork\(glyph, artworkEmojiKey\)/,
    );
    expect(`${versionData}\n${explorerDataController}`).toMatch(
      /versionKeys: new Map\(\[\.\.\.releasedKeys, \.\.\.proposedKeys\]\)[\s\S]*setVersionCatalog\(versions\);[\s\S]*options\.rebuildCodePointLookup\(\);/,
    );
    expect(
      await fs.readFile(
        path.join(root, "src/app/bootstrap/explorer-bootstrap-shell.ts"),
        "utf8",
      ),
    ).toMatch(
      /applyStandalonePixelArtwork:\s*\(\)\s*=>\s*pixelArtwork\.applyPixelArtworkClass[\s\S]*applyStandalonePixelArtwork:\s*pixelArtwork\.applyPixelArtworkClass/,
    );
    expect(pixelArtwork).toMatch(
      /const updateModifierPixelArtwork[\s\S]*applyPixelArtworkClass/,
    );
    expect(compositionHelpers).toMatch(
      /for \(let end = points\.length; end >= start \+ 2; end--\)/,
    );
    expect(urlStateHelper).toMatch(
      /params\.get\((["'])composition\1\) === (["'])full\2/,
    );
    expect(urlStateHelper).toMatch(
      /params\.set\((["'])composition\1,\s*(["'])full\2\)/,
    );
    expect(emojiCompositionHelper).toMatch(
      /compositionReductionLabel\(partData\.components\.length, 1,/,
    );
    expect(
      await fs.readFile(
        path.join(root, "src/explorer/dialog/emoji-session.ts"),
        "utf8",
      ),
    ).toMatch(
      /startsWith\((["'])ar\1\)[\s\S]*\?\s*(["'])arab\2\s*:\s*undefined/,
    );
    expect(emojiFormatHelper).toMatch(
      /options\.dir === (["'])rtl\1[\s\S]*\? `\$\{toLabel\}\\u2190\$\{fromLabel\}`/,
    );
    expect(emojiCompositionSectionControlSource).toMatch(
      /\[dir="rtl"\] \.emoji-composition-equation \{[\s\S]*direction: rtl;[\s\S]*justify-content: flex-start;/,
    );
    expect(
      await fs.readFile(
        path.join(root, "src/site/styles/dialogs/emoji-composition.css"),
        "utf8",
      ),
    ).toMatch(
      /\.emoji-composition-code-point\s*\{[\s\S]*direction:\s*ltr;[\s\S]*unicode-bidi:\s*isolate;[\s\S]*\}/,
    );
    expect(
      await fs.readFile(
        path.join(root, "src/site/styles/dialogs/emoji-details.css"),
        "utf8",
      ),
    ).toMatch(
      /\.emoji-preview-glyph\.has-pixel-art\s*\{[\s\S]*font-size:\s*6rem;/,
    );
    expect(emojiCompositionSectionControlSource).toMatch(
      /\.emoji-composition-glyph\.has-pixel-art\s*\{[\s\S]*font-size:\s*1\.5rem;/,
    );
    expect(
      await fs.readFile(
        path.join(root, "src/site/styles/responsive/mobile-editor.css"),
        "utf8",
      ),
    ).toMatch(
      /@media \(max-width: 560px\)[\s\S]*\.emoji-preview-glyph\.has-pixel-art\s*\{[\s\S]*font-size:\s*3\.75rem;/,
    );
    expect(dialogUpgradeHelper).toMatch(
      /rendering-diagnostic-title[\s\S]*system-render-glyph[\s\S]*pixel-render-glyph/,
    );
    expect(dialogUpgradeHelper).toMatch(
      /pixel-design-invitation developer-only full-developer-only[\s\S]*createPixelDesign/,
    );
  });
});
