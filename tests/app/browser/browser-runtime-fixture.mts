import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function createBrowserRuntimeFixture() {
  const root = process.cwd();
  const sourceText = await fs.readFile(
    path.join(root, "src/app/browser/browser-runtime.ts"),
    "utf8",
  );

  const transformedSource = sourceText
    .replace(
      /import\s+\{\s*createSearchLanguageLifecycle\s*\}\s+from\s+"..\/..\/explorer\/language\/search-language-lifecycle\.js";/,
      'import { createSearchLanguageLifecycle } from "./search-language-lifecycle-stub.mjs";',
    )
    .replace(
      /import\s+\{\s*openPanelDialog\s*\}\s+from\s+"..\/..\/explorer\/pwa\/pwa-panels\.js";/,
      'import { openPanelDialog } from "./pwa-panels-stub.mjs";',
    )
    .replace(
      /import\s+\{\s*installPixelFontHotReload,\s*refreshExplorerPixelFont,\s*refreshPixelFontStylesheet,\s*\}\s+from\s+"..\/..\/pixel-font-hot-reload\.js";/,
      'import { installPixelFontHotReload, refreshExplorerPixelFont, refreshPixelFontStylesheet } from "./pixel-font-hot-reload-stub.mjs";',
    )
    .replace(
      'import * as route from "../route.js";',
      'import * as route from "./route-stub.mjs";',
    )
    .replace(
      /export function createUiFormatters\(options: \{[\s\S]*?\}\) \{/,
      "export function createUiFormatters(options) {",
    )
    .replace(
      /export function bindServiceWorkerRuntime\(options: \{[\s\S]*?\}\) \{/,
      "export function bindServiceWorkerRuntime(options) {",
    )
    .replace(
      /export function restoreLanguageParentPanel\(\s*options: \{[\s\S]*?\},\s*openPanel = openPanelDialog,\s*\) \{/,
      "export function restoreLanguageParentPanel(options, openPanel = openPanelDialog) {",
    )
    .replace(
      /const isViteDevelopment =[\s\S]*?import\.meta\.env\.DEV === true;/,
      "const isViteDevelopment = globalThis.__TEST_VITE_DEV__ === true;",
    )
    .replace(/options: any/g, "options")
    .replace(/registration: ServiceWorkerRegistration/g, "registration")
    .replace(/name: string/g, "name")
    .replace(/value: number/g, "value")
    .replace(
      /locale\?: string,\n\s+numberingSystem\?: string,\n\s+\) => string;/g,
      "locale, numberingSystem) => string;",
    )
    .replace(/\(revision: string\)/g, "(revision)")
    .replace(/\(loadedRevision: string\)/g, "(loadedRevision)")
    .replace(/!\./g, ".")
    .replace(/!\(/g, "(");

  const tempRoot = path.join(root, "build/tests/.tmp");
  await fs.mkdir(tempRoot, { recursive: true });
  const tempDirectory = await fs.mkdtemp(
    path.join(tempRoot, "browser-runtime-test-"),
  );

  const writeStub = async (filename: string, lines: string[]) => {
    await fs.writeFile(
      path.join(tempDirectory, filename),
      `${lines.join("\n")}\n`,
    );
  };

  await writeStub("search-language-lifecycle-stub.mjs", [
    "export let lifecycleOptions;",
    "export let popstateHandler = () => {};",
    "export function createSearchLanguageLifecycle(options) {",
    "  lifecycleOptions = options;",
    "  return { kind: 'search-language-lifecycle', onPopState: (...args) => popstateHandler(...args) };",
    "}",
  ]);
  await writeStub("pwa-panels-stub.mjs", [
    "export const openPanelDialogCalls = [];",
    "export function openPanelDialog(options) {",
    "  openPanelDialogCalls.push(options);",
    "}",
  ]);
  await writeStub("pixel-font-hot-reload-stub.mjs", [
    "export let hotReloadOptions;",
    "export const refreshStylesheetCalls = [];",
    "export const refreshExplorerCalls = [];",
    "export function installPixelFontHotReload(options) { hotReloadOptions = options; }",
    "export function refreshPixelFontStylesheet(options, revision) {",
    "  refreshStylesheetCalls.push({ options, revision });",
    "  options.onStylesheetLoaded(`${revision}-loaded`);",
    "  return Promise.resolve();",
    "}",
    "export function refreshExplorerPixelFont(options, revision) {",
    "  refreshExplorerCalls.push({ options, revision });",
    "  return Promise.resolve();",
    "}",
  ]);
  await writeStub("route-stub.mjs", [
    "export const getOrigin = () => 'https://emoji.example';",
    "export const isLocalPreview = () => false;",
  ]);

  const moduleFile = path.join(tempDirectory, "browser-runtime.mjs");
  await fs.writeFile(moduleFile, transformedSource);

  return {
    module: await import(pathToFileURL(moduleFile).href),
    lifecycleStub: await import(
      pathToFileURL(
        path.join(tempDirectory, "search-language-lifecycle-stub.mjs"),
      ).href
    ),
    panelStub: await import(
      pathToFileURL(path.join(tempDirectory, "pwa-panels-stub.mjs")).href
    ),
    pixelFontStub: await import(
      pathToFileURL(path.join(tempDirectory, "pixel-font-hot-reload-stub.mjs"))
        .href
    ),
  };
}
