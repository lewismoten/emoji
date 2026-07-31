import assert from "node:assert/strict";
import { createSearchLanguageLifecycle } from "../../../src/explorer/language/search-language-lifecycle.js";

class FakeElement {
  tagName: string;
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string | undefined> = {};
  disabled = false;
  hidden = false;
  checked = false;
  tabIndex = 0;
  open = false;
  className = "";
  private textValue = "";
  title = "";
  listeners = new Map<string, Array<(event: any) => void>>();
  classSet = new Set<string>();
  classList = {
    toggle: (token: string, force?: boolean) => {
      const shouldInclude =
        force === undefined ? !this.classSet.has(token) : Boolean(force);
      if (shouldInclude) this.classSet.add(token);
      else this.classSet.delete(token);
      this.className = [...this.classSet].join(" ");
      return shouldInclude;
    },
  };

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get textContent() {
    return this.textValue;
  }

  set textContent(value: string) {
    this.textValue = value;
  }

  get text() {
    return this.textValue;
  }

  set text(value: string) {
    this.textValue = value;
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
    const entries = this.listeners.get(type) ?? [];
    entries.push(listener);
    this.listeners.set(type, entries);
  }

  dispatch(type: string, event: any = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  querySelector(selector: string) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string) {
    const matches = (element: FakeElement) => {
      if (selector === ".language-option") {
        return element.className.split(/\s+/).includes("language-option");
      }
      if (selector === '[role="radio"]') {
        return element.getAttribute("role") === "radio";
      }
      if (selector === '[aria-checked="true"]') {
        return element.getAttribute("aria-checked") === "true";
      }
      return false;
    };
    const results: FakeElement[] = [];
    const stack = [...this.children];
    while (stack.length > 0) {
      const current = stack.shift()!;
      if (matches(current)) results.push(current);
      stack.unshift(...current.children);
    }
    return results;
  }

  focus() {}
}

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");

const historyCalls: any[] = [];
const windowStub: any = {
  location: {
    search: "?panel=help&group=Smileys",
    pathname: "/emoji/index.en.html",
  },
  history: {
    pushState(state: any, _unused: string, href: string) {
      historyCalls.push({ state, href });
    },
  },
};
const documentStub: any = {
  documentElement: { lang: "en" },
  createElement(tagName: string) {
    return new FakeElement(tagName);
  },
};

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: windowStub,
});
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: documentStub,
});

function createLifecycleHarness(options: {
  nextLoadId?: number;
  currentLoadId?: number;
  currentLocale?: string;
  initialLocales?: Array<any>;
}) {
  let searchLocales = options.initialLocales ?? [];
  let selectedSearchLocale = options.currentLocale ?? "";
  let searchAnnotations: Record<string, string[]> = {};
  let searchLabels: Record<string, string> = {};
  let searchSubgroupLabels: Record<string, string> = {};
  let loadId = options.currentLoadId ?? 1;
  const languageList = new FakeElement("div");
  const languagePicker = new FakeElement("button");
  const languagePickerFlag = new FakeElement("span");
  const languagePickerLabel = new FakeElement("span");
  const calls: any[] = [];
  const lifecycle = createSearchLanguageLifecycle({
    languageFlags: { ar: "🇸🇦", en: "🇬🇧" },
    languageList: () => languageList,
    searchLocales: () => searchLocales,
    selectedSearchLocale: () => selectedSearchLocale,
    translate: (_key: string, fallback: string) => fallback,
    nextLoadId: () => options.nextLoadId ?? loadId,
    currentLoadId: () => loadId,
    languagePicker: () => languagePicker,
    languagePickerFlag: () => languagePickerFlag,
    languagePickerLabel: () => languagePickerLabel,
    loadUiTranslations: async (locale: string, rtl?: boolean) => {
      calls.push(["loadUiTranslations", locale, rtl]);
    },
    updateWebAppManifest: (locale?: string) => {
      calls.push(["updateWebAppManifest", locale ?? ""]);
    },
    closeLanguageDialog: () => {
      calls.push(["closeLanguageDialog"]);
    },
    restoreLanguageParentPanel: () => {
      calls.push(["restoreLanguageParentPanel"]);
    },
    saveExplorerPreference: (key: string, value: string) => {
      calls.push(["saveExplorerPreference", key, value]);
    },
    refreshLocalizedLabels: () => {
      calls.push(["refreshLocalizedLabels"]);
    },
    setSelectedLocale: (value: string) => {
      selectedSearchLocale = value;
      calls.push(["setSelectedLocale", value]);
    },
    setSearchAnnotations: (value: Record<string, string[]>) => {
      searchAnnotations = value;
      calls.push(["setSearchAnnotations", value]);
    },
    setSearchLabels: (value: Record<string, string>) => {
      searchLabels = value;
      calls.push(["setSearchLabels", value]);
    },
    setSearchSubgroupLabels: (value: Record<string, string>) => {
      searchSubgroupLabels = value;
      calls.push(["setSearchSubgroupLabels", value]);
    },
    setSearchLocales: (value: Array<any>) => {
      searchLocales = value;
      calls.push(["setSearchLocales", value]);
    },
    setApplyingUrlState: (value: boolean) => {
      calls.push(["setApplyingUrlState", value]);
    },
    restoreDeveloperMode: () => {
      calls.push(["restoreDeveloperMode"]);
    },
    applyDialogUrlState: () => {
      calls.push(["applyDialogUrlState"]);
    },
    syncUrlState: () => {
      calls.push(["syncUrlState"]);
    },
  });
  return {
    calls,
    lifecycle,
    languageList,
    languagePicker,
    languagePickerFlag,
    languagePickerLabel,
    getSelectedSearchLocale: () => selectedSearchLocale,
    getSearchAnnotations: () => searchAnnotations,
    getSearchLabels: () => searchLabels,
    getSearchSubgroupLabels: () => searchSubgroupLabels,
    getSearchLocales: () => searchLocales,
    setCurrentLoadId: (value: number) => {
      loadId = value;
    },
  };
}

try {
  const renderHarness = createLifecycleHarness({
    currentLocale: "ar",
    initialLocales: [
      {
        locale: "ar",
        label: "Arabic",
        nativeLabel: "العربية",
        rtl: true,
        file: "ar.json",
      },
    ],
  });
  renderHarness.lifecycle.render();
  assert.equal(renderHarness.languageList.children.length, 2);

  const staleHarness = createLifecycleHarness({ nextLoadId: 3, currentLoadId: 2 });
  await staleHarness.lifecycle.set("");
  assert.deepEqual(
    staleHarness.calls.filter((entry) => entry[0].startsWith("setSearch")),
    [],
  );
  assert.equal(staleHarness.getSelectedSearchLocale(), "");

  const setHarness = createLifecycleHarness({ nextLoadId: 4, currentLoadId: 4 });
  await setHarness.lifecycle.set("");
  assert.equal(setHarness.getSelectedSearchLocale(), "");
  assert.deepEqual(setHarness.getSearchAnnotations(), {});
  assert.deepEqual(setHarness.getSearchLabels(), {});
  assert.deepEqual(setHarness.getSearchSubgroupLabels(), {});
  assert.deepEqual(
    setHarness.calls.filter((entry) => entry[0].startsWith("setSearch")),
    [
      ["setSearchAnnotations", {}],
      ["setSearchLabels", {}],
      ["setSearchSubgroupLabels", {}],
    ],
  );
  assert.ok(setHarness.languageList.children.length >= 1);

  const selectHarness = createLifecycleHarness({ nextLoadId: 5, currentLoadId: 5 });
  await selectHarness.lifecycle.select(
    {
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault() {
        historyCalls.push("prevented");
      },
    } as any,
    "",
    "./?group=Smileys",
  );
  assert.equal(
    historyCalls[historyCalls.length - 1].href,
    "/emoji/?panel=help&group=Smileys#undefined",
  );

  const manifestCalls: string[] = [];
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string) => {
      manifestCalls.push(url);
      if (url === "locales/manifest.json") {
        return {
          ok: true,
          json: async () => ({
            locales: [
              {
                locale: "ar",
                label: "Arabic",
                nativeLabel: "العربية",
                rtl: true,
                file: "ar.json",
              },
            ],
          }),
        };
      }
      if (url === "locales/ar.json") {
        return {
          ok: true,
          json: async () => ({
            annotations: { wave: ["لوح"] },
            labels: { greeting: "تحية" },
            subgroups: { hand: "يد" },
          }),
        };
      }
      throw new Error(`Unexpected fetch ${url}`);
    },
  });
  const loadHarness = createLifecycleHarness({ nextLoadId: 6, currentLoadId: 6 });
  await loadHarness.lifecycle.load("ar");
  assert.deepEqual(manifestCalls, ["locales/manifest.json", "locales/ar.json"]);
  assert.equal(loadHarness.getSearchLocales().length, 1);
  assert.equal(loadHarness.getSelectedSearchLocale(), "ar");
  assert.deepEqual(loadHarness.getSearchAnnotations(), { wave: ["لوح"] });
  assert.ok(loadHarness.languageList.children.length >= 1);

  const fallbackCalls: string[] = [];
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string) => {
      fallbackCalls.push(url);
      if (url === "locales/manifest.json") return { ok: false };
      if (url === "src/data/locales/manifest.json") {
        return { ok: true, json: async () => ({ locales: [] }) };
      }
      return { ok: false };
    },
  });
  const fallbackHarness = createLifecycleHarness({});
  await fallbackHarness.lifecycle.load("fr");
  assert.deepEqual(fallbackCalls, [
    "locales/manifest.json",
    "src/data/locales/manifest.json",
  ]);
  const noInitialHarness = createLifecycleHarness({});
  await noInitialHarness.lifecycle.load("");
  assert.deepEqual(
    noInitialHarness.calls.filter((entry) => entry[0] === "setSelectedLocale"),
    [],
  );
  const invalidInitialHarness = createLifecycleHarness({});
  await invalidInitialHarness.lifecycle.load("fr");
  assert.deepEqual(
    invalidInitialHarness.calls.filter((entry) => entry[0] === "setSelectedLocale"),
    [],
  );

  const warnings: any[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    warnings.push(args);
  };
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => ({ ok: false }),
  });
  const failedLoadHarness = createLifecycleHarness({});
  await failedLoadHarness.lifecycle.load("ar");
  console.warn = originalWarn;
  assert.equal(failedLoadHarness.languagePicker.disabled, true);
  assert.equal(warnings[0]?.[0], "Search language packs unavailable");

  const popCalls: string[] = [];
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string) => {
      popCalls.push(url);
      if (url === "locales/en.json") return { ok: true, json: async () => ({}) };
      return { ok: false };
    },
  });
  windowStub.location.pathname = "/emoji/index.en.html";
  const popHarness = createLifecycleHarness({
    nextLoadId: 8,
    currentLoadId: 8,
    initialLocales: [
      { locale: "en", label: "English", nativeLabel: "English", rtl: false, file: "en.json" },
    ],
  });
  await popHarness.lifecycle.onPopState();
  assert.deepEqual(
    popHarness.calls.filter((entry) => [
      "setApplyingUrlState",
      "restoreDeveloperMode",
      "applyDialogUrlState",
      "syncUrlState",
    ].includes(entry[0])),
    [
      ["setApplyingUrlState", true],
      ["restoreDeveloperMode"],
      ["applyDialogUrlState"],
      ["setApplyingUrlState", false],
      ["syncUrlState"],
    ],
  );

  windowStub.location.pathname = "/emoji/index.zz.html";
  const ignoredPopHarness = createLifecycleHarness({
    nextLoadId: 9,
    currentLoadId: 9,
    initialLocales: [
      { locale: "en", label: "English", nativeLabel: "English", rtl: false, file: "en.json" },
    ],
  });
  await ignoredPopHarness.lifecycle.onPopState();
  assert.deepEqual(
    ignoredPopHarness.calls.filter((entry) => entry[0] === "setSelectedLocale"),
    [],
  );
  windowStub.location.pathname = "/emoji/";
  const emptyPopHarness = createLifecycleHarness({
    nextLoadId: 11,
    currentLoadId: 11,
    initialLocales: [
      { locale: "en", label: "English", nativeLabel: "English", rtl: false, file: "en.json" },
    ],
  });
  await emptyPopHarness.lifecycle.onPopState();
  assert.ok(
    emptyPopHarness.calls.some(
      (entry) => entry[0] === "setSelectedLocale" && entry[1] === "",
    ),
  );

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string) => {
      if (url === "locales/en-x-newspeak.json") {
        return {
          ok: true,
          json: async () => ({
            annotations: { grinningFace: ["++good face"] },
            labels: { unicode: "--word" },
            subgroups: { hand: "hand" },
          }),
        };
      }
      return { ok: false };
    },
  });
  windowStub.location.pathname = "/emoji/index.en-x-newspeak.html";
  const newspeakPopHarness = createLifecycleHarness({
    nextLoadId: 10,
    currentLoadId: 10,
    initialLocales: [
      {
        locale: "en-x-newspeak",
        label: "Newspeak",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
      },
    ],
  });
  await newspeakPopHarness.lifecycle.onPopState();
  assert.equal(
    newspeakPopHarness.getSelectedSearchLocale(),
    "en-x-newspeak",
  );
  assert.ok(
    newspeakPopHarness.calls.some(
      (entry) =>
        entry[0] === "setSelectedLocale" && entry[1] === "en-x-newspeak",
    ),
  );
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else delete (globalThis as any).window;
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
  if (originalFetch) Object.defineProperty(globalThis, "fetch", originalFetch);
  else delete (globalThis as any).fetch;
}
