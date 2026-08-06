import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, vi } from "vitest";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const preferenceCalls: Array<[string, string]> = [];
const renderCalls: string[] = [];

vi.mock("../../../src/preferences.js", () => ({
  setString(key: string, value: string) {
    preferenceCalls.push([key, value]);
  },
}));

vi.mock("../../../src/render-theme-toggle.js", () => ({
  renderThemeToggle() {
    renderCalls.push("render");
  },
}));

type FakeHead = {
  children: any[];
  appendChild(node: any): void;
};

describe("theme-styles", () => {
  beforeEach(() => {
    preferenceCalls.length = 0;
    renderCalls.length = 0;
  });

  afterEach(() => {
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  });

  it("ensures theme stylesheets exist, resolves themes, and handles theme selection", async () => {
    const module = await import("../../../src/explorer/theme/theme-styles.js");
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

    await module.ensureThemeStyles("retro");
    assert.deepEqual(
      head.children.map((child) => child.id),
      [
        "theme-ega-stylesheet",
        "theme-base-stylesheet",
        "theme-retro-stylesheet",
      ],
    );
    await module.ensureThemeStyles("retro");
    assert.equal(head.children.length, 3);
    await module.ensureThemeStyles("unknown");
    assert.equal(head.children.at(-1)?.id, "theme-dark-stylesheet");

    const pendingExisting = {
      addEventListener(type: string, listener: () => void) {
        if (type === "load") listener();
      },
      href: "./explorer/themes/base-theme.css",
      id: "theme-base-stylesheet",
      rel: "stylesheet",
      sheet: undefined,
    };
    head.children = [pendingExisting];
    await module.ensureThemeStyles("base");

    assert.equal(module.resolveTheme("base"), "base");
    assert.equal(module.resolveTheme("light"), "light");
    assert.equal(module.resolveTheme("retro"), "retro");
    assert.equal(module.resolveTheme("dark"), "dark");
    assert.equal(module.resolveTheme("something-else"), "dark");

    await module.selectTheme({
      currentTarget: {
        dataset: {
          theme: "retro",
        },
      },
    } as unknown as Event);
    assert.deepEqual(preferenceCalls.at(-1), ["theme", "retro"]);
    assert.equal(renderCalls.at(-1), "render");

    await module.selectTheme({
      currentTarget: {
        dataset: {},
      },
    } as unknown as Event);
    assert.deepEqual(preferenceCalls.at(-1), ["theme", "dark"]);

    Reflect.deleteProperty(globalThis, "document");
    await assert.doesNotReject(() => module.ensureThemeStyles("base"));
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
    await assert.doesNotReject(() => module.ensureThemeStyles("dark"));
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
    await assert.doesNotReject(() => module.ensureThemeStyles("light"));
  });
});
