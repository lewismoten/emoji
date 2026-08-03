import assert from "node:assert/strict";
import documentRef, {
  addEventListener,
  querySelector,
  selectAll,
  setDocAttribute,
  setLocale,
  setTitle,
} from "../../src/utils/document-ref.js";

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalNodeList = Object.getOwnPropertyDescriptor(
  globalThis,
  "NodeList",
);

class FakeNodeList<T = unknown> extends Array<T> {}

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

assert.equal(documentRef(), globalThis.document);
assert.equal(querySelector("#anything"), selectorResult);
assert.equal(selectAll(".items"), allResult);
addEventListener("click", () => undefined);
setDocAttribute("data-theme", "retro");
setLocale("ar", "rtl");
setTitle("Emoji Explorer");

assert.deepEqual(listeners, ["click"]);
assert.equal(attributes.get("data-theme"), "retro");
assert.equal(attributes.get("lang"), "ar");
assert.equal(attributes.get("dir"), "rtl");
assert.equal((globalThis.document as Document).title, "Emoji Explorer");
assert.equal(metaByName.get("application-name")?.content, "Emoji Explorer");
assert.equal(
  metaByName.get("apple-mobile-web-app-title")?.content,
  "Emoji Explorer",
);

Reflect.deleteProperty(globalThis, "document");
const emptyList = selectAll(".missing");
assert.equal(emptyList.length, 0);
assert.equal(querySelector(".missing"), null);
assert.equal(documentRef(), undefined);

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
