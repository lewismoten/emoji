import { afterEach, describe, expect, it } from "vitest";

import documentRef, {
  addEventListener,
  querySelector,
  selectAll,
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
    const attributes = new Map<string, string>();
    const selectorResult = { id: "selector-result" };
    const allResult = [{ id: 1 }, { id: 2 }];

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
        documentElement: {
          setAttribute(name: string, value: string) {
            attributes.set(name, value);
          },
        },
        querySelector(selector: string) {
          const metaMatch = /^meta\[name="(.+)"\]$/.exec(selector);
          if (metaMatch) return metaByName.get(metaMatch[1]) ?? null;
          return selectorResult;
        },
        querySelectorAll() {
          return allResult;
        },
        title: "",
      },
    });

    expect(documentRef()).toBe(globalThis.document);
    expect(querySelector("#anything")).toBe(selectorResult);
    expect(selectAll(".items")).toBe(allResult);
    addEventListener("click", () => undefined);
    setDocAttribute("data-theme", "retro");
    setLocale("ar", "rtl");
    setTitle("Emoji Explorer");

    expect(listeners).toEqual(["click"]);
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
        documentElement: null,
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
    expect((globalThis.document as Document).title).toBe("No metas");

    Reflect.deleteProperty(globalThis, "document");
    const emptyList = selectAll(".missing");
    expect(emptyList.length).toBe(0);
    expect(querySelector(".missing")).toBeNull();
    expect(documentRef()).toBeUndefined();
    expect(() => addEventListener("click", () => undefined)).not.toThrow();
    expect(() => setDocAttribute("data-theme", "retro")).not.toThrow();
    expect(() => setLocale("en", "ltr")).not.toThrow();
    expect(() => setTitle("Missing doc")).not.toThrow();
  });
});
