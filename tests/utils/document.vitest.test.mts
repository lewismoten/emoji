import { afterEach, describe, expect, it } from "vitest";

import documentRef, {
  addEventListener,
  all,
  getBaseUri,
  getData,
  getLocale,
  getRtl,
  querySelector,
  removeEventListener,
  selectAll,
  selectAllAndApply,
  setDocAttribute,
  setLocale,
  setTitle,
} from "../../src/utils/document.js";

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalNodeList = Object.getOwnPropertyDescriptor(
  globalThis,
  "NodeList",
);

class FakeNodeList<T = unknown> extends Array<T> {}

describe("utils/document", () => {
  afterEach(() => {
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
    if (originalNodeList) {
      Object.defineProperty(globalThis, "NodeList", originalNodeList);
    } else {
      Reflect.deleteProperty(globalThis, "NodeList");
    }
  });

  it("works against a present document and falls back safely without one", () => {
    const metaByName = new Map<string, { content: string }>([
      ["application-name", { content: "" }],
      ["apple-mobile-web-app-title", { content: "" }],
    ]);
    const listeners: string[] = [];
    const removedListeners: string[] = [];
    const attributes = new Map<string, string>();
    const selectorResult = { id: "selector-result" };
    const allResult = [{ id: 1 }, { id: 2 }];
    const classResult = [{ id: "class-1" }, { id: "class-2" }];

    Object.defineProperty(globalThis, "NodeList", {
      configurable: true,
      value: FakeNodeList,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        addEventListener(type: string) {
          listeners.push(type);
        },
        baseURI: "https://emoji.test/app",
        documentElement: {
          dataset: {
            locale: "fr",
            theme: "retro",
          },
          dir: "rtl",
          getAttribute(name: string) {
            return name === "lang" ? "ar" : null;
          },
          setAttribute(name: string, value: string) {
            attributes.set(name, value);
          },
        },
        getElementsByClassName(className: string) {
          return className === "items"
            ? (classResult as unknown as HTMLCollectionOf<Element>)
            : ([] as unknown as HTMLCollectionOf<Element>);
        },
        querySelector(selector: string) {
          const metaMatch = /^meta\[name="(.+)"\]$/.exec(selector);
          if (metaMatch) return metaByName.get(metaMatch[1]) ?? null;
          return selectorResult;
        },
        querySelectorAll() {
          return allResult;
        },
        removeEventListener(type: string) {
          removedListeners.push(type);
        },
        title: "",
      },
    });

    expect(documentRef()).toBe(globalThis.document);
    expect(querySelector("#anything")).toBe(selectorResult);
    expect(selectAll(".items")).toBe(allResult);
    expect(all("items")).toEqual(classResult);
    expect(getData("theme")).toBe("retro");
    expect(getBaseUri()).toBe("https://emoji.test/app");
    expect(getLocale()).toBe("ar");
    expect(getRtl()).toBe(true);
    const applied: number[] = [];
    selectAllAndApply(".items", (element) =>
      applied.push((element as unknown as { id: number }).id),
    );
    addEventListener("click", () => undefined);
    removeEventListener("click", () => undefined);
    setDocAttribute("data-theme", "retro");
    setLocale("ar", "rtl");
    setTitle("Emoji Explorer");

    expect(applied).toEqual([1, 2]);
    expect(listeners).toEqual(["click"]);
    expect(removedListeners).toEqual(["click"]);
    expect(attributes.get("data-theme")).toBe("retro");
    expect(attributes.get("lang")).toBe("ar");
    expect(attributes.get("dir")).toBe("rtl");
    expect((globalThis.document as Document).title).toBe("Emoji Explorer");
    expect(metaByName.get("application-name")?.content).toBe("Emoji Explorer");
    expect(metaByName.get("apple-mobile-web-app-title")?.content).toBe(
      "Emoji Explorer",
    );

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        baseURI: "https://emoji.test/fallback",
        documentElement: null,
        getElementsByClassName: undefined,
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return allResult;
        },
        title: "Original title",
      },
    });

    expect(() => setDocAttribute("data-theme", "retro")).toThrow();
    expect(() => setLocale("en", "ltr")).not.toThrow();
    setTitle("No metas");
    expect(getBaseUri()).toBe("https://emoji.test/fallback");
    expect(getLocale()).toBeUndefined();
    expect(getRtl()).toBeUndefined();
    expect(all("items")).toEqual(allResult);
    expect((globalThis.document as Document).title).toBe("No metas");

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: {
          dataset: {
            locale: "he",
          },
          dir: "ltr",
          getAttribute() {
            return null;
          },
        },
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
        title: "Fallback locale",
      },
    });

    expect(getLocale()).toBe("he");
    expect(getRtl()).toBe(false);

    Reflect.deleteProperty(globalThis, "document");
    const emptyList = selectAll(".missing");
    expect(emptyList.length).toBe(0);
    expect(querySelector(".missing")).toBeNull();
    expect(documentRef()).toBeUndefined();
    expect(getData("theme")).toBeUndefined();
    expect(getBaseUri()).toBeUndefined();
    expect(getLocale()).toBeUndefined();
    expect(getRtl()).toBeUndefined();
    expect(all("missing")).toEqual([]);
    expect(() => removeEventListener("click", () => undefined)).not.toThrow();
    expect(() => selectAllAndApply(".missing", () => undefined)).not.toThrow();
    expect(() => addEventListener("click", () => undefined)).not.toThrow();
    expect(() => setDocAttribute("data-theme", "retro")).not.toThrow();
    expect(() => setLocale("en", "ltr")).not.toThrow();
    expect(() => setTitle("Missing doc")).not.toThrow();
  });
});
