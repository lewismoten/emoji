import { describe, expect, it } from "vitest";

import * as state from "../../../src/state.js";
import { setSearchLanguage } from "../../../src/explorer/language/search-language-picker.js";
import {
  FakeElement,
  installSearchLanguagePickerFixture,
} from "./search-language-picker-fixture.mjs";

describe("search-language-picker empty", () => {
  it("handles empty and unknown language selections", async () => {
    const fixture = installSearchLanguagePickerFixture();

    try {
      const languagePicker = new FakeElement("button");
      const languagePickerFlag = new FakeElement("span");
      const languagePickerLabel = new FakeElement("span");
      const emptyCalls: any[] = [];
      const emptyResult = await setSearchLanguage({
        requestedLocale: "",
        searchLoadId: 7,
        searchLocales: [],
        languagePicker: languagePicker as any,
        languagePickerFlag: languagePickerFlag as any,
        languagePickerLabel: languagePickerLabel as any,
        languageFlags: {},
        translate: (key, fallback) => `${key}:${fallback}`,
        loadUiTranslations: async (locale) => {
          emptyCalls.push(["loadUiTranslations", locale]);
        },
        updateWebAppManifest: (locale) => {
          emptyCalls.push(["updateWebAppManifest", locale ?? ""]);
        },
        closeLanguageDialog: () => {
          emptyCalls.push(["closeLanguageDialog"]);
        },
        restoreLanguageParentPanel: () => {
          emptyCalls.push(["restoreLanguageParentPanel"]);
        },
        refreshLocalizedLabels: () => {
          emptyCalls.push(["refreshLocalizedLabels"]);
        },
      });
      expect(emptyResult).toEqual({
        loadId: 7,
        selectedSearchLocale: "",
        searchLabels: {},
        searchSubgroupLabels: {},
      });
      expect(state.searchAnnotations.get()).toEqual({});
      expect(languagePickerFlag.textContent).toBe("🌐");
      expect(languagePickerLabel.textContent).toBe(
        "languageNotLoaded:Language not loaded",
      );
      expect(emptyCalls).toEqual([
        ["updateWebAppManifest", ""],
        ["closeLanguageDialog"],
        ["restoreLanguageParentPanel"],
        ["loadUiTranslations", "en"],
      ]);

      const emptyNoRestoreCalls: any[] = [];
      await setSearchLanguage({
        requestedLocale: "",
        searchLoadId: 12,
        searchLocales: [],
        languagePicker: new FakeElement("button") as any,
        languagePickerFlag: new FakeElement("span") as any,
        languagePickerLabel: new FakeElement("span") as any,
        languageFlags: {},
        translate: (_key, fallback) => fallback,
        loadUiTranslations: async () => {
          emptyNoRestoreCalls.push("loadUiTranslations");
        },
        updateWebAppManifest: () => {
          emptyNoRestoreCalls.push("updateWebAppManifest");
        },
        closeLanguageDialog: () => {
          emptyNoRestoreCalls.push("closeLanguageDialog");
        },
        refreshLocalizedLabels: () => {},
      });
      expect(emptyNoRestoreCalls).toEqual([
        "updateWebAppManifest",
        "closeLanguageDialog",
        "loadUiTranslations",
      ]);

      const localePicker = new FakeElement("button");
      const localeFlag = new FakeElement("span");
      const localeLabel = new FakeElement("span");
      const notFoundResult = await setSearchLanguage({
        requestedLocale: "zz",
        searchLoadId: 8,
        searchLocales: [],
        languagePicker: localePicker as any,
        languagePickerFlag: localeFlag as any,
        languagePickerLabel: localeLabel as any,
        languageFlags: {},
        translate: (_key, fallback) => fallback,
        loadUiTranslations: async () => {},
        updateWebAppManifest: () => {
          throw new Error("unknown locale should not update manifest");
        },
        closeLanguageDialog: () => {},
        refreshLocalizedLabels: () => {},
      });
      expect(notFoundResult).toEqual({
        loadId: 8,
        selectedSearchLocale: "",
        searchLabels: {},
        searchSubgroupLabels: {},
      });
      expect(state.searchAnnotations.get()).toEqual({});
    } finally {
      fixture.restore();
    }
  });
});
