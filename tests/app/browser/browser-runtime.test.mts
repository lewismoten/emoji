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
