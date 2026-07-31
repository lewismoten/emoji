import assert from "node:assert/strict";
import { setSearchLanguage } from "../../../src/explorer/language/search-language-picker.js";
import {
  FakeElement,
  installSearchLanguagePickerFixture,
} from "./search-language-picker-fixture.mjs";

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
    saveExplorerPreference: () => {},
    refreshLocalizedLabels: () => {
      failedRefreshes += 1;
    },
  });
  assert.deepEqual(failedResult, {
    loadId: 10,
    selectedSearchLocale: "",
    searchAnnotations: {},
    searchLabels: {},
    searchSubgroupLabels: {},
  });
  assert.equal(failedPicker.disabled, false);
  assert.equal(failedFlag.textContent, "🌐");
  assert.equal(
    failedLabel.textContent,
    "languageNotLoaded:Language not loaded",
  );
  assert.equal(failedRefreshes, 0);
  assert.equal(warnings[0]?.[0], "Search language fr unavailable");

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
    saveExplorerPreference: () => {},
    refreshLocalizedLabels: () => {},
  });
  assert.deepEqual(failedLocaleResult, {
    loadId: 11,
    selectedSearchLocale: "",
    searchAnnotations: {},
    searchLabels: {},
    searchSubgroupLabels: {},
  });
  assert.equal(
    failedLocaleWarnings[0]?.[0],
    "Search language ar unavailable",
  );
  console.warn = originalWarn;
} finally {
  fixture.restore();
}
