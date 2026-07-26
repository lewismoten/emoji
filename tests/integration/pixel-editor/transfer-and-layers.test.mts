import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  demoStyles,
  pixelAtlasGeneratorScript,
  pixelEditorScript,
  root
} from '../../shared/unit-fixtures.mjs';

for (const action of ['copyPixelArt', 'copyFontGlyph', 'pastePixelArt']) {
  assert.match(
    pixelEditorScript,
    new RegExp(`function ${action}`),
    `pixel editor must provide ${action}`
  );
}
assert.match(
  pixelEditorScript,
  /function copyFontGlyph[\s\S]*pixel-font\/atlases\/\$\{currentEntry\.atlas\}[\s\S]*extractCell\(await response\.blob\(\), currentEntry\)/,
  'copying a custom-font glyph must crop its exact source atlas cell'
);
assert.match(
  pixelEditorScript,
  /class="pixel-editor-transfer-icon" aria-hidden="true">🔠<\/span>/,
  'copy-font action must use the input Latin uppercase emoji'
);
assert.match(
  pixelEditorScript,
  /async function pastePixelArt[\s\S]*clipboard = cloneFloatingLayer\(artworkClipboard\)[\s\S]*findSkinTonePasteHelper[\s\S]*floatingLayer = clipboard[\s\S]*remapSkinTonePixels[\s\S]*skinToneSequence\(targetEntry\.codePoints\)/,
  'pasted artwork must remain independent and adapt to the destination skin tones'
);
assert.match(
  pixelEditorScript,
  /function copyPixelArt[\s\S]*skinTones: skinToneSequence\(currentEntry\.codePoints\)[\s\S]*function copySelection[\s\S]*skinTones: skinToneSequence\(currentEntry\.codePoints\)[\s\S]*function copyFontGlyph[\s\S]*skinTones: skinToneSequence\(currentEntry\.codePoints\)/,
  'every artwork-copy path must retain ordered source skin tones'
);
assert.match(
  pixelEditorScript,
  /let artworkClipboard;/,
  'the artwork clipboard must persist while browsing between emoji'
);
assert.match(
  pixelEditorScript,
  /toolButton\(["']select["'][\s\S]*function copySelection[\s\S]*extractPixels/,
  'pixel editor must select and copy a rectangular subsection'
);
assert.match(
  pixelEditorScript,
  /function selectTool[\s\S]*nextTool !== "select"\) selection = undefined/,
  'leaving the selection tool must clear its selection'
);
assert.match(
  pixelEditorScript,
  /function drawSelectionOutline[\s\S]*setLineDash[\s\S]*lineDashOffset[\s\S]*function animateSelectionOutline[\s\S]*draw\(false\)/,
  'the selection frame must use animated marching ants'
);
assert.match(
  pixelEditorScript,
  /function updateEditorModePanels[\s\S]*copyArtButton\.hidden = selectionMode[\s\S]*copyFontButton\.hidden = selectionMode[\s\S]*copySelectionButton\.hidden = !selectionMode/,
  'selection mode must show selection-specific transfer actions'
);
assert.match(
  demoStyles,
  /\.pixel-editor-transfer button\[hidden\][\s\S]*display:\s*none;/,
  'explicit transfer-button layout must not override hidden selection actions'
);
assert.match(
  pixelEditorScript,
  /tool === "select" && artworkClipboard\.kind !== "selection"/,
  'selection mode must paste only a copied selection'
);
assert.match(
  pixelEditorScript,
  /document\.addEventListener\("keydown", onEditorKeyDown, true\)[\s\S]*function onEditorKeyDown[\s\S]*view\.hidden \|\| !dialog\.open[\s\S]*event\.ctrlKey \|\| event\.metaKey[\s\S]*copySelection\(\)[\s\S]*pastePixelArt\(\)/,
  'selection copy and layer paste must support Ctrl/Cmd keyboard shortcuts throughout the editor'
);
assert.match(
  pixelEditorScript,
  /function onPointerDown[\s\S]*canvas\.focus\(\{ preventScroll: true \}\)/,
  'drawing must move keyboard focus to the canvas for immediate shortcuts'
);
assert.match(
  pixelEditorScript,
  /function onEditorKeyDown[\s\S]*key === "z"[\s\S]*event\.shiftKey[\s\S]*redo\(\)[\s\S]*!event\.shiftKey[\s\S]*undo\(\)[\s\S]*key === "y"[\s\S]*redo\(\)/,
  'editor history must support Ctrl/Cmd+Z and both common redo shortcuts'
);
assert.match(
  pixelEditorScript,
  /function updateEditorModePanels[\s\S]*layerPanel\.hidden = !layerMode[\s\S]*filePanel\.hidden = layerMode \|\| selectionMode/,
  'floating-layer mode must hide competing editor panels'
);
assert.match(
  pixelEditorScript,
  /function bakeFloatingLayer[\s\S]*pushHistory\(\);[\s\S]*compositeLayer\(pixels, \{[\s\S]*effectiveLayerPixels\(\s*floatingLayer,\s*activePaletteColors\(\)/,
  'baking a floating layer must be undoable'
);
for (const transform of [
  'rotate-left',
  'rotate-right',
  'flip-horizontal',
  'flip-vertical'
]) {
  assert.match(
    pixelEditorScript,
    new RegExp(`data-layer-transform="${transform}"`),
    `floating layers must support ${transform}`
  );
}
assert.match(
  pixelEditorScript,
  /class="pixel-editor-invert-layer"[\s\S]*function toggleFloatingLayerInversion[\s\S]*function effectiveLayerPixels[\s\S]*nearestPaletteColor/,
  'floating layers must support non-destructive inversion into the nearest active colors'
);
assert.match(
  pixelEditorScript,
  /function updateLayerControlStates[\s\S]*layerNudgeButtons\.forEach[\s\S]*layerPositionAllowed\(floatingLayer, nextX, nextY\)/,
  'layer nudge controls must disable at canvas boundaries'
);
assert.match(
  pixelEditorScript,
  /function setFloatingLayerPosition[\s\S]*layerAxisBounds\(floatingLayer\.width\)[\s\S]*layerAxisBounds\(floatingLayer\.height\)[\s\S]*clamp\(x, minimumX, maximumX\)[\s\S]*clamp\(y, minimumY, maximumY\)/,
  'dragged layers must stay within the valid positioning range'
);
assert.match(
  pixelEditorScript,
  /layerTransformButtons\.forEach[\s\S]*layerTransformChangesPixels[\s\S]*pixelsEqual/,
  'rotation and flip controls must disable when they would not alter the layer'
);
assert.match(
  pixelEditorScript,
  /function rotatePixels\(layer, degrees, paletteColors = EGA_COLORS\)[\s\S]*document\.createElement\("canvas"\)[\s\S]*imageSmoothingEnabled = true[\s\S]*imageSmoothingQuality = "high"[\s\S]*translate\(width \/ 2, height \/ 2\)[\s\S]*rotate\(radians\)[\s\S]*drawImage/,
  'floating selections must use an interpolated canvas rotation around their centers'
);
assert.match(
  pixelEditorScript,
  /function quantizeToPalette\(source, paletteColors = EGA_COLORS\)[\s\S]*ROTATION_ALPHA_THRESHOLD[\s\S]*nearestPaletteColor[\s\S]*result\[offset \+ 3\] = 255/,
  'canvas-rotated pixels must be reduced to transparency or the nearest active opaque color'
);
assert.match(
  pixelEditorScript,
  /function layerAxisBounds\(size\)[\s\S]*size <= CELL_SIZE \? \[0, CELL_SIZE - size\] : \[CELL_SIZE - size, 0\]/,
  'oversized rotated selections must support safe negative positioning across the canvas'
);
assert.doesNotMatch(
  pixelEditorScript,
  /rotated\.width > CELL_SIZE|rotated\.height > CELL_SIZE/,
  '45-degree rotation must not be blocked when its bounding box exceeds the canvas'
);
assert.match(
  pixelEditorScript,
  /function nextLayerRotation[\s\S]*rotationSource[\s\S]*rotationDegrees[\s\S]*\(clockwise \? 45 : -45\)[\s\S]*rotatePixels\(rotationSource, rotationDegrees, paletteColors\)/,
  'successive 45-degree turns must render from the original layer instead of degrading the previous raster rotation'
);
for (const locale of ['en', 'ar', 'es', 'hi', 'zh']) {
  assert.match(
    await fs.readFile(
      path.join(root, 'demo-locales', `${locale}.json`),
      'utf8'
    ),
    /"rotateLayerLeft": ".*45.*"[\s\S]*"rotateLayerRight": ".*45.*"/,
    `${locale} must explain that layer rotation uses 45-degree increments`
  );
}
assert.doesNotMatch(
  pixelAtlasGeneratorScript,
  /renderBlankSheet|writeFile\(imagePath/,
  'atlas generation must not create empty PNG templates'
);
