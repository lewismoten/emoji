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
const [serviceWorker, generatedDemoScript, arabicDemo, demoScript] =
  await Promise.all([
    read("build/demo-pages/service-worker.js"),
    read("build/demo-pages/index.js"),
    read("build/demo-pages/index.ar.html"),
    read("src/index.ts"),
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
  /const precacheCoreAssets = async cache[\s\S]*batchSize = 12[\s\S]*Promise\.allSettled[\s\S]*cache\.add\(url\)[\s\S]*Precache asset unavailable[\s\S]*\.then\(precacheCoreAssets\)/,
  "one unavailable precache asset must not prevent the service worker from installing",
);
assert.doesNotMatch(
  serviceWorker,
  /cache\.addAll\(/,
  "service-worker installation must not use an all-or-nothing precache transaction",
);
for (const asset of [
  "./offline.html",
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
  "./emoji.json",
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
  serviceWorker.includes(`"./explorer/index.css?v=${packageJson.version}"`),
  "service worker must precache the versioned core stylesheet",
);
assert.ok(
  serviceWorker.includes(`"./index.js?v=${packageJson.version}"`) &&
    !serviceWorker.includes(`"./pixel-editor.js?v=${packageJson.version}"`),
  "service worker must precache only the versioned application entry script",
);
assert.match(
  generatedDemoScript,
  new RegExp(`import\\('./pixel-editor\\.js\\?v=${packageJson.version}'\\)`),
  "the deployed entry module must lazy-load a versioned pixel editor",
);
assert.match(
  generatedDemoScript,
  new RegExp(`'\\./explorer/pixel-editor\\.css\\?v=${packageJson.version}'`),
  "the deployed entry module must lazy-load versioned pixel-editor styles",
);
assert.match(
  demoScript,
  /fetch\('explorer\/catalog\.json'\)/,
  "the Explorer must load its compact runtime catalog",
);
assert.match(
  demoScript,
  /pixel-font\/build\/explorer-manifest\.json/,
  "the Explorer must load compact pixel-font metadata",
);
assert.doesNotMatch(
  demoScript,
  /fetch\('emoji\.json'\)|fetch\('orders\/manifest\.json'\)/,
  "the Explorer must not download duplicate public emoji or ordering data",
);
assert.match(
  demoScript,
  /if \(developerModeEnabled\(\)\) await loadVersionData\(\)/,
  "release datasets must load on demand for developer mode",
);
assert.match(
  arabicDemo,
  new RegExp(`src="\\./index\\.js\\?v=${packageJson.version}"`),
  "localized pages must load the versioned application entry point",
);
assert.match(
  serviceWorker,
  /NETWORK_FIRST_PATHS[\s\S]*index\.js[\s\S]*pixel-editor\.js[\s\S]*explorer\/index\.css[\s\S]*explorer\/pixel-editor\.css[\s\S]*NETWORK_FIRST_PATHS\.has\(url\.pathname\)/,
  "application shell assets must refresh from the network before using an offline cache",
);
