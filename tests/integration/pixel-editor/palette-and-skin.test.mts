import assert from 'node:assert/strict';

import {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  demoStyles,
  pixelEditorScript,
  remapSkinTonePixels,
  skinToneBaseSequence,
  skinToneSequence
} from '../../shared/unit-fixtures.mjs';

assert.match(
  demoStyles,
  /\.pixel-editor-canvas/,
  'demo must style the pixel-art canvas'
);
assert.match(
  pixelEditorScript,
  /pixel-editor-workspace[\s\S]*?pixel-editor-stage[\s\S]*?pixel-editor-previews[\s\S]*?pixel-editor-controls/,
  'pixel editor must keep its actual-size previews beneath the drawing grid'
);
assert.match(
  demoStyles,
  /@media \(min-width: 561px\) and \(max-height: 560px\)[\s\S]*?calc\(100dvh - 10rem\)/,
  'pixel editor must fit its canvas within short landscape viewports'
);
assert.match(
  pixelEditorScript,
  /const CELL_SIZE = 12/,
  'pixel editor must use a 12 by 12 cell'
);
assert.match(
  pixelEditorScript,
  /const EGA_COLORS = \[/,
  'pixel editor must provide the classic EGA palette'
);
assert.doesNotMatch(
  pixelEditorScript,
  /type="color"|class="pixel-editor-alpha"/,
  'pixel editor must not expose custom colors or artwork opacity'
);
assert.match(
  pixelEditorScript,
  /const SKIN_TONE_COLORS = \[[\s\S]*1F3FB[\s\S]*1F3FF/,
  'the pixel editor must define the five Unicode skin-tone colors'
);
assert.match(
  pixelEditorScript,
  /function activePaletteColors\(\)[\s\S]*EGA_COLORS[\s\S]*button\.dataset\.skinTone/,
  'the active drawing palette must combine EGA with contextual skin tones'
);
assert.match(
  pixelEditorScript,
  /function skinToneCycle\(codePoint\)[\s\S]*SKIN_TONE_COLORS\[index - 1\][\s\S]*SKIN_TONE_COLORS\[index \+ 1\]/,
  'skin-tone swatches must use their immediate neighboring tones for shading'
);
assert.match(
  pixelEditorScript,
  /function selectPaletteColor\(button\)[\s\S]*getSelectedSkinTone\(\) === button\.dataset\.skinTone[\s\S]*\(currentIndex \+ 1\) % cycle\.length/,
  'clicking a selected skin-tone swatch must cycle its available shades'
);
assert.match(
  pixelEditorScript,
  /function updateSkinTonePalette\(codePoints = \[\]\)[\s\S]*previousSkinTone[\s\S]*activeButtons\.find[\s\S]*nextCycleIndex[\s\S]*setSelectedColor\(\s*skinToneCycle/,
  'skin-tone color and shading choices must survive compatible emoji navigation'
);
assert.match(
  pixelEditorScript,
  /setSelectedColor\("transparent"\)/,
  'leaving a skin-tone emoji must select the eraser instead of EGA yellow'
);
assert.deepEqual(
  skinToneSequence(['1F469', '1F3FB', '200D', '1F468', '1F3FF']),
  ['1F3FB', '1F3FF'],
  'skin-tone extraction must preserve modifier order and repeated people'
);
assert.equal(
  skinToneBaseSequence(['1F469', '1F3FB', '200D', '1F468', '1F3FF']),
  '1F469 200D 1F468',
  'skin-tone variants must share a modifier-free helper signature'
);
const rgbaPixels = (...colors: string[]) =>
  new Uint8ClampedArray(
    colors.flatMap(color => [
      Number.parseInt(color.slice(1, 3), 16),
      Number.parseInt(color.slice(3, 5), 16),
      Number.parseInt(color.slice(5, 7), 16),
      255
    ])
  );
const pixelColors = (pixels: Uint8ClampedArray) =>
  Array.from({ length: pixels.length / 4 }, (_value, index) => {
    const offset = index * 4;
    return `#${[pixels[offset], pixels[offset + 1], pixels[offset + 2]]
      .map(channel => channel.toString(16).padStart(2, '0'))
      .join('')}`;
  });
assert.deepEqual(
  pixelColors(
    remapSkinTonePixels(
      rgbaPixels('#f2d2b6', '#d5a078', '#000000'),
      ['1F3FB'],
      ['1F3FF']
    )
  ),
  ['#3b271d', '#000000', '#000000'],
  'pasting to the darkest tone must extend its shadow to EGA black'
);
assert.deepEqual(
  pixelColors(
    remapSkinTonePixels(rgbaPixels('#3b271d', '#70452f'), ['1F3FF'], ['1F3FB'])
  ),
  ['#f2d2b6', '#ffffff'],
  'pasting to the lightest tone must extend its highlight to EGA white'
);
assert.deepEqual(
  pixelColors(
    remapSkinTonePixels(
      rgbaPixels('#f2d2b6', '#d5a078', '#3b271d'),
      ['1F3FB', '1F3FF'],
      ['1F3FC', '1F3FE']
    )
  ),
  ['#d5a078', '#a66a45', '#70452f'],
  'multi-tone paste must map modifiers in Unicode sequence order'
);
assert.deepEqual(
  pixelColors(
    remapSkinTonePixels(
      rgbaPixels('#f2d2b6', '#d5a078'),
      ['1F3FB', '1F3FC'],
      ['1F3FE', '1F3FF']
    )
  ),
  ['#70452f', '#3b271d'],
  'explicit normal tones must win over ambiguous neighboring shades'
);
const helperOwnership = buildSkinToneOwnership(
  rgbaPixels('#d5a078', '#000000', '#000000', '#70452f'),
  ['1F3FC', '1F3FE'],
  4,
  1
);
assert.ok(
  helperOwnership,
  "a uniquely toned helper must identify every person's region"
);
assert.deepEqual(
  pixelColors(
    remapSkinTonePixels(
      rgbaPixels('#d5a078', '#d5a078', '#d5a078', '#d5a078'),
      ['1F3FB', '1F3FC'],
      ['1F3FB', '1F3FF'],
      {
        ownership: helperOwnership,
        ownershipWidth: 4,
        width: 4,
        offsetX: 0,
        offsetY: 0
      }
    )
  ),
  ['#d5a078', '#d5a078', '#3b271d', '#3b271d'],
  'helper regions must disambiguate the same source color for different people'
);
assert.deepEqual(
  [...buildTwoPersonOwnership(4, 2)],
  [0, 0, 1, 1, 0, 0, 1, 1],
  'two-person fallback must assign the left half first and right half second'
);
assert.match(
  pixelEditorScript,
  /if \(sourceTones\.length === 2\)[\s\S]*buildTwoPersonOwnership/,
  'two-tone paste must fall back to left-to-right person ownership'
);
assert.match(
  pixelEditorScript,
  /function nearestPaletteColor[\s\S]*colors\.reduce/,
  'the eyedropper must reduce sampled colors to the active palette'
);
assert.match(
  pixelEditorScript,
  /data-transparent="true"/,
  'pixel editor must provide a transparent eraser'
);
assert.match(
  demoStyles,
  /\.pixel-editor-palette[\s\S]*grid-template-columns:\s*repeat\(9,\s*1\.65rem\);[\s\S]*\.pixel-editor-swatch\.is-transparent[\s\S]*grid-column:\s*9;[\s\S]*grid-row:\s*1 \/ span 2;[\s\S]*\.pixel-editor-palette\.has-one-skin-tone[\s\S]*grid-row:\s*1;[\s\S]*\.pixel-editor-swatch\.is-skin-tone[\s\S]*grid-column:\s*9;[\s\S]*grid-row:\s*2;/,
  'one contextual skin tone must appear below a normal-size transparent swatch'
);
assert.match(
  demoStyles,
  /\.pixel-editor-swatch\.is-skin-tone\[data-shade="normal"\]::after[\s\S]*content:\s*"✓"/,
  'skin-tone swatches must visibly mark their normal color'
);
