import assert from "node:assert/strict";
import {
  bindServiceWorkerRuntime,
  createPixelFontRefreshOptions,
  createUiFormatters,
  initializeBrowserRuntime,
  isViteDevelopmentRuntime,
  restoreLanguageParentPanel,
} from "../../../src/app/browser/browser-runtime.js";

assert.equal(typeof createUiFormatters, "function");
assert.equal(typeof bindServiceWorkerRuntime, "function");
assert.equal(typeof restoreLanguageParentPanel, "function");
assert.equal(typeof createPixelFontRefreshOptions, "function");
assert.equal(typeof initializeBrowserRuntime, "function");
assert.equal(typeof isViteDevelopmentRuntime, "function");

const formatters = createUiFormatters({
  document: { documentElement: { lang: "en-US" } } as Document,
  selectedSearchLocale: () => "fr",
  formatNumber: (value: number, locale?: string, numberingSystem?: string) =>
    `n:${value}:${locale ?? ""}:${numberingSystem ?? ""}`,
  formatPercent: (value: number, locale?: string, numberingSystem?: string) =>
    `p:${value}:${locale ?? ""}:${numberingSystem ?? ""}`,
});

assert.equal(formatters.formatUiNumber(99), "n:99:en-US:");
assert.equal(formatters.formatUiPercent(15), "p:15:en-US:");

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const popstateHandlers: Array<(event?: unknown) => unknown> = [];
const closePanelCalls: unknown[][] = [];
const syncCalls: number[] = [];
const selectedLocales: string[] = [];
const languagePicker = { disabled: false };
const languagePickerFlag = { textContent: "" };
const languagePickerLabel = { textContent: "" };
const helpDialog = { id: "help-dialog" };
const savedDialog = { id: "saved-dialog" };
const ownerDocument = {
  querySelector(selector: string) {
    if (selector === "#help-dialog") return helpDialog;
    if (selector === "#saved-dialog") return savedDialog;
    return null;
  },
};
const languageDialog = { dataset: { returnPanel: "favorites" }, ownerDocument };
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    addEventListener(type: string, handler: (event?: unknown) => unknown) {
      if (type === "popstate") popstateHandlers.push(handler);
    },
    location: { pathname: "/index.en.html", search: "", hash: "" },
  },
});

try {
  const lifecycle = initializeBrowserRuntime({
    applyDialogUrlState: async () => undefined,
    closePanelDialog: (...args: unknown[]) => {
      closePanelCalls.push(args);
    },
    currentLoadId: () => 1,
    languageDialog: () => languageDialog,
    languageFlags: { en: "🇺🇸" },
    languageList: () => [{ code: "en" }],
    languagePicker: () => languagePicker,
    languagePickerFlag: () => languagePickerFlag,
    languagePickerLabel: () => languagePickerLabel,
    loadUiTranslations: async () => undefined,
    nextLoadId: () => 2,
    refreshLocalizedLabels: () => undefined,
    restoreDeveloperMode: () => undefined,
    saveExplorerPreference: () => undefined,
    searchLocales: () => [{ locale: "en" }],
    selectedSearchLocale: () => "en",
    setApplyingUrlState: () => undefined,
    setSearchAnnotations: () => undefined,
    setSearchLabels: () => undefined,
    setSearchLocales: () => undefined,
    setSearchSubgroupLabels: () => undefined,
    setSelectedLocale: (value: string) => {
      selectedLocales.push(value);
    },
    suppressedPanelCloses: () => new WeakSet(),
    syncUrlState: () => {
      syncCalls.push(1);
    },
    translate: (key: string) => key,
    updateWebAppManifest: () => undefined,
    onPixelFontRevisionLoaded: () => undefined,
    applyPixelArtworkClass: () => undefined,
    applyStandalonePixelArtwork: () => undefined,
    currentEmojiKey: () => "rocket",
    dialog: () => null,
    updatePixelArtworkManifest: () => undefined,
    updateModifierArtwork: () => undefined,
  });
  assert.equal(typeof lifecycle.load, "function");
  assert.equal(typeof lifecycle.onPopState, "function");
  assert.equal(popstateHandlers.length, 1);
  await lifecycle.set("");
  assert.equal(closePanelCalls.length, 1);
  assert.equal(languageDialog.dataset.returnPanel, undefined);
  assert.deepEqual(selectedLocales, []);
  assert.equal(syncCalls.length, 0);
  assert.equal(languagePicker.disabled, false);
} finally {
  if (originalWindowDescriptor) {
    Object.defineProperty(globalThis, "window", originalWindowDescriptor);
  } else {
    delete (globalThis as any).window;
  }
}
