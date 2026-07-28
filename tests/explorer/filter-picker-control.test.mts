import assert from "node:assert/strict";
import {
  createCompactChoiceControl,
  createFilterPickerDialogControl,
  createFilterPickerTriggerControl,
} from "../../src/explorer/filter-picker-control.js";

class FakeElement {
  tagName: string;
  className = "";
  id = "";
  rel = "";
  href = "";
  type = "";
  name = "";
  value = "";
  title = "";
  checked = false;
  tabIndex = 0;
  textContent = "";
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string | undefined> = {};
  listeners = new Map<string, Array<(event: any) => void>>();
  parent: FakeElement | null = null;
  classSet = new Set<string>();
  classList = {
    toggle: (token: string, force?: boolean) => {
      this.classSet = new Set(this.className.split(/\s+/).filter(Boolean));
      const shouldInclude =
        force === undefined ? !this.classSet.has(token) : Boolean(force);
      if (shouldInclude) this.classSet.add(token);
      else this.classSet.delete(token);
      this.className = [...this.classSet].join(" ");
      return shouldInclude;
    },
  };

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  append(...children: FakeElement[]) {
    for (const child of children) {
      child.parent = this;
      this.children.push(child);
    }
  }

  appendChild(child: FakeElement) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "id") this.id = value;
    if (name === "type") this.type = value;
    if (name === "tabindex") this.tabIndex = Number(value);
    if (name === "title") this.title = value;
  }

  getAttribute(name: string) {
    if (name === "id") return this.id || null;
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, listener: (event: any) => void) {
    const entries = this.listeners.get(type) ?? [];
    entries.push(listener);
    this.listeners.set(type, entries);
  }

  dispatch(type: string, event: any = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  querySelector(selector: string) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string) {
    const matches = (element: FakeElement) => {
      if (selector.startsWith(".")) {
        return element.className.split(/\s+/).includes(selector.slice(1));
      }
      if (selector.startsWith("#")) return element.id === selector.slice(1);
      return false;
    };
    const results: FakeElement[] = [];
    const stack = [...this.children];
    while (stack.length > 0) {
      const current = stack.shift()!;
      if (matches(current)) results.push(current);
      stack.unshift(...current.children);
    }
    return results;
  }
}

class FakeDocument {
  head = new FakeElement("head");
  body = new FakeElement("body");

  createElement(tagName: string) {
    return new FakeElement(tagName);
  }

  getElementById(id: string) {
    const stack = [this.head, this.body];
    while (stack.length > 0) {
      const current = stack.shift()!;
      if (current.id === id) return current;
      stack.unshift(...current.children);
    }
    return null;
  }
}

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const documentStub = new FakeDocument();
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: documentStub,
});

try {
  const dialogControl = createFilterPickerDialogControl({
    id: "group-picker-dialog",
    dialogClassName: "group-picker-dialog",
    titleId: "group-picker-title",
    titleKey: "group",
    title: "Group",
    choicesClassName: "group-picker-choices",
  });
  assert.equal(dialogControl.dialog.tagName, "DIALOG");
  assert.equal(
    dialogControl.dialog.className,
    "filter-picker-dialog group-picker-dialog",
  );
  assert.equal(dialogControl.dialog.id, "group-picker-dialog");
  assert.equal(
    dialogControl.dialog.getAttribute("aria-labelledby"),
    "group-picker-title",
  );
  assert.equal(dialogControl.dialog.children.length, 2);
  assert.equal(dialogControl.choices.tagName, "DIV");
  assert.equal(
    dialogControl.choices.className,
    "compact-choices group-picker-choices",
  );
  assert.equal(dialogControl.choices.getAttribute("role"), "radiogroup");
  assert.equal(
    dialogControl.choices.getAttribute("aria-labelledby"),
    "group-picker-title",
  );

  const trigger = createFilterPickerTriggerControl({
    triggerClassName: "group-filter-trigger",
    controlsId: "group-picker-dialog",
    kindKey: "group",
    kind: "Group",
    valueKey: "all",
    value: "All",
  }) as any;
  assert.equal(trigger.tagName, "BUTTON");
  assert.equal(
    trigger.className,
    "filter-picker-trigger group-filter-trigger",
  );
  assert.equal(trigger.getAttribute("aria-controls"), "group-picker-dialog");
  assert.equal(trigger.getAttribute("aria-haspopup"), "dialog");
  assert.equal(trigger.getAttribute("type"), "button");
  assert.equal(trigger.children.length, 3);
  assert.equal(trigger.children[0].className, "filter-picker-kind");
  assert.equal(trigger.children[0].dataset.i18n, "group");
  assert.equal(trigger.children[0].textContent, "Group");
  assert.equal(trigger.children[1].className, "filter-picker-emoji");
  assert.equal(trigger.children[1].textContent, "🌐");
  assert.equal(trigger.children[1].getAttribute("aria-hidden"), "true");
  assert.equal(trigger.children[2].className, "filter-picker-value");
  assert.equal(trigger.children[2].dataset.i18n, "all");
  assert.equal(trigger.children[2].textContent, "All");

  const clickCalls: string[] = [];
  const compactChoice = createCompactChoiceControl({
    value: "smileys",
    emoji: "😀",
    label: "Smileys & Emotion",
    selected: true,
    onSelect: () => {
      clickCalls.push("clicked");
    },
  }) as any;
  assert.equal(compactChoice.tagName, "BUTTON");
  assert.equal(compactChoice.className, "compact-choice is-selected");
  assert.equal(compactChoice.dataset.value, "smileys");
  assert.equal(compactChoice.getAttribute("role"), "radio");
  assert.equal(compactChoice.getAttribute("aria-label"), "Smileys & Emotion");
  assert.equal(compactChoice.getAttribute("aria-checked"), "true");
  assert.equal(compactChoice.getAttribute("aria-pressed"), "true");
  assert.equal(compactChoice.tabIndex, 0);
  assert.equal(compactChoice.title, "Smileys & Emotion");
  assert.equal(compactChoice.children[0].className, "compact-choice-emoji");
  assert.equal(compactChoice.children[0].textContent, "😀");
  assert.equal(compactChoice.children[1].className, "compact-choice-label");
  assert.equal(compactChoice.children[1].textContent, "Smileys & Emotion");
  compactChoice.dispatch("click", { type: "click" });
  assert.deepEqual(clickCalls, ["clicked"]);

  const unselectedChoice = createCompactChoiceControl({
    value: "animals",
    emoji: "🐻",
    label: "Animals & Nature",
    selected: false,
    onSelect: () => {},
  }) as any;
  assert.equal(unselectedChoice.getAttribute("aria-checked"), "false");
  assert.equal(unselectedChoice.getAttribute("aria-pressed"), "false");
  assert.equal(unselectedChoice.tabIndex, -1);
  assert.equal(unselectedChoice.className, "compact-choice");

  const stylesheetIds = documentStub.head.children.map((child) => child.id).sort();
  assert.deepEqual(stylesheetIds, [
    "compact-choice-button-control-stylesheet",
    "dialog-close-button-control-stylesheet",
    "dialog-heading-control-stylesheet",
    "filter-picker-trigger-control-stylesheet",
  ]);
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
}
