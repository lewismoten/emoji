import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { ensurePickerControls } from "../../../src/explorer/utility/utility-picker-controls.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

class FakeElement {
  className = "";
  id = "";
  hidden = false;
  textContent = "";
  childNodes: Array<FakeElement | string> = [];
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string> = {};
  parent: FakeElement | null = null;

  constructor(readonly tagName: string) {}

  append(...nodes: Array<FakeElement | string>) {
    this.childNodes.push(...nodes);
    for (const node of nodes) {
      if (node instanceof FakeElement) {
        node.parent = this;
        this.children.push(node);
      }
    }
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  querySelector(selector: string) {
    if (selector.startsWith(".")) {
      const className = selector.slice(1);
      return (
        this.children.find((child) =>
          child.className.split(/\s+/).includes(className),
        ) ?? null
      );
    }
    return null;
  }

  closest(selector: string) {
    return selector === ".filter-field" ? this : this.parent;
  }
}

describe("utility-picker-controls", () => {
  it("creates picker triggers and dialogs only when needed", () => {
    const groupField = new FakeElement("div");
    groupField.className = "filter-field";
    const subGroupField = new FakeElement("div");
    subGroupField.className = "filter-field";

    const basicFilterGrid = {
      querySelector(selector: string) {
        if (selector === ".group-picker-trigger") return null;
        if (selector === ".subgroup-picker-trigger") return null;
        if (selector === ".select-group") return { closest: () => groupField };
        if (selector === ".select-subgroup") return { closest: () => subGroupField };
        return null;
      },
    };

    const main = new FakeElement("main");

    try {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          createElement(tagName: string) {
            const element = new FakeElement(tagName);
            if (tagName === "link") {
              (element as FakeElement & { rel?: string; href?: string }).rel = "";
              (element as FakeElement & { rel?: string; href?: string }).href = "";
            }
            return element;
          },
          getElementById() {
            return null;
          },
          head: {
            appendChild() {},
          },
          querySelector(selector: string) {
            if (selector === ".basic-filter-grid") return basicFilterGrid;
            if (selector === ".group-filter-dialog") return null;
            if (selector === ".subgroup-filter-dialog") return null;
            if (selector === "main") return main;
            return null;
          },
        },
      });

      ensurePickerControls();

      assert.equal(
        groupField.children[0]?.className,
        "filter-picker-trigger group-picker-trigger",
      );
      assert.equal(
        subGroupField.children[0]?.className,
        "filter-picker-trigger subgroup-picker-trigger",
      );
      assert.equal(main.children.length, 2);
      assert.equal(
        main.children[0]?.className,
        "dialog filter-picker-dialog group-filter-dialog",
      );
      assert.equal(
        main.children[1]?.className,
        "dialog filter-picker-dialog subgroup-filter-dialog",
      );

      const existingGrid = {
        querySelector(selector: string) {
          if (selector === ".group-picker-trigger") return new FakeElement("button");
          if (selector === ".subgroup-picker-trigger") return new FakeElement("button");
          if (selector === ".select-group") return { closest: () => groupField };
          if (selector === ".select-subgroup") return {
            closest: () => subGroupField,
          };
          return null;
        },
      };
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          createElement(tagName: string) {
            return new FakeElement(tagName);
          },
          getElementById() {
            return null;
          },
          head: {
            appendChild() {},
          },
          querySelector(selector: string) {
            if (selector === ".basic-filter-grid") return existingGrid;
            if (selector === ".group-filter-dialog") return new FakeElement("dialog");
            if (selector === ".subgroup-filter-dialog") return new FakeElement("dialog");
            if (selector === "main") return main;
            return null;
          },
        },
      });
      ensurePickerControls();
      assert.equal(groupField.children.length, 1);
      assert.equal(subGroupField.children.length, 1);
      assert.equal(main.children.length, 2);

      const missingFieldGrid = {
        querySelector(selector: string) {
          if (selector === ".group-picker-trigger") return null;
          if (selector === ".subgroup-picker-trigger") return null;
          if (selector === ".select-group") return { closest: () => null };
          if (selector === ".select-subgroup") return null;
          return null;
        },
      };
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          createElement(tagName: string) {
            return new FakeElement(tagName);
          },
          getElementById() {
            return null;
          },
          head: {
            appendChild() {},
          },
          querySelector(selector: string) {
            if (selector === ".basic-filter-grid") return missingFieldGrid;
            if (selector === ".group-filter-dialog") return null;
            if (selector === ".subgroup-filter-dialog") return null;
            if (selector === "main") return null;
            return null;
          },
        },
      });
      ensurePickerControls();
      assert.equal(groupField.children.length, 1);
      assert.equal(subGroupField.children.length, 1);

      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          querySelector() {
            return null;
          },
        },
      });
      ensurePickerControls();
    } finally {
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      } else {
        Reflect.deleteProperty(globalThis, "document");
      }
    }
  });
});
