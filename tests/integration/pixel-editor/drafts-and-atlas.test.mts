import assert from 'node:assert/strict';

import { demoStyles, pixelEditorScript } from '../../shared/unit-fixtures.mjs';

for (const action of [
  'pixel-editor-save',
  'pixel-editor-download',
  'pixel-editor-download-emoji'
]) {
  assert.match(
    pixelEditorScript,
    new RegExp(`class="${action}"`),
    `pixel previews must provide ${action}`
  );
}
assert.match(
  pixelEditorScript,
  /function downloadEmojiPng[\s\S]*imageDataCanvas\(pixels, CELL_SIZE, CELL_SIZE\)[\s\S]*currentEntry\.key\}\.png/,
  'the current 12 by 12 artwork must be downloadable as its own PNG'
);
assert.match(
  pixelEditorScript,
  /class="pixel-editor-download-emoji-icon"[\s\S]*class="pixel-editor-download-preview"[\s\S]*const downloadPreview[\s\S]*downloadPreview\.getContext/,
  'the individual PNG action must preview the current pixel artwork instead of showing a 12 label'
);
assert.match(
  pixelEditorScript,
  /function drawArtworkPreview[\s\S]*currentArtworkPreviewCanvas\(\)[\s\S]*canvasIsBlackSilhouette[\s\S]*recolorVisibleCanvasPixels[\s\S]*downloadPreview/,
  'black-only artwork and the download action must preview silhouettes in white'
);
assert.match(
  pixelEditorScript,
  /function drawFontPreview[\s\S]*currentArtworkIsBlackSilhouette\(\)[\s\S]*#ffffff/,
  'the small font preview must render black-only artwork in white'
);
assert.match(
  pixelEditorScript,
  /function canvasIsBlackSilhouette[\s\S]*hasVisiblePixel[\s\S]*function recolorVisibleCanvasPixels[\s\S]*image\.data\[offset \+ 3\] === 0/,
  'silhouette preview recoloring must ignore transparent pixels and preserve alpha'
);
assert.match(
  pixelEditorScript,
  /const persistedArtwork = new Map\(\)[\s\S]*const dirtyKeys = new Set\(\)[\s\S]*function updateDirtyState[\s\S]*pixelsEqual\(pixels, baseline\)[\s\S]*dirtyIndicator\.hidden = !dirty/,
  'the editor must visibly track artwork that differs from its persisted atlas pixels'
);
assert.match(
  pixelEditorScript,
  /window\.addEventListener\("beforeunload", warnAboutDirtyArtwork\)[\s\S]*function warnAboutDirtyArtwork[\s\S]*dirtyKeys\.size === 0[\s\S]*event\.returnValue/,
  'leaving the page must warn when any emoji artwork remains dirty'
);
assert.match(
  pixelEditorScript,
  /function markAtlasClean[\s\S]*persistedArtwork\.set[\s\S]*dirtyKeys\.delete/,
  'saving or downloading an atlas must clear its saved emoji drafts'
);
assert.match(
  demoStyles,
  /\.pixel-editor-preview-actions[\s\S]*display:\s*flex;[\s\S]*\.pixel-editor-dirty[\s\S]*display:\s*inline-flex;/,
  'preview save actions and the dirty indicator must sit with the actual-size previews'
);
assert.match(
  pixelEditorScript,
  /function onCanvasKeyDown[\s\S]*ArrowLeft[\s\S]*ArrowUp[\s\S]*ArrowDown[\s\S]*ArrowRight[\s\S]*Enter[\s\S]*bakeFloatingLayer/,
  'floating layers must support keyboard movement and baking'
);
assert.match(
  pixelEditorScript,
  /selection: cloneSelection\(selection\)[\s\S]*floatingLayer: cloneFloatingLayer\(floatingLayer\)/,
  'selection and floating-layer drafts must survive emoji navigation'
);
assert.match(
  pixelEditorScript,
  /const artworkDrafts = new Map\(\)/,
  'pixel editor must retain an in-memory artwork draft for each emoji'
);
assert.match(
  pixelEditorScript,
  /rememberCurrentDraft\(\);[\s\S]*currentEmoji = emoji/,
  'pixel editor must retain the current draft before navigating to another emoji'
);
assert.match(
  pixelEditorScript,
  /const draft = artworkDrafts\.get\(entry\.key\)[\s\S]*pixels = draft\?\.pixels\.slice\(\) \?\? loadedPixels[\s\S]*traceOffsetX = draft\?\.traceOffsetX \?\? 0[\s\S]*traceOffsetY = draft\?\.traceOffsetY \?\? 0/,
  'pixel editor must restore artwork and trace position when returning to an emoji'
);
assert.match(
  pixelEditorScript,
  /for \(const draft of artworkDrafts\.values\(\)\)[\s\S]*draft\.entry\.atlas !== currentEntry\.atlas[\s\S]*draft\.entry\.x[\s\S]*draft\.entry\.y/,
  'saving must merge every retained draft belonging to the current atlas'
);
assert.match(
  pixelEditorScript,
  /function updateTransferButtons[\s\S]*copyArtButton\.disabled =[\s\S]*!hasVisibleArtwork\(\)/,
  'copy-art action must be disabled while every artwork pixel is transparent'
);
for (const preview of ['official', 'font', 'artwork']) {
  assert.match(
    pixelEditorScript,
    new RegExp(`preview\\(["']${preview}["']`),
    `pixel editor must provide the ${preview} 12-pixel preview`
  );
}
assert.match(
  demoStyles,
  /\.pixel-editor-previews figure[\s\S]*width:\s*12px;[\s\S]*height:\s*12px;[\s\S]*\.pixel-editor-previews canvas[\s\S]*width:\s*12px;[\s\S]*height:\s*12px;/,
  'actual-size previews must remain 12 by 12 instead of using uneven fractional scaling'
);
for (const tool of [
  'pencil',
  'line',
  'rectangle',
  'ellipse',
  'bucket',
  'eyedropper',
  'select'
]) {
  assert.match(
    pixelEditorScript,
    new RegExp(`toolButton\\(["']${tool}["']`),
    `pixel editor must provide the ${tool} tool`
  );
}
assert.match(
  pixelEditorScript,
  /toolButton\("bucket", "🫟"[\s\S]*toolButton\("eyedropper", "👀"/,
  'paint and color-picker tools must use recognizable emoji icons'
);
assert.match(
  pixelEditorScript,
  /toolButton\("pencil", "✏️"[\s\S]*toolButton\("rectangle", "🔲"[\s\S]*toolButton\("ellipse", "⭕"/,
  'pencil and outline shape tools must use their requested emoji icons'
);
assert.match(
  pixelEditorScript,
  /tool === "line"[\s\S]*pixels\.set\(shapeBase\);[\s\S]*drawLine\(pointerStart, point\)/,
  'the line tool must preview a straight line from its starting point'
);
assert.match(
  pixelEditorScript,
  /data-tool="\$\{tool\}" data-i18n-aria-label="\$\{translationKey\}" aria-label="\$\{fallback\}"/,
  'icon-only drawing tools must retain localized accessible names'
);
assert.match(
  demoStyles,
  /@media \(max-width: 399px\)[\s\S]*\.pixel-editor-tools[\s\S]*grid-template-columns:\s*repeat\(7,\s*2\.35rem\);[\s\S]*\.pixel-editor-tools button > span:last-child[\s\S]*display:\s*none;/,
  'skinny screens must show seven compact icon-only drawing tools in one row'
);
assert.match(
  pixelEditorScript,
  /showDirectoryPicker/,
  'pixel editor must support direct atlas-directory writes'
);
assert.match(
  pixelEditorScript,
  /getNestedFileHandle/,
  'pixel editor must save grouped atlases into nested directories'
);
assert.match(
  pixelEditorScript,
  /createBlankAtlas/,
  'pixel editor must construct missing atlas sheets in memory'
);
assert.match(
  pixelEditorScript,
  /content-type[\s\S]*image\/png/,
  'pixel editor must distinguish a PNG from a development-server fallback page'
);
assert.match(
  pixelEditorScript,
  /atlasExists \|\| hasVisibleAtlasDraft\(\)/,
  'a missing atlas must not be writable until visible artwork is added'
);
assert.match(
  pixelEditorScript,
  /downloadAtlas/,
  'pixel editor must provide an atlas download fallback'
);
assert.match(
  pixelEditorScript,
  /alpha === 0/,
  'pixel editor must preserve transparent pixels'
);
