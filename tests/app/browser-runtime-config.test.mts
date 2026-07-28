import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createBrowserRuntimeConfig as actualCreateBrowserRuntimeConfig } from "../../src/app/browser-runtime-config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const sourceText = await fs.readFile(
  path.join(root, "src/app/browser-runtime-config.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import { initializeBrowserRuntime } from "./browser-runtime.js";',
    'import { initializeBrowserRuntime } from "./browser-runtime-stub.mjs";',
  )
  .replace(/options: any/g, "options")
  .replace(/\.\.\.args: any\[\]/g, "...args");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "browser-runtime-config-test-"),
);
const moduleFile = path.join(tempDirectory, "browser-runtime-config.mjs");
const stubFile = path.join(tempDirectory, "browser-runtime-stub.mjs");

await fs.writeFile(
  stubFile,
  [
    "export let lastOptions;",
    "export function initializeBrowserRuntime(options) {",
    "  lastOptions = options;",
    "  return { initialized: true, options };",
    "}",
    "",
  ].join("\n"),
);
await fs.writeFile(moduleFile, transformedSource);

const module = await import(pathToFileURL(moduleFile).href);
const stub = await import(pathToFileURL(stubFile).href);

let currentEmojiKey = "wave";
let currentLoadId = 1;
let dialogValue = { id: "dialog" };
let languageDialogValue = { id: "language-dialog" };
let languageListValue = [{ code: "en", name: "English" }];
let languagePickerValue = { id: "picker" };
let languagePickerFlagValue = { id: "flag" };
let languagePickerLabelValue = { id: "label" };
let nextLoadId = 2;
let searchLocalesValue = [{ code: "en" }];
let selectedSearchLocaleValue = "en";
let suppressedPanelClosesValue = 0;
const syncUrlStateCalls: unknown[][] = [];

const options = {
  applyDialogUrlState: Symbol("applyDialogUrlState"),
  applyPixelArtworkClass: Symbol("applyPixelArtworkClass"),
  applyStandalonePixelArtwork: Symbol("applyStandalonePixelArtwork"),
  closePanelDialog: Symbol("closePanelDialog"),
  currentEmojiKey: () => currentEmojiKey,
  currentLoadId: () => currentLoadId,
  dialog: () => dialogValue,
  languageDialog: () => languageDialogValue,
  languageFlags: Symbol("languageFlags"),
  languageList: () => languageListValue,
  languagePicker: () => languagePickerValue,
  languagePickerFlag: () => languagePickerFlagValue,
  languagePickerLabel: () => languagePickerLabelValue,
  loadUiTranslations: Symbol("loadUiTranslations"),
  nextLoadId: () => nextLoadId,
  onPixelFontRevisionLoaded: Symbol("onPixelFontRevisionLoaded"),
  refreshLocalizedLabels: Symbol("refreshLocalizedLabels"),
  restoreDeveloperMode: Symbol("restoreDeveloperMode"),
  saveExplorerPreference: Symbol("saveExplorerPreference"),
  searchLocales: () => searchLocalesValue,
  selectedSearchLocale: () => selectedSearchLocaleValue,
  setApplyingUrlState: Symbol("setApplyingUrlState"),
  setSearchAnnotations: Symbol("setSearchAnnotations"),
  setSearchLabels: Symbol("setSearchLabels"),
  setSearchLocales: Symbol("setSearchLocales"),
  setSearchSubgroupLabels: Symbol("setSearchSubgroupLabels"),
  setSelectedLocale: Symbol("setSelectedLocale"),
  suppressedPanelCloses: () => suppressedPanelClosesValue,
  syncUrlState: (...args: unknown[]) => {
    syncUrlStateCalls.push(args);
    return "synced";
  },
  translate: Symbol("translate"),
  updateModifierArtwork: Symbol("updateModifierArtwork"),
  updatePixelArtworkManifest: Symbol("updatePixelArtworkManifest"),
  updateWebAppManifest: Symbol("updateWebAppManifest"),
};

const result = module.createBrowserRuntimeConfig(options);
const exportedCreateBrowserRuntimeConfig: typeof import("../../src/app/browser-runtime-config.js").createBrowserRuntimeConfig =
  module.createBrowserRuntimeConfig;
assert.equal(typeof exportedCreateBrowserRuntimeConfig, "function");
assert.equal(result.initialized, true);
assert.equal(result.options, stub.lastOptions);

assert.equal(stub.lastOptions.applyDialogUrlState, options.applyDialogUrlState);
assert.equal(
  stub.lastOptions.applyPixelArtworkClass,
  options.applyPixelArtworkClass,
);
assert.equal(
  stub.lastOptions.applyStandalonePixelArtwork,
  options.applyStandalonePixelArtwork,
);
assert.equal(stub.lastOptions.closePanelDialog, options.closePanelDialog);
assert.equal(stub.lastOptions.languageFlags, options.languageFlags);
assert.equal(stub.lastOptions.loadUiTranslations, options.loadUiTranslations);
assert.equal(
  stub.lastOptions.onPixelFontRevisionLoaded,
  options.onPixelFontRevisionLoaded,
);
assert.equal(
  stub.lastOptions.refreshLocalizedLabels,
  options.refreshLocalizedLabels,
);
assert.equal(
  stub.lastOptions.restoreDeveloperMode,
  options.restoreDeveloperMode,
);
assert.equal(
  stub.lastOptions.saveExplorerPreference,
  options.saveExplorerPreference,
);
assert.equal(stub.lastOptions.setApplyingUrlState, options.setApplyingUrlState);
assert.equal(stub.lastOptions.setSearchAnnotations, options.setSearchAnnotations);
assert.equal(stub.lastOptions.setSearchLabels, options.setSearchLabels);
assert.equal(stub.lastOptions.setSearchLocales, options.setSearchLocales);
assert.equal(
  stub.lastOptions.setSearchSubgroupLabels,
  options.setSearchSubgroupLabels,
);
assert.equal(stub.lastOptions.setSelectedLocale, options.setSelectedLocale);
assert.equal(stub.lastOptions.translate, options.translate);
assert.equal(
  stub.lastOptions.updateModifierArtwork,
  options.updateModifierArtwork,
);
assert.equal(
  stub.lastOptions.updatePixelArtworkManifest,
  options.updatePixelArtworkManifest,
);
assert.equal(stub.lastOptions.updateWebAppManifest, options.updateWebAppManifest);

assert.equal(stub.lastOptions.currentEmojiKey(), "wave");
assert.equal(stub.lastOptions.currentLoadId(), 1);
assert.equal(stub.lastOptions.dialog(), dialogValue);
assert.equal(stub.lastOptions.languageDialog(), languageDialogValue);
assert.equal(stub.lastOptions.languageList(), languageListValue);
assert.equal(stub.lastOptions.languagePicker(), languagePickerValue);
assert.equal(stub.lastOptions.languagePickerFlag(), languagePickerFlagValue);
assert.equal(stub.lastOptions.languagePickerLabel(), languagePickerLabelValue);
assert.equal(stub.lastOptions.nextLoadId(), 2);
assert.equal(stub.lastOptions.searchLocales(), searchLocalesValue);
assert.equal(stub.lastOptions.selectedSearchLocale(), "en");
assert.equal(stub.lastOptions.suppressedPanelCloses(), 0);
assert.equal(stub.lastOptions.syncUrlState("a", "b"), "synced");
assert.deepEqual(syncUrlStateCalls, [["a", "b"]]);

currentEmojiKey = "grin";
currentLoadId = 4;
dialogValue = { id: "dialog-2" };
languageDialogValue = { id: "language-dialog-2" };
languageListValue = [{ code: "ar", name: "Arabic" }];
languagePickerValue = { id: "picker-2" };
languagePickerFlagValue = { id: "flag-2" };
languagePickerLabelValue = { id: "label-2" };
nextLoadId = 5;
searchLocalesValue = [{ code: "ar" }];
selectedSearchLocaleValue = "ar";
suppressedPanelClosesValue = 3;

assert.equal(stub.lastOptions.currentEmojiKey(), "grin");
assert.equal(stub.lastOptions.currentLoadId(), 4);
assert.deepEqual(stub.lastOptions.dialog(), { id: "dialog-2" });
assert.deepEqual(stub.lastOptions.languageDialog(), { id: "language-dialog-2" });
assert.deepEqual(stub.lastOptions.languageList(), [{ code: "ar", name: "Arabic" }]);
assert.deepEqual(stub.lastOptions.languagePicker(), { id: "picker-2" });
assert.deepEqual(stub.lastOptions.languagePickerFlag(), { id: "flag-2" });
assert.deepEqual(stub.lastOptions.languagePickerLabel(), { id: "label-2" });
assert.equal(stub.lastOptions.nextLoadId(), 5);
assert.deepEqual(stub.lastOptions.searchLocales(), [{ code: "ar" }]);
assert.equal(stub.lastOptions.selectedSearchLocale(), "ar");
assert.equal(stub.lastOptions.suppressedPanelCloses(), 3);

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
const windowEvents: Record<string, (...args: unknown[]) => unknown> = {};
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    addEventListener(type: string, handler: (...args: unknown[]) => unknown) {
      windowEvents[type] = handler;
    },
  },
});
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: {},
});
try {
  const actualResult = actualCreateBrowserRuntimeConfig(options);
  assert.equal(typeof actualResult.load, "function");
  assert.equal(typeof actualResult.render, "function");
  assert.equal(typeof actualResult.select, "function");
  assert.equal(typeof actualResult.set, "function");
  assert.equal(typeof actualResult.onPopState, "function");
  assert.equal(typeof windowEvents.popstate, "function");
} finally {
  if (originalWindowDescriptor)
    Object.defineProperty(globalThis, "window", originalWindowDescriptor);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalNavigatorDescriptor)
    Object.defineProperty(globalThis, "navigator", originalNavigatorDescriptor);
  else Reflect.deleteProperty(globalThis, "navigator");
}
