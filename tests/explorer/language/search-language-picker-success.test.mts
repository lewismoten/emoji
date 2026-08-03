import assert from "node:assert/strict";
import { setSearchLanguage } from "../../../src/explorer/language/search-language-picker.js";
import {
  FakeElement,
  installSearchLanguagePickerFixture,
} from "./search-language-picker-fixture.mjs";

const fixture = installSearchLanguagePickerFixture();

try {
  const fetchCalls: string[] = [];
  fixture.setFetch(async (url: string) => {
    fetchCalls.push(url);
    if (url === "locales/en.json") return { ok: false };
    if (url === "src/data/locales/en.json") {
      return {
        ok: true,
        json: async () => ({
          annotations: { wave: ["wave"] },
          labels: { group: "Group" },
          subgroups: { hand: "Hand" },
        }),
      };
    }
    if (url === "locales/ar.json") {
      return {
        ok: true,
        json: async () => ({
          annotations: { wave: ["لوح"] },
          labels: { group: "مجموعة" },
          subgroups: { hand: "يد" },
        }),
      };
    }
    return { ok: false };
  });

  const successPicker = new FakeElement("button");
  const successFlag = new FakeElement("span");
  const successLabel = new FakeElement("span");
  const successCalls: any[] = [];
  const successResult = await setSearchLanguage({
    requestedLocale: "ar",
    searchLoadId: 9,
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
    languagePicker: successPicker as any,
    languagePickerFlag: successFlag as any,
    languagePickerLabel: successLabel as any,
    languageFlags: { ar: "🇸🇦" },
    translate: (key, fallback) => `${key}:${fallback}`,
    loadUiTranslations: async (locale, rtl) => {
      successCalls.push(["loadUiTranslations", locale, rtl]);
    },
    updateWebAppManifest: (locale) => {
      successCalls.push(["updateWebAppManifest", locale]);
    },
    closeLanguageDialog: () => {
      successCalls.push(["closeLanguageDialog"]);
    },
    restoreLanguageParentPanel: () => {
      successCalls.push(["restoreLanguageParentPanel"]);
    },
    refreshLocalizedLabels: () => {
      successCalls.push(["refreshLocalizedLabels"]);
    },
  });
  assert.deepEqual([...fetchCalls].sort(), [
    "locales/ar.json",
    "locales/en.json",
    "src/data/locales/en.json",
  ]);
  assert.deepEqual(successResult, {
    loadId: 9,
    selectedSearchLocale: "ar",
    searchAnnotations: { wave: ["لوح"] },
    searchLabels: { group: "مجموعة" },
    searchSubgroupLabels: { hand: "يد" },
  });
  assert.equal(successPicker.disabled, false);
  assert.equal(successFlag.textContent, "🇸🇦");
  assert.equal(successLabel.textContent, "العربية");
  assert.deepEqual(successCalls, [
    ["updateWebAppManifest", "ar"],
    ["closeLanguageDialog"],
    ["restoreLanguageParentPanel"],
    ["loadUiTranslations", "ar", true],
  ]);
} finally {
  fixture.restore();
}
