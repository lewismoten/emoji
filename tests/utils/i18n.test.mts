import assert from "node:assert/strict";
import {
  applyTranslations,
  setTranslations,
  translate,
} from "../../src/utils/i18n.js";

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);

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
    return ariaAttributes.get(name) ?? "";
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
      if (selector === "[data-i18n-placeholder]") return [placeholderElement];
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

assert.equal(textElement.textContent, "مرحبا");
assert.equal(placeholderElement.placeholder, "ابحث");
assert.equal(ariaAttributes.get("aria-label"), "سمة");
assert.equal(documentElementAttributes.get("lang"), "ar");
assert.equal(documentElementAttributes.get("dir"), "rtl");
assert.equal((globalThis.document as Document).title, "مستكشف الإيموجي");
assert.equal(metaByName.get("application-name")?.content, "مستكشف الإيموجي");
assert.equal(translate("greeting", "fallback"), "مرحبا");

textElement.textContent = "fallback";
setTranslations("en", false, [{}]);
applyTranslations();
assert.equal(translate("greeting", "fallback"), "fallback");
assert.equal(textElement.textContent, "fallback");

if (originalDocument) {
  Object.defineProperty(globalThis, "document", originalDocument);
} else {
  Reflect.deleteProperty(globalThis, "document");
}
