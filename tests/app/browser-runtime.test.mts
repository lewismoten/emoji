import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const sourceText = await fs.readFile(
  path.join(root, "src/app/browser-runtime.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import { createSearchLanguageLifecycle } from "../explorer/language/search-language-lifecycle.js";',
    'import { createSearchLanguageLifecycle } from "./search-language-lifecycle-stub.mjs";',
  )
  .replace(
    'import { openPanelDialog } from "../explorer/pwa-panels.js";',
    'import { openPanelDialog } from "./pwa-panels-stub.mjs";',
  )
  .replace(
    'import {\n  installPixelFontHotReload,\n  refreshExplorerPixelFont,\n  refreshPixelFontStylesheet,\n} from "../pixel-font-hot-reload.js";',
    'import {\n  installPixelFontHotReload,\n  refreshExplorerPixelFont,\n  refreshPixelFontStylesheet,\n} from "./pixel-font-hot-reload-stub.mjs";',
  )
  .replace(
    /export function createUiFormatters\(options: \{[\s\S]*?\}\) \{/,
    "export function createUiFormatters(options) {",
  )
  .replace(
    /const isViteDevelopment =[\s\S]*?import\.meta\.env\.DEV === true;/,
    'const isViteDevelopment = globalThis.__TEST_VITE_DEV__ === true;',
  )
  .replace(/options: any/g, "options")
  .replace(/registration: ServiceWorkerRegistration/g, "registration")
  .replace(/name: string/g, "name")
  .replace(/value: number/g, "value")
  .replace(/locale\?: string,\n\s+numberingSystem\?: string,\n\s+\) => string;/g, "locale, numberingSystem) => string;")
  .replace(/\(revision: string\)/g, "(revision)")
  .replace(/\(loadedRevision: string\)/g, "(loadedRevision)");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "browser-runtime-test-"),
);
const moduleFile = path.join(tempDirectory, "browser-runtime.mjs");
const lifecycleStubFile = path.join(
  tempDirectory,
  "search-language-lifecycle-stub.mjs",
);
const panelStubFile = path.join(tempDirectory, "pwa-panels-stub.mjs");
const pixelFontStubFile = path.join(
  tempDirectory,
  "pixel-font-hot-reload-stub.mjs",
);

await fs.writeFile(
  lifecycleStubFile,
  [
    "export let lifecycleOptions;",
    "export let popstateHandler = () => {};",
    "export function createSearchLanguageLifecycle(options) {",
    "  lifecycleOptions = options;",
    "  return {",
    "    kind: 'search-language-lifecycle',",
    "    onPopState: (...args) => popstateHandler(...args),",
    "  };",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(
  panelStubFile,
  [
    "export const openPanelDialogCalls = [];",
    "export function openPanelDialog(options) {",
    "  openPanelDialogCalls.push(options);",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(
  pixelFontStubFile,
  [
    "export let hotReloadOptions;",
    "export const refreshStylesheetCalls = [];",
    "export const refreshExplorerCalls = [];",
    "export function installPixelFontHotReload(options) {",
    "  hotReloadOptions = options;",
    "}",
    "export function refreshPixelFontStylesheet(options, revision) {",
    "  refreshStylesheetCalls.push({ options, revision });",
    "  options.onStylesheetLoaded(`${revision}-loaded`);",
    "  return Promise.resolve();",
    "}",
    "export function refreshExplorerPixelFont(options, revision) {",
    "  refreshExplorerCalls.push({ options, revision });",
    "  return Promise.resolve();",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(moduleFile, transformedSource);

const browserRuntimeModule = await import(pathToFileURL(moduleFile).href);
const lifecycleStub = await import(pathToFileURL(lifecycleStubFile).href);
const panelStub = await import(pathToFileURL(panelStubFile).href);
const pixelFontStub = await import(pathToFileURL(pixelFontStubFile).href);

const { createUiFormatters, initializeBrowserRuntime } = browserRuntimeModule;
const exportedCreateUiFormatters: typeof import("../../src/app/browser-runtime.js").createUiFormatters =
  createUiFormatters;
const exportedInitializeBrowserRuntime: typeof import("../../src/app/browser-runtime.js").initializeBrowserRuntime =
  initializeBrowserRuntime;
assert.equal(typeof exportedCreateUiFormatters, "function");
assert.equal(typeof exportedInitializeBrowserRuntime, "function");

const formatterCalls: Array<{
  type: "number" | "percent";
  value: number;
  locale: string | undefined;
  numberingSystem: string | undefined;
}> = [];

const englishDocument = { documentElement: { lang: "en-US" } };
const arabicDocument = { documentElement: { lang: "ar" } };
const emptyDocument = { documentElement: { lang: "" } };

const englishFormatters = createUiFormatters({
  document: englishDocument,
  selectedSearchLocale: () => "fr",
  formatNumber: (value: number, locale?: string, numberingSystem?: string) => {
    formatterCalls.push({
      type: "number",
      value,
      locale,
      numberingSystem,
    });
    return `n:${value}:${locale ?? ""}:${numberingSystem ?? ""}`;
  },
  formatPercent: (
    value: number,
    locale?: string,
    numberingSystem?: string,
  ) => {
    formatterCalls.push({
      type: "percent",
      value,
      locale,
      numberingSystem,
    });
    return `p:${value}:${locale ?? ""}:${numberingSystem ?? ""}`;
  },
});

assert.equal(englishFormatters.formatUiNumber(42), "n:42:en-US:");
assert.equal(englishFormatters.formatUiPercent(75), "p:75:en-US:");

const arabicFormatters = createUiFormatters({
  document: arabicDocument,
  selectedSearchLocale: () => "en",
  formatNumber: (value: number, locale?: string, numberingSystem?: string) =>
    `n:${value}:${locale ?? ""}:${numberingSystem ?? ""}`,
  formatPercent: (
    value: number,
    locale?: string,
    numberingSystem?: string,
  ) => `p:${value}:${locale ?? ""}:${numberingSystem ?? ""}`,
});
assert.equal(arabicFormatters.formatUiNumber(7), "n:7:ar:arab");
assert.equal(arabicFormatters.formatUiPercent(88), "p:88:ar:arab");

const fallbackFormatters = createUiFormatters({
  document: emptyDocument,
  selectedSearchLocale: () => "ar-EG",
  formatNumber: (value: number, locale?: string, numberingSystem?: string) =>
    `n:${value}:${locale ?? ""}:${numberingSystem ?? ""}`,
  formatPercent: (
    value: number,
    locale?: string,
    numberingSystem?: string,
  ) => `p:${value}:${locale ?? ""}:${numberingSystem ?? ""}`,
});
assert.equal(fallbackFormatters.formatUiNumber(3), "n:3:ar-EG:arab");
assert.equal(fallbackFormatters.formatUiPercent(5), "p:5:ar-EG:arab");

assert.deepEqual(formatterCalls, [
  { type: "number", value: 42, locale: "en-US", numberingSystem: undefined },
  { type: "percent", value: 75, locale: "en-US", numberingSystem: undefined },
]);

const originalWindow = (globalThis as any).window;
const originalNavigator = (globalThis as any).navigator;
const originalCaches = (globalThis as any).caches;
const originalDocument = (globalThis as any).document;
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
const originalCachesDescriptor = Object.getOwnPropertyDescriptor(globalThis, "caches");
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document");

const serviceWorkerEvents: Record<string, () => unknown> = {};
const registeredEvents: Record<string, () => unknown> = {};
const warnings: unknown[][] = [];
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  warnings.push(args);
};

const registrations = [
  {
    scope: "https://emoji.example/app/",
    unregisterCalls: 0,
    unregister() {
      this.unregisterCalls += 1;
      return Promise.resolve(true);
    },
  },
  {
    scope: "https://other.example/app/",
    unregisterCalls: 0,
    unregister() {
      this.unregisterCalls += 1;
      return Promise.resolve(true);
    },
  },
];

const deletedCaches: string[] = [];
const registeredServiceWorkers: string[] = [];

const sharedWindow = {
  isSecureContext: true,
  location: { origin: "https://emoji.example" },
  addEventListener(type: string, handler: () => unknown) {
    registeredEvents[type] = handler;
  },
};

const sharedNavigator = {
  serviceWorker: {
    getRegistrations: async () => registrations,
    register: async (url: string) => {
      registeredServiceWorkers.push(url);
      return { scope: url };
    },
  },
};

const sharedCaches = {
  keys: async () => ["emoji-explorer-v1", "other-cache"],
  delete: async (name: string) => {
    deletedCaches.push(name);
    return true;
  },
};

const helpDialog = { id: "help-dialog" };
const savedDialog = { id: "saved-dialog" };
const ownerDocument = {
  querySelector(selector: string) {
    if (selector === "#help-dialog") return helpDialog;
    if (selector === "#saved-dialog") return savedDialog;
    return null;
  },
};
const languageDialog = {
  dataset: { returnPanel: "help" },
  ownerDocument,
};

let currentEmojiKey = "wave";
let currentLoadId = 4;
let nextLoadId = 5;
let languageList = [{ code: "en" }];
let searchLocales = [{ code: "en" }];
let selectedSearchLocale = "en";
let suppressedPanelCloses = 2;
let dialog = { id: "emoji-dialog" };
let languagePicker = { id: "language-picker" };
let languagePickerFlag = { id: "language-picker-flag" };
let languagePickerLabel = { id: "language-picker-label" };
let onPixelFontRevisionLoadedCalls = 0;
const closePanelCalls: unknown[][] = [];
const syncUrlCalls: unknown[][] = [];

Object.defineProperty(globalThis, "window", {
  configurable: true,
  writable: true,
  value: sharedWindow,
});
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  writable: true,
  value: sharedNavigator,
});
Object.defineProperty(globalThis, "caches", {
  configurable: true,
  writable: true,
  value: sharedCaches,
});
Object.defineProperty(globalThis, "document", {
  configurable: true,
  writable: true,
  value: { documentElement: { dir: "ltr" } },
});
(globalThis as any).__TEST_VITE_DEV__ = true;

const runtime = initializeBrowserRuntime({
  applyDialogUrlState: Symbol("applyDialogUrlState"),
  applyPixelArtworkClass: Symbol("applyPixelArtworkClass"),
  applyStandalonePixelArtwork: Symbol("applyStandalonePixelArtwork"),
  closePanelDialog: (...args: unknown[]) => {
    closePanelCalls.push(args);
  },
  currentEmojiKey: () => currentEmojiKey,
  currentLoadId: () => currentLoadId,
  dialog: () => dialog,
  languageDialog: () => languageDialog,
  languageFlags: { en: "🇺🇸" },
  languageList: () => languageList,
  languagePicker: () => languagePicker,
  languagePickerFlag: () => languagePickerFlag,
  languagePickerLabel: () => languagePickerLabel,
  loadUiTranslations: async () => ({}),
  nextLoadId: () => nextLoadId,
  onPixelFontRevisionLoaded: () => {
    onPixelFontRevisionLoadedCalls += 1;
  },
  refreshLocalizedLabels: () => {},
  restoreDeveloperMode: () => {},
  saveExplorerPreference: () => {},
  searchLocales: () => searchLocales,
  selectedSearchLocale: () => selectedSearchLocale,
  setApplyingUrlState: () => {},
  setSearchAnnotations: () => {},
  setSearchLabels: () => {},
  setSearchLocales: () => {},
  setSearchSubgroupLabels: () => {},
  setSelectedLocale: () => {},
  suppressedPanelCloses: () => suppressedPanelCloses,
  syncUrlState: (...args: unknown[]) => {
    syncUrlCalls.push(args);
  },
  translate: (key: string) => key,
  updateModifierArtwork: () => {},
  updatePixelArtworkManifest: () => {},
  updateWebAppManifest: () => {},
});

assert.equal(runtime.kind, "search-language-lifecycle");
assert.equal(registeredEvents.popstate, runtime.onPopState);
assert.equal(lifecycleStub.lifecycleOptions.languageFlags.en, "🇺🇸");
assert.equal(typeof lifecycleStub.lifecycleOptions.restoreLanguageParentPanel, "function");
assert.equal(pixelFontStub.hotReloadOptions.refreshStylesheet instanceof Function, true);

await registeredEvents.load?.();
assert.equal(registrations[0].unregisterCalls, 1);
assert.equal(registrations[1].unregisterCalls, 0);
assert.deepEqual(deletedCaches, ["emoji-explorer-v1"]);

lifecycleStub.lifecycleOptions.restoreLanguageParentPanel();
assert.equal(languageDialog.dataset.returnPanel, undefined);
assert.equal(panelStub.openPanelDialogCalls.length, 1);
assert.equal(panelStub.openPanelDialogCalls[0].panel, "help");
assert.equal(panelStub.openPanelDialogCalls[0].addHistory, false);
assert.equal(panelStub.openPanelDialogCalls[0].dialogs.help, helpDialog);
assert.equal(panelStub.openPanelDialogCalls[0].dialogs.language, languageDialog);
assert.equal(panelStub.openPanelDialogCalls[0].dialogs.favorites, savedDialog);
panelStub.openPanelDialogCalls[0].syncUrlState("panel", "help");
assert.deepEqual(syncUrlCalls, [["panel", "help"]]);

languageDialog.dataset.returnPanel = "";
lifecycleStub.lifecycleOptions.restoreLanguageParentPanel();
assert.equal(panelStub.openPanelDialogCalls.length, 1);

await pixelFontStub.hotReloadOptions.refreshStylesheet("rev-1");
assert.equal(onPixelFontRevisionLoadedCalls, 1);
assert.equal(pixelFontStub.refreshStylesheetCalls.length, 1);
assert.equal(pixelFontStub.refreshStylesheetCalls[0].revision, "rev-1");
assert.equal(pixelFontStub.refreshExplorerCalls.length, 1);
assert.equal(pixelFontStub.refreshExplorerCalls[0].revision, "rev-1-loaded");
assert.equal(
  pixelFontStub.refreshExplorerCalls[0].options.currentEmojiKey(),
  "wave",
);

sharedWindow.isSecureContext = true;
registeredServiceWorkers.length = 0;
delete registeredEvents.load;
(globalThis as any).__TEST_VITE_DEV__ = false;
const productionRuntime = initializeBrowserRuntime({
  ...lifecycleStub.lifecycleOptions,
  applyDialogUrlState: () => {},
  applyPixelArtworkClass: () => {},
  applyStandalonePixelArtwork: () => {},
  closePanelDialog: () => {},
  currentEmojiKey: () => "smile",
  currentLoadId: () => 1,
  dialog: () => dialog,
  languageDialog: () => languageDialog,
  languageFlags: {},
  languageList: () => [],
  languagePicker: () => languagePicker,
  languagePickerFlag: () => languagePickerFlag,
  languagePickerLabel: () => languagePickerLabel,
  loadUiTranslations: async () => ({}),
  nextLoadId: () => 2,
  onPixelFontRevisionLoaded: () => {},
  refreshLocalizedLabels: () => {},
  restoreDeveloperMode: () => {},
  saveExplorerPreference: () => {},
  searchLocales: () => [],
  selectedSearchLocale: () => "en",
  setApplyingUrlState: () => {},
  setSearchAnnotations: () => {},
  setSearchLabels: () => {},
  setSearchLocales: () => {},
  setSearchSubgroupLabels: () => {},
  setSelectedLocale: () => {},
  suppressedPanelCloses: () => 0,
  syncUrlState: () => {},
  translate: (value: string) => value,
  updateModifierArtwork: () => {},
  updatePixelArtworkManifest: () => {},
  updateWebAppManifest: () => {},
});
assert.equal(productionRuntime.kind, "search-language-lifecycle");

(delete (sharedNavigator.serviceWorker as any).getRegistrations);
sharedNavigator.serviceWorker.register = async (url: string) => {
  registeredServiceWorkers.push(url);
  return { scope: url };
};

await registeredEvents.load?.();
assert.deepEqual(registeredServiceWorkers, ["./service-worker.js"]);

sharedNavigator.serviceWorker.register = async () => {
  throw new Error("register failed");
};
await registeredEvents.load?.();
assert.equal(
  warnings.some(
    (entry) =>
      entry[0] === "Offline support unavailable" &&
      entry[1] instanceof Error,
  ),
  true,
);

console.warn = originalWarn;
if (originalWindowDescriptor) {
  Object.defineProperty(globalThis, "window", originalWindowDescriptor);
} else {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: originalWindow,
  });
}
if (originalNavigatorDescriptor) {
  Object.defineProperty(globalThis, "navigator", originalNavigatorDescriptor);
} else {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    writable: true,
    value: originalNavigator,
  });
}
if (originalCachesDescriptor) {
  Object.defineProperty(globalThis, "caches", originalCachesDescriptor);
} else {
  Object.defineProperty(globalThis, "caches", {
    configurable: true,
    writable: true,
    value: originalCaches,
  });
}
if (originalDocumentDescriptor) {
  Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
} else {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: originalDocument,
  });
}
delete (globalThis as any).__TEST_VITE_DEV__;
