import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import {
  demoHtml,
  demoStyles,
  dialogUpgradeHelper,
  dialogViewHelper,
  pixelEditorScript,
  root,
} from "../../shared/unit-fixtures.mjs";

const pixelEditorToolController = await fs.readFile(
  path.join(root, "src/pixel-editor/controllers/pixel-editor-tools.js"),
  "utf8",
);
const pixelEditorRuntimeController = await fs.readFile(
  path.join(root, "src/pixel-editor/controllers/pixel-editor-runtime.js"),
  "utf8",
);
const pixelEditorStartupController = await fs.readFile(
  path.join(root, "src/pixel-editor/controllers/pixel-editor-startup.js"),
  "utf8",
);
const pixelEditorSessionController = await fs.readFile(
  path.join(root, "src/pixel-editor/controllers/pixel-editor-session.js"),
  "utf8",
);
const pixelEditorTracingSource = `${pixelEditorScript}\n${pixelEditorToolController}\n${pixelEditorRuntimeController}\n${pixelEditorStartupController}\n${pixelEditorSessionController}`;

assert.doesNotMatch(
  pixelEditorScript,
  /class="pixel-editor-trace"/,
  "trace visibility must be controlled only by opacity",
);
assert.doesNotMatch(
  pixelEditorScript,
  /pixel-editor-fill-shapes/,
  "shape filling must not require a separate checkbox",
);
assert.match(
  pixelEditorTracingSource,
  /nextTool === getTool\(\)|nextTool === tool[\s\S]*nextTool === "rectangle" \|\| nextTool === "ellipse"[\s\S]*setFillShapesEnabled\(!fillShapesEnabled\(\)\)|fillShapesEnabled = !fillShapesEnabled/,
  "clicking the selected rectangle or ellipse tool again must toggle shape filling",
);
assert.match(
  pixelEditorTracingSource,
  /function updateShapeToolButtons[\s\S]*filled \? "⬛" : "🔲"[\s\S]*filled \? "🔴" : "⭕"/,
  "rectangle and ellipse icons must represent outline and filled modes",
);
assert.match(
  pixelEditorScript,
  /function drawCenteredEmoji[\s\S]*actualBoundingBoxAscent[\s\S]*actualBoundingBoxDescent[\s\S]*const baseline = \(CELL_SIZE - ascent - descent\) \/ 2 \+ ascent/,
  "native and custom-font previews must center their measured bounds without clipping",
);
assert.doesNotMatch(
  pixelEditorScript,
  /fillText\(currentEmoji, CELL_SIZE \/ 2, CELL_SIZE - 1\)/,
  "custom-font preview must not use a baseline that clips its descent rows",
);
for (const direction of ["Left", "Up", "Down", "Right"]) {
  assert.match(
    pixelEditorScript,
    new RegExp(`nudgeTrace${direction}`),
    `pixel editor must provide an accessible ${direction.toLowerCase()} trace nudge`,
  );
}
assert.ok(
  pixelEditorTracingSource.includes("adjustTraceOffsets(") &&
    pixelEditorTracingSource.includes("traceOffsetX += x;") &&
    pixelEditorTracingSource.includes("traceOffsetY += y;"),
  "trace nudge controls must move the reference by one grid pixel per click",
);
assert.match(
  pixelEditorTracingSource,
  /setTraceOffsets\(0, 0\)[\s\S]*pixelEditorLoading|traceOffsetX = 0;[\s\S]*traceOffsetY = 0;[\s\S]*pixelEditorLoading/,
  "trace position must reset when another emoji opens",
);
assert.match(
  pixelEditorTracingSource,
  /formatPercent\(Number\(traceAlpha\.value\) \/ 100\)/,
  "trace opacity must use the active locale's percentage formatter",
);
assert.match(
  pixelEditorTracingSource,
  /formatNumber\(entry\.row \+ 1\)|formatNumber\(currentEntry\.row \+ 1\)[\s\S]*formatNumber\(entry\.column \+ 1\)|formatNumber\(currentEntry\.column \+ 1\)/,
  "pixel atlas row and column numbers must use the active locale",
);
assert.match(
  await fs.readFile(path.join(root, "src/explorer/emoji-format.ts"), "utf8"),
  /export function formatUiPercent[\s\S]*numberingSystem\?: string[\s\S]*style:\s*(["'])percent\1/,
  "Arabic percentages must use Arabic digits and percent formatting",
);
assert.match(
  demoStyles,
  /\.pixel-editor-trace-nudge\[data-trace-direction="up"\][\s\S]*grid-column:\s*2;[\s\S]*grid-row:\s*1;[\s\S]*\.pixel-editor-trace-nudge\[data-trace-direction="down"\][\s\S]*grid-column:\s*2;[\s\S]*grid-row:\s*2;/,
  "trace arrows must form a directional pad with up above centered down",
);
assert.match(
  demoStyles,
  /\.pixel-editor-trace-position > div[\s\S]*direction:\s*ltr;/,
  "trace arrows must retain physical left and right positions in RTL locales",
);
assert.match(
  demoStyles,
  /\.pixel-editor-trace-opacity-heading[\s\S]*display:\s*flex;[\s\S]*justify-content:\s*space-between;/,
  "trace opacity value must share the label row and leave the slider its own row",
);
assert.match(
  demoStyles,
  /\.pixel-editor-tracing[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto;[\s\S]*@media \(max-width: 560px\)[\s\S]*\.pixel-editor-tracing[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\);/,
  "trace position must sit beside opacity on wide screens and stack on narrow screens",
);
assert.match(
  demoStyles,
  /\.pixel-editor-trace-position[\s\S]*display:\s*grid;[\s\S]*justify-items:\s*center;/,
  "trace directional pad must remain centered in its column",
);
assert.match(
  demoStyles,
  /@media \(max-width: 560px\)[\s\S]*\.pixel-editor-trace-nudge[\s\S]*width:\s*1\.8rem;[\s\S]*height:\s*1\.8rem;/,
  "narrow pixel editors must compact the trace controls",
);
assert.match(
  demoStyles,
  /@media \(max-width: 560px\)[\s\S]*\.pixel-editor-palette[\s\S]*justify-content:\s*center;/,
  "small screens must center the fixed-width EGA palette",
);
assert.match(
  demoStyles,
  /@media \(min-width: 700px\) and \(max-height: 399px\)[\s\S]*\.pixel-editor-layout[\s\S]*grid-template-columns:[\s\S]*minmax\(18rem,\s*1fr\)[\s\S]*minmax\(10rem,\s*1fr\)[\s\S]*\.pixel-editor-drawing[\s\S]*grid-column:\s*2;[\s\S]*\.pixel-editor-tracing[\s\S]*grid-column:\s*2;[\s\S]*\.pixel-editor-transfer[\s\S]*grid-column:\s*3;[\s\S]*\.pixel-editor-file[\s\S]*grid-column:\s*3;/,
  "wide screens under 400 pixels high must use canvas, drawing, and target columns",
);
assert.match(
  demoStyles,
  /\.pixel-editor-trace-opacity[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\);[\s\S]*@media \(min-width: 700px\) and \(max-height: 399px\)[\s\S]*\.example-dialog\.is-editor-view \.pixel-editor-trace-opacity[\s\S]*display:\s*flex;[\s\S]*flex-direction:\s*column;[\s\S]*gap:\s*0\.15rem;[\s\S]*\.example-dialog\.is-editor-view \.pixel-editor-trace-alpha[\s\S]*width:\s*100%;[\s\S]*min-height:\s*1\.25rem;[\s\S]*\.example-dialog\.is-editor-view \.pixel-editor-trace-position[\s\S]*grid-column:\s*2;[\s\S]*grid-row:\s*1;/,
  "wide, short screens must keep trace transparency stacked beneath its label beside the arrows",
);
assert.match(
  demoHtml,
  /class="dialog-mode-back"[^>]*data-i18n="pixelEditorBack"[^>]*>\s*Back\s*<\/button>/,
  "the compact shared Back action must live in the dialog controls",
);
assert.match(
  pixelEditorScript,
  /toolButton\("select", "⌗", "selectRegion", "Select"\)/,
  "pixel editor must use the compact Select label",
);
assert.match(
  dialogViewHelper,
  /const modeBack = dialog\.querySelector\([\s\S]*(["'])\.dialog-mode-back\1[\s\S]*\)[\s\S]*modeBack\.hidden = showDetails/,
  "the dialog Back action must appear outside the main details view",
);
assert.match(
  dialogViewHelper,
  /if \(!showDetails && parent\) parent\.hidden = true;[\s\S]*else if \(showDetails\) \{[\s\S]*options\.updateCompositionBackButton\(\)/,
  "nested dialog modes must hide the composition-parent control to preserve the compact control grid",
);
assert.match(
  demoStyles,
  /@media \(max-width: 560px\)[\s\S]*\.example-dialog \.dialog-mode-back:not\(\[hidden\]\) \{[\s\S]*grid-row:\s*1;[\s\S]*grid-column:\s*2;[\s\S]*\.example-dialog \.dialog-mode-back:not\(\[hidden\]\)::before \{[\s\S]*content:\s*"↩"/,
  "narrow emoji dialogs must place an icon-only Back action in the favorite control slot",
);
assert.match(
  demoStyles,
  /\.example-dialog\.is-code-view \.toggle-favorite,[\s\S]*\.example-dialog\.is-editor-view \.toggle-favorite \{\s*display:\s*none;/,
  "Favorites must only appear in the main emoji details view",
);
assert.doesNotMatch(
  demoHtml,
  /class="back-to-emoji"/,
  "the code panel must not duplicate the dialog-level Back action",
);
assert.match(
  demoHtml,
  /class="emoji-code-view"[\s\S]*class="code"[\s\S]*class="emoji-code-toolbar"[\s\S]*class="emoji-code-link"[\s\S]*>🔗<\/span>[\s\S]*class="emoji-code-copy"[\s\S]*data-i18n="copy">Copy/,
  "the code panel must put code first and finish with compact link and Copy actions",
);
assert.match(
  dialogUpgradeHelper,
  /if \(codeLink && codeCopy\) toolbar\.append\(codeLink, codeCopy\);\s*code\.after\(toolbar\)/,
  "cached code dialogs must move their actions beneath the code in link-and-copy order",
);
assert.match(
  demoStyles,
  /\.emoji-code-toolbar \{[\s\S]*direction:\s*ltr;[\s\S]*justify-content:\s*flex-end;[\s\S]*background:\s*var\(--code\);[\s\S]*\.emoji-code-view \{[\s\S]*background:\s*var\(--code\)/,
  "the bottom code actions must remain right-aligned on the code-colored background",
);
assert.doesNotMatch(
  pixelEditorScript,
  /data-i18n="tracePosition">Position/,
  "trace directional pad must not display a redundant Position label",
);
assert.match(
  pixelEditorScript,
  /role="group" data-i18n-aria-label="tracePosition" aria-label="Trace position"/,
  "trace directional pad must retain its localized accessible group name",
);
