import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const read = (file: string) => fs.readFile(path.join(root, file), "utf8");
const readJson = async <T,>(file: string) => JSON.parse(await read(file)) as T;
const packageJson = await readJson<{ version: string }>("package.json");
const [
  serviceWorker,
  generatedDemoScript,
  arabicDemo,
  demoScript,
  catalogLoader,
  explorerDataController,
  demoPageGenerator,
  pixelEditorLoader,
] = await Promise.all([
  read("build/demo-pages/service-worker.js"),
  read("build/demo-pages/index.js"),
  read("build/demo-pages/index.ar.html"),
  read("src/index.ts"),
  read("src/explorer/catalog-loader.ts"),
  read("src/explorer-data-controller.ts"),
  read("scripts/generate-demo-pages.mjs"),
  read("src/explorer/pixel-editor-loader.ts"),
]);

assert.match(
  serviceWorker,
  new RegExp(
    `const CACHE_NAME = \\\`\\$\\{CACHE_PREFIX\\}${packageJson.version}-[a-f0-9]{12}\\\`;`,
  ),
  "service-worker cache must use the package version and an asset revision",
);
assert.match(
  serviceWorker,
  /const precacheCoreAssets = async(?:\s*\(\s*cache\s*\)|\s+cache)[\s\S]*batchSize = 12[\s\S]*Promise\.allSettled[\s\S]*cache\.add\(url\)[\s\S]*Precache asset unavailable[\s\S]*\.then\(precacheCoreAssets\)/,
  "one unavailable precache asset must not prevent the service worker from installing",
);
assert.doesNotMatch(
  serviceWorker,
  /cache\.addAll\(/,
  "service-worker installation must not use an all-or-nothing precache transaction",
);
for (const asset of [
  "./offline.html",
  "./explorer/category-rules.js",
  "./explorer/explorer-labels.js",
  "./pixel-font/build/font/pixel-emoji.css",
  "./pixel-font/build/font/pixel-emoji.woff2",
]) {
  assert.ok(
    serviceWorker.includes(`"${asset}"`),
    `service worker must precache ${asset}`,
  );
}
for (const asset of [
  "./index.ar.html",
  "./manifest.ar.webmanifest",
  "./versions/manifest.json",
  "./pixel-font/build/atlases.html",
  "./pixel-font/build/editor-manifest.json",
  "./locales/en.json",
  "./dist/esm/index.js",
]) {
  assert.ok(
    !serviceWorker.includes(`"${asset}"`),
    `service worker must load ${asset} on demand`,
  );
}
assert.ok(
  serviceWorker.includes(`"./explorer/themes/dark.css?v=${packageJson.version}"`) &&
    serviceWorker.includes(`"./explorer/themes/light/light.css?v=${packageJson.version}"`) &&
    serviceWorker.includes(`"./explorer/themes/ega.css?v=${packageJson.version}"`) &&
    serviceWorker.includes(
      `./explorer/themes/retro/retro.css?v=${packageJson.version}`,
    ) &&
    serviceWorker.includes(
      `./explorer/themes/retro/retro-foundation.css?v=${packageJson.version}`,
    ) &&
    serviceWorker.includes(
      `./explorer/themes/retro/retro-dialogs.css?v=${packageJson.version}`,
    ) &&
    serviceWorker.includes(
      `./explorer/themes/retro/retro-buttons.css?v=${packageJson.version}`,
    ) &&
    serviceWorker.includes(
      `./explorer/themes/retro/retro-forms.css?v=${packageJson.version}`,
    ) &&
    serviceWorker.includes(
      `./explorer/themes/retro/retro-focus.css?v=${packageJson.version}`,
    ) &&
    serviceWorker.includes(
      `./explorer/toolbar-controls.css?v=${packageJson.version}`,
    ) &&
    serviceWorker.includes(
      `./explorer/dialog-controls.css?v=${packageJson.version}`,
    ) &&
    serviceWorker.includes(`"./explorer/index.css?v=${packageJson.version}"`),
  "service worker must precache the versioned explorer stylesheets",
);
assert.ok(
  serviceWorker.includes(`"./index.js?v=${packageJson.version}"`) &&
    !serviceWorker.includes(`"./pixel-editor.js?v=${packageJson.version}"`),
  "service worker must precache only the versioned application entry script",
);
assert.match(
  demoPageGenerator,
  /pixel-editor\.js\?v=\$\{assetVersion\}/,
  "the demo-page generator must rewrite pixel-editor imports to a versioned lazy load",
);
assert.match(
  demoPageGenerator,
  /explorer\/pixel-editor\.css\?v=\$\{assetVersion\}/,
  "the demo-page generator must rewrite pixel-editor stylesheet loads with a versioned URL",
);
assert.match(
  pixelEditorLoader,
  /Promise\.all\(\[[\s\S]*options\.loadStylesheet\(\)[\s\S]*options\.loadEditor\(\)/,
  "the Explorer must lazy-load the pixel editor through its loader module",
);
assert.match(
  catalogLoader,
  /fetch\((["'])explorer\/catalog\.json\1\)/,
  "the Explorer must load its compact runtime catalog",
);
assert.match(
  catalogLoader,
  /pixel-font\/build\/explorer-manifest\.json/,
  "the Explorer must load compact pixel-font metadata",
);
assert.doesNotMatch(
  `${demoScript}\n${explorerDataController}`,
  /fetch\('emoji\.json'\)|fetch\('orders\/manifest\.json'\)/,
  "the Explorer must not download duplicate public emoji or ordering data",
);
assert.match(
  `${demoScript}\n${explorerDataController}`,
  /if \(options\.developerModeEnabled\(\)\) await loadVersionData\(\)/,
  "release datasets must load on demand for developer mode",
);
assert.match(
  arabicDemo,
  new RegExp(`src="\\./index\\.js\\?v=${packageJson.version}"`),
  "localized pages must load the versioned application entry point",
);
assert.match(
  serviceWorker,
  /NETWORK_FIRST_PATHS[\s\S]*index\.js[\s\S]*explorer\/themes\/dark\.css[\s\S]*explorer\/themes\/light\/light\.css[\s\S]*explorer\/themes\/ega\.css[\s\S]*explorer\/themes\/retro\/retro\.css[\s\S]*explorer\/themes\/retro\/retro-foundation\.css[\s\S]*explorer\/themes\/retro\/retro-dialogs\.css[\s\S]*explorer\/themes\/retro\/retro-buttons\.css[\s\S]*explorer\/themes\/retro\/retro-forms\.css[\s\S]*explorer\/themes\/retro\/retro-focus\.css[\s\S]*explorer\/toolbar-controls\.css[\s\S]*explorer\/dialog-controls\.css[\s\S]*pixel-editor\.js[\s\S]*explorer\/index\.css[\s\S]*explorer\/pixel-editor\.css[\s\S]*NETWORK_FIRST_PATHS\.has\(url\.pathname\)/,
  "application shell assets must refresh from the network before using an offline cache",
);
