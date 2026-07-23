import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type Emoji = {
  key: string;
  emoji: string;
  codePoints: string;
  group: string;
  order: number;
  sequenceType: string;
};

type Version = {
  version: string;
  file: string;
  count: number;
};

type ProposedVersion = Version & {
  status: "draft";
  released: null;
};

type LocaleManifest = {
  locales: {
    locale: string;
    label: string;
    nativeLabel: string;
    rtl: boolean;
    baseLocale?: string;
    file: string;
    count: number;
    totalCount: number;
    characterLabelCount: number;
    totalCharacterLabelCount: number;
    subgroupLabelCount: number;
    totalSubgroupLabelCount: number;
    cldrVersion: string;
  }[];
};

type LocalePack = {
  locale: string;
  baseLocale?: string;
  label: string;
  nativeLabel: string;
  rtl: boolean;
  cldrVersion: string;
  annotations: Record<string, string[]>;
  labels: Record<string, string>;
  subgroups: Record<string, string>;
};

type WebAppManifest = {
  id: string;
  start_url: string;
  scope: string;
  display: string;
  icons: { src: string; sizes: string; type: string; purpose: string }[];
};

type PixelAtlasManifest = {
  layout: string;
  author: string;
  url: string;
  cellSize: number;
  cellPadding: number;
  slotSize: number;
  columns: number;
  maxRows: number;
  groupCount: number;
  subGroupCount: number;
  sheets: {
    image: string;
    mapping: string;
    group: string;
    subGroup: string;
    rows: number;
    imageWidth: number;
    imageHeight: number;
    capacity: number;
    assignedCount: number;
  }[];
};

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const readJson = async <T,>(file: string) =>
  JSON.parse(await fs.readFile(path.join(root, file), "utf8")) as T;
const importFileDefault = async (file: string) =>
  (await import(pathToFileURL(path.join(root, file)).href)).default as Record<
    string,
    string
  >;
const importPackageDefault = async (specifier: string) =>
  (await import(specifier)).default as Record<string, string>;
const require = createRequire(import.meta.url);

const emoji = await readJson<Emoji[]>("emoji.json");
const orderManifest = await readJson<{ unicode: string[] }>(
  "orders/manifest.json",
);
const localeManifest = await readJson<LocaleManifest>("locales/manifest.json");
const packageManifest = await readJson<{
  name: string;
  packs: { id: string; count: number; importPath: string }[];
  categories: {
    id: string;
    label: string;
    count: number;
    importPath: string;
    subcategories: {
      id: string;
      label: string;
      unicodeSubgroup: string;
      count: number;
      importPath: string;
    }[];
  }[];
  variations: { id: string; count: number; importPath: string }[];
}>("manifest.json");
const manifest = await readJson<{
  versions: Version[];
  proposed?: ProposedVersion[];
}>("versions/manifest.json");
const webAppManifest = await readJson<WebAppManifest>("manifest.webmanifest");
const pixelAtlasManifest = await readJson<PixelAtlasManifest>(
  "pixel-font/atlases/manifest.json",
);
const packageJson = await readJson<{ version: string }>("package.json");
const serviceWorker = await fs.readFile(
  path.join(root, "build/demo-pages/service-worker.js"),
  "utf8",
);
const arabicDemo = await fs.readFile(
  path.join(root, "build/demo-pages/index.ar.html"),
  "utf8",
);
const demoHtml = await fs.readFile(path.join(root, "index.html"), "utf8");
const demoScript = await fs.readFile(path.join(root, "index.js"), "utf8");
const pixelEditorScript = await fs.readFile(
  path.join(root, "pixel-editor.js"),
  "utf8",
);
const pixelAtlasGeneratorScript = await fs.readFile(
  path.join(root, "pixel-font/scripts/generate-atlases.mjs"),
  "utf8",
);
const demoStyles = await fs.readFile(path.join(root, "index.css"), "utf8");
const emojiByKey = Object.fromEntries(
  emoji.map((item) => [item.key, item.emoji]),
);
const browserEmoji = await importFileDefault("dist/esm/index.js");
const rootEmoji = await importPackageDefault("@lewismoten/emoji");
const allEmoji = await importPackageDefault("@lewismoten/emoji/all");
const popularEmoji = await importPackageDefault("@lewismoten/emoji/popular");
const allTypes = await fs.readFile(
  path.join(root, "dist/esm/types/all.d.mts"),
  "utf8",
);
const activitiesTypes = await fs.readFile(
  path.join(root, "dist/esm/types/categories/activities/arts-and-crafts.d.mts"),
  "utf8",
);

assert.equal(
  new Set(emoji.map((item) => item.key)).size,
  emoji.length,
  "emoji keys must be unique",
);
assert.ok(
  emoji.every((item) => Number.isInteger(item.order)),
  "every emoji must have a Unicode order",
);
assert.ok(
  emoji.every((item) =>
    ["single", "modifier", "zwj", "flag", "keycap", "tag"].includes(
      item.sequenceType,
    ),
  ),
  "every emoji must have a known sequence type",
);
assert.deepEqual(
  orderManifest.unicode,
  [...emoji].sort((a, b) => a.order - b.order).map((item) => item.key),
  "Unicode order manifest must match emoji order metadata",
);
assert.equal(
  webAppManifest.id,
  "./",
  "web app manifest ID must remain within the GitHub Pages project scope",
);
assert.equal(
  webAppManifest.start_url,
  "./",
  "web app must start at the GitHub Pages project root",
);
assert.equal(
  webAppManifest.scope,
  "./",
  "web app scope must remain within the GitHub Pages project",
);
assert.equal(
  webAppManifest.display,
  "standalone",
  "installed web app must use standalone display mode",
);
assert.deepEqual(
  webAppManifest.icons.map((icon) => icon.sizes),
  ["192x192", "512x512", "512x512"],
  "web app must provide standard and maskable install icons",
);
assert.match(
  serviceWorker,
  new RegExp(
    `const CACHE_NAME = \\\`\\$\\{CACHE_PREFIX\\}${packageJson.version}-[a-f0-9]{12}\\\`;`,
  ),
  "service-worker cache must use the package version and an asset revision",
);
for (const asset of [
  "./index.ar.html",
  "./emoji.json",
  "./dist/esm/index.js",
  "./offline.html",
  "./versions/manifest.json",
  "./pixel-font/build/font/pixel-emoji.woff2",
  "./pixel-font/build/editor-manifest.json",
  "./pixel-editor.js",
]) {
  assert.ok(
    serviceWorker.includes(`"${asset}"`),
    `service worker must precache ${asset}`,
  );
}
assert.ok(
  serviceWorker.includes('"./index.css?direct"'),
  "service worker must precache Vite-compatible direct CSS",
);
for (const sheet of pixelAtlasManifest.sheets) {
  const mappingAsset = `./pixel-font/atlases/${sheet.mapping}`;
  const imageAsset = `./pixel-font/atlases/${sheet.image}`;
  assert.ok(
    serviceWorker.includes(`"${mappingAsset}"`),
    `service worker must precache ${mappingAsset}`,
  );
  const imageExists = await fs
    .access(path.join(root, imageAsset))
    .then(() => true)
    .catch(() => false);
  assert.equal(
    serviceWorker.includes(`"${imageAsset}"`),
    imageExists,
    `service worker must only precache ${imageAsset} when it exists`,
  );
}
assert.match(
  arabicDemo,
  /<html lang="ar" dir="rtl" data-locale="ar">/,
  "Arabic demo page must start in Arabic and RTL",
);
assert.match(
  arabicDemo,
  /جارٍ تحميل الرموز التعبيرية/,
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
assert.doesNotMatch(
  demoStyles,
  /line-clamp/,
  "emoji-dialog titles must not visually truncate long names",
);
assert.match(
  demoScript,
  /dialogTitleElement\.title = dialogTitle/,
  "emoji-dialog titles must also expose the complete name as a tooltip",
);
assert.match(
  demoScript,
  /function ensureCompactCopyLabels/,
  "cached demo HTML must be upgraded with compact copy labels",
);
assert.match(
  demoHtml,
  /id="saved-dialog"/,
  "demo must provide a saved-emoji dialog",
);
assert.match(
  demoHtml,
  /id="help-dialog"/,
  "demo must provide keyboard-shortcut help",
);
assert.match(
  demoHtml,
  /class="toggle-favorite"/,
  "emoji details must provide a favorite toggle",
);
assert.match(
  demoHtml,
  /class="dialog-title-row"[\s\S]*class="toggle-favorite"[\s\S]*id="example-title"/,
  "the favorite star must appear beside the title by default",
);
assert.match(
  demoStyles,
  /\.emoji-dialog-eyebrow\s*\{\s*display:\s*none;\s*\}/,
  "the redundant Emoji details label must remain hidden",
);
assert.match(
  demoScript,
  /function positionFavoriteButton[\s\S]*matchMedia\('\(max-width: 560px\)'\)\.matches[\s\S]*dialogControls\.querySelector\('form'\)\?\.before\(favoriteButton\)[\s\S]*dialogTitleRow\.prepend\(favoriteButton\)/,
  "the favorite star must move between the mobile controls and wide-screen title",
);
assert.match(
  demoStyles,
  /\.dialog-controls \.toggle-favorite \{[\s\S]*border: 1px solid var\(--border\);[\s\S]*background: var\(--panel\)/,
  "the mobile favorite star must look like the neighboring control buttons",
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
  /\.modifier-emoji\s*\{\s*display:\s*inline;\s*font-size:\s*1rem;\s*\}/,
  "modifier buttons must always display their emoji",
);
assert.match(
  demoStyles,
  /\.modifier-filters fieldset input \{[\s\S]*clip: rect\(0, 0, 0, 0\)/,
  "modifier checkboxes must remain accessible without being visually exposed",
);
assert.match(
  demoHtml,
  /class="emoji-composition"/,
  "emoji details must provide a sequence composition section",
);
assert.match(
  demoHtml,
  /class="pixel-font-toggle"/,
  "demo must provide a pixel-font toggle",
);
assert.match(
  demoHtml,
  /class="show-pixel-editor"/,
  "emoji details must provide a pixel-editor mode",
);
assert.match(
  demoScript,
  /function ensureUtilityControls/,
  "new utility controls must be restored when cached HTML is stale",
);
assert.match(
  demoScript,
  /updateEmojiComposition\(item, value\)/,
  "emoji details must render multi-code-point compositions",
);
assert.match(
  demoScript,
  /function updateEmojiComposition[\s\S]*detailsVisible[\s\S]*is-code-view[\s\S]*is-editor-view[\s\S]*section\.hidden = points\.length <= 1 \|\| !detailsVisible/,
  "sequence composition must remain hidden while navigating in the pixel editor",
);
assert.match(
  demoScript,
  /0x200D[\s\S]*zeroWidthJoiner/,
  "emoji compositions must identify zero-width joiners",
);
assert.match(
  demoStyles,
  /\.emoji-composition-equation[\s\S]*flex-wrap: wrap/,
  "long emoji compositions must wrap",
);
assert.match(
  demoScript,
  /createCompositionTerm\('\+', part\)/,
  "composition operators must wrap with their following component",
);
assert.doesNotMatch(
  demoScript,
  /glyph: `TAG |glyph: 'END'|glyph: 'SPACE'/,
  "tag-sequence labels must not display hard-coded English",
);
assert.match(
  demoScript,
  /translate\('tagAbbreviation', 'TAG'\)/,
  "tag characters must use compact localized labels",
);
assert.match(
  demoScript,
  /cancelTagAbbreviation[\s\S]*'END'/,
  "tag endings must use compact localized labels",
);
assert.match(
  demoScript,
  /dataset\.compositionEmoji/,
  "composition parts must navigate to matching library emoji",
);
assert.match(
  demoScript,
  /emojiKeyByCodePoints\.get\(`\$\{normalized\} FE0F`\)[\s\S]*emojiKey !== excludedEmojiKey/,
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
  demoScript,
  /compositionParent: parentEmojiKey/,
  "component navigation must retain its parent in browser history",
);
assert.match(
  demoScript,
  /event\.target\.closest\('\.emoji-parent'\)[\s\S]*window\.history\.back/,
  "parent navigation must use browser history",
);
assert.match(
  demoScript,
  /delete nextState\.compositionParent/,
  "ordinary dialog navigation must clear stale component history",
);
assert.match(
  demoScript,
  /showModal\(\);[\s\S]*focusInitialEmojiDialogAction\(\)/,
  "newly opened emoji dialogs must focus their primary copy action",
);
assert.match(
  demoScript,
  /querySelector\('\.emoji-preview'\)[\s\S]*focus\(\{ preventScroll: true \}\)/,
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
  /class="filter-field sequence-filter-field"/,
  "sequence browsing must provide a sequence-type filter",
);
assert.match(
  demoScript,
  /groupField\.hidden = sequenceMode[\s\S]*sequenceField\.hidden = !sequenceMode/,
  "sequence browsing must replace group filters with sequence types",
);
assert.match(
  demoScript,
  /orderMode === 'sequence' && selectedSequenceType[\s\S]*sequenceType === selectedSequenceType/,
  "sequence-type selections must filter the emoji list",
);
assert.match(
  demoScript,
  /params\.set\('sequenceType', selectedSequenceType\)/,
  "sequence-type filters must persist in the URL",
);
assert.match(
  demoStyles,
  /\.sequence-type > \.name\s*\{[\s\S]*position:\s*sticky;[\s\S]*top:\s*var\(--toolbar-height\);/,
  "sequence-type headings must remain sticky below the toolbar",
);
assert.match(
  demoScript,
  /replace\(\/\[\\p\{P\}\\p\{S\}\]\+\/gu, ' '\)/,
  "English-name comparisons must ignore punctuation and symbols",
);
assert.match(
  demoScript,
  /function condenseCompositionPoints/,
  "emoji compositions must detect known nested sequences",
);
assert.match(
  demoScript,
  /for \(let end = points\.length; end >= start \+ 2; end--\)/,
  "composition folding must prefer the longest known sequence",
);
assert.match(
  demoScript,
  /params\.get\('composition'\) === 'full'/,
  "composition mode must load from the URL",
);
assert.match(
  demoScript,
  /params\.set\('composition', 'full'\)/,
  "full composition mode must persist in the URL",
);
assert.match(
  demoScript,
  /formatCompositionReduction\(components\.length, 1\)/,
  "condensed composition counts must use localized direction",
);
assert.match(
  demoScript,
  /startsWith\('ar'\).*numberingSystem: 'arab'/,
  "Arabic UI numbers must use Arabic-Indic digits",
);
assert.match(
  demoScript,
  /dir === 'rtl'[\s\S]*formatUiNumber\(to\)}←\$\{formatUiNumber\(from\)/,
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
assert.doesNotMatch(
  demoHtml,
  /class="emoji-code-points"/,
  "code points must not be repeated in a metadata card",
);
assert.match(
  demoScript,
  /\.emoji-code-points'\)\?\.closest\('div'\)\?\.remove/,
  "cached code-point metadata rows must be removed",
);
assert.match(
  demoHtml,
  /class="pixel-font-toggle"/,
  "demo must provide a pixel-font toggle",
);
assert.match(
  demoScript,
  /function togglePixelFont/,
  "pixel-font preference must be toggleable",
);
assert.match(
  demoScript,
  /createPixelEditor/,
  "demo must initialize the pixel-art editor",
);
assert.match(
  demoScript,
  /emojiMode.*editor|is-editor-view/,
  "pixel-editor mode must participate in URL state",
);
assert.match(
  demoScript,
  /explorerPreferences\.pixelFont !== false/,
  "pixel font must be enabled by default",
);
assert.match(
  demoScript,
  /event\?\.detail > 0/,
  "pointer toggles must release their active focus state",
);
assert.match(
  demoScript,
  /explorer-preferences/,
  "demo preferences must use a stable local-storage key",
);
assert.match(
  demoScript,
  /recordCopiedEmoji/,
  "demo must retain recently copied emoji",
);
assert.match(
  demoScript,
  /if \(copied\) recordCopiedEmoji/,
  "successful copy actions must update recently copied emoji",
);
assert.doesNotMatch(
  demoScript,
  /if \(copied\) addFavorite/,
  "copy actions must not implicitly add favorites",
);
assert.match(
  demoScript,
  /dialogNavigationKeys/,
  "saved emoji must retain their own dialog navigation context",
);
assert.match(
  demoScript,
  /\['favorites', 'help', 'language'\]\.includes/,
  "utility dialogs must support direct URL panel state",
);
assert.match(
  demoScript,
  /panelDialogEntry/,
  "utility dialogs must participate in browser history",
);
assert.match(
  demoStyles,
  /content-visibility: auto/,
  "large emoji sections must defer off-screen rendering when supported",
);
assert.match(
  demoStyles,
  /font-family: "Pixel Emoji"/,
  "demo must load the generated pixel font",
);
assert.match(
  demoStyles,
  /html\[data-emoji-font="system"\]/,
  "demo must support the system emoji fallback",
);
assert.match(
  demoStyles,
  /\.language-picker-flag,[\s\S]*font-family: var\(--system-emoji-font\)/,
  "language flags must retain stable system-font metrics",
);
assert.match(
  demoStyles,
  /\.pixel-editor-canvas/,
  "demo must style the pixel-art canvas",
);
assert.match(
  pixelEditorScript,
  /pixel-editor-workspace[\s\S]*?pixel-editor-stage[\s\S]*?pixel-editor-previews[\s\S]*?pixel-editor-controls/,
  "pixel editor must keep its actual-size previews beneath the drawing grid",
);
assert.match(
  demoStyles,
  /@media \(min-width: 561px\) and \(max-height: 560px\)[\s\S]*?calc\(100dvh - 10rem\)/,
  "pixel editor must fit its canvas within short landscape viewports",
);
assert.match(
  pixelEditorScript,
  /const CELL_SIZE = 12/,
  "pixel editor must use a 12 by 12 cell",
);
assert.match(
  pixelEditorScript,
  /const EGA_COLORS = \[/,
  "pixel editor must provide the classic EGA palette",
);
assert.doesNotMatch(
  pixelEditorScript,
  /type="color"|class="pixel-editor-alpha"/,
  "pixel editor must not expose custom colors or artwork opacity",
);
assert.match(
  pixelEditorScript,
  /nearestEgaColor/,
  "the eyedropper must reduce sampled colors to the EGA palette",
);
assert.match(
  pixelEditorScript,
  /data-transparent="true"/,
  "pixel editor must provide a transparent eraser",
);
assert.match(
  demoStyles,
  /\.pixel-editor-palette[\s\S]*grid-template-columns:\s*repeat\(9,\s*1\.65rem\);[\s\S]*grid-template-rows:\s*repeat\(2,\s*1\.65rem\);[\s\S]*\.pixel-editor-swatch\.is-transparent[\s\S]*grid-column:\s*9;[\s\S]*grid-row:\s*1 \/ span 2;/,
  "EGA colors must stay in rows of eight beside a two-row transparent swatch",
);
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
  pixelEditorScript,
  /nextTool === tool[\s\S]*nextTool === "rectangle" \|\| nextTool === "ellipse"[\s\S]*fillShapesEnabled = !fillShapesEnabled/,
  "clicking the selected rectangle or ellipse tool again must toggle shape filling",
);
assert.match(
  pixelEditorScript,
  /function updateShapeToolButtons[\s\S]*filled \? "■" : "□"[\s\S]*filled \? "●" : "○"/,
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
assert.match(
  pixelEditorScript,
  /traceOffsetX \+= Number\(button\.dataset\.traceX\)[\s\S]*traceOffsetY \+= Number\(button\.dataset\.traceY\)/,
  "trace nudge controls must move the reference by one grid pixel per click",
);
assert.match(
  pixelEditorScript,
  /traceOffsetX = 0;[\s\S]*traceOffsetY = 0;[\s\S]*pixelEditorLoading/,
  "trace position must reset when another emoji opens",
);
assert.match(
  pixelEditorScript,
  /formatPercent\(Number\(traceAlpha\.value\) \/ 100\)/,
  "trace opacity must use the active locale's percentage formatter",
);
assert.match(
  pixelEditorScript,
  /formatNumber\(currentEntry\.row \+ 1\)[\s\S]*formatNumber\(currentEntry\.column \+ 1\)/,
  "pixel atlas row and column numbers must use the active locale",
);
assert.match(
  demoScript,
  /function formatUiPercent[\s\S]*numberingSystem: 'arab'[\s\S]*style: 'percent'/,
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
for (const action of ["copyPixelArt", "copyFontGlyph", "pastePixelArt"]) {
  assert.match(
    pixelEditorScript,
    new RegExp(`function ${action}`),
    `pixel editor must provide ${action}`,
  );
}
assert.match(
  pixelEditorScript,
  /pixel-font\/build\/png\/\$\{currentEntry\.key\}\.png/,
  "copying a custom-font glyph must use its exact compiled pixel PNG",
);
assert.match(
  pixelEditorScript,
  /class="pixel-editor-transfer-icon" aria-hidden="true">🔠<\/span>/,
  "copy-font action must use the input Latin uppercase emoji",
);
assert.match(
  pixelEditorScript,
  /function pastePixelArt[\s\S]*floatingLayer = cloneFloatingLayer\(artworkClipboard\)/,
  "pasted artwork must remain independent of the copied buffer",
);
assert.match(
  pixelEditorScript,
  /let artworkClipboard;/,
  "the artwork clipboard must persist while browsing between emoji",
);
assert.match(
  pixelEditorScript,
  /toolButton\(["']select["'][\s\S]*function copySelection[\s\S]*extractPixels/,
  "pixel editor must select and copy a rectangular subsection",
);
assert.match(
  pixelEditorScript,
  /function selectTool[\s\S]*nextTool !== "select"\) selection = undefined/,
  "leaving the selection tool must clear its selection",
);
assert.match(
  pixelEditorScript,
  /function drawSelectionOutline[\s\S]*setLineDash[\s\S]*lineDashOffset[\s\S]*function animateSelectionOutline[\s\S]*draw\(false\)/,
  "the selection frame must use animated marching ants",
);
assert.match(
  pixelEditorScript,
  /function updateEditorModePanels[\s\S]*copyArtButton\.hidden = selectionMode[\s\S]*copyFontButton\.hidden = selectionMode[\s\S]*copySelectionButton\.hidden = !selectionMode/,
  "selection mode must show selection-specific transfer actions",
);
assert.match(
  demoStyles,
  /\.pixel-editor-transfer button\[hidden\][\s\S]*display:\s*none;/,
  "explicit transfer-button layout must not override hidden selection actions",
);
assert.match(
  pixelEditorScript,
  /tool === "select" && artworkClipboard\.kind !== "selection"/,
  "selection mode must paste only a copied selection",
);
assert.match(
  pixelEditorScript,
  /document\.addEventListener\("keydown", onEditorKeyDown, true\)[\s\S]*function onEditorKeyDown[\s\S]*view\.hidden \|\| !dialog\.open[\s\S]*event\.ctrlKey \|\| event\.metaKey[\s\S]*copySelection\(\)[\s\S]*pastePixelArt\(\)/,
  "selection copy and layer paste must support Ctrl/Cmd keyboard shortcuts throughout the editor",
);
assert.match(
  pixelEditorScript,
  /function onPointerDown[\s\S]*canvas\.focus\(\{ preventScroll: true \}\)/,
  "drawing must move keyboard focus to the canvas for immediate shortcuts",
);
assert.match(
  pixelEditorScript,
  /function onEditorKeyDown[\s\S]*key === "z"[\s\S]*event\.shiftKey[\s\S]*redo\(\)[\s\S]*!event\.shiftKey[\s\S]*undo\(\)[\s\S]*key === "y"[\s\S]*redo\(\)/,
  "editor history must support Ctrl/Cmd+Z and both common redo shortcuts",
);
assert.match(
  pixelEditorScript,
  /function updateEditorModePanels[\s\S]*layerPanel\.hidden = !layerMode[\s\S]*filePanel\.hidden = layerMode \|\| selectionMode/,
  "floating-layer mode must hide competing editor panels",
);
assert.match(
  pixelEditorScript,
  /function bakeFloatingLayer[\s\S]*pushHistory\(\);[\s\S]*compositeLayer\(pixels, \{[\s\S]*effectiveLayerPixels\(floatingLayer\)/,
  "baking a floating layer must be undoable",
);
for (const transform of [
  "rotate-left",
  "rotate-right",
  "flip-horizontal",
  "flip-vertical",
]) {
  assert.match(
    pixelEditorScript,
    new RegExp(`data-layer-transform="${transform}"`),
    `floating layers must support ${transform}`,
  );
}
assert.match(
  pixelEditorScript,
  /class="pixel-editor-invert-layer"[\s\S]*function toggleFloatingLayerInversion[\s\S]*function effectiveLayerPixels[\s\S]*nearestEgaColor/,
  "floating layers must support non-destructive inversion into the nearest EGA colors",
);
assert.match(
  pixelEditorScript,
  /function updateLayerControlStates[\s\S]*layerNudgeButtons\.forEach[\s\S]*nextX < 0[\s\S]*nextX \+ floatingLayer\.width > CELL_SIZE[\s\S]*nextY \+ floatingLayer\.height > CELL_SIZE/,
  "layer nudge controls must disable at canvas boundaries",
);
assert.match(
  pixelEditorScript,
  /function setFloatingLayerPosition[\s\S]*clamp\(x, 0, CELL_SIZE - floatingLayer\.width\)[\s\S]*clamp\(y, 0, CELL_SIZE - floatingLayer\.height\)/,
  "dragged layers must remain completely inside the canvas",
);
assert.match(
  pixelEditorScript,
  /layerTransformButtons\.forEach[\s\S]*layerTransformChangesPixels[\s\S]*pixelsEqual/,
  "rotation and flip controls must disable when they would not alter the layer",
);
for (const action of [
  "pixel-editor-save",
  "pixel-editor-download",
  "pixel-editor-download-emoji",
]) {
  assert.match(
    pixelEditorScript,
    new RegExp(`class="${action}"`),
    `pixel previews must provide ${action}`,
  );
}
assert.match(
  pixelEditorScript,
  /function downloadEmojiPng[\s\S]*imageDataCanvas\(pixels, CELL_SIZE, CELL_SIZE\)[\s\S]*currentEntry\.key\}\.png/,
  "the current 12 by 12 artwork must be downloadable as its own PNG",
);
assert.match(
  pixelEditorScript,
  /class="pixel-editor-download-emoji-icon"[\s\S]*class="pixel-editor-download-preview"[\s\S]*const downloadPreview[\s\S]*downloadPreview\.getContext/,
  "the individual PNG action must preview the current pixel artwork instead of showing a 12 label",
);
assert.match(
  pixelEditorScript,
  /const persistedArtwork = new Map\(\)[\s\S]*const dirtyKeys = new Set\(\)[\s\S]*function updateDirtyState[\s\S]*pixelsEqual\(pixels, baseline\)[\s\S]*dirtyIndicator\.hidden = !dirty/,
  "the editor must visibly track artwork that differs from its persisted atlas pixels",
);
assert.match(
  pixelEditorScript,
  /window\.addEventListener\("beforeunload", warnAboutDirtyArtwork\)[\s\S]*function warnAboutDirtyArtwork[\s\S]*dirtyKeys\.size === 0[\s\S]*event\.returnValue/,
  "leaving the page must warn when any emoji artwork remains dirty",
);
assert.match(
  pixelEditorScript,
  /function markAtlasClean[\s\S]*persistedArtwork\.set[\s\S]*dirtyKeys\.delete/,
  "saving or downloading an atlas must clear its saved emoji drafts",
);
assert.match(
  demoStyles,
  /\.pixel-editor-preview-actions[\s\S]*display:\s*flex;[\s\S]*\.pixel-editor-dirty[\s\S]*display:\s*inline-flex;/,
  "preview save actions and the dirty indicator must sit with the actual-size previews",
);
assert.match(
  pixelEditorScript,
  /function onCanvasKeyDown[\s\S]*ArrowLeft[\s\S]*ArrowUp[\s\S]*ArrowDown[\s\S]*ArrowRight[\s\S]*Enter[\s\S]*bakeFloatingLayer/,
  "floating layers must support keyboard movement and baking",
);
assert.match(
  pixelEditorScript,
  /selection: cloneSelection\(selection\)[\s\S]*floatingLayer: cloneFloatingLayer\(floatingLayer\)/,
  "selection and floating-layer drafts must survive emoji navigation",
);
assert.match(
  pixelEditorScript,
  /const artworkDrafts = new Map\(\)/,
  "pixel editor must retain an in-memory artwork draft for each emoji",
);
assert.match(
  pixelEditorScript,
  /rememberCurrentDraft\(\);[\s\S]*currentEmoji = emoji/,
  "pixel editor must retain the current draft before navigating to another emoji",
);
assert.match(
  pixelEditorScript,
  /const draft = artworkDrafts\.get\(entry\.key\)[\s\S]*pixels = draft\?\.pixels\.slice\(\) \?\? loadedPixels[\s\S]*traceOffsetX = draft\?\.traceOffsetX \?\? 0[\s\S]*traceOffsetY = draft\?\.traceOffsetY \?\? 0/,
  "pixel editor must restore artwork and trace position when returning to an emoji",
);
assert.match(
  pixelEditorScript,
  /for \(const draft of artworkDrafts\.values\(\)\)[\s\S]*draft\.entry\.atlas !== currentEntry\.atlas[\s\S]*draft\.entry\.x[\s\S]*draft\.entry\.y/,
  "saving must merge every retained draft belonging to the current atlas",
);
assert.match(
  pixelEditorScript,
  /function updateTransferButtons[\s\S]*copyArtButton\.disabled =[\s\S]*!hasVisibleArtwork\(\)/,
  "copy-art action must be disabled while every artwork pixel is transparent",
);
for (const preview of ["official", "font", "artwork"]) {
  assert.match(
    pixelEditorScript,
    new RegExp(`preview\\(["']${preview}["']`),
    `pixel editor must provide the ${preview} 12-pixel preview`,
  );
}
assert.match(
  demoStyles,
  /\.pixel-editor-previews figure[\s\S]*width:\s*12px;[\s\S]*height:\s*12px;[\s\S]*\.pixel-editor-previews canvas[\s\S]*width:\s*12px;[\s\S]*height:\s*12px;/,
  "actual-size previews must remain 12 by 12 instead of using uneven fractional scaling",
);
for (const tool of [
  "pencil",
  "rectangle",
  "ellipse",
  "bucket",
  "eyedropper",
  "select",
]) {
  assert.match(
    pixelEditorScript,
    new RegExp(`toolButton\\(["']${tool}["']`),
    `pixel editor must provide the ${tool} tool`,
  );
}
assert.match(
  pixelEditorScript,
  /data-tool="\$\{tool\}" data-i18n-aria-label="\$\{translationKey\}" aria-label="\$\{fallback\}"/,
  "icon-only drawing tools must retain localized accessible names",
);
assert.match(
  demoStyles,
  /@media \(max-width: 399px\)[\s\S]*\.pixel-editor-tools[\s\S]*grid-template-columns:\s*repeat\(6,\s*2\.35rem\);[\s\S]*\.pixel-editor-tools button > span:last-child[\s\S]*display:\s*none;/,
  "skinny screens must show six compact icon-only drawing tools in one row",
);
assert.match(
  pixelEditorScript,
  /showDirectoryPicker/,
  "pixel editor must support direct atlas-directory writes",
);
assert.match(
  pixelEditorScript,
  /getNestedFileHandle/,
  "pixel editor must save grouped atlases into nested directories",
);
assert.match(
  pixelEditorScript,
  /createBlankAtlas/,
  "pixel editor must construct missing atlas sheets in memory",
);
assert.match(
  pixelEditorScript,
  /content-type[\s\S]*image\/png/,
  "pixel editor must distinguish a PNG from a development-server fallback page",
);
assert.match(
  pixelEditorScript,
  /atlasExists \|\| hasVisibleAtlasDraft\(\)/,
  "a missing atlas must not be writable until visible artwork is added",
);
assert.doesNotMatch(
  pixelAtlasGeneratorScript,
  /renderBlankSheet|writeFile\(imagePath/,
  "atlas generation must not create empty PNG templates",
);
assert.match(
  pixelEditorScript,
  /downloadAtlas/,
  "pixel editor must provide an atlas download fallback",
);
assert.match(
  pixelEditorScript,
  /alpha === 0/,
  "pixel editor must preserve transparent pixels",
);
assert.equal(
  pixelAtlasManifest.layout,
  "grouped-subgroups-v1",
  "pixel atlases must use the grouped subgroup layout",
);
assert.equal(
  pixelAtlasManifest.author,
  "Lewis Moten",
  "pixel atlas metadata must identify its author",
);
assert.equal(
  pixelAtlasManifest.url,
  "https://lewismoten.com",
  "pixel atlas metadata must identify its source URL",
);
assert.equal(
  pixelAtlasManifest.cellSize,
  12,
  "pixel atlas artwork must use 12-pixel cells",
);
assert.equal(
  pixelAtlasManifest.cellPadding,
  2,
  "pixel atlas cells must have two transparent pixels of padding per side",
);
assert.equal(
  pixelAtlasManifest.slotSize,
  pixelAtlasManifest.cellSize + pixelAtlasManifest.cellPadding * 2,
  "pixel atlas slot size must include transparent padding on both sides",
);
assert.ok(
  pixelAtlasManifest.groupCount > 1,
  "pixel atlases must be divided into Unicode groups",
);
assert.ok(
  pixelAtlasManifest.subGroupCount > pixelAtlasManifest.groupCount,
  "pixel atlases must be divided into Unicode subgroups",
);
assert.ok(
  pixelAtlasManifest.sheets.every(
    (sheet) =>
      sheet.image.includes("/") &&
      sheet.mapping.includes("/") &&
      sheet.group &&
      sheet.subGroup &&
      sheet.rows >= 1 &&
      sheet.rows <= pixelAtlasManifest.maxRows &&
      sheet.assignedCount <= sheet.capacity,
  ),
  "every pixel atlas sheet must be grouped, labeled, compact, and within capacity",
);
assert.ok(
  new Set(pixelAtlasManifest.sheets.map((sheet) => sheet.imageHeight)).size > 1,
  "pixel atlas sheets must use variable heights instead of a fixed 16-row canvas",
);
assert.deepEqual(
  browserEmoji,
  emojiByKey,
  "browser bundle must contain every emoji value",
);
assert.deepEqual(
  allEmoji,
  emojiByKey,
  "all export must contain every emoji value",
);
assert.match(
  allTypes,
  /declare const emoji: typeof \S+ & typeof \S+/,
  "all merger must preserve the types of its imported category packs",
);
assert.match(
  activitiesTypes,
  /\*\* artist palette 🎨 \*\//,
  "emoji declarations must document the emoji glyph",
);
assert.ok(
  Object.keys(popularEmoji).length > 0,
  "popular export must not be empty",
);
assert.ok(
  Object.keys(popularEmoji).every((key) => key in emojiByKey),
  "popular export must only contain known keys",
);
assert.deepEqual(
  rootEmoji,
  popularEmoji,
  "root export must resolve to the popular package export",
);
assert.deepEqual(
  require("@lewismoten/emoji/all"),
  allEmoji,
  "CommonJS all export must resolve through package exports",
);
assert.deepEqual(
  require("@lewismoten/emoji/orders/manifest"),
  orderManifest,
  "order manifest must resolve through package exports",
);
assert.deepEqual(
  require("@lewismoten/emoji/locales/manifest"),
  localeManifest,
  "locale manifest must resolve through package exports",
);
assert.deepEqual(
  localeManifest.locales.map((locale) => locale.locale),
  ["ar", "en", "en-GB", "es", "hi", "zh"],
  "only CLDR locale packs with annotations must be published",
);
for (const locale of localeManifest.locales) {
  const pack = require(
    `@lewismoten/emoji/locales/${locale.locale}`,
  ) as LocalePack;
  assert.equal(
    pack.locale,
    locale.locale,
    `${locale.locale} pack must identify its locale`,
  );
  assert.ok(
    locale.label && locale.nativeLabel,
    `${locale.locale} manifest must provide English and native labels`,
  );
  assert.equal(
    pack.label,
    locale.label,
    `${locale.locale} pack must provide its English label`,
  );
  assert.equal(
    pack.nativeLabel,
    locale.nativeLabel,
    `${locale.locale} pack must provide its native label`,
  );
  assert.equal(
    pack.rtl,
    locale.rtl,
    `${locale.locale} pack must provide its text direction`,
  );
  assert.equal(
    pack.cldrVersion,
    locale.cldrVersion,
    `${locale.locale} pack must identify its CLDR version`,
  );
  assert.equal(
    pack.baseLocale,
    locale.baseLocale,
    `${locale.locale} pack must identify its base locale`,
  );
  assert.equal(
    Object.keys(pack.annotations).length,
    locale.count,
    `${locale.locale} annotation count must match its manifest`,
  );
  assert.equal(
    Object.keys(pack.labels).length,
    locale.characterLabelCount,
    `${locale.locale} character-label count must match its manifest`,
  );
  assert.equal(
    Object.keys(pack.subgroups).length,
    locale.subgroupLabelCount,
    `${locale.locale} custom subgroup-label count must match its manifest`,
  );
  assert.ok(
    locale.count > 0 || locale.characterLabelCount > 0,
    `${locale.locale} packs without locale-specific data must be omitted`,
  );
  if (!locale.baseLocale)
    assert.ok(
      locale.characterLabelCount > 0,
      `${locale.locale} base packs must include localized character labels`,
    );
  assert.ok(
    Object.keys(pack.annotations).every((key) => key in emojiByKey),
    `${locale.locale} annotations must only reference known emoji`,
  );
}
const { createEmojiSearch, mergeEmojiLocalePacks } =
  await import("@lewismoten/emoji/search");
const searchEnglish = createEmojiSearch(
  require("@lewismoten/emoji/locales/en") as LocalePack,
);
assert.ok(
  searchEnglish("artist palette").includes("artistPalette"),
  "search must find CLDR short names",
);
assert.ok(
  searchEnglish("painting").includes("artistPalette"),
  "search must find CLDR keywords",
);
for (const locale of localeManifest.locales.filter(
  (locale) => locale.baseLocale,
)) {
  const base = require(
    `@lewismoten/emoji/locales/${locale.baseLocale}`,
  ) as LocalePack;
  const regional = require(
    `@lewismoten/emoji/locales/${locale.locale}`,
  ) as LocalePack;
  const merged = mergeEmojiLocalePacks(base, regional);
  assert.equal(
    Object.keys(merged.annotations).length,
    locale.totalCount,
    `${locale.locale} must merge with its base locale`,
  );
  assert.equal(
    Object.keys(merged.labels ?? {}).length,
    locale.totalCharacterLabelCount,
    `${locale.locale} character labels must merge with its base locale`,
  );
}
assert.equal(
  packageManifest.name,
  "@lewismoten/emoji",
  "package manifest must identify this package",
);
assert.equal(
  packageManifest.packs.find((pack) => pack.id === "all")?.count,
  emoji.length,
  "all pack count must match emoji data",
);
assert.equal(
  packageManifest.categories.length,
  new Set(emoji.map((item) => item.group)).size,
  "package manifest must list every Unicode category",
);
for (const category of packageManifest.categories) {
  assert.equal(
    category.importPath,
    `@lewismoten/emoji/categories/${category.id}`,
    `${category.label} must have a public import path`,
  );
  assert.equal(
    category.count,
    emoji.filter((item) => item.group === category.label).length,
    `${category.label} count must match emoji data`,
  );
  assert.equal(
    category.subcategories.reduce(
      (count, subcategory) => count + subcategory.count,
      0,
    ),
    category.count,
    `${category.label} subcategories must account for every emoji`,
  );
  const categoryEmoji = await importPackageDefault(category.importPath);
  assert.equal(
    Object.keys(categoryEmoji).length,
    category.count,
    `${category.label} export count must match its manifest`,
  );
  for (const subcategory of category.subcategories) {
    assert.equal(
      subcategory.importPath,
      `@lewismoten/emoji/categories/${category.id}/${subcategory.id}`,
      `${subcategory.label} must have a public import path`,
    );
    const subcategoryEmoji = await importPackageDefault(subcategory.importPath);
    assert.equal(
      Object.keys(subcategoryEmoji).length,
      subcategory.count,
      `${subcategory.label} export count must match its manifest`,
    );
    assert.ok(
      Object.keys(subcategoryEmoji).every((key) => key in categoryEmoji),
      `${subcategory.label} must belong to ${category.label}`,
    );
  }
}
for (const variation of packageManifest.variations) {
  assert.equal(
    variation.importPath,
    `@lewismoten/emoji/variations/${variation.id}`,
    `${variation.id} must have a public import path`,
  );
}

const versionKeys = new Set<string>();
for (const version of manifest.versions) {
  const keys = await readJson<string[]>(`versions/${version.file}`);
  assert.equal(
    keys.length,
    version.count,
    `Emoji ${version.version} count must match its manifest`,
  );
  assert.equal(
    new Set(keys).size,
    keys.length,
    `Emoji ${version.version} keys must be unique`,
  );
  for (const key of keys) {
    assert.ok(
      key in emojiByKey,
      `Emoji ${version.version} contains unknown key ${key}`,
    );
    assert.ok(
      !versionKeys.has(key),
      `Emoji ${key} must be introduced by only one version`,
    );
    versionKeys.add(key);
  }
}
assert.deepEqual(
  versionKeys,
  new Set(Object.keys(emojiByKey)),
  "version files must account for every emoji",
);

const releasedCodePoints = new Set(emoji.map((item) => item.codePoints));
for (const version of manifest.proposed ?? []) {
  assert.equal(
    version.status,
    "draft",
    `Unicode ${version.version} must match its draft source data`,
  );
  assert.equal(
    version.released,
    null,
    `Unicode ${version.version} must not have a release date`,
  );
  const proposal = await readJson<{ count: number; emoji: Emoji[] }>(
    version.file,
  );
  assert.equal(
    proposal.count,
    version.count,
    `Unicode ${version.version} proposed count must match its manifest`,
  );
  assert.ok(
    proposal.emoji.every((item) => !releasedCodePoints.has(item.codePoints)),
    "proposed emoji must not be released emoji",
  );
}

for (const variation of ["skin-tones", "hair", "families", "all"]) {
  const variationEmoji = await importPackageDefault(
    `@lewismoten/emoji/variations/${variation}`,
  );
  assert.ok(
    Object.keys(variationEmoji).every((key) => key in emojiByKey),
    `${variation} export must only contain known keys`,
  );
}

for (const item of [
  emoji[0],
  emoji.at(Math.floor(emoji.length / 2)),
  emoji.at(-1),
]) {
  assert.ok(item, "individual lookup test items must exist");
  assert.equal(
    allEmoji[item.key],
    item.emoji,
    `${item.key} must be available from the all export`,
  );
}

console.info(
  `Verified ${emoji.length.toLocaleString()} emoji, ${manifest.versions.length} Unicode version files, and package entry points.`,
);
