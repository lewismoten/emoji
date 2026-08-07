import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyTranslations,
  getLocale,
  setTranslations,
  translate,
} from "../../src/utils/i18n.js";

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);

describe("utils/i18n", () => {
  afterEach(() => {
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  });

  it("applies translations across text, placeholders, aria labels, and title", () => {
    const textElement = {
      dataset: { i18n: "greeting" },
      textContent: "fallback",
    };
    const placeholderElement = {
      dataset: { i18nPlaceholder: "search" },
      placeholder: "placeholder",
    };
    const ariaAttributes = new Map<string, string>();
    const ariaElement = {
      dataset: { i18nAriaLabel: "themeLabel" },
      getAttribute(name: string) {
        return ariaAttributes.get(name) ?? null;
      },
      setAttribute(name: string, value: string) {
        ariaAttributes.set(name, value);
      },
    };
    const metaByName = new Map<string, { content: string }>([
      ["application-name", { content: "" }],
      ["apple-mobile-web-app-title", { content: "" }],
    ]);
    const documentElementAttributes = new Map<string, string>();

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: {
          setAttribute(name: string, value: string) {
            documentElementAttributes.set(name, value);
          },
        },
        querySelector(selector: string) {
          const metaMatch = /^meta\[name="(.+)"\]$/.exec(selector);
          return metaMatch ? (metaByName.get(metaMatch[1]) ?? null) : null;
        },
        querySelectorAll(selector: string) {
          if (selector === "[data-i18n]") return [textElement];
          if (selector === "[data-i18n-placeholder]")
            return [placeholderElement];
          if (selector === "[data-i18n-aria-label]") return [ariaElement];
          return [];
        },
        title: "",
      },
    });

    setTranslations("ar", true, [
      {
        greeting: "مرحبا",
        search: "ابحث",
        themeLabel: "سمة",
        title: "مستكشف الإيموجي",
      },
    ]);

    expect(textElement.textContent).toBe("مرحبا");
    expect(placeholderElement.placeholder).toBe("ابحث");
    expect(ariaAttributes.get("aria-label")).toBe("سمة");
    expect(documentElementAttributes.get("lang")).toBe("ar");
    expect(documentElementAttributes.get("dir")).toBe("rtl");
    expect((globalThis.document as Document).title).toBe("مستكشف الإيموجي");
    expect(metaByName.get("application-name")?.content).toBe("مستكشف الإيموجي");
    expect(translate("greeting", "fallback")).toBe("مرحبا");
    expect(translate(undefined, "fallback")).toBe("fallback");

    textElement.textContent = "fallback";
    placeholderElement.placeholder = "placeholder";
    ariaAttributes.set("aria-label", "Theme");
    setTranslations("en", false, [{}]);
    applyTranslations();
    expect(translate("greeting", "fallback")).toBe("fallback");
    expect(textElement.textContent).toBe("fallback");
    expect(placeholderElement.placeholder).toBe("placeholder");
    expect(ariaAttributes.get("aria-label")).toBe("Theme");

    textElement.textContent = undefined as unknown as string;
    placeholderElement.placeholder = undefined as unknown as string;
    ariaAttributes.clear();
    setTranslations("en", false, [
      {
        greeting: "Hello",
        search: "Find",
        themeLabel: "Theme label",
      },
    ]);
    expect(textElement.textContent).toBe("Hello");
    expect(placeholderElement.placeholder).toBe("Find");
    expect(ariaAttributes.get("aria-label")).toBe("Theme label");

    textElement.textContent = "fallback";
    setTranslations("en", false);
    expect(textElement.textContent).toBe("fallback");
  });

  it("prefers the route locale and falls back to the document locale", async () => {
    const route = await import("../../src/app/route.js");
    const documentUtils = await import("../../src/utils/document.js");

    const routeSpy = vi.spyOn(route, "getLocale");
    const documentSpy = vi.spyOn(documentUtils, "getLocale");

    routeSpy.mockReturnValue("es");
    documentSpy.mockReturnValue("fr");
    expect(getLocale()).toBe("es");

    routeSpy.mockReturnValue(undefined);
    expect(getLocale()).toBe("fr");

    routeSpy.mockRestore();
    documentSpy.mockRestore();
  });
});
