import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as preferences from "../../src/preferences.js";

const mocked = vi.hoisted(() => ({
  i18nLocale: "en",
  renderAudioToggle: vi.fn(),
  renderThemeToggle: vi.fn(),
  routeLocale: undefined as string | undefined,
  rtl: false,
}));

vi.mock("../../src/app/route.js", () => ({
  getLocale: () => mocked.routeLocale,
}));

vi.mock("../../src/utils/i18n.js", () => ({
  getLocale: () => mocked.i18nLocale,
}));

vi.mock("../../src/utils/document.js", () => ({
  getRtl: () => mocked.rtl,
}));

vi.mock("../../src/render-theme-toggle.js", () => ({
  renderThemeToggle: mocked.renderThemeToggle,
}));

vi.mock("../../src/controls/audio/audio-toggle.js", () => ({
  render: mocked.renderAudioToggle,
}));
import {
  finalizeExplorerStartup,
  initializeExplorerControls,
} from "../../src/explorer/control-startup.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

describe("control-startup", () => {
  beforeEach(() => {
    mocked.routeLocale = undefined;
    mocked.i18nLocale = "en";
    mocked.rtl = false;
    mocked.renderThemeToggle.mockReset();
    mocked.renderAudioToggle.mockReset();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: { dataset: {}, dir: "ltr" },
        querySelector() {
          return null;
        },
      },
    });
  });

  afterEach(() => {
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  });

  it("initializes compact controls, labels, and version slider state", () => {
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
        return {
          range: { id: "version-range" },
          output: { id: "version-range-value" },
        };
      },
      ensureVersionModeToggle() {
        return { id: "version-mode-toggle" };
      },
      ensureActiveFilterSummary() {
        return {
          clear: { id: "clear" },
          summary: { id: "summary" },
          text: { id: "text" },
        };
      },
    };

    const initialized = initializeExplorerControls({
      createFilterControlSetup(args: Record<string, unknown>) {
        calls.push("createFilterControlSetup");
        expect(args.document).toBe(globalThis.document);
        expect(args.versionModeSelector).toEqual({});
        expect(args.versionRange).toEqual({});
        expect(args.versionSelector).toBe(versionSelector);
        return controls;
      },
      groupFilterDialog: { id: "group-filter-dialog" },
      groupPickerTrigger,
      groupSelector,
      onCompactChoiceKeyDown() {
        calls.push("keydown");
      },
      openFilterPicker(dialog: { id: string }) {
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

    expect(initialized.compactGroupChoices).toBe(compactGroupChoices);
    expect(initialized.compactSubGroupChoices).toBe(compactSubGroupChoices);
    expect(initialized.compactSequenceChoices).toBe(compactSequenceChoices);
    expect(initialized.compactSequenceLabel.className).toBe(
      "compact-sequence-label",
    );
    expect(initialized.sequenceTypeSelector).toBe(sequenceTypeSelector);
    expect(initialized.versionModeToggle.id).toBe("version-mode-toggle");
    expect(versionField.classList.values.get("has-version-slider")).toBe(true);

    compactGroupChoices.listeners.get("keydown")?.();
    groupPickerTrigger.handler?.();
    subGroupPickerTrigger.handler?.();
    expect(calls).toEqual([
      "createFilterControlSetup",
      "renderDeveloperMode",
      "populateVersionModeOptions",
      "keydown",
      "open:group-filter-dialog",
      "open:subgroup-filter-dialog",
    ]);
  });

  it("handles missing triggers and a missing version slider", () => {
    const compactGroupChoices = {
      addEventListener() {},
    };
    const compactSequenceChoices = {
      addEventListener() {},
    };
    const groupSelector = {};
    const subGroupSelector = {};
    const noSliderField = {
      classList: {
        values: new Map<string, boolean>(),
        toggle(name: string, value: boolean) {
          this.values.set(name, value);
        },
      },
    };
    const versionSelector = {
      closest(selector: string) {
        return selector === ".filter-field" ? noSliderField : null;
      },
    };
    const fallbackSequenceSelector = {};
    let populateWithoutSliderCalls = 0;

    const initialized = initializeExplorerControls({
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
              selector === fallbackSequenceSelector &&
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
      versionSelector,
    });

    expect(noSliderField.classList.values.get("has-version-slider")).toBe(false);
    expect(initialized.sequenceTypeSelector).toBe(fallbackSequenceSelector);
    expect(populateWithoutSliderCalls).toBe(1);
  });

  it("finalizes startup using route, i18n, and preference locale fallbacks", async () => {
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
        localStorage: {
          getItem() {
            return null;
          },
          setItem() {},
        },
        requestAnimationFrame(handler: () => void) {
          handler();
          return 0;
        },
      },
    });

    preferences.init({});
    mocked.routeLocale = "ar";
    mocked.i18nLocale = "ar";
    mocked.rtl = true;
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
      loadUiTranslations(locale: string, isRtl: boolean) {
        startupCalls.push(`loadUiTranslations:${locale}:${isRtl}`);
        return Promise.resolve();
      },
      observeToolbarHeight(toolbar: { id: string }) {
        startupCalls.push(`observeToolbarHeight:${toolbar.id}`);
      },
      preferences: {},
      renderDeveloperMode() {
        startupCalls.push("renderDeveloperMode");
      },
      renderPixelFontToggle() {
        startupCalls.push("renderPixelFontToggle");
      },
      renderSearchLanguages() {
        startupCalls.push("renderSearchLanguages");
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

    expect(startupCalls).toEqual([
      "renderVersionModeToggle",
      "renderPixelFontToggle",
      "observeToolbarHeight:toolbar",
      "loadUiTranslations:ar:true",
      "loadSearchLanguages:ar",
      "loadData",
      "loadPackageManifest",
      "drawList",
      "finishExplorerLoading",
      "applyDialogUrlState",
      "renderDeveloperMode",
      "renderPixelFontToggle",
      "renderSearchLanguages",
      "renderVersionModeToggle",
      "setUrlStateReady:true",
      "syncUrlState",
    ]);
    expect(mocked.renderThemeToggle).toHaveBeenCalledTimes(2);
    expect(mocked.renderAudioToggle).toHaveBeenCalledTimes(1);

    preferences.setString("locale", "es");
    mocked.routeLocale = undefined;
    mocked.i18nLocale = "en";
    mocked.rtl = false;
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
      loadUiTranslations(locale: string, isRtl: boolean) {
        fallbackStartupCalls.push(`loadUiTranslations:${locale}:${isRtl}`);
        return Promise.resolve();
      },
      observeToolbarHeight(toolbar: { id: string }) {
        fallbackStartupCalls.push(`observeToolbarHeight:${toolbar.id}`);
      },
      preferences: { locale: "es" },
      renderPixelFontToggle() {
        fallbackStartupCalls.push("renderPixelFontToggle");
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

    expect(fallbackStartupCalls).toEqual([
      "renderVersionModeToggle",
      "renderPixelFontToggle",
      "observeToolbarHeight:toolbar-2",
      "loadUiTranslations:en:false",
      "loadSearchLanguages:es",
      "loadData",
      "drawList",
      "finishExplorerLoading",
      "applyDialogUrlState",
      "renderPixelFontToggle",
      "renderVersionModeToggle",
      "setUrlStateReady:true",
      "syncUrlState",
    ]);

    mocked.routeLocale = "en-x-newspeak";
    mocked.i18nLocale = "en-x-newspeak";
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
      loadUiTranslations(locale: string, isRtl: boolean) {
        newspeakStartupCalls.push(`loadUiTranslations:${locale}:${isRtl}`);
        return Promise.resolve();
      },
      observeToolbarHeight(toolbar: { id: string }) {
        newspeakStartupCalls.push(`observeToolbarHeight:${toolbar.id}`);
      },
      preferences: {},
      renderPixelFontToggle() {
        newspeakStartupCalls.push("renderPixelFontToggle");
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

    expect(newspeakStartupCalls).toEqual([
      "renderVersionModeToggle",
      "renderPixelFontToggle",
      "observeToolbarHeight:toolbar-3",
      "loadUiTranslations:en-x-newspeak:false",
      "loadSearchLanguages:en-x-newspeak",
      "loadData",
      "drawList",
      "finishExplorerLoading",
      "applyDialogUrlState",
      "renderPixelFontToggle",
      "renderVersionModeToggle",
      "setUrlStateReady:true",
      "syncUrlState",
    ]);
  });

  it("falls back to setTimeout when requestAnimationFrame is unavailable", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: { dataset: {}, dir: "ltr" },
        querySelector() {
          return null;
        },
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem() {
            return null;
          },
          setItem() {},
        },
        requestAnimationFrame: undefined,
      },
    });

    const originalSetTimeout = globalThis.setTimeout;
    const fallbackAsyncCalls: string[] = [];
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
      renderVersionModeToggle() {},
      setUrlStateReady() {},
      syncUrlState() {},
      toolbar: { id: "toolbar-4" },
    });

    expect(fallbackAsyncCalls).toEqual(["applyDialogUrlState", "setTimeout"]);
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
      renderVersionModeToggle() {},
      setUrlStateReady() {},
      syncUrlState() {},
      toolbar: { id: "toolbar-5" },
    });

    expect(animationFrameCalls).toEqual([
      "applyDialogUrlState",
      "requestAnimationFrame",
    ]);
  });

});
