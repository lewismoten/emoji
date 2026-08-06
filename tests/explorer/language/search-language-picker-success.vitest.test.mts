import { describe, expect, it } from "vitest";

import { setSearchLanguage } from "../../../src/explorer/language/search-language-picker.js";
import * as state from "../../../src/state.js";
import {
  FakeElement,
  installSearchLanguagePickerFixture,
} from "./search-language-picker-fixture.mjs";

describe("search-language-picker success", () => {
  it("loads the requested locale pack and updates the picker UI", async () => {
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

      expect([...fetchCalls].sort()).toEqual([
        "locales/ar.json",
        "locales/en.json",
        "src/data/locales/en.json",
      ]);
      expect(successResult).toEqual({
        loadId: 9,
        selectedSearchLocale: "ar",
        searchLabels: { group: "مجموعة" },
        searchSubgroupLabels: { hand: "يد" },
      });
      expect(state.searchAnnotations.get()).toEqual({ wave: ["لوح"] });
      expect(successPicker.disabled).toBe(false);
      expect(successFlag.textContent).toBe("🇸🇦");
      expect(successLabel.textContent).toBe("العربية");
      expect(successCalls).toEqual([
        ["updateWebAppManifest", "ar"],
        ["closeLanguageDialog"],
        ["restoreLanguageParentPanel"],
        ["loadUiTranslations", "ar", true],
      ]);
    } finally {
      fixture.restore();
    }
  });
});
