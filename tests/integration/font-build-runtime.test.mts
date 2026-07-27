import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  catalogLoader,
  demoHtml,
  demoStyles,
  pixelFontHotReload,
  root,
  viteConfig
} from '../shared/unit-fixtures.mjs';

const pixelEditorRuntimeController = await fs.readFile(
  path.join(root, 'src/pixel-editor/controllers/pixel-editor-runtime.js'),
  'utf8'
);
const pixelEditorCanvasHelpers = await fs.readFile(
  path.join(root, 'src/pixel-editor/pixel-editor-canvas-helpers.js'),
  'utf8'
);
const pixelEditorFontRefreshSource = `${pixelEditorRuntimeController}\n${pixelEditorCanvasHelpers}`;

assert.match(
  demoStyles,
  /--emoji-font:[\s\S]*--pixel-emoji-proposed-family[\s\S]*--pixel-emoji-released-family/,
  'the demo must use proposed, released, and system emoji as a fall-forward stack'
);
assert.match(
  viteConfig,
  /ignored: \['\*\*\/pixel-font\/build\/\*\*'\][\s\S]*server\.watcher\.add\(pixelFontRevision\)[\s\S]*pixel-font:updated[\s\S]*Cache-Control', 'no-store'/,
  'Vite must refresh completed pixel fonts without reloading the page'
);
assert.doesNotMatch(
  viteConfig,
  /type: 'full-reload'/,
  'pixel-font builds must not discard in-memory editor permissions'
);
assert.match(
  demoHtml,
  /id="pixel-font-stylesheet"[^>]*pixel-font\/build\/font\/pixel-emoji\.css\?v=[^"]+[^>]*data-font-revision="/,
  'the pixel font must use a reloadable standalone stylesheet'
);
assert.ok(
  pixelFontHotReload.includes('import.meta.hot.on') &&
    pixelFontHotReload.includes('pixel-font/font-build.revision') &&
    pixelFontHotReload.includes('refreshInFlight') &&
    pixelFontHotReload.includes('document.hidden') &&
    pixelFontHotReload.includes('window.setInterval(refresh, 5000)') &&
    pixelFontHotReload.includes('function refreshPixelFontStylesheet') &&
    pixelFontHotReload.includes("replacement.addEventListener('load'") &&
    pixelFontHotReload.includes('async function runPixelFontJobs'),
  'the demo must watch and hot-swap rebuilt pixel font assets without repainting everything in one tight polling loop'
);
assert.match(
  await fs.readFile(path.join(root, 'src/app/browser-runtime.ts'), 'utf8'),
  /onPixelFontRevisionLoaded\(\);[\s\S]*refreshExplorerPixelFont\(/,
  'the demo must hot-swap rebuilt pixel fonts without refreshing the page'
);
assert.match(
  `${catalogLoader}\n${pixelFontHotReload}`,
  /pixelFontManifestUrl = options\.isViteDevelopment[\s\S]*explorer-manifest\.json\?v=\$\{Date\.now\(\)\}[\s\S]*pixelFontRevision[\s\S]*explorer-manifest\.json\?v=\$\{pixelFontRevision\}[\s\S]*font-build\.revision[\s\S]*cache: 'no-store'/,
  'pixel font metadata loads must bypass stale development and production cache data'
);
assert.match(
  pixelFontHotReload,
  /export async function refreshExplorerPixelFont[\s\S]*build\/manifest\.json[\s\S]*options\.updateManifest\(await response\.json\(\), revision\)[\s\S]*querySelectorAll\('\[data-emoji-key\]'\)[\s\S]*options\.applyArtwork/,
  'rebuilt fonts must update existing Emoji Explorer result glyphs'
);
assert.ok(
  pixelEditorFontRefreshSource.includes('async function refreshFontBuild()') &&
    pixelEditorFontRefreshSource.includes('loadManifest(true)') &&
    pixelEditorFontRefreshSource.includes('const bypassCache = refresh || isViteDevelopment;') &&
    pixelEditorFontRefreshSource.includes('currentEntry().releaseStatus === "proposed"') &&
    pixelEditorFontRefreshSource.includes('--pixel-emoji-proposed-family') &&
    pixelEditorFontRefreshSource.includes('--pixel-emoji-released-family'),
  'the open pixel editor must reload build metadata and use the rebuilt font family'
);
