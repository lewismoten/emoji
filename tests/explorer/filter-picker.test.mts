import assert from "node:assert/strict";
import {
  closeFilterPicker,
  displayUnicodeSubGroupName,
  focusCompactChoice,
  makeCompactChoice,
  onCompactChoiceKeyDown,
  openFilterPicker,
  populateGroupFilter,
  populateSequenceTypeFilter,
  populateSubGroupFilter,
  renderFilterPickerTrigger,
} from "../../src/explorer/filter-picker.js";

class FakeElement {
  tagName: string;
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string | undefined> = {};
  private textValue = "";
  value = "";
  label = "";
  title = "";
  className = "";
  disabled = false;
  open = false;
  tabIndex = 0;
  focused = false;
  listeners = new Map<string, Array<(event: any) => void>>();
  parent: FakeElement | null = null;
  rect = { left: 0, top: 0, width: 20, height: 20 };
  classSet = new Set<string>();
  classList = {
    toggle: (token: string, force?: boolean) => {
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

  get textContent() {
    return this.textValue;
  }

  set textContent(value: string) {
    this.textValue = value;
  }

  get text() {
    return this.textValue;
  }

  set text(value: string) {
    this.textValue = value;
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

  replaceChildren(...children: FakeElement[]) {
    this.children = [];
    this.append(...children);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "role") this.dataset.role = value;
    if (name.startsWith("data-")) this.dataset[name.slice(5)] = value;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, listener: (event: any) => void) {
    const entries = this.listeners.get(type) ?? [];
    entries.push(listener);
    this.listeners.set(type, entries);
  }

  dispatch(type: string, event: any = {}) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ currentTarget: this, target: this, ...event });
    }
  }

  focus() {
    this.focused = true;
  }

  close() {
    this.open = false;
  }

  showModal() {
    this.open = true;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  closest(selector: string) {
    let current: FakeElement | null = this;
    while (current) {
      if (selector === '[role="radio"]' && current.getAttribute("role") === "radio") {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  querySelector(selector: string) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string) {
    const matches = (element: FakeElement) => {
      if (selector === ".filter-picker-emoji") {
        return element.className.split(/\s+/).includes("filter-picker-emoji");
      }
      if (selector === ".filter-picker-value") {
        return element.className.split(/\s+/).includes("filter-picker-value");
      }
      if (selector === '[role="radio"]') {
        return element.getAttribute("role") === "radio";
      }
      if (selector === '[aria-checked="true"]') {
        return element.getAttribute("aria-checked") === "true";
      }
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

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

const documentStub: any = {
  documentElement: { dir: "ltr" },
  createElement(tagName: string) {
    return new FakeElement(tagName);
  },
};
const windowStub: any = {
  requestAnimationFrame(handler: () => void) {
    handler();
  },
};

Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: documentStub,
});
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: windowStub,
});

try {
  const groupSelector = new FakeElement("select");
  populateGroupFilter({
    availableGroups: ["Smileys & Emotion", "Animals & Nature"],
    displayGroupName: (name) => `shown:${name}`,
    getGroupRepresentativeEmoji: (group) =>
      group.startsWith("Smileys") ? "😀" : "🐻",
    groupSelector: groupSelector as any,
    selectedGroup: "Animals & Nature",
    translate: (_key, fallback) => fallback,
  });
  assert.equal(groupSelector.children.length, 3);
  assert.equal(groupSelector.children[0].textContent, "🌐 All");
  assert.equal(groupSelector.children[1].textContent, "😀 shown:Smileys & Emotion");
  assert.equal(groupSelector.value, "Animals & Nature");

  const subGroupSelector = new FakeElement("select");
  populateSubGroupFilter({
    availableSubGroupParents: ["Food & Drink"],
    availableSubGroups: { "Food & Drink": ["food-asian", "food-fruit"] },
    displayGroupName: (name) => `group:${name}`,
    displayUnicodeSubGroupName: (name) => `sub:${name}`,
    getSubGroupRepresentativeEmoji: (_group, subGroup) =>
      subGroup === "food-asian" ? "🍜" : "🍎",
    selectedSubGroup: "Food & Drink::food-fruit",
    subGroupSelectionKey: (group, subGroup) => `${group}::${subGroup}`,
    subGroupSelector: subGroupSelector as any,
    translate: (_key, fallback) => fallback,
  });
  assert.equal(subGroupSelector.children.length, 2);
  const optGroup = subGroupSelector.children[1];
  assert.equal(optGroup.label, "group:Food & Drink");
  assert.equal(optGroup.children[0].value, "Food & Drink::food-asian");
  assert.equal(optGroup.children[0].dataset.group, "Food & Drink");
  assert.equal(optGroup.children[0].dataset.subgroup, "food-asian");
  assert.equal(optGroup.children[1].textContent, "🍎 sub:food-fruit");
  assert.equal(subGroupSelector.value, "Food & Drink::food-fruit");
  assert.equal(subGroupSelector.disabled, false);

  const sequenceSelector = new FakeElement("select");
  populateSequenceTypeFilter({
    availableSequenceTypes: ["single", "zwj"],
    selectedSequenceType: "zwj",
    sequenceTranslationKeys: { single: "single", zwj: "zwj" },
    sequenceTypeEmoji: { single: "1️⃣", zwj: "🔗" },
    sequenceTypeLabels: { single: "Single", zwj: "ZWJ" },
    sequenceTypeSelector: sequenceSelector as any,
    translate: (key, fallback) => `${key}:${fallback}`,
  });
  assert.equal(sequenceSelector.children[0].textContent, "🌐 all:All");
  assert.equal(sequenceSelector.children[2].textContent, "🔗 zwj:ZWJ");
  assert.equal(sequenceSelector.value, "zwj");

  let selected = 0;
  const choice = makeCompactChoice({
    value: "people",
    emoji: "🧑",
    label: "People",
    selected: true,
    onSelect: () => {
      selected += 1;
    },
  }) as any;
  assert.equal(choice.getAttribute("aria-pressed"), "true");
  assert.equal(choice.getAttribute("aria-checked"), "true");
  assert.equal(choice.dataset.value, "people");
  assert.equal(choice.children[0].textContent, "🧑");
  choice.dispatch("click");
  assert.equal(selected, 1);

  const trigger = new FakeElement("button");
  const triggerEmoji = new FakeElement("span");
  triggerEmoji.className = "filter-picker-emoji";
  const triggerValue = new FakeElement("span");
  triggerValue.className = "filter-picker-value";
  trigger.append(triggerEmoji, triggerValue);
  renderFilterPickerTrigger(trigger as any, "Group", "😀", "Smileys");
  assert.equal(triggerEmoji.textContent, "😀");
  assert.equal(triggerValue.textContent, "Smileys");
  assert.equal(trigger.getAttribute("aria-label"), "Group: Smileys");
  assert.equal(trigger.title, "Group: Smileys");
  renderFilterPickerTrigger(trigger as any, "Group", "", "All");
  assert.equal(triggerEmoji.textContent, "•");
  renderFilterPickerTrigger(undefined, "Group", "😀", "Smileys");

  const dialog = new FakeElement("dialog");
  const choices = new FakeElement("div");
  const firstRadio = new FakeElement("button");
  firstRadio.setAttribute("role", "radio");
  const selectedRadio = new FakeElement("button");
  selectedRadio.setAttribute("role", "radio");
  selectedRadio.setAttribute("aria-checked", "true");
  choices.append(firstRadio, selectedRadio);
  openFilterPicker(dialog as any, choices as any);
  assert.equal(dialog.open, true);
  assert.equal(selectedRadio.focused, true);
  openFilterPicker(undefined, choices as any);
  openFilterPicker(dialog as any, undefined);

  const closeTrigger = new FakeElement("button");
  closeFilterPicker(dialog as any, closeTrigger as any);
  assert.equal(dialog.open, false);
  assert.equal(closeTrigger.focused, true);
  closeFilterPicker(undefined, undefined);

  const focusContainer = new FakeElement("div");
  const focusA = new FakeElement("button");
  focusA.setAttribute("role", "radio");
  focusA.dataset.value = "a";
  const focusB = new FakeElement("button");
  focusB.setAttribute("role", "radio");
  focusB.dataset.value = "b";
  focusB.setAttribute("aria-checked", "true");
  focusContainer.append(focusA, focusB);
  focusCompactChoice(focusContainer as any, "a");
  assert.equal(focusA.focused, true);
  focusCompactChoice(focusContainer as any, "missing");
  assert.equal(focusB.focused, true);

  const navContainer = new FakeElement("div");
  const navButtons = [0, 1, 2, 3].map(() => {
    const button = new FakeElement("button");
    button.setAttribute("role", "radio");
    return button;
  });
  navButtons[0].rect = { left: 0, top: 0, width: 20, height: 20 };
  navButtons[1].rect = { left: 30, top: 0, width: 20, height: 20 };
  navButtons[2].rect = { left: 0, top: 40, width: 20, height: 20 };
  navButtons[3].rect = { left: 30, top: 40, width: 20, height: 20 };
  navButtons[0].tabIndex = 0;
  navButtons[1].tabIndex = -1;
  navButtons[2].tabIndex = -1;
  navButtons[3].tabIndex = -1;
  navContainer.append(...navButtons);
  let prevented = 0;
  onCompactChoiceKeyDown({
    key: "ArrowRight",
    currentTarget: navContainer,
    target: navButtons[0],
    preventDefault() {
      prevented += 1;
    },
  } as any);
  assert.equal(prevented, 1);
  assert.equal(navButtons[1].focused, true);
  assert.equal(navButtons[1].tabIndex, 0);
  assert.equal(navButtons[0].tabIndex, -1);

  onCompactChoiceKeyDown({
    key: "ArrowDown",
    currentTarget: navContainer,
    target: navButtons[1],
    preventDefault() {},
  } as any);
  assert.equal(navButtons[3].focused, true);

  onCompactChoiceKeyDown({
    key: "Home",
    currentTarget: navContainer,
    target: navButtons[3],
    preventDefault() {},
  } as any);
  assert.equal(navButtons[0].tabIndex, 0);

  documentStub.documentElement.dir = "rtl";
  onCompactChoiceKeyDown({
    key: "ArrowLeft",
    currentTarget: navContainer,
    target: navButtons[0],
    preventDefault() {},
  } as any);
  assert.equal(navButtons[1].tabIndex, 0);
  documentStub.documentElement.dir = "ltr";

  const noMatchContainer = new FakeElement("div");
  onCompactChoiceKeyDown({
    key: "Escape",
    currentTarget: noMatchContainer,
    target: navButtons[0],
    preventDefault() {
      throw new Error("unexpected preventDefault");
    },
  } as any);
  onCompactChoiceKeyDown({
    key: "ArrowRight",
    currentTarget: noMatchContainer,
    target: navButtons[0],
    preventDefault() {
      throw new Error("unexpected preventDefault");
    },
  } as any);

  assert.equal(
    displayUnicodeSubGroupName("animal-bird", {
      searchSubgroupLabels: { "animal-bird": "Localized birds" },
      searchLabels: {},
      unicodeSubgroupLabelKeys: {},
    }),
    "Localized birds",
  );
  assert.equal(
    displayUnicodeSubGroupName("book-paper", {
      searchSubgroupLabels: {},
      searchLabels: { books: "Localized books" },
      unicodeSubgroupLabelKeys: { "book-paper": "books" },
    }),
    "Localized books",
  );
  assert.equal(
    displayUnicodeSubGroupName("food-asian", {
      searchSubgroupLabels: {},
      searchLabels: {},
      unicodeSubgroupLabelKeys: {},
    }),
    "Asian",
  );
  assert.equal(
    displayUnicodeSubGroupName("food-fruit", {
      searchSubgroupLabels: {},
      searchLabels: {},
      unicodeSubgroupLabelKeys: {},
    }),
    "Fruit",
  );
  assert.equal(
    displayUnicodeSubGroupName("plant-other", {
      searchSubgroupLabels: {},
      searchLabels: {},
      unicodeSubgroupLabelKeys: {},
    }),
    "Other Plants",
  );
  assert.equal(
    displayUnicodeSubGroupName("travel-place", {
      searchSubgroupLabels: {},
      searchLabels: {},
      unicodeSubgroupLabelKeys: {},
    }),
    "Travel Place",
  );
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else delete (globalThis as any).window;
}
