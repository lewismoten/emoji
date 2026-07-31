import assert from "node:assert/strict";
import {
  renderGroupPickerGrid,
  renderSequencePickerGrid,
  renderSubGroupPickerGrid,
} from "../../src/explorer/category/category-picker-grid-control.js";

class FakeElement {
  tagName: string;
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string | undefined> = {};
  className = "";
  title = "";
  open = false;
  focused = false;
  private textValue = "";
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
  listeners = new Map<string, Array<(event: any) => void>>();

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get textContent() {
    return this.textValue;
  }

  set textContent(value: string) {
    this.textValue = value;
  }

  append(...children: FakeElement[]) {
    this.children.push(...children);
  }

  appendChild(child: FakeElement) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...children: FakeElement[]) {
    this.children = [...children];
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
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
  const groupChoices = new FakeElement("div");
  const groupLabel = new FakeElement("span");
  const groupTrigger = new FakeElement("button");
  const groupTriggerEmoji = new FakeElement("span");
  groupTriggerEmoji.className = "filter-picker-emoji";
  const groupTriggerValue = new FakeElement("span");
  groupTriggerValue.className = "filter-picker-value";
  groupTrigger.append(groupTriggerEmoji, groupTriggerValue);
  const groupDialog = new FakeElement("dialog");
  groupDialog.open = true;
  const groupCalls: Array<[string, string]> = [];
  let groupDraws = 0;
  let groupRerenders = 0;
  renderGroupPickerGrid({
    availableGroups: ["Smileys & Emotion", "Animals & Nature"],
    compactGroupChoices: groupChoices as any,
    compactGroupLabel: groupLabel as any,
    displayGroupName: (name) => `shown:${name}`,
    drawList: () => {
      groupDraws += 1;
    },
    getGroupRepresentativeEmoji: (group) =>
      group.startsWith("Smileys") ? "😀" : "🐻",
    groupFilterDialog: groupDialog as any,
    groupPickerTrigger: groupTrigger as any,
    selectedGroup: "Animals & Nature",
    setSelectedGroup: (value) => {
      groupCalls.push(["group", value]);
    },
    setSelectedSubGroup: (value) => {
      groupCalls.push(["subgroup", value]);
    },
    translate: (_key, fallback) => fallback,
    rerender: () => {
      groupRerenders += 1;
    },
  });
  assert.equal(groupLabel.textContent, "shown:Animals & Nature");
  assert.equal(groupTriggerEmoji.textContent, "🐻");
  assert.equal(groupTriggerValue.textContent, "shown:Animals & Nature");
  assert.equal(groupTrigger.getAttribute("aria-label"), "Group: shown:Animals & Nature");
  assert.equal(groupChoices.children.length, 3);
  assert.equal(groupChoices.children[0].dataset.value, "");
  assert.equal(groupChoices.children[0].getAttribute("aria-checked"), "false");
  assert.equal(groupChoices.children[2].getAttribute("aria-checked"), "true");
  groupChoices.children[0].dispatch("click");
  assert.deepEqual(groupCalls.slice(0, 2), [["group", ""], ["subgroup", ""]]);
  assert.equal(groupRerenders, 1);
  assert.equal(groupDraws, 1);
  assert.equal(groupDialog.open, false);
  assert.equal(groupTrigger.focused, true);
  groupDialog.open = true;
  groupChoices.children[1].dispatch("click");
  assert.deepEqual(groupCalls.slice(2, 4), [["group", "Smileys & Emotion"], ["subgroup", ""]]);
  assert.equal(groupRerenders, 2);
  assert.equal(groupDraws, 2);

  const emptyGroupChoices = new FakeElement("div");
  const emptyGroupLabel = new FakeElement("span");
  const emptyGroupTrigger = new FakeElement("button");
  const emptyGroupTriggerEmoji = new FakeElement("span");
  emptyGroupTriggerEmoji.className = "filter-picker-emoji";
  const emptyGroupTriggerValue = new FakeElement("span");
  emptyGroupTriggerValue.className = "filter-picker-value";
  emptyGroupTrigger.append(emptyGroupTriggerEmoji, emptyGroupTriggerValue);
  renderGroupPickerGrid({
    availableGroups: [],
    compactGroupChoices: emptyGroupChoices as any,
    compactGroupLabel: emptyGroupLabel as any,
    displayGroupName: (name) => name,
    drawList: () => {},
    getGroupRepresentativeEmoji: () => "😀",
    groupFilterDialog: undefined,
    groupPickerTrigger: emptyGroupTrigger as any,
    selectedGroup: "",
    setSelectedGroup: () => {},
    setSelectedSubGroup: () => {},
    translate: (_key, fallback) => fallback,
    rerender: () => {},
  });
  assert.equal(emptyGroupLabel.textContent, "All");
  assert.equal(emptyGroupTriggerEmoji.textContent, "🌐");
  assert.equal(emptyGroupChoices.children.length, 1);

  const subGroupChoices = new FakeElement("div");
  const subGroupLabel = new FakeElement("span");
  const subGroupTrigger = new FakeElement("button");
  const subGroupTriggerEmoji = new FakeElement("span");
  subGroupTriggerEmoji.className = "filter-picker-emoji";
  const subGroupTriggerValue = new FakeElement("span");
  subGroupTriggerValue.className = "filter-picker-value";
  subGroupTrigger.append(subGroupTriggerEmoji, subGroupTriggerValue);
  const subGroupDialog = new FakeElement("dialog");
  subGroupDialog.open = true;
  const subGroupCalls: string[] = [];
  let subGroupDraws = 0;
  let subGroupRerenders = 0;
  renderSubGroupPickerGrid({
    availableSubGroupParents: ["Food & Drink", "Travel & Places"],
    availableSubGroups: {
      "Food & Drink": ["food-asian"],
      "Travel & Places": ["transport-ground"],
    },
    compactSubGroupChoices: subGroupChoices as any,
    compactSubGroupLabel: subGroupLabel as any,
    displayUnicodeSubGroupName: (name) => `shown:${name}`,
    drawList: () => {
      subGroupDraws += 1;
    },
    getSubGroupRepresentativeEmoji: (_group, subGroup) =>
      subGroup === "food-asian" ? "🍜" : "🚗",
    selectedGroup: "Food & Drink",
    selectedSubGroup: "Food & Drink::food-asian",
    setSelectedSubGroup: (value) => {
      subGroupCalls.push(value);
    },
    subGroupFilterDialog: subGroupDialog as any,
    subGroupPickerTrigger: subGroupTrigger as any,
    subGroupSelectionKey: (group, subGroup) => `${group}::${subGroup}`,
    translate: (_key, fallback) => fallback,
    rerender: () => {
      subGroupRerenders += 1;
    },
  });
  assert.equal(subGroupLabel.textContent, "shown:food-asian");
  assert.equal(subGroupTriggerEmoji.textContent, "🍜");
  assert.equal(subGroupTriggerValue.textContent, "shown:food-asian");
  assert.equal(subGroupChoices.children.length, 3);
  assert.equal(subGroupChoices.children[1].dataset.value, "Food & Drink::food-asian");
  assert.equal(subGroupChoices.children[1].getAttribute("aria-checked"), "true");
  subGroupChoices.children[0].dispatch("click");
  assert.deepEqual(subGroupCalls.slice(0, 1), [""]);
  assert.equal(subGroupRerenders, 1);
  assert.equal(subGroupDraws, 1);
  assert.equal(subGroupDialog.open, false);
  subGroupDialog.open = true;
  subGroupChoices.children[2].dispatch("click");
  assert.deepEqual(subGroupCalls.slice(1), ["Travel & Places::transport-ground"]);
  assert.equal(subGroupRerenders, 2);
  assert.equal(subGroupDraws, 2);

  const blankSubGroupChoices = new FakeElement("div");
  const blankSubGroupLabel = new FakeElement("span");
  const blankSubGroupTrigger = new FakeElement("button");
  const blankSubGroupTriggerEmoji = new FakeElement("span");
  blankSubGroupTriggerEmoji.className = "filter-picker-emoji";
  const blankSubGroupTriggerValue = new FakeElement("span");
  blankSubGroupTriggerValue.className = "filter-picker-value";
  blankSubGroupTrigger.append(blankSubGroupTriggerEmoji, blankSubGroupTriggerValue);
  renderSubGroupPickerGrid({
    availableSubGroupParents: [],
    availableSubGroups: {},
    compactSubGroupChoices: blankSubGroupChoices as any,
    compactSubGroupLabel: blankSubGroupLabel as any,
    displayUnicodeSubGroupName: (name) => name,
    drawList: () => {},
    getSubGroupRepresentativeEmoji: () => "🍜",
    selectedGroup: "",
    selectedSubGroup: "",
    setSelectedSubGroup: () => {},
    subGroupFilterDialog: undefined,
    subGroupPickerTrigger: blankSubGroupTrigger as any,
    subGroupSelectionKey: (group, subGroup) => `${group}::${subGroup}`,
    translate: (_key, fallback) => fallback,
    rerender: () => {},
  });
  assert.equal(blankSubGroupLabel.textContent, "All");
  assert.equal(blankSubGroupTriggerEmoji.textContent, "🌐");
  assert.equal(blankSubGroupChoices.children.length, 1);

  const sequenceChoices = new FakeElement("div");
  const sequenceLabel = new FakeElement("span");
  const sequenceCalls: string[] = [];
  let sequenceDraws = 0;
  let sequenceRerenders = 0;
  renderSequencePickerGrid({
    availableSequenceTypes: ["single", "zwj"],
    compactSequenceChoices: sequenceChoices as any,
    compactSequenceLabel: sequenceLabel as any,
    drawList: () => {
      sequenceDraws += 1;
    },
    rerender: () => {
      sequenceRerenders += 1;
    },
    selectedSequenceType: "single",
    sequenceTranslationKeys: { single: "single", zwj: "zwj" },
    sequenceTypeEmoji: { single: "1️⃣", zwj: "🔗" },
    sequenceTypeLabels: { single: "Single", zwj: "ZWJ" },
    setSelectedSequenceType: (value) => {
      sequenceCalls.push(value);
    },
    translate: (key, fallback) => `${key}:${fallback}`,
  });
  assert.equal(sequenceLabel.textContent, "single:Single");
  assert.equal(sequenceChoices.children.length, 3);
  assert.equal(sequenceChoices.children[1].getAttribute("aria-checked"), "true");
  sequenceChoices.children[0].dispatch("click");
  assert.deepEqual(sequenceCalls.slice(0, 1), [""]);
  assert.equal(sequenceRerenders, 1);
  assert.equal(sequenceDraws, 1);
  assert.equal(sequenceChoices.children[0].focused, true);
  sequenceChoices.children[2].dispatch("click");
  assert.deepEqual(sequenceCalls.slice(1), ["zwj"]);
  assert.equal(sequenceRerenders, 2);
  assert.equal(sequenceDraws, 2);
  assert.equal(sequenceChoices.children[2].focused, true);

  renderSequencePickerGrid({
    availableSequenceTypes: [],
    compactSequenceChoices: undefined,
    compactSequenceLabel: undefined,
    drawList: () => {},
    rerender: () => {},
    selectedSequenceType: "",
    sequenceTranslationKeys: {},
    sequenceTypeEmoji: {},
    sequenceTypeLabels: {},
    setSelectedSequenceType: () => {},
    translate: (_key, fallback) => fallback,
  });
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else delete (globalThis as any).window;
}
