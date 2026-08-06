import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";

import { ensureThemeStyles } from "../../../src/explorer/theme/theme-styles.js";

type FakeHead = {
  children: any[];
  appendChild(node: any): void;
};

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

afterEach(() => {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
});

describe("theme-styles", () => {
  it("ensures theme stylesheets exist and tolerates missing document capabilities", async () => {
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
    await ensureThemeStyles("unknown");
    assert.equal(head.children.at(-1)?.id, "theme-dark-stylesheet");
    const pendingExisting = {
      addEventListener(type: string, listener: () => void) {
        if (type === "load") listener();
      },
      id: "theme-base-stylesheet",
      rel: "stylesheet",
      href: "./explorer/themes/base-theme.css",
      sheet: undefined,
    };
    head.children = [pendingExisting];
    await ensureThemeStyles("base");
    Reflect.deleteProperty(globalThis, "document");
    await assert.doesNotReject(() => ensureThemeStyles("base"));
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        createElement() {
          throw new Error("should not create");
        },
        getElementById() {
          return null;
        },
      },
    });
    await assert.doesNotReject(() => ensureThemeStyles("dark"));
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        createElement: undefined,
        getElementById() {
          return null;
        },
        head: null,
      },
    });
    await assert.doesNotReject(() => ensureThemeStyles("light"));
  });
});
