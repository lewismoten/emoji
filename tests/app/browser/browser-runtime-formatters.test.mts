import assert from "node:assert/strict";
import {
  createUiFormatters,
  isViteDevelopmentRuntime,
} from "../../../src/app/browser/browser-runtime.js";

const formatterCalls: Array<{
  type: "number" | "percent";
  value: number;
  locale: string | undefined;
  numberingSystem: string | undefined;
}> = [];

const englishFormatters = createUiFormatters({
  document: { documentElement: { lang: "en-US" } } as Document,
  selectedSearchLocale: () => "fr",
  formatNumber: (value: number, locale?: string, numberingSystem?: string) => {
    formatterCalls.push({ type: "number", value, locale, numberingSystem });
    return `n:${value}:${locale ?? ""}:${numberingSystem ?? ""}`;
  },
  formatPercent: (value: number, locale?: string, numberingSystem?: string) => {
    formatterCalls.push({ type: "percent", value, locale, numberingSystem });
    return `p:${value}:${locale ?? ""}:${numberingSystem ?? ""}`;
  },
});

assert.equal(englishFormatters.formatUiNumber(42), "n:42:en-US:");
assert.equal(englishFormatters.formatUiPercent(75), "p:75:en-US:");

const arabicFormatters = createUiFormatters({
  document: { documentElement: { lang: "ar" } } as Document,
  selectedSearchLocale: () => "en",
  formatNumber: (value: number, locale?: string, numberingSystem?: string) =>
    `n:${value}:${locale ?? ""}:${numberingSystem ?? ""}`,
  formatPercent: (value: number, locale?: string, numberingSystem?: string) =>
    `p:${value}:${locale ?? ""}:${numberingSystem ?? ""}`,
});
assert.equal(arabicFormatters.formatUiNumber(7), "n:7:ar:arab");
assert.equal(arabicFormatters.formatUiPercent(88), "p:88:ar:arab");

const fallbackFormatters = createUiFormatters({
  document: { documentElement: { lang: "" } } as Document,
  selectedSearchLocale: () => "ar-EG",
  formatNumber: (value: number, locale?: string, numberingSystem?: string) =>
    `n:${value}:${locale ?? ""}:${numberingSystem ?? ""}`,
  formatPercent: (value: number, locale?: string, numberingSystem?: string) =>
    `p:${value}:${locale ?? ""}:${numberingSystem ?? ""}`,
});
assert.equal(fallbackFormatters.formatUiNumber(3), "n:3:ar-EG:arab");
assert.equal(fallbackFormatters.formatUiPercent(5), "p:5:ar-EG:arab");

assert.deepEqual(formatterCalls, [
  { type: "number", value: 42, locale: "en-US", numberingSystem: undefined },
  { type: "percent", value: 75, locale: "en-US", numberingSystem: undefined },
]);

assert.equal(isViteDevelopmentRuntime(), false);

(globalThis as any).__TEST_VITE_DEV__ = true;
assert.equal(isViteDevelopmentRuntime(), true);
delete (globalThis as any).__TEST_VITE_DEV__;
