import assert from "node:assert/strict";
import {
  finalizeExplorerStartup,
  initializeExplorerControls,
} from "../../src/explorer/control-startup.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

const compactGroupChoices = {
  listeners: new Map<string, () => void>(),
  addEventListener(type: string, handler: () => void) {
    this.listeners.set(type, handler);
  },
};
const compactSubGroupChoices = {
  listeners: new Map<string, () => void>(),
  addEventListener(type: string, handler: () => void) {
    this.listeners.set(type, handler);
  },
};
const compactSequenceChoices = {
  listeners: new Map<string, () => void>(),
  addEventListener(type: string, handler: () => void) {
    this.listeners.set(type, handler);
  },
};

const groupSelector = {};
const subGroupSelector = {};
const sequenceTypeSelector = {};
const versionField = {
  classList: {
    values: new Map<string, boolean>(),
    toggle(name: string, value: boolean) {
      this.values.set(name, value);
    },
  },
};
const versionSelector = {
  closest(selector: string) {
    return selector === ".filter-field" ? versionField : null;
  },
};

try {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: {
        dataset: { locale: "fr" },
        dir: "rtl",
      },
      querySelector() {
        return null;
      },
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        pathname: "/index.ar.html",
      },
    },
  });

  const calls: string[] = [];
  const controls = {
    ensureChoiceContainer(selector: unknown, className: string) {
      if (selector === groupSelector && className === "compact-group-choices") {
        return compactGroupChoices;
      }
      if (
        selector === subGroupSelector &&
        className === "compact-subgroup-choices"
      ) {
        return compactSubGroupChoices;
      }
      return compactSequenceChoices;
    },
    ensureSequenceTypeFilter() {
      return sequenceTypeSelector;
    },
    ensureSelectionLabel(_selector: unknown, className: string) {
      return { className };
    },
    ensureVersionSlider() {
      return { range: { id: "version-range" }, output: { id: "version-range-value" } };
    },
    ensureVersionModeToggle() {
      return { id: "version-mode-toggle" };
    },
    ensureActiveFilterSummary() {
      return { clear: { id: "clear" }, summary: { id: "summary" }, text: { id: "text" } };
    },
  };

  const groupPickerTrigger = {
    handler: undefined as undefined | (() => void),
    addEventListener(_type: string, handler: () => void) {
      this.handler = handler;
    },
  };
  const subGroupPickerTrigger = {
    handler: undefined as undefined | (() => void),
    addEventListener(_type: string, handler: () => void) {
      this.handler = handler;
    },
  };

  const initialized = initializeExplorerControls({
    createFilterControlSetup() {
      calls.push("createFilterControlSetup");
      return controls;
    },
    groupFilterDialog: { id: "group-filter-dialog" },
    groupPickerTrigger,
    groupSelector,
    onCompactChoiceKeyDown() {
      calls.push("keydown");
    },
    openFilterPicker(dialog: { id: string }, _choices: unknown) {
      calls.push(`open:${dialog.id}`);
    },
    populateVersionModeOptions() {
      calls.push("populateVersionModeOptions");
    },
    renderDeveloperMode() {
      calls.push("renderDeveloperMode");
    },
    subGroupFilterDialog: { id: "subgroup-filter-dialog" },
    subGroupPickerTrigger,
    subGroupSelector,
    versionModeSelector: {},
    versionRange: {},
    versionSelector,
  });

  assert.equal(initialized.compactGroupChoices, compactGroupChoices);
  assert.equal(initialized.compactSubGroupChoices, compactSubGroupChoices);
  assert.equal(initialized.compactSequenceChoices, compactSequenceChoices);
  assert.equal(initialized.compactSequenceLabel.className, "compact-sequence-label");
  assert.equal(initialized.sequenceTypeSelector, sequenceTypeSelector);
  assert.equal(initialized.versionModeToggle.id, "version-mode-toggle");
  assert.equal(versionField.classList.values.get("has-version-slider"), true);
  compactGroupChoices.listeners.get("keydown")?.();
  groupPickerTrigger.handler?.();
  subGroupPickerTrigger.handler?.();
  assert.deepEqual(calls, [
    "createFilterControlSetup",
    "renderDeveloperMode",
    "populateVersionModeOptions",
    "keydown",
    "open:group-filter-dialog",
    "open:subgroup-filter-dialog",
  ]);

  const noSliderField = {
    classList: {
      values: new Map<string, boolean>(),
      toggle(name: string, value: boolean) {
        this.values.set(name, value);
      },
    },
  };
  const noSliderVersionSelector = {
    closest(selector: string) {
      return selector === ".filter-field" ? noSliderField : null;
    },
  };
  const fallbackSequenceSelector = {};
  let populateWithoutSliderCalls = 0;
  const initializedWithoutTriggers = initializeExplorerControls({
    createFilterControlSetup() {
      return {
        ensureActiveFilterSummary() {
          return {
            clear: { id: "clear-2" },
            summary: { id: "summary-2" },
            text: { id: "text-2" },
          };
        },
        ensureChoiceContainer(selector: unknown, className: string) {
          if (
            selector === noSliderVersionSelector &&
            className === "compact-sequence-choices"
          ) {
            return compactSequenceChoices;
          }
          return compactGroupChoices;
        },
        ensureSelectionLabel(_selector: unknown, className: string) {
          return { className };
        },
        ensureSequenceTypeFilter() {
          return fallbackSequenceSelector;
        },
        ensureVersionModeToggle() {
          return { id: "version-mode-toggle-2" };
        },
        ensureVersionSlider() {
          return { range: null, output: null };
        },
      };
    },
    groupSelector,
    onCompactChoiceKeyDown() {},
    openFilterPicker() {
      throw new Error("should not be called without triggers");
    },
    populateVersionModeOptions() {
      populateWithoutSliderCalls += 1;
    },
    renderDeveloperMode() {},
    subGroupSelector,
    versionModeSelector: {},
    versionRange: {},
    versionSelector: noSliderVersionSelector,
  });
  assert.equal(
    noSliderField.classList.values.get("has-version-slider"),
    false,
  );
  assert.equal(
    initializedWithoutTriggers.sequenceTypeSelector,
    fallbackSequenceSelector,
  );
  assert.equal(populateWithoutSliderCalls, 1);

  const startupCalls: string[] = [];
  await finalizeExplorerStartup({
    applyDialogUrlState() {
      startupCalls.push("applyDialogUrlState");
    },
    drawList() {
      startupCalls.push("drawList");
    },
    finishExplorerLoading() {
      startupCalls.push("finishExplorerLoading");
    },
    loadData() {
      startupCalls.push("loadData");
      return Promise.resolve();
    },
    loadPackageManifest() {
      startupCalls.push("loadPackageManifest");
      return Promise.resolve();
    },
    loadSearchLanguages(locale: string) {
      startupCalls.push(`loadSearchLanguages:${locale}`);
      return Promise.resolve();
    },
    loadUiTranslations(locale: string, rtl: boolean) {
      startupCalls.push(`loadUiTranslations:${locale}:${rtl}`);
      return Promise.resolve();
    },
    observeToolbarHeight(toolbar: { id: string }) {
      startupCalls.push(`observeToolbarHeight:${toolbar.id}`);
    },
    preferences: {},
    renderPixelFontToggle() {
      startupCalls.push("renderPixelFontToggle");
    },
    renderThemeToggle() {
      startupCalls.push("renderThemeToggle");
    },
    renderVersionModeToggle() {
      startupCalls.push("renderVersionModeToggle");
    },
    setUrlStateReady(value: boolean) {
      startupCalls.push(`setUrlStateReady:${value}`);
    },
    syncUrlState() {
      startupCalls.push("syncUrlState");
    },
    toolbar: { id: "toolbar" },
  });

  assert.deepEqual(startupCalls, [
    "renderVersionModeToggle",
    "renderThemeToggle",
    "renderPixelFontToggle",
    "observeToolbarHeight:toolbar",
    "loadUiTranslations:ar:true",
    "loadSearchLanguages:ar",
    "loadData",
    "loadPackageManifest",
    "drawList",
    "finishExplorerLoading",
    "applyDialogUrlState",
    "renderThemeToggle",
    "renderPixelFontToggle",
    "renderVersionModeToggle",
    "setUrlStateReady:true",
    "syncUrlState",
  ]);

  (globalThis.document as any).documentElement.dataset = {};
  (globalThis.document as any).documentElement.dir = "ltr";
  (globalThis.window as any).location.pathname = "/index.html";
  const fallbackStartupCalls: string[] = [];
  await finalizeExplorerStartup({
    applyDialogUrlState() {
      fallbackStartupCalls.push("applyDialogUrlState");
    },
    drawList() {
      fallbackStartupCalls.push("drawList");
    },
    finishExplorerLoading() {
      fallbackStartupCalls.push("finishExplorerLoading");
    },
    loadData() {
      fallbackStartupCalls.push("loadData");
      return Promise.resolve();
    },
    loadSearchLanguages(locale: string) {
      fallbackStartupCalls.push(`loadSearchLanguages:${locale}`);
      return Promise.resolve();
    },
    loadUiTranslations(locale: string, rtl: boolean) {
      fallbackStartupCalls.push(`loadUiTranslations:${locale}:${rtl}`);
      return Promise.resolve();
    },
    observeToolbarHeight(toolbar: { id: string }) {
      fallbackStartupCalls.push(`observeToolbarHeight:${toolbar.id}`);
    },
    preferences: { locale: "es" },
    renderPixelFontToggle() {
      fallbackStartupCalls.push("renderPixelFontToggle");
    },
    renderThemeToggle() {
      fallbackStartupCalls.push("renderThemeToggle");
    },
    renderVersionModeToggle() {
      fallbackStartupCalls.push("renderVersionModeToggle");
    },
    setUrlStateReady(value: boolean) {
      fallbackStartupCalls.push(`setUrlStateReady:${value}`);
    },
    syncUrlState() {
      fallbackStartupCalls.push("syncUrlState");
    },
    toolbar: { id: "toolbar-2" },
  });
  assert.deepEqual(fallbackStartupCalls, [
    "renderVersionModeToggle",
    "renderThemeToggle",
    "renderPixelFontToggle",
    "observeToolbarHeight:toolbar-2",
    "loadUiTranslations:en:false",
    "loadSearchLanguages:en",
    "loadData",
    "drawList",
    "finishExplorerLoading",
    "applyDialogUrlState",
    "renderThemeToggle",
    "renderPixelFontToggle",
    "renderVersionModeToggle",
    "setUrlStateReady:true",
    "syncUrlState",
  ]);

  (globalThis.document as any).documentElement.dataset = {};
  (globalThis.document as any).documentElement.dir = "ltr";
  (globalThis.window as any).location.pathname = "/index.en-x-newspeak.html";
  const newspeakStartupCalls: string[] = [];
  await finalizeExplorerStartup({
    applyDialogUrlState() {
      newspeakStartupCalls.push("applyDialogUrlState");
    },
    drawList() {
      newspeakStartupCalls.push("drawList");
    },
    finishExplorerLoading() {
      newspeakStartupCalls.push("finishExplorerLoading");
    },
    loadData() {
      newspeakStartupCalls.push("loadData");
      return Promise.resolve();
    },
    loadSearchLanguages(locale: string) {
      newspeakStartupCalls.push(`loadSearchLanguages:${locale}`);
      return Promise.resolve();
    },
    loadUiTranslations(locale: string, rtl: boolean) {
      newspeakStartupCalls.push(`loadUiTranslations:${locale}:${rtl}`);
      return Promise.resolve();
    },
    observeToolbarHeight(toolbar: { id: string }) {
      newspeakStartupCalls.push(`observeToolbarHeight:${toolbar.id}`);
    },
    preferences: {},
    renderPixelFontToggle() {
      newspeakStartupCalls.push("renderPixelFontToggle");
    },
    renderThemeToggle() {
      newspeakStartupCalls.push("renderThemeToggle");
    },
    renderVersionModeToggle() {
      newspeakStartupCalls.push("renderVersionModeToggle");
    },
    setUrlStateReady(value: boolean) {
      newspeakStartupCalls.push(`setUrlStateReady:${value}`);
    },
    syncUrlState() {
      newspeakStartupCalls.push("syncUrlState");
    },
    toolbar: { id: "toolbar-3" },
  });
  assert.deepEqual(newspeakStartupCalls, [
    "renderVersionModeToggle",
    "renderThemeToggle",
    "renderPixelFontToggle",
    "observeToolbarHeight:toolbar-3",
    "loadUiTranslations:en-x-newspeak:false",
    "loadSearchLanguages:en-x-newspeak",
    "loadData",
    "drawList",
    "finishExplorerLoading",
    "applyDialogUrlState",
    "renderThemeToggle",
    "renderPixelFontToggle",
    "renderVersionModeToggle",
    "setUrlStateReady:true",
    "syncUrlState",
  ]);

  const originalSetTimeout = globalThis.setTimeout;
  const originalRequestAnimationFrame = (globalThis.window as any)
    .requestAnimationFrame;
  const fallbackAsyncCalls: string[] = [];
  (globalThis.window as any).requestAnimationFrame = undefined;
  globalThis.setTimeout = ((handler: () => void) => {
    fallbackAsyncCalls.push("setTimeout");
    handler();
    return 0;
  }) as typeof setTimeout;
  await finalizeExplorerStartup({
    applyDialogUrlState() {
      fallbackAsyncCalls.push("applyDialogUrlState");
    },
    drawList() {},
    finishExplorerLoading() {},
    loadData() {
      return Promise.resolve();
    },
    loadSearchLanguages() {
      return Promise.resolve();
    },
    loadUiTranslations() {
      return Promise.resolve();
    },
    observeToolbarHeight() {},
    preferences: {},
    renderPixelFontToggle() {},
    renderThemeToggle() {},
    renderVersionModeToggle() {},
    setUrlStateReady() {},
    syncUrlState() {},
    toolbar: { id: "toolbar-4" },
  });
  assert.deepEqual(fallbackAsyncCalls, ["applyDialogUrlState", "setTimeout"]);
  globalThis.setTimeout = originalSetTimeout;

  const animationFrameCalls: string[] = [];
  (globalThis.window as any).requestAnimationFrame = (handler: () => void) => {
    animationFrameCalls.push("requestAnimationFrame");
    handler();
    return 0;
  };
  await finalizeExplorerStartup({
    applyDialogUrlState() {
      animationFrameCalls.push("applyDialogUrlState");
    },
    drawList() {},
    finishExplorerLoading() {},
    loadData() {
      return Promise.resolve();
    },
    loadSearchLanguages() {
      return Promise.resolve();
    },
    loadUiTranslations() {
      return Promise.resolve();
    },
    observeToolbarHeight() {},
    preferences: {},
    renderPixelFontToggle() {},
    renderThemeToggle() {},
    renderVersionModeToggle() {},
    setUrlStateReady() {},
    syncUrlState() {},
    toolbar: { id: "toolbar-5" },
  });
  assert.deepEqual(animationFrameCalls, [
    "applyDialogUrlState",
    "requestAnimationFrame",
  ]);
  (globalThis.window as any).requestAnimationFrame = originalRequestAnimationFrame;
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
}
