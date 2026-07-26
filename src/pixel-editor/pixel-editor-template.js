import {
  CELL_SIZE,
  DISPLAY_SIZE,
  EGA_COLORS,
  SKIN_TONE_COLORS,
} from "./pixel-editor-constants.js";

export function renderPixelEditorTemplate() {
  return `
    <div class="pixel-editor-toolbar">
      <div class="pixel-editor-tools" role="toolbar" data-i18n-aria-label="drawingTools" aria-label="Drawing tools">
        ${toolButton("pencil", "✏️", "pencil", "Pencil", true)}
        ${toolButton("line", "╱", "line", "Line")}
        ${toolButton("rectangle", "🔲", "rectangle", "Rectangle")}
        ${toolButton("ellipse", "⭕", "ellipse", "Ellipse")}
        ${toolButton("bucket", "🫟", "paintBucket", "Paint bucket")}
        ${toolButton("eyedropper", "👀", "eyedropper", "Eyedropper")}
        ${toolButton("select", "⌗", "selectRegion", "Select")}
      </div>
      <div class="pixel-editor-history">
        <button class="pixel-editor-undo" type="button" disabled><span aria-hidden="true">↶</span> <span data-i18n="undo">Undo</span></button>
        <button class="pixel-editor-redo" type="button" disabled><span aria-hidden="true">↷</span> <span data-i18n="redo">Redo</span></button>
      </div>
    </div>
    <div class="pixel-editor-layout">
      <div class="pixel-editor-workspace">
        <div class="pixel-editor-stage">
          <canvas class="pixel-editor-canvas" width="${DISPLAY_SIZE}" height="${DISPLAY_SIZE}" tabindex="-1" data-i18n-aria-label="pixelCanvas" aria-label="12 by 12 pixel drawing canvas"></canvas>
        </div>
        <div class="pixel-editor-previews" data-i18n-aria-label="pixelPreviews" aria-label="Emoji at actual 12 by 12 pixel size">
          ${preview("official", "officialEmoji", "Official")}
          ${preview("font", "customFontEmoji", "Custom font")}
          ${preview("artwork", "currentArtwork", "Current grid")}
          <span class="pixel-editor-dirty" hidden>
            <span aria-hidden="true"></span>
            <span data-i18n="unsavedArtwork">Unsaved</span>
          </span>
          <div class="pixel-editor-preview-actions">
            <button class="pixel-editor-save" type="button" data-i18n-aria-label="saveAtlas" aria-label="Save atlas" title="Save atlas"><span aria-hidden="true">💾</span></button>
            <button class="pixel-editor-download" type="button" data-i18n-aria-label="downloadAtlas" aria-label="Download atlas" title="Download atlas"><span aria-hidden="true">⇩▦</span></button>
            <button class="pixel-editor-download-emoji" type="button" data-i18n-aria-label="downloadEmojiPng" aria-label="Download 12 by 12 emoji PNG" title="Download 12 by 12 emoji PNG">
              <span class="pixel-editor-download-emoji-icon" aria-hidden="true">⇩<canvas class="pixel-editor-download-preview" width="${CELL_SIZE}" height="${CELL_SIZE}"></canvas></span>
            </button>
          </div>
        </div>
      </div>
      <div class="pixel-editor-controls">
        <fieldset class="pixel-editor-drawing">
          <legend data-i18n="drawingColor">Drawing color</legend>
          <div class="pixel-editor-palette" role="group" data-i18n-aria-label="egaPalette" aria-label="Classic EGA color palette">
            ${EGA_COLORS.map((color, index) => egaSwatch(color, index)).join("")}
            <button class="pixel-editor-swatch is-transparent" type="button" data-transparent="true" data-grid-column="9" data-grid-row="1" data-i18n-aria-label="transparentEraser" aria-label="Transparent eraser" title="Transparent"><span aria-hidden="true">╱</span></button>
            ${SKIN_TONE_COLORS.map(skinToneSwatch).join("")}
          </div>
        </fieldset>
        <fieldset class="pixel-editor-tracing">
          <legend data-i18n="tracing">Tracing</legend>
          <label class="pixel-editor-trace-opacity">
            <span class="pixel-editor-trace-opacity-heading">
              <span data-i18n="traceOpacity">Trace opacity</span>
              <output class="pixel-editor-trace-value" dir="auto">35%</output>
            </span>
            <input class="pixel-editor-trace-alpha" type="range" min="0" max="100" value="35">
          </label>
          <div class="pixel-editor-trace-position">
            <div role="group" data-i18n-aria-label="tracePosition" aria-label="Trace position">
              ${traceNudgeButton("left", -1, 0, "←", "nudgeTraceLeft", "Move trace left one pixel")}
              ${traceNudgeButton("up", 0, -1, "↑", "nudgeTraceUp", "Move trace up one pixel")}
              ${traceNudgeButton("down", 0, 1, "↓", "nudgeTraceDown", "Move trace down one pixel")}
              ${traceNudgeButton("right", 1, 0, "→", "nudgeTraceRight", "Move trace right one pixel")}
            </div>
          </div>
        </fieldset>
        <fieldset class="pixel-editor-transfer">
          <legend data-i18n="artworkTransfer">Artwork transfer</legend>
          <div>
            <button class="pixel-editor-copy-art" type="button">
              <span aria-hidden="true">▦</span>
              <span data-i18n="copyPixelArt">Copy art</span>
            </button>
            <button class="pixel-editor-copy-font" type="button">
              <span class="pixel-editor-transfer-icon" aria-hidden="true">🔠</span>
              <span data-i18n="copyFontGlyph">Copy font</span>
            </button>
            <button class="pixel-editor-copy-selection" type="button" disabled>
              <span aria-hidden="true">▤</span>
              <span data-i18n="copySelection">Copy selection</span>
            </button>
            <button class="pixel-editor-paste-art" type="button" disabled>
              <span aria-hidden="true">▣</span>
              <span data-i18n="pasteAsLayer">Paste layer</span>
            </button>
          </div>
        </fieldset>
        <fieldset class="pixel-editor-layer" hidden>
          <legend data-i18n="floatingLayer">Floating layer</legend>
          <div class="pixel-editor-layer-controls">
            <div class="pixel-editor-layer-position" role="group" data-i18n-aria-label="moveLayer" aria-label="Move floating layer">
              ${layerNudgeButton("left", -1, 0, "←", "moveLayerLeft", "Move layer left one pixel")}
              ${layerNudgeButton("up", 0, -1, "↑", "moveLayerUp", "Move layer up one pixel")}
              ${layerNudgeButton("down", 0, 1, "↓", "moveLayerDown", "Move layer down one pixel")}
              ${layerNudgeButton("right", 1, 0, "→", "moveLayerRight", "Move layer right one pixel")}
            </div>
            <div class="pixel-editor-layer-transform" role="toolbar" data-i18n-aria-label="transformLayer" aria-label="Transform floating layer">
              <button type="button" data-layer-transform="rotate-left" data-i18n-aria-label="rotateLayerLeft" aria-label="Rotate layer 45 degrees left"><span aria-hidden="true">↶</span></button>
              <button type="button" data-layer-transform="rotate-right" data-i18n-aria-label="rotateLayerRight" aria-label="Rotate layer 45 degrees right"><span aria-hidden="true">↷</span></button>
              <button type="button" data-layer-transform="flip-horizontal" data-i18n-aria-label="flipLayerHorizontal" aria-label="Flip layer horizontally"><span aria-hidden="true">↔</span></button>
              <button type="button" data-layer-transform="flip-vertical" data-i18n-aria-label="flipLayerVertical" aria-label="Flip layer vertically"><span aria-hidden="true">↕</span></button>
              <button class="pixel-editor-invert-layer" type="button" aria-pressed="false">
                <span aria-hidden="true">◐</span>
                <span data-i18n="invertLayer">Invert</span>
              </button>
            </div>
            <div class="pixel-editor-layer-actions">
              <button class="pixel-editor-bake-layer" type="button" data-i18n="bakeLayer">Merge</button>
              <button class="pixel-editor-cancel-layer" type="button" data-i18n="cancelLayer">Cancel</button>
            </div>
          </div>
        </fieldset>
        <fieldset class="pixel-editor-layer-help" hidden>
          <legend>Keyboard help</legend>
          <div aria-live="polite">
            <span><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> <span>Move</span></span>
            <span><kbd>Shift</kbd> + <kbd>←</kbd><kbd>→</kbd> <span>Flip ↔</span></span>
            <span><kbd>Shift</kbd> + <kbd>↑</kbd><kbd>↓</kbd> <span>Flip ↕</span></span>
            <span><kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>←</kbd><kbd>→</kbd> <span>Rotate</span></span>
            <span><kbd>Enter</kbd> <span>Merge</span></span>
            <span><kbd>Esc</kbd> <span>Cancel</span></span>
          </div>
        </fieldset>
        <div class="pixel-editor-file">
          <p class="pixel-editor-location"></p>
          <p class="pixel-editor-status" role="status" aria-live="polite"></p>
        </div>
      </div>
    </div>`;
}

function toolButton(tool, icon, translationKey, fallback, selected = false) {
  return `<button type="button" data-tool="${tool}" data-i18n-aria-label="${translationKey}" aria-label="${fallback}" aria-pressed="${selected}" class="${selected ? "is-active" : ""}"><span aria-hidden="true">${icon}</span><span data-i18n="${translationKey}">${fallback}</span></button>`;
}

function traceNudgeButton(
  direction,
  horizontal,
  vertical,
  icon,
  translationKey,
  fallback,
) {
  return `<button class="pixel-editor-trace-nudge" type="button" data-trace-direction="${direction}" data-trace-x="${horizontal}" data-trace-y="${vertical}" data-i18n-aria-label="${translationKey}" aria-label="${fallback}" title="${fallback}"><span aria-hidden="true">${icon}</span></button>`;
}

function layerNudgeButton(
  direction,
  horizontal,
  vertical,
  icon,
  translationKey,
  fallback,
) {
  return `<button class="pixel-editor-layer-nudge" type="button" data-layer-direction="${direction}" data-layer-x="${horizontal}" data-layer-y="${vertical}" data-i18n-aria-label="${translationKey}" aria-label="${fallback}" title="${fallback}"><span aria-hidden="true">${icon}</span></button>`;
}

function preview(kind, translationKey, fallback) {
  return `<figure data-i18n-aria-label="${translationKey}" aria-label="${fallback}">
    <canvas class="pixel-editor-preview-${kind}" width="${CELL_SIZE}" height="${CELL_SIZE}"></canvas>
  </figure>`;
}

function egaSwatch(color, index) {
  const column = (index % 8) + 1;
  const row = Math.floor(index / 8) + 1;
  return `<button class="pixel-editor-swatch" type="button" data-color="${color}" data-grid-column="${column}" data-grid-row="${row}" aria-label="EGA ${color}" title="EGA ${color}" aria-pressed="false" style="--swatch: ${color}"></button>`;
}

function skinToneSwatch(tone) {
  return `<button class="pixel-editor-swatch is-skin-tone" type="button" data-color="${tone.color}" data-skin-tone="${tone.codePoint}" data-grid-column="1" data-grid-row="3" data-cycle-index="0" data-shade="normal" aria-label="${tone.fallback} — Normal color" title="${tone.fallback} — Normal color" aria-pressed="false" style="--swatch: ${tone.color}" hidden></button>`;
}
