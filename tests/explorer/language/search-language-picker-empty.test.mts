import assert from "node:assert/strict";
import { setSearchLanguage } from "../../../src/explorer/language/search-language-picker.js";
import {
  FakeElement,
  installSearchLanguagePickerFixture,
} from "./search-language-picker-fixture.mjs";

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
  assert.deepEqual(emptyResult, {
    loadId: 7,
    selectedSearchLocale: "",
    searchAnnotations: {},
    searchLabels: {},
    searchSubgroupLabels: {},
  });
  assert.equal(languagePickerFlag.textContent, "🌐");
  assert.equal(
    languagePickerLabel.textContent,
    "languageNotLoaded:Language not loaded",
  );
  assert.deepEqual(emptyCalls, [
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
  assert.deepEqual(emptyNoRestoreCalls, [
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
  assert.deepEqual(notFoundResult, {
    loadId: 8,
    selectedSearchLocale: "",
    searchAnnotations: {},
    searchLabels: {},
    searchSubgroupLabels: {},
  });
} finally {
  fixture.restore();
}
