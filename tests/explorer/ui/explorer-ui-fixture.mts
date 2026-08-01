type FakeElement = {
  attributes: Map<string, string>;
  checked?: boolean;
  classList: {
    active: Set<string>;
    toggle: (name: string, force?: boolean) => void;
  };
  content?: string;
  dataset: Record<string, string>;
  dir?: string;
  getAttribute: (name: string) => string | null;
  hidden?: boolean;
  lang?: string;
  placeholder?: string;
  querySelector?: (selector: string) => FakeElement | null;
  removeAttribute: (name: string) => void;
  setAttribute: (name: string, value: string) => void;
  tabIndex?: number;
  textContent?: string;
};

export type { FakeElement };

export const createElement = (
  dataset: Record<string, string> = {},
  textContent = "",
): FakeElement => {
  const attributes = new Map<string, string>();
  const active = new Set<string>();
  return {
    attributes,
    checked: false,
    classList: {
      active,
      toggle(name: string, force?: boolean) {
        if (force === false) active.delete(name);
        else if (force === true || !active.has(name)) active.add(name);
        else active.delete(name);
      },
    },
    dataset,
    getAttribute(name: string) {
      return attributes.get(name) ?? null;
    },
    removeAttribute(name: string) {
      attributes.delete(name);
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    tabIndex: -1,
    textContent,
  };
};

export function installExplorerUiFixture() {
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
  const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const originalNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    "navigator",
  );

  const i18nText = createElement({ i18n: "title" }, "Original title");
  const i18nPlaceholder = createElement(
    { i18nPlaceholder: "searchPlaceholder" },
    "",
  );
  i18nPlaceholder.placeholder = "Search";
  const i18nAria = createElement({ i18nAriaLabel: "theme" }, "");
  i18nAria.setAttribute("aria-label", "Theme");
  const offlineStatus = createElement({}, "");
  offlineStatus.hidden = true;

  const appMeta = { content: "" };
  const appleMeta = { content: "" };
  const themeMeta = { content: "" };

  const documentElement = {
    dataset: {} as Record<string, string>,
    dir: "ltr",
    hasAttribute(name: string) {
      if (name === "data-developer-mode") {
        return Boolean(documentElement.dataset.developerMode);
      }
      if (name === "data-full-developer-mode") {
        return Boolean(documentElement.dataset.fullDeveloperMode);
      }
      return false;
    },
    lang: "en",
    toggleAttribute(name: string, force?: boolean) {
      const key = name
        .replace(/^data-/, "")
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (force === false) delete documentElement.dataset[key];
      else documentElement.dataset[key] = "";
    },
  };

  const queryAllMap = new Map<string, FakeElement[]>([
    ["[data-i18n]", [i18nText]],
    ["[data-i18n-placeholder]", [i18nPlaceholder]],
    ["[data-i18n-aria-label]", [i18nAria]],
  ]);

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: false },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement,
      querySelector(selector: string) {
        if (selector === 'meta[name="application-name"]') return appMeta;
        if (selector === 'meta[name="apple-mobile-web-app-title"]')
          return appleMeta;
        if (selector === 'meta[name="theme-color"]') return themeMeta;
        return null;
      },
      querySelectorAll(selector: string) {
        return queryAllMap.get(selector) ?? [];
      },
      title: "",
    },
  });

  const fetchCalls: string[] = [];
  const defaultFetch = async (url: string) => {
    fetchCalls.push(url);
    if (url === "demo-locales/ui.en.json") {
      return { ok: false, async json() { return {}; } };
    }
    if (url === "src/demo-locales/ui.en.json") {
      return {
        ok: true,
        async json() {
          return {
            title: "Emoji Explorer",
            offlineStatus: "Offline",
            searchPlaceholder: "Find emoji",
            theme: "Theme label",
          };
        },
      };
    }
    if (url === "demo-locales/ui.en-US.json") {
      return { ok: false, async json() { return {}; } };
    }
    if (url === "src/demo-locales/ui.en-US.json") {
      return { ok: true, async json() { return {}; } };
    }
    if (url === "demo-locales/ui.ar.json") {
      return {
        ok: true,
        async json() {
          return { title: "مستكشف الإيموجي", offlineStatus: "غير متصل" };
        },
      };
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: defaultFetch,
  });

  return {
    appMeta,
    appleMeta,
    defaultFetch,
    documentElement,
    fetchCalls,
    i18nAria,
    i18nPlaceholder,
    i18nText,
    offlineStatus,
    restore() {
      if (originalDocument)
        Object.defineProperty(globalThis, "document", originalDocument);
      else Reflect.deleteProperty(globalThis, "document");
      if (originalFetch)
        Object.defineProperty(globalThis, "fetch", originalFetch);
      else Reflect.deleteProperty(globalThis, "fetch");
      if (originalNavigator)
        Object.defineProperty(globalThis, "navigator", originalNavigator);
      else Reflect.deleteProperty(globalThis, "navigator");
    },
    setFetch(value: unknown) {
      Object.defineProperty(globalThis, "fetch", {
        configurable: true,
        value,
      });
    },
    themeMeta,
  };
}
