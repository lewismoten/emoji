import assert from "node:assert/strict";
import {
  renderSearchLanguages,
  selectLanguageLink,
  setSearchLanguage,
} from "../../../src/explorer/language/search-language-picker.js";

class FakeElement {
  tagName: string;
  className = "";
  textContent = "";
  hidden = false;
  disabled = false;
  checked = false;
  tabIndex = 0;
  type = "";
  name = "";
  value = "";
  children: FakeElement[] = [];
  listeners = new Map<string, Array<(event: any) => void>>();
  attributes = new Map<string, string>();
  classSet = new Set<string>();
  classList = {
    toggle: (token: string, force?: boolean) => {
      const shouldInclude =
        force === undefined ? !this.classSet.has(token) : Boolean(force);
      if (shouldInclude) this.classSet.add(token);
      else this.classSet.delete(token);
      this.className = [...this.classSet].join(" ");
    },
  };

  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
  }

  append(...children: FakeElement[]) {
    this.children.push(...children);
  }

  appendChild(child: FakeElement) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...children: FakeElement[]) {
    this.children = [...children];
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, listener: (event: any) => void) {
    const handlers = this.listeners.get(type) ?? [];
    handlers.push(listener);
    this.listeners.set(type, handlers);
  }

  dispatch(type: string, event: any = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");

const documentStub = {
  documentElement: { lang: "en" },
  createElement(tagName: string) {
    return new FakeElement(tagName);
  },
};
const historyCalls: any[] = [];
const windowStub: any = {
  location: {
    href: "http://localhost/index.en.html?panel=help&emoji=wave&emojiMode=code&group=People",
    pathname: "/index.en.html",
    search: "?panel=help&emoji=wave&emojiMode=code&group=People",
    hash: "",
  },
  history: {
    pushState(state: any, _unused: string, href: string) {
      historyCalls.push({ state, href });
    },
  },
};

Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: documentStub,
});
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: windowStub,
});

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

  windowStub.location.pathname = "/index.en.html";
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
  windowStub.location.pathname = "/index.en.html";

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
  assert.deepEqual(historyCalls[0], {
    state: { locale: "es" },
    href: "/index.es.html?panel=help&emoji=wave&emojiMode=code&group=People",
  });
  const originalHref = windowStub.location.href;
  windowStub.location.href = undefined;
  (documentStub as any).baseURI = "http://fallback.test/base/index.en.html";
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
  assert.deepEqual(historyCalls[1], {
    state: { locale: "ar" },
    href: "/base/index.ar.html?panel=help&emoji=wave&emojiMode=code&group=People",
  });
  delete (documentStub as any).baseURI;
  windowStub.location.href = originalHref;

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
    saveExplorerPreference: (key, value) => {
      emptyCalls.push(["saveExplorerPreference", key, value]);
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
    ["saveExplorerPreference", "locale", ""],
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
    saveExplorerPreference: () => {
      emptyNoRestoreCalls.push("saveExplorerPreference");
    },
    refreshLocalizedLabels: () => {},
  });
  assert.deepEqual(emptyNoRestoreCalls, [
    "updateWebAppManifest",
    "closeLanguageDialog",
    "loadUiTranslations",
    "saveExplorerPreference",
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
    saveExplorerPreference: () => {},
    refreshLocalizedLabels: () => {},
  });
  assert.deepEqual(notFoundResult, {
    loadId: 8,
    selectedSearchLocale: "",
    searchAnnotations: {},
    searchLabels: {},
    searchSubgroupLabels: {},
  });

  const fetchCalls: string[] = [];
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string) => {
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
    },
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
    saveExplorerPreference: (key, value) => {
      successCalls.push(["saveExplorerPreference", key, value]);
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
    ["loadUiTranslations", "ar", true],
    ["closeLanguageDialog"],
    ["restoreLanguageParentPanel"],
    ["saveExplorerPreference", "locale", "ar"],
  ]);

  const warnings: any[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    warnings.push(args);
  };
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => ({ ok: false }),
  });
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
  console.warn = originalWarn;
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
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => ({ ok: false }),
  });
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
  console.warn = originalWarn;
  assert.equal(failedLocaleWarnings[0]?.[0], "Search language ar unavailable");
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else delete (globalThis as any).window;
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
  if (originalFetch) Object.defineProperty(globalThis, "fetch", originalFetch);
  else delete (globalThis as any).fetch;
}
