import assert from "node:assert/strict";

import { documentStub } from "./language-dialog-control-fixture.mjs";

type SearchLocale = {
  locale: string;
  label: string;
  nativeLabel: string;
  rtl: boolean;
  file: string;
  baseLocale?: string;
};

export function assertLocalizedLanguageCases(
  getLocalizedLanguageName: (
    locale: SearchLocale,
    selectedSearchLocale: string,
  ) => string,
) {
  documentStub.documentElement.lang = "en";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "ar",
        label: "Arabic",
        nativeLabel: "العربية",
        rtl: true,
        file: "ar.json",
      },
      "",
    ),
    "Arabic (العربية)",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "ar",
        label: "Arabic",
        nativeLabel: "العربية",
        rtl: true,
        file: "ar.json",
      },
      "ar",
    ),
    "Arabic",
  );
  documentStub.documentElement.lang = "ar";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "ar",
        label: "Arabic",
        nativeLabel: "العربية",
        rtl: true,
        file: "ar.json",
      },
      "",
    ),
    "العربية",
  );
  documentStub.documentElement.lang = "es";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "",
    ),
    "Neohabla (Newspeak)",
  );
  documentStub.documentElement.lang = "ar";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "",
    ),
    "لغة الأخبار (Newspeak)",
  );
  documentStub.documentElement.lang = "zh";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "",
    ),
    "新话 (Newspeak)",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "en-x-newspeak",
    ),
    "新话",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "新话",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "",
    ),
    "新话",
  );
  documentStub.documentElement.lang = "en-x-newspeak";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en",
        label: "English",
        nativeLabel: "English",
        rtl: false,
        file: "en.json",
      },
      "",
    ),
    "oldspeak (English)",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-GB",
        label: "British English",
        nativeLabel: "British English",
        rtl: false,
        file: "en-GB.json",
        baseLocale: "en",
      },
      "",
    ),
    "oldspeak (British English)",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "es",
        label: "Spanish",
        nativeLabel: "Español",
        rtl: false,
        file: "es.json",
      },
      "",
    ),
    "other oldspeak (Español)",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "",
    ),
    "newspeak",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "fr",
        label: "French",
        nativeLabel: "Français",
        rtl: false,
        file: "fr.json",
      },
      "fr",
    ),
    "other oldspeak",
  );
}

export function assertIntlFallbackCases(
  getLocalizedLanguageName: (
    locale: SearchLocale,
    selectedSearchLocale: string,
  ) => string,
) {
  Object.defineProperty(Intl, "DisplayNames", {
    configurable: true,
    value: class {
      static supportedLocalesOf() {
        return [];
      }

      constructor() {
        throw new Error("unsupported");
      }
    },
  });
  documentStub.documentElement.lang = "fr";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "de",
        label: "German",
        nativeLabel: "Deutsch",
        rtl: false,
        file: "de.json",
      },
      "",
    ),
    "German (Deutsch)",
  );

  Object.defineProperty(Intl, "DisplayNames", {
    configurable: true,
    value: class {
      static supportedLocalesOf() {
        return [];
      }

      constructor() {}

      of(value: string) {
        if (value === "pt-BR") return undefined;
        if (value === "pt") return "Portuguese";
        return value;
      }
    },
  });
  documentStub.documentElement.lang = "en";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "pt-BR",
        label: "Portuguese",
        nativeLabel: "Português",
        rtl: false,
        file: "pt-BR.json",
        baseLocale: "pt",
      },
      "",
    ),
    "Portuguese (Português)",
  );
}
