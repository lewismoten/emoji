import assert from "node:assert/strict";
import {
  createHelpPickerControl,
  createSavedPickerControl,
} from "../../../src/explorer/toolbar/toolbar-trigger-controls.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

class FakeElement {
  tagName: string;
  className = "";
  dataset: Record<string, string> = {};
  attributes = new Map<string, string>();
  childNodes: Array<FakeElement | string> = [];
  textContent = "";
  id = "";
  rel = "";
  href = "";

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  append(...nodes: Array<FakeElement | string>) {
    this.childNodes.push(...nodes);
  }
}

try {
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
    },
  });

  const saved = createSavedPickerControl() as FakeElement;
  assert.equal(saved.className, "saved-picker");
  assert.equal(saved.attributes.get("aria-controls"), "saved-dialog");
  assert.equal(saved.dataset.i18nAriaLabel, "savedEmoji");
  assert.equal((saved.childNodes[0] as FakeElement).textContent, "⭐");
  assert.equal((saved.childNodes[1] as FakeElement).dataset.i18n, "favorites");

  const help = createHelpPickerControl() as FakeElement;
  assert.equal(help.className, "help-picker");
  assert.equal(help.attributes.get("aria-controls"), "help-dialog");
  assert.equal(help.dataset.i18nAriaLabel, "helpAndSettings");
  assert.equal(help.childNodes.length, 1);
  assert.equal((help.childNodes[0] as FakeElement).textContent, "?");
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
