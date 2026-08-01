import assert from "node:assert/strict";
import { createHelpDialogControl } from "../../../src/explorer/toolbar/help-settings-control.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

class FakeElement {
  className = "";
  id = "";
  textContent = "";
  childNodes: Array<FakeElement | string> = [];
  children: FakeElement[] = [];
  dataset: Record<string, string> = {};
  attributes = new Map<string, string>();
  href = "";
  type = "";

  constructor(readonly tagName: string) {}

  append(...nodes: Array<FakeElement | string>) {
    this.childNodes.push(...nodes);
    for (const node of nodes) {
      if (node instanceof FakeElement) {
        this.children.push(node);
      }
    }
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "href") this.href = value;
    if (name === "id") this.id = value;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  querySelector(selector: string): FakeElement | null {
    if (selector.startsWith(".")) {
      const className = selector.slice(1);
      for (const child of this.children) {
        if (child.className.split(/\s+/).includes(className)) {
          return child;
        }
        const match: FakeElement | null = child.querySelector(selector);
        if (match) return match;
      }
    }
    return null;
  }
}

try {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tagName: string) {
        const element = new FakeElement(tagName);
        if (tagName === "input") element.type = "";
        return element;
      },
      getElementById() {
        return null;
      },
      head: {
        appendChild() {},
      },
    },
  });

  const control = await createHelpDialogControl();
  assert.equal(control.element.className, "help-dialog");
  assert.equal(control.element.getAttribute("id"), "help-dialog");
  assert.equal(control.element.getAttribute("aria-labelledby"), "help-title");

  const [heading, pixelSection, settingsSection, shortcutHeading, shortcutList] =
    control.element.children;
  assert.equal(heading?.className, "dialog-heading");
  assert.equal(pixelSection?.className, "help-pixel");
  assert.equal(settingsSection?.className, "help-settings");
  assert.equal(shortcutHeading?.className, "shortcut-heading");
  assert.equal(shortcutList?.className, "shortcut-list");

  const pixelLink = Array.from(pixelSection?.children ?? []).find(
    (child) => (child as unknown as FakeElement).tagName === "a",
  ) as FakeElement | undefined;
  assert.equal(
    pixelLink?.href,
    "https://github.com/lewismoten/emoji/tree/main/pixel-font",
  );

  const themeRow = settingsSection?.children[2];
  assert.match(themeRow?.children[1]?.className ?? "", /theme-choices/);

  const audioRow = settingsSection?.children[3];
  assert.equal(audioRow?.children[1]?.className, "setting-choice-group audio-choices");
  assert.equal(audioRow?.children[1]?.children[1]?.className, "setting-choice audio-choice");
  assert.equal(audioRow?.children[1]?.children[2]?.className, "setting-choice audio-choice");

  const languagePicker = new FakeElement("button");
  languagePicker.className = "language-picker";
  control.mountLanguagePicker(languagePicker as any);
  const mountedLanguageControl = settingsSection?.children[1]?.children[1];
  assert.equal(mountedLanguageControl?.children[0], languagePicker);
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
