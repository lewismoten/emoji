import assert from "node:assert/strict";
import { createBrowserRuntimeFixture } from "./browser-runtime-fixture.mjs";

const { module, lifecycleStub, panelStub, pixelFontStub } =
  await createBrowserRuntimeFixture();

const { createPixelFontRefreshOptions, initializeBrowserRuntime } = module;

const refreshStylesheetCalls: Array<{ revision: string; hasHandler: boolean }> =
  [];
const refreshExplorerCalls: Array<{
  revision: string;
  currentEmojiKey: string;
}> = [];
let onPixelFontRevisionLoadedCalls = 0;

const refreshOptions = createPixelFontRefreshOptions(
  {
    applyPixelArtworkClass() {},
    applyStandalonePixelArtwork() {},
    currentEmojiKey: () => "rocket",
    dialog: () => ({ id: "dialog" }),
    onPixelFontRevisionLoaded() {
      onPixelFontRevisionLoadedCalls += 1;
    },
    updateModifierArtwork() {},
    updatePixelArtworkManifest() {},
  },
  {
    refreshPixelFontStylesheet(
      styleOptions: { onStylesheetLoaded: (revision: string) => void },
      revision: string,
    ) {
      refreshStylesheetCalls.push({
        revision,
        hasHandler: typeof styleOptions.onStylesheetLoaded === "function",
      });
      styleOptions.onStylesheetLoaded(`${revision}-done`);
      return Promise.resolve();
    },
    refreshExplorerPixelFont(runtimeOptions: any, revision: string) {
      refreshExplorerCalls.push({
        revision,
        currentEmojiKey: runtimeOptions.currentEmojiKey(),
      });
      return Promise.resolve();
    },
  },
);
await refreshOptions.refreshStylesheet("rev-direct");
assert.equal(onPixelFontRevisionLoadedCalls > 0, true);
assert.deepEqual(refreshStylesheetCalls, [
  { revision: "rev-direct", hasHandler: true },
]);
assert.deepEqual(refreshExplorerCalls, [
  { revision: "rev-direct-done", currentEmojiKey: "rocket" },
]);

const helpDialog = { id: "help-dialog" };
const savedDialog = { id: "saved-dialog" };
const ownerDocument = {
  querySelector(selector: string) {
    if (selector === "#help-dialog") return helpDialog;
    if (selector === "#saved-dialog") return savedDialog;
    return null;
  },
};
const languageDialog = { dataset: { returnPanel: "help" }, ownerDocument };
let currentEmojiKey = "wave";
const syncUrlCalls: unknown[][] = [];

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator",
);
const originalCachesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "caches",
);
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    isSecureContext: true,
    location: { origin: "https://emoji.example" },
    addEventListener() {},
  },
});
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: { serviceWorker: { getRegistrations: async () => [] } },
});
Object.defineProperty(globalThis, "caches", {
  configurable: true,
  value: { keys: async () => [], delete: async () => true },
});
(globalThis as any).__TEST_VITE_DEV__ = true;

try {
  const runtime = initializeBrowserRuntime({
    applyDialogUrlState() {},
    applyPixelArtworkClass() {},
    applyStandalonePixelArtwork() {},
    closePanelDialog() {},
    currentEmojiKey: () => currentEmojiKey,
    currentLoadId: () => 1,
    dialog: () => undefined,
    languageDialog: () => languageDialog,
    languageFlags: { en: "🇺🇸" },
    languageList: () => [{ code: "en" }],
    languagePicker: () => ({ disabled: false }),
    languagePickerFlag: () => undefined,
    languagePickerLabel: () => undefined,
    loadUiTranslations: async () => ({}),
    nextLoadId: () => 2,
    onPixelFontRevisionLoaded() {},
    refreshLocalizedLabels() {},
    restoreDeveloperMode() {},
    saveExplorerPreference() {},
    searchLocales: () => [{ code: "en" }],
    selectedSearchLocale: () => "en",
    setApplyingUrlState() {},
    setSearchAnnotations() {},
    setSearchLabels() {},
    setSearchLocales() {},
    setSearchSubgroupLabels() {},
    setSelectedLocale() {},
    suppressedPanelCloses: () => new WeakSet(),
    syncUrlState: (...args: unknown[]) => {
      syncUrlCalls.push(args);
    },
    translate: (key: string) => key,
    updateModifierArtwork() {},
    updatePixelArtworkManifest() {},
    updateWebAppManifest() {},
  });

  assert.equal(runtime.kind, "search-language-lifecycle");
  assert.equal(lifecycleStub.lifecycleOptions.languageFlags.en, "🇺🇸");
  assert.equal(
    typeof lifecycleStub.lifecycleOptions.restoreLanguageParentPanel,
    "function",
  );
  assert.equal(
    pixelFontStub.hotReloadOptions.refreshStylesheet instanceof Function,
    true,
  );

  lifecycleStub.lifecycleOptions.restoreLanguageParentPanel();
  assert.equal(languageDialog.dataset.returnPanel, undefined);
  assert.equal(panelStub.openPanelDialogCalls.length, 1);
  assert.deepEqual(syncUrlCalls, [[]]);
} finally {
  if (originalWindowDescriptor)
    Object.defineProperty(globalThis, "window", originalWindowDescriptor);
  if (originalNavigatorDescriptor)
    Object.defineProperty(globalThis, "navigator", originalNavigatorDescriptor);
  if (originalCachesDescriptor)
    Object.defineProperty(globalThis, "caches", originalCachesDescriptor);
  delete (globalThis as any).__TEST_VITE_DEV__;
}
