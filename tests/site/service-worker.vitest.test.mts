import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(process.cwd());
const read = (file: string) => fs.readFile(path.join(root, file), "utf8");
const readJson = async <T,>(file: string) => JSON.parse(await read(file)) as T;

describe("site/service-worker", () => {
  it("keeps precache and lazy-load behavior aligned with published assets", async () => {
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
      read("src/app/data/explorer-data-controller.ts"),
      read("scripts/generate-demo-pages.mjs"),
      read("src/explorer/pixel-editor-loader.ts"),
    ]);

    expect(serviceWorker).toMatch(
      new RegExp(
        `const CACHE_NAME = \\\`\\$\\{CACHE_PREFIX\\}${packageJson.version}-[a-f0-9]{12}\\\`;`,
      ),
    );
    expect(serviceWorker).toMatch(
      /const precacheCoreAssets = async(?:\s*\(\s*cache\s*\)|\s+cache)[\s\S]*batchSize = 12[\s\S]*Promise\.allSettled[\s\S]*cache\.add\(url\)[\s\S]*Precache asset unavailable[\s\S]*\.then\(precacheCoreAssets\)/,
    );
    expect(serviceWorker).not.toMatch(/cache\.addAll\(/);
    for (const asset of [
      "./offline.html",
      "./index.js",
      "./pixel-font/build/font/pixel-emoji.css",
      "./pixel-font/build/font/pixel-emoji.woff2",
    ]) {
      expect(serviceWorker.includes(`"${asset}"`)).toBe(true);
    }
    expect(
      serviceWorker.includes('"./explorer/category/category-rules.js"'),
    ).toBe(false);
    for (const asset of [
      "./index.ar.html",
      "./manifest.ar.webmanifest",
      "./versions/manifest.json",
      "./pixel-font/build/atlases.html",
      "./pixel-font/build/editor-manifest.json",
      "./locales/en.json",
      "./dist/esm/index.js",
    ]) {
      expect(serviceWorker.includes(`"${asset}"`)).toBe(false);
    }
    expect(
      serviceWorker.includes(`"./index.css?v=${packageJson.version}"`) &&
        serviceWorker.includes(
          `"./pixel-editor.css?v=${packageJson.version}"`,
        ) &&
        serviceWorker.includes(
          `"./pixel-font/build-retro-text/pixel-latin-retro.css"`,
        ),
    ).toBe(true);
    expect(
      serviceWorker.includes(`"./index.js"`) &&
        serviceWorker.includes(`"./pixel-editor.js?v=${packageJson.version}"`),
    ).toBe(true);
    expect(demoPageGenerator).toMatch(/pixel-editor\.js\?v=\$\{assetVersion\}/);
    expect(demoPageGenerator).toMatch(
      /pixel-editor\.css\?v=\$\{assetVersion\}/,
    );
    expect(pixelEditorLoader).toMatch(
      /Promise\.all\(\[[\s\S]*options\.loadStylesheet\(\)[\s\S]*options\.loadEditor\(\)/,
    );
    expect(catalogLoader).toMatch(/fetch\((["'])explorer\/catalog\.json\1\)/);
    expect(catalogLoader).toMatch(/pixel-font\/build\/explorer-manifest\.json/);
    expect(`${demoScript}\n${explorerDataController}`).not.toMatch(
      /fetch\('emoji\.json'\)|fetch\('orders\/manifest\.json'\)/,
    );
    expect(`${demoScript}\n${explorerDataController}`).toMatch(
      /if \(options\.developerModeEnabled\(\)\) await loadVersionData\(\)/,
    );
    expect(arabicDemo).toMatch(
      /<script defer src="\.\/index\.js" type="module"><\/script>/,
    );
    expect(serviceWorker).toMatch(
      /NETWORK_FIRST_PATHS[\s\S]*index\.js[\s\S]*index\.css[\s\S]*pixel-editor\.js[\s\S]*pixel-editor\.css[\s\S]*NETWORK_FIRST_PATHS\.has\(url\.pathname\)/,
    );
    expect(generatedDemoScript.length > 0).toBe(true);
  });
});
