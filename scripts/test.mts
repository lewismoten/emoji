import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
  status: 'draft';
  released: null;
};

type LocaleManifest = {
  locales: { locale: string; label: string; nativeLabel: string; rtl: boolean; baseLocale?: string; file: string; count: number; totalCount: number; characterLabelCount: number; totalCharacterLabelCount: number; subgroupLabelCount: number; totalSubgroupLabelCount: number; cldrVersion: string }[];
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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = async <T,>(file: string) => JSON.parse(await fs.readFile(path.join(root, file), 'utf8')) as T;
const importFileDefault = async (file: string) =>
  (await import(pathToFileURL(path.join(root, file)).href)).default as Record<string, string>;
const importPackageDefault = async (specifier: string) =>
  (await import(specifier)).default as Record<string, string>;
const require = createRequire(import.meta.url);

const emoji = await readJson<Emoji[]>('emoji.json');
const orderManifest = await readJson<{ unicode: string[] }>('orders/manifest.json');
const localeManifest = await readJson<LocaleManifest>('locales/manifest.json');
const packageManifest = await readJson<{
  name: string;
  packs: { id: string; count: number; importPath: string }[];
  categories: {
    id: string;
    label: string;
    count: number;
    importPath: string;
    subcategories: { id: string; label: string; unicodeSubgroup: string; count: number; importPath: string }[];
  }[];
  variations: { id: string; count: number; importPath: string }[];
}>('manifest.json');
const manifest = await readJson<{ versions: Version[]; proposed?: ProposedVersion[] }>('versions/manifest.json');
const webAppManifest = await readJson<WebAppManifest>('manifest.webmanifest');
const packageJson = await readJson<{ version: string }>('package.json');
const serviceWorker = await fs.readFile(path.join(root, 'build/demo-pages/service-worker.js'), 'utf8');
const arabicDemo = await fs.readFile(path.join(root, 'build/demo-pages/index.ar.html'), 'utf8');
const demoHtml = await fs.readFile(path.join(root, 'index.html'), 'utf8');
const demoScript = await fs.readFile(path.join(root, 'index.js'), 'utf8');
const demoStyles = await fs.readFile(path.join(root, 'index.css'), 'utf8');
const emojiByKey = Object.fromEntries(emoji.map(item => [item.key, item.emoji]));
const browserEmoji = await importFileDefault('dist/esm/index.js');
const rootEmoji = await importPackageDefault('@lewismoten/emoji');
const allEmoji = await importPackageDefault('@lewismoten/emoji/all');
const popularEmoji = await importPackageDefault('@lewismoten/emoji/popular');
const allTypes = await fs.readFile(path.join(root, 'dist/esm/types/all.d.mts'), 'utf8');
const activitiesTypes = await fs.readFile(path.join(root, 'dist/esm/types/categories/activities/arts-and-crafts.d.mts'), 'utf8');

assert.equal(new Set(emoji.map(item => item.key)).size, emoji.length, 'emoji keys must be unique');
assert.ok(emoji.every(item => Number.isInteger(item.order)), 'every emoji must have a Unicode order');
assert.ok(emoji.every(item => ['single', 'modifier', 'zwj', 'flag', 'keycap', 'tag'].includes(item.sequenceType)), 'every emoji must have a known sequence type');
assert.deepEqual(orderManifest.unicode, [...emoji].sort((a, b) => a.order - b.order).map(item => item.key), 'Unicode order manifest must match emoji order metadata');
assert.equal(webAppManifest.id, './', 'web app manifest ID must remain within the GitHub Pages project scope');
assert.equal(webAppManifest.start_url, './', 'web app must start at the GitHub Pages project root');
assert.equal(webAppManifest.scope, './', 'web app scope must remain within the GitHub Pages project');
assert.equal(webAppManifest.display, 'standalone', 'installed web app must use standalone display mode');
assert.deepEqual(webAppManifest.icons.map(icon => icon.sizes), ['192x192', '512x512', '512x512'], 'web app must provide standard and maskable install icons');
const expectedCacheName = 'const CACHE_NAME = `${CACHE_PREFIX}' + packageJson.version + '`;';
assert.ok(serviceWorker.includes(expectedCacheName), 'service-worker cache must use the package version');
for (const asset of ['./index.ar.html', './emoji.json', './dist/esm/index.js', './offline.html', './versions/manifest.json']) {
  assert.ok(serviceWorker.includes(`"${asset}"`), `service worker must precache ${asset}`);
}
assert.ok(serviceWorker.includes('"./index.css?direct"'), 'service worker must precache Vite-compatible direct CSS');
assert.match(arabicDemo, /<html lang="ar" dir="rtl" data-locale="ar">/, 'Arabic demo page must start in Arabic and RTL');
assert.match(arabicDemo, /جارٍ تحميل الرموز التعبيرية/, 'Arabic demo loading state must be localized before JavaScript runs');
assert.match(arabicDemo, /نسخ الرابط/, 'Arabic demo must localize the copy-link action');
assert.match(arabicDemo, /اختصارات لوحة المفاتيح/, 'Arabic demo must localize keyboard help');
assert.match(arabicDemo, /الرموز التعبيرية المحفوظة/, 'Arabic demo must localize saved emoji');
assert.equal(demoHtml.match(/data-copy="link"/g)?.length, 2, 'details and code views must both provide copy-link actions');
assert.match(demoHtml, /id="saved-dialog"/, 'demo must provide a saved-emoji dialog');
assert.match(demoHtml, /id="help-dialog"/, 'demo must provide keyboard-shortcut help');
assert.match(demoHtml, /class="toggle-favorite"/, 'emoji details must provide a favorite toggle');
assert.match(demoHtml, /class="dialog-title-row"[\s\S]*class="toggle-favorite"[\s\S]*id="example-title"/, 'the favorite star must precede the emoji dialog title');
assert.match(demoStyles, /\.emoji-dialog-eyebrow \{ display: none; \}/, 'the redundant Emoji details label must remain hidden');
assert.match(demoScript, /dialogTitleRow\.prepend\(favoriteButton\)/, 'cached favorite controls must move into the dialog title');
assert.match(demoHtml, /class="emoji-composition"/, 'emoji details must provide a sequence composition section');
assert.match(demoScript, /function ensureUtilityControls/, 'new utility controls must be restored when cached HTML is stale');
assert.match(demoScript, /updateEmojiComposition\(item, value\)/, 'emoji details must render multi-code-point compositions');
assert.match(demoScript, /0x200D[\s\S]*zeroWidthJoiner/, 'emoji compositions must identify zero-width joiners');
assert.match(demoStyles, /\.emoji-composition-equation[\s\S]*flex-wrap: wrap/, 'long emoji compositions must wrap');
assert.match(demoScript, /createCompositionTerm\('\+', part\)/, 'composition operators must wrap with their following component');
assert.doesNotMatch(demoScript, /glyph: `TAG |glyph: 'END'|glyph: 'SPACE'/, 'tag-sequence labels must not display hard-coded English');
assert.match(demoScript, /translate\('tagAbbreviation', 'TAG'\)/, 'tag characters must use compact localized labels');
assert.match(demoScript, /cancelTagAbbreviation[\s\S]*'END'/, 'tag endings must use compact localized labels');
assert.match(demoScript, /dataset\.compositionEmoji/, 'composition parts must navigate to matching library emoji');
assert.match(demoScript, /emojiKeyByCodePoints\.get\(`\$\{normalized\} FE0F`\)[\s\S]*emojiKey !== excludedEmojiKey/, 'composition links must recognize presentation variants without linking to the current emoji');
assert.match(demoStyles, /button\.emoji-composition-part:hover/, 'linked composition parts must appear interactive');
assert.match(demoHtml, /class="dialog-navigate emoji-parent"/, 'emoji details must provide parent-sequence navigation');
assert.match(demoScript, /compositionParent: parentEmojiKey/, 'component navigation must retain its parent in browser history');
assert.match(demoScript, /event\.target\.closest\('\.emoji-parent'\)[\s\S]*window\.history\.back/, 'parent navigation must use browser history');
assert.match(demoScript, /delete nextState\.compositionParent/, 'ordinary dialog navigation must clear stale component history');
assert.match(demoScript, /showModal\(\);[\s\S]*focusInitialEmojiDialogAction\(\)/, 'newly opened emoji dialogs must focus their primary copy action');
assert.match(demoScript, /querySelector\('\.emoji-preview'\)[\s\S]*focus\(\{ preventScroll: true \}\)/, 'emoji details must initially focus the large copy button');
assert.match(demoStyles, /\.emoji-preview:focus-visible \{ outline: 2px solid var\(--accent\); outline-offset: -3px; \}/, 'the initial copy focus ring must remain inside the sticky dialog header boundary');
assert.match(demoHtml, /class="emoji-composition-mode"/, 'foldable compositions must provide a display-mode toggle');
assert.match(demoHtml, /class="filter-field sequence-filter-field"/, 'sequence browsing must provide a sequence-type filter');
assert.match(demoScript, /groupField\.hidden = sequenceMode[\s\S]*sequenceField\.hidden = !sequenceMode/, 'sequence browsing must replace group filters with sequence types');
assert.match(demoScript, /orderMode === 'sequence' && selectedSequenceType[\s\S]*sequenceType === selectedSequenceType/, 'sequence-type selections must filter the emoji list');
assert.match(demoScript, /params\.set\('sequenceType', selectedSequenceType\)/, 'sequence-type filters must persist in the URL');
assert.match(demoStyles, /\.sequence-type > \.name \{ position: sticky; top: var\(--toolbar-height\);/, 'sequence-type headings must remain sticky below the toolbar');
assert.match(demoScript, /function condenseCompositionPoints/, 'emoji compositions must detect known nested sequences');
assert.match(demoScript, /for \(let end = points\.length; end >= start \+ 2; end--\)/, 'composition folding must prefer the longest known sequence');
assert.match(demoScript, /params\.get\('composition'\) === 'full'/, 'composition mode must load from the URL');
assert.match(demoScript, /params\.set\('composition', 'full'\)/, 'full composition mode must persist in the URL');
assert.match(demoScript, /formatCompositionReduction\(components\.length, 1\)/, 'condensed composition counts must use localized direction');
assert.match(demoScript, /startsWith\('ar'\).*numberingSystem: 'arab'/, 'Arabic UI numbers must use Arabic-Indic digits');
assert.match(demoScript, /dir === 'rtl'[\s\S]*formatUiNumber\(to\)}←\$\{formatUiNumber\(from\)/, 'RTL composition reductions must begin at the right and point left');
assert.match(demoStyles, /\[dir="rtl"\] \.emoji-composition-equation \{[\s\S]*direction: rtl;[\s\S]*justify-content: flex-start;/, 'RTL compositions must begin at the right and progress leftward');
assert.match(demoStyles, /\.emoji-composition-code-point \{ direction: ltr; unicode-bidi: isolate; \}/, 'individual code-point labels must retain LTR ordering');
assert.doesNotMatch(demoHtml, /class="emoji-code-points"/, 'code points must not be repeated in a metadata card');
assert.match(demoScript, /\.emoji-code-points'\)\?\.closest\('div'\)\?\.remove/, 'cached code-point metadata rows must be removed');
assert.match(demoScript, /explorer-preferences/, 'demo preferences must use a stable local-storage key');
assert.match(demoScript, /recordCopiedEmoji/, 'demo must retain recently copied emoji');
assert.match(demoScript, /if \(copied\) recordCopiedEmoji/, 'successful copy actions must update recently copied emoji');
assert.doesNotMatch(demoScript, /if \(copied\) addFavorite/, 'copy actions must not implicitly add favorites');
assert.match(demoScript, /dialogNavigationKeys/, 'saved emoji must retain their own dialog navigation context');
assert.match(demoScript, /\['favorites', 'help', 'language'\]\.includes/, 'utility dialogs must support direct URL panel state');
assert.match(demoScript, /panelDialogEntry/, 'utility dialogs must participate in browser history');
assert.match(demoStyles, /content-visibility: auto/, 'large emoji sections must defer off-screen rendering when supported');
assert.deepEqual(browserEmoji, emojiByKey, 'browser bundle must contain every emoji value');
assert.deepEqual(allEmoji, emojiByKey, 'all export must contain every emoji value');
assert.match(allTypes, /declare const emoji: typeof \S+ & typeof \S+/, 'all merger must preserve the types of its imported category packs');
assert.match(activitiesTypes, /\*\* artist palette 🎨 \*\//, 'emoji declarations must document the emoji glyph');
assert.ok(Object.keys(popularEmoji).length > 0, 'popular export must not be empty');
assert.ok(Object.keys(popularEmoji).every(key => key in emojiByKey), 'popular export must only contain known keys');
assert.deepEqual(rootEmoji, popularEmoji, 'root export must resolve to the popular package export');
assert.deepEqual(require('@lewismoten/emoji/all'), allEmoji, 'CommonJS all export must resolve through package exports');
assert.deepEqual(require('@lewismoten/emoji/orders/manifest'), orderManifest, 'order manifest must resolve through package exports');
assert.deepEqual(require('@lewismoten/emoji/locales/manifest'), localeManifest, 'locale manifest must resolve through package exports');
assert.deepEqual(localeManifest.locales.map(locale => locale.locale), ['ar', 'en', 'en-GB', 'es', 'hi', 'zh'], 'only CLDR locale packs with annotations must be published');
for (const locale of localeManifest.locales) {
  const pack = require(`@lewismoten/emoji/locales/${locale.locale}`) as LocalePack;
  assert.equal(pack.locale, locale.locale, `${locale.locale} pack must identify its locale`);
  assert.ok(locale.label && locale.nativeLabel, `${locale.locale} manifest must provide English and native labels`);
  assert.equal(pack.label, locale.label, `${locale.locale} pack must provide its English label`);
  assert.equal(pack.nativeLabel, locale.nativeLabel, `${locale.locale} pack must provide its native label`);
  assert.equal(pack.rtl, locale.rtl, `${locale.locale} pack must provide its text direction`);
  assert.equal(pack.cldrVersion, locale.cldrVersion, `${locale.locale} pack must identify its CLDR version`);
  assert.equal(pack.baseLocale, locale.baseLocale, `${locale.locale} pack must identify its base locale`);
  assert.equal(Object.keys(pack.annotations).length, locale.count, `${locale.locale} annotation count must match its manifest`);
  assert.equal(Object.keys(pack.labels).length, locale.characterLabelCount, `${locale.locale} character-label count must match its manifest`);
  assert.equal(Object.keys(pack.subgroups).length, locale.subgroupLabelCount, `${locale.locale} custom subgroup-label count must match its manifest`);
  assert.ok(locale.count > 0 || locale.characterLabelCount > 0, `${locale.locale} packs without locale-specific data must be omitted`);
  if (!locale.baseLocale) assert.ok(locale.characterLabelCount > 0, `${locale.locale} base packs must include localized character labels`);
  assert.ok(Object.keys(pack.annotations).every(key => key in emojiByKey), `${locale.locale} annotations must only reference known emoji`);
}
const { createEmojiSearch, mergeEmojiLocalePacks } = await import('@lewismoten/emoji/search');
const searchEnglish = createEmojiSearch(require('@lewismoten/emoji/locales/en') as LocalePack);
assert.ok(searchEnglish('artist palette').includes('artistPalette'), 'search must find CLDR short names');
assert.ok(searchEnglish('painting').includes('artistPalette'), 'search must find CLDR keywords');
for (const locale of localeManifest.locales.filter(locale => locale.baseLocale)) {
  const base = require(`@lewismoten/emoji/locales/${locale.baseLocale}`) as LocalePack;
  const regional = require(`@lewismoten/emoji/locales/${locale.locale}`) as LocalePack;
  const merged = mergeEmojiLocalePacks(base, regional);
  assert.equal(Object.keys(merged.annotations).length, locale.totalCount, `${locale.locale} must merge with its base locale`);
  assert.equal(Object.keys(merged.labels ?? {}).length, locale.totalCharacterLabelCount, `${locale.locale} character labels must merge with its base locale`);
}
assert.equal(packageManifest.name, '@lewismoten/emoji', 'package manifest must identify this package');
assert.equal(packageManifest.packs.find(pack => pack.id === 'all')?.count, emoji.length, 'all pack count must match emoji data');
assert.equal(packageManifest.categories.length, new Set(emoji.map(item => item.group)).size, 'package manifest must list every Unicode category');
for (const category of packageManifest.categories) {
  assert.equal(category.importPath, `@lewismoten/emoji/categories/${category.id}`, `${category.label} must have a public import path`);
  assert.equal(category.count, emoji.filter(item => item.group === category.label).length, `${category.label} count must match emoji data`);
  assert.equal(category.subcategories.reduce((count, subcategory) => count + subcategory.count, 0), category.count, `${category.label} subcategories must account for every emoji`);
  const categoryEmoji = await importPackageDefault(category.importPath);
  assert.equal(Object.keys(categoryEmoji).length, category.count, `${category.label} export count must match its manifest`);
  for (const subcategory of category.subcategories) {
    assert.equal(subcategory.importPath, `@lewismoten/emoji/categories/${category.id}/${subcategory.id}`, `${subcategory.label} must have a public import path`);
    const subcategoryEmoji = await importPackageDefault(subcategory.importPath);
    assert.equal(Object.keys(subcategoryEmoji).length, subcategory.count, `${subcategory.label} export count must match its manifest`);
    assert.ok(Object.keys(subcategoryEmoji).every(key => key in categoryEmoji), `${subcategory.label} must belong to ${category.label}`);
  }
}
for (const variation of packageManifest.variations) {
  assert.equal(variation.importPath, `@lewismoten/emoji/variations/${variation.id}`, `${variation.id} must have a public import path`);
}

const versionKeys = new Set<string>();
for (const version of manifest.versions) {
  const keys = await readJson<string[]>(`versions/${version.file}`);
  assert.equal(keys.length, version.count, `Emoji ${version.version} count must match its manifest`);
  assert.equal(new Set(keys).size, keys.length, `Emoji ${version.version} keys must be unique`);
  for (const key of keys) {
    assert.ok(key in emojiByKey, `Emoji ${version.version} contains unknown key ${key}`);
    assert.ok(!versionKeys.has(key), `Emoji ${key} must be introduced by only one version`);
    versionKeys.add(key);
  }
}
assert.deepEqual(versionKeys, new Set(Object.keys(emojiByKey)), 'version files must account for every emoji');

const releasedCodePoints = new Set(emoji.map(item => item.codePoints));
for (const version of manifest.proposed ?? []) {
  assert.equal(version.status, 'draft', `Unicode ${version.version} must match its draft source data`);
  assert.equal(version.released, null, `Unicode ${version.version} must not have a release date`);
  const proposal = await readJson<{ count: number; emoji: Emoji[] }>(version.file);
  assert.equal(proposal.count, version.count, `Unicode ${version.version} proposed count must match its manifest`);
  assert.ok(proposal.emoji.every(item => !releasedCodePoints.has(item.codePoints)), 'proposed emoji must not be released emoji');
}

for (const variation of ['skin-tones', 'hair', 'families', 'all']) {
  const variationEmoji = await importPackageDefault(`@lewismoten/emoji/variations/${variation}`);
  assert.ok(Object.keys(variationEmoji).every(key => key in emojiByKey), `${variation} export must only contain known keys`);
}

for (const item of [emoji[0], emoji.at(Math.floor(emoji.length / 2)), emoji.at(-1)]) {
  assert.ok(item, 'individual lookup test items must exist');
  assert.equal(allEmoji[item.key], item.emoji, `${item.key} must be available from the all export`);
}

console.info(`Verified ${emoji.length.toLocaleString()} emoji, ${manifest.versions.length} Unicode version files, and package entry points.`);
