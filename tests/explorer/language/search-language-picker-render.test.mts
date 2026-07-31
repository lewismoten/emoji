import assert from "node:assert/strict";
import {
  renderSearchLanguages,
  selectLanguageLink,
} from "../../../src/explorer/language/search-language-picker.js";
import {
  FakeElement,
  installSearchLanguagePickerFixture,
} from "./search-language-picker-fixture.mjs";

const fixture = installSearchLanguagePickerFixture();

try {
  const languageList = new FakeElement("div");
  languageList.appendChild(new FakeElement("span"));
  const selectedCalls: any[] = [];
  renderSearchLanguages({
    languageFlags: { ar: "🇸🇦", es: "🇪🇸" },
    languageList: languageList as any,
    searchLocales: [
      {
        locale: "ar",
        label: "Arabic",
        nativeLabel: "العربية",
        rtl: true,
        file: "ar.json",
      },
      {
        locale: "es",
        label: "Spanish",
        nativeLabel: "Español",
        rtl: false,
        file: "es.json",
      },
    ],
    selectedSearchLocale: "ar",
    translate: (key, fallback) => `${key}:${fallback}`,
    onSelectLanguageLink: async (event, locale, href) => {
      selectedCalls.push({ event, locale, href });
    },
  });
  assert.equal(languageList.children.length, 3);
  const [noneOption, arabicOption, spanishOption] = languageList.children;
  assert.equal(noneOption.getAttribute("aria-checked"), "false");
  assert.equal(arabicOption.getAttribute("aria-checked"), "true");
  assert.equal(arabicOption.tabIndex, 0);
  assert.equal(spanishOption.tabIndex, -1);
  assert.equal(
    noneOption.children[2]?.textContent,
    "noLanguagePack:No language pack",
  );
  assert.equal(noneOption.children[1]?.textContent, "🌐");
  assert.match(String(selectedCalls.length), /^0$/);
  arabicOption.dispatch("click", { type: "click" });
  assert.deepEqual(selectedCalls[0], {
    event: { type: "click" },
    locale: "ar",
    href: "./index.ar.html?group=People",
  });
  assert.equal(spanishOption.children[2]?.textContent, "Spanish (Español)");

  fixture.windowStub.location.pathname = "/index.en.html";
  const englishSelectedList = new FakeElement("div");
  renderSearchLanguages({
    languageFlags: { en: "🇬🇧", es: "🇪🇸" },
    languageList: englishSelectedList as any,
    searchLocales: [
      {
        locale: "en",
        label: "English",
        nativeLabel: "English",
        rtl: false,
        file: "en.json",
      },
      {
        locale: "es",
        label: "Spanish",
        nativeLabel: "Español",
        rtl: false,
        file: "es.json",
      },
    ],
    selectedSearchLocale: "",
    translate: (key, fallback) => `${key}:${fallback}`,
    onSelectLanguageLink: async () => undefined,
  });
  const [noneWhenEnglishRoute, englishWhenEnglishRoute] =
    englishSelectedList.children;
  assert.equal(noneWhenEnglishRoute.getAttribute("aria-checked"), "false");
  assert.equal(englishWhenEnglishRoute.getAttribute("aria-checked"), "true");
  fixture.windowStub.location.pathname = "/index.en.html";

  let prevented = 0;
  const setCalls: string[] = [];
  await selectLanguageLink(
    {
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault() {
        prevented += 1;
      },
    } as any,
    "es",
    "./index.es.html?group=People",
    async (locale) => {
      setCalls.push(locale);
    },
  );
  assert.equal(prevented, 1);
  assert.deepEqual(setCalls, ["es"]);
  assert.deepEqual(fixture.historyCalls[0], {
    state: { locale: "es" },
    href: "/index.es.html?panel=help&emoji=wave&emojiMode=code&group=People",
  });

  const originalHref = fixture.windowStub.location.href;
  fixture.windowStub.location.href = undefined;
  (fixture.documentStub as any).baseURI = "http://fallback.test/base/index.en.html";
  await selectLanguageLink(
    {
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault() {},
    } as any,
    "ar",
    "./index.ar.html",
    async () => undefined,
  );
  assert.deepEqual(fixture.historyCalls[1], {
    state: { locale: "ar" },
    href: "/base/index.ar.html?panel=help&emoji=wave&emojiMode=code&group=People",
  });
  delete (fixture.documentStub as any).baseURI;
  fixture.windowStub.location.href = originalHref;

  prevented = 0;
  await selectLanguageLink(
    {
      button: 1,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault() {
        prevented += 1;
      },
    } as any,
    "ar",
    "./index.ar.html",
    async () => {
      throw new Error("modifier clicks should not select language");
    },
  );
  assert.equal(prevented, 0);

  await selectLanguageLink(
    {
      button: 0,
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault() {
        prevented += 1;
      },
    } as any,
    "ar",
    "./index.ar.html",
    async () => {
      throw new Error("meta clicks should not select language");
    },
  );
  assert.equal(prevented, 0);
} finally {
  fixture.restore();
}
