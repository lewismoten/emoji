import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import { finalizeExplorerStartup } from "../../src/explorer/control-startup.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

describe("control-startup windowless", () => {
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

  it("skips waiting for dialog controls when window is unavailable", async () => {
    Reflect.deleteProperty(globalThis, "window");

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
        return Promise.resolve();
      },
      loadSearchLanguages() {
        return Promise.resolve();
      },
      loadUiTranslations() {
        return Promise.resolve();
      },
      observeToolbarHeight() {
        startupCalls.push("observeToolbarHeight");
      },
      renderPixelFontToggle() {
        startupCalls.push("renderPixelFontToggle");
      },
      renderVersionModeToggle() {
        startupCalls.push("renderVersionModeToggle");
      },
      setUrlStateReady() {
        startupCalls.push("setUrlStateReady");
      },
      syncUrlState() {
        startupCalls.push("syncUrlState");
      },
      toolbar: { id: "toolbar-6" },
    });

    expect(startupCalls).toEqual([
      "renderVersionModeToggle",
      "renderPixelFontToggle",
      "observeToolbarHeight",
      "drawList",
      "finishExplorerLoading",
      "applyDialogUrlState",
      "renderPixelFontToggle",
      "renderVersionModeToggle",
      "setUrlStateReady",
      "syncUrlState",
    ]);
  });
});
