import { describe, expect, it } from "vitest";

import * as state from "../../../src/state.js";
import { setSearchLanguage } from "../../../src/explorer/language/search-language-picker.js";
import {
  FakeElement,
  installSearchLanguagePickerFixture,
} from "./search-language-picker-fixture.mjs";

describe("search-language-picker failure", () => {
  it("recovers from failed locale fetches and warns", async () => {
    const fixture = installSearchLanguagePickerFixture();

    try {
      const warnings: any[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        warnings.push(args);
      };
      fixture.setFetch(async () => ({ ok: false }));

      const failedPicker = new FakeElement("button");
      const failedFlag = new FakeElement("span");
      const failedLabel = new FakeElement("span");
      let failedRefreshes = 0;
      const failedResult = await setSearchLanguage({
        requestedLocale: "fr",
        searchLoadId: 10,
        searchLocales: [
          {
            locale: "fr",
            label: "French",
            nativeLabel: "Français",
            rtl: false,
            file: "fr.json",
          },
        ],
        languagePicker: failedPicker as any,
        languagePickerFlag: failedFlag as any,
        languagePickerLabel: failedLabel as any,
        languageFlags: {},
        translate: (key, fallback) => `${key}:${fallback}`,
        loadUiTranslations: async () => {},
        updateWebAppManifest: () => {},
        closeLanguageDialog: () => {},
        refreshLocalizedLabels: () => {
          failedRefreshes += 1;
        },
      });
      expect(failedResult).toEqual({
        loadId: 10,
        selectedSearchLocale: "",
        searchLabels: {},
        searchSubgroupLabels: {},
      });
      expect(state.searchAnnotations.get()).toEqual({});
      expect(failedPicker.disabled).toBe(false);
      expect(failedFlag.textContent).toBe("🌐");
      expect(failedLabel.textContent).toBe(
        "languageNotLoaded:Language not loaded",
      );
      expect(failedRefreshes).toBe(0);
      expect(warnings[0]?.[0]).toBe("Search language fr unavailable");

      const failedLocaleWarnings: any[] = [];
      console.warn = (...args: any[]) => {
        failedLocaleWarnings.push(args);
      };
      const failedLocaleResult = await setSearchLanguage({
        requestedLocale: "ar",
        searchLoadId: 11,
        searchLocales: [
          {
            locale: "ar",
            label: "Arabic",
            nativeLabel: "العربية",
            rtl: true,
            file: "ar.json",
            baseLocale: "en",
          },
        ],
        languagePicker: new FakeElement("button") as any,
        languagePickerFlag: new FakeElement("span") as any,
        languagePickerLabel: new FakeElement("span") as any,
        languageFlags: { ar: "🇸🇦" },
        translate: (key, fallback) => `${key}:${fallback}`,
        loadUiTranslations: async () => {},
        updateWebAppManifest: () => {},
        closeLanguageDialog: () => {},
        refreshLocalizedLabels: () => {},
      });
      expect(failedLocaleResult).toEqual({
        loadId: 11,
        selectedSearchLocale: "",
        searchLabels: {},
        searchSubgroupLabels: {},
      });
      expect(state.searchAnnotations.get()).toEqual({});
      expect(failedLocaleWarnings[0]?.[0]).toBe(
        "Search language ar unavailable",
      );
      console.warn = originalWarn;
    } finally {
      fixture.restore();
    }
  });
});
