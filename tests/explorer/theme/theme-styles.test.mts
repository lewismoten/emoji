import assert from "node:assert/strict";

import { ensureThemeStyles } from "../../../src/explorer/theme/theme-styles.js";

type FakeHead = {
  children: any[];
  appendChild(node: any): void;
};

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

const head: FakeHead = {
  children: [],
  appendChild(node) {
    this.children.push(node);
  },
};

Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    createElement(tagName: string) {
      return {
        addEventListener(type: string, listener: () => void) {
          if (type === "load") listener();
        },
        href: "",
        id: "",
        rel: "",
        sheet: {},
        tagName,
      };
    },
    getElementById(id: string) {
      return head.children.find((child) => child.id === id) ?? null;
    },
    head,
  },
});

try {
  await ensureThemeStyles("retro");
  assert.deepEqual(
    head.children.map((child) => child.id),
    [
      "theme-ega-stylesheet",
      "theme-base-stylesheet",
      "theme-retro-stylesheet",
    ],
  );
  await ensureThemeStyles("retro");
  assert.equal(head.children.length, 3);
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
