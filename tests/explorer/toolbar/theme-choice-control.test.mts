import assert from "node:assert/strict";
import { createThemeChoiceGroupControl } from "../../../src/explorer/toolbar/theme-choice-control.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

class FakeElement {
  tagName: string;
  className = "";
  dataset: Record<string, string> = {};
  attributes = new Map<string, string>();
  childNodes: Array<FakeElement | string> = [];
  textContent = "";
  name = "";
  value = "";
  checked = false;
  tabIndex = 0;
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
  const appendedHead: FakeElement[] = [];
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
        appendChild(node: FakeElement) {
          appendedHead.push(node);
        },
      },
    },
  });

  const control = createThemeChoiceGroupControl() as FakeElement;
  assert.equal(control.className, "setting-choice-group theme-choices");
  assert.equal(control.attributes.get("role"), "radiogroup");
  assert.equal(control.dataset.i18nAriaLabel, "theme");
  assert.equal(control.dataset.maxSelectable, "1");
  assert.equal(control.dataset.minSelectable, "1");
  assert.equal(control.childNodes.length, 5);

  const themeButtons = control.childNodes.slice(1) as FakeElement[];
  assert.equal(themeButtons.length, 4);
  assert.equal(themeButtons[0]?.dataset.theme, "base");
  assert.match(themeButtons[0]?.className ?? "", /developer-only/);
  assert.equal(themeButtons[1]?.dataset.theme, "light");
  assert.equal(themeButtons[2]?.dataset.theme, "dark");
  assert.equal(themeButtons[3]?.dataset.theme, "retro");
  assert.equal(appendedHead[0]?.href, "./explorer/controls/toolbar/theme-choice-group.css");
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
