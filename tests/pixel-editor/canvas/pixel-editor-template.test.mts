import assert from "node:assert/strict";
import { renderPixelEditorTemplate } from "../../../src/pixel-editor/canvas/pixel-editor-template.js";

const sourceModuleSpecifier =
  "../../../src/pixel-editor/canvas/pixel-editor-template.js";

const markup = renderPixelEditorTemplate();

assert.equal(
  sourceModuleSpecifier,
  "../../../src/pixel-editor/canvas/pixel-editor-template.js",
);
assert.equal(markup.includes('class="pixel-editor-toolbar"'), true);
assert.equal(markup.includes('data-tool="pencil"'), true);
assert.equal(markup.includes('data-tool="line"'), true);
assert.equal(markup.includes('data-tool="rectangle"'), true);
assert.equal(markup.includes('data-tool="ellipse"'), true);
assert.equal(markup.includes('data-tool="bucket"'), true);
assert.equal(markup.includes('data-tool="eyedropper"'), true);
assert.equal(markup.includes('data-tool="select"'), true);
assert.equal(markup.includes('class="pixel-editor-canvas"'), true);
assert.equal(markup.includes('class="pixel-editor-preview-official"'), true);
assert.equal(markup.includes('class="pixel-editor-preview-font"'), true);
assert.equal(markup.includes('class="pixel-editor-preview-artwork"'), true);
assert.equal(markup.includes('class="pixel-editor-save"'), true);
assert.equal(markup.includes('class="pixel-editor-download"'), true);
assert.equal(markup.includes('class="pixel-editor-download-emoji"'), true);
assert.equal(markup.includes('class="pixel-editor-copy-art"'), true);
assert.equal(markup.includes('class="pixel-editor-copy-font"'), true);
assert.equal(markup.includes('class="pixel-editor-copy-selection"'), true);
assert.equal(markup.includes('class="pixel-editor-paste-art"'), true);
assert.equal(markup.includes('class="pixel-editor-layer" hidden'), true);
assert.equal(markup.includes('class="pixel-editor-layer-help" hidden'), true);
assert.equal(markup.includes('data-layer-transform="rotate-left"'), true);
assert.equal(markup.includes('data-layer-transform="rotate-right"'), true);
assert.equal(markup.includes('data-layer-transform="flip-horizontal"'), true);
assert.equal(markup.includes("flipLayerVertical"), true);
assert.equal(
  markup.includes('class="pixel-editor-trace-alpha" type="range"'),
  true,
);
assert.equal(markup.includes('data-transparent="true"'), true);
assert.equal(markup.includes("data-skin-tone="), true);
assert.equal(markup.includes('width="384"'), true);
assert.equal(markup.includes('height="384"'), true);
assert.equal(markup.includes('width="12"'), true);
assert.equal(markup.includes('height="12"'), true);
